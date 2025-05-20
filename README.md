# Developer Setup Tool

A tool to help beginning developers set up their development environment with a single click. This project supports both web-based (Docker/Express) and native desktop (Electron) workflows for maximum flexibility and ease of use.

## Features

- One-click installation of essential development tools
- Support for both macOS and Windows
- Option to choose recommended setup or manual selection
- Web download or bundled installer options
- Progress tracking and installation logs
- Runs as a web app (via Docker) or as a native desktop app (via Electron)

## Included Software

- **GitHub Desktop** (Recommended) - GUI for Git version control
- **Cursor** (Recommended) - AI-powered code editor
- **Docker** (Optional) - Container platform for application development
- **Windsurf** (Optional) - Local development environment

## Project Structure

```
/project-root
  /electron        # Electron main process and preload scripts
  /installers      # Bundled installers for offline use (see below)
  /scripts         # Dev scripts for Docker
  /temp            # Temporary downloads (auto-created)
  check-downloads.js
  docker-compose.yml
  Dockerfile
  electron-implementation.md
  index.html
  package.json
  README.md
  renderer.js
  setup.js
  setup.sh / setup.bat
  styles.css
```

## Docker Setup (Web App)

The project includes Docker configuration for easy deployment and testing of the web interface.

### Docker Containers

| Container Name    | Image                        | Description                    | Ports   |
|------------------|------------------------------|--------------------------------|---------|
| vibe-setup-tool  | vibecodingsetup-setup-tool   | Main setup tool web interface  | 7654:80 |

There are also other containers visible in the environment that may be from other projects:
- journal_webserver (nginx:alpine) - Port 8000:80
- journal_app (journalbuddy-app) - Port 9000/tcp
- journal_phpmyadmin (phpmyadmin/phpmyadmin) - Port 8080:80
- journal_mysql (mysql:8.0) - Port 3307:3306

### Docker Configuration Files

- **docker-compose.yml**: Defines the services and container configuration
- **Dockerfile**: Node/Express-based configuration to serve the web interface
- **.dockerignore**: Excludes unnecessary files from the Docker build

### Running the Docker Setup

You can use the convenience scripts in the `scripts` directory:

- **./scripts/start.sh**: Start the Docker container
- **./scripts/stop.sh**: Stop the Docker container
- **./scripts/rebuild.sh**: Rebuild and restart the container (use after making changes)

Or run the Docker commands manually:

```bash
# Start the container
docker-compose up -d

# Stop the container
docker-compose down

# Rebuild from scratch (after making changes)
docker-compose build --no-cache
docker-compose up -d
```

Once running, access the web interface at:
```
http://localhost:7654
```

## Electron Desktop App (Advanced)

For a complete desktop application experience, use Electron. This allows users to:
- Choose a download location on their own machine
- Download and install software with privilege escalation
- Enjoy a native, cross-platform UI

**To run Electron locally:**
1. Install dependencies: `npm install`
2. Start Electron: `npm run electron`

**For full Electron handoff and build instructions, see [`electron-implementation.md`](electron-implementation.md).**

## Using Bundled Installers

If you want to include the installer files with the tool (for offline installation):

1. Place installers in the appropriate directory:
   - macOS: `installers/mac/` (see `installers/mac/README.md` for naming and architecture details)
   - Windows: `installers/windows/` (see `installers/windows/README.md` for naming and version details)

2. The setup scripts and Electron app will automatically detect and use the correct installer.

## Development Workflow

- **Web UI:**
  - Edit `index.html`, `renderer.js`, `setup.js`, and `styles.css` for UI and logic changes.
  - Use Docker for local development/testing of the web interface.
- **Native Scripts:**
  - Edit `setup.bat` for Windows or `setup.sh` for macOS for direct script-based installs.
- **Electron App:**
  - All Electron code is in `/electron`.
  - UI is shared with the web version.
  - See `electron-implementation.md` for details.

## Security Considerations

- The scripts and Electron app require administrator/sudo privileges to install applications
- All downloads use HTTPS from official sources
- Always verify the integrity of downloaded installers
- Consider code signing your Electron application for production

## License

MIT 