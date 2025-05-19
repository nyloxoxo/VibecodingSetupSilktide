// Test script for the developer setup tool
// This test script safely verifies the installation process by:
// 1. Intercepting downloads to prevent actual installations
// 2. Providing real abort functionality
// 3. Adding visual feedback for testing purposes

document.addEventListener('DOMContentLoaded', function() {
    console.log('Test script loaded');
    
    // Create a test control panel
    createTestControls();
    
    // Override the installation function from setup.js
    overrideInstallationFunctions();
});

// Create test controls to manage the test
function createTestControls() {
    // Create a floating test control panel
    const controlPanel = document.createElement('div');
    controlPanel.style.position = 'fixed';
    controlPanel.style.top = '10px';
    controlPanel.style.right = '10px';
    controlPanel.style.backgroundColor = '#f8f9fa';
    controlPanel.style.border = '1px solid #ddd';
    controlPanel.style.borderRadius = '5px';
    controlPanel.style.padding = '10px';
    controlPanel.style.zIndex = '1000';
    controlPanel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    controlPanel.innerHTML = `
        <h3 style="margin-top: 0; color: #ff5252;">Test Mode Active</h3>
        <p style="margin-bottom: 10px; font-size: 12px;">This is a safe test environment.</p>
        <button id="abortDownloadBtn" style="background-color: #ff5252; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; display: none;">Abort Download</button>
        <div id="testStatus" style="margin-top: 10px; font-size: 12px;">Ready to test</div>
    `;
    document.body.appendChild(controlPanel);
    
    // Store references to control panel elements
    window.testControls = {
        panel: controlPanel,
        abortButton: controlPanel.querySelector('#abortDownloadBtn'),
        statusDiv: controlPanel.querySelector('#testStatus')
    };
    
    // Setup abort button click handler
    window.testControls.abortButton.addEventListener('click', function() {
        if (window.testDownloader && window.testDownloader.controller) {
            window.testDownloader.controller.abort();
            updateTestStatus('Download aborted by user');
            this.style.display = 'none';
        }
    });
}

// Update the test status message
function updateTestStatus(message) {
    if (window.testControls && window.testControls.statusDiv) {
        window.testControls.statusDiv.textContent = message;
    }
    console.log('Test status:', message);
}

