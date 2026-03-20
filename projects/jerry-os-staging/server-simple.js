// Jerry OS Server - Simplified Version (No OpenClaw Dependencies)

const express = require('express');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const app = express();
const PORT = 8980;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper functions for mock responses
function returnModelResponse(res) {
    res.json({
        status: 'ok',
        result: {
            model: 'nvidia/deepseek-ai/deepseek-v3.1',
            provider: 'nvidia'
        }
    });
}

function returnSessionsResponse(res) {
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

function returnCronsResponse(res) {
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

// API Routes - Simplified (No OpenClaw dependencies)
app.get('/api/model', async (req, res) => {
    returnModelResponse(res);
});

app极('/api/sessions', async (req, res) => {
    returnSessionsResponse(res);
});

app.get('/api/crons', async (req, res) => {
    returnCronsResponse(res);
});

// SSE Session History Endpoint with File Watching
app.get('/api/sessions/:id/history', (req, res) => {
    // Set up SSE connection
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('\n');

    const sessionId = req.params.id;
    const memoryPath = path.join(__dirname, '../../memory');

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
        const historyData = await readSessionHistory(session极);
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

// Serve interface for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('%c🚀 Jerry OS Server (Simplified)\n', 'color: #007AFF; font-size: 20px; font-weight: bold;');
    console.log(`Server running at: http://0.0.0.0:${PORT}`);
    console.log('Using mock data - No OpenClaw dependencies');
    console.log(`Press Ctrl+C to stop\n`);
});

module.exports = app;