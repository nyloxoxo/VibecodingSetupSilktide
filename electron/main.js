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

  mainWindow.loadFile(path.join(__dirname, '../index.html'));
  
  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
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

// Create temp directory for downloads if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
fs.ensureDirSync(tempDir);

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

// Handle opening browser for account creation
ipcMain.handle('open-browser', (event, url) => {
  require('electron').shell.openExternal(url);
}); 