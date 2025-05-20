const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const app = express();
const PORT = process.env.PORT || 80; // Use port 80 inside container, mapped to 7654 externally

// Add error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

// Middleware
app.use(express.json());

// Serve static files from current directory
app.use(express.static('.'));

// Set up routes - serve index.html or setup.html as the default route
app.get('/', (req, res) => {
    console.log('Serving index.html or setup.html');
    const indexPath = path.join(__dirname, 'index.html');
    const setupPath = path.join(__dirname, 'setup.html');
    
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else if (fs.existsSync(setupPath)) {
        res.sendFile(setupPath);
    } else {
        res.status(404).send('Neither index.html nor setup.html found');
    }
});

// Create temp directory for downloads if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Handle 404 errors
app.use((req, res, next) => {
    console.log(`404 Not Found: ${req.url}`);
    res.status(404).send('404 Not Found');
});

// Handle general errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Installation API endpoint
app.post('/api/install', async (req, res) => {
    console.log('Received installation request:', req.body);
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
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
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
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Developer Setup Server is running on port ${PORT}`);
    console.log(`Access the web interface at: http://localhost:${PORT}`);
}); 