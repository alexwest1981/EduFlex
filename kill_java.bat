@echo off
echo Killing all Java processes...
taskkill /F /IM java.exe
taskkill /F /IM javaw.exe
echo Done.
pause
