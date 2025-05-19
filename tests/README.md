# Installation Tests

This directory contains test scripts for the Developer Setup Tool. These tests allow you to safely verify that the installation process works correctly without actually installing software on your system.

## Available Tests

- `test_setup.html` - A test version of the setup tool that safely tests real downloads without installing anything
- `test_installer.js` - The test implementation that intercepts downloads and provides abort functionality

## How to Run the Tests

1. Open the `test_setup.html` file in your web browser
2. Select your operating system and software to install
3. Click "Start Test Download" to begin the test
4. Watch as the download process begins and automatically aborts after 5 seconds
5. You can also manually abort a download using the "Abort Download" button that appears

## Safety Features

These tests include several safety features:

- All downloads are automatically aborted after 5 seconds
- A manual abort button is provided to stop downloads at any time
- Real download URLs are tested but installations never complete
- Visual indicators clearly show you're in test mode

## What This Tests

Running these tests verifies:

1. That the correct download URLs work for each selected software
2. That the installation logic handles downloads properly
3. That error handling works as expected
4. That abort functionality works correctly

## After Testing

After confirming the tests work as expected, you can run the actual installer by:

1. Opening the main `setup.html` file
2. Selecting your desired options
3. Starting the installation process

Remember that the actual installer will download and install software on your system, unlike these tests which abort before completing downloads. 