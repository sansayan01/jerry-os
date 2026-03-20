// Gateway Auto-Restart Monitor
// This script monitors the OpenClaw gateway and restarts it if it crashes

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class GatewayMonitor {
    constructor() {
        this.isRunning = false;
        this.restartAttempts = 0;
        this.maxRestarts = 5;
        this.restartDelay = 10000; // 10 seconds
        this.checkInterval = 30000; // Check every 30 seconds
        this.logFile = path.join(__dirname, 'gateway-monitor.log');
    }

    start() {
        console.log('🔍 Gateway Monitor Started');
        this.log('Gateway Monitor initialized');
        
        // Start monitoring
        this.startMonitoring();
        
        // Initial gateway start
        this.startGateway();
    }

    startMonitoring() {
        // Check gateway health periodically
        setInterval(() => {
            this.checkGatewayHealth();
        }, this.checkInterval);
    }

    async checkGatewayHealth() {
        try {
            // Try to get OpenClaw status
            const status = await this.getOpenClawStatus();
            
            if (status && status.includes('running')) {
                this.isRunning = true;
                this.restartAttempts = 0; // Reset attempts on success
                this.log('Gateway health check: OK');
            } else {
                this.log('Gateway not responding, status: ' + status);
                this.handleCrash();
            }
        } catch (error) {
            this.log('Gateway health check failed: ' + error.message);
            this.handleCrash();
        }
    }

    async getOpenClawStatus() {
        return new Promise((resolve, reject) => {
            exec('openclaw gateway status', { timeout: 5000 }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout.toLowerCase());
                }
            });
        });
    }

    async handleCrash() {
        if (this.restartAttempts >= this.maxRestarts) {
            this.log('Max restart attempts reached. Manual intervention required.');
            return;
        }

        this.restartAttempts++;
        this.log(`Gateway crash detected. Restart attempt ${this.restartAttempts}/${this.maxRestarts}`);
        
        // Wait before restart
        await this.sleep(this.restartDelay);
        
        // Restart gateway
        this.startGateway();
    }

    startGateway() {
        this.log('Starting OpenClaw gateway...');
        
        const gateway = spawn('openclaw', ['gateway', 'start'], {
            stdio: 'inherit',
            shell: true
        });

        gateway.on('error', (error) => {
            this.log('Failed to start gateway: ' + error.message);
        });

        gateway.on('close', (code) => {
            if (code !== 0) {
                this.log('Gateway process exited with code: ' + code);
                this.isRunning = false;
            } else {
                this.log('Gateway started successfully');
                this.isRunning = true;
            }
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        
        console.log(logMessage.trim());
        
        // Append to log file
        fs.appendFileSync(this.logFile, logMessage);
    }
}

// Start the monitor
const monitor = new GatewayMonitor();
monitor.start();

module.exports = GatewayMonitor;
