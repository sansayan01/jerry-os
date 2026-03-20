# Jerry OS Staging Deployment Script (Windows PowerShell)
# This script automatically deploys production changes to staging

Write-Host "🚀 Jerry OS Staging Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Define paths
$productionDir = "$env:USERPROFILE\.openclaw\workspace\projects\jerry-os"
$stagingDir = "$env:USERPROFILE\.openclaw\workspace\projects\jerry-os-staging"

# Check if production directory exists
if (-not (Test-Path $productionDir)) {
    Write-Host "❌ Production directory not found: $productionDir" -ForegroundColor Red
    exit 1
}

# Check if staging directory exists
if (-not (Test-Path $stagingDir)) {
    Write-Host "❌ Staging directory not found: $stagingDir" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Syncing production to staging..." -ForegroundColor Yellow
Write-Host ""

# Get all files from production
$files = Get-ChildItem -Path $productionDir -Recurse -File | Where-Object {
    $_.FullName -notmatch "node_modules" -and
    $_.FullName -notmatch "\.git" -and
    $_.FullName -notmatch "\.log$"
}

# Copy files to staging
$copiedCount = 0
foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($productionDir.Length)
    $destPath = Join-Path $stagingDir $relativePath

    # Create directory if it doesn't exist
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    # Copy file
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    $copiedCount++
}

Write-Host "✅ Copied $copiedCount files" -ForegroundColor Green
Write-Host ""

# Restore staging-specific configuration
Write-Host "🔧 Configuring staging environment..." -ForegroundColor Yellow

# Update server.js port
$serverFile = Join-Path $stagingDir "server.js"
if (Test-Path $serverFile) {
    $content = Get-Content $serverFile -Raw
    $content = $content -replace 'PORT = 8980', 'PORT = 8981'
    $content = $content -replace 'http://0\.0\.0\.0:8980', 'http://0.0.0.0:8981'
    $content | Set-Content $serverFile -Force
    Write-Host "  ✅ Updated port to 8981" -ForegroundColor Green
}

# Update package.json
$packageFile = Join-Path $stagingDir "package.json"
if (Test-Path $packageFile) {
    $content = Get-Content $packageFile -Raw
    $content = $content -replace '"name": "jerry-os"', '"name": "jerry-os-staging"'
    $content = $content -replace '"description": ".*"', '"description": "Jerry OS Staging Environment - Testing Ground"'
    $content | Set-Content $packageFile -Force
    Write-Host "  ✅ Updated package.json" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Staging deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd projects/jerry-os-staging"
Write-Host "  2. npm install"
Write-Host "  3. npm start"
Write-Host ""
Write-Host "🌐 Staging will be available at: http://127.0.0.1:8981" -ForegroundColor Green
