@echo off
echo ========================================
echo  BigPrime DataSync Stop Script
echo ========================================

for %%i in ("%~dp0..") do set "BACKEND_HOME=%%~fi"

REM 通过 PID 文件停服（/T 杀进程树，确保 java.exe 子进程也被终止）

call :kill_by_pid_file "Backend" "%BACKEND_HOME%\logs\backend.pid"
call :kill_by_pid_file "KernelGateway" "%BACKEND_HOME%\logs\kernelgateway.pid"

REM 兜底：按命令行模式杀残留的 java.exe 进程
for /f "tokens=2 delims=," %%a in ('wmic process where "Name='java.exe' and CommandLine like '%%bigprime-datasync-backend%%'" get ProcessId /format:csv 2^>nul ^| findstr "[0-9]"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo   [CLEANUP] Killing residual Backend java.exe (PID: %%b)
        taskkill /PID %%b /T /F >nul 2>&1
    )
)

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
