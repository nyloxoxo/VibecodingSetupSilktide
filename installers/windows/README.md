# Windows Installers

Place Windows installer files in this directory to use them with the setup script when in "Use bundled installers" mode.

## Required File Names

The installers should be named as follows:

- `GitHubDesktopSetup.exe` - GitHub Desktop installer
- `CursorSetup.exe` - Cursor editor installer
- `DockerDesktopInstaller.exe` - Docker Desktop installer
- `WindsurfSetup.exe` - Windsurf installer

## Windows Version Specific Installers

If you need to provide different installers for different Windows versions:

1. Create subdirectories:
   - `win10/` - For Windows 10 installers
   - `win11/` - For Windows 11 installers

2. Place the appropriate installers in each directory with the same names as above.

The setup script will automatically detect the Windows version and use the correct installer. 