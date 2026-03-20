// Premium Jerry OS - JavaScript

class PremiumJerryOS {
    constructor() {
        this.init();
    }

    init() {
        this.setupDock();
        this.setupPrompt();
        this.animateElements();
        console.log('%c🤖 Premium Jerry OS', 'color: #007AFF; font-size: 20px; font-weight: bold;');
        console.log('%cSuper duper premium interface loaded', 'color: #86868b; font-size: 14px;');
    }

    setupDock() {
        const dockItems = document.querySelectorAll('.dock-item');
        dockItems.forEach(item => {
            item.addEventListener('click', () => {
                const module = item.dataset.module;
                this.switchModule(module);
            });

            // Premium hover effects
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.08) translateY(-8px)';
            });

            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('premium-active')) {
                    item.style.transform = 'scale(1) translateY(0)';
                }
            });
        });
    }

    switchModule(moduleName) {
        // Update dock
        document.querySelectorAll('.dock-item').forEach(item => {
            item.classList.remove('premium-active');
            item.style.transform = 'scale(1) translateY(0)';
        });

        const activeItem = document.querySelector(`[data-module="${moduleName}"]`);
        if (activeItem) {
            activeItem.classList.add('premium-active');
            activeItem.style.transform = 'scale(1.05) translateY(-4px)';
        }

        // Update modules
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('premium-active');
        });

        const targetModule = document.getElementById(`premium-${moduleName}`);
        if (targetModule) {
            targetModule.classList.add('premium-active');
        }
    }

    setupPrompt() {
        const promptInput = document.querySelector('.premium-input');
        const sendButton = document.querySelector('.premium-button');

        if (promptInput && sendButton) {
            promptInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendPrompt();
                }
            });

            sendButton.addEventListener('click', () => {
                this.sendPrompt();
            });
        }
    }

    sendPrompt() {
        const promptInput = document.querySelector('.premium-input');
        const promptHistory = document.querySelector('.prompt-history');

        if (promptInput && promptInput.value.trim() && promptHistory) {
            const message = promptInput.value.trim();
            
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'message';
            userMessage.innerHTML = `
                <div class="message-content">
                    <p>${this.escapeHtml(message)}</p>
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
            `;
            promptHistory.appendChild(userMessage);

            // Clear input
            promptInput.value = '';

            // Scroll to bottom
            promptHistory.scrollTop = promptHistory.scrollHeight;

            // Simulate Jerry's response
            setTimeout(() => {
                this.addJerryResponse(message);
            }, 1000);
        }
    }

    addJerryResponse(userMessage) {
        const promptHistory = document.querySelector('.prompt-history');
        if (!promptHistory) return;

        const responses = [
            "I've processed your request and updated the system accordingly.",
            "Command executed successfully. The changes have been applied.",
            "I'm on it! Your request is being handled by the appropriate agent.",
            "System updated. Everything is running smoothly now.",
            "Task completed. The operation was successful."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const jerryMessage = document.createElement('div');
        jerryMessage.className = 'message jerry-message';
        jerryMessage.innerHTML = `
            <i data-lucide="bot" class="message-icon"></i>
            <div class="message-content">
                <p>${randomResponse}</p>
                <span class="message-time">${this.getCurrentTime()}</span>
            </div>
        `;

        promptHistory.appendChild(jerryMessage);
        
        // Update Lucide icons
        lucide.createIcons();
        
        // Scroll to bottom
        promptHistory.scrollTop = promptHistory.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    animateElements() {
        // Animate cards on load
        setTimeout(() => {
            const cards = document.querySelectorAll('.premium-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'all 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 100);
            });
        }, 500);

        // Animate metric bars
        setTimeout(() => {
            const metricBars = document.querySelectorAll('.metric-fill');
            metricBars.forEach(bar => {
                bar.style.width = bar.style.width;
            });
        }, 1000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.premiumJerryOS = new PremiumJerryOS();
});