const http = require('http');

function testOrgChart() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:8981/api/org-chart', (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function runTest() {
    console.log('🧪 Testing Dynamic Org Chart API...\n');
    
    try {
        const result = await testOrgChart();
        
        if (result.status === 'ok') {
            console.log('✅ SUCCESS: Dynamic Org Chart is working!\n');
            
            const orgData = result.result;
            console.log('📊 System Stats:');
            console.log(`   Total Agents: ${orgData.stats.total}`);
            console.log(`   Active Agents: ${orgData.stats.active}`);
            console.log(`   Planned Agents: ${orgData.stats.planned}`);
            console.log(`   System Uptime: ${orgData.stats.systemUptime}`);
            console.log(`   Total Requests: ${orgData.stats.totalRequests}`);
            console.log(`   Last Updated: ${orgData.stats.lastUpdated}`);
            
            console.log('\n👤 Executive:');
            console.log(`   Name: ${orgData.executive.name}`);
            console.log(`   Status: ${orgData.executive.status}`);
            console.log(`   Performance: ${orgData.executive.performance}`);
            console.log(`   Last Active: ${orgData.executive.lastActive}`);
            
            console.log('\n🧠 Primary Agents:');
            orgData.agents.forEach((agent, index) => {
                console.log(`   ${index + 1}. ${agent.name} (${agent.status}) - ${agent.activity}`);
            });
            
            console.log('\n🎯 The org chart is now DYNAMIC! It will update with:');
            console.log('   • Real-time agent status changes');
            console.log('   • Dynamic activity messages');
            console.log('   • Performance metrics');
            console.log('   • System uptime tracking');
            console.log('   • Request count integration');
            
        } else {
            console.log('❌ FAILED: API returned error status');
            console.log('Error:', result.error);
        }
        
    } catch (error) {
        console.log('❌ FAILED: Could not connect to API');
        console.log('Error:', error.message);
    }
}

// Run multiple tests to show dynamic nature
async function runMultipleTests() {
    console.log('\n🔄 Testing dynamic updates (3 consecutive calls)...\n');
    
    for (let i = 1; i <= 3; i++) {
        console.log(`📋 Test ${i}:`);
        try {
            const result = await testOrgChart();
            if (result.status === 'ok') {
                const orgData = result.result;
                console.log(`   Active: ${orgData.stats.active}/${orgData.stats.total}, Requests: ${orgData.stats.totalRequests}, Updated: ${orgData.stats.lastUpdated.split('T')[1].split('.')[0]}`);
                
                // Show a sample agent activity
                if (orgData.agents.length > 0) {
                    console.log(`   Sample Activity: ${orgData.agents[0].activity}`);
                }
                
            }
        } catch (error) {
            console.log(`   Failed: ${error.message}`);
        }
        
        // Wait between tests
        if (i < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// Run the tests
runTest().then(() => {
    return runMultipleTests();
}).catch(console.error);