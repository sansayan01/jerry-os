// Telegram File Sharing Handler - Optimized for Speed
const fs = require('fs').promises;
const path = require('path');

const ALLOWED_USERS = new Set(['1194411669', '8794421716']);
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Quick check: does this look like a file request?
const FILE_KEYWORDS = ['send', 'share', 'file', 'document', 'pdf', 'image', 'photo', 'video', 'get me', 'fetch'];

async function telegramFileShareHandler(context) {
  const { event, session, message } = context;
  
  // Fast reject: not a Telegram message
  if (event !== 'message' || session?.channel !== 'telegram') {
    return null;
  }
  
  // Fast reject: not an allowed user
  const userId = session?.authorId || session?.providerUserId;
  if (!userId || !ALLOWED_USERS.has(userId)) {
    return null;
  }
  
  const text = (message?.content?.text || message?.text || '').toLowerCase();
  if (!text) return null;
  
  // Fast check: does it contain file keywords?
  const hasKeyword = FILE_KEYWORDS.some(kw => text.includes(kw));
  if (!hasKeyword) return null;
  
  // Extract file path
  const filePath = extractFilePath(text);
  if (!filePath) return null;
  
  // Resolve and validate asynchronously
  try {
    const resolvedPath = await resolveFilePath(filePath);
    if (!resolvedPath) {
      return { type: 'assistant', content: `❌ File not found: "${filePath}"` };
    }
    
    const stats = await fs.stat(resolvedPath);
    if (stats.isDirectory()) {
      return { type: 'assistant', content: `📁 "${path.basename(resolvedPath)}" is a directory.` };
    }
    
    if (stats.size > MAX_FILE_SIZE) {
      return { type: 'assistant', content: `⚠️ File too large (${(stats.size/1024/1024).toFixed(1)}MB). Max: 20MB.` };
    }
    
    return {
      type: 'assistant',
      content: `📤 Sending: **${path.basename(resolvedPath)}**`,
      actions: [{ type: 'file_send', filePath: resolvedPath }]
    };
  } catch (err) {
    return { type: 'assistant', content: `❌ Error: ${err.message}` };
  }
}

function extractFilePath(text) {
  // Match common patterns fast
  const patterns = [
    /(?:file|path)\s+(?:at\s+)?["']?([^"'\n]+)/i,
    /(?:send|share|get|fetch)\s+(?:me\s+)?["']?([^"'\n]+)/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

async function resolveFilePath(filePath) {
  if (path.isAbsolute(filePath)) {
    try { await fs.access(filePath); return filePath; } catch { return null; }
  }
  
  const bases = [
    process.env.USERPROFILE,
    path.join(process.env.USERPROFILE, 'Documents'),
    path.join(process.env.USERPROFILE, 'Downloads'),
    path.join(process.env.USERPROFILE, 'Desktop')
  ];
  
  for (const base of bases) {
    const full = path.join(base, filePath);
    try { await fs.access(full); return full; } catch { continue; }
  }
  return null;
}

module.exports = telegramFileShareHandler;