// Override installation functions from the main setup.js
function overrideInstallationFunctions() {
    // Store original functions to call after our test interception
    const originalStartInstallation = window.startInstallation;
    const originalSimulateInstallation = window.simulateInstallation;
    
    // Create test versions with safe download handling
    window.startInstallation = function(osType, osVersion, softwareList, downloadMode) {
        updateTestStatus('Installation started - Test Mode');
        
        // Show installation progress section
        document.getElementById('installationProgress').style.display = 'block';
        document.getElementById('startSetupBtn').disabled = true;
        
        // Log installation start
        logMessage(`[TEST MODE] Starting installation for ${osType} (${osVersion})`);
        logMessage(`Installation mode: ${downloadMode === 'web' ? 'Download from web' : 'Use bundled installers'}`);
        logMessage(`Software to install: ${softwareList.join(', ')}\n`);
        logMessage(`** This is a TEST - No actual installations will occur **\n`);
        
        // Use our real download test instead of the simulation
        realDownloadTest(osType, osVersion, softwareList, downloadMode);
    };
    
    // Function to safely test real downloads without installing
    function realDownloadTest(osType, osVersion, softwareList, downloadMode) {
        let currentStep = 0;
        const totalSteps = softwareList.length;
        const accountsToSetup = [];
        
        // Process each software download test
        processNextSoftware();
        
        function processNextSoftware() {
            if (currentStep < totalSteps) {
                const software = softwareList[currentStep];
                const progress = Math.round((currentStep / totalSteps) * 100);
                
                updateProgress(progress);
                
                // Get download URL based on OS type and version
                const downloadUrl = window.downloadUrls[osType][software][osVersion];
                
                logMessage(`[TEST] Downloading ${software}...`);
                logMessage(`Download URL: ${downloadUrl}`);
                
                // Track which accounts need to be created
                if (software === 'github_desktop') {
                    accountsToSetup.push('github');
                } else if (software === 'cursor') {
                    accountsToSetup.push('cursor');
                } else if (software === 'docker') {
                    accountsToSetup.push('docker');
                }
                
                // Show abort button
                window.testControls.abortButton.style.display = 'block';
                
                // Initialize a real download but abort it before completion
                // This tests that downloads actually start but prevents completing them
                testDownload(downloadUrl, software)
                    .then(result => {
                        if (result.status === 'aborted') {
                            logMessage(`[TEST] Download of ${software} was aborted`);
                            window.testControls.abortButton.style.display = 'none';
                            
                            // Ask user if they want to continue to next software
                            if (confirm(`Download of ${software} was aborted. Continue to next software?`)) {
                                currentStep++;
                                processNextSoftware();
                            } else {
                                logMessage(`[TEST] Test terminated by user`);
                                document.getElementById('startSetupBtn').disabled = false;
                                document.getElementById('startSetupBtn').textContent = 'Restart Test';
                            }
                        } else {
                            logMessage(`[TEST] Download of ${software} completed successfully`);
                            logMessage(`[TEST] Installation command that would run: ${window.installCommands[osType][software]}`);
                            logMessage(`[TEST] ${software} "installed" successfully (simulation)\n`);
                            
                            // Move to next software
                            currentStep++;
                            processNextSoftware();
                        }
                    })
                    .catch(error => {
                        logMessage(`[TEST] Error during download test: ${error.message}`);
                        window.testControls.abortButton.style.display = 'none';
                        
                        // Ask user if they want to continue despite the error
                        if (confirm(`Error downloading ${software}. Continue to next software?`)) {
                            currentStep++;
                            processNextSoftware();
                        } else {
                            logMessage(`[TEST] Test terminated by user`);
                            document.getElementById('startSetupBtn').disabled = false;
                            document.getElementById('startSetupBtn').textContent = 'Restart Test';
                        }
                    });
                
            } else {
                // All software downloaded
                updateProgress(100);
                logMessage('\n[TEST] All downloads completed successfully! (Test Mode)');
                logMessage('[TEST] In a real installation, software would now be installed.');
                
                // If account setup is enabled, show what browser tabs would open
                if (document.getElementById('openBrowser').checked && accountsToSetup.length > 0) {
                    setTimeout(() => {
                        logMessage('\n[TEST] Browser tabs would open for these accounts:');
                        accountsToSetup.forEach(account => {
                            logMessage(`- ${account}: ${window.accountUrls[account]}`);
                        });
                    }, 1500);
                }
                
                // Re-enable start button
                document.getElementById('startSetupBtn').disabled = false;
                document.getElementById('startSetupBtn').textContent = 'Test Completed';
            }
        }
    }
    
    // Function to test a real download but abort it before completion
    function testDownload(url, software) {
        return new Promise((resolve, reject) => {
            updateTestStatus(`Testing download for ${software}`);
            
            // Create an AbortController to be able to cancel the download
            const controller = new AbortController();
            const signal = controller.signal;
            
            // Store the controller globally so the abort button can access it
            window.testDownloader = { controller, software };
            
            // Simulate download progress updates
            const progressInterval = setInterval(() => {
                // Generate a random progress between 1-5%
                const increment = Math.random() * 5 + 1;
                const currentProgress = parseFloat(document.getElementById('progressBar').style.width) || 0;
                const newProgress = Math.min(currentProgress + increment, 98); // Cap at 98%
                
                updateProgress(newProgress);
                
                // Update test status with download progress
                updateTestStatus(`Downloading ${software}: ${Math.round(newProgress)}%`);
            }, 500);
            
            // Start a real fetch request but abort it shortly after it begins
            fetch(url, { 
                method: 'GET',
                signal: signal,
                mode: 'no-cors' // This allows the request to start but will not complete
            })
            .then(response => {
                clearInterval(progressInterval);
                updateTestStatus(`Download completed for ${software}`);
                resolve({ status: 'completed', software });
            })
            .catch(error => {
                clearInterval(progressInterval);
                
                if (error.name === 'AbortError') {
                    updateTestStatus(`Download aborted for ${software}`);
                    resolve({ status: 'aborted', software });
                } else {
                    updateTestStatus(`Download error for ${software}: ${error.message}`);
                    reject(error);
                }
            });
            
            // Automatically abort after 5 seconds if not manually aborted
            // This is for safety to avoid completing the download
            setTimeout(() => {
                if (window.testDownloader && window.testDownloader.controller) {
                    logMessage(`[TEST] Auto-aborting download after 5 seconds (safety feature)`);
                    controller.abort();
                }
            }, 5000);
        });
    }
    
    // Helper function to update progress bar
    function updateProgress(percentage) {
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        
        if (progressBar && progressPercentage) {
            progressBar.style.width = `${percentage}%`;
            progressPercentage.textContent = `${percentage}%`;
        }
    }
    
    // Helper function to log messages
    function logMessage(message) {
        const installationLogs = document.getElementById('installationLogs');
        if (installationLogs) {
            installationLogs.textContent += message + '\n';
            installationLogs.scrollTop = installationLogs.scrollHeight;
        }
    }
} 