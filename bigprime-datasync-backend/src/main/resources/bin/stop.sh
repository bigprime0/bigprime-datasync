#!/bin/bash

echo "========================================"
echo " BigPrime DataSync Stop Script"
echo "========================================"

BACKEND_HOME="$(cd "$(dirname "$0")/.." && pwd)"

# 通过 PID 文件停服（不依赖 ps/pgrep）
kill_by_pid_file() {
    local name="$1"
    local pid_file="$2"
    echo "  Stopping ${name}..."
    if [ -f "$pid_file" ]; then
        local pid
        pid=$(cat "$pid_file" 2>/dev/null)
        if [ -n "$pid" ]; then
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null
                echo "  [DONE] ${name} stopped (PID: $pid)"
            else
                echo "  [HINT] ${name} not running (PID: $pid, already dead)"
            fi
            rm -f "$pid_file"
        else
            echo "  [HINT] PID file is empty"
        fi
    else
        echo "  [HINT] No PID file found: $pid_file"
    fi
}

kill_by_pid_file "Backend" "${BACKEND_HOME}/logs/backend.pid"
kill_by_pid_file "KernelGateway" "${BACKEND_HOME}/logs/kernelgateway.pid"
