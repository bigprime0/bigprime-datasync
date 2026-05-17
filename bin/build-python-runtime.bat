@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===== BigPrime DataSync - 构建便携式 Python 运行时（Windows）=====
echo 此脚本仅需在开发机上执行一次，生成 plugins\python-runtime\ 目录
echo 生成结果随部署包发布，目标机器无需安装 Python
echo.

:: ------------------------------------------------
:: 配置（用 !变量! 规避路径中括号导致的 bat 语法冲突）
:: ------------------------------------------------
set "PYTHON_VERSION=3.11.9"
set "SCRIPT_DIR=%~dp0"
:: 去掉末尾反斜杠
if "!SCRIPT_DIR:~-1!"=="\" set "SCRIPT_DIR=!SCRIPT_DIR:~0,-1!"

:: APP_HOME: 自动判断脚本位置
:: 发布环境：脚本在 bin/ 目录下，APP_HOME 取上级目录
:: 开发环境：脚本在项目根目录下，APP_HOME 就是 SCRIPT_DIR
for %%d in ("!SCRIPT_DIR!") do set "SCRIPT_DIR_NAME=%%~nxd"
if /i "!SCRIPT_DIR_NAME!"=="bin" (
    for %%i in ("!SCRIPT_DIR!\..") do set "APP_HOME=%%~fi"
) else (
    set "APP_HOME=!SCRIPT_DIR!"
)

set "RUNTIME_DIR=!APP_HOME!\plugins\python-runtime"
set "OFFLINE_DIR=!APP_HOME!\offline-packages"
set "PIP_OFFLINE_DIR=!OFFLINE_DIR!\pip-packages"
set "EMBED_ZIP=python-!PYTHON_VERSION!-embed-amd64.zip"
set "GET_PIP_PY=get-pip.py"
set "EMBED_URL=https://www.python.org/ftp/python/!PYTHON_VERSION!/!EMBED_ZIP!"
set "GET_PIP_URL=https://bootstrap.pypa.io/get-pip.py"
set "TEMP_DIR=%TEMP%\bigprime-python-build"

echo [INFO] 脚本目录   = !SCRIPT_DIR!
echo [INFO] 应用根目录  = !APP_HOME!
echo [INFO] 离线包目录  = !OFFLINE_DIR!
echo [INFO] 运行时目录  = !RUNTIME_DIR!
echo.

:: ------------------------------------------------
:: 第一步：检测环境
:: ------------------------------------------------
echo [1/6] 检测构建环境...

where powershell >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 需要 PowerShell 解压 zip 文件
    pause & exit /b 1
)
echo [OK] PowerShell 就绪

:: ------------------------------------------------
:: 第二步：清理旧目录
:: ------------------------------------------------
echo [2/6] 准备输出目录: !RUNTIME_DIR!

if exist "!RUNTIME_DIR!" (
    echo [INFO] 清理旧目录...
    rmdir /s /q "!RUNTIME_DIR!"
)
mkdir "!RUNTIME_DIR!"
if not exist "!OFFLINE_DIR!" mkdir "!OFFLINE_DIR!"
echo [OK] 目录已创建

:: ------------------------------------------------
:: 第三步：获取 Python Embeddable Package（离线优先）
:: ------------------------------------------------
echo [3/6] 获取 Python !PYTHON_VERSION! Embeddable Package...

if exist "!TEMP_DIR!" rmdir /s /q "!TEMP_DIR!"
mkdir "!TEMP_DIR!"

