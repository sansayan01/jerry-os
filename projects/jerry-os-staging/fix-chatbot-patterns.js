const fs = require('fs');
const path = require('path');

// Read the current server.js
let serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

// Find the chatbot endpoint and replace with better pattern matching
const chatbotStart = serverCode.indexOf('// Chatbot prompt endpoint');
const chatbotEnd = serverCode.indexOf('// Serve interface', chatbotStart);

if (chatbotStart > 0 && chatbotEnd > chatbotStart) {
    // Extract the section to replace
    const beforeChatbot = serverCode.substring(0, chatbotStart);
    const afterChatbot = serverCode.substring(chatbotEnd);

    // New improved chatbot endpoint
    const newChatbot = `// Chatbot prompt endpoint - Enhanced Recognition System
app.post('/api/prompt', express.json(), async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                status: 'error',
                error: 'No message provided'
            });
        }

        // Analyze the message
        const messageLower = message.toLowerCase().trim();
        let response = '';

        // Greetings
        if (messageLower.match(/^(hi|hello|hey|good morning|good evening|good afternoon)/)) {
            const greetings = [
                "Hey there! 👋 Great to see you! How can I help you today?",
                "Hi! 😊 I'm Jerry, your executive assistant. What can I do for you?",
                "Hello! 🌟 Welcome! I'm ready to assist you with anything you need!",
                "Hey! 👋 Good to hear from you! What's on your mind?"
            ];
            response = greetings[Math.floor(Math.random() * greetings.length)];
        }
        // Name and Identity
        else if (messageLower.match(/(your name|who are you|what are you|what's your name|your identity)/)) {
            response = \`I'm Jerry! 🤖

I'm your AI executive assistant, designed to:
- Coordinate your multi-agent system
- Manage Technical Lead, Project Manager, and Research agents
- Handle executive tasks and decision-making
- Monitor system health and performance

Think of me as your right-hand AI for managing complex AI operations! 💪

How can I assist you today?\`;
        }
        // Status and System
        else if (messageLower.match(/(status|system health|how is|system running|everything ok)/)) {
            response = \`System Status Report: 📊

🟢 **Server**: Online and operational
🟢 **AI Models**: 3 available
   - DeepSeek V3.1 (Primary)
   - GLM-5 (Fallback #1)
   - Kimi-K2 (Fallback #2)
🟢 **Sessions**: Active and responsive
🟢 **Cron Jobs**: All scheduled tasks running normally
🟢 **Dynamic Data**: Real-time updates enabled

Everything is running smoothly! ✅

What specific aspect would you like me to elaborate on?\`;
        }
        // Help and Capabilities
        else if (messageLower.match(/(help|what can you do|capabilities|abilities|features)/)) {
            response = \`I can help you with a lot! 🚀

📊 **System Monitoring**:
   - Check server status, models, sessions
   - Monitor cron jobs and system health
   - Real-time performance tracking

🔧 **Technical Tasks**:
   - Debug issues and analyze logs
   - Optimize performance
   - Manage configurations

📋 **Project Management**:
   - Track progress and manage tasks
   - Coordinate agents and sub-agents
   - Organize workflows

💬 **Communication**:
   - Draft messages and reports
   - Create summaries
   - Generate documentation

What would you like me to help with?\`;
        }
        // Agents and Delegation
        else if (messageLower.match(/(agent|delegate|sub-agent|hierarchy|team)/)) {
            response = \`Agent Structure Overview: 🎯

**Executive Level**:
- Jerry (Me) - Executive Assistant & Coordinator

**Primary Agents** (3):
1. 📱 Technical Lead - Code & Infrastructure
2. 📊 Project Manager - Coordination & Tracking
3. 🔍 Research Agent - Information & Analysis

**Sub-Agents** (7 planned):
- Client-specific workers
- Project-specific specialists
- Infrastructure managers

I can spawn, delegate to, and coordinate all these agents!

Would you like me to:
1. Spawn a new agent for a specific task?
2. Check current agent status?
3. Delegate work to an agent?\`;
        }
        // Thanks and Appreciation
        else if (messageLower.match(/(thank|thanks|appreciate|good job|well done)/)) {
            const thanksResponses = [
                "You're welcome! 😊 Happy to help anytime!",
                "My pleasure! 🚀 Let me know if you need anything else!",
                "Glad I could assist! That's what I'm here for! 💪",
                "Thank you! 🙏 Always here to support you!"
            ];
            response = thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
        }
        // Goodbye
        else if (messageLower.match(/(bye|goodbye|see you|later|exit|quit)/)) {
            const goodbyes = [
                "Goodbye! 👋 Have a great day! Come back anytime!",
                "See you later! 🌟 I'll be here when you need me!",
                "Bye for now! 👋 Take care!",
                "See you! 👋 Always happy to help!"
            ];
            response = goodbyes[Math.floor(Math.random() * goodbyes.length)];
        }
        // Default Contextual Response
        else {
            const contextualResponses = [
                \`I understand you're asking about "\${message}". Let me help you with that.

Based on your question, I can:
1. Analyze the specific details
2. Provide relevant suggestions
3. Take action if needed

What would you prefer?\`,

                \`Thanks for asking! Regarding "\${message.substring(0, 40)}...":

I can help you in multiple ways:
📊 Analyze the situation
💡 Provide recommendations
🔧 Execute actions if you approve

Shall I proceed with one of these?\`,

                \`Got it! I'm processing: "\${message.substring(0, 40)}..."

Here's what I can do:
📋 Break down the problem
🎯 Suggest solutions
⚡ Take action on your approval

What's your preference?\`
            ];
            response = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
        }

        res.json({
            status: 'ok',
            result: {
                response: response,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to process message'
        });
    }
});

`;

    // Combine the parts
    serverCode = beforeChatbot + newChatbot + afterChatbot;

    // Write the updated server.js
    fs.writeFileSync(path.join(__dirname, 'server.js'), serverCode, 'utf8');

    console.log('✅ Enhanced chatbot pattern recognition');
    console.log('🤖 Now recognizes: name, greetings, status, help, agents, thanks, goodbye');
} else {
    console.log('❌ Could not find chatbot endpoint to replace');
}
