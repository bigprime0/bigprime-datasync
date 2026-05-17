@echo off
echo ========================================
echo  BigPrime Action Worker Stop Script
echo ========================================

pushd "%~dp0"
cd ..
set "APP_HOME=%cd%"
popd

REM 通过 PID 文件停服（/T 杀进程树）
set "PID_FILE=%APP_HOME%\logs\worker.pid"
echo   Stopping Worker...
if exist "%PID_FILE%" (
    set /p WORKER_PID= < "%PID_FILE%"
    if defined WORKER_PID (
        taskkill /PID %WORKER_PID% /T /F >nul 2>&1
        echo     Worker stopped (PID: %WORKER_PID%)
        del /f "%PID_FILE%" >nul 2>&1
    ) else (
        echo     [HINT] PID file is empty
    )
) else (
    echo     [HINT] No PID file: %PID_FILE%
)

REM 兜底：按命令行模式杀残留的 java.exe 进程
for /f "tokens=2 delims=," %%a in ('wmic process where "Name='java.exe' and CommandLine like '%%bigprime-action-worker%%'" get ProcessId /format:csv 2^>nul ^| findstr "[0-9]"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo   [CLEANUP] Killing residual Worker java.exe (PID: %%b)
        taskkill /PID %%b /T /F >nul 2>&1
    )
)

echo.
echo [DONE] Worker stopped
