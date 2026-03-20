// Jerry OS Staging Server - Testing Environment
const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const chokidar = require('chokidar');

// Import Dynamic Data Manager
const DynamicDataManager = require('./dynamic-data.js');
const dynamicData = new DynamicDataManager();
dynamicData.start();
console.log('📊 Staging: Dynamic data system initialized');

// Import Agent Orchestrator
const AgentOrchestrator = require('./agent-orchestrator.js');
const orchestrator = new AgentOrchestrator();
console.log('🤖 Staging: Agent orchestrator initialized');

// Import and start cron jobs
console.log('⏰ Initializing cron jobs...');
const cronTasks = require('./cron-jobs.js');

// Shared state for tracking job runs
const jobTracker = {
    'OS Documentation': { lastRun: null, status: 'idle', nextRun: '12:00 AM' },
    'Self-Improvement Build': { lastRun: null, status: 'idle', nextRun: '3:00 AM' },
    'Daily Brief': { lastRun: null, status: 'idle', nextRun: '6:00 AM' },
    'Nightly Backup': { lastRun: null, status: 'idle', nextRun: '2:00 AM' }
};

function updateJobStatus(name, status) {
    if (jobTracker[name]) {
        jobTracker[name].status = status;
        if (status === 'success' || status === 'running') {
            jobTracker[name].lastRun = new Date().toISOString();
        }
    }
}

const app = express();
const PORT = 8981; // Staging runs on port 8981

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

// API Routes - All using dynamic data
app.get('/api/model', async (req, res) => {
    try {
        returnFallbackResponse(res);
    } catch (error) {
        console.log('Model API error:', error.message);
        returnFallbackResponse(res);
    }
});

app.get('/api/org-chart', (req, res) => {
    try {
        // Get created agents from orchestrator
        if (orchestrator.agentCreator) {
            global.createdAgentsList = orchestrator.agentCreator.getCreatedAgents();
        }
        
        const dynamicOrgData = dynamicData.getOrgChart();
        res.json({ status: 'ok', result: dynamicOrgData });
    } catch (error) {
        console.log('Org Chart API error:', error.message);
        // Fallback to static file if dynamic generation fails
        const orgPath = path.join(__dirname, 'data', 'org-chart.json');
        if (fs.existsSync(orgPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(orgPath, 'utf8'));
                res.json({ status: 'ok', result: data });
            } catch (e) {
                res.status(500).json({ status: 'error', error: 'Failed to parse org-chart.json' });
            }
        } else {
            res.status(500).json({ status: 'error', error: 'Failed to generate dynamic org chart' });
        }
    }
});

app.get('/api/sessions', async (req, res) => {
    try {
        returnSessionsFallbackResponse(res);
    } catch (error) {
        console.log('Sessions API error:', error.message);
        returnSessionsFallbackResponse(res);
    }
});

app.get('/api/crons', async (req, res) => {
    try {
        returnCronsFallbackResponse(res);
    } catch (error) {
        console.log('Crons API error:', error.message);
        returnCronsFallbackResponse(res);
    }
});

