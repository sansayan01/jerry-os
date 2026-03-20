// Real Agent Orchestrator for Jerry OS
// This manages actual sub-agent sessions and delegation

const fs = require('fs');
const path = require('path');
const AgentTaskExecutor = require('./agent-tasks.js');
const IntelligenceLayer = require('./intelligence-layer.js');
const DynamicAgentCreator = require('./dynamic-agent-creator.js');

class AgentOrchestrator {
    constructor() {
        this.agents = new Map();
        this.sessionMapping = new Map();
        this.delegationQueue = [];
        this.activeTasks = new Map();
        this.agentConfigs = this.loadAgentConfigs();
        this.taskExecutor = new AgentTaskExecutor();
        this.intelligence = new IntelligenceLayer(this);
        this.agentCreator = new DynamicAgentCreator(this);
    }

    loadAgentConfigs() {
        // Load org chart configuration
        const orgChartPath = path.join(__dirname, 'data', 'org-chart.json');
        try {
            const orgData = JSON.parse(fs.readFileSync(orgChartPath, 'utf8'));
            return this.parseOrgChartToAgents(orgData);
        } catch (error) {
            console.log('Warning: Could not load org chart, using defaults');
            return this.getDefaultConfigs();
        }
    }

    parseOrgChartToAgents(orgData) {
        const configs = {
            executive: {
                id: 'executive',
                name: orgData.executive.name,
                role: orgData.executive.role,
                status: 'ACTIVE',
                canSpawn: true,
                maxSubAgents: 4
            },
            agents: []
        };

        if (orgData.agents) {
            orgData.agents.forEach(agent => {
                configs.agents.push({
                    id: agent.id,
                    name: agent.name,
                    role: agent.role,
                    status: agent.status,
                    canSpawn: false,
                    subAgents: agent.subAgents || [],
                    model: agent.model || 'glm5',
                    description: agent.description || ''
                });
            });
        }

        return configs;
    }

    getDefaultConfigs() {
        return {
            executive: {
                id: 'executive',
                name: 'Jerry',
                role: 'Executive Assistant',
                status: 'ACTIVE',
                canSpawn: true,
                maxSubAgents: 4
            },
            agents: [
                {
                    id: 'content-chief',
                    name: 'CC (Content Chief)',
                    role: 'Content & Media',
                    status: 'PLANNED',
                    canSpawn: false,
                    model: 'glm5'
                },
                {
                    id: 'dev-chief',
                    name: 'DC (Dev Chief)',
                    role: 'Engineering & DevOps',
                    status: 'PLANNED',
                    canSpawn: false,
                    model: 'glm5'
                },
                {
                    id: 'ops-chief',
                    name: 'OC (Ops Chief)',
                    role: 'Operations & Client Work',
                    status: 'PLANNED',
                    canSpawn: false,
                    model: 'glm5'
                },
                {
                    id: 'intel-chief',
                    name: 'IC (Intel Chief)',
                    role: 'Research & Intelligence',
                    status: 'PLANNED',
                    canSpawn: false,
                    model: 'glm5'
                }
            ]
        };
    }

    // Simulate agent session creation (since we can't actually spawn)
    createAgentSession(agentId, config) {
        const sessionId = `${agentId}-${Date.now()}`;
        
        const agentSession = {
            id: sessionId,
            agentId: agentId,
            name: config.name,
            role: config.role,
            status: 'CREATED',
            model: config.model || 'glm5',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            tasks: [],
            memory: [],
            metadata: {
                canSpawn: config.canSpawn || false,
                subAgents: config.subAgents || []
            }
        };

        this.agents.set(sessionId, agentSession);
        this.sessionMapping.set(agentId, sessionId);

        console.log(`✅ Agent session created: ${config.name} (${sessionId})`);
        
        return agentSession;
    }

