@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===== BigPrime DataSync - Python Embedded 运行时安装验证 =====
echo.

:: ------------------------------------------------
:: 定位 APP 根目录（脚本位于 bin/ 下，APP_HOME = 上一层）
:: ------------------------------------------------
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
for %%i in ("%SCRIPT_DIR%") do set "APP_HOME=%%~dpi"
set "APP_HOME=%APP_HOME:~0,-1%"

:: 允许通过环境变量覆盖 APP_HOME
if defined APP_HOME_OVERRIDE set "APP_HOME=%APP_HOME_OVERRIDE%"

set "RUNTIME_DIR=%APP_HOME%\plugins\python-runtime"
set "PYTHON_EXE=%RUNTIME_DIR%\python.exe"
set "PIP_EXE=%RUNTIME_DIR%\Scripts\pip.exe"
set "KERNEL_GW_EXE=%RUNTIME_DIR%\Scripts\jupyter-kernelgateway.exe"

echo [INFO] APP_HOME    = %APP_HOME%
echo [INFO] Runtime 目录 = %RUNTIME_DIR%
echo.

:: ------------------------------------------------
:: 第一步：检测 embedded Python 是否存在
:: ------------------------------------------------
echo [1/4] 检测嵌入式 Python 运行时...

if not exist "%PYTHON_EXE%" (
    echo [ERROR] 未找到嵌入式 Python: %PYTHON_EXE%
    echo.
    echo         请在项目根目录执行以下命令构建嵌入式 Python 运行时：
    echo           build-python-runtime.bat
    echo.
    echo         构建完成后，re-package 或将 plugins\python-runtime\ 复制到部署目录
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('"%PYTHON_EXE%" --version 2^>^&1') do set PYTHON_VER=%%v
echo [OK] 嵌入式 Python: %PYTHON_VER%

:: ------------------------------------------------
:: 第二步：检测 pip 是否可用
:: ------------------------------------------------
echo [2/4] 检测嵌入式 pip...

if not exist "%PIP_EXE%" (
    echo [WARN] 未找到 %PIP_EXE%，尝试修复 site-packages...
    :: Windows Embeddable Python 需要取消注释 python3xx._pth 中的 import site
    for %%f in ("%RUNTIME_DIR%\python3*._pth") do (
        powershell -Command "(Get-Content '%%f') -replace '#import site','import site' | Set-Content '%%f'"
        echo [INFO] 已修复 %%f 的 site-packages 配置
    )
    :: 下载并安装 pip
    if not exist "%RUNTIME_DIR%\get-pip.py" (
        echo [INFO] 下载 get-pip.py...
        powershell -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile '%RUNTIME_DIR%\get-pip.py'" 2>nul
        if errorlevel 1 (
            curl -sS https://bootstrap.pypa.io/get-pip.py -o "%RUNTIME_DIR%\get-pip.py"
        )
    )
    echo [INFO] 安装 pip...
    "%PYTHON_EXE%" "%RUNTIME_DIR%\get-pip.py" --quiet
)

if not exist "%PIP_EXE%" (
    echo [ERROR] pip 安装失败，请检查网络连接后重试
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('"%PIP_EXE%" --version 2^>^&1') do set PIP_VER=%%v
echo [OK] 嵌入式 pip: %PIP_VER%

:: ------------------------------------------------
:: 第三步：检查关键依赖是否已安装，未安装则补充
:: ------------------------------------------------
echo [3/4] 检查并补充缺失的关键依赖...
echo       (所有包均安装到嵌入式 Python 中，与系统完全隔离)
echo.

:: 检查 jupyter_kernel_gateway
"%PIP_EXE%" show jupyter_kernel_gateway >nul 2>&1
if errorlevel 1 (
    echo   -> 安装 jupyter_kernel_gateway 2.5.2...
    "%PIP_EXE%" install "jupyter_kernel_gateway==2.5.2" --quiet
    if errorlevel 1 ( echo   [WARN] jupyter_kernel_gateway 安装失败 )
) else ( echo   [OK] jupyter_kernel_gateway 已安装 )

:: 检查 ipykernel
"%PIP_EXE%" show ipykernel >nul 2>&1
if errorlevel 1 (
    echo   -> 安装 ipykernel 6.29.5...
    "%PIP_EXE%" install "ipykernel==6.29.5" --quiet
) else ( echo   [OK] ipykernel 已安装 )

:: 检查 debugpy
"%PIP_EXE%" show debugpy >nul 2>&1
if errorlevel 1 (
    echo   -> 安装 debugpy...
    "%PIP_EXE%" install debugpy --quiet
) else ( echo   [OK] debugpy 已安装 )

:: 检查 jedi
"%PIP_EXE%" show jedi >nul 2>&1
if errorlevel 1 (
    echo   -> 安装 jedi...
    "%PIP_EXE%" install jedi --quiet
) else ( echo   [OK] jedi 已安装 )

:: 检查 python-lsp-server
"%PIP_EXE%" show python-lsp-server >nul 2>&1
if errorlevel 1 (
    echo   -> 安装 python-lsp-server[all]...
    "%PIP_EXE%" install "python-lsp-server[all]" --quiet
    if errorlevel 1 ( echo   [WARN] python-lsp-server 安装失败，代码提示功能将不可用 )
) else ( echo   [OK] python-lsp-server 已安装 )

:: 注册 ipykernel（prefix 固定在 runtime）
echo   -> 注册 IPython Kernel...
"%PYTHON_EXE%" -m ipykernel install --prefix="%RUNTIME_DIR%" --quiet 2>nul || echo   [WARN] Kernel 注册失败（不影响基础运行）

:: ------------------------------------------------
:: 第四步：验证关键组件
:: ------------------------------------------------
echo.
echo [4/4] 验证关键组件...
echo.

set VERIFY_OK=true

if exist "%KERNEL_GW_EXE%" (
    for /f "tokens=*" %%v in ('"%KERNEL_GW_EXE%" --version 2^>^&1') do echo [OK] jupyter-kernelgateway: %%v
) else (
    echo [FAIL] jupyter-kernelgateway 不可用: %KERNEL_GW_EXE%
    set VERIFY_OK=false
)

"%PYTHON_EXE%" -c "import ipykernel; print('[OK] ipykernel:', ipykernel.__version__)" 2>nul || (
    echo [FAIL] ipykernel 不可用
    set VERIFY_OK=false
)

"%PYTHON_EXE%" -c "import debugpy; print('[OK] debugpy:', debugpy.__version__)" 2>nul || (
    echo [WARN] debugpy 不可用
)

"%PYTHON_EXE%" -c "import pylsp; print('[OK] python-lsp-server:', pylsp.__version__)" 2>nul || (
    echo [WARN] pylsp 不可用（代码提示降级）
)

echo.
if "%VERIFY_OK%"=="true" (
    echo ===== 嵌入式 Python 运行时验证完成 =====
    echo Python 路径: %PYTHON_EXE%
    echo 请启动或重新启动 BigPrime DataSync 服务
) else (
    echo ===== 验证存在错误，请查看上方 [FAIL] 信息，并重新执行 build-python-runtime.bat =====
)
echo.
pause
