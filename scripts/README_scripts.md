# Docker Management Scripts

This directory contains scripts to manage the Docker containers for the Developer Setup Tool.

## Available Scripts

### start.sh

Starts the Docker container and makes the web interface accessible.

```bash
./start.sh
```

After running, the web interface will be available at http://localhost:7654.

### stop.sh

Stops the Docker container and removes the associated network.

```bash
./stop.sh
```

### rebuild.sh

Rebuilds and restarts the Docker container from scratch to ensure all changes are applied.
Use this script when you've made changes to the HTML, CSS, or JavaScript files.

```bash
./rebuild.sh
```

This script:
1. Stops any running containers
2. Rebuilds the Docker image without using cache
3. Starts the container

## Usage on Different Platforms

### macOS/Linux

Make the scripts executable (if not already):
```bash
chmod +x scripts/*.sh
```

Run any script:
```bash
./scripts/start.sh
```

### Windows

Use Git Bash or WSL to run these scripts on Windows, or create equivalent batch files (.bat) for native Windows support. 