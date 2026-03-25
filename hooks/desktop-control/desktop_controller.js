// Desktop Controller - Node.js wrapper for Python PyAutoGUI bridge
const { spawn } = require('child_process');
const path = require('path');

class DesktopController {
  constructor(options = {}) {
    this.failsafe = options.failsafe !== false;
    this.requireApproval = options.requireApproval || false;
    this.pythonProcess = null;
    this.initialized = false;
    this.commandQueue = [];
    this.requestId = 0;
    this.pendingRequests = new Map();
    
    this._init();
  }
  
  async _init() {
    const pythonScript = path.join(__dirname, 'desktop_controller.py');
    
    this.pythonProcess = spawn('python', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    this.pythonProcess.stdout.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      for (const line of lines) {
        if (line) {
          try {
            const response = JSON.parse(line);
            if (response.requestId && this.pendingRequests.has(response.requestId)) {
              const { resolve, reject } = this.pendingRequests.get(response.requestId);
              this.pendingRequests.delete(response.requestId);
              
              if (response.success) {
                resolve(response.result);
              } else {
                reject(new Error(response.error));
              }
            }
          } catch (e) {
            console.error('Invalid response:', line);
          }
        }
      }
    });
    
    this.pythonProcess.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
    });
    
    this.pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      this.initialized = false;
    });
    
    this.initialized = true;
  }
  
  async _sendCommand(method, args = [], kwargs = {}) {
    if (!this.initialized) {
      throw new Error('Desktop controller not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const requestId = ++this.requestId;
      this.pendingRequests.set(requestId, { resolve, reject });
      
      const command = JSON.stringify({
        requestId,
        method,
        args,
        kwargs
      });
      
      this.pythonProcess.stdin.write(command + '\n');
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Command timeout'));
        }
      }, 30000);
    });
  }
  
  // Mouse functions
  async moveMouse(x, y, options = {}) {
    const duration = options.duration || 0;
    return this._sendCommand('move_mouse', [x, y], { duration });
  }
  
  async moveRelative(xOffset, yOffset, duration = 0) {
    return this._sendCommand('move_relative', [xOffset, yOffset], { duration });
  }
  
  async click(x, y, options = {}) {
    const button = options.button || 'left';
    const clicks = options.clicks || 1;
    
    if (x !== undefined && y !== undefined) {
      return this._sendCommand('click', [x, y], { button, clicks });
    }
    return this._sendCommand('click', [], { button, clicks });
  }
  
  async drag(startX, startY, endX, endY, duration = 0.5) {
    return this._sendCommand('drag', [startX, startY, endX, endY], { duration });
  }
  
  async scroll(clicks, direction = 'vertical') {
    return this._sendCommand('scroll', [clicks], { direction });
  }
  
  async getMousePosition() {
    const result = await this._sendCommand('get_mouse_position');
    return { x: result.x, y: result.y };
  }
  
  // Keyboard functions
  async typeText(text, options = {}) {
    const interval = options.interval || 0;
    const wpm = options.wpm || null;
    return this._sendCommand('type_text', [text], { interval, wpm });
  }
  
  async press(key, presses = 1) {
    return this._sendCommand('press', [key], { presses });
  }
  
  async hotkey(...keys) {
    return this._sendCommand('hotkey', keys);
  }
  
  async keyDown(key) {
    return this._sendCommand('key_down', [key]);
  }
  
  async keyUp(key) {
    return this._sendCommand('key_up', [key]);
  }
  
  // Screen functions
  async screenshot(options = {}) {
    const region = options.region || null;
    return this._sendCommand('screenshot', [], { region });
  }
  
  async getPixelColor(x, y) {
    const result = await this._sendCommand('get_pixel_color', [x, y]);
    return { r: result.r, g: result.g, b: result.b };
  }
  
  async getScreenSize() {
    const result = await this._sendCommand('get_screen_size');
    return { width: result.width, height: result.height };
  }
  
  async findOnScreen(imagePath, confidence = 0.8) {
    return this._sendCommand('find_on_screen', [imagePath], { confidence });
  }
  
  // Window functions
  async getAllWindows() {
    return this._sendCommand('get_all_windows');
  }
  
  async activateWindow(titleSubstring) {
    return this._sendCommand('activate_window', [titleSubstring]);
  }
  
  // Cleanup
  dispose() {
    if (this.pythonProcess) {
      this.pythonProcess.kill();
      this.pythonProcess = null;
      this.initialized = false;
    }
  }
}

module.exports = { DesktopController };