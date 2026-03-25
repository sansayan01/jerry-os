const http = require('http');

console.log('🚀 Triggering Diversified Self-Improvement');
console.log('='.repeat(50));

// Trigger manual self-improvement
const triggerImprovement = () => {
    return new Promise((resolve, reject) => {
        const req = http.request('http://localhost:8981/api/self-improvement/trigger', {
            method: 'POST'
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
};

// Run trigger
const runTrigger = async () => {
    try {
        console.log('\\n🎯 Triggering build with improved prioritization...');
        const result = await triggerImprovement();
        
        console.log('✅ Trigger result:', result.status);
        console.log('💡 Message:', result.result);
        
        console.log('\\n📊 Improved prioritization should now:');
        console.log('• Reduce memory feature weight');
        console.log('• Detect when memory built repeatedly');
        console.log('• Choose second-best feature when needed');
        console.log('• Build more diverse features');
        
        console.log('\\n⏰ Next hourly build will use new algorithm!');
        
    } catch (error) {
        console.log('❌ Trigger failed:', error.message);
    }
};

// Wait for server then trigger
setTimeout(runTrigger, 3000);