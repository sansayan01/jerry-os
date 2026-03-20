const fs = require('fs');
const path = require('path');

// Read the current index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Find the closing body tag and insert chatbot before it
const chatbotCode = `
<!-- Floating Chatbot Popup -->
<div id="chatbot-container">
    <div id="chatbot-button" onclick="toggleChatbot()">
        <div class="chatbot-icon"><i data-lucide="bot"></i></div>
        <div class="chatbot-badge">1</div>
    </div>
    <div id="chatbot-window">
        <div class="chatbot-header">
            <div class="chatbot-title"><i data-lucide="bot"></i><span>Jerry Assistant</span></div>
            <div class="chatbot-status"><span class="status-dot online"></span><span>Online</span></div>
            <button class="chatbot-close" onclick="toggleChatbot()"><i data-lucide="x"></i></button>
        </div>
        <div id="chatbot-messages">
            <div class="chatbot-welcome">
                <div class="welcome-icon"><i data-lucide="sparkles"></i></div>
                <p>Hey there! 👋</p>
                <p>I'm Jerry, your executive assistant. How can I help you today?</p>
            </div>
        </div>
        <div class="chatbot-input-area">
            <input type="text" id="chatbot-input" placeholder="Type your message..." onkeypress="handleChatbotKeyPress(event)">
            <button id="chatbot-send" onclick="sendChatbotMessage()"><i data-lucide="send"></i></button>
        </div>
    </div>
</div>

<style>
#chatbot-container{position:fixed;bottom:20px;right:20px;z-index:1000}
#chatbot-button{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#00e5ff,#007AFF);border:none;cursor:pointer;box-shadow:0 4px 15px rgba(0,229,255,0.4);display:flex;align-items:center;justify-content:center;transition:all 0.3s;position:relative}
#chatbot-button:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(0,229,255,0.6)}
.chatbot-icon{font-size:28px;color:white}
.chatbot-badge{position:absolute;top:-5px;right:-5px;width:22px;height:22px;border-radius:50%;background:#FF3B30;color:white;font-size:12px;display:flex;align-items:center;justify-content:center;font-weight:bold}
#chatbot-window{position:absolute;bottom:70px;right:0;width:350px;height:500px;background:rgba(15,15,20,0.98);border-radius:16px;border:1px solid rgba(0,229,255,0.3);box-shadow:0 10px 40px rgba(0,0,0,0.5);display:none;flex-direction:column;overflow:hidden;backdrop-filter:blur(10px)}
#chatbot-window.active{display:flex;animation:slideUp 0.3s ease-out}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.chatbot-header{background:linear-gradient(135deg,rgba(0,229,255,0.2),rgba(0,122,255,0.2));padding:15px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,229,255,0.2)}
.chatbot-title{display:flex;align-items:center;gap:8px;font-weight:600;color:#00e5ff}
.chatbot-title i{font-size:20px}
.chatbot-status{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,0.6)}
.status-dot{width:8px;height:8px;border-radius:50%}
.status-dot.online{background:#34C759;box-shadow:0 0 10px #34C759}
.chatbot-close{background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;padding:4px;border-radius:4px;transition:all 0.2s}
.chatbot-close:hover{color:white;background:rgba(255,255,255,0.1)}
#chatbot-messages{flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:12px}
.chatbot-welcome{text-align:center;padding:20px;color:rgba(255,255,255,0.8)}
.welcome-icon{font-size:40px;margin-bottom:10px;color:#00e5ff}
.chatbot-welcome p{margin:8px 0;line-height:1.4}
.chatbot-message{display:flex;gap:8px;align-items:flex-end}
.chatbot-message.user{flex-direction:row-reverse}
.message-content{background:rgba(255,255,255,0.1);padding:10px 14px;border-radius:16px;max-width:80%;word-wrap:break-word}
.chatbot-message.user .message-content{background:linear-gradient(135deg,#00e5ff,#007AFF);color:white}
.message-time{font-size:10px;color:rgba(255,255,255,0.4);margin-top:4px}
.chatbot-input-area{padding:15px;border-top:1px solid rgba(255,255,255,0.1);display:flex;gap:10px}
#chatbot-input{flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:10px 16px;color:white;font-size:14px;outline:none}
#chatbot-input::placeholder{color:rgba(255,255,255,0.4)}
#chatbot-input:focus{border-color:#00e5ff;background:rgba(0,229,255,0.1)}
#chatbot-send{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#00e5ff,#007AFF);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s}
#chatbot-send:hover{transform:scale(1.05);box-shadow:0 4px 15px rgba(0,229,255,0.4)}
#chatbot-messages::-webkit-scrollbar{width:6px}
#chatbot-messages::-webkit-scrollbar-track{background:transparent}
#chatbot-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:3px}
</style>

<script>
let chatbotOpen=false;
function toggleChatbot(){const w=document.getElementById('chatbot-window'),b=document.getElementById('chatbot-button');chatbotOpen=!chatbotOpen;if(chatbotOpen){w.classList.add('active');b.style.display='none';document.getElementById('chatbot-input').focus()}else{w.classList.remove('active');b.style.display='flex'}if(window.lucide)lucide.createIcons()}
function handleChatbotKeyPress(e){if(e.key==='Enter')sendChatbotMessage()}
async function sendChatbotMessage(){const i=document.getElementById('chatbot-input'),m=i.value.trim();if(!m)return;addChatbotMessage(m,'user');i.value='';showTypingIndicator();try{const r=await fetch('/api/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:m})}),d=await r.json();removeTypingIndicator();d.status==='ok'?addChatbotMessage(d.result.response,'bot'):addChatbotMessage('Sorry, I encountered an error. Please try again.','bot')}catch(e){removeTypingIndicator();addChatbotMessage('Sorry, I\\'m having trouble connecting. Please try again.','bot')}}
function addChatbotMessage(t,s){const c=document.getElementById('chatbot-messages'),m=document.createElement('div');m.className=`chatbot-message ${s}`;m.innerHTML=`<div class="message-content">${t}<div class="message-time">${new Date().toLocaleTimeString([],
{hour:'2-digit',minute:'2-digit'})}</div></div>`;c.appendChild(m);c.scrollTop=c.scrollHeight;if(window.lucide)lucide.createIcons()}
function showTypingIndicator(){const c=document.getElementById('chatbot-messages'),t=document.createElement('div');t.id='typing-indicator';t.className='chatbot-message bot';t.innerHTML='<div class="message-content"><span style="display:inline-flex;gap:4px"><span style="width:8px;height:8px;background:#00e5ff;border-radius:50%;animation:bounce 1.4s infinite"></span><span style="width:8px;height:8px;background:#00e5ff;border-radius:50%;animation:bounce 1.4s infinite;animation-delay:0.2s"></span><span style="width:8px;height:8px;background:#00e5ff;border-radius:50%;animation:bounce 1.4s infinite;animation-delay:0.4s"></span></span></div>';c.appendChild(t);c.scrollTop=c.scrollHeight}
function removeTypingIndicator(){const t=document.getElementById('typing-indicator');t&&t.remove()}
document.addEventListener('DOMContentLoaded',()=>{if(window.lucide)lucide.createIcons()});
</script>
`;

// Insert before </body>
html = html.replace('</body>', chatbotCode + '\n</body>');

// Write back
fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');

console.log('✅ Floating chatbot added successfully!');
console.log('🤖 Chatbot button positioned at bottom-right corner');
console.log('💬 Click to open chat window with smooth animation');
