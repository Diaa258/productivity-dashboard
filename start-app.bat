@echo off
cd /d "%~dp0"
set PORT=8080
echo Starting Productivity Dashboard on port 8080...
npm run dev-webpack
pause
