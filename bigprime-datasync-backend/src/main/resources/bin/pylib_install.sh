#!/bin/bash
# BigPrime DataSync - Python Embedded 运行时安装验证脚本（Linux）
# 首次部署时执行，验证嵌入式 Python 运行时是否就绪并补充缺失依赖

set -e

echo "===== BigPrime DataSync - Python Embedded 运行时安装验证 ====="
echo ""

# ------------------------------------------------
# 定位 APP 根目录（脚本位于 bin/ 下，APP_HOME = 上一层）
# ------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_HOME="$(dirname "$SCRIPT_DIR")"

# 允许通过环境变量覆盖 APP_HOME
if [ -n "$APP_HOME_OVERRIDE" ]; then
    APP_HOME="$APP_HOME_OVERRIDE"
fi

RUNTIME_DIR="${APP_HOME}/plugins/python-runtime"
PYTHON_EXE="${RUNTIME_DIR}/bin/python3"
PIP_EXE="${RUNTIME_DIR}/bin/pip3"
KERNEL_GW_EXE="${RUNTIME_DIR}/bin/jupyter-kernelgateway"

echo "[INFO] APP_HOME    = $APP_HOME"
echo "[INFO] Runtime 目录 = $RUNTIME_DIR"
echo ""

# ------------------------------------------------
# 第一步：检测嵌入式 Python 是否存在
# ------------------------------------------------
echo "[1/4] 检测嵌入式 Python 运行时..."

if [ ! -f "$PYTHON_EXE" ]; then
    # 尝试兼容路径（python 而非 python3）
    if [ -f "${RUNTIME_DIR}/bin/python" ]; then
        PYTHON_EXE="${RUNTIME_DIR}/bin/python"
    else
        echo "[ERROR] 未找到嵌入式 Python: $PYTHON_EXE"
        echo ""
        echo "        请在构建机上执行以下命令构建嵌入式 Python 运行时："
        echo "          bash build-python-runtime.sh"
        echo ""
        echo "        构建完成后，将 plugins/python-runtime/ 目录随部署包发布"
        echo "        或重新执行 mvn clean package 打入部署包"
        exit 1
    fi
fi

PYTHON_VER=$("$PYTHON_EXE" --version 2>&1)
echo "[OK] 嵌入式 Python: $PYTHON_VER"

# ------------------------------------------------
# 第二步：检测 pip 是否可用
# ------------------------------------------------
echo "[2/4] 检测嵌入式 pip..."

if [ ! -f "$PIP_EXE" ]; then
    if [ -f "${RUNTIME_DIR}/bin/pip" ]; then
        PIP_EXE="${RUNTIME_DIR}/bin/pip"
    else
        echo "[WARN] 未找到嵌入式 pip，尝试用 ensurepip 安装..."
        "$PYTHON_EXE" -m ensurepip --upgrade 2>/dev/null || {
            echo "[ERROR] pip 安装失败，嵌入式 Python 可能不完整，请重新执行 build-python-runtime.sh"
            exit 1
        }
        # ensurepip 后再检查
        if [ -f "${RUNTIME_DIR}/bin/pip3" ]; then
            PIP_EXE="${RUNTIME_DIR}/bin/pip3"
        elif [ -f "${RUNTIME_DIR}/bin/pip" ]; then
            PIP_EXE="${RUNTIME_DIR}/bin/pip"
        fi
    fi
fi

if [ ! -f "$PIP_EXE" ]; then
    echo "[ERROR] pip 不可用，请重新执行 build-python-runtime.sh"
    exit 1
fi

PIP_VER=$("$PIP_EXE" --version 2>&1)
echo "[OK] 嵌入式 pip: $PIP_VER"

