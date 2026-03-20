#!/bin/bash
# Jerry OS Staging Deployment Script
# This script automatically deploys production changes to staging

echo "🚀 Jerry OS Staging Deployment"
echo "================================="
echo ""

# Define paths
PRODUCTION_DIR="$HOME/.openclaw/workspace/projects/jerry-os"
STAGING_DIR="$HOME/.openclaw/workspace/projects/jerry-os-staging"

# Check if production directory exists
if [ ! -d "$PRODUCTION_DIR" ]; then
    echo "❌ Production directory not found: $PRODUCTION_DIR"
    exit 1
fi

# Check if staging directory exists
if [ ! -d "$STAGING_DIR" ]; then
    echo "❌ Staging directory not found: $STAGING_DIR"
    exit 1
fi

echo "📦 Syncing production to staging..."
echo ""

# Copy files (excluding node_modules and logs)
rsync -av --exclude='node_modules' \
          --exclude='.git' \
          --exclude='*.log' \
          --exclude='gateway-monitor.log' \
          --delete \
          "$PRODUCTION_DIR/" "$STAGING_DIR/"

# Restore staging-specific files
cd "$STAGING_DIR"

# Reset port to staging port
if [ -f "server.js" ]; then
    sed -i 's/PORT = 8980/PORT = 8981/' server.js
    sed -i 's/port 8980/port 8981 (staging)/' server.js
fi

# Update package.json for staging
if [ -f "package.json" ]; then
    sed -i 's/"name": "jerry-os"/"name": "jerry-os-staging"/' package.json
fi

echo ""
echo "✅ Staging deployment complete!"
echo ""
echo "📋 Next steps:"
echo "  1. cd projects/jerry-os-staging"
echo "  2. npm install"
echo "  3. npm start"
echo ""
echo "🌐 Staging will be available at: http://127.0.0.1:8981"