    // Delegate task to specific agent
    async delegateTask(agentId, task) {
        const sessionId = this.sessionMapping.get(agentId);
        
        if (!sessionId) {
            console.log(`⚠️ Agent ${agentId} not found, checking if auto-creation needed...`);
            
            // Check if agent type exists
            const analysis = this.agentCreator.analyzeTaskNeeds(
                task.description || task.type,
                this.agentConfigs.agents
            );
            
            if (analysis.needsNewAgent) {
                console.log('🔧 Creating new agent dynamically...');
                const newAgent = await this.agentCreator.createAgent(
                    task.description || task.type,
                    analysis.suggestedType
                );
                
                agentId = newAgent.agentId;
                console.log(`✅ Created agent: ${newAgent.config.name}`);
            } else {
                // Use existing agent
                const agentConfig = this.agentConfigs.agents.find(a => a.id === agentId);
                if (!agentConfig) {
                    throw new Error(`Agent configuration not found for ${agentId}`);
                }
                this.createAgentSession(agentId, agentConfig);
            }
        }

        const agent = this.agents.get(this.sessionMapping.get(agentId));
        
        const delegation = {
            id: `task-${Date.now()}`,
            agentId: agentId,
            task: task,
            status: 'QUEUED',
            createdAt: new Date().toISOString(),
            priority: task.priority || 'normal'
        };

        agent.tasks.push(delegation);
        this.activeTasks.set(delegation.id, delegation);
        
        console.log(`📋 Task delegated to ${agent.name}: ${task.description || task.type}`);
        
        return delegation;
    }

    // Get agent status
    getAgentStatus(agentId) {
        const sessionId = this.sessionMapping.get(agentId);
        if (!sessionId) return null;
        
        const agent = this.agents.get(sessionId);
        return {
            id: agent.agentId,
            name: agent.name,
            role: agent.role,
            status: agent.status,
            activeTasks: agent.tasks.filter(t => t.status === 'QUEUED' || t.status === 'RUNNING').length,
            completedTasks: agent.tasks.filter(t => t.status === 'COMPLETED').length,
            lastActive: agent.lastActive,
            model: agent.model
        };
    }

    // Get all agents status
    getAllAgentsStatus() {
        const statuses = [];
        
        // Executive status
        statuses.push({
            id: 'executive',
            name: this.agentConfigs.executive.name,
            role: this.agentConfigs.executive.role,
            status: 'ACTIVE',
            activeTasks: this.activeTasks.size,
            model: 'glm5'
        });

        // Other agents
        this.agentConfigs.agents.forEach(agentConfig => {
            const status = this.getAgentStatus(agentConfig.id);
            if (status) {
                statuses.push(status);
            } else {
                statuses.push({
                    id: agentConfig.id,
                    name: agentConfig.name,
                    role: agentConfig.role,
                    status: 'PLANNED',
                    activeTasks: 0,
                    model: agentConfig.model || 'glm5'
                });
            }
        });

        return statuses;
    }

    // Initialize all planned agents
    initializePlannedAgents() {
        console.log('🚀 Initializing planned agents...');
        
        this.agentConfigs.agents.forEach(agentConfig => {
            if (agentConfig.status === 'PLANNED') {
                console.log(`⏳ Creating session for ${agentConfig.name}...`);
                this.createAgentSession(agentConfig.id, agentConfig);
            }
        });

        console.log('✅ All agents initialized');
        
        return this.getAllAgentsStatus();
    }

    // Process task queue (simulate agent work)
    async processTaskQueue() {
        const pendingTasks = Array.from(this.activeTasks.values())
            .filter(t => t.status === 'QUEUED');

        for (const task of pendingTasks) {
            console.log(`🔄 Processing task ${task.id} for agent ${task.agentId}`);
            
            const agent = this.agents.get(this.sessionMapping.get(task.agentId));
            if (agent) {
                task.status = 'RUNNING';
                task.startedAt = new Date().toISOString();
                
                // ACTUAL EXECUTION
                try {
                    const result = await this.taskExecutor.execute(task.agentId, task.task);
                    task.status = 'COMPLETED';
                    task.completedAt = new Date().toISOString();
                    task.result = result;
                    agent.lastActive = new Date().toISOString();
                    
                    console.log(`✅ Task ${task.id} completed`);
                } catch (error) {
                    task.status = 'FAILED';
                    task.error = error.message;
                    console.log(`❌ Task ${task.id} failed: ${error.message}`);
                }
            }
        }
    }

    // Get orchestrator stats
    getStats() {
        return {
            totalAgents: this.agents.size,
            activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'ACTIVE').length,
            plannedAgents: this.agentConfigs.agents.filter(a => a.status === 'PLANNED').length,
            totalTasks: this.activeTasks.size,
            queuedTasks: Array.from(this.activeTasks.values()).filter(t => t.status === 'QUEUED').length,
            runningTasks: Array.from(this.activeTasks.values()).filter(t => t.status === 'RUNNING').length,
            completedTasks: Array.from(this.activeTasks.values()).filter(t => t.status === 'COMPLETED').length
        };
    }
}

module.exports = AgentOrchestrator;