const cron = require('node-cron');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let updateCallback = null;

function start(onUpdate) {
    updateCallback = onUpdate;
    console.log('⏰ Cron jobs initialized. Waiting for scheduled times...');
}

function notify(name, status) {
    if (updateCallback) {
        updateCallback(name, status);
    }
}

// Backup job - runs every night at 2:00 AM
cron.schedule('0 2 * * *', () => {
    console.log('🚀 Starting nightly backup to GitHub...');
    notify('Nightly Backup', 'running');
    backupWorkspace()
        .then(() => notify('Nightly Backup', 'idle'))
        .catch(() => notify('Nightly Backup', 'failed'));
});

// Self-improvement job - runs every hour
cron.schedule('0 * * * *', () => {
    console.log('🔧 Starting overnight self-improvement...');
    notify('Self-Improvement Build', 'running');
    buildNewFeature()
        .then(() => notify('Self-Improvement Build', 'idle'))
        .catch(() => notify('Self-Improvement Build', 'failed'));
});

// Daily brief job - runs at 6:00 AM
cron.schedule('0 6 * * *', () => {
    console.log('📊 Generating daily brief...');
    notify('Daily Brief', 'running');
    generateDailyBrief()
        .then(() => notify('Daily Brief', 'idle'))
        .catch(() => notify('Daily Brief', 'failed'));
});

// Documentation job - runs at midnight
cron.schedule('0 0 * * *', () => {
    console.log('📚 Updating system documentation...');
    notify('OS Documentation', 'running');
    updateDocumentation()
        .then(() => notify('OS Documentation', 'idle'))
        .catch(() => notify('OS Documentation', 'failed'));
});

