#!/bin/bash

echo "Starting Developer Setup Tool..."
docker-compose down
docker-compose build
docker-compose up -d

echo -e "\nDeveloper Setup Tool is now running!"
echo "Access the Developer Setup Tool at: http://localhost:7654"
echo "If you encounter any issues, please check that Docker is running correctly."
echo -e "\nLog output:"
docker-compose logs -f 