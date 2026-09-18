@echo off
REM Rename artifacts directories

cd /d "%~dp0\..\artifacts"

echo Renaming api-server to taskflow-backend...
REN "api-server" "taskflow-backend"
IF %ERRORLEVEL% NEQ 0 (
    echo Error renaming api-server
    exit /b 1
)

echo Renaming taskflow to taskflow-frontend...
REN "taskflow" "taskflow-frontend"
IF %ERRORLEVEL% NEQ 0 (
    echo Error renaming taskflow
    exit /b 1
)

echo.
echo Updating package.json...
cd taskflow-backend

REM Use PowerShell to update the JSON (more reliable than sed on Windows)
powershell -Command "(Get-Content package.json) -replace '@workspace/api-server', '@workspace/taskflow-backend' | Set-Content package.json"

echo.
echo Done! New structure:
echo   - artifacts/taskflow-backend
echo   - artifacts/taskflow-frontend

cd /d "%~dp0"
