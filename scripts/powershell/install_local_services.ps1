# Install Local Services for EduFlex Development (Temporary Solution)
# This allows you to develop while we fix Docker Desktop
# Usage: .\scripts\powershell\install_local_services.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== EduFlex Local Services Installer ===" -ForegroundColor Cyan
Write-Host "This will install PostgreSQL, Redis, and MinIO locally on Windows" -ForegroundColor Yellow
Write-Host ""

# Check if Chocolatey is installed
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Chocolatey not found. Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    # Use -y for the installation script if it supports it, or just run it
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# Try to set choco to always say yes
choco feature enable -n=allowGlobalConfirmation -ErrorAction SilentlyContinue

Write-Host "`n1. Installing PostgreSQL 15..." -ForegroundColor Green
# Using --force and --yes to be extra sure
choco install postgresql15 --params '/Password:gotland81' -y --force

Write-Host "`n2. Installing Redis..." -ForegroundColor Green
choco install redis-64 -y --force

Write-Host "`n3. Downloading MinIO..." -ForegroundColor Green
$minioDir = "E:\Projekt\EduFlex\minio"
$minioDataDir = "E:\Projekt\EduFlex\minio-data"
New-Item -ItemType Directory -Force -Path $minioDir | Out-Null
New-Item -ItemType Directory -Force -Path $minioDataDir | Out-Null

$minioUrl = "https://dl.min.io/server/minio/release/windows-amd64/minio.exe"
$minioPath = Join-Path $minioDir "minio.exe"

if (!(Test-Path $minioPath)) {
    Write-Host "Downloading MinIO..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $minioUrl -OutFile $minioPath
}

Write-Host "`n4. Configuring services..." -ForegroundColor Green

# Start PostgreSQL service
Start-Service postgresql-x64-15 -ErrorAction SilentlyContinue

# Start Redis service
Start-Service redis -ErrorAction SilentlyContinue

# Create MinIO startup script
$minioStartScript = @"
# Start MinIO Server
`$env:MINIO_ROOT_USER = "minioadmin"
`$env:MINIO_ROOT_PASSWORD = "minioadmin"
Start-Process -FilePath "$minioPath" -ArgumentList "server", "$minioDataDir", "--console-address", ":9001" -WindowStyle Normal
Write-Host "MinIO started on http://localhost:9000 (Console: http://localhost:9001)" -ForegroundColor Green
"@

$minioStartScript | Out-File -FilePath (Join-Path $minioDir "start_minio.ps1") -Encoding UTF8

Write-Host "`n=== Installation Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Services installed:" -ForegroundColor Cyan
Write-Host "  - PostgreSQL 15 (localhost:5432, user: postgres, password: gotland81)" -ForegroundColor White
Write-Host "  - Redis (localhost:6379)" -ForegroundColor White
Write-Host "  - MinIO (run: .\minio\start_minio.ps1)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start MinIO: .\minio\start_minio.ps1" -ForegroundColor White
Write-Host "  2. Update application.properties to use localhost:5432 (not 5433)" -ForegroundColor White
Write-Host "  3. Run backend: .\scripts\powershell\run_backend_local.ps1" -ForegroundColor White
