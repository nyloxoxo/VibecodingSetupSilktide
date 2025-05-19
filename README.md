# Developer Setup Tool

A tool to help beginning developers set up their development environment with a single click.

## Features

- One-click installation of essential development tools
- Support for both macOS and Windows
- Option to choose recommended setup or manual selection
- Web download or bundled installer options
- Progress tracking and installation logs

## Included Software

- **GitHub Desktop** (Recommended) - GUI for Git version control
- **Cursor** (Recommended) - AI-powered code editor
- **Docker** (Optional) - Container platform for application development
- **Windsurf** (Optional) - Local development environment

## Implementation Options

This repository includes three different implementation options for the Developer Setup Tool:

### 1. Web Interface (setup.html)

A simple browser-based UI that demonstrates the concept and simulates installations.

To use:
1. Open `setup.html` in your web browser
2. Select your options and click "Start Setup"

Note: This is a simulation only and won't actually install software.

### 2. Native Scripts

Platform-specific scripts for direct installation:

- **Windows**: `setup.bat` - Batch script for Windows systems
- **macOS**: `setup.sh` - Bash script for macOS systems

To use:
- Windows: Right-click `setup.bat` and select "Run as administrator"
- macOS: Open Terminal and run `sudo ./setup.sh`

These scripts can download installers from the web or use bundled installers placed in the `installers` directory.

### 3. Electron Application (Advanced)

For a complete desktop application experience, follow the instructions in `electron-implementation.md` to build a full Electron app.

## Using Bundled Installers

If you want to include the installer files with the tool (for offline installation):

1. Place installers in the appropriate directory:
   - macOS: `installers/mac/`
   - Windows: `installers/windows/`

2. See the README.md in each installer directory for specific naming conventions.

## Development

To modify this tool:

1. Web Interface:
   - Edit `setup.html` to change the UI
   - Edit `setup.js` to modify the installation logic

2. Native Scripts:
   - Edit `setup.bat` for Windows changes
   - Edit `setup.sh` for macOS changes

3. Electron App:
   - Follow instructions in `electron-implementation.md`

## Security Considerations

- The scripts require administrator/sudo privileges to install applications
- All downloads use HTTPS from official sources
- Always verify the integrity of downloaded installers

## License

MIT 