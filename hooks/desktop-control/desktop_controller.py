# Desktop Controller - Python bridge for PyAutoGUI
import pyautogui
import json
import sys
import os

class DesktopController:
    def __init__(self, failsafe=True, requireApproval=False):
        pyautogui.FAILSAFE = failsafe
        self.requireApproval = requireApproval
        
    def move_mouse(self, x, y, duration=0):
        """Move mouse to absolute coordinates"""
        if self.requireApproval:
            if not self._confirm(f"Move mouse to ({x}, {y})?"):
                return False
        pyautogui.moveTo(x, y, duration=duration)
        return True
        
    def move_relative(self, x_offset, y_offset, duration=0):
        """Move mouse relative to current position"""
        x, y = pyautogui.position()
        pyautogui.moveTo(x + x_offset, y + y_offset, duration=duration)
        return True
        
    def click(self, x=None, y=None, button='left', clicks=1):
        """Perform mouse click"""
        if x is not None and y is not None:
            pyautogui.click(x, y, clicks=clicks, button=button)
        else:
            pyautogui.click(clicks=clicks, button=button)
        return True
        
    def drag(self, start_x, start_y, end_x, end_y, duration=0.5, button='left'):
        """Drag and drop operation"""
        pyautogui.moveTo(start_x, start_y)
        pyautogui.dragTo(end_x, end_y, duration=duration, button=button)
        return True
        
    def scroll(self, clicks, direction='vertical'):
        """Scroll mouse wheel"""
        if direction == 'vertical':
            pyautogui.scroll(clicks)
        else:
            pyautogui.hscroll(clicks)
        return True
        
    def get_mouse_position(self):
        """Get current mouse coordinates"""
        x, y = pyautogui.position()
        return {'x': x, 'y': y}
        
    def type_text(self, text, interval=0, wpm=None):
        """Type text with configurable speed"""
        if wpm:
            # Calculate interval from WPM (average 5 chars per word)
            interval = 60 / (wpm * 5)
        pyautogui.typewrite(text, interval=interval)
        return True
        
    def press(self, key, presses=1):
        """Press and release a key"""
        pyautogui.press(key, presses=presses)
        return True
        
    def hotkey(self, *keys):
        """Execute keyboard shortcut"""
        pyautogui.hotkey(*keys)
        return True
        
    def key_down(self, key):
        """Hold key down"""
        pyautogui.keyDown(key)
        return True
        
    def key_up(self, key):
        """Release key"""
        pyautogui.keyUp(key)
        return True
        
    def screenshot(self, region=None):
        """Capture screen or region"""
        from PIL import Image
        screenshot = pyautogui.screenshot(region=region)
        return screenshot
        
    def get_pixel_color(self, x, y):
        """Get color of pixel at coordinates"""
        r, g, b = pyautogui.pixel(x, y)
        return {'r': r, 'g': g, 'b': b}
        
    def get_screen_size(self):
        """Get screen resolution"""
        width, height = pyautogui.size()
        return {'width': width, 'height': height}
        
    def find_on_screen(self, image_path, confidence=0.8):
        """Find image on screen (requires OpenCV)"""
        try:
            location = pyautogui.locateOnScreen(image_path, confidence=confidence)
            if location:
                return {
                    'x': location.left,
                    'y': location.top,
                    'width': location.width,
                    'height': location.height,
                    'center_x': location.left + location.width // 2,
                    'center_y': location.top + location.height // 2
                }
            return None
        except Exception as e:
            return {'error': str(e)}
            
    def get_all_windows(self):
        """List all open windows (Windows only)"""
        try:
            import pygetwindow as gw
            windows = gw.getAllWindows()
            return [{'title': w.title, 'left': w.left, 'top': w.top, 
                    'width': w.width, 'height': w.height} for w in windows if w.title]
        except:
            return [{'error': 'Window management requires pygetwindow'}]
            
    def activate_window(self, title_substring):
        """Bring window to front"""
        try:
            import pygetwindow as gw
            window = gw.getWindowsWithTitle(title_substring)[0]
            window.activate()
            return True
        except Exception as e:
            return {'error': str(e)}
            
    def _confirm(self, action):
        """Ask for user confirmation"""
        response = input(f"Allow: {action} [y/n]: ")
        return response.lower() == 'y'

# Command-line interface for Node.js bridge
def main():
    dc = DesktopController()
    
    while True:
        try:
            line = input()
            if not line:
                continue
                
            cmd = json.loads(line)
            method = cmd.get('method')
            args = cmd.get('args', [])
            kwargs = cmd.get('kwargs', {})
            
            if hasattr(dc, method):
                result = getattr(dc, method)(*args, **kwargs)
                print(json.dumps({'success': True, 'result': result}))
            else:
                print(json.dumps({'success': False, 'error': f'Method {method} not found'}))
                
        except json.JSONDecodeError as e:
            print(json.dumps({'success': False, 'error': f'Invalid JSON: {str(e)}'}))
        except Exception as e:
            print(json.dumps({'success': False, 'error': str(e)}))
        
        sys.stdout.flush()

if __name__ == '__main__':
    main()