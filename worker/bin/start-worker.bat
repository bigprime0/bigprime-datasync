@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  BigPrime Action Worker Startup
echo ========================================

REM Set application home
pushd "%~dp0"
cd ..
set "APP_HOME=%cd%"
popd
cd /d "%APP_HOME%"

REM Worker ID (from argument or environment)
if "%~1"=="" (
    if "%WORKER_ID%"=="" (
        set "WORKER_ID=worker-1"
    )
) else (
    set "WORKER_ID=%~1"
)

REM Set environment variables
set "APP_NAME=bigprime-action-worker"
set "APP_JAR=bigprime-action-worker-1.0.0.jar"

REM JVM options
set "JAVA_OPTS=-Xms256m -Xmx1g"
set "JAVA_OPTS=%JAVA_OPTS% -XX:+UseG1GC"
set "JAVA_OPTS=%JAVA_OPTS% -XX:MaxGCPauseMillis=200"
set "JAVA_OPTS=%JAVA_OPTS% -Dfile.encoding=UTF-8"

REM SkyWalking Agent (auto-detect: load if exists, skip if not)
REM worker dir and plugins are siblings: APP_HOME\..\plugins\skywalking-agent
for %%i in ("%APP_HOME%\..") do set "BIGPRIME_HOME=%%~fi\"
set "SW_AGENT_JAR=!BIGPRIME_HOME!plugins\skywalking-agent\skywalking-agent.jar"
if "%SKYWALKING_COLLECTOR%"=="" set "SKYWALKING_COLLECTOR=www.bigprime.cn:11800"
if "%SKYWALKING_SERVICE_NAME%"=="" set "SKYWALKING_SERVICE_NAME=bigprime-datasync-worker"
if exist "!SW_AGENT_JAR!" (
    set "JAVA_OPTS=!JAVA_OPTS! -javaagent:!SW_AGENT_JAR!"
    set "JAVA_OPTS=!JAVA_OPTS! -Dskywalking.agent.service_name=!SKYWALKING_SERVICE_NAME!"
    set "JAVA_OPTS=!JAVA_OPTS! -Dskywalking.agent.instance_name=!WORKER_ID!"
    set "JAVA_OPTS=!JAVA_OPTS! -Dskywalking.collector.backend_service=!SKYWALKING_COLLECTOR!"
    echo   SkyWalking Agent: enabled ^(OAP: !SKYWALKING_COLLECTOR!^)
) else (
    echo   SkyWalking Agent: not found, skipped ^(!BIGPRIME_HOME!plugins\skywalking-agent^)
)

REM Config file path
set "SPRING_OPTS=-Dloader.path=%APP_HOME%\lib\"
set "SPRING_OPTS=%SPRING_OPTS% -Dspring.config.location=optional:classpath:/,file:%APP_HOME%/conf/"
set "SPRING_OPTS=%SPRING_OPTS% -DAPP_HOME=%APP_HOME%"
set "SPRING_OPTS=%SPRING_OPTS% -DWORKER_ID=%WORKER_ID%"
set "SPRING_OPTS=%SPRING_OPTS% -Dfile.encoding=UTF-8"

REM Create directories
if not exist "%APP_HOME%\logs" mkdir "%APP_HOME%\logs"
if not exist "%APP_HOME%\data" mkdir "%APP_HOME%\data"

echo.
echo [Configuration]
echo   Worker ID: %WORKER_ID%
echo   App Home: %APP_HOME%
echo   Config: %APP_HOME%\conf
echo   Logs: %APP_HOME%\logs
echo   Data: %APP_HOME%\data
echo.

REM Check JAR file
set "JAR_FULLPATH=%APP_HOME%\lib\%APP_JAR%"
dir /b "%JAR_FULLPATH%" >nul 2>&1
if errorlevel 1 goto jar_not_found
goto jar_found
:jar_not_found
echo [ERROR] JAR not found: %JAR_FULLPATH%
echo [HINT] Run: mvn clean package
pause
exit /b 1
:jar_found

echo [START] Starting BigPrime Action Worker...
echo.

REM 后台启动，cmd /c 保证 >> 重定向生效
start /B "BigPrimeWorker" cmd /c "java %JAVA_OPTS% %SPRING_OPTS% -jar ""%JAR_FULLPATH%"" >> ""%APP_HOME%\logs\startup.log"" 2>&1"

REM 等待进程启动后获取 java.exe 的 PID（非 cmd.exe 包装进程）
REM 双层 for /f 嵌套：内层 for /f "tokens=1" 按默认分隔符分割，自动清除 wmic CSV 输出尾随的 \r
timeout /t 5 /nobreak >nul
set "WORKER_PID="
for /f "tokens=2 delims=," %%a in ('wmic process where "Name='java.exe' and CommandLine like '%%bigprime-action-worker%%'" get ProcessId /format:csv 2^>nul ^| findstr "[0-9]"') do (
    if not defined WORKER_PID (
        for /f "tokens=1" %%b in ("%%a") do (
            set "WORKER_PID=%%b"
            echo|set /p="%%b">"%APP_HOME%\logs\worker.pid"
            echo [OK] Worker started (ID: %WORKER_ID%, PID: %%b)
        )
    )
)
if not defined WORKER_PID echo [WARN] Failed to detect Worker PID
echo      Log: %APP_HOME%\logs\startup.log
