const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const app = express();
const PORT = process.env.PORT || 7654;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Create temp directory for downloads if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Installation API endpoint
app.post('/api/install', async (req, res) => {
    const { software, osType, osVersion, downloadUrl, downloadMode, platform } = req.body;
    
    // Validate request
    if (!software || !osType || !osVersion || !platform) {
        return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    
    try {
        // Step 1: Download the software (if web download mode)
        let installerPath;
        
        if (downloadMode === 'web') {
            // Download from web
            installerPath = await downloadInstaller(software, downloadUrl);
        } else {
            // Use bundled installer
            const bundledPath = path.join(__dirname, 'installers', osType, `${software}.${getInstallerExtension(osType)}`);
            if (fs.existsSync(bundledPath)) {
                installerPath = bundledPath;
            } else {
                return res.status(404).json({ success: false, error: 'Bundled installer not found' });
            }
        }
        
        // Step 2: Execute the installation command
        const command = getInstallCommand(software, osType, installerPath);
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error}`);
                return res.status(500).json({ success: false, error: error.message });
            }
            
            console.log(`Installation output: ${stdout}`);
            if (stderr) console.error(`Installation errors: ${stderr}`);
            
            res.json({ 
                success: true, 
                message: `${software} installed successfully`,
                command: command,
                output: stdout
            });
        });
        
    } catch (error) {
        console.error(`Installation error: ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Function to download installer
function downloadInstaller(software, url) {
    return new Promise((resolve, reject) => {
        const extension = url.includes('.exe') ? 'exe' : url.includes('.dmg') ? 'dmg' : 'bin';
        const installerPath = path.join(tempDir, `${software}.${extension}`);
        const file = fs.createWriteStream(installerPath);
        
        console.log(`Downloading ${software} from ${url} to ${installerPath}`);
        
        const request = url.startsWith('https') ? https : http;
        
        request.get(url, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                return downloadInstaller(software, response.headers.location);
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                
                // Make executable on Unix systems
                if (process.platform !== 'win32') {
                    fs.chmodSync(installerPath, '755');
                }
                
                resolve(installerPath);
            });
            
        }).on('error', (err) => {
            fs.unlink(installerPath, () => {}); // Delete the file
            reject(err);
        });
    });
}

// Get the correct installation command for the OS and software
function getInstallCommand(software, osType, installerPath) {
    const commands = {
        mac: {
            github_desktop: `hdiutil attach "${installerPath}" && cp -r /Volumes/GitHub\\ Desktop/GitHub\\ Desktop.app /Applications/ && hdiutil detach /Volumes/GitHub\\ Desktop`,
            cursor: `hdiutil attach "${installerPath}" && cp -r /Volumes/Cursor/Cursor.app /Applications/ && hdiutil detach /Volumes/Cursor`,
            docker: `hdiutil attach "${installerPath}" && /Volumes/Docker/Docker.app/Contents/MacOS/install && hdiutil detach /Volumes/Docker`,
            windsurf: `hdiutil attach "${installerPath}" && cp -r /Volumes/Windsurf/Windsurf.app /Applications/ && hdiutil detach /Volumes/Windsurf`
        },
        windows: {
            github_desktop: `"${installerPath}" /S`,
            cursor: `"${installerPath}" /S`,
            docker: `"${installerPath}" /quiet`,
            windsurf: `"${installerPath}" /S`
        }
    };
    
    return commands[osType][software];
}

// Get the appropriate file extension for the installer based on OS
function getInstallerExtension(osType) {
    return osType === 'mac' ? 'dmg' : 'exe';
}

// Start the server
app.listen(PORT, () => {
    console.log(`Developer Setup Server is running on port ${PORT}`);
    console.log(`Access the web interface at: http://localhost:${PORT}`);
}); 