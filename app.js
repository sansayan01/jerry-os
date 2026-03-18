// Jerry OS - Main Application Logic

class JerryOS {
    constructor() {
        this.currentModule = 'ops';
        this.modules = ['ops', 'brain', 'lab'];
        this.draggedTab = null;
        this.init();
    }

    init() {
        this.setupTabBar();
        this.setupTabDragging();
        this.setupDock();
        this.loadMissionControlData();
        this.startDataRefresh();
    }

    // Tab Bar Functionality
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

    // Module Switching
    switchModule(moduleName) {
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.module === moduleName) {
                tab.classList.add('active');
            }
        });

        // Update dock
        document.querySelectorAll('.dock-item').forEach(item => {
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
        }
    }

    // Dock Functionality
    setupDock() {
        const dockItems = document.querySelectorAll('.dock-item');
        dockItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleName = item.dataset.module;
                this.switchModule(moduleName);
            });
        });
    }

    // Mission Control Data Loading
    async loadMissionControlData() {
        await this.loadModelInfo();
        await this.loadActiveSessions();
        await this.loadCronHealth();
    }

    async loadModelInfo() {
        try {
            const response = await fetch('/api/model');
            const data = await response.json();
            
            if (data.status === 'ok') {
                const modelData = data.result.model;
                this.updateModelInfo(modelData);
            }
        } catch (error) {
            console.log('Using mock model data:', error);
            this.updateModelInfo(this.getMockModelData());
        }
    }

    updateModelInfo(modelData) {
        const modelElement = document.getElementById('current-model');
        const providerElement = document.getElementById('model-provider');
        const apiElement = document.getElementById('model-api');
        const statusElement = document.getElementById('model-status');

        if (modelData && modelData !== 'unknown') {
            modelElement.textContent = modelData.split('/').pop() || modelData;
            providerElement.textContent = modelData.split('/')[0] || 'Unknown';
        } else {
            modelElement.textContent = 'Loading...';
        }

        apiElement.textContent = modelData?.api || 'OpenClaw';

        // Status will be updated through real API calls
        statusElement.className = 'value status-badge active';
        statusElement.textContent = 'Active';
    }

    getMockModelData() {
        return {
            model: 'nvidia/z-ai/glm4.7',
            provider: 'nvidia',
            api: 'OpenClaw'
        };
    }

    async loadActiveSessions() {
        try {
            const response = await fetch('/api/sessions');
            const data = await response.json();
            
            if (data.status === 'ok' && data.result.sessions) {
                this.updateSessionsList(data.result.sessions);
            }
        } catch (error) {
            console.log('Using mock sessions data:', error);
            this.updateSessionsList(this.getMockSessions());
        }
    }

    updateSessionsList(sessions) {
        const sessionsList = document.getElementById('sessions-list');
        
        if (!sessions || sessions.length === 0) {
            sessionsList.innerHTML = '<div class="no-sessions">No active sessions</div>';
            return;
        }

        const activeSessions = sessions.filter(s => s.active !== false);
        
        if (activeSessions.length === 0) {
            sessionsList.innerHTML = '<div class="no-sessions">No active sessions</div>';
            return;
        }

        sessionsList.innerHTML = activeSessions.map(session => `
            <div class="session-item">
                <div class="session-info">
                    <span class="session-name">${this.getSessionLabel(session)}</span>
                    <span class="session-status ${session.active ? 'active' : 'idle'}">
                        ${session.active ? '● Active' : '○ Idle'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    getSessionLabel(session) {
        if (session.label) return session.label;
        if (session.kind) return `${session.kind} Session`;
        return 'Unnamed Session';
    }

    getMockSessions() {
        return [
            {
                id: 'main',
                label: 'Jerry OS Builder',
                kind: 'agent',
                active: true,
                updated: Date.now()
            },
            {
                id: 'subagent-1',
                label: 'Mission Control Agent',
                kind: 'subagent',
                active: true,
                updated: Date.now()
            }
        ];
    }

    async loadCronHealth() {
        try {
            const response = await fetch('/api/crons');
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.updateCronHealth(data.result);
            }
        } catch (error) {
            console.log('Using mock cron data:', error);
            this.updateCronHealth(this.getMockCronData());
        }
    }

    updateCronHealth(cronData) {
        const totalCronsElement = document.getElementById('total-crons');
        const healthyCronsElement = document.getElementById('healthy-crons');
        const failedCronsElement = document.getElementById('failed-crons');
        const cronListElement = document.getElementById('cron-list');

        if (!cronData || cronData.length === 0) {
            totalCronsElement.textContent = '0';
            healthyCronsElement.textContent = '0';
            failedCronsElement.textContent = '0';
            cronListElement.innerHTML = '<div class="no-crons">No crons configured</div>';
            return;
        }

        const healthy = cronData.filter(c => c.status === 'healthy' || c.status === 'active').length;
        const failed = cronData.filter(c => c.status === 'failed' || c.status === 'error').length;

        totalCronsElement.textContent = cronData.length;
        healthyCronsElement.textContent = healthy;
        failedCronsElement.textContent = failed;

        if (failed > 0) {
            failedCronsElement.parentElement.classList.add('failed');
        } else {
            failedCronsElement.parentElement.classList.remove('failed');
        }

        cronListElement.innerHTML = cronData.slice(0, 5).map(cron => `
            <div class="cron-item">
                <span class="cron-name">${cron.name || cron.command || 'Unnamed Cron'}</span>
                <span class="cron-status ${cron.status === 'healthy' || cron.status === 'active' ? 'healthy' : 'failed'}">
                    ${cron.status}
                </span>
            </div>
        `).join('');
    }

    getMockCronData() {
        return [
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
            },
            {
                name: 'Project Status',
                schedule: '0 9,18 * * *',
                status: 'healthy',
                lastRun: Date.now()
            }
        ];
    }

    // Auto-refresh data
    startDataRefresh() {
        // Refresh Mission Control data every 30 seconds
        setInterval(() => {
            if (this.currentModule === 'ops') {
                this.loadMissionControlData();
            }
        }, 30000);
    }
}

// Initialize Jerry OS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jerryOS = new JerryOS();
    
    console.log('%c🤖 Jerry OS - Executive Assistant', 'color: #007AFF; font-size: 18px; font-weight: bold;');
    console.log('%cSystem initialized. Ready for operations.', 'color: #86868b; font-size: 14px;');
});
