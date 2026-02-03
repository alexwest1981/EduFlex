# Script to switch from Local DB to Docker DB
# Usage: .\scripts\powershell\switch_to_docker.ps1

Write-Host "=== Switching to Docker Database ===" -ForegroundColor Cyan

# 1. Stop Local PostgreSQL Service
Write-Host "1. Stopping Local PostgreSQL Service..." -ForegroundColor Yellow
$service = Get-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq 'Running') {
    Stop-Service -Name "postgresql-x64-18" -Force
    Write-Host "   Local PostgreSQL stopped." -ForegroundColor Green
}
else {
    Write-Host "   Local PostgreSQL not running or not found." -ForegroundColor Gray
}

# 2. Restart Docker Desktop
Write-Host "2. Restarting Docker Desktop..." -ForegroundColor Yellow
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerProcess) {
    Stop-Process -Name "Docker Desktop" -Force
    Write-Host "   Docker Desktop process killed." -ForegroundColor Gray
}

# Start Docker Desktop
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    Start-Process $dockerPath
    Write-Host "   Docker Desktop started. Waiting for initialization..." -ForegroundColor Green
}
else {
    Write-Error "   Could not find Docker Desktop at default location."
    exit 1
}

# 3. Wait for Docker
Write-Host "3. Waiting for Docker Engine (timeout 120s)..." -ForegroundColor Yellow
$timeout = 120
$timer = 0
while ($timer -lt $timeout) {
    $dockerInfo = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Docker is ready!" -ForegroundColor Green
        break
    }
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 2
    $timer += 2
}

if ($timer -ge $timeout) {
    Write-Error "   Timed out waiting for Docker."
    exit 1
}

# 4. Start Containers
Write-Host "4. Starting Containers..." -ForegroundColor Yellow
Set-Location "E:\Projekt\EduFlex"
docker-compose up -d --build backend
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Containers started successfully!" -ForegroundColor Green
}
else {
    Write-Error "   Failed to start containers."
    exit 1
}

Write-Host "=== Switch Complete. Ready to restart backend. ===" -ForegroundColor Cyan
