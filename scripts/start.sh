#!/bin/bash

echo "Starting Developer Setup Tool..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Create necessary directories if they don't exist
mkdir -p temp
mkdir -p installers/mac
mkdir -p installers/windows

# Check if package.json exists
if [ ! -f package.json ]; then
  echo "Warning: package.json not found. Docker will create a default one."
fi

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down

# Build the image
echo "Building Docker image..."
docker-compose build

# Start the container
echo "Starting Docker container..."
docker-compose up -d

echo -e "\nDeveloper Setup Tool is now running!"
echo "Access the Developer Setup Tool at: http://localhost:7654"
echo "If you encounter any issues, please check that Docker is running correctly."
echo -e "\nLog output:"
docker-compose logs -f 