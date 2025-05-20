// renderer.js - Connects the web UI with Electron APIs

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're running in Electron
    const isElectron = window.electronAPI !== undefined;
    
    if (isElectron) {
        console.log('Running in Electron');
        
        // Get OS info and pre-select the correct radio button
        const osInfo = window.electronAPI.getOsInfo();
        console.log('OS Info:', osInfo);
        
        // Auto-select OS radio button based on platform
        if (osInfo.platform === 'darwin') {
            document.querySelector('input[name="os_type"][value="mac"]').checked = true;
            // Pre-select Silicon or Intel based on architecture
            const osVersionSelect = document.getElementById('os_version');
            if (osInfo.arch === 'arm64') {
                // For M1/M2/M3 Macs
                for (const option of osVersionSelect.options) {
                    if (option.value === 'mac_silicon') {
                        option.selected = true;
                        break;
                    }
                }
            } else {
                // For Intel Macs
                for (const option of osVersionSelect.options) {
                    if (option.value === 'mac_intel') {
                        option.selected = true;
                        break;
                    }
                }
            }
        } else if (osInfo.platform === 'win32') {
            document.querySelector('input[name="os_type"][value="windows"]').checked = true;
            // Attempt to determine Windows 10 vs 11 by version
            const osVersionSelect = document.getElementById('os_version');
            if (parseFloat(osInfo.version) >= 10.0) {
                for (const option of osVersionSelect.options) {
                    if (option.value === 'win_11') {
                        option.selected = true;
                        break;
                    }
                }
            } else {
                for (const option of osVersionSelect.options) {
                    if (option.value === 'win_10') {
                        option.selected = true;
                        break;
                    }
                }
            }
        }
        
        // Handle OS type change to show the correct OS version options
        const osTypeRadios = document.querySelectorAll('input[name="os_type"]');
        const macOptions = document.querySelector('.mac-options');
        const windowsOptions = document.querySelector('.windows-options');
        
        osTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'mac') {
                    macOptions.style.display = 'block';
                    windowsOptions.style.display = 'none';
                } else if (this.value === 'windows') {
                    macOptions.style.display = 'none';
                    windowsOptions.style.display = 'block';
                }
            });
        });
        
        // Get references for installation UI
        const startSetupBtn = document.getElementById('startSetupBtn');
        const installationProgress = document.getElementById('installationProgress');
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        const installationLogs = document.getElementById('installationLogs');
        
        // IMPORTANT: Remove any existing click listeners from the setup button
        // Clone the node to remove all event listeners
        const oldStartSetupBtn = startSetupBtn;
        const newStartSetupBtn = oldStartSetupBtn.cloneNode(true);
        oldStartSetupBtn.parentNode.replaceChild(newStartSetupBtn, oldStartSetupBtn);
        
        // Now add our Electron-specific click handler to the button
        newStartSetupBtn.addEventListener('click', async (event) => {
            // Validate form (reusing existing validation logic)
            if (validateForm()) {
                saveUserData();
                
                // Start the installation process
                newStartSetupBtn.disabled = true;
                newStartSetupBtn.textContent = 'Installing...';
                installationProgress.style.display = 'block';
                
                // Get form data
                const osType = document.querySelector('input[name="os_type"]:checked').value;
                const osVersion = document.getElementById('os_version').value;
                const downloadMode = document.querySelector('input[name="download_mode"]:checked').value;
                const selectedSoftware = Array.from(document.querySelectorAll('input[name="software"]:checked')).map(cb => cb.value);
                
                logMessage("Starting Electron installation process...");
                logMessage(`OS: ${osType} (${osVersion})`);
                logMessage(`Software: ${selectedSoftware.join(', ')}`);
                logMessage(`Download mode: ${downloadMode}\n`);
                
                // Install the selected software
                await installSoftwareElectron(osType, osVersion, selectedSoftware, downloadMode);
                
                // Open browser for account creation if selected
                if (document.getElementById('openBrowser').checked) {
                    const githubAccountType = document.getElementById('githubAccountType').value;
                    const cursorPlan = document.getElementById('cursorPlan').value;
                    
                    if (selectedSoftware.includes('github_desktop')) {
                        window.electronAPI.openBrowser('https://github.com/signup');
                    }
                    
                    if (selectedSoftware.includes('cursor')) {
                        window.electronAPI.openBrowser('https://cursor.sh/signin');
                    }
                    
                    if (selectedSoftware.includes('docker')) {
                        window.electronAPI.openBrowser('https://hub.docker.com/signup');
                    }
                }
            }
        });
        
        // Listen for download progress
        window.electronAPI.onDownloadProgress((progress) => {
            const percent = Math.round(progress.percent * 100);
            updateProgress(percent);
            logMessage(`Download progress: ${percent}%`);
        });
    } else {
        console.log('Running in browser (not Electron)');
        // The original web logic will handle this case
    }

    // Common functions shared between Electron and web versions
    
    // Update the progress bar
    function updateProgress(percent) {
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        progressBar.style.width = `${percent}%`;
        progressPercentage.textContent = `${percent}%`;
    }
    
    // Log a message to the installation logs
    function logMessage(message) {
        const installationLogs = document.getElementById('installationLogs');
        installationLogs.textContent += `\n${message}`;
        installationLogs.scrollTop = installationLogs.scrollHeight;
    }
    
    // Install software using Electron APIs
    async function installSoftwareElectron(osType, osVersion, softwareList, downloadMode) {
        let currentStep = 0;
        const totalSteps = softwareList.length * 2; // Download + Install steps
        
        // URLs for software downloads (these should be updated with the latest versions)
        const downloadUrls = {
            mac: {
                github_desktop: {
                    mac_intel: 'https://central.github.com/deployments/desktop/desktop/latest/darwin',
                    mac_silicon: 'https://central.github.com/deployments/desktop/desktop/latest/darwin-arm64'
                },
                cursor: {
                    mac_intel: 'https://download.cursor.sh/mac/intel',
                    mac_silicon: 'https://download.cursor.sh/mac/silicon'
                },
                docker: {
                    mac_intel: 'https://desktop.docker.com/mac/main/amd64/Docker.dmg',
                    mac_silicon: 'https://desktop.docker.com/mac/main/arm64/Docker.dmg'
                },
                windsurf: {
                    mac_intel: 'https://download.windsurf.io/latest/mac/intel',
                    mac_silicon: 'https://download.windsurf.io/latest/mac/arm64'
                }
            },
            windows: {
                github_desktop: {
                    win_10: 'https://central.github.com/deployments/desktop/desktop/latest/win32',
                    win_11: 'https://central.github.com/deployments/desktop/desktop/latest/win32'
                },
                cursor: {
                    win_10: 'https://download.cursor.sh/windows/Cursor-Setup.exe',
                    win_11: 'https://download.cursor.sh/windows/Cursor-Setup.exe'
                },
                docker: {
                    win_10: 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
                    win_11: 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe'
                },
                windsurf: {
                    win_10: 'https://download.windsurf.io/latest/windows',
                    win_11: 'https://download.windsurf.io/latest/windows'
                }
            }
        };
        
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
        
        const startSetupBtn = document.getElementById('startSetupBtn');
        startSetupBtn.disabled = false;
        startSetupBtn.textContent = 'Setup Complete';
    }
    
    // Helper function to extract filename from URL
    function getFilenameFromUrl(url) {
        const parts = url.split('/');
        return parts[parts.length - 1];
    }
});

