# Electron Implementation Guide

This guide provides instructions for converting the web-based Developer Setup Tool into a full Electron desktop application that can actually download and install software.

## Prerequisites

- Node.js and npm installed
- Basic knowledge of JavaScript and Electron

## Getting Started

1. Create a new project folder for the Electron app:

```bash
mkdir dev-setup-electron
cd dev-setup-electron
npm init -y
```

2. Install required dependencies:

```bash
npm install electron electron-builder --save-dev
npm install electron-dl node-fetch sudo-prompt fs-extra
```

3. Copy the HTML, CSS, and JavaScript files from the web version to the project folder.

## Project Structure

```
dev-setup-electron/
├── package.json
├── main.js
├── preload.js
├── renderer.js
├── setup.html
├── setup.js
├── installers/     # For bundled installers (optional)
└── assets/
    └── icons/
```

## Implementation Steps

### 1. Create main.js

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { download } = require('electron-dl');
const { exec } = require('child_process');
const sudoPrompt = require('sudo-prompt');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('setup.html');
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle download request from renderer
ipcMain.handle('download-software', async (event, { url, filename }) => {
  const downloadPath = path.join(app.getPath('temp'), 'dev-setup-downloads');
  
  // Ensure download directory exists
  await fs.ensureDir(downloadPath);
  
  // Download the file
  const dl = await download(mainWindow, url, {
    directory: downloadPath,
    filename: filename,
    onProgress: (progress) => {
      mainWindow.webContents.send('download-progress', progress);
    }
  });
  
  return dl.getSavePath();
});

// Handle installation request from renderer
ipcMain.handle('install-software', async (event, { filePath, software, osType }) => {
  return new Promise((resolve, reject) => {
    const isMac = osType.startsWith('mac');
    
    if (isMac) {
      // macOS installation (typically requires admin privileges)
      let command = '';
      
      if (software === 'github_desktop') {
        command = `hdiutil attach "${filePath}" && cp -r /Volumes/GitHub\\ Desktop/GitHub\\ Desktop.app /Applications/ && hdiutil detach /Volumes/GitHub\\ Desktop`;
      } else if (software === 'cursor') {
        command = `hdiutil attach "${filePath}" && cp -r /Volumes/Cursor/Cursor.app /Applications/ && hdiutil detach /Volumes/Cursor`;
      } else if (software === 'docker') {
        command = `hdiutil attach "${filePath}" && /Volumes/Docker/Docker.app/Contents/MacOS/install && hdiutil detach /Volumes/Docker`;
      } else if (software === 'windsurf') {
        command = `hdiutil attach "${filePath}" && cp -r /Volumes/Windsurf/Windsurf.app /Applications/ && hdiutil detach /Volumes/Windsurf`;
      }
      
      sudoPrompt.exec(command, {
        name: 'Developer Setup Tool',
      }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    } else {
      // Windows installation
      const command = `"${filePath}"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    }
  });
});
```

### 2. Create preload.js

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Download software
  downloadSoftware: (url, filename) => {
    return ipcRenderer.invoke('download-software', { url, filename });
  },
  
  // Install software
  installSoftware: (filePath, software, osType) => {
    return ipcRenderer.invoke('install-software', { filePath, software, osType });
  },
  
  // Subscribe to download progress
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, progress) => {
      callback(progress);
    });
  }
});
```

### 3. Modify setup.js to use Electron APIs

Update the existing setup.js file to use the Electron APIs for downloading and installing software:

```javascript
// Replace the simulateInstallation function with this real implementation
async function installSoftware(osType, osVersion, softwareList, downloadMode) {
  let currentStep = 0;
  const totalSteps = softwareList.length * 2; // Download + Install steps
  
  for (const software of softwareList) {
    try {
      // 1. Download step
      updateProgress(Math.round((currentStep / totalSteps) * 100));
      const downloadUrl = downloadUrls[osType][software][osVersion];
      const filename = getFilenameFromUrl(downloadUrl);
      
      logMessage(`Downloading ${software}...`);
      
      // If using web download mode, actually download the file
      let filePath;
      if (downloadMode === 'web') {
        filePath = await window.electronAPI.downloadSoftware(downloadUrl, filename);
        logMessage(`Downloaded to: ${filePath}`);
      } else {
        // For bundled mode, use the pre-packaged installer
        filePath = `installers/${osType}/${software}/${filename}`;
        logMessage(`Using bundled installer: ${filePath}`);
      }
      
      currentStep++;
      updateProgress(Math.round((currentStep / totalSteps) * 100));
      
      // 2. Install step
      logMessage(`Installing ${software}...`);
      const result = await window.electronAPI.installSoftware(filePath, software, osType);
      logMessage(`${software} installed successfully!`);
      
      currentStep++;
      updateProgress(Math.round((currentStep / totalSteps) * 100));
    } catch (error) {
      logMessage(`Error installing ${software}: ${error.message}`);
    }
  }
  
  updateProgress(100);
  logMessage('\nAll software installed successfully! Your development environment is ready.');
  logMessage('You can now start coding!');
  
  startSetupBtn.disabled = false;
  startSetupBtn.textContent = 'Setup Complete';
}

// Helper function to extract filename from URL
function getFilenameFromUrl(url) {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// Add event listener for download progress
window.electronAPI.onDownloadProgress((progress) => {
  const percent = Math.round(progress.percent * 100);
  logMessage(`Download progress: ${percent}%`);
});
```

### 4. Update package.json

```json
{
  "name": "dev-setup-electron",
  "version": "1.0.0",
  "description": "Developer Setup Tool",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build:mac": "electron-builder --mac",
    "build:win": "electron-builder --win"
  },
  "build": {
    "appId": "com.yourcompany.devsetup",
    "productName": "Developer Setup Tool",
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": ["dmg"]
    },
    "win": {
      "target": ["nsis"]
    },
    "files": [
      "**/*",
      "!installers/${os}/**/*"
    ],
    "extraResources": [
      {
        "from": "installers/${os}",
        "to": "installers",
        "filter": ["**/*"]
      }
    ]
  }
}
```

## Running the Application

```bash
npm start
```

## Building the Application

```bash
# For macOS
npm run build:mac

# For Windows
npm run build:win
```

## Adding Bundled Installers

If you want to include installers with the application (for offline installation):

1. Create an `installers` directory in your project
2. Create subdirectories for each OS and software:
   ```
   installers/
   ├── mac/
   │   ├── github_desktop/
   │   ├── cursor/
   │   ├── docker/
   │   └── windsurf/
   └── windows/
       ├── github_desktop/
       ├── cursor/
       ├── docker/
       └── windsurf/
   ```
3. Download the installers and place them in the appropriate directories

## Security Considerations

- Always download software from official sources
- Use HTTPS for all downloads
- Verify installers with checksums when possible
- Be careful with elevated privileges (sudo/admin)
- Consider code signing your Electron application

## Distribution

For distribution, build the application for both macOS and Windows, and provide your users with the appropriate installer for their platform. 