@echo off
cd /d "%~dp0"
echo Productivity Dashboard - Port Scanner
echo.

:: List of ports to try
set ports=3001,3002,3003,3004,3005,3006,3007,3008,3009,3010

:: Try each port
for %%p in (%ports%) do (
    echo Trying port %%p...
    set PORT=%%p
    
    :: Check if port is available
    netstat -ano | findstr :%%p >nul
    if errorlevel 1 (
        echo Port %%p is available - Starting server...
        start "Productivity Dashboard on %%p" cmd /c "cd /d \"%~dp0\" && set PORT=%%p && npm run dev-webpack"
        echo SUCCESS: Server started on port %%p
        echo URL: http://localhost:%%p
        echo.
        echo Press any key to stop trying more ports...
        pause >nul
        goto :end
    ) else (
        echo Port %%p is busy - trying next...
    )
)

:end
echo.
echo All ports tried or server started successfully.
echo Press any key to exit...
pause >nul
