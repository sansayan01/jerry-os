# Telegram File Sender Script
# Helps locate and prepare files for sending via Telegram

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [string]$SearchPath = "C:\Users\sscom",
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

# Output JSON for OpenClaw parsing
$output = @{
    success = $false
    filePath = ""
    fileName = ""
    fileSize = 0
    fileSizeReadable = ""
    error = ""
    warning = ""
}

try {
    # Check if it's an exact path
    if (Test-Path -Path $FilePath -PathType Leaf) {
        $file = Get-Item -Path $FilePath
        $output.filePath = $file.FullName
        $output.fileName = $file.Name
        $output.fileSize = $file.Length
        $output.fileSizeReadable = "{0:N2} MB" -f ($file.Length / 1MB)
        
        # Check file size warning
        if ($file.Length -gt 20MB) {
            $output.warning = "File exceeds 20MB (Telegram bot limit). Consider compression or user upload."
        }
        if ($file.Length -gt 50MB) {
            $output.warning = "File exceeds 50MB. Will need manual upload or external sharing."
        }
        
        $output.success = $true
    }
    else {
        # Search for the file
        $searchName = Split-Path -Leaf $FilePath
        Write-Host "Searching for: $searchName in $SearchPath" -ForegroundColor Yellow
        
        $found = Get-ChildItem -Path $SearchPath -Recurse -Filter "*$searchName*" -File -ErrorAction SilentlyContinue | 
                 Select-Object -First 1
        
        if ($found) {
            $output.filePath = $found.FullName
            $output.fileName = $found.Name
            $output.fileSize = $found.Length
            $output.fileSizeReadable = "{0:N2} MB" -f ($found.Length / 1MB)
            $output.success = $true
            
            Write-Host "Found: $($found.FullName)" -ForegroundColor Green
        }
        else {
            $output.error = "File not found: $FilePath"
        }
    }
}
catch {
    $output.error = "Error: $($_.Exception.Message)"
}

# Output as JSON for parsing
$output | ConvertTo-Json