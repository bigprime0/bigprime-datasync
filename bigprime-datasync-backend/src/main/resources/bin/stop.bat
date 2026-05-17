@echo off
echo ========================================
echo  BigPrime DataSync Stop Script
echo ========================================

for %%i in ("%~dp0..") do set "BACKEND_HOME=%%~fi"

REM 通过 PID 文件停服

call :kill_by_pid_file "Backend" "%BACKEND_HOME%\logs\backend.pid"
call :kill_by_pid_file "KernelGateway" "%BACKEND_HOME%\logs\kernelgateway.pid"

echo.
echo [DONE] Stop completed
goto :eof

:kill_by_pid_file
set "SVC_NAME=%~1"
set "PID_FILE=%~2"
echo   Stopping %SVC_NAME%...
if exist "%PID_FILE%" (
    set /p SVC_PID= < "%PID_FILE%"
    if defined SVC_PID (
        taskkill /PID %SVC_PID% /F >nul 2>&1
        echo     %SVC_NAME% stopped (PID: %SVC_PID%)
        del /f "%PID_FILE%" >nul 2>&1
    ) else (
        echo     [HINT] PID file is empty
    )
) else (
    echo     [HINT] No PID file: %PID_FILE%
)
goto :eof