:: 优先使用离线包
if exist "!OFFLINE_DIR!\!EMBED_ZIP!" (
    echo [INFO] 使用离线包: !OFFLINE_DIR!\!EMBED_ZIP!
    copy "!OFFLINE_DIR!\!EMBED_ZIP!" "!TEMP_DIR!\!EMBED_ZIP!" >nul
    echo [OK] 离线包已复制
) else (
    echo [INFO] 离线包不存在，尝试联网下载...
    echo [INFO] 下载地址: !EMBED_URL!
    echo [TIP]  如需离线使用，请提前下载并放到: !OFFLINE_DIR!\!EMBED_ZIP!
    echo.
    where curl >nul 2>&1
    if not errorlevel 1 (
        curl -L --progress-bar -o "!TEMP_DIR!\!EMBED_ZIP!" "!EMBED_URL!"
    ) else (
        powershell -Command "Invoke-WebRequest -Uri '!EMBED_URL!' -OutFile '!TEMP_DIR!\!EMBED_ZIP!'"
    )
    if errorlevel 1 (
        echo [ERROR] 下载失败！
        echo.
        echo 请手动下载以下文件并放到 offline-packages\ 目录后重新执行本脚本：
        echo   文件名: !EMBED_ZIP!
        echo   下载地址: !EMBED_URL!
        pause & exit /b 1
    )
    :: 缓存到离线目录，下次直接用
    copy "!TEMP_DIR!\!EMBED_ZIP!" "!OFFLINE_DIR!\!EMBED_ZIP!" >nul 2>&1
    echo [OK] 已缓存到: !OFFLINE_DIR!\!EMBED_ZIP!
)

echo [INFO] 解压 Embeddable Package...
powershell -Command "Expand-Archive -Path '!TEMP_DIR!\!EMBED_ZIP!' -DestinationPath '!RUNTIME_DIR!' -Force"
if errorlevel 1 (
    echo [ERROR] 解压失败
    pause & exit /b 1
)
echo [OK] Python 解压完成

:: ------------------------------------------------
:: 第四步：启用 pip（Embeddable 默认禁用了 site-packages）
:: ------------------------------------------------
echo [4/6] 启用 site-packages 并安装 pip...

:: 修改 python311._pth，取消注释 import site
for %%f in ("!RUNTIME_DIR!\python*._pth") do (
    powershell -Command "(Get-Content '%%f') -replace '#import site', 'import site' | Set-Content '%%f'"
    echo [OK] 已修改 %%f，启用 site-packages
)

:: 获取 get-pip.py（离线优先）
if exist "!OFFLINE_DIR!\!GET_PIP_PY!" (
    echo [INFO] 使用离线 get-pip.py
    copy "!OFFLINE_DIR!\!GET_PIP_PY!" "!TEMP_DIR!\!GET_PIP_PY!" >nul
) else (
    echo [INFO] 下载 get-pip.py...
    echo [TIP]  如需离线使用，请提前下载并放到: !OFFLINE_DIR!\!GET_PIP_PY!
    where curl >nul 2>&1
    if not errorlevel 1 (
        curl -L -o "!TEMP_DIR!\!GET_PIP_PY!" "!GET_PIP_URL!"
    ) else (
        powershell -Command "Invoke-WebRequest -Uri '!GET_PIP_URL!' -OutFile '!TEMP_DIR!\!GET_PIP_PY!'"
    )
    if errorlevel 1 (
        echo [ERROR] 下载 get-pip.py 失败！
        echo 请手动下载并放到 offline-packages\ 目录：
        echo   文件名: get-pip.py
        echo   下载地址: !GET_PIP_URL!
        pause & exit /b 1
    )
    copy "!TEMP_DIR!\!GET_PIP_PY!" "!OFFLINE_DIR!\!GET_PIP_PY!" >nul 2>&1
)

"!RUNTIME_DIR!\python.exe" "!TEMP_DIR!\!GET_PIP_PY!" --no-warn-script-location
if errorlevel 1 (
    echo [ERROR] pip 安装失败
    pause & exit /b 1
)
echo [OK] pip 安装完成

set "PIP_EXE=!RUNTIME_DIR!\Scripts\pip.exe"

:: ------------------------------------------------
:: 第五步：安装所有依赖（离线包优先，否则联网）
:: ------------------------------------------------
echo [5/6] 安装 Jupyter KernelGateway 及所有依赖...
echo       (安装目标: !RUNTIME_DIR!，与系统完全隔离)
echo.

