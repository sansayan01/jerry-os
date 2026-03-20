# Jerry OS Staging Workflow Guide

## 🎯 **What is Staging?**

Staging is a **testing environment** where you can safely experiment with new features before they go live to production.

**Think of it like a sandbox:**
- Break things here → No harm to your live system
- Test new features → See how they work
- Validate changes → Before showing to users

---

## 🚀 **How to Use Staging**

### **Step 1: Start Staging Server**

```bash
# Open terminal
cd ~/.openclaw/workspace/projects/jerry-os-staging
npm install  # First time only
npm start
```

**Staging runs on:** `http://127.0.0.1:8981`
**Production runs on:** `http://0.0.0.0:8980`

---

### **Step 2: Test New Features**

1. **Open staging in browser:** `http://127.0.0.1:8981`
2. **Test the feature** you want to validate
3. **Check for errors** in the console
4. **Validate functionality** thoroughly

---

### **Step 3: Deploy to Production**

If testing succeeds:

```bash
# Option A: Manual deployment
cd ~/.openclaw/workspace/projects/jerry-os-staging
.\deploy-staging.ps1  # This deploys staging to production

# Option B: Automatic (happens at 4:00 AM daily)
# No action needed - automatic sync
```

---

## 📋 **Daily Workflow**

### **Morning (Manual Testing)**
```
┌─────────────────────────────────────┐
│ 1. Start staging server             │
│    cd jerry-os-staging && npm start │
│                                     │
│ 2. Test new features                │
│    http://127.0.0.1:8981            │
│                                     │
│ 3. If good → Merge to production    │
│    If bad → Fix in staging          │
└─────────────────────────────────────┘
```

### **Night (Automatic)**
```
┌─────────────────────────────────────┐
│ 2:00 AM - GitHub Backup             │
│   Backs up entire workspace         │
│                                     │
│ 3:00 AM - Self-Improvement          │
│   Analyzes and builds features      │
│                                     │
│ 4:00 AM - Staging Deployment        │
│   Syncs production → staging        │
│                                     │
│ 6:00 AM - Daily Brief               │
│   Generates system report           │
└─────────────────────────────────────┘
```

---

## 🔄 **Common Workflows**

### **Testing a New Feature**

```bash
# 1. Develop in production
cd jerry-os
# Make changes...

# 2. Test in staging
cd ../jerry-os-staging
# Staging auto-updates at 4 AM, or manually:
.\deploy-staging.ps1

# 3. Verify in browser
# Open http://127.0.0.1:8981

# 4. If successful, keep in production
# If failed, rollback staging
```

### **Resetting Staging**

```bash
# If staging gets messed up
cd ~/.openclaw/workspace/projects/jerry-os-staging
git checkout .
npm install
npm start
```

---

## ⚠️ **Important Rules**

### **DO:**
✅ Test experimental features in staging
✅ Break things in staging (that's what it's for)
✅ Use staging for A/B testing
✅ Validate all changes before production

### **DON'T:**
❌ Use staging for real work
❌ Keep sensitive data in staging
❌ Share staging URLs externally
❌ Skip testing in staging

---

## 🔧 **Advanced Usage**

### **Run Both Servers Simultaneously**

```bash
# Terminal 1: Production
cd jerry-os && npm start
# Runs on http://127.0.0.1:8980

# Terminal 2: Staging
cd jerry-os-staging && npm start
# Runs on http://127.0.0.1:8981
```

### **Compare Production vs Staging**

Open both in browser:
- Production: `http://127.0.0.1:8980`
- Staging: `http://127.0.0.1:8981`

Compare features side-by-side!

---

## 🐛 **Troubleshooting**

### **Staging won't start:**
```bash
# Check if port 8981 is in use
netstat -ano | findstr :8981

# Kill process if needed
Get-Process -Id <PID> | Stop-Process -Force
```

### **Changes not showing:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd jerry-os-staging
rm -rf node_modules
npm install
```

### **Deployment failed:**
```bash
# Manual deployment
cd jerry-os
.\deploy-staging.ps1
```

---

## 📊 **Staging Status**

**Server:** Running on port 8981
**Auto-Deploy:** Every night at 4:00 AM
**Status:** Ready for testing

---

## 🎯 **Quick Reference**

| Task | Command | URL |
|------|---------|-----|
| Start staging | `npm start` | `http://127.0.0.1:8981` |
| Deploy to staging | `.\deploy-staging.ps1` | N/A |
| Reset staging | `git checkout .` | N/A |
| Compare both | N/A | `8980` vs `8981` |

---

## 🚀 **Next Steps**

1. ✅ Staging environment set up
2. ✅ Automatic deployments configured
3. ✅ Documentation created
4. 🎯 Start testing your features!

---

**Questions?** Check `STAGING-README.md` or ask Jerry! 🤖
