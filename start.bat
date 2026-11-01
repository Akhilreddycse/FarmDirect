@echo off
title FarmDirect - Local Development
cd /d "%~dp0"

echo ========================================================
echo   Starting FarmDirect (Backend + Frontend)...
echo ========================================================
echo.

rem Run the development command
start http://localhost:5173
npm run dev
