@echo off
setlocal
:: Change to the directory where the batch file is located
cd /d "%~dp0"

echo ==========================================
echo    🎓 EduFlex LLP - One-Click Start
echo ==========================================
echo.

:: Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PowerShell is required but not found.
    pause
    exit /b 1
)

:: Run the enhanced PowerShell orchestrator
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\powershell\start_everything.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Startup failed. Please check the logs above.
    pause
)
