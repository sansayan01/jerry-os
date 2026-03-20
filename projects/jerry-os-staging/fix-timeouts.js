const fs = require('fs');
const path = require('path');

// Read app.js
let appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Replace all 5000ms timeouts with 1000ms
appCode = appCode.replace(/setTimeout\(\(\) => controller\.abort\(\), 5000\)/g, 'setTimeout(() => controller.abort(), 1000)');

// Write the updated app.js
fs.writeFileSync(path.join(__dirname, 'app.js'), appCode, 'utf8');

console.log('✅ Reduced API timeouts from 5s to 1s for faster loading!');
