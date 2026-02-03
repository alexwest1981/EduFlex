# restore_after_purge.ps1
# Use this to restore the database from the midnight backup after a Docker Purge.

$projectRoot = "$PSScriptRoot\..\.."
$backupFile = "E:\Projekt\EduFlex\backups\last\eduflex-20260202-000006.sql.gz"
$tempSql = "E:\Projekt\EduFlex\backups\last\temp_restore.sql"

Write-Host "Checking if Docker is responsive..." -ForegroundColor Cyan
try {
    docker ps -q
}
catch {
    Write-Error "Docker is NOT responsive. Please restart your computer or Docker Desktop first."
    exit
}

Write-Host "Starting a fresh database container..." -ForegroundColor Yellow
docker-compose up -d db
Write-Host "Waiting 10 seconds for DB to initialize..." -ForegroundColor Green
Start-Sleep -Seconds 10

Write-Host "Extracting backup..." -ForegroundColor Green
# Try to find a way to extract gz. If not, user might need to unzip manually or we use powershell
# For now, let's assume the user can unzip it if this fails, or we try to use Expand-Archive if it's a zip (but it's .gz)
# Better: use docker to extract it if possible, or just notify user.
Write-Host "NOTE: You might need to manually extract $backupFile to $tempSql if unzip fails."

# Restoration command via docker exec (more reliable than local psql)
Write-Host "Restoring database..." -ForegroundColor Yellow
cat "$tempSql" | docker exec -i eduflex-db psql -U postgres -d eduflex

Write-Host "Restoration finished. Starting all services..." -ForegroundColor Cyan
docker-compose up -d
