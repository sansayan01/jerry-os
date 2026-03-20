// Neo Executive Jerry OS - Clean Modern JavaScript

class NeoExecutive {
    constructor() {
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupCommandInterface();
        this.animateElements();
        console.log('%c🎯 Neo Executive Jerry OS', 
            'color: #3b82f6; font-size: 18px; font-weight: bold;');
        console.log('%cClean modern interface initialized', 
            'color: #64748b; font-size: 14px;');
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.switchView(view);
            });

            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains('active')) {
                    item.style.background = '#f1f5f9';
                }
            });

            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('active')) {
                    item.style.background = '';
                }
            });
        });
    }

    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            item.style.background = '';
        });

        const activeItem = document.querySelector(`[data-view="${viewName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.currentView = viewName;
    }

    setupCommandInterface() {
        const commandInput = document.querySelector('.command-input textarea');
        const sendButton = document.querySelector('.send-button');

        if (commandInput && sendButton) {
            commandInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.executeCommand();
                }
            });

            sendButton.addEventListener('click', () => {
                this.executeCommand();
            });

            // Input focus effect
            commandInput.addEventListener('focus', () => {
                commandInput.style.borderColor = '#3b82f6';
                commandInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            });

            commandInput.addEventListener('blur', () => {
                commandInput.style.borderColor = '';
                commandInput.style.boxShadow = '';
            });
        }
    }

    executeCommand() {
        const commandInput = document.querySelector('.command-input textarea');
        const commandHistory = document.querySelector('.command-history');

        if (commandInput && commandInput.value.trim() && commandHistory) {
            const command = commandInput.value.trim();
            
            // Add user command
            this.addCommandMessage(command, 'user');
            
            // Clear input
            commandInput.value = '';
            
            // Process command
            setTimeout(() => {
                this.processCommand(command);
            }, 600);
        }
    }

    addCommandMessage(content, type = 'executive') {
        const commandHistory = document.querySelector('.command-history');
        if (!commandHistory) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type === 'executive' ? 'executive' : ''}`;
        
        const timestamp = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${this.escapeHtml(content)}</p>
                    <span class="message-time">${timestamp}</span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <i data-lucide="cpu"></i>
                <div class="message-content">
                    <p>${this.escapeHtml(content)}</p>
                    <span class="message-time">${timestamp}</span>
                </div>
            `;
        }

        commandHistory.appendChild(messageDiv);
        
        // Update Lucide icons
        lucide.createIcons();
        
        // Scroll to bottom
        commandHistory.scrollTop = commandHistory.scrollHeight;
    }

    processCommand(command) {
        const responses = [
            "Command processed successfully. System updated.",
            "Executive directive executed. Changes applied.",
            "AI core responding. Task queued for execution.",
            "Directive acknowledged. Operational parameters adjusted.",
            "Command received and processed. System status optimal."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addCommandMessage(randomResponse, 'executive');

        // Visual feedback
        this.showSystemActivity();
    }

    showSystemActivity() {
        // Animate cards
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach(card => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            
            setTimeout(() => {
                card.style.transform = '';
                card.style.boxShadow = '';
            }, 300);
        });

        // Animate performance bars
        const bars = document.querySelectorAll('.performance-fill, .metric-fill');
        bars.forEach(bar => {
            const currentWidth = bar.style.width;
            bar.style.width = '0';
            
            setTimeout(() => {
                bar.style.transition = 'width 0.6s ease';
                bar.style.width = currentWidth;
            }, 50);
        });
    }

    animateElements() {
        // Initial animations
        setTimeout(() => {
            // Animate cards in
            const cards = document.querySelectorAll('.stat-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 100);
            });

            // Animate performance bars
            setTimeout(() => {
                const bars = document.querySelectorAll('.performance-fill, .metric-fill');
                bars.forEach(bar => {
                    bar.style.width = bar.style.width;
                });
            }, 400);

        }, 200);

        // Continuous subtle animations
        this.startSubtleAnimations();
    }

    startSubtleAnimations() {
        // Gentle card hover effects
        setInterval(() => {
            const cards = document.querySelectorAll('.stat-card');
            const randomCard = cards[Math.floor(Math.random() * cards.length)];
            
            if (randomCard) {
                randomCard.style.transform = 'translateY(-2px)';
                
                setTimeout(() => {
                    randomCard.style.transform = '';
                }, 1000);
            }
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.neoExecutive = new NeoExecutive();
});