// Agent Management Endpoints
app.get('/api/agents/status', (req, res) => {
    try {
        const statuses = orchestrator.getAllAgentsStatus();
        res.json({ status: 'ok', result: statuses });
    } catch (error) {
        console.log('Agent status error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.post('/api/agents/initialize', (req, res) => {
    try {
        const result = orchestrator.initializePlannedAgents();
        res.json({ status: 'ok', result: result });
    } catch (error) {
        console.log('Agent initialization error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.post('/api/agents/:agentId/delegate', (req, res) => {
    try {
        const { agentId } = req.params;
        const task = req.body;
        
        const delegation = orchestrator.delegateTask(agentId, task);
        res.json({ status: 'ok', result: delegation });
    } catch (error) {
        console.log('Delegation error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.post('/api/agents/process-tasks', async (req, res) => {
    try {
        await orchestrator.processTaskQueue();
        res.json({ status: 'ok', message: 'Tasks processed' });
    } catch (error) {
        console.log('Task processing error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.get('/api/agents/task/:taskId', (req, res) => {
    try {
        const { taskId } = req.params;
        const task = orchestrator.activeTasks.get(taskId);
        
        if (!task) {
            return res.status(404).json({ status: 'error', error: 'Task not found' });
        }
        
        res.json({ status: 'ok', result: task });
    } catch (error) {
        console.log('Task fetch error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.get('/api/agents/stats', (req, res) => {
    try {
        const stats = orchestrator.getStats();
        res.json({ status: 'ok', result: stats });
    } catch (error) {
        console.log('Agent stats error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Intelligent Routing Endpoints
app.post('/api/route-task', async (req, res) => {
    try {
        const { description, context } = req.body;
        
        const result = await orchestrator.intelligence.delegateIntelligently(description, context);
        res.json({ status: 'ok', result: result });
    } catch (error) {
        console.log('Intelligent routing error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.get('/api/intelligence/stats', (req, res) => {
    try {
        const stats = orchestrator.intelligence.getStats();
        res.json({ status: 'ok', result: stats });
    } catch (error) {
        console.log('Intelligence stats error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.get('/api/intelligence/recommendations', (req, res) => {
    try {
        const recommendations = orchestrator.intelligence.getRecommendations();
        res.json({ status: 'ok', result: recommendations });
    } catch (error) {
        console.log('Recommendations error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.post('/api/learn/:taskId', (req, res) => {
    try {
        const { taskId } = req.params;
        const { success } = req.body;
        
        orchestrator.intelligence.learnFromResult(taskId, success);
        res.json({ status: 'ok', message: 'Learning recorded' });
    } catch (error) {
        console.log('Learning error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Dynamic Agent Creation Endpoints
app.post('/api/agents/create', async (req, res) => {
    try {
        const { taskDescription, agentType } = req.body;
        
        const result = await orchestrator.agentCreator.createAgent(taskDescription, agentType);
        res.json({ status: 'ok', result: result });
    } catch (error) {
        console.log('Agent creation error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.get('/api/agents/created', (req, res) => {
    try {
        const createdAgents = orchestrator.agentCreator.getCreatedAgents();
        res.json({ status: 'ok', result: createdAgents });
    } catch (error) {
        console.log('Get created agents error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.get('/api/agents/available-types', (req, res) => {
    try {
        const types = orchestrator.agentCreator.getAvailableTypes();
        res.json({ status: 'ok', result: types });
    } catch (error) {
        console.log('Get agent types error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
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

// Chatbot prompt endpoint - Enhanced for Staging
app.post('/api/prompt', express.json(), (req, res) => {
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
                "Hey there! 👋 This is the STAGING environment!",
                "Hi! 😊 I'm Jerry in STAGING mode. Testing new features here!",
                "Hello! 🌟 Welcome to the staging sandbox!",
                "Hey! 👋 You're in the testing environment!"
            ];
            response = greetings[Math.floor(Math.random() * greetings.length)];
        }
        // Name and Identity
        else if (messageLower.match(/(your name|who are you|what are you|what's your name|your identity)/)) {
            response = `I'm Jerry! 🤖 (STAGING VERSION)

This is the TESTING ENVIRONMENT for Jerry OS.

I'm your AI executive assistant in sandbox mode:
- Safe place to test new features
- Experimental changes happen here first
- No risk to your production system

Feel free to break things here - that's what staging is for! 💪

What would you like to test?`;
        }
        // Status and System
        else if (messageLower.match(/(status|system health|how is|system running|everything ok)/)) {
            response = `STAGING Environment Status: 🧪

🟡 **Staging Server**: Running on port 8981
🟡 **Environment**: TESTING MODE
🟡 **Purpose**: Safe experimentation
🟡 **Safety**: Isolated from production

This is where we test before going live!

What feature would you like to test?`;
        }
        // Help and Capabilities
        else if (messageLower.match(/(help|what can you do|capabilities|abilities|features)/)) {
            response = `In STAGING, I can help you test: 🧪

📊 **Test New Features**:
   - Try experimental features
   - Validate UI changes
   - Test API modifications

🔧 **Debug Safely**:
   - Break things without consequences
   - Test error handling
   - Validate fixes

🎯 **Compare Versions**:
   - Production (8980) vs Staging (8981)
   - Side-by-side feature comparison
   - A/B testing

What would you like to test?`;
        }
        // Default Contextual Response
        else {
            const contextualResponses = [
                `STAGING: Testing "${message}"... 🧪

This is the sandbox environment. Let's test this safely!`,

                `STAGING: Analyzing "${message}"... 📊

Great test case! This is exactly what staging is for.`,

                `STAGING: Processing "${message}"... 🔧

Perfect for testing! No risk to production here.`
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
    console.log('%c🧪 Jerry OS Staging Server\n', 'color: #FFA500; font-size: 20px; font-weight: bold;');
    console.log(`Staging running at: http://0.0.0.0:${PORT}`);
    console.log('🧪 TESTING ENVIRONMENT - Safe to experiment');
    console.log(`Press Ctrl+C to stop\n`);
});

module.exports = app;
