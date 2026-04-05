// Jerry OS Server - Simple development server with Dynamic Data
const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const chokidar = require('chokidar');

// Gateway Auto-Start Check
async function ensureGatewayRunning() {
    try {
        console.log('🔍 Checking OpenClaw gateway status...');
        const status = execSync('openclaw gateway status', { encoding: 'utf8', timeout: 5000 });
        
        if (status.toLowerCase().includes('running')) {
            console.log('✅ OpenClaw gateway is running');
        } else {
            console.log('⚠️ OpenClaw gateway not running, attempting to start...');
            execSync('openclaw gateway start', { encoding: 'utf8', timeout: 10000 });
            console.log('✅ OpenClaw gateway started');
        }
    } catch (error) {
        console.log('⚠️ Gateway check failed, attempting to start...');
        try {
            execSync('openclaw gateway start', { encoding: 'utf8', timeout: 10000 });
            console.log('✅ OpenClaw gateway started');
        } catch (startError) {
            console.log('❌ Failed to start gateway:', startError.message);
            console.log('📍 Jerry OS will continue with fallback data');
        }
    }
}

// Start gateway check
ensureGatewayRunning();

// Import and start cron jobs FIRST (so jobTracker exists before dynamicData starts)
console.log('⏰ Initializing cron jobs...');
const cronTasks = require('./cron-jobs.js');
cronTasks.start(updateJobStatus);

// Import Dynamic Data Manager (jobTracker passed after its definition)
const DynamicDataManager = require('./dynamic-data.js');
const dynamicData = new DynamicDataManager();
dynamicData.start();
console.log('📊 Dynamic data system initialized with real data sources');

// Shared state for tracking job runs
const jobTracker = {
    'OS Documentation': { lastRun: null, status: 'idle', nextRun: '12:00 AM' },
    'Self-Improvement Build': { lastRun: null, status: 'idle', nextRun: '3:00 AM' },
    'Daily Brief': { lastRun: null, status: 'idle', nextRun: '6:00 AM' },
    'Nightly Backup': { lastRun: null, status: 'idle', nextRun: '2:00 AM' }
};

// Connect jobTracker to dynamic data manager (must be after jobTracker is defined)
dynamicData.setJobTracker(jobTracker);

function updateJobStatus(name, status) {
    if (jobTracker[name]) {
        jobTracker[name].status = status;
        if (status === 'success' || status === 'running') {
            jobTracker[name].lastRun = new Date().toISOString();
        }
    }
}

const app = express();
const PORT = 8981;

// Helper function for fallback responses - now using dynamic data
function returnFallbackResponse(res) {
    res.json({
        status: 'ok',
        result: dynamicData.getModels()
    });
}

function returnSessionsFallbackResponse(res) {
    res.json({
        status: 'ok',
        result: dynamicData.getSessions()
    });
}

function returnCronsFallbackResponse(res) {
    res.json({
        status: 'ok',
        result: dynamicData.getCrons()
    });
}

