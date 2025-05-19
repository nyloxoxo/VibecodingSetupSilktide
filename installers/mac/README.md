# macOS Installers

Place macOS installer files in this directory to use them with the setup script when in "Use bundled installers" mode.

## Required File Names

The installers should be named as follows:

- `GitHub Desktop.dmg` - GitHub Desktop installer
- `Cursor.dmg` - Cursor editor installer
- `Docker.dmg` - Docker Desktop installer
- `Windsurf.dmg` - Windsurf installer

## Architecture Specific Installers

If you need to provide different installers for Intel and Apple Silicon Macs:

1. Create subdirectories:
   - `intel/` - For Intel Mac installers
   - `silicon/` - For Apple Silicon Mac installers

2. Place the appropriate installers in each directory with the same names as above.

The setup script will automatically detect the Mac's architecture and use the correct installer. 