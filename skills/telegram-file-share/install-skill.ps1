# Install Telegram File Share Skill for OpenClaw
Write-Host "=== Installing Telegram File Share Skill ===" -ForegroundColor Cyan

$skillPath = "C:\Users\sscom\.openclaw\workspace\skills\telegram-file-share"
$targetPath = "C:\Users\sscom\openclaw_skills"

# Create target directory if it doesn't exist
if (-not (Test-Path $targetPath)) {
    New-Item -ItemType Directory -Path $targetPath -Force
    Write-Host "Created skills directory: $targetPath" -ForegroundColor Green
}

# Copy skill files
$destination = Join-Path $targetPath "telegram-file-share"
if (Test-Path $destination) {
    Remove-Item -Path $destination -Recurse -Force
}

Copy-Item -Path $skillPath -Destination $destination -Recurse -Force

Write-Host "✅ Skill installed to: $destination" -ForegroundColor Green
Write-Host "`nTo use the skill:" -ForegroundColor Cyan
Write-Host "  1. Mention 'telegram-file-share' or ask to send files via Telegram" -ForegroundColor White
Write-Host "  2. Example: 'Send my resume.pdf to Telegram'" -ForegroundColor White
Write-Host "`nThe skill is ready to use!" -ForegroundColor Green