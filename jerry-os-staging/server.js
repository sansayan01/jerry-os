// Jerry OS Server - Simple development server

const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const chokidar = require('chokidar');

const app = express();
const PORT = 8900; // Jerry OS Staging Environment

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Routes
app.get('/api/model', async (req, res) => {
    try {
        // Try to get real model data from OpenClaw
        try {
            const stdout = execSync('timeout 5 openclaw status --json', { encoding: 'utf8' });
            const statusData = JSON.parse(stdout);
            
            res.json({
                status: 'ok',
                result: {
                    model: statusData.model || 'unknown',
                    provider: statusData.model?.split('/')[0] || 'unknown'
                }
            });
        } catch (cmdError) {
            console.log('OpenClaw status failed:', cmdError.message);
            res.json({
                status: 'error',
                error: 'Cannot fetch model information'
            });
        }
    } catch (error) {
        res.json({
            status: 'ok',
            result: {
                model: 'nvidia/z-ai/glm4.7',
                provider: 'nvidia'
            }
        });
    }
});

app.get('/api/sessions', async (req, res) => {
    try {
        // Try to get real session data from OpenClaw
        try {
            const stdout = execSync('timeout 5 openclaw sessions --json', { encoding: 'utf8' });
            const sessionsData = JSON.parse(stdout);
            
            res.json({
                status: 'ok',
                result: {
                    sessions: sessionsData.sessions || []
                }
            });
        } catch (cmdError) {
            console.log('OpenClaw sessions failed:', cmdError.message);
            res.json({
                status: 'error',
                error: 'Cannot fetch sessions information'
            });
        }
    } catch (error) {
        res.json({
            status: 'ok',
            result: {
                sessions: [
                    {
                        id: 'main',
                        label: 'Jerry OS Main',
                        kind: 'agent',
                        active: true,
                        updated: Date.now()
                    }
                ]
            }
        });
    }
});

app.get('/api/crons', async (req, res) => {
    try {
        // Try to get real cron data from OpenClaw
        try {
            const stdout = execSync('timeout 5 openclaw cron list --json', { encoding: 'utf8' });
            const cronsData = JSON.parse(stdout);
            
            res.json({
                status: 'ok',
                result: cronsData.crons || []
            });
        } catch (cmdError) {
            console.log('OpenClaw cron failed:', cmdError.message);
            res.json({
                status: 'error',
                error: 'Cannot fetch cron information'
            });
        }
    } catch (error) {
        res.json({
            status: 'ok',
            result: [
                {
                    name: 'Heartbeat Check',
                    schedule: '*/30 * * * *',
                    status: 'healthy',
                    lastRun: Date.now()
                }
            ]
        });
    }
});

// SSE Session History Endpoint with File Watching
app.get('/api/sessions/:id/history', (req, res) => {
    // Set up SSE connection
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('\n');

    const sessionId = req.params.id;
    const memoryPath = path.join(__dirname, '../memory');

    // Initial data send
    sendSessionHistory(res, sessionId);

    // Watch for file changes
    const watcher = chokidar.watch(memoryPath, {
        ignored: /(^|[\/\\])\./,
        persistent: true
    });

    watcher.on('change', (filePath) => {
        if (filePath.includes(sessionId)) {
            sendSessionHistory(res, sessionId);
        }
    });

    // Clean up on connection close
    req.on('close', () => {
        watcher.close();
    });
});

async function sendSessionHistory(res, sessionId) {
    try {
        const historyData = await readSessionHistory(sessionId);
        res.write(`data: ${JSON.stringify(historyData)}\n\n`);
    } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    }
}

async function readSessionHistory(sessionId) {
    const sessionPath = path.join(__dirname, '../memory', `${sessionId}.md`);
    
    if (!fs.existsSync(sessionPath)) {
        return { 
            sessionId, 
            messages: [],
            totalMessages: 0,
            status: 'no_history'
        };
    }

    const content = await fs.promises.readFile(sessionPath, 'utf8');
    const messages = parseSessionMessages(content);
    
    return {
        sessionId,
        messages: messages.reverse(), // Most recent first
        totalMessages: messages.length,
        status: 'loaded'
    };
}

function parseSessionMessages(content) {
    // Simple parsing of session messages from markdown
    const lines = content.split('\n');
    const messages = [];
    let currentMessage = null;

    for (const line of lines) {
        if (line.startsWith('### ')) {
            if (currentMessage) {
                messages.push(currentMessage);
            }
            currentMessage = {
                timestamp: line.replace('### ', '').trim(),
                content: ''
            };
        } else if (currentMessage && line.trim()) {
            currentMessage.content += line + '\n';
        }
    }

    if (currentMessage) {
        messages.push(currentMessage);
    }

    return messages;
}

// Serve premium interface for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('%c🚀 Jerry OS Server\n', 'color: #007AFF; font-size: 20px; font-weight: bold;');
    console.log(`Server running at: http://0.0.0.0:${PORT}`);
    console.log(`Press Ctrl+C to stop\n`);
});

module.exports = app;
