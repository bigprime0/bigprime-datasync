#!/bin/bash

echo "========================================"
echo " BigPrime DataSync Startup"
echo "========================================"

# Set application home
# start-backend.sh 位于 backend/bin/，因此：
# BACKEND_HOME = backend/bin/..    = backend/
# APP_HOME     = backend/bin/../.. = bigprime-datasync/
BACKEND_HOME="$(cd "$(dirname "$0")/.." && pwd)"
APP_HOME="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$BACKEND_HOME"

# Set environment variables
APP_NAME="bigprime-datasync"
APP_JAR="bigprime-datasync-backend-1.0.0.jar"

# JVM options
JAVA_OPTS="-Xms512m -Xmx2g"
JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC"
JAVA_OPTS="$JAVA_OPTS -XX:MaxGCPauseMillis=200"
JAVA_OPTS="$JAVA_OPTS -Dfile.encoding=UTF-8"

# SkyWalking Agent（自动检测，存在则加载，不存在则跳过）
SW_AGENT_JAR="${APP_HOME}/plugins/skywalking-agent/skywalking-agent.jar"
SKYWALKING_COLLECTOR="${SKYWALKING_COLLECTOR:-www.bigprime.cn:11800}"
SKYWALKING_SERVICE_NAME="${SKYWALKING_SERVICE_NAME:-bigprime-datasync-backend}"
if [ -f "$SW_AGENT_JAR" ]; then
    JAVA_OPTS="$JAVA_OPTS -javaagent:${SW_AGENT_JAR}"
    JAVA_OPTS="$JAVA_OPTS -Dskywalking.agent.service_name=${SKYWALKING_SERVICE_NAME}"
    JAVA_OPTS="$JAVA_OPTS -Dskywalking.collector.backend_service=${SKYWALKING_COLLECTOR}"
    echo "  SkyWalking Agent: enabled (OAP: ${SKYWALKING_COLLECTOR})"
else
    echo "  SkyWalking Agent: not found, skipped (${APP_HOME}/plugins/skywalking-agent)"
fi

# Spring options（layout=ZIP 瘦包，loader.path 指定外部依赖目录）
SPRING_OPTS="-Dloader.path=${BACKEND_HOME}/lib/"
SPRING_OPTS="$SPRING_OPTS -Dspring.config.location=optional:classpath:/,file:${BACKEND_HOME}/conf/"
SPRING_OPTS="$SPRING_OPTS -DAPP_HOME=${APP_HOME}"
SPRING_OPTS="$SPRING_OPTS -DBACKEND_HOME=${BACKEND_HOME}"

# Create directories
mkdir -p "${BACKEND_HOME}/logs"
mkdir -p "${BACKEND_HOME}/data"

echo ""
echo "[Configuration]"
echo "  App Home:     ${APP_HOME}"
echo "  Backend Home: ${BACKEND_HOME}"
echo "  Config: ${BACKEND_HOME}/conf"
echo "  Logs:   ${BACKEND_HOME}/logs"
echo "  Data:   ${BACKEND_HOME}/data"
echo "  Static: ${BACKEND_HOME}/static"
echo ""

# Check JAR file
if [ ! -f "${BACKEND_HOME}/lib/${APP_JAR}" ]; then
    echo "[ERROR] JAR not found: ${BACKEND_HOME}/lib/${APP_JAR}"
    echo "[HINT] Run: mvn clean package"
    exit 1
fi

echo "[START] Starting BigPrime DataSync..."
echo ""

# 启动应用，后台运行并记录 PID
nohup java $JAVA_OPTS $SPRING_OPTS -jar "${BACKEND_HOME}/lib/${APP_JAR}" >> "${BACKEND_HOME}/logs/startup.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "${BACKEND_HOME}/logs/backend.pid"
echo "[OK] Backend started (PID: $BACKEND_PID)"
echo "     Log: ${BACKEND_HOME}/logs/startup.log"
