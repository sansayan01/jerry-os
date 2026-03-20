const http = require('http');
const fs = require('fs').promises;
const path = require('path');

async function checkServerHealth() {
    console.log('🏥 Running Comprehensive Health Check...\n');
    
    // 1. Check if server is running
    console.log('1. 🔍 Checking server status...');
    try {
        const response = await fetch('http://localhost:8981/api/org-chart');
        const data = await response.json();
        
        if (data.status === 'ok') {
            console.log('   ✅ Server is running and responsive');
            console.log(`   📊 Total agents: ${data.result.stats.total}`);
            console.log(`   🎯 Active agents: ${data.result.stats.active}`);
        } else {
            console.log('   ❌ Server responded with error:', data.error);
            return false;
        }
    } catch (error) {
        console.log('   ❌ Server is not responding:', error.message);
        return false;
    }
    
    // 2. Check file system
    console.log('\n2. 📁 Checking file system...');
    try {
        const filesToCheck = [
            'server.js',
            'dynamic-data.js', 
            'package.json',
            'data/org-chart.json'
        ];
        
        for (const file of filesToCheck) {
            try {
                await fs.access(path.join(__dirname, file));
                console.log(`   ✅ ${file} exists`);
            } catch {
                console.log(`   ⚠️  ${file} missing (but may be optional)`);
            }
        }
    } catch (error) {
        console.log('   ❌ File system check failed:', error.message);
        return false;
    }
    
    // 3. Check syntax of key files
    console.log('\n3. 🔧 Checking file syntax...');
    try {
        // Test server.js syntax - but don't actually start it
        const serverCode = await fs.readFile('./server.js', 'utf8');
        try {
            // Just validate syntax without executing
            eval('(function() {' + serverCode + '})');
            console.log('   ✅ server.js syntax is valid');
        } catch (error) {
            console.log('   ❌ server.js syntax error:', error.message);
            return false;
        }
        
        // Test dynamic-data.js syntax  
        const dynamicCode = await fs.readFile('./dynamic-data.js', 'utf8');
        try {
            eval('(function() {' + dynamicCode + '})');
            console.log('   ✅ dynamic-data.js syntax is valid');
        } catch (error) {
            console.log('   ❌ dynamic-data.js syntax error:', error.message);
            return false;
        }
        
    } catch (error) {
        console.log('   ❌ Syntax check failed:', error.message);
        return false;
    }
    
    // 4. Test multiple API calls to verify dynamic behavior
    console.log('\n4. 🔄 Testing dynamic behavior...');
    try {
        const results = [];
        for (let i = 0; i < 3; i++) {
            const response = await fetch('http://localhost:8981/api/org-chart');
            const data = await response.json();
            results.push(data.result);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Check if data is actually changing
        const requestCounts = results.map(r => r.stats.totalRequests);
        const isDynamic = new Set(requestCounts).size > 1;
        
        if (isDynamic) {
            console.log('   ✅ Data is dynamically updating');
            console.log(`   📈 Request counts: ${requestCounts.join(' → ')}`);
        } else {
            console.log('   ⚠️  Data appears static (request counts identical)');
        }
        
    } catch (error) {
        console.log('   ❌ Dynamic behavior test failed:', error.message);
        return false;
    }
    
    // 5. Check all endpoints
    console.log('\n5. 🌐 Testing all API endpoints...');
    const endpoints = ['/api/org-chart', '/api/model', '/api/sessions', '/api/crons'];
    let workingEndpoints = 0;
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`http://localhost:8981${endpoint}`);
            const data = await response.json();
            
            if (data.status === 'ok') {
                console.log(`   ✅ ${endpoint} - working`);
                workingEndpoints++;
            } else {
                console.log(`   ❌ ${endpoint} - error: ${data.error}`);
            }
        } catch (error) {
            console.log(`   ❌ ${endpoint} - failed: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Endpoint summary: ${workingEndpoints}/${endpoints.length} working`);
    
    if (workingEndpoints === endpoints.length) {
        console.log('\n🎉 HEALTH CHECK PASSED! All systems are operational.');
        console.log('\n📍 Your dynamic org chart is available at: http://localhost:8981/api/org-chart');
        console.log('📍 Staging server dashboard: http://localhost:8981');
        return true;
    } else {
        console.log('\n⚠️  HEALTH CHECK WARNING: Some endpoints may need attention');
        return false;
    }
}

// Polyfill for fetch in Node.js
function fetch(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    json: () => {
                        try {
                            return JSON.parse(data);
                        } catch {
                            return { status: 'error', error: 'Invalid JSON' };
                        }
                    },
                    status: res.statusCode
                });
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

checkServerHealth().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.log('❌ Health check failed with error:', error.message);
    process.exit(1);
});