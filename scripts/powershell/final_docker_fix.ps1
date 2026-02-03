# Script to FINAL FIX Docker Storage and Port Conflicts
# Usage: .\scripts\powershell\final_docker_fix.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== FINAL DOCKER FIX PROTOCOL ===" -ForegroundColor Magenta

# 1. STOP LOCAL SERVICES (Port Conflicts)
Write-Host "`n[1/5] Stopping Local Services (freeing ports 5432, 6379, 8080)..." -ForegroundColor Yellow
try {
    Stop-Service postgresql-x64-15 -Force -ErrorAction SilentlyContinue 
    Write-Host "Stopped PostgreSQL." -ForegroundColor Gray
}
catch { Write-Host "PostgreSQL not running." -ForegroundColor DarkGray }

try {
    Stop-Service redis -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped Redis." -ForegroundColor Gray
}
catch { Write-Host "Redis not running." -ForegroundColor DarkGray }

# Kill MinIO and Java (Backend)
Get-Process minio -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Killed MinIO and Java processes." -ForegroundColor Gray


# 2. STOP DOCKER DESKTOP
Write-Host "`n[2/5] Stopping Docker Desktop completely..." -ForegroundColor Yellow
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Stop-Service com.docker.service -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
wsl --shutdown
Start-Sleep -Seconds 5


# 3. NUKE C: DATA
Write-Host "`n[3/5] Nuking rogue Docker data on C:..." -ForegroundColor Red
$cPath = "$env:LOCALAPPDATA\Docker\wsl"
if (Test-Path $cPath) {
    Remove-Item $cPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Deleted $cPath" -ForegroundColor Green
}
else {
    Write-Host "C: is clean." -ForegroundColor Green
}


# 4. START DOCKER DESKTOP
Write-Host "`n[4/5] Starting Docker Desktop (Force E:)..." -ForegroundColor Cyan
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
Write-Host "Waiting 30 seconds for initialization..."
Start-Sleep -Seconds 30


# 5. START CONTAINERS
Write-Host "`n[5/5] Starting Docker Containers..." -ForegroundColor Cyan
Set-Location "E:\Projekt\EduFlex"
docker-compose up -d

Write-Host "`n=== COMPLETED. ===" -ForegroundColor Green
Write-Host "Docker should now be running on E: and containers starting."
