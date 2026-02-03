# Script to move Docker Desktop WSL2 data to E: drive
# Usage: .\scripts\powershell\move_docker_to_e.ps1

$ErrorActionPreference = "Stop"

$targetRoot = "E:\Docker"
$distrosToMove = @("docker-desktop", "docker-desktop-data")

Write-Host "=== Moving Docker Data to E: Drive ===" -ForegroundColor Cyan
Write-Host "Target Root: $targetRoot" -ForegroundColor Gray

# Create root if needed
if (!(Test-Path $targetRoot)) { New-Item -ItemType Directory -Path $targetRoot -Force | Out-Null }

Write-Host "Stopping Docker Desktop..." -ForegroundColor Yellow
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5
wsl --shutdown
Start-Sleep -Seconds 5

# Get current distros
$currentDistros = wsl --list --quiet
# Clean up string array (remove nulls/whitespace)
$currentDistros = $currentDistros | Where-Object { $_ -match "\S" } | ForEach-Object { $_.Trim() -replace "`0", "" }

foreach ($distro in $distrosToMove) {
    if ($currentDistros -contains $distro) {
        Write-Host "`nProcessing distro: $distro" -ForegroundColor Cyan
        
        $targetDir = Join-Path $targetRoot $distro
        $exportFile = Join-Path $targetRoot "$distro.tar"

        if (!(Test-Path $targetDir)) {
            Write-Host "Creating directory: $targetDir" -ForegroundColor Yellow
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }

        Write-Host "Exporting $distro..." -ForegroundColor Yellow
        wsl --export $distro $exportFile

        Write-Host "Unregistering $distro from C:..." -ForegroundColor Yellow
        wsl --unregister $distro

        Write-Host "Importing $distro to $targetDir..." -ForegroundColor Yellow
        wsl --import $distro $targetDir $exportFile --version 2

        Write-Host "Cleaning up tar file..." -ForegroundColor Yellow
        Remove-Item $exportFile -Force
        
        Write-Host "✅ Moved $distro successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "Skipping $distro (not found in WSL)" -ForegroundColor DarkGray
    }
}

Write-Host "`n=== Docker Move Complete! ===" -ForegroundColor Green
Write-Host "You can now start Docker Desktop." -ForegroundColor Cyan
