// Dynamic Data Generator for Jerry OS
// Generates realistic dynamic data based on system state and time

class DynamicDataManager {
    constructor() {
        this.startTime = Date.now();
        this.requestCount = 0;
        this.lastSessionActivity = Date.now();
        this.updateInterval = null;
    }

    start() {
        // Update dynamic data every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
        }, 30000);
    }

    updateMetrics() {
        this.requestCount++;
        this.lastSessionActivity = Date.now() - Math.random() * 3600000; // Random activity in last hour
    }

    getModels() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        return {
            models: [
                {
                    name: 'deepseek-v3.1',
                    provider: 'nvidia/deepseek-ai',
                    status: 'online',
                    configured: true,
                    lastUsed: new Date(Date.now() - Math.random() * 1800000).toISOString(),
                    uptime: `${hours}h ${minutes}m`,
                    requests: this.requestCount + Math.floor(Math.random() * 50)
                },
                {
                    name: 'glm5',
                    provider: 'nvidia/z-ai',
                    status: 'standby',
                    configured: true,
                    lastUsed: new Date(Date.now() - Math.random() * 7200000).toISOString(),
                    uptime: `${hours}h ${minutes}m`,
                    requests: Math.floor(Math.random() * 20)
                },
                {
                    name: 'kimi-k2-instruct',
                    provider: 'nvidia/moonshotai',
                    status: Math.random() > 0.7 ? 'offline' : 'standby',
                    configured: false,
                    lastUsed: null,
                    uptime: '0h 0m',
                    requests: 0
                }
            ]
        };
    }

    getSessions() {
        const sessions = [
            {
                id: 'main',
                label: 'Jerry OS Main',
                kind: 'agent',
                agent: 'agent:main:main',
                channel: 'webchat',
                model: 'nvidia/z-ai/glm5',
                tokens: this.formatTokens(Math.floor(Math.random() * 50000) + 30000),
                active: true,
                updated: Date.now() - Math.floor(Math.random() * 300000)
            }
        ];

        // Add more sessions based on request count
        if (this.requestCount > 5) {
            sessions.push({
                id: 'lab-' + Math.floor(Math.random() * 1000),
                label: 'Lab Testing',
                kind: 'agent',
                agent: 'agent:lab:test',
                channel: 'webchat',
                model: 'nvidia/deepseek-ai/deepseek-v3.1',
                tokens: this.formatTokens(Math.floor(Math.random() * 20000) + 10000),
                active: Math.random() > 0.5,
                updated: Date.now() - Math.floor(Math.random() * 600000)
            });
        }

        return { sessions };
    }

    getCrons() {
        const now = new Date();
        const cronJobs = [
            {
                name: 'GitHub Backup',
                schedule: '0 2 * * *',
                enabled: true,
                status: 'healthy',
                lastRun: this.getLastRunTime(2),
                nextRun: this.getNextRunTime(2)
            },
            {
                name: 'Self-Improvement Build',
                schedule: '0 3 * * *',
                enabled: true,
                status: 'idle',
                lastRun: this.getLastRunTime(3),
                nextRun: this.getNextRunTime(3)
            },
            {
                name: 'Daily Brief',
                schedule: '0 6 * * *',
                enabled: true,
                status: 'scheduled',
                lastRun: this.getLastRunTime(6),
                nextRun: this.getNextRunTime(6)
            },
            {
                name: 'OS Documentation',
                schedule: '0 0 * * *',
                enabled: true,
                status: 'idle',
                lastRun: this.getLastRunTime(0),
                nextRun: this.getNextRunTime(0)
            }
        ];

        return cronJobs;
    }

    formatTokens(tokens) {
        if (tokens >= 1000) {
            return (tokens / 1000).toFixed(1) + 'k';
        }
        return tokens.toString();
    }

    getLastRunTime(hour) {
        const now = new Date();
        const currentHour = now.getHours();

        // Calculate last run date
        const lastRun = new Date(now);
        lastRun.setHours(hour, 0, 0, 0);

        // If scheduled time hasn't happened yet today, last run was yesterday
        if (currentHour < hour) {
            lastRun.setDate(lastRun.getDate() - 1);
        }

        // Manual date formatting to avoid timezone issues
        const year = lastRun.getFullYear();
        const month = String(lastRun.getMonth() + 1).padStart(2, '0');
        const day = String(lastRun.getDate()).padStart(2, '0');
        const hourStr = String(lastRun.getHours()).padStart(2, '0');
        const minuteStr = String(lastRun.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hourStr}:${minuteStr}`;
    }

    getNextRunTime(hour) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Calculate next run date
        const nextRun = new Date(now);
        nextRun.setHours(hour, 0, 0, 0);

        // If current time is at or past the scheduled hour, schedule for next day
        if (currentHour >= hour) {
            nextRun.setDate(nextRun.getDate() + 1);
        }

        // Manual date formatting to avoid timezone issues
        const year = nextRun.getFullYear();
        const month = String(nextRun.getMonth() + 1).padStart(2, '0');
        const day = String(nextRun.getDate()).padStart(2, '0');
        const hourStr = String(nextRun.getHours()).padStart(2, '0');
        const minuteStr = String(nextRun.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hourStr}:${minuteStr}`;
    }

    getLabData() {
        return {
            prototypes: [
                {
                    id: 'jerry-os-core',
                    name: 'Jerry OS Core',
                    icon: 'cpu',
                    status: 'active',
                    desc: 'Main executive interface system',
                    port: 8950,
                    started: '2h ago'
                },
                {
                    id: 'model-switcher',
                    name: 'Model Switcher',
                    icon: 'brain-circuit',
                    status: 'idle',
                    desc: 'Multi-model coordination interface',
                    port: 8960,
                    started: 'Ready'
                },
                {
                    id: 'cron-monitor',
                    name: 'Cron Monitor',
                    icon: 'clock',
                    status: 'developing',
                    desc: 'Overnight build tracking system',
                    port: 8970,
                    started: 'N/A'
                }
            ],
            builds: [
                {
                    name: 'Nightly System Scan',
                    time: '06:00 AM',
                    status: 'success',
                    icon: 'check-circle',
                    desc: 'Completed security and performance scan'
                },
                {
                    name: 'Database Backup',
                    time: '04:30 AM',
                    status: 'warning',
                    icon: 'alert-circle',
                    desc: 'Partial completion - storage limit reached'
                },
                {
                    name: 'Memory Optimization',
                    time: '03:15 AM',
                    status: 'success',
                    icon: 'check-circle',
                    desc: 'Successfully optimized workspace memory'
                }
            ],
            improvements: [
                {
                    name: 'SSE Optimization',
                    icon: 'zap',
                    progress: 85,
                    desc: 'Real-time update performance enhancement'
                },
                {
                    name: 'Memory Compression',
                    icon: 'database',
                    progress: 60,
                    desc: 'Reduce workspace memory footprint'
                },
                {
                    name: 'Boot Time Reduction',
                    icon: 'rocket',
                    progress: 45,
                    desc: 'Faster system initialization sequence'
                }
            ],
            metrics: {
                uptime: '99.9%',
                responseTime: '154ms',
                dailyRequests: 1240 + Math.floor(Math.random() * 100)
            }
        };
    }

    getOrgChart() {
        const now = Date.now();
        const uptime = Math.floor((now - this.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        // Dynamic activity messages
        const activities = [
            `Optimizing system performance (${Math.floor(Math.random() * 100)}% efficiency)`,
            `Processing ${Math.floor(Math.random() * 1000)} tasks daily`,
            `Monitoring ${Math.floor(Math.random() * 50)} active sessions`,
            `Managing ${Math.floor(Math.random() * 20)} concurrent workflows`,
            `Analyzing ${Math.floor(Math.random() * 5000)} data points`
        ];

        // Load created agents from agent creator
        let createdAgents = [];
        try {
            const AgentCreator = require('./dynamic-agent-creator.js');
            if (global.createdAgentsList) {
                createdAgents = global.createdAgentsList;
            }
        } catch (e) {
            console.log('No dynamically created agents found');
        }

        // All agents under Jerry's direct supervision
        const allAgents = [
            {
                id: 'content-chief',
                name: 'CC (Content Chief)',
                role: 'Content & Media',
                description: 'Manages YouTube, blog posts, social media, bootcamp materials.',
                icon: 'megaphone',
                status: 'PLANNED',
                category: 'primary',
                subAgents: [
                    {
                        id: 'content-sub-1',
                        name: 'Video Editor AI',
                        role: 'Final Cut & B-Roll',
                        icon: 'film',
                        activity: 'Processing video footage',
                        status: 'PLANNED'
                    },
                    {
                        id: 'content-sub-2',
                        name: 'Copywriter AI',
                        role: 'Scripts & Blogs',
                        icon: 'pen-tool',
                        activity: 'Drafting new content',
                        status: 'PLANNED'
                    },
                    {
                        id: 'content-sub-3',
                        name: 'Social Manager',
                        role: 'Engagement & Scheduling',
                        icon: 'share-2',
                        activity: 'Scheduling posts',
                        status: 'PLANNED'
                    }
                ],
                activity: activities[Math.floor(Math.random() * activities.length)],
                model: 'glm5',
                performance: Math.floor(Math.random() * 100) + '%',
                lastActive: new Date(now - Math.random() * 3600000).toISOString(),
                managedBy: 'jerry'
            },
            {
                id: 'dev-chief',
                name: 'DC (Dev Chief)',
                role: 'Engineering & DevOps',
                description: 'Code quality, deployments, infrastructure, Jerry-OS development.',
                icon: 'code-2',
                status: 'PLANNED',
                category: 'primary',
                subAgents: [
                    {
                        id: 'dev-sub-1',
                        name: 'Frontend Agent',
                        role: 'UI/UX & React',
                        icon: 'palette',
                        activity: 'Designing interfaces',
                        status: 'PLANNED'
                    },
                    {
                        id: 'dev-sub-2',
                        name: 'Backend Architect',
                        role: 'APIs & Databases',
                        icon: 'server',
                        activity: 'Optimizing queries',
                        status: 'PLANNED',
                        model: 'glm5'
                    },
                    {
                        id: 'dev-sub-3',
                        name: 'DevOps Bot',
                        role: 'CI/CD & Cloud',
                        icon: 'cloud-lightning',
                        activity: 'Managing deployments',
                        status: 'PLANNED',
                        model: 'glm5'
                    }
                ],
                activity: activities[Math.floor(Math.random() * activities.length)],
                model: 'glm5',
                performance: Math.floor(Math.random() * 100) + '%',
                lastActive: new Date(now - Math.random() * 3600000).toISOString(),
                managedBy: 'jerry'
            },
            {
                id: 'ops-chief',
                name: 'OC (Ops Chief)',
                role: 'Operations & Client Work',
                description: 'Client project management, invoicing, task delegation, SLA tracking.',
                icon: 'shield',
                status: 'PLANNED',
                category: 'primary',
                subAgents: [
                    {
                        id: 'ops-sub-1',
                        name: 'Project Manager',
                        role: 'SLA & Milestones',
                        icon: 'calendar',
                        activity: 'Tracking deadlines',
                        status: 'PLANNED'
                    },
                    {
                        id: 'ops-sub-2',
                        name: 'Billing Agent',
                        role: 'Invoices & Stripe',
                        icon: 'credit-card',
                        activity: 'Processing payments',
                        status: 'PLANNED'
                    }
                ],
                activity: activities[Math.floor(Math.random() * activities.length)],
                model: 'glm5',
                performance: Math.floor(Math.random() * 100) + '%',
                lastActive: new Date(now - Math.random() * 3600000).toISOString(),
                managedBy: 'jerry'
            },
            {
                id: 'intel-chief',
                name: 'IC (Intel Chief)',
                role: 'Research & Intelligence',
                description: 'AI industry monitoring, competitive intelligence, opportunity scanning.',
                icon: 'brain-circuit',
                status: 'PLANNED',
                category: 'primary',
                subAgents: [
                    {
                        id: 'intel-sub-1',
                        name: 'Trend Spotter',
                        role: 'X/Twitter & News',
                        icon: 'search',
                        activity: 'Monitoring trends',
                        status: 'PLANNED'
                    },
                    {
                        id: 'intel-sub-2',
                        name: 'Market Analyst',
                        role: 'Growth & ROI',
                        icon: 'trending-up',
                        activity: 'Analyzing metrics',
                        status: 'PLANNED'
                    }
                ],
                activity: activities[Math.floor(Math.random() * activities.length)],
                model: 'glm5',
                performance: Math.floor(Math.random() * 100) + '%',
                lastActive: new Date(now - Math.random() * 3600000).toISOString(),
                managedBy: 'jerry'
            }
        ];

        // Add dynamically created agents as direct agents under Jerry
        if (createdAgents && createdAgents.length > 0) {
            createdAgents.forEach(agent => {
                allAgents.push({
                    id: agent.id,
                    name: agent.name,
                    role: agent.role,
                    description: agent.reason || 'Dynamically created agent',
                    icon: agent.icon || 'cpu',
                    status: 'CREATED',
                    category: 'dynamic',
                    subAgents: [],
                    activity: agent.reason || 'Specialized task handling',
                    model: agent.model || 'glm5',
                    performance: '100%',
                    lastActive: agent.createdAt,
                    dynamicallyCreated: true,
                    capabilities: agent.capabilities || [],
                    managedBy: 'jerry'
                });
            });
        }

        // Calculate total agents (primary + sub-agents + dynamic)
        const primaryAgents = allAgents.length;
        const totalSubAgents = allAgents.reduce((sum, agent) => sum + (agent.subAgents ? agent.subAgents.length : 0), 0);
        const dynamicAgents = createdAgents.length;
        const totalAgents = primaryAgents + totalSubAgents;

        return {
            // Director (Human)
            director: {
                id: 'director',
                name: 'Sayan',
                role: 'Founder, Rapid Crafters, Final authority on all decisions.',
                badge: 'The Human',
                icon: 'crown',
                model: 'glm5',
                lastActive: new Date().toISOString(),
                systemUptime: `${hours}h ${minutes}m`
            },
            
            // Jerry - The Central Hub (OpenClaw)
            executive: {
                id: 'jerry-openclaw',
                name: 'Jerry (OpenClaw)',
                role: 'Central Coordinator - Manages ALL agents and sub-agents. Orchestration layer for the entire Jerry-OS system.',
                badge: 'Executive Assistant',
                icon: 'bot',
                status: 'ACTIVE',
                stats: [
                    `${this.requestCount} Requests Processed`,
                    `${hours}h ${minutes}m Uptime`,
                    `${totalAgents} Agents Managed`,
                    '24/7 Monitoring'
                ],
                model: 'glm5',
                performance: '100%',
                lastActive: new Date().toISOString(),
                capabilities: [
                    'Intelligent Task Routing',
                    'Dynamic Agent Creation',
                    'Real-time Orchestration',
                    'Self-Improvement'
                ],
                // Jerry directly manages ALL agents
                managesAllAgents: true,
                totalAgentsManaged: totalAgents
            },
            
            // All agents under Jerry's direct supervision
            agents: allAgents,
            
            // Complete statistics
            stats: {
                total: totalAgents,
                primary: primaryAgents,
                subAgents: totalSubAgents,
                dynamicallyCreated: dynamicAgents,
                active: 1, // Jerry is always active
                planned: totalAgents - dynamicAgents - 1,
                systemUptime: `${hours}h ${minutes}m`,
                totalRequests: this.requestCount,
                lastUpdated: new Date().toISOString(),
                hierarchy: 'Jerry (OpenClaw) manages ALL agents and sub-agents directly'
            }
        };
    }
}

module.exports = DynamicDataManager;
