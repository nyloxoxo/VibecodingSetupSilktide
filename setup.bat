@echo off
setlocal enabledelayedexpansion

echo Developer Setup Tool
echo -------------------
echo.

REM Check for admin privileges
NET SESSION >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo This script requires administrator privileges.
    echo Please run as administrator.
    pause
    exit /b 1
)

REM Detect Windows version
ver | findstr /i "10\.0\." > nul
if %ERRORLEVEL% equ 0 (
    set "WIN_VERSION=win_10"
) else (
    ver | findstr /i "6\.1\." > nul
    if %ERRORLEVEL% equ 0 (
        set "WIN_VERSION=win_7"
    ) else (
        ver | findstr /i "6\.2\." > nul
        if %ERRORLEVEL% equ 0 (
            set "WIN_VERSION=win_8"
        ) else (
            ver | findstr /i "6\.3\." > nul
            if %ERRORLEVEL% equ 0 (
                set "WIN_VERSION=win_8_1"
            ) else (
                set "WIN_VERSION=win_11"
            )
        )
    )
)

REM Setup variables
set "DOWNLOAD_DIR=%TEMP%\dev_setup_downloads"
set "GITHUB_URL=https://central.github.com/deployments/desktop/desktop/latest/win32"
set "CURSOR_URL=https://download.cursor.sh/windows/setup"
set "DOCKER_URL=https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe"
set "WINDSURF_URL=https://github.com/windsurfapp/windsurf/releases/latest/download/Windsurf-Windows.exe"

REM Create download directory
if not exist "%DOWNLOAD_DIR%" mkdir "%DOWNLOAD_DIR%"

:menu
cls
echo Developer Setup Tool
echo -------------------
echo.
echo Windows version detected: %WIN_VERSION%
echo.
echo Select installation mode:
echo 1. Recommended Setup (GitHub Desktop + Cursor)
echo 2. Manual Selection
echo 3. Exit
echo.
set /p INSTALL_MODE="Enter your choice (1-3): "

if "%INSTALL_MODE%"=="1" (
    set "INSTALL_GITHUB=1"
    set "INSTALL_CURSOR=1"
    set "INSTALL_DOCKER=0"
    set "INSTALL_WINDSURF=0"
    goto :start_installation
) else if "%INSTALL_MODE%"=="2" (
    goto :manual_selection
) else if "%INSTALL_MODE%"=="3" (
    exit /b 0
) else (
    echo Invalid choice. Please try again.
    pause
    goto :menu
)

:manual_selection
cls
echo Developer Setup Tool - Manual Selection
echo -------------------------------------
echo.
echo Select software to install (Y/N):
echo.
set /p INSTALL_GITHUB="GitHub Desktop (Recommended): "
set /p INSTALL_CURSOR="Cursor (Recommended): "
set /p INSTALL_DOCKER="Docker (Optional): "
set /p INSTALL_WINDSURF="Windsurf (Optional): "

echo.
echo You selected:
if /i "%INSTALL_GITHUB%"=="Y" echo - GitHub Desktop
if /i "%INSTALL_CURSOR%"=="Y" echo - Cursor
if /i "%INSTALL_DOCKER%"=="Y" echo - Docker
if /i "%INSTALL_WINDSURF%"=="Y" echo - Windsurf
echo.

set /p CONFIRM="Proceed with installation? (Y/N): "
if /i not "%CONFIRM%"=="Y" goto :menu

REM Convert Y/N to 1/0
if /i "%INSTALL_GITHUB%"=="Y" (set "INSTALL_GITHUB=1") else (set "INSTALL_GITHUB=0")
if /i "%INSTALL_CURSOR%"=="Y" (set "INSTALL_CURSOR=1") else (set "INSTALL_CURSOR=0")
if /i "%INSTALL_DOCKER%"=="Y" (set "INSTALL_DOCKER=1") else (set "INSTALL_DOCKER=0")
if /i "%INSTALL_WINDSURF%"=="Y" (set "INSTALL_WINDSURF=1") else (set "INSTALL_WINDSURF=0")

:start_installation
cls
echo Developer Setup Tool - Installation
echo -------------------------------
echo.
echo Installation in progress. This may take a while...
echo.

set "TOTAL_COUNT=0"
set "CURRENT_COUNT=0"

if "%INSTALL_GITHUB%"=="1" set /a "TOTAL_COUNT+=1"
if "%INSTALL_CURSOR%"=="1" set /a "TOTAL_COUNT+=1"
if "%INSTALL_DOCKER%"=="1" set /a "TOTAL_COUNT+=1"
if "%INSTALL_WINDSURF%"=="1" set /a "TOTAL_COUNT+=1"

if "%INSTALL_GITHUB%"=="1" (
    set /a "CURRENT_COUNT+=1"
    call :install_software "GitHub Desktop" "!GITHUB_URL!" "GitHubDesktopSetup.exe"
)

if "%INSTALL_CURSOR%"=="1" (
    set /a "CURRENT_COUNT+=1"
    call :install_software "Cursor" "!CURSOR_URL!" "CursorSetup.exe"
)

if "%INSTALL_DOCKER%"=="1" (
    set /a "CURRENT_COUNT+=1"
    call :install_software "Docker" "!DOCKER_URL!" "DockerDesktopInstaller.exe"
)

if "%INSTALL_WINDSURF%"=="1" (
    set /a "CURRENT_COUNT+=1"
    call :install_software "Windsurf" "!WINDSURF_URL!" "WindsurfSetup.exe"
)

echo.
echo All installations completed successfully!
echo.
echo Your development environment is ready.
echo You can now start coding!
echo.
pause
exit /b 0

:install_software
setlocal
set "NAME=%~1"
set "URL=%~2"
set "FILENAME=%~3"
set "FILEPATH=%DOWNLOAD_DIR%\%FILENAME%"

echo [%CURRENT_COUNT%/%TOTAL_COUNT%] Installing %NAME%...

REM Check if installer is bundled
if exist "installers\windows\%FILENAME%" (
    echo Using bundled installer...
    set "FILEPATH=installers\windows\%FILENAME%"
) else (
    echo Downloading %NAME%...
    powershell -Command "& {Invoke-WebRequest -Uri '%URL%' -OutFile '%FILEPATH%' -UseBasicParsing}"
    if %ERRORLEVEL% neq 0 (
        echo Failed to download %NAME%. Error: %ERRORLEVEL%
        goto :eof
    )
    echo Download completed.
)

echo Installing %NAME%...
start /wait "" "%FILEPATH%"
echo %NAME% installed successfully.
echo.

endlocal
goto :eof 