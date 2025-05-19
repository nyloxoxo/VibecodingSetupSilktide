document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const setupForm = document.getElementById('setupForm');
    const osTypeRadios = document.getElementsByName('os_type');
    const osVersionSelect = document.getElementById('os_version');
    const installModeRadios = document.getElementsByName('install_mode');
    const startSetupBtn = document.getElementById('startSetupBtn');
    const installationProgress = document.getElementById('installationProgress');
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    const installationLogs = document.getElementById('installationLogs');
    const macOptions = document.querySelector('.mac-options');
    const windowsOptions = document.querySelector('.windows-options');
    const recommendedSoftware = document.querySelectorAll('.recommended-software');
    const optionalSoftware = document.querySelectorAll('.optional-software');

    // Software download URLs
    const downloadUrls = {
        mac: {
            github_desktop: {
                mac_intel: 'https://central.github.com/deployments/desktop/desktop/latest/darwin',
                mac_silicon: 'https://central.github.com/deployments/desktop/desktop/latest/darwin-arm64'
            },
            cursor: {
                mac_intel: 'https://download.cursor.sh/mac/intel',
                mac_silicon: 'https://download.cursor.sh/mac/apple-silicon'
            },
            docker: {
                mac_intel: 'https://desktop.docker.com/mac/main/amd64/Docker.dmg',
                mac_silicon: 'https://desktop.docker.com/mac/main/arm64/Docker.dmg'
            },
            windsurf: {
                mac_intel: 'https://github.com/windsurfapp/windsurf/releases/latest/download/Windsurf-Mac.dmg',
                mac_silicon: 'https://github.com/windsurfapp/windsurf/releases/latest/download/Windsurf-Mac-arm64.dmg'
            }
        },
        windows: {
            github_desktop: {
                win_10: 'https://central.github.com/deployments/desktop/desktop/latest/win32',
                win_11: 'https://central.github.com/deployments/desktop/desktop/latest/win32'
            },
            cursor: {
                win_10: 'https://download.cursor.sh/windows/setup',
                win_11: 'https://download.cursor.sh/windows/setup'
            },
            docker: {
                win_10: 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
                win_11: 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe'
            },
            windsurf: {
                win_10: 'https://github.com/windsurfapp/windsurf/releases/latest/download/Windsurf-Windows.exe',
                win_11: 'https://github.com/windsurfapp/windsurf/releases/latest/download/Windsurf-Windows.exe'
            }
        }
    };

    // Installation commands by OS
    const installCommands = {
        mac: {
            github_desktop: 'sudo hdiutil attach GitHub\\ Desktop.dmg && cp -r /Volumes/GitHub\\ Desktop/GitHub\\ Desktop.app /Applications/ && sudo hdiutil detach /Volumes/GitHub\\ Desktop',
            cursor: 'sudo hdiutil attach Cursor.dmg && cp -r /Volumes/Cursor/Cursor.app /Applications/ && sudo hdiutil detach /Volumes/Cursor',
            docker: 'sudo hdiutil attach Docker.dmg && sudo /Volumes/Docker/Docker.app/Contents/MacOS/install && sudo hdiutil detach /Volumes/Docker',
            windsurf: 'sudo hdiutil attach Windsurf.dmg && cp -r /Volumes/Windsurf/Windsurf.app /Applications/ && sudo hdiutil detach /Volumes/Windsurf'
        },
        windows: {
            github_desktop: 'start /wait GitHubDesktopSetup.exe',
            cursor: 'start /wait CursorSetup.exe',
            docker: 'start /wait DockerDesktopInstaller.exe',
            windsurf: 'start /wait WindsurfSetup.exe'
        }
    };

    // Handle OS type change
    osTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const osType = this.value;
            
            // Show/hide OS version options based on selection
            if (osType === 'mac') {
                macOptions.style.display = 'block';
                windowsOptions.style.display = 'none';
                osVersionSelect.value = 'mac_silicon'; // Default to Apple Silicon for Mac
            } else {
                macOptions.style.display = 'none';
                windowsOptions.style.display = 'block';
                osVersionSelect.value = 'win_11'; // Default to Windows 11
            }
        });
    });

    // Start setup process
    startSetupBtn.addEventListener('click', function() {
        // Get form data
        const formData = new FormData(setupForm);
        const osType = formData.get('os_type');
        const osVersion = formData.get('os_version');
        const installMode = formData.get('install_mode');
        const downloadMode = formData.get('download_mode');
        
        // Get all checked software
        const selectedSoftware = [];
        const softwareCheckboxes = document.querySelectorAll('input[name="software"]:checked');
        softwareCheckboxes.forEach(checkbox => {
            selectedSoftware.push(checkbox.value);
        });
        
        // Validate OS version selection
        if (!osVersion) {
            alert('Please select your OS version');
            return;
        }
        
        // Validate that at least one software is selected
        if (selectedSoftware.length === 0) {
            alert('Please select at least one software to install');
            return;
        }
        
        // Start installation process
        startInstallation(osType, osVersion, selectedSoftware, downloadMode);
    });

    // Function to start the installation process
    function startInstallation(osType, osVersion, softwareList, downloadMode) {
        // Show installation progress section
        installationProgress.style.display = 'block';
        startSetupBtn.disabled = true;
        
        // Log installation start
        logMessage(`Starting installation for ${osType} (${osVersion})`);
        logMessage(`Installation mode: ${downloadMode === 'web' ? 'Download from web' : 'Use bundled installers'}`);
        logMessage(`Software to install: ${softwareList.join(', ')}\n`);
        
        // If using web download mode
        if (downloadMode === 'web') {
            // In a real implementation, we would actually download and install
            // For this demo, we'll simulate the process
            simulateInstallation(osType, osVersion, softwareList);
        } else {
            // Using bundled installers
            logMessage('Using bundled installers...');
            simulateInstallation(osType, osVersion, softwareList);
        }
    }

    // Function to simulate the installation process
    function simulateInstallation(osType, osVersion, softwareList) {
        let currentStep = 0;
        const totalSteps = softwareList.length;
        
        // Process each software installation
        processNextSoftware();
        
        function processNextSoftware() {
            if (currentStep < totalSteps) {
                const software = softwareList[currentStep];
                const progress = Math.round((currentStep / totalSteps) * 100);
                
                updateProgress(progress);
                
                // Get download URL based on OS type and version
                const downloadUrl = downloadUrls[osType][software][osVersion];
                
                logMessage(`Installing ${software}...`);
                logMessage(`Download URL: ${downloadUrl}`);
                
                // In a real implementation, we would download and run the installer
                // Here we're just simulating it with a delay
                setTimeout(() => {
                    // Log installation command that would be used
                    logMessage(`Installation command: ${installCommands[osType][software]}`);
                    logMessage(`${software} installed successfully!\n`);
                    
                    // Move to next software
                    currentStep++;
                    processNextSoftware();
                }, 2000);
            } else {
                // All software installed
                updateProgress(100);
                logMessage('\nAll software installed successfully! Your development environment is ready.');
                logMessage('You can now start coding!');
                
                // Re-enable start button
                startSetupBtn.disabled = false;
                startSetupBtn.textContent = 'Setup Complete';
            }
        }
    }

    // Function to update progress bar and percentage
    function updateProgress(percentage) {
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
    }

    // Function to log messages to the installation logs
    function logMessage(message) {
        installationLogs.textContent += message + '\n';
        installationLogs.scrollTop = installationLogs.scrollHeight;
    }

    // In a production environment, this script would:
    // 1. Use Electron or similar to create a desktop app
    // 2. Use node.js to handle actual file downloads
    // 3. Execute actual installation commands with proper privileges
    // 4. Handle errors and provide detailed progress information
}); 