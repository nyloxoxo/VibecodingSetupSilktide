#!/bin/bash

echo "Rebuilding Developer Setup Tool..."

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