@echo off
echo Starting EduFlex Backend...
cd /d "E:\Projekt\EduFlex"
powershell -ExecutionPolicy Bypass -File "scripts\powershell\run_backend_local.ps1"
pause
