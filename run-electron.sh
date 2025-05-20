#!/bin/bash

# Script to build and run the Electron app inside Docker

# Install dependencies for Electron
echo "Installing Electron dependencies..."
npm install electron electron-builder electron-dl sudo-prompt fs-extra --save-dev

# Set environment variable to run in development mode
export NODE_ENV=development

# Run the Electron app
echo "Starting Electron app..."
npx electron . --no-sandbox 