# Complete Docker Desktop Reinstallation Script
# This will completely remove and reinstall Docker Desktop to fix stability issues
# Usage: .\scripts\powershell\reinstall_docker.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Docker Desktop Complete Reinstallation ===" -ForegroundColor Cyan
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Stop all Docker processes" -ForegroundColor White
Write-Host "  2. Unregister WSL2 Docker distributions" -ForegroundColor White
Write-Host "  3. Uninstall Docker Desktop" -ForegroundColor White
Write-Host "  4. Clean up all Docker files" -ForegroundColor White
Write-Host "  5. Download and install latest Docker Desktop" -ForegroundColor White
Write-Host ""
Write-Host "WARNING: This will remove all Docker containers, images, and volumes!" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host "`n=== Step 1: Stopping Docker Desktop ===" -ForegroundColor Green
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.backend" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.proxy" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5

Write-Host "`n=== Step 2: Shutting down WSL2 ===" -ForegroundColor Green
wsl --shutdown
Start-Sleep -Seconds 5

Write-Host "`n=== Step 3: Unregistering Docker WSL distributions ===" -ForegroundColor Green
$wslDistros = wsl --list -q
if ($wslDistros -contains "docker-desktop") {
    Write-Host "Unregistering docker-desktop..." -ForegroundColor Yellow
    wsl --unregister docker-desktop
}
if ($wslDistros -contains "docker-desktop-data") {
    Write-Host "Unregistering docker-desktop-data..." -ForegroundColor Yellow
    wsl --unregister docker-desktop-data
}

Write-Host "`n=== Step 4: Uninstalling Docker Desktop ===" -ForegroundColor Green
# Try multiple ways to find the uninstaller
$dockerApp = Get-Package -Name "*Docker Desktop*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($dockerApp) {
    Write-Host "Uninstalling Docker Desktop via Get-Package..." -ForegroundColor Yellow
    $dockerApp | Uninstall-Package -Force -ErrorAction SilentlyContinue
}
else {
    $dockerWmi = Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -like "*Docker Desktop*" }
    if ($dockerWmi) {
        Write-Host "Uninstalling Docker Desktop via WMI..." -ForegroundColor Yellow
        $dockerWmi.Uninstall() | Out-Null
    }
    else {
        Write-Host "Docker Desktop not found via standard package managers. Trying winget..." -ForegroundColor Yellow
        if (Get-Command winget -ErrorAction SilentlyContinue) {
            winget uninstall "Docker Desktop" --silent
        }
        else {
            Write-Host "winget not found. Skipping winget uninstall." -ForegroundColor DarkYellow
        }
    }
}

# Final check: see if the uninstaller exe exists and run it if found
$manualUninstaller = "C:\Program Files\Docker\Docker\Docker Desktop Installer.exe"
if (Test-Path $manualUninstaller) {
    Write-Host "Found manual uninstaller. Running uninstall..." -ForegroundColor Yellow
    Start-Process -FilePath $manualUninstaller -ArgumentList "uninstall", "--quiet" -Wait
}

Start-Sleep -Seconds 10

Write-Host "`n=== Step 5: Cleaning up Docker files ===" -ForegroundColor Green
$foldersToRemove = @(
    "C:\Program Files\Docker",
    "$env:APPDATA\Docker",
    "$env:LOCALAPPDATA\Docker",
    "$env:ProgramData\Docker",
    "$env:ProgramData\DockerDesktop"
)

foreach ($folder in $foldersToRemove) {
    if (Test-Path $folder) {
        Write-Host "Removing $folder..." -ForegroundColor Yellow
        Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "`n=== Step 6: Downloading Docker Desktop ===" -ForegroundColor Green
$dockerInstallerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$installerPath = "$env:TEMP\DockerDesktopInstaller.exe"

Write-Host "Downloading from $dockerInstallerUrl..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $dockerInstallerUrl -OutFile $installerPath

Write-Host "`n=== Step 7: Installing Docker Desktop ===" -ForegroundColor Green
Write-Host "Running installer (this may take 5-10 minutes)..." -ForegroundColor Yellow
Start-Process -FilePath $installerPath -ArgumentList "install", "--quiet", "--accept-license" -Wait

Write-Host "`n=== Step 8: Starting Docker Desktop ===" -ForegroundColor Green
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host "`nWaiting 60 seconds for Docker Desktop to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "`n=== Step 9: Verifying installation ===" -ForegroundColor Green
try {
    docker version
    Write-Host "`n=== Docker Desktop Reinstallation Complete! ===" -ForegroundColor Green
    Write-Host "Docker is now running. You can start your containers with docker-compose." -ForegroundColor Cyan
}
catch {
    Write-Host "`nDocker is not responding yet. Please wait a few more minutes and try 'docker version'" -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for Docker Desktop to fully start (check system tray icon)" -ForegroundColor White
Write-Host "  2. Run: docker-compose up -d" -ForegroundColor White
Write-Host "  3. Run: .\scripts\powershell\run_backend_local.ps1" -ForegroundColor White
