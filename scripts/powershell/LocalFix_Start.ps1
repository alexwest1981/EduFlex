# Master Startup Script for EduFlex Local Development (No Docker)
# This script starts everything: PostgreSQL, Redis, MinIO, Backend, Frontend, and Cloudflare Tunnel.
# Usage: .\scripts\powershell\LocalFix_Start.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== EduFlex LocalFix Master Startup ===" -ForegroundColor Cyan
Write-Host "starting all services locally..." -ForegroundColor Yellow

$projectRoot = Resolve-Path "$PSScriptRoot\..\.."
Set-Location $projectRoot

# 1. Ensure Local Services are Running
Write-Host "`n[1/6] Checking local services (Postgres & Redis)..." -ForegroundColor Green
Start-Service postgresql-x64-15 -ErrorAction SilentlyContinue
Start-Service redis -ErrorAction SilentlyContinue

# 2. Start MinIO
Write-Host "[2/6] Starting MinIO..." -ForegroundColor Green
$minioScript = Join-Path $projectRoot "minio\start_minio.ps1"
if (Test-Path $minioScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", "$minioScript" -WindowStyle Normal
}
else {
    Write-Host "Warning: MinIO startup script not found at $minioScript" -ForegroundColor Red
}

# 3. Start Backend
Write-Host "[3/6] Starting Backend (8080)..." -ForegroundColor Green
$backendScript = Join-Path $projectRoot "scripts\powershell\run_backend_local.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "$backendScript" -WindowStyle Normal

# 4. Start Frontend
Write-Host "[4/6] Starting Frontend (5174)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --prefix frontend -- --port 5174 --host" -WindowStyle Normal

# 5. Start Cloudflare Tunnel
Write-Host "[5/6] Starting Cloudflare Tunnel (eduflexlms)..." -ForegroundColor Green
$cloudflaredExe = Join-Path $projectRoot "cloudflared.exe"
$cloudflareConfig = Join-Path $projectRoot "cloudflared_config.yml"
if (Test-Path $cloudflaredExe) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$cloudflaredExe' --config '$cloudflareConfig' tunnel run eduflexlms" -WindowStyle Normal
}
else {
    Write-Host "Warning: cloudflared.exe not found at $cloudflaredExe" -ForegroundColor Red
}

Write-Host "`n[6/6] All startup commands executed!" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host "Check the new windows for status of each component." -ForegroundColor White
Write-Host "Application will be available at:" -ForegroundColor Yellow
Write-Host "  - Local:     http://localhost:5174" -ForegroundColor White
Write-Host "  - Online:    https://www.eduflexlms.se" -ForegroundColor White
Write-Host "  - API:       http://localhost:8080/actuator/health" -ForegroundColor White
Write-Host "  - MinIO:     http://localhost:9001 (Console)" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Gray
