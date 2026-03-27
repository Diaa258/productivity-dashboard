@echo off
cd /d "%~dp0"
echo Quick Port Tester - Productivity Dashboard
echo.

:: Try common available ports
set ports=8080,8081,8082,8083,8084,8085,8086,8087,8088,8089,8090

for %%p in (%ports%) do (
    echo Testing port %%p...
    set PORT=%%p
    
    :: Check if port is in use
    netstat -ano | findstr :%%p >nul
    if errorlevel 1 (
        echo.
        echo ========================================
        echo PORT %%p IS AVAILABLE!
        echo Starting server on port %%p...
        echo ========================================
        echo.
        echo URL will be: http://localhost:%%p
        echo.
        set PORT=%%p
        npm run dev-webpack
        goto :found
    ) else (
        echo Port %%p is busy...
    )
)

echo.
echo All ports from 8080-8090 are busy.
echo Trying 9000-9010...
echo.

set ports=9000,9001,9002,9003,9004,9005

for %%p in (%ports%) do (
    echo Testing port %%p...
    set PORT=%%p
    
    :: Check if port is in use
    netstat -ano | findstr :%%p >nul
    if errorlevel 1 (
        echo.
        echo ========================================
        echo PORT %%p IS AVAILABLE!
        echo Starting server on port %%p...
        echo ========================================
        echo.
        echo URL will be: http://localhost:%%p
        echo.
        set PORT=%%p
        npm run dev-webpack
        goto :found
    ) else (
        echo Port %%p is busy...
    )
)

echo.
echo ERROR: All tested ports are busy!
echo Please close some applications and try again.
pause

:found
echo.
echo Server started successfully!
pause
