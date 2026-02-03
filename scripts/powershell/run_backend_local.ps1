# Script to run Backend locally for faster development
# Usage: .\scripts\run_backend_local.ps1

$ErrorActionPreference = "Stop"

# Force kill anything on port 8080 (e.g. stray java.exe)
Write-Host "Force killing any process on port 8080..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { 
    try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {} 
}

$projectRoot = Resolve-Path "$PSScriptRoot\..\.."
Write-Host "Project Root: $projectRoot" -ForegroundColor Gray

Write-Host "Stopping Docker Backend to free port 8080..." -ForegroundColor Yellow
# Ensure we run docker compose from the project root where docker-compose.yml is
Push-Location $projectRoot
try {
    # Stop by container name to be sure
    docker stop eduflex-backend
}
catch {
    Write-Host "Warning: Could not stop docker backend (maybe it's not running?)" -ForegroundColor DarkYellow
}
Pop-Location

Write-Host "Loading environment variables from .env..." -ForegroundColor Green
$envFile = Join-Path $projectRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^(?<key>[^#\s][^=]+)=(?<value>.*)$') {
            $key = $Matches.key.Trim()
            $value = $Matches.value.Trim()
            Set-Item -Path "env:$key" -Value $value
            # Write-Host "Loaded $key" -ForegroundColor Gray
        }
    }
}

Write-Host "Setting up overrides..." -ForegroundColor Green
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://127.0.0.1:5432/eduflex"
$env:SPRING_REDIS_HOST = "127.0.0.1"
$env:MINIO_URL = "http://127.0.0.1:9000"
$env:MINIO_PUBLIC_URL = "https://storage.eduflexlms.se"
# Disable Kafka locally to avoid timeouts
$env:SPRING_AUTOCONFIGURE_EXCLUDE = "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
# Set Internal Backend URL for OnlyOffice (Docker -> Host)
$env:APP_BACKEND_INTERNAL_URL = "http://host.docker.internal:8080"
# Set OnlyOffice URL for health checks (Local -> Docker)
$env:ONLYOFFICE_URL = "http://127.0.0.1:8081"
# Ensure logging works locally without /app/logs
$env:LOGGING_FILE_NAME = Join-Path (Join-Path $projectRoot "logs") "server.log"
# Use Relaxed Binding for file.upload-dir (PowerShell acts weird with dots in env vars)
$env:FILE_UPLOAD_DIR = Join-Path $projectRoot "uploads"

Write-Host "Starting EduFlex Backend..." -ForegroundColor Cyan
Set-Location (Join-Path $projectRoot "eduflex")
.\mvnw "-Dmaven.test.skip=true" "-DskipTests" "-Dminio.public-url=http://127.0.0.1:9000" "-Djava.net.preferIPv4Stack=true" spring-boot:run
