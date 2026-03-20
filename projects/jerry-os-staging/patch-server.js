const fs = require('fs');
const path = require('path');

// Read the current server.js
let serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

// Add Dynamic Data Manager import at the top
serverCode = serverCode.replace(
    'const chokidar = require(\'chokidar\');',
    `const chokidar = require('chokidar');

// Import Dynamic Data Manager
const DynamicDataManager = require('./dynamic-data.js');
const dynamicData = new DynamicDataManager();
dynamicData.start();
console.log('📊 Dynamic data system initialized');`
);

// Replace the returnFallbackResponse function
serverCode = serverCode.replace(
    /function returnFallbackResponse\(res\) \{[\s\S]*?\n\}/,
    `function returnFallbackResponse(res) {
    res.json({
        status: 'ok',
        result: dynamicData.getModels()
    });
}`
);

// Replace the returnSessionsFallbackResponse function
serverCode = serverCode.replace(
    /function returnSessionsFallbackResponse\(res\) \{[\s\S]*?\n\}/,
    `function returnSessionsFallbackResponse(res) {
    res.json({
        status: 'ok',
        result: dynamicData.getSessions()
    });
}`
);

// Replace the returnCronsFallbackResponse function
serverCode = serverCode.replace(
    /function returnCronsFallbackResponse\(res\) \{[\s\S]*?^\}/m,
    `function returnCronsFallbackResponse(res) {
    res.json({
        status: 'ok',
        result: dynamicData.getCrons()
    });
}`
);

// Write the updated server.js
fs.writeFileSync(path.join(__dirname, 'server.js'), serverCode, 'utf8');

console.log('✅ Server updated to use dynamic data!');
console.log('📊 DynamicDataManager integrated successfully');
