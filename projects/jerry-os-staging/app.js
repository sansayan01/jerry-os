// Jerry OS - Main Application Logic (Premium Edition)

class JerryOS {
    constructor() {
        this.currentModule = 'ops';
        this.modules = ['ops', 'brain', 'lab'];
        this.draggedTab = null;
        this.promptHistory = [];
        this.lastRefreshTime = null;
        this.init();
    }

    init() {
        this.setupMCDock();
        this.setupSidebar();
        this.setupClock();
        this.setupBrainTabs();
        this.setupMCTabs();
        this.loadMissionControlData();
        this.startDataRefresh();
        this.startRefreshTimer();
    }

    // ═══════════════════════════════════════════════
    //  GREETING & CLOCK
    // ═══════════════════════════════════════════════

    // ═══════════════════════════════════════════════
    //  MC TABS & DOCK
    // ═══════════════════════════════════════════════

    setupMCTabs() {
        const tabs = document.querySelectorAll('.mc-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.mc-tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                const targetId = `mc-${tab.dataset.mcTab}`;
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('active');
                    if (targetId === 'mc-org-chart') {
                        this.loadOrgChart();
                    }
                }
            });
        });

        // Refresh timer click
        const refreshTimer = document.getElementById('mc-refresh-timer');
        if (refreshTimer) {
            refreshTimer.addEventListener('click', () => {
                refreshTimer.classList.add('refreshing');
                this.loadMissionControlData();
                setTimeout(() => refreshTimer.classList.remove('refreshing'), 800);
            });
        }
    }

    setupMCDock() {
        const dockItems = document.querySelectorAll('.mc-dock-item');
        dockItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleName = item.dataset.module;
                this.switchModule(moduleName);

                // Update dock active state
                dockItems.forEach(d => d.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    startRefreshTimer() {
        setInterval(() => {
            const timerText = document.getElementById('mc-timer-text');
            if (!timerText || !this.lastRefreshTime) return;

            const elapsed = Math.floor((Date.now() - this.lastRefreshTime) / 1000);
            if (elapsed < 60) {
                timerText.textContent = `${elapsed}s ago`;
            } else {
                timerText.textContent = `${Math.floor(elapsed / 60)}m ago`;
            }
        }, 1000);
    }

    setupClock() {
        const clockEl = document.getElementById('live-clock');
        if (!clockEl) return;

        const updateClock = () => {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    setupRefreshButton() {
        // Legacy refresh button - now handled by MC timer
    }

    // ═══════════════════════════════════════════════
    //  SIDEBAR NAVIGATION
    // ═══════════════════════════════════════════════

    setupSidebar() {
        const sidebarItems = document.querySelectorAll('.sidebar-item[data-module]');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleName = item.dataset.module;
                this.switchModule(moduleName);

                // Update sidebar active state
                document.querySelectorAll('.sidebar-item[data-module]').forEach(si => {
                    si.classList.remove('active');
                });
                item.classList.add('active');
            });
        });
    }

    refreshMissionControl() {
        if (this.currentModule === 'ops') {
            this.loadModelInfo();
            this.loadActiveSessions();
            this.loadCronHealth();
        }
    }

    // ═══════════════════════════════════════════════
    //  TAB BAR
    // ═══════════════════════════════════════════════

    setupTabBar() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (!this.isDragging) {
                    const moduleName = tab.dataset.module;
                    this.switchModule(moduleName);
                }
            });
        });
    }

    setupTabDragging() {
        const tabs = document.querySelectorAll('.tab');
        let startX, startY;

        tabs.forEach(tab => {
            tab.setAttribute('draggable', true);

            tab.addEventListener('dragstart', (e) => {
                this.draggedTab = tab;
                this.isDragging = true;
                tab.classList.add('dragging');
                startX = e.clientX;
                startY = e.clientY;
                e.dataTransfer.effectAllowed = 'move';
            });

            tab.addEventListener('dragend', () => {
                this.draggedTab = null;
                setTimeout(() => {
                    this.isDragging = false;
                }, 100);
                tab.classList.remove('dragging');
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('drag-over'));
            });

            tab.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (this.draggedTab && this.draggedTab !== tab) {
                    tab.classList.add('drag-over');
                }
            });

            tab.addEventListener('dragleave', () => {
                tab.classList.remove('drag-over');
            });

            tab.addEventListener('drop', (e) => {
                e.preventDefault();
                if (this.draggedTab && this.draggedTab !== tab) {
                    const tabBar = document.querySelector('.tab-bar');
                    const draggedIndex = Array.from(tabs).indexOf(this.draggedTab);
                    const targetIndex = Array.from(tabs).indexOf(tab);

                    if (draggedIndex < targetIndex) {
                        tabBar.insertBefore(this.draggedTab, tab.nextSibling);
                    } else {
                        tabBar.insertBefore(this.draggedTab, tab);
                    }
                }
                tab.classList.remove('drag-over');
            });
        });
    }

    // ═══════════════════════════════════════════════
    //  MODULE SWITCHING
    // ═══════════════════════════════════════════════

    switchModule(moduleName) {
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.module === moduleName) {
                tab.classList.add('active');
            }
        });

        // Update dock (new mc-dock)
        document.querySelectorAll('.mc-dock-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            }
        });

        // Update legacy dock
        document.querySelectorAll('.dock-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            }
        });

        // Update sidebar
        document.querySelectorAll('.sidebar-item[data-module]').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            }
        });

        // Update modules
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });

        const targetModule = document.getElementById(`${moduleName}-module`);
        if (targetModule) {
            targetModule.classList.add('active');
        }

        this.currentModule = moduleName;

        // Load module-specific data
        if (moduleName === 'ops') {
            this.loadMissionControlData();
        } else if (moduleName === 'lab' && window.labManager) {
            window.labManager.init();
        }

        // Re-init Lucide icons for dynamically added content
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // ═══════════════════════════════════════════════
    //  PROMPT INTERFACE
    // ═══════════════════════════════════════════════

    async sendPrompt() {
        const input = document.getElementById('prompt-input');
        const history = document.getElementById('prompt-history');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'prompt-message user';
        userMsg.innerHTML = `
            <div class="message-content">${this.escapeHtml(message)}</div>
            <div class="message-meta">
                <span>${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
        history.appendChild(userMsg);
        input.value = '';
        history.scrollTop = history.scrollHeight;

        // Show typing animation
        const typingEl = document.createElement('div');
        typingEl.className = 'prompt-message jerry';
        typingEl.innerHTML = `<div class="message-content" style="opacity:0.5">Jerry is thinking...</div>`;
        history.appendChild(typingEl);
        history.scrollTop = history.scrollHeight;

        // Simulate response (replace with real API in production)
        try {
            const response = await fetch('/api/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await response.json();

            typingEl.remove();

            const jerryMsg = document.createElement('div');
            jerryMsg.className = 'prompt-message jerry';
            jerryMsg.innerHTML = `
                <div class="message-content">${data.result?.response || 'I received your message.'}</div>
                <div class="message-meta">
                    <span>Jerry</span>
                    <span>•</span>
                    <span>${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            `;
            history.appendChild(jerryMsg);
        } catch (error) {
            typingEl.remove();

            const jerryMsg = document.createElement('div');
            jerryMsg.className = 'prompt-message jerry';
            
            // Better response for offline mode
            const responses = [
                "I've processed your message and will handle it accordingly.",
                "Message received! I'm here to help with your executive tasks.",
                "I understand your request and will assist you with that.",
                "Thank you for the message. I'm ready to help you manage the system.",
                "I've got that. Let me know how else I can assist you today."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            jerryMsg.innerHTML = `
                <div class="message-content">${randomResponse}</div>
                <div class="message-meta">
                    <span>Jerry</span>
                    <span>•</span>
                    <span>${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            `;
            history.appendChild(jerryMsg);
        }

        history.scrollTop = history.scrollHeight;
        if (window.lucide) lucide.createIcons();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ═══════════════════════════════════════════════
    //  MISSION CONTROL DATA
    // ═══════════════════════════════════════════════

    async loadOrgChart() {
        try {
            const response = await fetch('/api/org-chart');
            const data = await response.json();
            if (data.status === 'ok') {
                window.currentOrgData = data.result; // Cache for sub-agent data
                this.renderOrgChart(data.result);
                // Initialize panning & shortcuts
                this.setupWhiteboardPanning();
                if (!this.keysInitialized) {
                    this.setupKeyboardShortcuts();
                    this.keysInitialized = true;
                }
            }
        } catch (error) {
            console.error('Failed to load org chart:', error);
        }
    }

    renderOrgChart(data) {
        const container = document.getElementById('mc-org-pane');
        if (!container) return;

        // Human & Executive section
        let html = `
            <div class="premium-org-container">
                <div class="org-tree-header">
                    <div class="org-node node-director glass" data-id="director" data-name="${data.director.name.toLowerCase()}">
                        <div class="node-glow cyan"></div>
                        <div class="node-main">
                            <div class="node-icon"><i data-lucide="${data.director.icon || 'crown'}"></i></div>
                            <div class="node-content">
                                <span class="node-label">Director</span>
                                <h3 class="node-name">${data.director.name}</h3>
                                <p class="node-meta">${data.director.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="org-connector vertical"></div>

                <div class="org-tree-exec">
                    <div class="org-node node-executive glass active" data-id="executive" data-name="${data.executive.name.toLowerCase()}">
                        <div class="node-glow amber"></div>
                        <div class="node-main">
                            <div class="node-icon"><i data-lucide="${data.executive.icon || 'bot'}"></i></div>
                            <div class="node-content">
                                <div class="node-title-row">
                                    <span class="node-label">Executive</span>
                                    <div class="node-status-chip active">
                                        <span class="status-dot"></span>
                                        ${data.executive.status || 'ONLINE'}
                                    </div>
                                </div>
                                <h3 class="node-name">${data.executive.name}</h3>
                                <p class="node-meta">${data.executive.role}</p>
                            </div>
                        </div>
                        <div class="node-footer">
                            <div class="node-stats">
                                <span class="stat-tag"><i data-lucide="activity"></i> 100% Load</span>
                                <span class="stat-tag"><i data-lucide="zap"></i> Fast-Track</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="org-branching-system">
                    <div class="branch-span"></div>
                    <div class="branch-stems">
                        ${data.agents.map(() => `<div class="branch-stem"></div>`).join('')}
                    </div>
                </div>

                <div class="org-tree-agents">
                    <div class="agents-row">
                        ${data.agents.map(agent => {
                            const heatLevel = this.getHeatLevel(agent);
                            return `
                            <div class="org-node node-agent glass ${agent.status === 'ACTIVE' ? 'is-active' : ''}" data-id="${agent.id}" data-heat="${heatLevel}" data-name="${agent.name.toLowerCase()}">
                                ${agent.status === 'ACTIVE' ? '<div class="pulse-overlay"></div>' : ''}
                                <div class="node-main">
                                    <div class="node-icon"><i data-lucide="${agent.icon || 'cpu'}"></i></div>
                                    <div class="node-content">
                                        <h3 class="node-name">${agent.name}</h3>
                                        <p class="node-label-small">${agent.role}</p>
                                    </div>
                                    <div class="node-status-mini ${agent.status ? agent.status.toLowerCase() : 'planned'}">
                                        <span class="status-dot"></span>
                                        <span class="heat-badge ${heatLevel}">${heatLevel}</span>
                                    </div>
                                </div>
                                <div class="node-body">
                                    <p class="node-desc-compact">${agent.description || ''}</p>
                                </div>
                                <div class="node-footer-mini">
                                    <div class="sub-count interactive">
                                        <i data-lucide="layers"></i>
                                        <span>${agent.subAgentsCount || 0} Modules</span>
                                        <i data-lucide="chevron-down" class="dropdown-icon"></i>
                                    </div>
                                    <div class="node-level-tag">L3</div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Add event listeners to nodes
        container.querySelectorAll('.org-node').forEach(node => {
            node.addEventListener('click', (e) => {
                const agentId = node.dataset.id;
                
                // Toggle sub-agents if clicking the interactive badge
                if (e.target.closest('.sub-count.interactive')) {
                    e.stopPropagation();
                    this.toggleSubAgents(agentId, node);
                    return;
                }
                
                // Find agent data
                let agent = null;
                if (agentId === 'director') agent = window.currentOrgData.director;
                else if (agentId === 'executive') agent = window.currentOrgData.executive;
                else agent = window.currentOrgData.agents.find(a => a.id === agentId);
                
                if (agent) this.openDossier(agent);
            });
        });

        // Re-init icons and UI helpers
        if (window.lucide) {
            lucide.createIcons();
            this.setupZoomButtons();
            this.updateAnalytics();
            this.updateMinimap();
        }
    }

    toggleSubAgents(agentId, node) {
        let subGrid = node.querySelector('.sub-agents-drawer');
        if (!subGrid) {
            const agent = window.currentOrgData.agents.find(a => a.id === agentId);
            if (!agent || !agent.subAgents) return;

            subGrid = document.createElement('div');
            subGrid.className = 'sub-agents-drawer active';
            subGrid.innerHTML = `
                <div class="sub-connector"></div>
                <div class="sub-grid">
                    ${agent.subAgents.map(sub => `
                        <div class="sub-agent-micro-card" data-id="${sub.id}">
                            <i data-lucide="${sub.icon}"></i>
                            <div class="sub-info">
                                <span class="sub-name">${sub.name}</span>
                                <span class="sub-role">${sub.role}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            node.appendChild(subGrid);
            lucide.createIcons();

            // Add listeners to new sub-agent cards
            subGrid.querySelectorAll('.sub-agent-micro-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const subId = card.dataset.id;
                    const subAgent = agent.subAgents.find(s => s.id === subId);
                    if (subAgent) this.openDossier(subAgent);
                });
            });
        } else {
            subGrid.classList.toggle('active');
        }
    }

    openDossier(agent) {
        const sidebar = document.getElementById('agent-dossier-sidebar');
        const content = document.getElementById('dossier-content');
        if (!sidebar || !content) return;

        content.innerHTML = `
            <div class="dossier-profile-card">
                <div class="dossier-avatar pulse"><i data-lucide="${agent.icon || 'user'}"></i></div>
                <h2>${agent.name}</h2>
                <div class="dossier-tag">${agent.role}</div>
            </div>
            
            <div class="dossier-stats-row">
                <div class="stat-box">
                    <span class="stat-val">${agent.status || 'PLANNED'}</span>
                    <span class="stat-lbl">Status</span>
                </div>
                <div class="stat-box">
                    <span class="stat-val">99.9%</span>
                    <span class="stat-lbl">Reliability</span>
                </div>
            </div>

            <div class="dossier-section">
                <h3>Core Intelligence</h3>
                <p>${agent.description || 'Primary directive for ' + agent.name + '.'}</p>
            </div>

            ${agent.activity ? `
                <div class="dossier-section activity-box">
                    <h3>Current Status Pulse</h3>
                    <div class="status-indicator active"></div>
                    <p class="activity-msg">"${agent.activity}"</p>
                </div>
            ` : ''}

            <div class="dossier-footer-actions">
                <button class="action-btn-outline" onclick="window.jerryOS.editAgent('${agent.id}')">
                    <i data-lucide="edit-3"></i> Edit
                </button>
                ${agent.status === 'PLANNED' ? `
                    <button class="action-btn-primary" onclick="window.jerryOS.hireAgent('${agent.id}')"><i data-lucide="user-plus"></i> Hire</button>
                ` : `
                    <button class="action-btn-outline" onclick="window.jerryOS.viewAgentLogs('${agent.id}')"><i data-lucide="activity"></i> Logs</button>
                `}
                <button class="action-btn-cyan" onclick="window.jerryOS.cloneAgent('${agent.id}')">
                    <i data-lucide="copy"></i> Clone
                </button>
            </div>

            <div class="snapshot-section">
                <h4>Snapshot & Restore</h4>
                <p class="snapshot-info">Save or restore the agent's current config.</p>
                <div class="dossier-footer-actions">
                    <button class="action-btn-outline" onclick="window.jerryOS.saveSnapshot('${agent.id}')">
                        <i data-lucide="save"></i> Save
                    </button>
                    <button class="action-btn-outline" onclick="window.jerryOS.restoreSnapshot('${agent.id}')">
                        <i data-lucide="rotate-ccw"></i> Restore
                    </button>
                </div>
            </div>
        `;

        sidebar.classList.add('active');
        lucide.createIcons();
    }

    findAgentById(agentId) {
        if (!window.currentOrgData) return null;
        const data = window.currentOrgData;
        if (agentId === 'director') return data.director;
        if (agentId === 'executive') return data.executive;
        
        for (const agent of data.agents) {
            if (agent.id === agentId) return agent;
            if (agent.subAgents) {
                const sub = agent.subAgents.find(s => s.id === agentId);
                if (sub) return sub;
            }
        }
        return null;
    }

    editAgent(agentId) {
        const content = document.getElementById('dossier-content');
        if (!content || !window.currentOrgData) return;

        // Find agent
        const agent = this.findAgentById(agentId);
        if (!agent) return;
        const isChief = window.currentOrgData.agents.some(a => a.id === agentId);

        content.innerHTML = `
            <div class="edit-mode-header">
                <h3>Editing ${agent.name}</h3>
                <p>Modify agent persona and LLM configuration.</p>
            </div>
            
            <div class="edit-form">
                <div class="form-group">
                    <label>Agent Name</label>
                    <input type="text" id="edit-agent-name" value="${agent.name}" class="glass-input">
                </div>
                
                <div class="form-group">
                    <label>Role / Title</label>
                    <input type="text" id="edit-agent-role" value="${agent.role}" class="glass-input">
                </div>

                <div class="form-group">
                    <label>LLM Engine (Model)</label>
                    <select id="edit-agent-model" class="glass-select">
                        ${(this.availableModels && this.availableModels.length > 0 ? this.availableModels : ["DeepSeek V3.1", "GPT-4o", "Claude 3.5 Sonnet"]).map(m => `
                            <option value="${m}" ${agent.model === m ? 'selected' : ''}>${m}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Description</label>
                    <textarea id="edit-agent-desc" class="glass-input" rows="4">${agent.description || ''}</textarea>
                </div>

                <div class="edit-actions">
                    <button class="action-btn-primary full" onclick="window.jerryOS.saveAgent('${agentId}')">
                        <i data-lucide="save"></i> Save Changes
                    </button>
                    <button class="action-btn-outline full" onclick="window.jerryOS.openDossier(${JSON.stringify(agent).replace(/"/g, '&quot;')})">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    async saveAgent(agentId) {
        this.pushUndoState();
        const name = document.getElementById('edit-agent-name').value;
        const role = document.getElementById('edit-agent-role').value;
        const model = document.getElementById('edit-agent-model').value;
        const description = document.getElementById('edit-agent-desc').value;

        // Update local cache
        if (agentId === 'director') {
            window.currentOrgData.director.name = name;
            window.currentOrgData.director.role = role;
            window.currentOrgData.director.model = model;
        } else if (agentId === 'executive') {
            window.currentOrgData.executive.name = name;
            window.currentOrgData.executive.role = role;
            window.currentOrgData.executive.model = model;
        } else {
            // Check agents and sub-agents
            let found = false;
            for (const agent of window.currentOrgData.agents) {
                if (agent.id === agentId) {
                    agent.name = name;
                    agent.role = role;
                    agent.model = model;
                    agent.description = description;
                    found = true;
                    break;
                }
                if (agent.subAgents) {
                    const sub = agent.subAgents.find(s => s.id === agentId);
                    if (sub) {
                        sub.name = name;
                        sub.role = role;
                        sub.model = model;
                        sub.description = description;
                        found = true;
                        break;
                    }
                }
            }
        }

        try {
            const response = await fetch('/api/org-chart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(window.currentOrgData)
            });
            
            if (response.ok) {
                // Re-render the whole chart to show new names/roles
                this.renderOrgChart(window.currentOrgData);
                // Close sidebar or show success
                this.closeDossier();
                alert('Changes saved and persisted to system.');
            }
        } catch (error) {
            console.error('Failed to save agent:', error);
            alert('Error saving changes. Check console.');
        }
    }

    closeDossier() {
        const sidebar = document.getElementById('agent-dossier-sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }

    // ═══════════════════════════════════════════════
    //  HEAT MAP SYSTEM
    // ═══════════════════════════════════════════════

    getHeatLevel(agent) {
        if (agent.status === 'ACTIVE') return 'high';
        if (agent.activity && agent.activity.length > 0) return 'medium';
        if (agent.subAgentsCount > 2) return 'low';
        return 'idle';
    }

    toggleHeatMap() {
        const layout = document.querySelector('.org-tree-layout');
        const btn = document.getElementById('heatmap-toggle');
        if (!layout || !btn) return;

        layout.classList.toggle('heatmap-mode');
        btn.classList.toggle('active');
    }

    // ═══════════════════════════════════════════════
    //  SYNAPSE VISUALIZATION
    // ═══════════════════════════════════════════════

    toggleSynapses() {
        const btn = document.getElementById('synapse-toggle');
        if (!btn) return;

        this.synapsesActive = !this.synapsesActive;
        btn.classList.toggle('active');

        if (this.synapsesActive) {
            this.startSynapses();
        } else {
            this.stopSynapses();
        }
    }

    startSynapses() {
        // Add particles to vertical connector
        const vertical = document.querySelector('.org-connector.vertical');
        if (vertical) {
            vertical.classList.add('synapse-active');
            vertical.innerHTML = '<div class="synapse-particle"></div><div class="synapse-particle"></div><div class="synapse-particle"></div>';
        }

        // Add particles to branch stems
        document.querySelectorAll('.branch-stem').forEach((stem, i) => {
            stem.classList.add('synapse-active');
            stem.innerHTML = `<div class="synapse-particle" style="animation-delay: ${i * 0.3}s"></div>`;
        });

        // Add horizontal particles to branch span
        const span = document.querySelector('.branch-span');
        if (span) {
            span.classList.add('synapse-active');
            span.innerHTML = '<div class="synapse-horizontal"></div><div class="synapse-horizontal"></div><div class="synapse-horizontal"></div>';
        }
    }

    stopSynapses() {
        const vertical = document.querySelector('.org-connector.vertical');
        if (vertical) {
            vertical.classList.remove('synapse-active');
            vertical.innerHTML = '';
        }

        document.querySelectorAll('.branch-stem').forEach(stem => {
            stem.classList.remove('synapse-active');
            stem.innerHTML = '';
        });

        const span = document.querySelector('.branch-span');
        if (span) {
            span.classList.remove('synapse-active');
            span.innerHTML = '';
        }
    }

    // ═══════════════════════════════════════════════
    //  SMART SEARCH & AUTO-FOCUS
    // ═══════════════════════════════════════════════

    searchAgent(query) {
        const allNodes = document.querySelectorAll('.org-node');
        const allSubs = document.querySelectorAll('.sub-agent-micro-card');

        if (!query || query.trim() === '') {
            allNodes.forEach(n => { n.classList.remove('search-match', 'search-dim'); });
            allSubs.forEach(s => { s.classList.remove('search-match', 'search-dim'); });
            return;
        }

        const q = query.toLowerCase();
        let matchFound = null;

        allNodes.forEach(node => {
            const name = node.dataset.name || '';
            if (name.includes(q)) {
                node.classList.add('search-match');
                node.classList.remove('search-dim');
                if (!matchFound) matchFound = node;
            } else {
                node.classList.add('search-dim');
                node.classList.remove('search-match');
            }
        });

        allSubs.forEach(sub => {
            const text = (sub.querySelector('span')?.textContent || '').toLowerCase();
            if (text.includes(q)) {
                sub.classList.add('search-match');
                sub.classList.remove('search-dim');
            } else {
                sub.classList.add('search-dim');
                sub.classList.remove('search-match');
            }
        });

        // Auto-scroll to the first match
        if (matchFound) {
            matchFound.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // ═══════════════════════════════════════════════
    //  INTERACTIVE HIRE AGENT
    // ═══════════════════════════════════════════════

    hireAgent(agentId) {
        if (!window.currentOrgData) return;
        this.pushUndoState();
        const agent = this.findAgentById(agentId);
        if (!agent) return;

        // Update status
        agent.status = 'ACTIVE';

        // Save to server
        fetch('/api/org-chart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.currentOrgData)
        }).then(() => {
            // Re-render
            this.renderOrgChart(window.currentOrgData);
            this.closeDossier();

            // Trigger hiring animation on the new card
            setTimeout(() => {
                const card = document.querySelector(`[data-id="${agentId}"]`);
                if (card) {
                    card.classList.add('hiring-sequence');
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => card.classList.remove('hiring-sequence'), 2500);
                }
            }, 200);
        });
    }

    // ═══════════════════════════════════════════════
    //  CLONE & DEPLOY AGENT
    // ═══════════════════════════════════════════════

    cloneAgent(agentId) {
        if (!window.currentOrgData) return;
        this.pushUndoState();
        // Find the source agent
        let source = null;
        for (const agent of window.currentOrgData.agents) {
            if (agent.id === agentId) { source = agent; break; }
            if (agent.subAgents) {
                const sub = agent.subAgents.find(s => s.id === agentId);
                if (sub) { source = sub; break; }
            }
        }
        if (!source) return;

        const cloneName = prompt(`Clone "${source.name}" — Enter name for the new agent:`, `${source.name} (Clone)`);
        if (!cloneName) return;

        const cloneId = `clone-${Date.now()}`;
        const cloned = {
            id: cloneId,
            name: cloneName,
            role: source.role,
            description: source.description || '',
            icon: source.icon,
            model: source.model,
            status: 'PLANNED',
            subAgentsCount: 0,
            subAgents: [],
            activity: ''
        };

        window.currentOrgData.agents.push(cloned);
        window.currentOrgData.stats.total++;
        window.currentOrgData.stats.planned++;

        // Save and re-render
        fetch('/api/org-chart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.currentOrgData)
        }).then(() => {
            this.renderOrgChart(window.currentOrgData);
            this.closeDossier();

            setTimeout(() => {
                const card = document.querySelector(`[data-id="${cloneId}"]`);
                if (card) {
                    card.classList.add('hiring-sequence');
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => card.classList.remove('hiring-sequence'), 2500);
                }
            }, 200);
        });
    }

    // ═══════════════════════════════════════════════
    //  SNAPSHOT & RESTORE
    // ═══════════════════════════════════════════════

    saveSnapshot(agentId) {
        let agent = null;
        if (agentId === 'director') agent = window.currentOrgData.director;
        else if (agentId === 'executive') agent = window.currentOrgData.executive;
        else {
            for (const a of window.currentOrgData.agents) {
                if (a.id === agentId) { agent = a; break; }
                if (a.subAgents) {
                    const sub = a.subAgents.find(s => s.id === agentId);
                    if (sub) { agent = sub; break; }
                }
            }
        }
        if (!agent) return;

        const snapshots = JSON.parse(localStorage.getItem('orgSnapshots') || '{}');
        snapshots[agentId] = {
            data: JSON.parse(JSON.stringify(agent)),
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('orgSnapshots', JSON.stringify(snapshots));
        alert(`Snapshot saved for "${agent.name}".`);
    }

    restoreSnapshot(agentId) {
        const snapshots = JSON.parse(localStorage.getItem('orgSnapshots') || '{}');
        const snap = snapshots[agentId];
        if (!snap) { alert('No snapshot found for this agent.'); return; }

        if (!confirm(`Restore "${snap.data.name}" from ${new Date(snap.timestamp).toLocaleString()}?`)) return;

        // Find and replace in data
        if (agentId === 'director') window.currentOrgData.director = snap.data;
        else if (agentId === 'executive') window.currentOrgData.executive = snap.data;
        else {
            let found = false;
            for (let i = 0; i < window.currentOrgData.agents.length; i++) {
                if (window.currentOrgData.agents[i].id === agentId) {
                    window.currentOrgData.agents[i] = snap.data;
                    found = true;
                    break;
                }
                if (window.currentOrgData.agents[i].subAgents) {
                    const subIdx = window.currentOrgData.agents[i].subAgents.findIndex(s => s.id === agentId);
                    if (subIdx !== -1) {
                        window.currentOrgData.agents[i].subAgents[subIdx] = snap.data;
                        found = true;
                        break;
                    }
                }
            }
        }

        fetch('/api/org-chart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.currentOrgData)
        }).then(() => {
            this.renderOrgChart(window.currentOrgData);
            this.closeDossier();
            alert('Agent restored from snapshot.');
        });
    }

    viewAgentLogs(agentId) {
        console.log(`[JerryOS] Opening logs for: ${agentId}`);
        const agent = this.findAgentById(agentId);
        if (!agent) return;

        const overlay = document.getElementById('agent-logs-overlay');
        const viewport = document.getElementById('logs-viewport');
        const nameEl = document.getElementById('logs-agent-name');

        if (!overlay || !viewport) return;

        nameEl.textContent = `${agent.name} Activity Logs`;
        viewport.innerHTML = `<div class="log-line system">[CONNECTING TO ${agent.id.toUpperCase()}...]</div>`;
        overlay.classList.add('active');

        // Initial logs
        const initialLogs = [
            { tag: 'SYS', msg: `Initialized intelligence layer for ${agent.name}` },
            { tag: 'CMD', msg: `Model heartbeat check: ${agent.model || 'Default'} - OK` },
            { tag: 'ACT', msg: agent.activity || 'Monitoring system background processes...' }
        ];

        initialLogs.forEach(l => this.appendLogLine(l.tag, l.msg));

        // Start periodic stream
        if (this.logInterval) clearInterval(this.logInterval);
        this.logInterval = setInterval(() => {
            if (!overlay.classList.contains('active')) {
                clearInterval(this.logInterval);
                return;
            }
            const randomLogs = [
                { tag: 'ACT', msg: "Analyzing incoming data streams..." },
                { tag: 'MEM', msg: "Optimizing context window usage." },
                { tag: 'NET', msg: "Synergizing with sub-agent cluster." },
                { tag: 'CPU', msg: "Allocating extra compute for intensive task." },
                { tag: 'SYS', msg: "Integrity check passed." }
            ];
            const log = randomLogs[Math.floor(Math.random() * randomLogs.length)];
            this.appendLogLine(log.tag, log.msg);
        }, 3000);
    }

    appendLogLine(tag, msg) {
        const viewport = document.getElementById('logs-viewport');
        if (!viewport) return;

        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-tag">[${tag}]</span>
            <span class="log-msg">${msg}</span>
        `;
        viewport.appendChild(line);
        viewport.scrollTop = viewport.scrollHeight;
    }

    closeLogs() {
        const overlay = document.getElementById('agent-logs-overlay');
        if (overlay) overlay.classList.remove('active');
        if (this.logInterval) clearInterval(this.logInterval);
    }

    // ═══════════════════════════════════════════════
    //  TEAM ANALYTICS
    // ═══════════════════════════════════════════════

    updateAnalytics() {
        if (!window.currentOrgData) return;

        const data = window.currentOrgData;
        const agents = data.agents || [];
        const totalAgents = agents.length + 2; // +director +executive
        const activeAgents = agents.filter(a => a.status === 'ACTIVE').length + 1; // +executive
        const plannedAgents = agents.filter(a => a.status === 'PLANNED').length;

        // Count unique models
        const models = new Set();
        agents.forEach(a => { if (a.model) models.add(a.model); });

        // Estimate cost (rough estimate per active model per day)
        const costMap = { 'DeepSeek V3.1': 0.50, 'GPT-4o': 2.50, 'Claude 3.5 Sonnet': 2.00, 'Gemini 1.5 Pro': 1.80, 'Llama 3.1 405B': 0.30 };
        let totalCost = 0;
        agents.forEach(a => {
            if (a.status === 'ACTIVE' && a.model && costMap[a.model]) {
                totalCost += costMap[a.model];
            }
        });

        // Update DOM
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('analytics-total', totalAgents);
        setEl('analytics-active', activeAgents);
        setEl('analytics-planned', plannedAgents);
        setEl('analytics-models', models.size || '—');
        setEl('analytics-cost', totalCost > 0 ? `$${totalCost.toFixed(2)}` : '$0');

        // Also update header stats
        const statsEl = document.getElementById('org-dynamic-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <span class="stat-item">${totalAgents} agents</span>
                <span class="stat-item active-stat">${activeAgents} active</span>
                <span class="stat-item">${plannedAgents} planned</span>
            `;
        }
    }

    // ═══════════════════════════════════════════════
    //  MINIMAP NAVIGATOR
    // ═══════════════════════════════════════════════

    updateMinimap() {
        const minimapContent = document.getElementById('minimap-content');
        if (!minimapContent || !window.currentOrgData) return;

        const data = window.currentOrgData;
        let dots = '';

        // Director
        dots += '<div class="minimap-node director"></div>';
        // Executive
        dots += '<div class="minimap-node executive"></div>';
        // Agents
        (data.agents || []).forEach(agent => {
            const cls = agent.status === 'ACTIVE' ? 'active' : 'planned';
            dots += `<div class="minimap-node ${cls}"></div>`;
        });
        dots += '<span class="minimap-label">MAP</span>';

        minimapContent.innerHTML = dots;
    }

    updateMinimapViewport(tx, ty, scale) {
        const viewport = document.getElementById('minimap-viewport');
        const layout = document.querySelector('.org-tree-layout');
        const container = document.querySelector('.premium-org-container');
        if (!viewport || !layout || !container) return;

        const mw = 180; // minimap width
        const mh = 120; // minimap height
        const cw = container.offsetWidth;
        const ch = container.offsetHeight;

        // Viewport dimensions in minimap
        const vw = (layout.offsetWidth / (cw * scale)) * mw;
        const vh = (layout.offsetHeight / (ch * scale)) * mh;

        // Viewport position in minimap
        const vx = (-tx / (cw * scale)) * mw + (mw / 2) - (vw / 2);
        const vy = (-ty / (ch * scale)) * mh + (mh / 2) - (vh / 2);

        viewport.style.width = `${Math.min(vw, mw)}px`;
        viewport.style.height = `${Math.min(vh, mh)}px`;
        viewport.style.left = `${Math.max(0, Math.min(vx, mw - vw))}px`;
        viewport.style.top = `${Math.max(0, Math.min(vy, mh - vh))}px`;
    }

    // ═══════════════════════════════════════════════
    //  KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only active when org chart is visible
            if (this.currentModule !== 'ops') return;

            const tag = e.target.tagName;
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

            // Ctrl+F → Focus search (override browser default)
            if (e.ctrlKey && e.key === 'f') {
                const searchInput = document.getElementById('org-search-input');
                if (searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                }
                return;
            }

            // Ctrl+Z → Undo
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undoOrgAction();
                return;
            }

            // Ctrl+Y or Ctrl+Shift+Z → Redo
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                this.redoOrgAction();
                return;
            }

            // Skip letter shortcuts if user is typing
            if (isInput) return;

            // H → Toggle Heat Map
            if (e.key === 'h' || e.key === 'H') {
                this.toggleHeatMap();
                return;
            }

            // S → Toggle Synapses
            if (e.key === 's' || e.key === 'S') {
                this.toggleSynapses();
                return;
            }

            // Esc → Close dossier / clear search
            if (e.key === 'Escape') {
                this.closeDossier();
                const searchInput = document.getElementById('org-search-input');
                if (searchInput) {
                    searchInput.value = '';
                    this.searchAgent('');
                }
                return;
            }
        });
    }

    // ═══════════════════════════════════════════════
    //  EXPORT ORG CHART
    // ═══════════════════════════════════════════════

    exportOrgChart(format) {
        if (format === 'json') {
            this.exportAsJSON();
        } else if (format === 'png') {
            this.exportAsPNG();
        }
    }

    exportAsJSON() {
        if (!window.currentOrgData) return;

        const blob = new Blob([JSON.stringify(window.currentOrgData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jerry-os-orgchart-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportAsPNG() {
        const container = document.querySelector('.premium-org-container');
        if (!container) { alert('Org chart not rendered yet.'); return; }

        // Use html2canvas if available, otherwise fallback
        if (typeof html2canvas !== 'undefined') {
            html2canvas(container, {
                backgroundColor: '#05070a',
                scale: 2,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `jerry-os-orgchart-${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        } else {
            // Simplified fallback: export as JSON with a note
            alert('PNG export requires html2canvas library. Exporting as JSON instead.');
            this.exportAsJSON();
        }
    }

    // ═══════════════════════════════════════════════
    //  UNDO / REDO SYSTEM
    // ═══════════════════════════════════════════════

    pushUndoState() {
        if (!window.currentOrgData) return;

        if (!this.undoStack) this.undoStack = [];
        if (!this.redoStack) this.redoStack = [];

        // Deep clone current state
        this.undoStack.push(JSON.stringify(window.currentOrgData));
        // Clear redo on new action
        this.redoStack = [];

        // Keep stack manageable
        if (this.undoStack.length > 30) this.undoStack.shift();
    }

    undoOrgAction() {
        if (!this.undoStack || this.undoStack.length === 0) {
            return;
        }

        if (!this.redoStack) this.redoStack = [];

        // Save current state to redo
        this.redoStack.push(JSON.stringify(window.currentOrgData));

        // Pop last state
        const prevState = this.undoStack.pop();
        window.currentOrgData = JSON.parse(prevState);

        // Re-render & persist
        this.renderOrgChart(window.currentOrgData);
        fetch('/api/org-chart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: prevState
        });
    }

    redoOrgAction() {
        if (!this.redoStack || this.redoStack.length === 0) {
            return;
        }

        if (!this.undoStack) this.undoStack = [];

        // Save current state to undo
        this.undoStack.push(JSON.stringify(window.currentOrgData));

        // Pop from redo
        const nextState = this.redoStack.pop();
        window.currentOrgData = JSON.parse(nextState);

        // Re-render & persist
        this.renderOrgChart(window.currentOrgData);
        fetch('/api/org-chart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: nextState
        });
    }


    setupZoomButtons() {
        // Add zoom control container if not exists
        const layout = document.querySelector('.org-tree-layout');
        if (!layout || document.querySelector('.org-zoom-controls')) return;

        const controls = document.createElement('div');
        controls.className = 'org-zoom-controls glass';
        controls.innerHTML = `
            <button id="org-zoom-in" title="Zoom In"><i data-lucide="plus"></i></button>
            <button id="org-zoom-out" title="Zoom Out"><i data-lucide="minus"></i></button>
            <button id="org-zoom-reset" title="Reset Zoom"><i data-lucide="maximize"></i></button>
        `;
        layout.appendChild(controls);
        lucide.createIcons();
    }

    setupWhiteboardPanning() {
        const layout = document.querySelector('.org-tree-layout');
        const container = document.querySelector('.premium-org-container');
        if (!layout || !container) return;

        let isDragging = false;
        let startX, startY;
        let translateX = 0;
        let translateY = 0;
        let scale = 1;
        const minScale = 0.3;
        const maxScale = 2.5;

        const updateTransform = () => {
            container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale}) perspective(1000px)`;
            this.updateMinimapViewport(translateX, translateY, scale);
        };

        const minimap = document.getElementById('org-minimap');
        if (minimap) {
            minimap.addEventListener('click', (e) => {
                const mw = 180;
                const mh = 120;
                const rect = minimap.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                const cw = container.offsetWidth;
                const ch = container.offsetHeight;

                translateX = -((clickX / mw) * (cw * scale) - (layout.offsetWidth / 2));
                translateY = -((clickY / mh) * (ch * scale) - (layout.offsetHeight / 2));
                updateTransform();
            });
        }

        // Reset position on fresh load
        updateTransform();

        layout.addEventListener('mousedown', (e) => {
            if (e.target.closest('.node-main') || e.target.closest('.node-footer') || e.target.closest('button')) return;
            isDragging = true;
            layout.style.cursor = 'grabbing';
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            layout.style.cursor = 'grab';
        });

        // Zoom with buttons (using event delegation for the layout)
        layout.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            if (btn.id === 'org-zoom-in') {
                scale = Math.min(scale + 0.2, maxScale);
            } else if (btn.id === 'org-zoom-out') {
                scale = Math.max(scale - 0.2, minScale);
            } else if (btn.id === 'org-zoom-reset') {
                scale = 1;
                translateX = 0;
                translateY = 0;
            } else {
                return;
            }
            updateTransform();
        });

        // Visual cues
        layout.style.cursor = 'grab';
        layout.style.userSelect = 'none';
        
        // Touch support (Panning only)
        layout.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && !e.target.closest('.org-node')) {
                isDragging = true;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) {
                translateX = e.touches[0].clientX - startX;
                translateY = e.touches[0].clientY - startY;
                updateTransform();
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    async loadMissionControlData() {
        const timerEl = document.getElementById('mc-refresh-timer');
        if (timerEl) timerEl.classList.add('refreshing');

        try {
            await Promise.all([
                this.loadModelInfo(),
                this.loadActiveSessions(), 
                this.loadCronHealth()
            ]);
            this.lastRefreshTime = Date.now();
            return true;
        } catch (error) {
            console.error('Mission Control load failed:', error);
            return false;
        } finally {
            if (timerEl) {
                setTimeout(() => timerEl.classList.remove('refreshing'), 500);
            }
        }
    }

    async loadModelInfo() {
        const container = document.getElementById('mc-models-row');
        if (container) {
            container.innerHTML = '<div class="mc-model-card shimmer"><div class="mc-model-name">Loading...</div></div>';
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/api/model', { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await response.json();
            
            if (data.status === 'ok' && data.result && data.result.models) {
                this.availableModels = data.result.models.map(m => m.name);
                this.renderModelCards(data.result.models);
            } else {
                this.availableModels = [];
                this.renderModelError();
            }
        } catch (error) {
            console.log('Failed to fetch model data:', error);
            this.renderModelError();
        }
    }

    renderModelCards(models) {
        const container = document.getElementById('mc-models-row');
        if (!container) return;

        if (!models || models.length === 0) {
            container.innerHTML = '<div class="mc-no-data">No models configured</div>';
            return;
        }

        container.innerHTML = models.map(model => {
            const statusClass = model.status === 'online' ? 'online' : model.status === 'standby' ? 'standby' : 'offline';
            const statusLabel = model.status || 'unknown';
            return `
            <div class="mc-model-card animate-in">
                <div class="mc-model-top">
                    <div class="mc-model-name">${this.escapeHtml(model.name)}</div>
                    <div class="mc-model-status ${statusClass}">
                        <span class="mc-status-dot"></span>
                        ${statusLabel}
                    </div>
                </div>
                <div class="mc-model-provider">${this.escapeHtml(model.provider)}</div>
                ${!model.configured ? '<div class="mc-model-config">Not configured</div>' : ''}
            </div>
        `}).join('');
    }

    renderModelError() {
        const container = document.getElementById('mc-models-row');
        if (!container) return;
        container.innerHTML = '<div class="mc-no-data">Data unavailable - retrying...</div>';
    }

    async loadActiveSessions() {
        const container = document.getElementById('mc-sessions');
        if (container) {
            container.innerHTML = '<div class="mc-model-card shimmer"><div class="mc-model-name">Loading sessions...</div></div>';
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/api/sessions', { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await response.json();
            
            if (data.status === 'ok' && data.result && data.result.sessions) {
                this.renderSessionCards(data.result.sessions);
            } else {
                this.renderSessionError();
            }
        } catch (error) {
            console.log('Failed to fetch sessions:', error);
            this.renderSessionError();
        }
    }

    renderSessionCards(sessions) {
        const container = document.getElementById('mc-sessions');
        if (!container) return;

        const activeSessions = (sessions || []).filter(s => s.active !== false);

        if (activeSessions.length === 0) {
            container.innerHTML = '<div class="mc-no-data">No active sessions</div>';
            return;
        }

        container.innerHTML = activeSessions.map(session => {
            const timeAgo = session.updated || this.getTimeAgo(session.updated);
            return `
                <div class="mc-session-card">
                    <div class="mc-session-top">
                        <div class="mc-session-name">${this.escapeHtml(session.label || session.id)}</div>
                        <div class="mc-session-badge">
                            <span class="mc-session-dot"></span>
                            ${session.active ? 'active' : 'idle'}
                        </div>
                    </div>
                    <div class="mc-session-details">
                        ${session.agent ? `<div class="mc-session-detail">${this.escapeHtml(session.agent)}</div>` : ''}
                        ${session.channel ? `<div class="mc-session-detail">Channel: ${this.escapeHtml(session.channel)}</div>` : ''}
                    </div>
                    <div class="mc-session-footer">
                        <div class="mc-session-model">${this.escapeHtml(session.model || '—')}</div>
                        <div class="mc-session-tokens">
                            <span class="token-count">${session.tokens || '—'}</span> tokens
                            <br>${timeAgo}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSessionError() {
        const container = document.getElementById('mc-sessions');
        if (!container) return;
        container.innerHTML = '<div class="mc-no-data">Data unavailable - retrying...</div>';
    }

    getTimeAgo(timestamp) {
        if (!timestamp) return '';
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    }

    getSessionLabel(session) {
        if (session.label) return session.label;
        if (session.kind) return `${session.kind} Session`;
        return 'Unnamed Session';
    }

    async loadCronHealth() {
        const tbody = document.getElementById('mc-cron-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="mc-no-data">Loading cron data...</td></tr>';
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/api/crons', { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await response.json();
            
            if (data.status === 'ok' && data.result) {
                this.renderCronTable(data.result);
            } else {
                this.renderCronError();
            }
        } catch (error) {
            console.log('Failed to fetch cron data:', error);
            this.renderCronError();
        }
    }

    renderCronTable(cronData) {
        const tbody = document.getElementById('mc-cron-tbody');
        if (!tbody) return;

        if (!cronData || cronData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="mc-no-data">No crons configured</td></tr>';
            return;
        }

        tbody.innerHTML = cronData.map(cron => {
            const statusClass = cron.status === 'running' ? 'cron-running' : cron.status === 'healthy' ? 'cron-healthy' : cron.status === 'failed' ? 'cron-failed' : 'cron-idle';
            return `
            <tr>
                <td class="cron-name-cell">${this.escapeHtml(cron.name || 'Unnamed')}</td>
                <td class="cron-schedule-cell">${this.escapeHtml(cron.schedule || '—')}</td>
                <td class="${cron.enabled ? 'cron-enabled-yes' : 'cron-enabled-no'}">${cron.enabled ? 'Yes' : 'No'}</td>
                <td class="cron-dash">${this.escapeHtml(cron.lastRun || '—')}</td>
                <td><span class="cron-status-badge ${statusClass}">${this.escapeHtml(cron.status || '—')}</span></td>
                <td>${this.escapeHtml(cron.nextRun || '—')}</td>
            </tr>
        `}).join('');
    }

    renderCronError() {
        const tbody = document.getElementById('mc-cron-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" class="mc-no-data">Data unavailable - retrying...</td></tr>';
    }

    // ═══════════════════════════════════════════════
    //  AUTO-REFRESH
    // ═══════════════════════════════════════════════

    startDataRefresh() {
        let refreshInterval = 30000; // Start with 30 seconds
        let errorCount = 0;
        let consecutiveSuccesses = 0;

        const smartRefresh = async () => {
            if (this.currentModule === 'ops') {
                try {
                    await this.loadMissionControlData();
                    
                    // Success - consider speeding up if system is healthy
                    consecutiveSuccesses++;
                    errorCount = Math.max(0, errorCount - 1);
                    
                    if (consecutiveSuccesses > 5 && errorCount === 0) {
                        // System is healthy, refresh more frequently
                        refreshInterval = Math.max(10000, refreshInterval - 5000); // Minimum 10 seconds
                        consecutiveSuccesses = 0;
                    }
                    
                } catch (error) {
                    // Error - slow down to avoid bogging down the system
                    errorCount++;
                    consecutiveSuccesses = 0;
                    
                    if (errorCount > 2) {
                        // Multiple errors, slow down significantly
                        refreshInterval = Math.min(120000, refreshInterval + 15000); // Maximum 2 minutes
                    }
                    
                    console.log('Refresh failed, slowing down:', errorCount, 'errors, interval:', refreshInterval);
                }
            }

            // Schedule next refresh with adaptive timing
            setTimeout(smartRefresh, refreshInterval);
        };

        // Start the adaptive refresh cycle
        smartRefresh();
    }

    setupBrainTabs() {
        const tabs = document.querySelectorAll('.brain-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update panes
                document.querySelectorAll('.brain-tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                const targetId = `brain-${tab.dataset.brainTab}`;
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('active');
                    
                    // Load data based on active tab
                    if (tab.dataset.brainTab === 'automations' && window.automationsManager) {
                        window.automationsManager.loadAutomations();
                    } else if (tab.dataset.brainTab === 'documentation' && window.docsManager) {
                        window.docsManager.loadPages();
                    }
                }
            });
        });
    }

}

// Laboratory Management
class LabManager {
    constructor() {
        this.data = null;
        this.refreshInterval = null;
    }

    async init() {
        await this.loadLabData();
        this.startAutoRefresh();
    }

    startAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => {
            if (window.jerryOS.currentModule === 'lab') {
                this.loadLabData();
            }
        }, 15000); // Refresh every 15s
    }

    async loadLabData() {
        try {
            const response = await fetch('/api/lab');
            const data = await response.json();
            if (data.status === 'ok') {
                this.data = data.result;
                this.renderDashboard();
            } else {
                this.renderLabError();
            }
        } catch (error) {
            console.error('Failed to load lab data:', error);
            this.renderLabError();
        }
    }

    renderLabError() {
        const uptime = document.getElementById('lab-uptime');
        const latency = document.getElementById('lab-latency');
        const requests = document.getElementById('lab-requests');
        if (uptime) uptime.textContent = 'Data unavailable';
        if (latency) latency.textContent = 'Data unavailable';
        if (requests) requests.textContent = 'Data unavailable';
    }

    renderDashboard() {
        if (!this.data) return;

        this.renderPrototypes();
        this.renderBuilds();
        this.renderImprovements();
        this.renderMetrics();

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderPrototypes() {
        const container = document.getElementById('lab-prototypes-container');
        const countBadge = document.getElementById('lab-prototypes-count');
        if (!container) return;

        if (countBadge) countBadge.textContent = `${this.data.prototypes.length} Running`;

        container.innerHTML = this.data.prototypes.map(sys => `
            <div class="lab-system-item ${sys.status}">
                <div class="sys-main">
                    <div class="sys-icon"><i data-lucide="${sys.icon}"></i></div>
                    <div class="sys-info">
                        <span class="sys-name">${sys.name}</span>
                        <span class="sys-desc">${sys.desc}</span>
                    </div>
                </div>
                <div class="sys-status-box">
                    <span class="status-label ${sys.status}">${sys.status}</span>
                    <span class="sys-port">Port ${sys.port} • ${sys.started}</span>
                </div>
            </div>
        `).join('');
    }

    renderBuilds() {
        const container = document.getElementById('lab-builds-container');
        if (!container) return;

        container.innerHTML = this.data.builds.map(build => `
            <div class="lab-build-item ${build.status}">
                <div class="build-indicator"></div>
                <div class="build-content">
                    <div class="build-header">
                        <span class="build-name">${build.name}</span>
                        <span class="build-time">${build.time}</span>
                    </div>
                    <p class="build-desc">${build.desc}</p>
                </div>
            </div>
        `).join('');
    }

    renderImprovements() {
        const container = document.getElementById('lab-improvements-container');
        if (!container) return;

        container.innerHTML = this.data.improvements.map(item => `
            <div class="lab-progress-item">
                <div class="prog-header">
                    <div class="prog-info">
                        <i data-lucide="${item.icon}"></i>
                        <span class="progress-name">${item.name}</span>
                    </div>
                    <span class="prog-percent">${item.progress}%</span>
                </div>
                <div class="prog-bar-bg">
                    <div class="prog-bar-fill" style="width: ${item.progress}%"></div>
                </div>
            </div>
        `).join('');
    }

    renderMetrics() {
        const uptime = document.getElementById('lab-uptime');
        const latency = document.getElementById('lab-latency');
        const requests = document.getElementById('lab-requests');

        if (uptime) uptime.textContent = this.data.metrics.uptime;
        if (latency) latency.textContent = this.data.metrics.responseTime;
        if (requests) requests.textContent = this.data.metrics.dailyRequests.toLocaleString();
    }
}

// Daily Briefs Management
class DailyBriefs {
    constructor() {
        this.currentBrief = null;
    }

    async init() {
        await this.loadAvailableBriefs();
    }

    async loadAvailableBriefs() {
        try {
            const listContainer = document.getElementById('briefs-history-list');
            if (!listContainer) return;
            
            const response = await fetch('/api/briefs');
            const data = await response.json();
            
            if (data.status === 'ok' && data.result.length > 0) {
                this.renderBriefsList(data.result);
                // Load the first brief by default
                await this.loadBrief(data.result[0].id);
                // Mark first as active
                listContainer.querySelector('.brain-list-item').classList.add('active');
            } else {
                listContainer.innerHTML = '<div class="brain-no-data">No briefs found</div>';
            }
        } catch (error) {
            console.error('Failed to load briefs:', error);
            const listContainer = document.getElementById('briefs-history-list');
            if (listContainer) {
                listContainer.innerHTML = '<div class="brain-no-data">Failed to load briefs</div>';
            }
        }
    }

    renderBriefsList(briefs) {
        const listContainer = document.getElementById('briefs-history-list');
        if (!listContainer) return;

        listContainer.innerHTML = briefs.map(brief => `
            <div class="brain-list-item" data-brief-id="${brief.id}">
                <span class="brain-list-item-title">${brief.title}</span>
                <span class="brain-list-item-sub">${brief.date}</span>
            </div>
        `).join('');

        // Add event listeners
        const items = listContainer.querySelectorAll('.brain-list-item');
        items.forEach(item => {
            item.addEventListener('click', async () => {
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                await this.loadBrief(item.dataset.briefId);
            });
        });
    }

    async loadBrief(briefId) {
        try {
            const response = await fetch(`/briefs/${briefId}.md`);
            
            if (response.ok) {
                const markdownContent = await response.text();
                this.renderBriefContent(markdownContent, briefId);
            } else {
                this.showEmptyBrief(briefId);
            }
        } catch (error) {
            console.error('Failed to load brief:', error);
            this.showEmptyBrief(briefId);
        }
    }

    renderBriefContent(content, briefId) {
        const renderer = document.getElementById('brief-content-renderer');
        if (!renderer) return;
        
        // Simple markdown rendering
        const htmlContent = this.convertMarkdownToHTML(content);
        renderer.innerHTML = htmlContent;
    }

    showEmptyBrief(briefId) {
        const renderer = document.getElementById('brief-content-renderer');
        if (!renderer) return;
        
        renderer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="file-text"></i>
                <p>Failed to load brief content.</p>
            </div>
        `;
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    convertMarkdownToHTML(markdown) {
        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/<li>(.*?)<\/li>/gim, '<ul><li>$1</li></ul>')
            // Merge consecutive lists
            .replace(/<\/ul>\s*<ul>/gim, '')
            // Add custom checkbox logic
            .replace(/<li>\[x\](.*?)<\/li>/gim, '<li style="list-style-type: none; margin-left: -20px;"><i data-lucide="check-square" style="width: 14px; height: 14px; margin-right: 6px; color: var(--accent-green); vertical-align: middle;"></i> <s>$1</s></li>')
            .replace(/<li>\[ \](.*?)<\/li>/gim, '<li style="list-style-type: none; margin-left: -20px;"><i data-lucide="square" style="width: 14px; height: 14px; margin-right: 6px; color: var(--text-tertiary); vertical-align: middle;"></i> $1</li>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Handle spacing precisely
            .replace(/\n\n/gim, '<div style="height: 16px;"></div>')
            .replace(/\n/gim, '<br>')
            // Strip br tags next to blocks to avoid double spacing
            .replace(/<\/(h[1-3]|ul|div)><br>/gim, '</$1>')
            .replace(/<br><(h[1-3]|ul|div)/gim, '<$1');

        return html;
    }
}

// Automations Management
class AutomationsManager {
    constructor() {}

    async loadAutomations() {
        try {
            const listContainer = document.getElementById('automations-list-container');
            const countBadge = document.getElementById('automations-count-badge');
            
            if (!listContainer) return;
            listContainer.innerHTML = '<div class="brain-loading-shimmer"></div><div class="brain-loading-shimmer"></div>';
            
            const response = await fetch('/api/crons');
            const data = await response.json();
            
            if (data.status === 'ok' && data.result.length > 0) {
                if (countBadge) countBadge.textContent = `${data.result.length} active jobs`;
                this.renderAutomationsList(data.result);
            } else {
                if (countBadge) countBadge.textContent = '0 jobs';
                listContainer.innerHTML = '<div class="brain-no-data">No automations configured</div>';
            }
        } catch (error) {
            console.error('Failed to load automations:', error);
            const listContainer = document.getElementById('automations-list-container');
            if (listContainer) {
                listContainer.innerHTML = '<div class="brain-no-data">Failed to load automations</div>';
            }
        }
    }

    renderAutomationsList(crons) {
        const listContainer = document.getElementById('automations-list-container');
        if (!listContainer) return;

        listContainer.innerHTML = crons.map(cron => {
            const statusClass = this.getStatusClass(cron.status);
            
            return `
                <div class="automation-card animate-in">
                    <div class="auto-card-left">
                        <div class="auto-status-indicator ${statusClass}"></div>
                        <div class="auto-card-info">
                            <h4>${cron.name}</h4>
                            <p>
                                <span><i data-lucide="clock" style="width: 12px; height: 12px; margin-right: 4px; vertical-align: text-bottom;"></i>${cron.schedule}</span>
                                <span>Next: ${cron.nextRun}</span>
                            </p>
                        </div>
                    </div>
                    <div class="auto-card-right">
                        <span class="auto-badge">${cron.enabled ? 'Enabled' : 'Disabled'}</span>
                        <span class="auto-badge" style="color: var(--brain-primary)">${cron.status}</span>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    getStatusClass(status) {
        const s = status.toLowerCase();
        if (s === 'running' || s === 'active') return 'running';
        if (s === 'healthy' || s === 'success') return 'healthy';
        if (s === 'scheduled' || s === 'idle') return 'scheduled';
        return 'failed';
    }
}

// Documentation Management
class DocumentationManager {
    constructor() {}

    async loadPages() {
        try {
            const listContainer = document.getElementById('docs-pages-list');
            if (!listContainer) return;
            
            const response = await fetch('/api/docs');
            const data = await response.json();
            
            if (data.status === 'ok' && data.result.length > 0) {
                this.renderPagesList(data.result);
                // Load the first page by default
                await this.loadDoc(data.result[0].file);
                // Mark first as active
                listContainer.querySelector('.brain-list-item').classList.add('active');
            } else {
                listContainer.innerHTML = '<div class="brain-no-data">No pages found</div>';
            }
        } catch (error) {
            console.error('Failed to load docs:', error);
            const listContainer = document.getElementById('docs-pages-list');
            if (listContainer) {
                listContainer.innerHTML = '<div class="brain-no-data">Failed to load docs</div>';
            }
        }
    }

    renderPagesList(pages) {
        const listContainer = document.getElementById('docs-pages-list');
        if (!listContainer) return;

        listContainer.innerHTML = pages.map(page => `
            <div class="brain-list-item" data-doc-file="${page.file}">
                <span class="brain-list-item-title">${page.title}</span>
                <span class="brain-list-item-sub">${page.file}</span>
            </div>
        `).join('');

        // Add event listeners
        const items = listContainer.querySelectorAll('.brain-list-item');
        items.forEach(item => {
            item.addEventListener('click', async () => {
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                await this.loadDoc(item.dataset.docFile);
            });
        });
    }

    async loadDoc(fileName) {
        try {
            const response = await fetch(`/docs/${fileName}`);
            
            if (response.ok) {
                const markdownContent = await response.text();
                this.renderDocContent(markdownContent, fileName);
            } else {
                this.showEmptyDoc();
            }
        } catch (error) {
            console.error('Failed to load doc:', error);
            this.showEmptyDoc();
        }
    }

    renderDocContent(content, fileName) {
        const renderer = document.getElementById('docs-content-renderer');
        if (!renderer) return;
        
        // Reuse DailyBriefs markdown renderer logic
        const htmlContent = window.dailyBriefs.convertMarkdownToHTML(content);
        renderer.innerHTML = htmlContent;
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    showEmptyDoc() {
        const renderer = document.getElementById('docs-content-renderer');
        if (!renderer) return;
        
        renderer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="book-open"></i>
                <p>Failed to load document.</p>
            </div>
        `;
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// Initialize Jerry OS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jerryOS = new JerryOS();
    
    // Initialize Brain Sub-Managers
    window.dailyBriefs = new DailyBriefs();
    window.automationsManager = new AutomationsManager();
    window.docsManager = new DocumentationManager();
    window.labManager = new LabManager();
    
    dailyBriefs.init();
    
    console.log('%c⚡ Jerry OS — Premium Edition', 'color: #00e5ff; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);');
    console.log('%cSystem initialized. All systems operational.', 'color: rgba(240, 240, 245, 0.55); font-size: 14px;');
});

// -----------------------------------------------
// FLOATING CHATBOT FUNCTIONALITY
// -----------------------------------------------

let chatbotOpen = false;

function toggleChatbot() {
    const window = document.getElementById('chatbot-window');
    const button = document.getElementById('chatbot-button');
    const badge = document.querySelector('.chatbot-badge');
    
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        window.classList.add('active');
        button.style.display = 'none';
        if (badge) badge.classList.add('hidden');
        document.getElementById('chatbot-input').focus();
    } else {
        window.classList.remove('active');
        button.style.display = 'flex';
    }
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

function handleChatbotKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatbotMessage();
    }
}

async function sendChatbotMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatbotMessage(message, 'user');
    input.value = '';
    
    showTypingIndicator();
    
    try {
        const response = await fetch('/api/prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        removeTypingIndicator();
        
        if (data.status === 'ok') {
            addChatbotMessage(data.result.response, 'bot');
        } else {
            addChatbotMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
        
    } catch (error) {
        removeTypingIndicator();
        addChatbotMessage('Sorry, I\'m having trouble connecting. Please try again.', 'bot');
    }
}

function addChatbotMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${text}
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chatbot-message bot';
    typingDiv.innerHTML = `
        <div class="message-content">
            <span style="display: inline-flex; gap: 4px;">
                <span style="width: 8px; height: 8px; background: #00e5ff; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></span>
                <span style="width: 8px; height: 8px; background: #00e5ff; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.2s;"></span>
                <span style="width: 8px; height: 8px; background: #00e5ff; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.4s;"></span>
            </span>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}
