# Gateway Auto-Start Script for Windows
# This ensures OpenClaw gateway starts automatically on system boot

Write-Host "🚀 Setting up OpenClaw Gateway Auto-Start..." -ForegroundColor Cyan

# Create a scheduled task to start gateway on boot
$taskName = "OpenClawGatewayAutoStart"
$taskDescription = "Automatically starts OpenClaw Gateway on system boot"

# Check if task already exists
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($task) {
    Write-Host "✅ Task already exists. Updating..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the action to start gateway
$action = New-ScheduledTaskAction -Execute "openclaw" -Argument "gateway start"

# Create the trigger (at system startup)
$trigger = New-ScheduledTaskTrigger -AtStartup

# Create the settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register the task
Register-ScheduledTask -TaskName $taskName -Description $taskDescription -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest

Write-Host "✅ Gateway auto-start task created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Task Details:" -ForegroundColor Cyan
Write-Host "  Name: $taskName"
Write-Host "  Trigger: At system startup"
Write-Host "  Action: openclaw gateway start"
Write-Host ""
Write-Host "🔄 The gateway will now start automatically on system boot" -ForegroundColor Green
Write-Host "📍 You can also manually start it from Task Scheduler" -ForegroundColor Yellow
