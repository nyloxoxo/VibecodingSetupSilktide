#!/bin/bash

# Developer Setup Tool for macOS
# ------------------------------

# Check for admin privileges
if [ "$EUID" -ne 0 ]; then
  echo "This script must be run with sudo privileges."
  echo "Please run: sudo ./setup.sh"
  exit 1
fi

# Detect macOS version and architecture
os_version=$(sw_vers -productVersion)
architecture=$(uname -m)

if [ "$architecture" == "arm64" ]; then
  mac_type="mac_silicon"
else
  mac_type="mac_intel"
fi

echo "Developer Setup Tool"
echo "-------------------"
echo
echo "macOS version detected: $os_version"
echo "Architecture detected: $architecture ($mac_type)"
echo

# Setup variables
download_dir="/tmp/dev_setup_downloads"
mkdir -p "$download_dir"

# URLs for different architectures
if [ "$mac_type" == "mac_silicon" ]; then
  github_url="https://central.github.com/deployments/desktop/desktop/latest/darwin-arm64"
  cursor_url="https://download.cursor.sh/mac/apple-silicon"
  docker_url="https://desktop.docker.com/mac/main/arm64/Docker.dmg"
  windsurf_url="https://github.com/windsurfapp/windsurf/releases/latest/download/Windsurf-Mac-arm64.dmg"
else
  github_url="https://central.github.com/deployments/desktop/desktop/latest/darwin"
  cursor_url="https://download.cursor.sh/mac/intel"
  docker_url="https://desktop.docker.com/mac/main/amd64/Docker.dmg"
  windsurf_url="https://github.com/windsurfapp/windsurf/releases/latest/download/Windsurf-Mac.dmg"
fi

# Functions
download_and_install() {
  local name=$1
  local url=$2
  local filename=$3
  local filepath="$download_dir/$filename"
  
  echo "[$current_count/$total_count] Installing $name..."
  
  # Check if installer is bundled
  if [ -f "installers/mac/$filename" ]; then
    echo "Using bundled installer..."
    filepath="installers/mac/$filename"
  else
    echo "Downloading $name..."
    curl -L "$url" -o "$filepath"
    
    if [ $? -ne 0 ]; then
      echo "Failed to download $name."
      return 1
    fi
    
    echo "Download completed."
  fi
  
  echo "Installing $name..."
  
  case "$name" in
    "GitHub Desktop")
      hdiutil attach "$filepath" -quiet
      cp -r "/Volumes/GitHub Desktop/GitHub Desktop.app" /Applications/
      hdiutil detach "/Volumes/GitHub Desktop" -quiet
      ;;
    "Cursor")
      hdiutil attach "$filepath" -quiet
      cp -r "/Volumes/Cursor/Cursor.app" /Applications/
      hdiutil detach "/Volumes/Cursor" -quiet
      ;;
    "Docker")
      hdiutil attach "$filepath" -quiet
      /Volumes/Docker/Docker.app/Contents/MacOS/install --accept-license
      hdiutil detach "/Volumes/Docker" -quiet
      ;;
    "Windsurf")
      hdiutil attach "$filepath" -quiet
      cp -r "/Volumes/Windsurf/Windsurf.app" /Applications/
      hdiutil detach "/Volumes/Windsurf" -quiet
      ;;
  esac
  
  echo "$name installed successfully."
  echo
}

show_menu() {
  clear
  echo "Developer Setup Tool"
  echo "-------------------"
  echo
  echo "Select installation mode:"
  echo "1. Recommended Setup (GitHub Desktop + Cursor)"
  echo "2. Manual Selection"
  echo "3. Exit"
  echo
  read -p "Enter your choice (1-3): " install_mode
  
  case $install_mode in
    1)
      install_github=1
      install_cursor=1
      install_docker=0
      install_windsurf=0
      start_installation
      ;;
    2)
      manual_selection
      ;;
    3)
      exit 0
      ;;
    *)
      echo "Invalid choice. Please try again."
      read -p "Press Enter to continue..."
      show_menu
      ;;
  esac
}

manual_selection() {
  clear
  echo "Developer Setup Tool - Manual Selection"
  echo "-------------------------------------"
  echo
  echo "Select software to install (y/n):"
  echo
  
  read -p "GitHub Desktop (Recommended): " install_github_response
  read -p "Cursor (Recommended): " install_cursor_response
  read -p "Docker (Optional): " install_docker_response
  read -p "Windsurf (Optional): " install_windsurf_response
  
  echo
  echo "You selected:"
  [[ "$install_github_response" =~ ^[Yy] ]] && echo "- GitHub Desktop"
  [[ "$install_cursor_response" =~ ^[Yy] ]] && echo "- Cursor"
  [[ "$install_docker_response" =~ ^[Yy] ]] && echo "- Docker"
  [[ "$install_windsurf_response" =~ ^[Yy] ]] && echo "- Windsurf"
  echo
  
  read -p "Proceed with installation? (y/n): " confirm
  if [[ ! "$confirm" =~ ^[Yy] ]]; then
    show_menu
    return
  fi
  
  # Convert y/n to 1/0
  [[ "$install_github_response" =~ ^[Yy] ]] && install_github=1 || install_github=0
  [[ "$install_cursor_response" =~ ^[Yy] ]] && install_cursor=1 || install_cursor=0
  [[ "$install_docker_response" =~ ^[Yy] ]] && install_docker=1 || install_docker=0
  [[ "$install_windsurf_response" =~ ^[Yy] ]] && install_windsurf=1 || install_windsurf=0
  
  start_installation
}

start_installation() {
  clear
  echo "Developer Setup Tool - Installation"
  echo "-------------------------------"
  echo
  echo "Installation in progress. This may take a while..."
  echo
  
  # Calculate total installations
  total_count=0
  current_count=0
  
  [ $install_github -eq 1 ] && ((total_count++))
  [ $install_cursor -eq 1 ] && ((total_count++))
  [ $install_docker -eq 1 ] && ((total_count++))
  [ $install_windsurf -eq 1 ] && ((total_count++))
  
  # Perform installations
  if [ $install_github -eq 1 ]; then
    ((current_count++))
    download_and_install "GitHub Desktop" "$github_url" "GitHub Desktop.dmg"
  fi
  
  if [ $install_cursor -eq 1 ]; then
    ((current_count++))
    download_and_install "Cursor" "$cursor_url" "Cursor.dmg"
  fi
  
  if [ $install_docker -eq 1 ]; then
    ((current_count++))
    download_and_install "Docker" "$docker_url" "Docker.dmg"
  fi
  
  if [ $install_windsurf -eq 1 ]; then
    ((current_count++))
    download_and_install "Windsurf" "$windsurf_url" "Windsurf.dmg"
  fi
  
  echo
  echo "All installations completed successfully!"
  echo
  echo "Your development environment is ready."
  echo "You can now start coding!"
  echo
  read -p "Press Enter to exit..."
  exit 0
}

# Start the program
show_menu 