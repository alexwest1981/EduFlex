<#
.SYNOPSIS
    Migrates the .gemini folder to E: drive and creates a Junction point.
    
.DESCRIPTION
    This script will:
    1. Copy contents of C:\Users\%USERNAME%\.gemini to E:\.gemini
    2. Verify the copy.
    3. Rename the old .gemini to .gemini_backup
    4. Create a Junction (Symlink) from C:\Users\%USERNAME%\.gemini -> E:\.gemini
    
.NOTES
    Run this script as Administrator.
    Ensure "Google Deepmind Agent" or similar processes are NOT running if possible to avoid file locks.
#>

$Source = "$env:USERPROFILE\.gemini"
$Dest = "E:\.gemini"

Write-Host "Migrating $Source to $Dest..." -ForegroundColor Cyan

# 1. Check if source exists
if (-not (Test-Path $Source)) {
    Write-Error "Source folder $Source does not exist."
    exit 1
}

# 2. Robocopy (Robust File Copy)
Write-Host "Copying files... (This might take a while)" -ForegroundColor Yellow
# /E = recursive, /COPYALL = copy all file info, /R:3 /W:1 = retry 3 times wait 1 sec on error
robocopy $Source $Dest /E /COPYALL /R:3 /W:1

if ($LASTEXITCODE -gt 7) {
    Write-Error "Robocopy failed with exit code $LASTEXITCODE"
    exit 1
}

Write-Host "Copy complete." -ForegroundColor Green

# 3. Rename old folder (Backup)
$Backup = "$Source" + "_backup_" + (Get-Date -Format "yyyyMMdd_HHmm")
Write-Host "Renaming old folder to $Backup..." -ForegroundColor Yellow
try {
    Rename-Item -Path $Source -NewName $Backup
}
catch {
    Write-Error "Could not rename source folder. Files might be in use."
    Write-Host "Please close any applications using .gemini (like VS Code or Agent) and try again." -ForegroundColor Red
    exit 1
}

# 4. Create Junction
Write-Host "Creating Junction point..." -ForegroundColor Cyan
New-Item -ItemType Junction -Path $Source -Target $Dest

if (Test-Path $Source) {
    Write-Host "Success! Junction created." -ForegroundColor Green
    Write-Host "You can now safely delete $Backup once you verify everything works." -ForegroundColor Gray
}
else {
    Write-Error "Failed to create Junction."
}
