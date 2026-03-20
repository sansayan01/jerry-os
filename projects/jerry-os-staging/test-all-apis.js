const http = require('http');

const endpoints = [
    '/api/org-chart',
    '/api/model', 
    '/api/sessions',
    '/api/crons'
];

function testEndpoint(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8981,
            path: endpoint,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({
                        endpoint,
                        statusCode: res.statusCode,
                        status: result.status,
                        success: result.status === 'ok'
                    });
                } catch (error) {
                    resolve({
                        endpoint,
                        statusCode: res.statusCode,
                        error: error.message,
                        success: false
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                endpoint,
                error: error.message,
                success: false
            });
        });

        req.on('timeout', () => {
            resolve({
                endpoint,
                error: 'timeout',
                success: false
            });
            req.destroy();
        });

        req.end();
    });
}

async function testAllEndpoints() {
    console.log('🧪 Testing All API Endpoints...\n');
    
    const results = [];
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('📊 API Endpoint Test Results:');
    console.log('═'.repeat(50));
    
    results.forEach(result => {
        if (result.success) {
            console.log(`✅ ${result.endpoint} - Status: ${result.statusCode} (${result.status})`);
        } else {
            console.log(`❌ ${result.endpoint} - Status: ${result.statusCode || 'N/A'} - Error: ${result.error}`);
        }
    });
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log('═'.repeat(50));
    console.log(`📈 Success Rate: ${successful}/${total} endpoints working`);
    
    if (successful === total) {
        console.log('🎉 All API endpoints are working perfectly!');
    } else {
        console.log('⚠️  Some endpoints may need attention');
    }
}

testAllEndpoints().catch(console.error);