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

echo Restarting Docker service to fix connection issues...
echo This may take a moment...
wsl --shutdown
timeout /t 3 /nobreak >nul
echo.

echo Waiting for Docker to restart...
timeout /t 10 /nobreak >nul
echo.

echo Testing Docker connection...
docker version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not responding. Please:
    echo 1. Open Docker Desktop
    echo 2. Wait for it to fully start
    echo 3. Run this script again
    pause
    exit /b 1
)

echo Docker connected successfully!
echo.

echo Finding PostgreSQL container or pod...
echo Trying Docker containers first...
for /f "tokens=*" %%i in ('docker ps -q -f "ancestor=postgres:15-alpine" 2^>nul') do set CONTAINER_ID=%%i

if not "%CONTAINER_ID%"=="" (
    echo Found Docker container: %CONTAINER_ID%
    goto :restore_docker
)

echo No Docker container found, trying Kubernetes...
kubectl get pods -n eduflex -l app=postgresql -o jsonpath="{.items[0].metadata.name}" >temp_pod.txt 2>nul
set /p POD_NAME=<temp_pod.txt
del temp_pod.txt >nul 2>&1

if not "%POD_NAME%"=="" (
    echo Found Kubernetes pod: %POD_NAME%
    goto :restore_k8s
)

echo ERROR: No PostgreSQL container or pod found!
echo Please make sure PostgreSQL is running.
pause
exit /b 1

:restore_docker
echo.
echo Using Docker to restore database...
echo Copying SQL file to container...
docker cp "backups\daily\eduflex-20260115.sql\eduflex-20260115.sql" %CONTAINER_ID%:/tmp/restore.sql

if errorlevel 1 (
    echo ERROR: Failed to copy file to container
    pause
    exit /b 1
)

echo Restoring database (this may take a minute)...
docker exec %CONTAINER_ID% psql -U postgres -d eduflex -f /tmp/restore.sql

if errorlevel 1 (
    echo ERROR: Database restore failed
    pause
    exit /b 1
)

echo Cleaning up...
docker exec %CONTAINER_ID% rm /tmp/restore.sql
goto :success

:restore_k8s
echo.
echo Using Kubernetes to restore database...
echo Copying SQL file to pod...
kubectl cp "backups/daily/eduflex-20260115.sql/eduflex-20260115.sql" eduflex/%POD_NAME%:/tmp/restore.sql

if errorlevel 1 (
    echo ERROR: Failed to copy file to pod
    pause
    exit /b 1
)

echo Restoring database (this may take a minute)...
kubectl exec -n eduflex %POD_NAME% -- psql -U postgres -d eduflex -f /tmp/restore.sql

if errorlevel 1 (
    echo ERROR: Database restore failed
    pause
    exit /b 1
)

echo Cleaning up...
kubectl exec -n eduflex %POD_NAME% -- rm /tmp/restore.sql
goto :success

:success
echo.
echo ================================================
echo Database restored successfully!
echo ================================================
echo.
echo You can now start using EduFlex with the restored data.
pause
