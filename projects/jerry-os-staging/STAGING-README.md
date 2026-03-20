# Jerry OS Staging Environment

## 🎯 Purpose
This is the **testing ground** for Jerry OS features before they go to production.

## 🚀 How It Works

### Ports
- **Production**: `http://127.0.0.1:8980`
- **Staging**: `http://127.0.0.1:8981`

### Workflow
```
Development → Staging (8981) → Production (8980)
   (you)         (testing)        (live)
```

## 📋 Usage

### Start Staging Server
```bash
cd projects/jerry-os-staging
npm start
```

### Test New Features
1. Make changes in staging directory
2. Test on port 8981
3. If successful → merge to production
4. If failed → rollback easily

## 🔄 Deployment Process

### Automatic Deployment
Staging automatically receives updates from production every night at 4:00 AM.

### Manual Deployment
```bash
# From production directory
cd projects/jerry-os
npm run deploy:staging
```

## ⚠️ Important Notes

- **Staging is for testing** - Don't use for production work
- **Data is separate** - Staging has its own database/logs
- **Safe to experiment** - Break things here, not in production
- **Rollback friendly** - Easy to reset if needed

## 🛠️ Maintenance

### Reset Staging
```bash
cd projects/jerry-os-staging
git checkout .
npm install
```

### Update from Production
```bash
cd projects/jerry-os-staging
git pull origin main
npm install
```

## 📊 Status Badges
- 🟢 Staging: Running on port 8981
- 🔵 Production: Running on port 8980
