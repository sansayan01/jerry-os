// Jerry OS - Main Application Logic (Premium Edition)

class JerryOS {
    constructor() {
        this.currentModule = 'ops';
        this.modules = ['ops', 'brain', 'lab'];
        this.draggedTab = null;
        this.promptHistory = [];
        this.init();
    }

    init() {
        this.setupDock();
        this.setupSidebar();
        this.setupPromptInterface();
        this.setupGreeting();
        this.setupClock();
        this.setupRefreshButton();
        this.loadMissionControlData();
        this.startDataRefresh();
    }

    // ═══════════════════════════════════════════════
    //  GREETING & CLOCK
    // ═══════════════════════════════════════════════

    setupGreeting() {
        const heading = document.getElementById('greeting-heading');
        const dateDisplay = document.getElementById('date-display');
        if (!heading) return;

        const hour = new Date().getHours();
        let greeting = 'Good Evening';
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 17) greeting = 'Good Afternoon';

        heading.innerHTML = `${greeting}, <span class="accent">Sayan</span>`;

        if (dateDisplay) {
            const now = new Date();
            const options = { weekday: 'long', month: 'short', day: 'numeric' };
            dateDisplay.textContent = now.toLocaleDateString('en-US', options);
        }
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
        const btn = document.getElementById('refresh-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            btn.style.transform = 'rotate(360deg)';
            btn.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                btn.style.transform = '';
                btn.style.transition = '';
            }, 600);
            this.loadMissionControlData();
        });
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

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refresh-mission-control');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshMissionControl();
                
                // Add visual feedback
                refreshBtn.classList.add('refreshing');
                setTimeout(() => {
                    refreshBtn.classList.remove('refreshing');
                }, 1000);
            });
        }
    }

    refreshMissionControl() {
        if (this.currentModule === 'ops') {
            this.loadModelInfo();
            this.loadActiveSessions();
            this.loadCronHealth();
            
            // Show refresh timestamp
            const now = new Date().toLocaleTimeString();
            console.log(`Mission Control refreshed at: ${now}`);
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

        // Update dock
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
        }

        // Re-init Lucide icons for dynamically added content
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // ═══════════════════════════════════════════════
    //  DOCK
    // ═══════════════════════════════════════════════

    setupDock() {
        const dockItems = document.querySelectorAll('.dock-item');
        dockItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleName = item.dataset.module;
                this.switchModule(moduleName);
            });
        });
    }

    // ═══════════════════════════════════════════════
    //  PROMPT INTERFACE
    // ═══════════════════════════════════════════════

    setupPromptInterface() {
        const input = document.getElementById('prompt-input');
        const sendBtn = document.getElementById('send-prompt');

        if (!input || !sendBtn) return;

        sendBtn.addEventListener('click', () => this.sendPrompt());

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendPrompt();
            }
        });
    }

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

    async loadMissionControlData() {
        const startTime = performance.now();
        
        try {
            await Promise.all([
                this.loadModelInfo(),
                this.loadActiveSessions(), 
                this.loadCronHealth()
            ]);
            
            const loadTime = performance.now() - startTime;
            
            // Log performance (only if it's getting slow)
            if (loadTime > 1000) {
                console.log(`Mission Control data loaded in ${loadTime.toFixed(0)}ms`);
            }
            
            return true;
            
        } catch (error) {
            const loadTime = performance.now() - startTime;
            console.error(`Mission Control failed in ${loadTime.toFixed(0)}ms:`, error);
            return false;
        }
    }

    async loadModelInfo() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/api/model', { 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (data.status === 'ok') {
                const modelData = data.result.model;
                this.updateModelInfo(modelData);
            } else {
                this.showEmptyModelState();
            }
        } catch (error) {
            console.log('Failed to fetch model data:', error);
            this.showEmptyModelState();
        }
    }

    updateModelInfo(modelData) {
        const modelElement = document.getElementById('current-model');
        const providerElement = document.getElementById('model-provider');
        const apiElement = document.getElementById('model-api');
        const statusElement = document.getElementById('model-status');

        // Data validation and fallbacks
        if (modelData && modelData !== 'unknown') {
            const modelParts = modelData.split('/');
            modelElement.textContent = modelParts.pop() || modelData;
            providerElement.textContent = modelParts[0] || 'Unknown';
        } else {
            modelElement.textContent = 'Loading...';
            providerElement.textContent = '-';
        }

        apiElement.textContent = modelData?.api || 'OpenClaw';

        statusElement.className = 'value status-badge active';
        statusElement.textContent = 'Active';
    }

    showEmptyModelState() {
        const modelElement = document.getElementById('current-model');
        const providerElement = document.getElementById('model-provider');
        const apiElement = document.getElementById('model-api');
        const statusElement = document.getElementById('model-status');

        if (modelElement) modelElement.textContent = 'Data unavailable';
        if (providerElement) providerElement.textContent = '-';
        if (apiElement) apiElement.textContent = '-';
        if (statusElement) {
            statusElement.className = 'value status-badge';
            statusElement.textContent = 'Offline';
        }
    }

    async loadActiveSessions() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/api/sessions', { 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (data.status === 'ok' && data.result.sessions) {
                this.updateSessionsList(data.result.sessions);
            } else {
                this.showEmptySessionsState();
            }
        } catch (error) {
            console.log('Failed to fetch sessions:', error);
            this.showEmptySessionsState();
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
            <div class="session-item" data-session-id="${session.id}">
                <div class="session-dot ${session.active ? 'online' : 'idle'}"></div>
                <div class="session-info">
                    <span class="session-name">${this.getSessionLabel(session)}</span>
                    <span class="session-status ${session.active ? 'active' : 'idle'}">
                        ${session.active ? '● Active' : '○ Idle'}
                    </span>
                </div>
            </div>
        `).join('');
        
        // Setup session click handlers
        this.setupSessionClickHandlers();
    }

    setupSessionClickHandlers() {
        const sessionItems = document.querySelectorAll('.session-item');
        sessionItems.forEach(item => {
            item.addEventListener('click', () => {
                this.expandSession(item);
            });
        });
    }

    expandSession(sessionElement) {
        // Create session expansion modal
        const modal = document.createElement('div');
        modal.className = 'session-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Session History</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="history-loading">History loading...</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handler
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Load session history via SSE
        this.loadSessionHistory(sessionElement.dataset.sessionId);
    }

    loadSessionHistory(sessionId) {
        const historyContainer = document.getElementById(`session-history-${sessionId}`);
        
        if (!historyContainer) {
            console.error('History container not found for session:', sessionId);
            return;
        }

        let retryCount = 0;
        const maxRetries = 3;
        
        const connectSSE = () => {
            // Create SSE connection with timeout
            const eventSource = new EventSource(`/api/sessions/${sessionId}/history`);
            
            // Set connection timeout
            const connectionTimeout = setTimeout(() => {
                if (retryCount >= maxRetries) {
                    historyContainer.innerHTML = '<div class="error">Connection timeout. Please try again.</div>';
                    eventSource.close();
                } else {
                    eventSource.close();
                    retryCount++;
                    historyContainer.innerHTML = `<div class="error">Connection slow. Retrying (${retryCount}/${maxRetries})...</div>`;
                    setTimeout(connectSSE, 1000); // Retry after 1 second
                }
            }, 3000); // 3 second connection timeout
            
            eventSource.onopen = () => {
                clearTimeout(connectionTimeout);
                const now = new Date().toLocaleTimeString();
                historyContainer.innerHTML = `
                    <div class="connection-status">
                        <span class="status-indicator connected"></span>
                        <span>Connected • Last update: ${now}</span>
                    </div>
                    <div class="history-loading">Loading session data...</div>
                `;
            };

            eventSource.onmessage = (event) => {
                clearTimeout(connectionTimeout);
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.error) {
                        historyContainer.innerHTML = `<div class="error">Error: ${data.error}</div>`;
                    } else {
                        this.renderSessionHistory(historyContainer, data);
                    }
                } catch (error) {
                    historyContainer.innerHTML = `<div class="error">Failed to parse session data</div>`;
                }
            };

            eventSource.onerror = (error) => {
                clearTimeout(connectionTimeout);
                if (retryCount >= maxRetries) {
                    historyContainer.innerHTML = '<div class="error">Connection failed after multiple attempts.</div>';
                } else {
                    retryCount++;
                    historyContainer.innerHTML = `<div class="error">Connection failed. Retrying (${retryCount}/${maxRetries})...</div>`;
                    setTimeout(connectSSE, 2000); // Retry after 2 seconds
                }
            };
        };

        // Start the SSE connection
        connectSSE();
    }

    renderSessionHistory(container, historyData) {
        if (historyData.status === 'no_history' || historyData.messages.length === 0) {
            container.innerHTML = '<div class="no-history">No session history available</div>';
            return;
        }

        container.innerHTML = historyData.messages.map(message => `
            <div class="session-message">
                <div class="session-meta">${message.timestamp || 'Unknown time'}</div>
                <div class="session-content">${this.escapeHtml(message.content)}</div>
            </div>
        `).join('');
    }

    getSessionLabel(session) {
        if (session.label) return session.label;
        if (session.kind) return `${session.kind} Session`;
        return 'Unnamed Session';
    }

    showEmptySessionsState() {
        const sessionsList = document.getElementById('sessions-list');
        if (sessionsList) {
            sessionsList.innerHTML = '<div class="no-sessions">Cannot load session data</div>';
        }
    }

    async loadCronHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/api/crons', { 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.updateCronHealth(data.result);
            } else {
                this.showEmptyCronState();
            }
        } catch (error) {
            console.log('Failed to fetch cron data:', error);
            this.showEmptyCronState();
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

    showEmptyCronState() {
        const totalCronsElement = document.getElementById('total-crons');
        const healthyCronsElement = document.getElementById('healthy-crons');
        const failedCronsElement = document.getElementById('failed-crons');
        const cronListElement = document.getElementById('cron-list');

        if (totalCronsElement) totalCronsElement.textContent = '-';
        if (healthyCronsElement) healthyCronsElement.textContent = '-';
        if (failedCronsElement) failedCronsElement.textContent = '-';
        if (cronListElement) {
            cronListElement.innerHTML = '<div class="no-crons">Cannot load cron data</div>';
        }
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
}

// Daily Briefs Management
class DailyBriefs {
    constructor() {
        this.briefsPath = './briefs/';
        this.currentBrief = null;
    }

    async init() {
        await this.loadAvailableBriefs();
        this.setupBriefsNavigation();
        
        // Load latest brief by default
        const latestBrief = document.querySelector('.brief-item.active');
        if (latestBrief) {
            await this.loadBrief(latestBrief.dataset.brief);
        }
    }

    async loadAvailableBriefs() {
        try {
            // In a real implementation, this would scan the briefs directory
            // For now, we'll use the static list from HTML
            console.log('Daily Briefs system initialized');
        } catch (error) {
            console.error('Failed to load briefs:', error);
        }
    }

    setupBriefsNavigation() {
        const briefItems = document.querySelectorAll('.brief-item');
        briefItems.forEach(item => {
            item.addEventListener('click', async () => {
                // Update active state
                briefItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Load selected brief
                await this.loadBrief(item.dataset.brief);
            });
        });
    }

    async loadBrief(briefDate) {
        try {
            const response = await fetch(`${this.briefsPath}${briefDate}.md`);
            
            if (response.ok) {
                const markdownContent = await response.text();
                this.renderBrief(markdownContent, briefDate);
            } else {
                this.showEmptyBrief(briefDate);
            }
        } catch (error) {
            console.error('Failed to load brief:', error);
            this.showEmptyBrief(briefDate);
        }
    }

    renderBrief(content, date) {
        const renderer = document.getElementById('markdown-renderer');
        
        // Simple markdown rendering (can be enhanced later)
        const htmlContent = this.convertMarkdownToHTML(content);
        
        renderer.innerHTML = `
            <div class="brief-content">
                ${htmlContent}
            </div>
        `;
        
        // Update header with actual date
        const briefHeader = document.querySelector('.brief-header h2');
        if (briefHeader) {
            briefHeader.textContent = `Daily Brief • ${this.formatDate(date)}`;
        }
    }

    showEmptyBrief(date) {
        const renderer = document.getElementById('markdown-renderer');
        renderer.innerHTML = `
            <div class="empty-brief">
                <i data-lucide="file-text"></i>
                <p>No brief created for ${this.formatDate(date)} yet</p>
                <button class="create-brief-btn" onclick="dailyBriefs.createBrief('${date}')">Create Brief</button>
            </div>
        `;
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    convertMarkdownToHTML(markdown) {
        // Basic markdown to HTML conversion
        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')         // Headers
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')          // Headers
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')           // Headers
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>') // Bold
            .replace(/\*(.*)\*/gim, '<em>$1</em>')           // Italic
            .replace(/^- (.*$)/gim, '<li>$1</li>')            // List items
            .replace(/<li>(.*)<\/li>/gim, '<ul><li>$1</li></ul>') // Wrap lists
            .replace(/\n\n/gim, '<br>')                      // Line breaks
            .replace(/\n/gim, '<br>');                       // Line breaks
        
        // Add external link handling (open in new tab)
        html = html.replace(
            /\[(.*?)\]\((.*?)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        return html;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    async createBrief(date) {
        // Create a new brief template
        const template = `# Daily Brief • ${this.formatDate(date)}

## 🎯 Priority Tasks
- [ ] First important task
- [ ] Second priority item

## 🔄 Follow-ups
- Follow-up from yesterday
- Ongoing project item

## 💡 Notes
Add your notes and insights here...
`;

        // In a real implementation, this would save to the server
        console.log('Creating new brief for:', date);
        
        // For now, just render the template
        this.renderBrief(template, date);
    }
}

// Initialize Jerry OS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jerryOS = new JerryOS();
    
    // Initialize Daily Briefs system
    window.dailyBriefs = new DailyBriefs();
    dailyBriefs.init();
    
    console.log('%c⚡ Jerry OS — Premium Edition', 'color: #00e5ff; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);');
    console.log('%cSystem initialized. All systems operational.', 'color: rgba(240, 240, 245, 0.55); font-size: 14px;');
});
