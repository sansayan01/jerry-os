// Dynamic Agent Creation System
// Jerry can spawn new agents based on task requirements

const fs = require('fs');
const path = require('path');

class DynamicAgentCreator {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.agentTemplates = this.loadAgentTemplates();
        this.createdAgents = new Map();
    }

    loadAgentTemplates() {
        return {
            // Base templates for common agent types
            research: {
                name: 'Research Agent',
                capabilities: ['web_search', 'analyze', 'summarize'],
                icon: 'search',
                model: 'glm5',
                taskTypes: ['research', 'investigate', 'explore', 'discover']
            },
            data: {
                name: 'Data Agent',
                capabilities: ['process', 'transform', 'visualize'],
                icon: 'database',
                model: 'glm5',
                taskTypes: ['data', 'analytics', 'metrics', 'statistics']
            },
            communication: {
                name: 'Communication Agent',
                capabilities: ['email', 'messaging', 'notifications'],
                icon: 'message-circle',
                model: 'glm5',
                taskTypes: ['email', 'message', 'notify', 'alert']
            },
            quality: {
                name: 'Quality Agent',
                capabilities: ['test', 'validate', 'review'],
                icon: 'check-circle',
                model: 'glm5',
                taskTypes: ['test', 'validate', 'quality', 'audit']
            },
            security: {
                name: 'Security Agent',
                capabilities: ['scan', 'protect', 'monitor'],
                icon: 'shield',
                model: 'glm5',
                taskTypes: ['security', 'vulnerability', 'protect', 'secure']
            },
            custom: {
                name: 'Custom Agent',
                capabilities: ['generic'],
                icon: 'cpu',
                model: 'glm5',
                taskTypes: []
            }
        };
    }

    // Analyze task to determine if a new agent is needed
    analyzeTaskNeeds(taskDescription, existingAgents) {
        const task = taskDescription.toLowerCase();
        const neededCapabilities = [];
        const taskKeywords = [];

        // Extract keywords from task
        const keywords = task.split(/\s+/).filter(w => w.length > 3);

        // Check if existing agents can handle the task
        const canHandle = existingAgents.some(agent => {
            const agentKeywords = agent.role.toLowerCase().split(/\s+/);
            return keywords.some(kw => agentKeywords.some(ak => ak.includes(kw)));
        });

        if (canHandle) {
            return { needsNewAgent: false };
        }

        // Determine needed capabilities
        if (task.includes('test') || task.includes('validate') || task.includes('quality')) {
            neededCapabilities.push('test', 'validate');
            taskKeywords.push('quality');
        }
        if (task.includes('email') || task.includes('message') || task.includes('notify')) {
            neededCapabilities.push('communication');
            taskKeywords.push('communication');
        }
        if (task.includes('data') || task.includes('analytics') || task.includes('metrics')) {
            neededCapabilities.push('data', 'process');
            taskKeywords.push('data');
        }
        if (task.includes('security') || task.includes('vulnerability') || task.includes('protect')) {
            neededCapabilities.push('security', 'scan');
            taskKeywords.push('security');
        }
        if (task.includes('research') || task.includes('investigate') || task.includes('explore')) {
            neededCapabilities.push('research', 'analyze');
            taskKeywords.push('research');
        }

        return {
            needsNewAgent: true,
            neededCapabilities: neededCapabilities,
            taskKeywords: taskKeywords,
            suggestedType: taskKeywords[0] || 'custom'
        };
    }

    // Create a new agent dynamically
    async createAgent(taskDescription, agentType = null) {
        console.log('🔧 Creating new agent for task:', taskDescription);

        const analysis = this.analyzeTaskNeeds(
            taskDescription, 
            this.orchestrator.agentConfigs.agents
        );

        // Determine agent type
        const type = agentType || analysis.suggestedType || 'custom';
        const template = this.agentTemplates[type] || this.agentTemplates.custom;

        // Generate unique agent ID
        const agentId = `${type}-chief-${Date.now()}`;

        // Create agent configuration
        const agentConfig = {
            id: agentId,
            name: `${template.name} (${agentId})`,
            role: this.inferRole(taskDescription, type),
            description: `Auto-created for: ${taskDescription}`,
            status: 'CREATED',
            canSpawn: false,
            model: template.model,
            icon: template.icon,
            capabilities: template.capabilities,
            taskTypes: template.taskTypes,
            createdAt: new Date().toISOString(),
            createdBy: 'jerry-auto-creation',
            reason: taskDescription
        };

        // Create agent skill file
        const skillFile = this.createAgentSkill(agentConfig);
        agentConfig.skillFile = skillFile;

        // Register with orchestrator
        this.orchestrator.agentConfigs.agents.push(agentConfig);

        // Create session
        const session = this.orchestrator.createAgentSession(agentId, agentConfig);
        this.createdAgents.set(agentId, {
            config: agentConfig,
            session: session,
            skillFile: skillFile
        });

        console.log(`✅ New agent created: ${agentConfig.name}`);

        return {
            agentId: agentId,
            config: agentConfig,
            message: `Created ${agentConfig.name} for: ${taskDescription}`
        };
    }

    // Infer role from task description
    inferRole(taskDescription, type) {
        const task = taskDescription.toLowerCase();
        
        if (type === 'quality') return 'Quality Assurance & Testing';
        if (type === 'communication') return 'Communication & Messaging';
        if (type === 'data') return 'Data Processing & Analytics';
        if (type === 'security') return 'Security & Protection';
        if (type === 'research') return 'Research & Investigation';
        
        // Custom role based on task
        const words = task.split(' ').slice(0, 3).join(' ');
        return `${words.charAt(0).toUpperCase() + words.slice(1)} Specialist`;
    }

    // Create agent skill file
    createAgentSkill(agentConfig) {
        const skillContent = `// ${agentConfig.name} - Auto-generated Skill
// Created: ${agentConfig.createdAt}
// Purpose: ${agentConfig.reason}

class ${this.toPascalCase(agentConfig.id)} {
    constructor() {
        this.id = '${agentConfig.id}';
        this.name = '${agentConfig.name}';
        this.role = '${agentConfig.role}';
        this.capabilities = ${JSON.stringify(agentConfig.capabilities)};
    }

    async execute(task) {
        console.log('🤖 ${agentConfig.name} executing:', task.type);

        switch(task.type) {
            ${this.generateTaskHandlers(agentConfig.taskTypes)}
            default:
                return this.handleGenericTask(task);
        }
    }

    ${this.generateHelperMethods(agentConfig.capabilities)}

    async handleGenericTask(task) {
        console.log('Executing generic task for', this.name);
        
        return {
            status: 'completed',
            result: {
                agent: this.name,
                taskType: task.type,
                completedAt: new Date().toISOString(),
                message: 'Task completed by auto-created agent'
            }
        };
    }
}

module.exports = ${this.toPascalCase(agentConfig.id)};
`;

        // Save skill file
        const skillsDir = path.join(__dirname, 'agent-skills');
        if (!fs.existsSync(skillsDir)) {
            fs.mkdirSync(skillsDir, { recursive: true });
        }

        const skillPath = path.join(skillsDir, `${agentConfig.id}.js`);
        fs.writeFileSync(skillPath, skillContent);

        return skillPath;
    }

    // Generate task handlers for skill
    generateTaskHandlers(taskTypes) {
        return taskTypes.map(type => {
            return `case '${type}':
                return this.handle${this.toPascalCase(type)}(task);`;
        }).join('\n            ');
    }

    // Generate helper methods
    generateHelperMethods(capabilities) {
        return capabilities.map(cap => {
            return `async handle${this.toPascalCase(cap)}(task) {
        console.log('Processing ${cap} task');
        return {
            status: 'completed',
            result: {
                type: '${cap}',
                message: '${cap} processed successfully',
                timestamp: new Date().toISOString()
            }
        };
    }`;
        }).join('\n\n    ');
    }

    // Convert to PascalCase
    toPascalCase(str) {
        return str
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }

    // Get all created agents
    getCreatedAgents() {
        return Array.from(this.createdAgents.values()).map(agent => ({
            id: agent.config.id,
            name: agent.config.name,
            role: agent.config.role,
            reason: agent.config.reason,
            createdAt: agent.config.createdAt,
            skillFile: agent.skillFile
        }));
    }

    // Check if agent type exists
    hasAgentType(type) {
        return this.agentTemplates.hasOwnProperty(type);
    }

    // Get available agent types
    getAvailableTypes() {
        return Object.keys(this.agentTemplates);
    }
}

module.exports = DynamicAgentCreator;