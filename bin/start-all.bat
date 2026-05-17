@echo off
echo ========================================
echo  BigPrime DataSync Startup Script
echo ========================================

pushd "%~dp0"
cd ..
set "APP_HOME=%cd%"
popd
cd /d "%APP_HOME%"

echo.
echo [Startup Order]
echo   1. Backend (required)
echo   2. Worker (default: 1, set WORKER_COUNT to change)
echo.

REM Start Backend
echo [1/2] Starting Backend...
start /B "BigPrimeBackend" cmd /c "%APP_HOME%\backend\bin\start-backend.bat"
echo   Backend starting (log: %APP_HOME%\backend\logs\startup.log)

REM 轮询等待 Backend HTTP 就绪（最多 60 秒）
if "%BACKEND_PORT%"=="" set "BACKEND_PORT=6506"
echo   Waiting for Backend to be ready (max 60s)...
set /a WAIT_COUNT=0
:wait_loop
set /a WAIT_COUNT+=1
if %WAIT_COUNT% gtr 60 (
    echo   [WARN] Backend not ready after 60s, starting Worker anyway
    goto start_worker
)
powershell -Command "try { $r=(Invoke-WebRequest -Uri 'http://localhost:%BACKEND_PORT%/actuator/health' -TimeoutSec 1 -UseBasicParsing).StatusCode; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
    echo   Backend is ready (%WAIT_COUNT%s)
    goto start_worker
)
timeout /t 1 /nobreak >nul
goto wait_loop

:start_worker
if "%WORKER_COUNT%"=="" set WORKER_COUNT=1
echo.
echo [2/2] Starting Worker (count: %WORKER_COUNT%)...

for /L %%i in (1,1,%WORKER_COUNT%) do (
    set "WORKER_ID=worker-%%i"
    echo   Starting worker-%%i...
    start /B "BigPrimeWorker-%%i" cmd /c "%APP_HOME%\worker\bin\start-worker.bat worker-%%i"
)

echo.
echo [DONE] All services started
echo   Backend: http://localhost:6506
echo   Workers: %WORKER_COUNT%
echo.
pause
