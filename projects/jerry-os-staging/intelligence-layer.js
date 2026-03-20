// Intelligence Layer for Jerry OS
// Smart task routing and decision making

class IntelligenceLayer {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.taskHistory = [];
        this.agentPerformance = new Map();
        this.routingRules = this.initializeRoutingRules();
        this.learningData = {
            successfulRoutes: [],
            failedRoutes: []
        };
    }

    initializeRoutingRules() {
        return {
            // Content-related tasks -> Content Chief
            content: {
                keywords: ['content', 'blog', 'post', 'video', 'youtube', 'social', 'media', 'write', 'article', 'copy'],
                agent: 'content-chief',
                priority: 'normal',
                confidence: 0.85
            },
            // Development tasks -> Dev Chief
            development: {
                keywords: ['code', 'deploy', 'bug', 'feature', 'api', 'server', 'database', 'performance', 'review', 'refactor'],
                agent: 'dev-chief',
                priority: 'normal',
                confidence: 0.85
            },
            // Operations tasks -> Ops Chief
            operations: {
                keywords: ['client', 'project', 'invoice', 'report', 'status', 'deadline', 'track', 'manage', 'schedule'],
                agent: 'ops-chief',
                priority: 'normal',
                confidence: 0.85
            },
            // Intelligence tasks -> Intel Chief
            intelligence: {
                keywords: ['research', 'analyze', 'trend', 'competitor', 'market', 'scan', 'opportunity', 'news', 'monitor'],
                agent: 'intel-chief',
                priority: 'normal',
                confidence: 0.85
            }
        };
    }

    // Main routing function - decides which agent handles the task
    routeTask(taskDescription, context = {}) {
        console.log('🧠 Intelligence Layer: Analyzing task...');
        
        // Parse the task
        const analysis = this.analyzeTask(taskDescription, context);
        
        // Determine best agent
        const agentDecision = this.selectAgent(analysis);
        
        // Calculate priority
        const priority = this.calculatePriority(taskDescription, analysis, context);
        
        // Create routing decision
        const decision = {
            agentId: agentDecision.agentId,
            confidence: agentDecision.confidence,
            priority: priority,
            reasoning: agentDecision.reasoning,
            analysis: analysis,
            alternatives: agentDecision.alternatives,
            timestamp: new Date().toISOString()
        };

        console.log(`✅ Routed to ${agentDecision.agentId} (confidence: ${agentDecision.confidence})`);
        
        // Track for learning
        this.taskHistory.push({
            task: taskDescription,
            decision: decision,
            result: null
        });

        return decision;
    }

    // Analyze task to understand what it needs
    analyzeTask(taskDescription, context) {
        const task = typeof taskDescription === 'string' ? taskDescription : taskDescription.type || '';
        const taskLower = task.toLowerCase();
        
        const analysis = {
            type: 'unknown',
            keywords: [],
            urgency: 'normal',
            complexity: 'medium',
            estimatedTime: 30000, // 30 seconds default
            requiredCapabilities: [],
            context: context
        };

        // Extract keywords
        const words = taskLower.split(/\s+/);
        analysis.keywords = words.filter(w => w.length > 3);

        // Detect task type and required capabilities
        for (const [category, rule] of Object.entries(this.routingRules)) {
            const matchedKeywords = rule.keywords.filter(kw => taskLower.includes(kw));
            
            if (matchedKeywords.length > 0) {
                analysis.type = category;
                analysis.matchedKeywords = matchedKeywords;
                analysis.requiredCapabilities.push(category);
                break;
            }
        }

        // Detect urgency
        if (taskLower.includes('urgent') || taskLower.includes('asap') || taskLower.includes('immediately')) {
            analysis.urgency = 'high';
        } else if (taskLower.includes('when possible') || taskLower.includes('eventually')) {
            analysis.urgency = 'low';
        }

        // Detect complexity
        if (taskLower.includes('simple') || taskLower.includes('quick') || taskLower.includes('minor')) {
            analysis.complexity = 'low';
            analysis.estimatedTime = 10000;
        } else if (taskLower.includes('complex') || taskLower.includes('comprehensive') || taskLower.includes('detailed')) {
            analysis.complexity = 'high';
            analysis.estimatedTime = 60000;
        }

        return analysis;
    }

    // Select the best agent for the task
    selectAgent(analysis) {
        const candidates = [];

        // Check each agent's suitability
        for (const [category, rule] of Object.entries(this.routingRules)) {
            if (analysis.type === category) {
                candidates.push({
                    agentId: rule.agent,
                    confidence: rule.confidence,
                    reasoning: `Task matches ${category} keywords: ${analysis.matchedKeywords?.join(', ')}`,
                    matchType: 'keyword'
                });
            }
        }

        // Consider agent performance history
        candidates.forEach(candidate => {
            const performance = this.agentPerformance.get(candidate.agentId);
            if (performance) {
                // Boost confidence based on past success
                const successRate = performance.successful / (performance.successful + performance.failed);
                candidate.confidence = candidate.confidence * (0.7 + (successRate * 0.3));
                candidate.reasoning += `. Historical success rate: ${(successRate * 100).toFixed(1)}%`;
            }
        });

        // Sort by confidence
        candidates.sort((a, b) => b.confidence - a.confidence);

        if (candidates.length === 0) {
            // Default to ops-chief for unknown tasks
            return {
                agentId: 'ops-chief',
                confidence: 0.5,
                reasoning: 'Default routing for unknown task type',
                alternatives: []
            };
        }

        return {
            agentId: candidates[0].agentId,
            confidence: candidates[0].confidence,
            reasoning: candidates[0].reasoning,
            alternatives: candidates.slice(1, 3)
        };
    }

    // Calculate task priority
    calculatePriority(taskDescription, analysis, context) {
        let priority = 5; // Default medium priority (1-10 scale)

        // Urgency boost
        if (analysis.urgency === 'high') {
            priority += 3;
        } else if (analysis.urgency === 'low') {
            priority -= 2;
        }

        // Complexity adjustment
        if (analysis.complexity === 'high') {
            priority += 1; // Complex tasks get slightly higher priority
        }

        // Context-based adjustments
        if (context.userPriority) {
            priority = Math.max(1, Math.min(10, context.userPriority));
        }

        if (context.deadline) {
            const hoursUntilDeadline = (new Date(context.deadline) - new Date()) / (1000 * 60 * 60);
            if (hoursUntilDeadline < 24) {
                priority += 2;
            }
        }

        // Normalize to 1-10
        priority = Math.max(1, Math.min(10, priority));

        // Convert to priority levels
        if (priority >= 8) return 'critical';
        if (priority >= 6) return 'high';
        if (priority >= 4) return 'normal';
        return 'low';
    }

    // Delegate task with intelligent routing
    async delegateIntelligently(taskDescription, context = {}) {
        // Analyze and route
        const decision = this.routeTask(taskDescription, context);

        // Prepare task payload
        const task = {
            type: this.inferTaskType(taskDescription, decision.analysis),
            description: typeof taskDescription === 'string' ? taskDescription : taskDescription.type,
            priority: decision.priority,
            payload: context.payload || {},
            routingDecision: decision
        };

        // Delegate to selected agent
        const delegation = this.orchestrator.delegateTask(decision.agentId, task);

        return {
            decision: decision,
            delegation: delegation,
            message: `Task routed to ${decision.agentId} with ${decision.priority} priority`
        };
    }

    // Infer task type from description
    inferTaskType(taskDescription, analysis) {
        const task = typeof taskDescription === 'string' ? taskDescription : taskDescription.type || '';
        const taskLower = task.toLowerCase();

        // Determine which agent this is for based on analysis
        const agentId = this.getAgentForType(analysis.type);
        
        // Map keywords to task types
        const typeMappings = {
            'content-chief': {
                'outline': 'generate-outline',
                'blog': 'create-post',
                'video': 'create-post',
                'social': 'create-post',
                'performance': 'analyze-content'
            },
            'dev-chief': {
                'review': 'code-review',
                'deploy': 'deploy',
                'optimize': 'optimize',
                'bug': 'code-review'
            },
            'ops-chief': {
                'report': 'status-report',
                'track': 'track-project',
                'invoice': 'send-invoice',
                'status': 'status-report'
            },
            'intel-chief': {
                'trend': 'scan-trends',
                'competitor': 'analyze-competitor',
                'opportunity': 'opportunity-scan',
                'research': 'scan-trends'
            }
        };

        // Find matching task type
        const agentTypes = typeMappings[agentId] || {};
        for (const [keyword, type] of Object.entries(agentTypes)) {
            if (taskLower.includes(keyword)) {
                return type;
            }
        }

        // Default to generic type
        return 'generic-task';
    }

    getAgentForType(type) {
        const typeToAgent = {
            'content': 'content-chief',
            'development': 'dev-chief',
            'operations': 'ops-chief',
            'intelligence': 'intel-chief'
        };
        return typeToAgent[type] || 'ops-chief';
    }

    // Learn from task results
    learnFromResult(taskId, success) {
        const historyEntry = this.taskHistory.find(h => h.decision?.taskId === taskId);
        
        if (historyEntry) {
            historyEntry.result = {
                success: success,
                timestamp: new Date().toISOString()
            };

            // Update agent performance
            const agentId = historyEntry.decision.agentId;
            if (!this.agentPerformance.has(agentId)) {
                this.agentPerformance.set(agentId, { successful: 0, failed: 0 });
            }
            
            const perf = this.agentPerformance.get(agentId);
            if (success) {
                perf.successful++;
                this.learningData.successfulRoutes.push(historyEntry);
            } else {
                perf.failed++;
                this.learningData.failedRoutes.push(historyEntry);
            }

            console.log(`📚 Learned from ${success ? 'success' : 'failure'} for ${agentId}`);
        }
    }

    // Get routing statistics
    getStats() {
        const totalTasks = this.taskHistory.length;
        const successfulTasks = this.taskHistory.filter(h => h.result?.success).length;
        
        const agentStats = {};
        for (const [agentId, perf] of this.agentPerformance.entries()) {
            agentStats[agentId] = {
                ...perf,
                successRate: perf.successful / (perf.successful + perf.failed)
            };
        }

        return {
            totalTasksRouted: totalTasks,
            successfulRoutes: successfulTasks,
            successRate: totalTasks > 0 ? successfulTasks / totalTasks : 0,
            agentPerformance: agentStats,
            learningDataSize: this.learningData.successfulRoutes.length + this.learningData.failedRoutes.length
        };
    }

    // Get routing recommendations
    getRecommendations() {
        const stats = this.getStats();
        const recommendations = [];

        // Identify best performing agent
        let bestAgent = null;
        let bestRate = 0;
        
        for (const [agentId, perf] of Object.entries(stats.agentPerformance)) {
            if (perf.successRate > bestRate) {
                bestRate = perf.successRate;
                bestAgent = agentId;
            }
        }

        if (bestAgent) {
            recommendations.push({
                type: 'performance',
                message: `${bestAgent} has highest success rate (${(bestRate * 100).toFixed(1)}%)`,
                priority: 'info'
            });
        }

        // Identify routing patterns
        const categoryCount = {};
        this.taskHistory.forEach(h => {
            const category = h.decision?.analysis?.type || 'unknown';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const mostCommonCategory = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (mostCommonCategory) {
            recommendations.push({
                type: 'pattern',
                message: `Most common task type: ${mostCommonCategory[0]} (${mostCommonCategory[1]} tasks)`,
                priority: 'info'
            });
        }

        return recommendations;
    }
}

module.exports = IntelligenceLayer;