if exist "!PIP_OFFLINE_DIR!" (
    echo [INFO] 检测到离线 pip 包目录: !PIP_OFFLINE_DIR!
    echo [INFO] 将优先从离线目录安装
    set "PIP_EXTRA=--find-links "!PIP_OFFLINE_DIR!" --no-index"
) else (
    echo [INFO] 未检测到离线 pip 包目录，从清华镜像安装
    echo [INFO] 镜像地址: https://pypi.tuna.tsinghua.edu.cn/simple
    set "PIP_EXTRA=--index-url https://pypi.tuna.tsinghua.edu.cn/simple"
)
echo.

echo   -> jupyter_kernel_gateway 3.0.1
"!PIP_EXE!" install "jupyter_kernel_gateway==3.0.1" !PIP_EXTRA! --no-warn-script-location --quiet
if errorlevel 1 ( echo [WARN] jupyter_kernel_gateway 安装失败 )

echo   -> ipykernel 6.29.5
"!PIP_EXE!" install "ipykernel==6.29.5" !PIP_EXTRA! --no-warn-script-location --quiet

echo   -> ipython
"!PIP_EXE!" install ipython !PIP_EXTRA! --no-warn-script-location --quiet

echo   -> debugpy
"!PIP_EXE!" install debugpy !PIP_EXTRA! --no-warn-script-location --quiet

echo   -> jedi
"!PIP_EXE!" install jedi !PIP_EXTRA! --no-warn-script-location --quiet

echo   -> python-lsp-server[all]
"!PIP_EXE!" install "python-lsp-server[all]" !PIP_EXTRA! --no-warn-script-location --quiet

echo   -> pylsp-mypy
"!PIP_EXE!" install pylsp-mypy !PIP_EXTRA! --no-warn-script-location --quiet

echo   -> python-lsp-black
"!PIP_EXE!" install python-lsp-black !PIP_EXTRA! --no-warn-script-location --quiet

echo   -> numpy pandas matplotlib requests
"!PIP_EXE!" install numpy pandas matplotlib requests !PIP_EXTRA! --no-warn-script-location --quiet

:: 注册 ipykernel
"!RUNTIME_DIR!\python.exe" -m ipykernel install --prefix="!RUNTIME_DIR!"
echo [OK] 所有依赖安装完成

:: ------------------------------------------------
:: 第六步：验证
:: ------------------------------------------------
echo [6/6] 验证关键组件...
echo.

set "BUILD_OK=true"

"!RUNTIME_DIR!\Scripts\jupyter-kernelgateway.exe" --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] jupyter-kernelgateway 不可用
    set "BUILD_OK=false"
) else (
    for /f "tokens=*" %%v in ('"!RUNTIME_DIR!\Scripts\jupyter-kernelgateway.exe" --version 2^>^&1') do echo [OK] jupyter-kernelgateway: %%v
    echo [OK] jupyter-kernelgateway 路径: !RUNTIME_DIR!\Scripts\jupyter-kernelgateway.exe
)

"!RUNTIME_DIR!\python.exe" -c "import ipykernel; print('[OK] ipykernel:', ipykernel.__version__)" 2>nul
if errorlevel 1 ( echo [FAIL] ipykernel 不可用 & set "BUILD_OK=false" )

"!RUNTIME_DIR!\python.exe" -c "import debugpy; print('[OK] debugpy:', debugpy.__version__)" 2>nul
if errorlevel 1 ( echo [WARN] debugpy 不可用 )

"!RUNTIME_DIR!\python.exe" -c "import pylsp; print('[OK] python-lsp-server:', pylsp.__version__)" 2>nul
if errorlevel 1 ( echo [WARN] pylsp 不可用 )

:: 清理临时文件
rmdir /s /q "!TEMP_DIR!" 2>nul

echo.
if "!BUILD_OK!"=="true" (
    echo ===== 构建完成 =====
    echo 输出目录: !RUNTIME_DIR!
    echo.
    echo 下一步：
    echo   1. mvn clean package -P backend -DskipTests
    echo   2. plugins\python-runtime\ copy to target machine
) else (
    echo ===== 构建存在错误，请查看上方 [FAIL] 信息 =====
)
echo.
pause
