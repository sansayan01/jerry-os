# Jerry OS Design Skill 🎨

## Vision
Create a Matrix-inspired executive interface with professional neon aesthetics, multi-model support, and expandable session views.

## Color Themes

### Ops Module - Amber Matrix
- **Primary:** Amber/Orange gradient
- **Accent:** Neon amber glow effects
- **Icons:** Amber neon outlines
- **Vibe:** Technical operations center

### Brain Module - Sky Blue  
- **Primary:** Sky blue gradient
- **Accent:** Soft blue glow effects
- **Icons:** Blue neon outlines
- **Vibe:** Intelligent AI coordination

### Lab Module - Matrix Green
- **Primary:** True Matrix green
- **Accent:** Green neon glow
- **Icons:** Green terminal-style
- **Vibe:** Experimental environment

## Design Principles

### 1. Contained Interactions
- Hover effects stay within container bounds
- No growing outside boundaries
- Subtle highlighting instead of expansion

### 2. Neon Aesthetics
- Glow effects on icons and active elements
- Subtle neon borders
- Professional, not overwhelming

### 3. Multi-Model Ready
- Support for multiple AI models
- Offline status indicators for unconfigured models
- Easy model switching interface

### 4. Expandable Sessions
- Click sessions to expand (75% width)
- Scrollable session context
- Smooth animations

## Implementation Guide

### CSS Variables Setup
```css
:root {
  /* Amber Theme - Ops */
  --ops-primary: #ff8c00;
  --ops-secondary: #ffa64d;
  --ops-glow: rgba(255, 140, 0, 0.3);
  
  /* Blue Theme - Brain */
  --brain-primary: #87ceeb;
  --brain-secondary: #b0e2ff;
  --brain-glow: rgba(135, 206, 235, 0.3);
  
  /* Green Theme - Lab */
  --lab-primary: #00ff00;
  --lab-secondary: #33ff33;
  --lab-glow: rgba(0, 255, 0, 0.3);
}
```

### Container-Bound Hover Effects
```css
.dock-item:hover {
  /* Instead of transform: scale() */
  background: var(--glass-highlight);
  border: 1px solid var(--neon-glow);
  box-shadow: 0 0 15px var(--neon-glow);
}
```

### Expandable Sessions
```javascript
// Session expansion functionality
setupSessionExpansion() {
  const sessions = document.querySelectorAll('.session-item');
  sessions.forEach(session => {
    session.addEventListener('click', () => {
      this.expandSession(session);
    });
  });
}
```

### Multi-Model Interface
```html
<div class="model-grid">
  <div class="model-card" data-model="codex-5.3" data-status="offline">
    <div class="model-icon">🤖</div>
    <h4>Codex 5.3</h4>
    <span class="status-badge offline">Offline</span>
  </div>
  <!-- Additional models -->
</div>
```

## Next Steps

1. **Create theme CSS variables** for each module
2. **Implement container-bound hover effects**
3. **Build multi-model grid interface**
4. **Develop session expansion functionality**
5. **Add neon glow effects** to icons and active elements
6. **Test responsive design** across all modules

## Quality Assurance
- [ ] Hover effects remain contained
- [ ] Neon glows are subtle and professional
- [ ] Multi-model interface is intuitive
- [ ] Session expansion works smoothly
- [ ] Themes are consistent across modules
- [ ] Responsive design maintained

This design skill will transform Jerry OS into the Matrix-inspired executive interface you envision, while maintaining professionalism and usability.