# 确认 pip 安装目标是嵌入式 Python（防止误用系统 pip）
PIP_TARGET=$("$PIP_EXE" --version 2>&1 | grep -o "from [^ ]*" | head -1)
echo "[INFO] pip 安装位置: $PIP_TARGET"
if ! echo "$PIP_TARGET" | grep -q "python-runtime"; then
    echo "[WARN] pip 可能指向非嵌入式位置，请确认 $PIP_EXE 路径正确"
fi

# ------------------------------------------------
# 第三步：检查关键依赖是否已安装，未安装则补充
# ------------------------------------------------
echo "[3/4] 检查并补充缺失的关键依赖..."
echo "      (所有包均安装到嵌入式 Python 中，与系统完全隔离)"
echo ""

# 使用绝对路径 pip，确保 --target 指向正确位置
# standalone Python 的 pip 天然安装到自身 site-packages，无需 --target

check_and_install() {
    local pkg="$1"
    local install_name="${2:-$1}"
    if "$PIP_EXE" show "$pkg" > /dev/null 2>&1; then
        local ver
        ver=$("$PIP_EXE" show "$pkg" 2>/dev/null | grep "^Version:" | awk '{print $2}')
        echo "  [OK] $pkg: $ver"
    else
        echo "  -> 安装 $install_name ..."
        "$PIP_EXE" install "$install_name" --quiet || echo "  [WARN] $install_name 安装失败"
    fi
}

check_and_install "jupyter_kernel_gateway" "jupyter_kernel_gateway==2.5.2"
check_and_install "ipykernel" "ipykernel==6.29.5"
check_and_install "ipython" "ipython"
check_and_install "debugpy" "debugpy"
check_and_install "jedi" "jedi"
check_and_install "python-lsp-server" "python-lsp-server[all]"

# 注册 ipykernel（prefix 固定在 runtime）
echo "  -> 注册 IPython Kernel..."
"$PYTHON_EXE" -m ipykernel install --prefix="${RUNTIME_DIR}" --quiet 2>/dev/null || \
    echo "  [WARN] Kernel 注册失败（不影响基础运行）"

# 确保可执行文件有执行权限
chmod +x "${RUNTIME_DIR}/bin/jupyter-kernelgateway" 2>/dev/null || true
chmod +x "${RUNTIME_DIR}/bin/pylsp" 2>/dev/null || true

# ------------------------------------------------
# 第四步：验证关键组件
# ------------------------------------------------
echo ""
echo "[4/4] 验证关键组件..."
echo ""

VERIFY_OK=true

if [ -f "$KERNEL_GW_EXE" ] && "$KERNEL_GW_EXE" --version &>/dev/null; then
    GW_VER=$("$KERNEL_GW_EXE" --version 2>&1)
    echo "[OK] jupyter-kernelgateway: $GW_VER"
else
    echo "[FAIL] jupyter-kernelgateway 不可用: $KERNEL_GW_EXE"
    VERIFY_OK=false
fi

"$PYTHON_EXE" -c "import ipykernel; print('[OK] ipykernel:', ipykernel.__version__)" 2>/dev/null || \
    { echo "[FAIL] ipykernel 不可用"; VERIFY_OK=false; }

"$PYTHON_EXE" -c "import debugpy; print('[OK] debugpy:', debugpy.__version__)" 2>/dev/null || \
    echo "[WARN] debugpy 不可用"

"$PYTHON_EXE" -c "import pylsp; print('[OK] python-lsp-server:', pylsp.__version__)" 2>/dev/null || \
    echo "[WARN] pylsp 不可用（代码提示降级）"

echo ""
if [ "$VERIFY_OK" = true ]; then
    echo "===== 嵌入式 Python 运行时验证完成 ====="
    echo "Python 路径: $PYTHON_EXE"
    echo "请启动或重新启动 BigPrime DataSync 服务"
else
    echo "===== 验证存在错误，请查看上方 [FAIL] 信息 ====="
    echo "建议在构建机上重新执行 build-python-runtime.sh 重建运行时"
    exit 1
fi
echo ""
