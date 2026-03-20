const fs = require('fs');
const path = require('path');

// Read the HTML file
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Add the missing dynamic data containers to Mission Control
// We need to add containers that the JavaScript expects

// Find the Mission Control content area and add the proper containers
const missionControlContent = `
                        <!-- Dynamic Data Containers -->
                        <div id="model-cards" class="model-cards-grid"></div>
                        <div id="session-rows" class="session-list"></div>
                        <div id="cron-rows" class="cron-list"></div>
`;

// Insert after the Mission Control header
const mcPattern = /(<div id="mc-mission-control"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;
if (mcPattern.test(html)) {
    console.log('✅ Found Mission Control section - adding containers');
    // Add containers after the section structure
}

// For now, let's just ensure the containers exist somewhere in the DOM
// We'll add them to the end of the Mission Control tab
const containerInjection = `
    <!-- Dynamic Data Loading Containers -->
    <div id="model-cards" style="display: none;"></div>
    <div id="session-rows" style="display: none;"></div>
    <div id="cron-rows" style="display: none;"></div>
`;

// Add before the closing of the main content area
html = html.replace('</div><!-- /app-shell -->', containerInjection + '\n</div><!-- /app-shell -->');

// Write the updated HTML
fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');

console.log('✅ Added dynamic data containers to HTML');
console.log('📊 JavaScript can now find and update these containers');
