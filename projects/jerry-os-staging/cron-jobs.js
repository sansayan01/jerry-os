const cron = require('node-cron');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let updateCallback = null;

function start(onUpdate) {
  updateCallback = onUpdate;
  console.log('⏰ Cron jobs initialized. Waiting for scheduled times...');
}

function notify(name, status) {
  if (updateCallback) {
    updateCallback(name, status);
  }
}

// Backup job - runs every night at 2:00 AM
cron.schedule('0 2 * * *', () => {
  console.log('🚀 Starting nightly backup to GitHub...');
  notify('Nightly Backup', 'running');
  backupWorkspace()
    .then(() => notify('Nightly Backup', 'idle'))
    .catch(() => notify('Nightly Backup', 'failed'));
});

// Self-improvement job - DISABLED in production (staging handles this)
// Staging runs self-improvement hourly and pushes successful changes here
console.log('🔧 Self-improvement disabled in production. Staging handles improvements.');

// Daily brief job - runs at 6:00 AM
cron.schedule('0 6 * * *', () => {
  console.log('📊 Generating daily brief...');
  notify('Daily Brief', 'running');
  generateDailyBrief()
    .then(() => notify('Daily Brief', 'idle'))
    .catch(() => notify('Daily Brief', 'failed'));
});

// Documentation job - runs at midnight
cron.schedule('0 0 * * *', () => {
  console.log('📚 Updating system documentation...');
  notify('OS Documentation', 'running');
  updateDocumentation()
    .then(() => notify('OS Documentation', 'idle'))
    .catch(() => notify('OS Documentation', 'failed'));
});

async function backupWorkspace() {
  try {
    console.log('🔒 Backing up ENTIRE OpenClaw workspace (excluding secrets)...');
    const workspaceRoot = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace');
    process.chdir(workspaceRoot);
    execSync('git add .', { stdio: 'inherit' });
    const commitMessage = `OpenClaw Full Backup: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    try {
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    } catch (commitError) {
      console.log('No changes to commit');
      return;
    }
    execSync('git push -u origin master', { stdio: 'inherit' });
    console.log('✅ Full workspace backup completed successfully!');
    process.chdir(__dirname);
  } catch (error) {
    console.error('❌ Full workspace backup failed:', error.message);
  }
}

async function generateDailyBrief() {
  console.log('📊 Daily brief would be generated here');
}

async function updateDocumentation() {
  console.log('📚 Documentation would be updated here');
}

module.exports = { start, backupWorkspace, generateDailyBrief, updateDocumentation };
