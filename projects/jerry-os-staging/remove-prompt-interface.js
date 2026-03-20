const fs = require('fs');
const path = require('path');

// Read app.js
let appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Remove the setupPromptInterface function and its entire body
// Match from the function declaration to the next method
const functionPattern = /setupPromptInterface\(\)\s*\{[\s\S]*?\n\s*\}/;
appCode = appCode.replace(functionPattern, '');

// Write back
fs.writeFileSync(path.join(__dirname, 'app.js'), appCode, 'utf8');

console.log('✅ Removed setupPromptInterface function');
console.log('📊 Chatbot functionality now handled by floating chatbot only');
