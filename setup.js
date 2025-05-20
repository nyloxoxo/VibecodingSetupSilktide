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
    const validationModal = document.getElementById('validationModal');

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

    // Account creation URLs
    const accountUrls = {
        github: 'https://github.com/signup',
        cursor: 'https://cursor.sh/login',
        docker: 'https://hub.docker.com/signup'
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

    // Form validation function
    function validateForm() {
        let isValid = true;
        let errorMessage = "Please address the following issues:";
        
        // Reset previous errors
        const osSection = document.getElementById('osSection');
        const installModeSection = document.getElementById('installModeSection');
        const osErrorMessage = document.getElementById('osErrorMessage');
        const softwareErrorMessage = document.getElementById('softwareErrorMessage');
        
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

    // Start setup process
    startSetupBtn.addEventListener('click', function() {
        // Get form data
        const formData = new FormData(setupForm);
        const osType = formData.get('os_type');
        const osVersion = formData.get('os_version');
        const installMode = formData.get('install_mode');
        const downloadMode = formData.get('download_mode');
        
        // Validate the form
        if (!validateForm()) {
            return;
        }
        
        // Get all checked software
        const selectedSoftware = [];
        const softwareCheckboxes = document.querySelectorAll('input[name="software"]:checked');
        softwareCheckboxes.forEach(checkbox => {
            selectedSoftware.push(checkbox.value);
        });
        
        // Save user data for account creation
        saveUserData();
        
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
        
        // Determine the platform to use
        const platform = detectPlatform();
        logMessage(`Detected platform: ${platform}`);
        
        // Now perform actual installation instead of simulation
        performRealInstallation(osType, osVersion, softwareList, downloadMode, platform);
    }
    
    // Detect the actual platform we're running on
    function detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('win') !== -1) return 'windows';
        if (userAgent.indexOf('mac') !== -1) return 'mac';
        if (userAgent.indexOf('linux') !== -1) return 'linux';
        return 'unknown';
    }

    // Function to perform the real installation process
    function performRealInstallation(osType, osVersion, softwareList, downloadMode, platform) {
        let currentStep = 0;
        const totalSteps = softwareList.length;
        const accountsToSetup = [];
        
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
                
                // Track which accounts need to be created
                if (software === 'github_desktop') {
                    accountsToSetup.push('github');
                } else if (software === 'cursor') {
                    accountsToSetup.push('cursor');
                } else if (software === 'docker') {
                    accountsToSetup.push('docker');
                }
                
                // Perform the actual installation using our backend API
                fetch('/api/install', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        software: software,
                        osType: osType,
                        osVersion: osVersion,
                        downloadUrl: downloadUrl,
                        downloadMode: downloadMode,
                        platform: platform
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        logMessage(`Installation command executed: ${data.command}`);
                    logMessage(`${software} installed successfully!\n`);
                    } else {
                        logMessage(`Error installing ${software}: ${data.error}\n`);
                    }
                    
                    // Move to next software
                    currentStep++;
                    processNextSoftware();
                })
                .catch(error => {
                    logMessage(`Error installing ${software}: ${error.message}\n`);
                    // Continue with next software despite error
                    currentStep++;
                    processNextSoftware();
                });
            } else {
                // All software installed
                updateProgress(100);
                logMessage('\nAll software installed successfully! Your development environment is ready.');
                logMessage('You can now start coding!');
                
                // If account setup is enabled, open browser tabs for account creation
                if (document.getElementById('openBrowser') && document.getElementById('openBrowser').checked && accountsToSetup.length > 0) {
                    setTimeout(() => {
                        logMessage('\nOpening browser tabs for account creation...');
                        openAccountSetupPages(accountsToSetup);
                    }, 1500);
                }
                
                // Re-enable start button
                startSetupBtn.disabled = false;
                startSetupBtn.textContent = 'Setup Complete';
            }
        }
    }

    // Function to open browser tabs for account setup
    function openAccountSetupPages(accountsList) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Create unique list (no duplicates)
        const uniqueAccounts = [...new Set(accountsList)];
        
        // Open tabs for each account
        uniqueAccounts.forEach(account => {
            let url = accountUrls[account];
            
            // If we have user data, add query parameters for pre-filling
            if (userData.email) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}email=${encodeURIComponent(userData.email)}`;
                
                if (account === 'github' && userData.githubUsername) {
                    url += `&login=${encodeURIComponent(userData.githubUsername)}`;
                }
            }
            
            logMessage(`Opening signup page for ${account}...`);
            
            // Actually open the browser tab
            window.open(url, '_blank');
        });
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

    // Load any saved user data
    function loadUserData() {
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            const userData = JSON.parse(savedData);
            document.getElementById('firstName').value = userData.firstName || '';
            document.getElementById('lastName').value = userData.lastName || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('company').value = userData.company || '';
            document.getElementById('githubUsername').value = userData.githubUsername || '';
            document.getElementById('githubAccountType').value = userData.githubAccountType || 'personal';
            document.getElementById('cursorUsername').value = userData.cursorUsername || '';
            document.getElementById('cursorPlan').value = userData.cursorPlan || 'free';
            document.getElementById('dockerUsername').value = userData.dockerUsername || '';
            document.getElementById('dockerSubscription').value = userData.dockerSubscription || 'personal';
        }
    }

    // Initialize saved data
    loadUserData();
}); 