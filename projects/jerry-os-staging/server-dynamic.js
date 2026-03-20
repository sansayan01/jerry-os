// Add to the beginning of server.js after requires

// Dynamic Data Manager
const DynamicDataManager = require('./dynamic-data.js');
const dynamicData = new DynamicDataManager();
dynamicData.start();

// Then replace the fallback functions with:
function returnFallbackResponse(res) {
    res.json({
        status: 'ok',
        result: dynamicData.getModels()
    });
}

function returnSessionsFallbackResponse(res) {
    res.json({
        status: 'ok',
        result: dynamicData.getSessions()
    });
}

function returnCronsFallbackResponse(res) {
    res.json({
        status: 'ok',
        result: dynamicData.getCrons()
    });
}
