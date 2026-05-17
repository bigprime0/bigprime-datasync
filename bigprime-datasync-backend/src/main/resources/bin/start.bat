@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  BigPrime DataSync Startup
echo ========================================

REM Set application home directory
REM start-backend.bat is in backend\bin\, so:
REM BACKEND_HOME = backend\bin\..     = backend\
REM APP_HOME     = backend\bin\..\..  = bigprime-datasync\
for %%i in ("%~dp0..") do set "BACKEND_HOME=%%~fi"
for %%i in ("%~dp0..\..") do set "APP_HOME=%%~fi"
cd /d "!BACKEND_HOME!"

REM Set environment variables
set "APP_NAME=bigprime-datasync"
set "APP_JAR=bigprime-datasync-backend-1.0.0.jar"

REM JVM parameters
set "JAVA_OPTS=-Xms512m -Xmx2g"
set "JAVA_OPTS=%JAVA_OPTS% -XX:+UseG1GC"
set "JAVA_OPTS=%JAVA_OPTS% -XX:MaxGCPauseMillis=200"
set "JAVA_OPTS=%JAVA_OPTS% -Dfile.encoding=UTF-8"

REM SkyWalking Agent (auto-detect: load if exists, skip if not)
set "SW_AGENT_JAR=!APP_HOME!\plugins\skywalking-agent\skywalking-agent.jar"
if "%SKYWALKING_COLLECTOR%"=="" set "SKYWALKING_COLLECTOR=www.bigprime.cn:11800"
if "%SKYWALKING_SERVICE_NAME%"=="" set "SKYWALKING_SERVICE_NAME=bigprime-datasync-backend"
if exist "!SW_AGENT_JAR!" (
    set "JAVA_OPTS=!JAVA_OPTS! -javaagent:!SW_AGENT_JAR!"
    set "JAVA_OPTS=!JAVA_OPTS! -Dskywalking.agent.service_name=!SKYWALKING_SERVICE_NAME!"
    set "JAVA_OPTS=!JAVA_OPTS! -Dskywalking.collector.backend_service=!SKYWALKING_COLLECTOR!"
    echo   SkyWalking Agent: enabled ^(OAP: !SKYWALKING_COLLECTOR!^)
) else (
    echo   SkyWalking Agent: not found, skipped ^(!APP_HOME!\plugins\skywalking-agent^)
)

REM Set config file path
set "SPRING_OPTS=-Dloader.path=!BACKEND_HOME!\lib\"
set "SPRING_OPTS=!SPRING_OPTS! -Dspring.config.location=optional:classpath:/,file:!BACKEND_HOME!/conf/"
set "SPRING_OPTS=!SPRING_OPTS! -DAPP_HOME=!APP_HOME!"
set "SPRING_OPTS=!SPRING_OPTS! -DBACKEND_HOME=!BACKEND_HOME!"
set "SPRING_OPTS=!SPRING_OPTS! -Dfile.encoding=UTF-8"

REM Check log directory
if not exist "!BACKEND_HOME!\logs" mkdir "!BACKEND_HOME!\logs"

REM Check data directory
if not exist "!BACKEND_HOME!\data" mkdir "!BACKEND_HOME!\data"

echo.
echo [Configuration]
echo   App Home: !APP_HOME!
echo   Backend Home: !BACKEND_HOME!
echo   Config: !BACKEND_HOME!\conf
echo   Logs: !BACKEND_HOME!\logs
echo   Data: !BACKEND_HOME!\data
echo   Static: !BACKEND_HOME!\static
echo.

REM Check JAR file
set "JAR_FULLPATH=!BACKEND_HOME!\lib\%APP_JAR%"
dir /b "!JAR_FULLPATH!" >nul 2>&1
if errorlevel 1 goto jar_not_found
goto jar_found
:jar_not_found
echo [ERROR] JAR not found: !JAR_FULLPATH!
echo [HINT] Run: mvn clean package
pause
exit /b 1
:jar_found

echo [START] Starting BigPrime DataSync...
echo.

REM 创建日志目录
if not exist "!BACKEND_HOME!\logs" mkdir "!BACKEND_HOME!\logs"

REM 后台启动，cmd /c 保证 >> 重定向生效
start /B "BigPrimeBackend" cmd /c "java %JAVA_OPTS% %SPRING_OPTS% -jar ""!JAR_FULLPATH!"" >> ""!BACKEND_HOME!\logs\startup.log"" 2>&1"

REM 等待进程启动后获取 PID 并保存
timeout /t 3 /nobreak >nul
for /f "tokens=2 delims=," %%p in ('wmic process where "CommandLine like '%%bigprime-datasync-backend%%'" get ProcessId /format:csv ^| findstr "[0-9]"') do (
    echo|set /p="%%p">"!BACKEND_HOME!\logs\backend.pid"
    echo [OK] Backend started (PID: %%p)
    goto pid_saved
)
:pid_saved
echo      Log: !BACKEND_HOME!\logs\startup.log