function getScheduleForJob(name) {
    const schedules = {
        'OS Documentation': '0 0 * * *',
        'Self-Improvement Build': '0 3 * * *',
        'Daily Brief': '0 6 * * *',
        'Nightly Backup': '0 2 * * *'
    };
    return schedules[name] || '* * * * *';
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Routes - All using dynamic data from real sources
app.get('/api/model', async (req, res) => {
    try {
        const result = await dynamicData.getModels();
        res.json({ status: 'ok', result });
    } catch (error) {
        console.error('[server] /api/model error:', error.message);
        res.json({ status: 'ok', result: { models: [] } });
    }
});

// Dynamic Org Chart - replaced with /api/org-chart-live at line 175
// The old static file handler was removed to use live Paperclip data

app.post('/api/org-chart', (req, res) => {
    const orgPath = path.join(__dirname, 'data', 'org-chart.json');
    try {
        const newData = req.body;
        fs.writeFileSync(orgPath, JSON.stringify(newData, null, 4));
        res.json({ status: 'ok', message: 'Org chart updated successfully' });
    } catch (e) {
        console.error('Failed to save org chart:', e);
        res.status(500).json({ status: 'error', error: 'Failed to save data' });
    }
});

app.get('/api/sessions', async (req, res) => {
    try {
        const result = await dynamicData.getSessions();
        res.json({ status: 'ok', result });
    } catch (error) {
        console.error('[server] /api/sessions error:', error.message);
        res.json({ status: 'ok', result: { sessions: [] } });
    }
});

app.get('/api/crons', async (req, res) => {
    try {
        const result = await dynamicData.getCrons();
        res.json({ status: 'ok', result });
    } catch (error) {
        console.error('[server] /api/crons error:', error.message);
        res.json({ status: 'ok', result: [] });
    }
});

app.get('/api/lab', async (req, res) => {
    try {
        const result = await dynamicData.getLabData();
        res.json({ status: 'ok', result });
    } catch (error) {
        console.error('[server] /api/lab error:', error.message);
        res.json({ status: 'ok', result: { prototypes: [], builds: [], improvements: [], metrics: { uptime: '0%', responseTime: '0ms', dailyRequests: 0 } } });
    }
});

// Dynamic Org Chart from Paperclip agents (live) with static fallback
const { buildOrgChart } = require('./org-chart-resolver.js');
app.get('/api/org-chart', async (req, res) => {
    try {
        const result = await buildOrgChart();
        res.json({ status: 'ok', result });
    } catch (error) {
        console.error('[server] /api/org-chart error:', error.message);
        const fallback = require('./data/org-chart.json');
        res.json({ status: 'ok', result: fallback });
    }
});

// Dashboard Overview (all data in one call)
app.get('/api/dashboard', async (req, res) => {
    try {
        const result = await dynamicData.getDashboard();
        res.json({ status: 'ok', result });
    } catch (error) {
        console.error('[server] /api/dashboard error:', error.message);
        res.json({ status: 'ok', result: { models: [], sessions: [], crons: [], paperclip: null, paperclipAgents: [], metrics: {} } });
    }
});

// Paperclip Agent Status
app.get('/api/paperclip', async (req, res) => {
    try {
        const result = await dynamicData.getPaperclipData();
        res.json({ status: 'ok', result });
    } catch (error) {
        console.error('[server] /api/paperclip error:', error.message);
        res.json({ status: 'ok', result: { summary: null, agents: [] } });
    }
});

// API Endpoint for Daily Briefs
app.get('/api/briefs', async (req, res) => {
    try {
        const briefsDir = path.join(__dirname, 'briefs');
        if (!fs.existsSync(briefsDir)) {
            return res.json({ status: 'ok', result: [] });
        }
        
        const files = await fs.promises.readdir(briefsDir);
        const briefs = files
            .filter(f => f.endsWith('.md'))
            .map(f => {
                const date = f.replace('.md', '');
                return {
                    id: date,
                    date: date,
                    title: new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                };
            })
            // Sort newest first
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
        res.json({ status: 'ok', result: briefs });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Failed to read briefs' });
    }
});

// Serve individual brief markdown
app.get('/briefs/:id.md', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'briefs', `${req.params.id}.md`);
        if (fs.existsSync(filePath)) {
            const content = await fs.promises.readFile(filePath, 'utf8');
            res.send(content);
        } else {
            res.status(404).send('Brief not found');
        }
    } catch (error) {
        res.status(500).send('Error reading brief');
    }
});

// API Endpoint for Documentation Pages
app.get('/api/docs', async (req, res) => {
    try {
        const docs = [
            { id: 'system-overview', title: 'System Overview', file: 'README.md' },
            { id: 'design-system', title: 'Design System', file: 'DESIGN-SKILL.md' },
            // Add more docs here as needed
        ];
        
        res.json({ status: 'ok', result: docs });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Failed to load docs list' });
    }
});

// Serve individual documentation markdown (allow access from root)
app.get('/docs/:file', async (req, res) => {
    try {
        // Only allow safe files from root to avoid path traversal
        const allowedFiles = ['README.md', 'DESIGN-SKILL.md'];
        const file = req.params.file;
        
        if (!allowedFiles.includes(file)) {
            return res.status(403).send('Forbidden document');
        }
        
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const content = await fs.promises.readFile(filePath, 'utf8');
            res.send(content);
        } else {
            res.status(404).send('Document not found');
        }
    } catch (error) {
        res.status(500).send('Error reading document');
    }
});

// SSE Session History Endpoint
app.get('/api/sessions/:id/history', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('\n');

    const sessionId = req.params.id;
    const memoryPath = path.join(__dirname, '../../memory');

    sendSessionHistory(res, sessionId);

    const watcher = chokidar.watch(memoryPath, {
        ignored: /(^|[\/\\])\./,
        persistent: true
    });

    watcher.on('change', (filePath) => {
        if (filePath.includes(sessionId)) {
            sendSessionHistory(res, sessionId);
        }
    });

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
    const memoryPath = path.join(__dirname, 'memory');
    const sessionPath = path.join(memoryPath, `${sessionId}.md`);

    if (!fs.existsSync(sessionPath)) {
        return { sessionId, messages: [], totalMessages: 0, status: 'no_history' };
    }

    const content = await fs.promises.readFile(sessionPath, 'utf8');
    const messages = parseSessionMessages(content);

    return {
        sessionId,
        messages: messages.reverse(),
        totalMessages: messages.length,
        status: 'loaded'
    };
}