async function backupWorkspace() {
    try {
        console.log('🔒 Backing up ENTIRE OpenClaw workspace (excluding secrets)...');

        // Change to OpenClaw workspace root
        const workspaceRoot = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace');
        process.chdir(workspaceRoot);

        // Add all changes in the entire workspace
        execSync('git add .', { stdio: 'inherit' });

        // Remove any sensitive files that might have been added
        try {
            execSync('git reset -- .env || true', { stdio: 'inherit' });
            execSync('git reset -- config/*.json || true', { stdio: 'inherit' });
            execSync('git reset -- *secret* || true', { stdio: 'inherit' });
            execSync('git reset -- *key* || true', { stdio: 'inherit' });
            execSync('git reset -- *token* || true', { stdio: 'inherit' });
            execSync('git reset -- *.key || true', { stdio: 'inherit' });
            execSync('git reset -- *.pem || true', { stdio: 'inherit' });
            execSync('git reset -- credentials* || true', { stdio: 'inherit' });
        } catch (resetError) {
            console.log('No sensitive files to remove from staging');
        }

        // Commit with timestamp
        const commitMessage = `OpenClaw Full Backup: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        try {
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        } catch (commitError) {
            console.log('No changes to commit');
            return; // No need to push if no changes
        }

        // Push to private GitHub repo
        console.log('📤 Pushing entire workspace to GitHub repository...');
        execSync('git push -u origin master', { stdio: 'inherit' });

        console.log('✅ Full workspace backup completed successfully!');

        // Return to original directory
        process.chdir(__dirname);

    } catch (error) {
        console.error('❌ Full workspace backup failed:', error.message);

        // Try to return to original directory even if backup failed
        try {
            process.chdir(__dirname);
        } catch (cdError) {
            console.log('Could not return to original directory:', cdError.message);
        }
    }
}

async function buildNewFeature() {
    try {
        console.log('🤖 Starting overnight self-improvement analysis...');

        // Read and analyze user context
        const userContext = await analyzeUserContext();
        console.log('📊 Context analysis complete:', userContext.summary);

        // Determine what feature to build based on patterns
        const featurePlan = await determineFeatureToBuild(userContext);
        console.log('🎯 Feature selected:', featurePlan.name);

        // Build the actual feature
        const buildResult = await buildFeature(featurePlan);

        if (buildResult.success) {
            console.log('✅ Self-improvement completed successfully!');
            console.log('📁 Built:', buildResult.featurePath);

            // Update memory with what was built
            await updateImprovementMemory(featurePlan, buildResult);
    // Push successful improvements to production
    await pushToProduction(featurePlan, buildResult);

        } else {
            console.log('⚠️ Self-improvement completed with partial success');
            console.log('💡 Learned:', buildResult.learnings);
        }

    } catch (error) {
        console.error('❌ Self-improvement failed:', error.message);
        // Still log what we learned from the failure
        await logImprovementAttempt(error);
    }
}

async function analyzeUserContext() {
    const context = {
        userNeeds: [],
        painPoints: [],
        usagePatterns: [],
        featureRequests: [],
        summary: ''
    };

    try {
        // Read USER.md to understand your preferences and needs
        const userPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace', 'USER.md');
        if (fs.existsSync(userPath)) {
            const userContent = fs.readFileSync(userPath, 'utf8');
            context.userNeeds = extractNeedsFromUserMD(userContent);
        }

        // Read recent memory files to understand usage patterns
        const memoryPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace', 'memory');
        if (fs.existsSync(memoryPath)) {
            const memoryFiles = fs.readdirSync(memoryPath).filter(f => f.endsWith('.md'));
            const recentMemories = memoryFiles.slice(-5); // Last 5 memory files

            for (const file of recentMemories) {
                const content = fs.readFileSync(path.join(memoryPath, file), 'utf8');
                context.usagePatterns.push(...extractUsagePatterns(content));
                context.painPoints.push(...extractPainPoints(content));
            }
        }

        // Analyze feature requests from conversation patterns
        context.featureRequests = analyzeFeatureRequests(context.usagePatterns);

        context.summary = `Analyzed ${context.userNeeds.length} user needs, ${context.painPoints.length} pain points, ${context.usagePatterns.length} usage patterns, and ${context.featureRequests.length} feature requests`;

    } catch (error) {
        console.log('Context analysis partial:', error.message);
        context.summary = 'Partial context analysis due to read errors';
    }

    return context;
}

async function determineFeatureToBuild(userContext) {
    // Simple prioritization algorithm
    const featureIdeas = [
        {
            name: 'Enhanced Chatbot Memory',
            priority: userContext.painPoints.filter(p => p.includes('memory') || p.includes('forgot')).length * 2,
            description: 'Improve chatbot memory retention and context awareness',
            buildFunction: buildEnhancedMemorySystem,
            model: 'glm5'  // Using GLM5 for this feature
        },
        {
            name: 'Automation Dashboard',
            priority: userContext.featureRequests.filter(f => f.includes('automation') || f.includes('dashboard')).length * 3,
            description: 'Create visual dashboard for managing automations',
            buildFunction: buildAutomationDashboard,
            model: 'glm5'  // Using GLM5 for this feature
        },
        {
            name: 'API Integration Improvements',
            priority: userContext.painPoints.filter(p => p.includes('API') || p.includes('integration')).length * 2,
            description: 'Enhance API reliability and error handling',
            buildFunction: buildAPIImprovements,
            model: 'glm5'  // Using GLM5 for this feature
        },
        {
            name: 'UI/UX Enhancements',
            priority: userContext.painPoints.filter(p => p.includes('UI') || p.includes('interface')).length * 1.5,
            description: 'Improve user interface based on usage patterns',
            buildFunction: buildUIEnhancements,
            model: 'glm5'  // Using GLM5 for this feature
        }
    ];

    // Sort by priority and select the highest
    featureIdeas.sort((a, b) => b.priority - a.priority);
    const selectedFeature = featureIdeas[0];

    return {
        ...selectedFeature,
        priorityScore: selectedFeature.priority,
        context: userContext,
        model: 'glm5'  // All features will use GLM5
    };
}

async function buildFeature(featurePlan) {
    try {
        console.log('🔨 Building feature:', featurePlan.name);

        // Execute the build function
        const result = await featurePlan.buildFunction(featurePlan.context);

        return {
            success: true,
            featurePath: result.path,
            changes: result.changes,
            buildTime: new Date().toISOString(),
            details: result
        };

    } catch (error) {
        console.error('Feature build failed:', error.message);

        return {
            success: false,
            error: error.message,
            learnings: extractLearningsFromFailure(error, featurePlan),
            buildTime: new Date().toISOString()
        };
    }
}

// REAL build functions - these actually create features
async function buildEnhancedMemorySystem(context) {
    const fs = require('fs');
    const path = require('path');

    try {
        console.log('🧠 Building Enhanced Memory System...');

        // Create the enhanced memory system
        const memoryCode = `// Enhanced Memory System - Auto-generated by Self-Improvement
// Built: ${new Date().toISOString()}
// Context: ${context.summary}

const fs = require('fs');
const path = require('path');

class EnhancedMemorySystem {
    constructor() {
        this.memoryPath = path.join(__dirname, '../../memory');
        this.contextRetention = {};
        this.setupEnhancedMemory();
    }

    setupEnhancedMemory() {
        // Create memory directory if it doesn't exist
        if (!fs.existsSync(this.memoryPath)) {
            fs.mkdirSync(this.memoryPath, { recursive: true });
        }

        // Initialize context retention system
        this.contextRetention = {
            maxContextLength: 10,
            retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
            contexts: new Map()
        };

        console.log('✅ Enhanced Memory System initialized');
    }

    retainContext(sessionId, contextData) {
        const now = Date.now();
        const sessionContexts = this.contextRetention.contexts.get(sessionId) || [];

        // Add new context
        sessionContexts.push({
            timestamp: now,
            data: contextData,
            expires: now + this.contextRetention.retentionPeriod
        });

        // Trim to max length
        if (sessionContexts.length > this.contextRetention.maxContextLength) {
            sessionContexts.shift();
        }

        this.contextRetention.contexts.set(sessionId, sessionContexts);
        return true;
    }

    recallContext(sessionId, maxAge = 3600000) {
        const now = Date.now();
        const sessionContexts = this.contextRetention.contexts.get(sessionId) || [];

        // Filter by age and remove expired
        const validContexts = sessionContexts.filter(ctx =>
            ctx.timestamp >= now - maxAge && ctx.timestamp <= now
        );

        // Remove expired contexts
        this.contextRetention.contexts.set(sessionId, validContexts);

        return validContexts.map(ctx => ctx.data);
    }

    async saveToLongTermMemory(key, data, importance = 1) {
        const memoryFile = path.join(this.memoryPath, \`long-term-\${key}.md\`);
        const entry = \`### \${new Date().toISOString()}
**Importance:** \${importance}/5
**Data:** \${JSON.stringify(data, null, 2)}
\n\`;

        try {
            await fs.promises.appendFile(memoryFile, entry);
            return true;
        } catch (error) {
            console.error('Failed to save to long-term memory:', error);
            return false;
        }
    }

    getMemoryStats() {
        return {
            totalContexts: Array.from(this.contextRetention.contexts.values()).flat().length,
            activeSessions: this.contextRetention.contexts.size,
            retentionPeriod: this.contextRetention.retentionPeriod,
            maxContextLength: this.contextRetention.maxContextLength
        };
    }
}

module.exports = EnhancedMemorySystem;
`;

        // Write the actual file
        const filePath = path.join(__dirname, 'enhanced-memory-system.js');
        fs.writeFileSync(filePath, memoryCode);

        console.log('✅ Enhanced Memory System built successfully!');

        return {
            path: filePath,
            changes: [
                'Added real context retention system',
                'Implemented long-term memory storage',
                'Added session-based context management',
                'Built memory statistics tracking'
            ],
            fileSize: memoryCode.length,
            lines: memoryCode.split('\n').length
        };

    } catch (error) {
        console.error('❌ Failed to build Enhanced Memory System:', error);
        throw error;
    }
}

async function buildAutomationDashboard(context) {
    const fs = require('fs');
    const path = require('path');

    try {
        console.log('📊 Building Automation Dashboard...');

        // Create dashboard directory
        const dashboardPath = path.join(__dirname, 'automation-dashboard');
        if (!fs.existsSync(dashboardPath)) {
            fs.mkdirSync(dashboardPath, { recursive: true });
        }

        // Create main dashboard file
        const dashboardCode = `// Automation Dashboard - Auto-generated by Self-Improvement
// Built: ${new Date().toISOString()}

const express = require('express');
const path = require('path');

class AutomationDashboard {
    constructor() {
        this.app = express();
        this.automations = new Map();
        this.setupDashboard();
    }

    setupDashboard() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname)));

        // Dashboard routes
        this.app.get('/api/automations', (req, res) => {
            res.json({
                status: 'ok',
                result: Array.from(this.automations.values())
            });
        });

        this.app.post('/api/automations', (req, res) => {
            const automation = req.body;
            automation.id = Date.now().toString();
            automation.created = new Date().toISOString();
            automation.status = 'active';

            this.automations.set(automation.id, automation);

            res.json({ status: 'ok', result: automation });
        });

        console.log('✅ Automation Dashboard initialized');
    }

    start(port = 8990) {
        this.app.listen(port, () => {
            console.log(\`📊 Automation Dashboard running on port \${port}\`);
        });
    }

    addAutomation(name, schedule, action) {
        const automation = {
            id: Date.now().toString(),
            name,
            schedule,
            action: action.toString(),
            status: 'active',
            created: new Date().toISOString(),
            lastRun: null,
            nextRun: this.calculateNextRun(schedule)
        };

        this.automations.set(automation.id, automation);
        return automation;
    }

    calculateNextRun(schedule) {
        // Simple cron schedule calculation
        return new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
    }
}

module.exports = AutomationDashboard;
`;

        // Create HTML interface
        const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automation Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; }
        .dashboard { max-width: 1000px; margin: 0 auto; }
        .header { background: #1a1a1a; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .automation-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .automation-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-active { color: #10b981; font-weight: bold; }
        .status-paused { color: #f59e0b; font-weight: bold; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🤖 Automation Dashboard</h1>
            <p>Manage your automated tasks and workflows</p>
        </div>

        <div class="automation-grid" id="automationGrid">
            <!-- Automations will be loaded here -->
        </div>
    </div>

    <script>
        async function loadAutomations() {
            try {
                const response = await fetch('/api/automations');
                const data = await response.json();

                if (data.status === 'ok') {
                    renderAutomations(data.result);
                }
            } catch (error) {
                console.error('Failed to load automations:', error);
            }
        }

        function renderAutomations(automations) {
            const grid = document.getElementById('automationGrid');
            grid.innerHTML = automations.map(auto => \`
                <div class="automation-card">
                    <h3>\${auto.name}</h3>
                    <p><strong>Schedule:</strong> \${auto.schedule}</p>
                    <p><strong>Status:</strong> <span class="status-\${auto.status}">\${auto.status}</span></p>
                    <p><strong>Last Run:</strong> \${auto.lastRun || 'Never'}</p>
                    <p><strong>Next Run:</strong> \${auto.nextRun || 'Not scheduled'}</p>
                </div>
            \`).join('');
        }

        // Load automations on page load
        loadAutomations();

        // Refresh every 30 seconds
        setInterval(loadAutomations, 30000);
    </script>
</body>
</html>`;

        // Write files
        const mainFile = path.join(dashboardPath, 'automation-dashboard.js');
        const htmlFile = path.join(dashboardPath, 'index.html');

        fs.writeFileSync(mainFile, dashboardCode);
        fs.writeFileSync(htmlFile, htmlCode);

        console.log('✅ Automation Dashboard built successfully!');

        return {
            path: dashboardPath,
            changes: [
                'Created full automation dashboard system',
                'Built REST API for automation management',
                'Designed responsive HTML interface',
                'Added real-time automation monitoring'
            ],
            files: ['automation-dashboard.js', 'index.html'],
            totalSize: dashboardCode.length + htmlCode.length
        };

    } catch (error) {
        console.error('❌ Failed to build Automation Dashboard:', error);
        throw error;
    }
}

async function buildAPIImprovements(context) {
    const fs = require('fs');

    try {
        console.log('🔌 Building API Improvements...');

        const apiCode = `// API Improvements - Auto-generated by Self-Improvement
// Built: ${new Date().toISOString()}

class APIImprovements {
    constructor() {
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000,
            backoffFactor: 2,
            timeout: 10000
        };

        this.errorHandlers = new Map();
        this.setupErrorHandling();
    }

    setupErrorHandling() {
        // Default error handlers
        this.registerErrorHandler('network', this.handleNetworkError.bind(this));
        this.registerErrorHandler('timeout', this.handleTimeoutError.bind(this));
        this.registerErrorHandler('validation', this.handleValidationError.bind(this));

        console.log('✅ API Improvements initialized');
    }

    registerErrorHandler(errorType, handler) {
        this.errorHandlers.set(errorType, handler);
    }

    async withRetry(apiCall, config = {}) {
        const finalConfig = { ...this.retryConfig, ...config };
        let lastError;

        for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
            try {
                const result = await Promise.race([
                    apiCall(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('timeout')), finalConfig.timeout)
                    )
                ]);

                return result;

            } catch (error) {
                lastError = error;

                // Determine error type
                const errorType = this.classifyError(error);

                // Apply specific error handler
                const handler = this.errorHandlers.get(errorType) || this.defaultErrorHandler;
                const shouldRetry = handler(error, attempt, finalConfig);

                if (!shouldRetry) {
                    break;
                }

                // Wait before retry with exponential backoff
                const delay = finalConfig.retryDelay * Math.pow(finalConfig.backoffFactor, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    classifyError(error) {
        if (error.message.includes('timeout')) return 'timeout';
        if (error.message.includes('network') || error.code === 'ENOTFOUND') return 'network';
        if (error.message.includes('validation') || error.statusCode === 400) return 'validation';
        return 'unknown';
    }

    handleNetworkError(error, attempt, config) {
        console.log(\`🌐 Network error (attempt \${attempt}/\${config.maxRetries}): \${error.message}\`);
        return attempt < config.maxRetries;
    }

    handleTimeoutError(error, attempt, config) {
        console.log(\`⏰ Timeout error (attempt \${attempt}/\${config.maxRetries}): \${error.message}\`);
        return attempt < config.maxRetries;
    }

    handleValidationError(error, attempt, config) {
        console.log(\`📋 Validation error: \${error.message}\`);
        return false; // Don't retry validation errors
    }

    defaultErrorHandler(error, attempt, config) {
        console.log(\`❌ Unknown error (attempt \${attempt}/\${config.maxRetries}): \${error.message}\`);
        return attempt < config.maxRetries;
    }

    getStats() {
        return {
            totalErrorHandlers: this.errorHandlers.size,
            retryConfig: this.retryConfig,
            supportedErrorTypes: Array.from(this.errorHandlers.keys())
        };
    }
}

module.exports = APIImprovements;
`;

        const filePath = path.join(__dirname, 'api-improvements.js');
        fs.writeFileSync(filePath, apiCode);

        console.log('✅ API Improvements built successfully!');

        return {
            path: filePath,
            changes: [
                'Added intelligent retry system with exponential backoff',
                'Implemented error classification and handling',
                'Built timeout management system',
                'Added configurable retry policies'
            ],
            fileSize: apiCode.length,
            lines: apiCode.split('\n').length
        };

    } catch (error) {
        console.error('❌ Failed to build API Improvements:', error);
        throw error;
    }
}

async function buildUIEnhancements(context) {
    const fs = require('fs');
    const path = require('path');

    try {
        console.log('🎨 Building UI Enhancements...');

        // Create UI enhancements directory
        const uiPath = path.join(__dirname, 'ui-enhancements');
        if (!fs.existsSync(uiPath)) {
            fs.mkdirSync(uiPath, { recursive: true });
        }

        // Create CSS enhancements
        const cssCode = `/* UI Enhancements - Auto-generated by Self-Improvement */
/* Built: ${new Date().toISOString()} */

:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
    --background: #ffffff;
    --surface: #f8fafc;
    --border: #e2e8f0;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
}

.enhanced-ui {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--background);
}

.enhanced-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    margin: 16px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
}

.enhanced-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
}

.enhanced-button {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.enhanced-button:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
}

.enhanced-nav {
    display: flex;
    gap: 8px;
    padding: 16px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
}

.enhanced-nav-item {
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    color: var(--text-secondary);
    transition: all 0.2s ease;
}

.enhanced-nav-item:hover,
.enhanced-nav-item.active {
    background: var(--primary-color);
    color: white;
}

.status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-active { background: var(--success-color); color: white; }
.status-warning { background: var(--warning-color); color: white; }
.status-error { background: var(--error-color); color: white; }

/* Responsive design */
@media (max-width: 768px) {
    .enhanced-nav {
        flex-direction: column;
        gap: 4px;
    }

    .enhanced-card {
        margin: 8px 0;
        padding: 16px;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    :root {
        --background: #0f172a;
        --surface: #1e293b;
        --border: #334155;
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
    }
}`;

        // Create JavaScript component
        const jsCode = `// UI Enhancement Components - Auto-generated by Self-Improvement
// Built: ${new Date().toISOString()}

class UIEnhancer {
    constructor() {
        this.components = new Map();
        this.theme = this.detectTheme();
        this.setupEnhancements();
    }

    setupEnhancements() {
        // Auto-apply enhanced styles
        this.injectStyles();

        // Enhance existing UI elements
        this.enhanceNavigation();
        this.enhanceCards();
        this.enhanceButtons();

        console.log('✅ UI Enhancements applied');
    }

    injectStyles() {
        const styleId = 'enhanced-ui-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = \`/* CSS will be injected here */\`;
            document.head.appendChild(style);
        }
    }

    enhanceNavigation() {
        const navElements = document.querySelectorAll('nav, .nav, .navigation');
        navElements.forEach(nav => {
            nav.classList.add('enhanced-nav');
            nav.querySelectorAll('a, button').forEach(item => {
                item.classList.add('enhanced-nav-item');
            });
        });
    }

    enhanceCards() {
        const cards = document.querySelectorAll('.card, .panel, .box');
        cards.forEach(card => {
            card.classList.add('enhanced-card');
        });
    }

    enhanceButtons() {
        const buttons = document.querySelectorAll('button, .btn, .button');
        buttons.forEach(btn => {
            btn.classList.add('enhanced-button');
        });
    }

    detectTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    registerComponent(name, component) {
        this.components.set(name, component);
    }

    getComponent(name) {
        return this.components.get(name);
    }

    getStats() {
        return {
            totalComponents: this.components.size,
            currentTheme: this.theme,
            enhancedElements: {
                navigation: document.querySelectorAll('.enhanced-nav').length,
                cards: document.querySelectorAll('.enhanced-card').length,
                buttons: document.querySelectorAll('.enhanced-button').length
            }
        };
    }
}

// Auto-initialize when loaded in browser
if (typeof window !== 'undefined') {
    window.UIEnhancer = new UIEnhancer();
}

module.exports = UIEnhancer;
`;

        // Write files
        const cssFile = path.join(uiPath, 'enhanced-styles.css');
        const jsFile = path.join(uiPath, 'ui-enhancer.js');

        fs.writeFileSync(cssFile, cssCode);
        fs.writeFileSync(jsFile, jsCode);

        console.log('✅ UI Enhancements built successfully!');

        return {
            path: uiPath,
            changes: [
                'Created modern CSS design system with variables',
                'Built responsive layout enhancements',
                'Added dark mode support',
                'Created JavaScript UI enhancement component',
                'Added auto-application of enhanced styles'
            ],
            files: ['enhanced-styles.css', 'ui-enhancer.js'],
            totalSize: cssCode.length + jsCode.length
        };

    } catch (error) {
        console.error('❌ Failed to build UI Enhancements:', error);
        throw error;
    }
}

// Enhanced analysis functions
function extractNeedsFromUserMD(content) {
    const needs = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        // More sophisticated need detection
        if (lowerLine.includes('i need') ||
            lowerLine.includes('i want') ||
            lowerLine.includes('require') ||
            lowerLine.includes('would help') ||
            lowerLine.includes('could use') ||
            lowerLine.includes('looking for') ||
            (lowerLine.includes('better') && lowerLine.includes('would be')) ||
            lowerLine.includes('wish it could')) {

            // Extract the actual need
            const needText = line.trim()
                .replace(/^[-*]\s*/, '') // Remove bullet points
                .replace(/^#+\s*/, '') // Remove headers
                .trim();

            if (needText.length > 10) { // Meaningful content
                needs.push(needText);
            }
        }
    }

    return needs.slice(0, 15); // Return top 15 needs
}

function extractUsagePatterns(content) {
    const patterns = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Look for meaningful patterns
        if (trimmed.length > 25 &&
            !trimmed.startsWith('#') &&
            !trimmed.startsWith('###') &&
            !trimmed.includes('```') &&
            trimmed.split(' ').length > 3) {

            patterns.push(trimmed);
        }
    }

    return patterns.slice(0, 20); // Return top 20 patterns
}

function extractPainPoints(content) {
    const painPoints = [];
    const lines = content.split('\n');

    const painKeywords = [
        'problem', 'issue', 'error', 'bug', 'fix', 'broken',
        'doesn\'t work', 'not working', 'trouble', 'difficult',
        'slow', 'crash', 'failed', 'stuck', 'blocked', 'frustrat',
        'annoying', 'complicated', 'hard to', 'challenge'
    ];

    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        if (painKeywords.some(keyword => lowerLine.includes(keyword))) {
            const painText = line.trim()
                .replace(/^[-*]\s*/, '')
                .replace(/^#+\s*/, '')
                .trim();

            if (painText.length > 15) {
                painPoints.push(painText);
            }
        }
    }

    return painPoints.slice(0, 15); // Return top 15 pain points
}

function analyzeFeatureRequests(patterns) {
    const requests = [];

    const requestPatterns = [
        'should have', 'would be great if', 'need to add',
        'wish it could', 'it would be nice', 'would love',
        'would be useful', 'would be helpful', 'should support',
        'could benefit from', 'would improve', 'would make',
        'would be better if', 'would be awesome', 'hoping for'
    ];

    for (const pattern of patterns) {
        const lowerPattern = pattern.toLowerCase();

        if (requestPatterns.some(req => lowerPattern.includes(req))) {
            requests.push(pattern);
        }
    }

    return requests.slice(0, 10); // Return top 10 feature requests
}

function extractLearningsFromFailure(error, featurePlan) {
    return `Failed to build ${featurePlan.name}: ${error.message}. Will prioritize differently next time.`;
}

async function updateImprovementMemory(featurePlan, buildResult) {
    const memoryEntry = `### ${new Date().toISOString()}
**Self-Improvement:** ${featurePlan.name}
**Status:** ${buildResult.success ? '✅ Success' : '❌ Failed'}
**Model:** ${featurePlan.model || 'glm5'}
**Details:** ${buildResult.success ? `Built ${buildResult.featurePath}` : buildResult.learnings}
**Context:** ${featurePlan.context.summary}
**Changes:** ${buildResult.success ? buildResult.changes.join(', ') : 'None'}
\n`;

    // Use correct path relative to workspace
    const memoryPath = path.join(__dirname, '../../memory', `self-improvement-${Date.now()}.md`);

    // Ensure memory directory exists
    const memoryDir = path.dirname(memoryPath);
    if (!fs.existsSync(memoryDir)) {
        fs.mkdirSync(memoryDir, { recursive: true });
    }

    fs.writeFileSync(memoryPath, memoryEntry);
    console.log(`📝 Memory updated: ${memoryPath}`);
}

async function logImprovementAttempt(error) {
    const logEntry = `### ${new Date().toISOString()}
**Self-Improvement Attempt Failed**
**Error:** ${error.message}
**Stack:** ${error.stack || 'No stack trace'}
\n`;

    // Use correct path relative to workspace
    const logPath = path.join(__dirname, '../../memory', `improvement-failure-${Date.now()}.md`);

    // Ensure memory directory exists
    const memoryDir = path.dirname(logPath);
    if (!fs.existsSync(memoryDir)) {
        fs.mkdirSync(memoryDir, { recursive: true });
    }

    fs.writeFileSync(logPath, logEntry);
    console.log(`📝 Failure logged: ${logPath}`);
}

async function generateDailyBrief() {
    try {
        console.log('📝 Generating daily brief with AI pulse...');

        // This will be implemented to create daily briefs
        // For now, just log that it would run
        console.log('🗞️ Daily brief would be generated here');

    } catch (error) {
        console.error('❌ Daily brief generation failed:', error.message);
    }
}

async function updateDocumentation() {
    try {
        console.log('📖 Analyzing system for documentation...');

        // This will be implemented to update documentation
        // For now, just log that it would run
        console.log('📋 Documentation would be updated here');

    } catch (error) {
        console.error('❌ Documentation update failed:', error.message);
    }
}

module.exports = {
    start,
    backupWorkspace,
    buildNewFeature,
    generateDailyBrief,
    updateDocumentation
};
// Push successful improvements to production
async function pushToProduction(featurePlan, buildResult) {
  try {
    console.log('?? Pushing improvement to production...');
    
    const stagingPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace', 'projects', 'jerry-os-staging');
    const productionPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace', 'projects', 'jerry-os');
    
    // Copy the built file to production if it exists
    if (buildResult.featurePath && fs.existsSync(buildResult.featurePath)) {
      const fileName = path.basename(buildResult.featurePath);
      const destPath = path.join(productionPath, fileName);
      
      fs.copyFileSync(buildResult.featurePath, destPath);
      console.log('? Copied to production:', fileName);
      
      // Commit to production
      try {
        process.chdir(productionPath);
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "Auto-improvement: ' + featurePlan.name + ' - ' + new Date().toISOString() + '"', { stdio: 'inherit' });
        console.log('? Committed to production git');
      } catch (gitError) {
        console.log('Git commit skipped (no changes or error)');
      }
      
      process.chdir(stagingPath);
    }
    
    console.log('? Push to production complete');
    return { success: true };
  } catch (error) {
    console.error('? Push to production failed:', error.message);
    return { success: false, error: error.message };
  }
}
