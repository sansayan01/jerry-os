// Ultra Premium Jerry OS - Executive JavaScript

class UltraPremiumJerryOS {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupCommandInterface();
        this.animateSystem();
        this.startSystemMonitoring();
        console.log('%c🚀 Ultra Premium Jerry OS', 
            'color: #6366f1; font-size: 20px; font-weight: bold;');
        console.log('%cExecutive interface initialized', 
            'color: #a1a1aa; font-size: 14px;');
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });

            // Premium hover effects
            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains('active')) {
                    item.style.transform = 'translateY(-2px)';
                    item.style.background = 'rgba(255, 255, 255, 0.05)';
                }
            });

            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('active')) {
                    item.style.transform = 'translateY(0)';
                    item.style.background = 'transparent';
                }
            });
        });
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            item.style.transform = 'translateY(0)';
            item.style.background = 'transparent';
        });

        const activeItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        this.currentSection = sectionName;
        
        // Show section-specific content
        this.showSectionContent(sectionName);
    }

    showSectionContent(sectionName) {
        // For now, we'll just log the section change
        // In a full implementation, this would load different content
        console.log(`Switched to section: ${sectionName}`);
        
        // Add a subtle animation to indicate section change
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.style.opacity = '0';
            setTimeout(() => {
                contentArea.style.transition = 'opacity 0.3s ease';
                contentArea.style.opacity = '1';
            }, 50);
        }
    }

    setupCommandInterface() {
        const commandInput = document.querySelector('.executive-input');
        const commandButton = document.querySelector('.executive-command-button');

        if (commandInput && commandButton) {
            commandInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.executeCommand();
                }
            });

            commandButton.addEventListener('click', () => {
                this.executeCommand();
            });

            // Input focus effect
            commandInput.addEventListener('focus', () => {
                commandInput.parentElement.style.borderColor = '#6366f1';
                commandInput.parentElement.style.background = 'rgba(255, 255, 255, 0.05)';
            });

            commandInput.addEventListener('blur', () => {
                commandInput.parentElement.style.borderColor = '';
                commandInput.parentElement.style.background = '';
            });
        }
    }

    executeCommand() {
        const commandInput = document.querySelector('.executive-input');
        const commandHistory = document.querySelector('.command-history');

        if (commandInput && commandInput.value.trim() && commandHistory) {
            const command = commandInput.value.trim();
            
            // Add user command to history
            this.addCommandMessage(command, 'user');
            
            // Clear input
            commandInput.value = '';
            
            // Process command (simulated)
            setTimeout(() => {
                this.processCommand(command);
            }, 800);
        }
    }

    addCommandMessage(content, type = 'executive') {
        const commandHistory = document.querySelector('.command-history');
        if (!commandHistory) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `command-message ${type}`;
        
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
                <i data-lucide="cpu" class="message-icon"></i>
                <div class="message-content">
                    <p>${this.escapeHtml(content)}</p>
                    <span class="message-time">${timestamp}</span>
                </div>
            `;
        }

        commandHistory.appendChild(messageDiv);
        
        // Update Lucide icons if needed
        lucide.createIcons();
        
        // Scroll to bottom
        commandHistory.scrollTop = commandHistory.scrollHeight;
    }

    processCommand(command) {
        const responses = [
            "Command processed successfully. System updated.",
            "Executive directive executed. Changes applied across all modules.",
            "AI core responding. Task queued for immediate execution.",
            "Directive acknowledged. Operational parameters adjusted.",
            "Command received and processed. System status optimal."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addCommandMessage(randomResponse, 'executive');

        // Simulate system update effects
        this.simulateSystemUpdate();
    }

    simulateSystemUpdate() {
        // Add subtle animations to show system activity
        const cards = document.querySelectorAll('.status-card');
        cards.forEach(card => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.35)';
            
            setTimeout(() => {
                card.style.transform = '';
                card.style.boxShadow = '';
            }, 300);
        });

        // Animate performance bars
        const performanceBars = document.querySelectorAll('.performance-fill, .metric-fill');
        performanceBars.forEach(bar => {
            const currentWidth = bar.style.width;
            bar.style.width = '0';
            
            setTimeout(() => {
                bar.style.transition = 'width 0.8s ease';
                bar.style.width = currentWidth;
            }, 100);
        });
    }

    animateSystem() {
        // Initial animation sequence
        setTimeout(() => {
            // Animate cards in
            const cards = document.querySelectorAll('.status-card');
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

            // Animate performance bars
            setTimeout(() => {
                const bars = document.querySelectorAll('.performance-fill, .metric-fill');
                bars.forEach(bar => {
                    bar.style.width = bar.style.width;
                });
            }, 500);

        }, 300);

        // Continuous subtle animations
        this.startAmbientAnimations();
    }

    startAmbientAnimations() {
        // Subtle glow effects
        setInterval(() => {
            const premiumCards = document.querySelectorAll('.status-card.premium');
            premiumCards.forEach(card => {
                card.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.2)';
                
                setTimeout(() => {
                    card.style.boxShadow = '';
                }, 1000);
            });
        }, 5000);

        // Gentle floating effect for command bar
        setInterval(() => {
            const commandBar = document.querySelector('.command-bar');
            if (commandBar) {
                commandBar.style.transform = 'translateY(1px)';
                
                setTimeout(() => {
                    commandBar.style.transform = 'translateY(0)';
                }, 1000);
            }
        }, 8000);
    }

    startSystemMonitoring() {
        // Simulate live system updates
        setInterval(() => {
            this.updateSystemMetrics();
        }, 30000);
    }

    updateSystemMetrics() {
        // Simulate metric updates
        const metrics = document.querySelectorAll('.metric-value, .performance-value');
        metrics.forEach(metric => {
            const currentValue = parseInt(metric.textContent);
            const fluctuation = Math.random() * 10 - 5; // -5 to +5
            const newValue = Math.max(0, Math.min(100, currentValue + fluctuation));
            
            metric.textContent = Math.round(newValue) + '%';
            
            // Update corresponding bars
            const bar = metric.closest('.metric-visual, .performance-indicator')?.querySelector('.metric-fill, .performance-fill');
            if (bar) {
                bar.style.width = newValue + '%';
            }
        });

        // Add a subtle activity indicator
        this.addCommandMessage("System metrics updated. All systems nominal.", 'executive');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ultraPremiumJerryOS = new UltraPremiumJerryOS();
});