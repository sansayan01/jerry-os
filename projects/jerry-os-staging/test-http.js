const http = require('http');

// Test the actual HTTP endpoint
const options = {
    hostname: 'localhost',
    port: 8981,
    path: '/api/org-chart',
    method: 'GET',
    timeout: 5000
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('✅ HTTP Request Successful!');
            console.log(`Response Status: ${result.status}`);
            
            if (result.status === 'ok') {
                console.log(`Total Agents: ${result.result.stats.total}`);
                console.log(`Active Agents: ${result.result.stats.active}`);
                console.log(`System Uptime: ${result.result.stats.systemUptime}`);
                console.log('🎉 Dynamic Org Chart is working perfectly!');
            } else {
                console.log('Error:', result.error);
            }
        } catch (error) {
            console.log('Failed to parse JSON:', error.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ HTTP Request Failed:', error.message);
});

req.on('timeout', () => {
    console.log('❌ Request timeout');
    req.destroy();
});

req.end();