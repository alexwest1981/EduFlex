@echo off
echo Startar EduFlex Control Center...
cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File ".\tools\control-center-java\Launch-Java.ps1"
