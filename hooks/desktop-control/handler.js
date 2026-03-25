// Desktop Control Skill - Full System Automation Handler
const { DesktopController } = require('./desktop_controller');

class DesktopControlHandler {
  constructor() {
    this.controller = new DesktopController({
      failsafe: true,
      requireApproval: false // Full control mode as requested
    });
  }

  async handle(context) {
    const { event, message, session } = context;
    
    if (event !== 'message') return null;
    
    const text = (message?.content?.text || message?.text || '').toLowerCase();
    if (!text.includes('desktop') && !text.includes('mouse') && !text.includes('keyboard') && 
        !text.includes('click') && !text.includes('type') && !text.includes('screenshot') &&
        !text.includes('press') && !text.includes('move') && !text.includes('drag')) {
      return null;
    }

    try {
      // Parse commands from natural language
      if (text.includes('screenshot') || text.includes('capture screen')) {
        const screenshot = await this.controller.screenshot();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const path = `C:\\Users\\sscom\\screenshot_${timestamp}.png`;
        screenshot.save(path);
        return {
          type: 'assistant',
          content: `📸 Screenshot captured and saved to: ${path}`,
          actions: [{ type: 'file_send', filePath: path }]
        };
      }

      if (text.includes('click')) {
        const coords = this.extractCoordinates(text);
        if (coords) {
          await this.controller.moveMouse(coords.x, coords.y);
          await this.controller.click();
          return { type: 'assistant', content: `🖱️ Clicked at (${coords.x}, ${coords.y})` };
        }
      }

      if (text.includes('type') || text.includes('write')) {
        const textToType = this.extractTextToType(text);
        if (textToType) {
          await this.controller.typeText(textToType, { wpm: 80 });
          return { type: 'assistant', content: `⌨️ Typed: "${textToType}"` };
        }
      }

      if (text.includes('move mouse') || text.includes('move to')) {
        const coords = this.extractCoordinates(text);
        if (coords) {
          await this.controller.moveMouse(coords.x, coords.y, { duration: 0.5 });
          return { type: 'assistant', content: `🖱️ Moved mouse to (${coords.x}, ${coords.y})` };
        }
      }

      if (text.includes('hotkey') || text.includes('press') && text.includes('and')) {
        const keys = this.extractKeys(text);
        if (keys.length > 0) {
          await this.controller.hotkey(...keys);
          return { type: 'assistant', content: `⌨️ Executed: ${keys.join('+')}` };
        }
      }

      if (text.includes('get mouse position') || text.includes('where is mouse')) {
        const pos = await this.controller.getMousePosition();
        return { type: 'assistant', content: `🖱️ Mouse position: (${pos.x}, ${pos.y})` };
      }

      if (text.includes('drag') || text.includes('drag from')) {
        const coords = this.extractDragCoordinates(text);
        if (coords) {
          await this.controller.drag(coords.startX, coords.startY, coords.endX, coords.endY);
          return { type: 'assistant', content: `🖱️ Dragged from (${coords.startX}, ${coords.startY}) to (${coords.endX}, ${coords.endY})` };
        }
      }

      return { type: 'assistant', content: '❓ Desktop control command not understood. Try: "click at 500 300", "type hello", "screenshot", "move mouse to 100 200"' };

    } catch (err) {
      return { type: 'assistant', content: `❌ Error: ${err.message}` };
    }
  }

  extractCoordinates(text) {
    const match = text.match(/(\d+)\s+(\d+)/);
    if (match) {
      return { x: parseInt(match[1]), y: parseInt(match[2]) };
    }
    return null;
  }

  extractDragCoordinates(text) {
    const matches = text.match(/(\d+)\s+(\d+).*?(\d+)\s+(\d+)/);
    if (matches) {
      return {
        startX: parseInt(matches[1]),
        startY: parseInt(matches[2]),
        endX: parseInt(matches[3]),
        endY: parseInt(matches[4])
      };
    }
    return null;
  }

  extractTextToType(text) {
    const match = text.match(/(?:type|write)\s+(?:"([^"]+)"|'([^']+)'|(.+?))(?:\s|$)/i);
    if (match) {
      return match[1] || match[2] || match[3];
    }
    return null;
  }

  extractKeys(text) {
    const keyMap = {
      'ctrl': 'ctrl', 'control': 'ctrl',
      'shift': 'shift',
      'alt': 'alt',
      'win': 'win', 'windows': 'win',
      'cmd': 'command', 'command': 'command',
      'c': 'c', 'v': 'v', 'x': 'x', 'z': 'z', 'a': 'a', 's': 's',
      'enter': 'enter', 'return': 'enter',
      'esc': 'esc', 'escape': 'esc',
      'tab': 'tab',
      'space': 'space', 'spacebar': 'space'
    };
    
    const keys = [];
    const words = text.split(/[\s+,+]/);
    
    for (const word of words) {
      const clean = word.toLowerCase().trim();
      if (keyMap[clean]) {
        keys.push(keyMap[clean]);
      }
    }
    
    return keys;
  }
}

const handler = new DesktopControlHandler();
module.exports = (ctx) => handler.handle(ctx);