// Ensure we have the validation functions that were in the original script
function validateForm() {
    let isValid = true;
    let errorMessage = "Please address the following issues:";
    
    // Reset previous errors
    const osSection = document.getElementById('osSection');
    const installModeSection = document.getElementById('installModeSection');
    const osErrorMessage = document.getElementById('osErrorMessage');
    const softwareErrorMessage = document.getElementById('softwareErrorMessage');
    const osVersionSelect = document.getElementById('os_version');
    
    osSection.classList.remove('error');
    installModeSection.classList.remove('error');
    osErrorMessage.classList.remove('visible');
    softwareErrorMessage.classList.remove('visible');
    osVersionSelect.classList.remove('error');
    
    // Validate OS selection
    if (!osVersionSelect.value) {
        isValid = false;
        osSection.classList.add('error');
        osVersionSelect.classList.add('error');
        osErrorMessage.classList.add('visible');
        errorMessage += "\n- Select your OS version";
    }
    
    // Validate software selection
    const selectedSoftware = document.querySelectorAll('input[name="software"]:checked');
    if (selectedSoftware.length === 0) {
        isValid = false;
        installModeSection.classList.add('error');
        softwareErrorMessage.classList.add('visible');
        errorMessage += "\n- Select at least one software to install";
    }
    
    // Validate email if provided
    const emailInput = document.getElementById('email');
    const emailErrorMessage = document.getElementById('emailErrorMessage');
    
    if (emailInput.value && !isValidEmail(emailInput.value)) {
        isValid = false;
        emailInput.classList.add('error');
        emailErrorMessage.classList.add('visible');
        errorMessage += "\n- Enter a valid email address";
    }
    
    // Show validation modal if there are errors
    if (!isValid) {
        const validationModal = document.getElementById('validationModal');
        const validationMessage = document.getElementById('validationMessage');
        validationMessage.textContent = errorMessage;
        validationModal.classList.add('visible');
    }
    
    return isValid;
}

// Email validation helper
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Local storage for user data
function saveUserData() {
    if (document.getElementById('saveUserData').checked) {
        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            company: document.getElementById('company').value,
            githubUsername: document.getElementById('githubUsername').value,
            githubAccountType: document.getElementById('githubAccountType').value,
            cursorUsername: document.getElementById('cursorUsername').value,
            cursorPlan: document.getElementById('cursorPlan').value,
            dockerUsername: document.getElementById('dockerUsername').value,
            dockerSubscription: document.getElementById('dockerSubscription').value
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
    }
} 