# EduFlex Cold Start Script
# This script handles a fresh start of the entire environment.
# 1. Cleans up stale processes
# 2. Starts core infrastructure (Docker)
# 3. Starts Application Services (Backend & Frontend)
# 4. Starts Cloudflare Tunnel with correct config

$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path "$PSScriptRoot\..\.."

Write-Host "--- EduFlex Cold Start Initiated ---" -ForegroundColor Cyan

# 1. Cleanup
Write-Host "[1/4] Cleaning up stale processes..." -ForegroundColor Yellow
$processesToKill = @("cloudflared", "java", "node")
foreach ($procName in $processesToKill) {
    Stop-Process -Name $procName -Force -ErrorAction SilentlyContinue
}

# Kill specifically on ports if names weren't enough
$ports = @(8080, 5173, 5174, 9000)
foreach ($port in $ports) {
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object {
        try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {}
    }
}

# 2. Infrastructure
Write-Host "[2/4] Starting Docker infrastructure..." -ForegroundColor Green
Set-Location $projectRoot
docker-compose down
docker-compose up -d db redis minio keycloak onlyoffice-ds

Write-Host "Waiting for infrastructure to stabilize (10s)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# 3. Application Services
Write-Host "[3/4] Launching Application Services..." -ForegroundColor Green

# Start Backend in new window
Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; .\scripts\powershell\run_backend_local.ps1"

# Start Frontend in new window
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev"

# 4. Cloudflare Tunnel
Write-Host "[4/4] Starting Cloudflare Tunnel..." -ForegroundColor Green
Write-Host "Using config: logs\cloudflared-config.yml" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "C:\cloudflared.exe tunnel --config '$projectRoot\logs\cloudflared-config.yml' run"

Write-Host "`nAll services have been initiated in separate windows." -ForegroundColor Green
Write-Host "Check the new windows for logs." -ForegroundColor Gray
Write-Host "EduFlex should be available at https://www.eduflexlms.se soon." -ForegroundColor Cyan
