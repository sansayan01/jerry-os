// Jerry OS Server - Simple development server

const express = require('express');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/model', async (req, res) => {
    try {
        // Try to get real model data from OpenClaw
        try {
            const stdout = execSync('openclaw status --json', { encoding: 'utf8' });
            const statusData = JSON.parse(stdout);
            
            res.json({
                status: 'ok',
                result: {
                    model: statusData.model || 'unknown',
                    provider: statusData.model?.split('/')[0] || 'unknown'
                }
            });
        } catch (cmdError) {
            // Fallback to mock data if OpenClay command fails
            console.log('OpenClaw status failed:', cmdError.message);
            res.json({
                status: 'ok',
                result: {
                    model: 'nvidia/z-ai/glm4.7',
                    provider: 'nvidia'
                }
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
            const stdout = execSync('openclaw sessions list --json', { encoding: 'utf8' });
            const sessionsData = JSON.parse(stdout);
            
            res.json({
                status: 'ok',
                result: {
                    sessions: sessionsData.sessions || []
                }
            });
        } catch (cmdError) {
            // Fallback to mock data
            console.log('OpenClaw sessions failed:', cmdError.message);
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
            const stdout = execSync('openclaw cron list --json', { encoding: 'utf8' });
            const cronsData = JSON.parse(stdout);
            
            res.json({
                status: 'ok',
                result: cronsData.crons || []
            });
        } catch (cmdError) {
            // Fallback to mock data
            console.log('OpenClaw cron failed:', cmdError.message);
            res.json({
                status: 'ok',
                result: [
                    {
                        name: 'Heartbeat Check',
                        schedule: '*/30 * * * *',
                        status: 'healthy',
                        lastRun: Date.now()
                    },
                    {
                        name: 'Memory Sync',
                        schedule: '0 */4 * * *',
                        status: 'healthy',
                        lastRun: Date.now()
                    }
                ]
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

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('%c🚀 Jerry OS Server\n', 'color: #007AFF; font-size: 20px; font-weight: bold;');
    console.log(`Server running at: http://127.0.0.1:${PORT}`);
    console.log(`Press Ctrl+C to stop\n`);
});

module.exports = app;
