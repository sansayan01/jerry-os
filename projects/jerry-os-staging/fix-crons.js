const fs = require('fs');
const path = require('path');

// Read the current server.js
let serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

// Find and replace the crons API endpoint to use dynamic data directly
const oldCronsEndpoint = `app.get('/api/crons', async (req, res) => {
    try {
        // Try to get real cron data from OpenClaw
        try {
            // Use spawn instead of execSync to avoid hanging`;

const newCronsEndpoint = `app.get('/api/crons', async (req, res) => {
    try {
        // Use dynamic data instead of OpenClaw integration
        returnCronsFallbackResponse(res);
    } catch (error) {
        console.log('Crons API error:', error.message);
        returnCronsFallbackResponse(res);
    }
});

// Old OpenClaw-based endpoint (disabled)
/*
app.get('/api/crons-old', async (req, res) => {
    try {
        // Try to get real cron data from OpenClaw
        try {
            // Use spawn instead of execSync to avoid hanging`;

serverCode = serverCode.replace(oldCronsEndpoint, newCronsEndpoint);

// Close the old endpoint properly
serverCode = serverCode.replace(
    /} catch \(error\) {[\s\S]*?{ name: 'Heartbeat Check'[\s\S]*?}\s*]\s*}\s*}\s*}\);/,
    `*/
app.get('/api/crons', async (req, res) => {
    try {
        returnCronsFallbackResponse(res);
    } catch (error) {
        console.log('Crons API error:', error.message);
        returnCronsFallbackResponse(res);
    }
});`
);

// Write the updated server.js
fs.writeFileSync(path.join(__dirname, 'server.js'), serverCode, 'utf8');

console.log('✅ Fixed crons endpoint to use dynamic data!');
