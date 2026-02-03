@echo off
echo ================================================
echo EduFlex Database Restore Script
echo ================================================
echo.

REM Check if backup file exists
if not exist "backups\daily\eduflex-20260115.sql\eduflex-20260115.sql" (
    echo ERROR: Backup file not found!
    pause
    exit /b 1
)

echo Creating clean SQL file without restrict commands...
grep -Fv "\restrict" "backups\daily\eduflex-20260115.sql\eduflex-20260115.sql" | grep -Fv "\unrestrict" > "backups\daily\eduflex-20260115-clean.sql"

echo Finding PostgreSQL container...
for /f "tokens=*" %%i in ('docker ps -q -f "ancestor=postgres:15-alpine"') do set CONTAINER_ID=%%i

if "%CONTAINER_ID%"=="" (
    echo ERROR: PostgreSQL container not found!
    echo Please make sure PostgreSQL is running in Docker/Kubernetes
    pause
    exit /b 1
)

echo Found container: %CONTAINER_ID%
echo.
echo Copying SQL file to container...
docker cp "backups\daily\eduflex-20260115-clean.sql" %CONTAINER_ID%:/tmp/restore.sql

if errorlevel 1 (
    echo ERROR: Failed to copy file to container
    pause
    exit /b 1
)

echo.
echo Restoring database...
docker exec %CONTAINER_ID% psql -U postgres -d eduflex -f /tmp/restore.sql

if errorlevel 1 (
    echo ERROR: Database restore failed
    pause
    exit /b 1
)

echo.
echo Cleaning up...
docker exec %CONTAINER_ID% rm /tmp/restore.sql

echo.
echo ================================================
echo Database restored successfully!
echo ================================================
pause
