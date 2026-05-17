@echo off
echo ========================================
echo  BigPrime DataSync Stop Script
echo ========================================

pushd "%~dp0"
cd ..
set "APP_HOME=%cd%"
popd

echo.
echo [Stopping Services]

REM 停 Worker
call :kill_by_pid_file "Worker" "%APP_HOME%\worker\logs\worker.pid"

REM 停 Backend
call :kill_by_pid_file "Backend" "%APP_HOME%\backend\logs\backend.pid"

REM 停 KernelGateway
call :kill_by_pid_file "KernelGateway" "%APP_HOME%\backend\logs\kernelgateway.pid"

REM 兜底：按命令行模式杀残留的 java.exe 进程
for /f "tokens=2 delims=," %%a in ('wmic process where "Name='java.exe' and (CommandLine like '%%bigprime-datasync-backend%%' or CommandLine like '%%bigprime-action-worker%%')" get ProcessId /format:csv 2^>nul ^| findstr "[0-9]"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo   [CLEANUP] Killing residual java.exe (PID: %%b)
        taskkill /PID %%b /T /F >nul 2>&1
    )
)

echo.
echo [DONE] All services stopped
pause
goto :eof

:kill_by_pid_file
set "SVC_NAME=%~1"
set "PID_FILE=%~2"
echo   Stopping %SVC_NAME%...
if exist "%PID_FILE%" (
    set /p SVC_PID= < "%PID_FILE%"
    if defined SVC_PID (
        taskkill /PID %SVC_PID% /T /F >nul 2>&1
        echo     %SVC_NAME% stopped (PID: %SVC_PID%)
        del /f "%PID_FILE%" >nul 2>&1
    ) else (
        echo     [HINT] PID file is empty
    )
) else (
    echo     [HINT] No PID file: %PID_FILE%
)
goto :eof