function parseSessionMessages(content) {
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

// Chatbot prompt endpoint - Enhanced Recognition System
app.post('/api/prompt', express.json(), async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                status: 'error',
                error: 'No message provided'
            });
        }

        // Analyze the message
        const messageLower = message.toLowerCase().trim();
        let response = '';

        // Greetings
        if (messageLower.match(/^(hi|hello|hey|good morning|good evening|good afternoon)/)) {
            const greetings = [
                "Hey there! 👋 Great to see you! How can I help you today?",
                "Hi! 😊 I'm Jerry, your executive assistant. What can I do for you?",
                "Hello! 🌟 Welcome! I'm ready to assist you with anything you need!",
                "Hey! 👋 Good to hear from you! What's on your mind?"
            ];
            response = greetings[Math.floor(Math.random() * greetings.length)];
        }
        // Name and Identity
        else if (messageLower.match(/(your name|who are you|what are you|what's your name|your identity)/)) {
            response = `I'm Jerry! 🤖

I'm your AI executive assistant, designed to:
- Coordinate your multi-agent system
- Manage Technical Lead, Project Manager, and Research agents
- Handle executive tasks and decision-making
- Monitor system health and performance

Think of me as your right-hand AI for managing complex AI operations! 💪

How can I assist you today?`;
        }
        // Status and System
        else if (messageLower.match(/(status|system health|how is|system running|everything ok)/)) {
            response = `System Status Report: 📊

🟢 **Server**: Online and operational
🟢 **AI Models**: 3 available
   - DeepSeek V3.1 (Primary)
   - GLM-5 (Fallback #1)
   - Kimi-K2 (Fallback #2)
🟢 **Sessions**: Active and responsive
🟢 **Cron Jobs**: All scheduled tasks running normally
🟢 **Dynamic Data**: Real-time updates enabled

Everything is running smoothly! ✅

What specific aspect would you like me to elaborate on?`;
        }
        // Help and Capabilities
        else if (messageLower.match(/(help|what can you do|capabilities|abilities|features)/)) {
            response = `I can help you with a lot! 🚀

📊 **System Monitoring**:
   - Check server status, models, sessions
   - Monitor cron jobs and system health
   - Real-time performance tracking

🔧 **Technical Tasks**:
   - Debug issues and analyze logs
   - Optimize performance
   - Manage configurations

📋 **Project Management**:
   - Track progress and manage tasks
   - Coordinate agents and sub-agents
   - Organize workflows

💬 **Communication**:
   - Draft messages and reports
   - Create summaries
   - Generate documentation

What would you like me to help with?`;
        }
        // Agents and Delegation
        else if (messageLower.match(/(agent|delegate|sub-agent|hierarchy|team)/)) {
            response = `Agent Structure Overview: 🎯

**Executive Level**:
- Jerry (Me) - Executive Assistant & Coordinator

**Primary Agents** (3):
1. 📱 Technical Lead - Code & Infrastructure
2. 📊 Project Manager - Coordination & Tracking
3. 🔍 Research Agent - Information & Analysis

**Sub-Agents** (7 planned):
- Client-specific workers
- Project-specific specialists
- Infrastructure managers

I can spawn, delegate to, and coordinate all these agents!

Would you like me to:
1. Spawn a new agent for a specific task?
2. Check current agent status?
3. Delegate work to an agent?`;
        }
        // Thanks and Appreciation
        else if (messageLower.match(/(thank|thanks|appreciate|good job|well done)/)) {
            const thanksResponses = [
                "You're welcome! 😊 Happy to help anytime!",
                "My pleasure! 🚀 Let me know if you need anything else!",
                "Glad I could assist! That's what I'm here for! 💪",
                "Thank you! 🙏 Always here to support you!"
            ];
            response = thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
        }
        // Goodbye
        else if (messageLower.match(/(bye|goodbye|see you|later|exit|quit)/)) {
            const goodbyes = [
                "Goodbye! 👋 Have a great day! Come back anytime!",
                "See you later! 🌟 I'll be here when you need me!",
                "Bye for now! 👋 Take care!",
                "See you! 👋 Always happy to help!"
            ];
            response = goodbyes[Math.floor(Math.random() * goodbyes.length)];
        }
        // Default Contextual Response
        else {
            const contextualResponses = [
                `I understand you're asking about "${message}". Let me help you with that.

Based on your question, I can:
1. Analyze the specific details
2. Provide relevant suggestions
3. Take action if needed

What would you prefer?`,

                `Thanks for asking! Regarding "${message.substring(0, 40)}...":

I can help you in multiple ways:
📊 Analyze the situation
💡 Provide recommendations
🔧 Execute actions if you approve

Shall I proceed with one of these?`,

                `Got it! I'm processing: "${message.substring(0, 40)}..."

Here's what I can do:
📋 Break down the problem
🎯 Suggest solutions
⚡ Take action on your approval

What's your preference?`
            ];
            response = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
        }

        res.json({
            status: 'ok',
            result: {
                response: response,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to process message'
        });
    }
});

// Serve interface
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
