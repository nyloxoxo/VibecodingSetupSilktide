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
  },
  
  // Open browser for account creation
  openBrowser: (url) => {
    return ipcRenderer.invoke('open-browser', url);
  },
  
  // Get OS information
  getOsInfo: () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion()
    };
  }
}); 