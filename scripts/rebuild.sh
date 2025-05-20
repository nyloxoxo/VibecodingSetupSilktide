#!/bin/bash

echo "Rebuilding Developer Setup Tool..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Create necessary directories if they don't exist
mkdir -p temp
mkdir -p installers/mac
mkdir -p installers/windows

# Stop any running containers
echo "Stopping containers..."
docker-compose down

# Rebuild without cache to ensure fresh copy
echo "Rebuilding containers without cache..."
docker-compose build --no-cache

# Start containers
echo "Starting containers..."
docker-compose up -d

echo -e "\nDeveloper Setup Tool has been rebuilt and restarted!"
echo "Access the web interface at: http://localhost:7654"

# Display logs
echo -e "\nLog output:"
docker-compose logs -f 