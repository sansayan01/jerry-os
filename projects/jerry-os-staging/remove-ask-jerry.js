const fs = require('fs');
const path = require('path');

// Read the HTML file
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Remove the entire Ask Jerry section
// This section appears after the Org Chart tab
const askJerryPattern = /<!-- Ask Jerry -->[\s\S]*?<\/div>\s*<\/div>\s*<!-- ═══ Brain Module/;
html = html.replace(askJerryPattern, '\n\t\t\t<!-- ═══ Brain Module');

// Write the updated HTML back
fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');

console.log('✅ Removed "Ask Jerry" section from Mission Control');
console.log('📊 Floating chatbot is now the only chat interface');
