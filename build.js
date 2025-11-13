#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');
console.log(`Node.js version: ${process.version}`);

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));
const minorVersion = parseInt(nodeVersion.split('.')[1]);

// Check if Node.js version meets Vite requirements
if (majorVersion < 20 || (majorVersion === 20 && minorVersion < 19)) {
  console.warn('Warning: Node.js version is below 20.19. Vite may not work correctly.');
  console.warn('Current version:', nodeVersion);
}

// Function to check if a file exists and is executable
function isExecutable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Function to try executing a command
function tryExecute(command, options = { stdio: 'inherit' }) {
  console.log(`Attempting: ${command}`);
  try {
    const result = execSync(command, options);
    console.log('Success!');
    return true;
  } catch (error) {
    console.error(`Failed: ${error.message}`);
    return false;
  }
}

// Try multiple approaches
const approaches = [
  // Approach 1: npx vite build
  () => tryExecute('npx vite build'),
  
  // Approach 2: node with vite.js directly
  () => tryExecute('node node_modules/vite/bin/vite.js build'),
  
  // Approach 3: Direct execution of vite binary if it exists and is executable
  () => {
    const viteBinPath = path.join('node_modules', '.bin', 'vite');
    if (fs.existsSync(viteBinPath) && isExecutable(viteBinPath)) {
      return tryExecute(viteBinPath + ' build');
    } else {
      console.log(`Vite binary not found or not executable at: ${viteBinPath}`);
      return false;
    }
  },
  
  // Approach 4: Try with explicit node shebang
  () => {
    const viteBinPath = path.join('node_modules', '.bin', 'vite');
    if (fs.existsSync(viteBinPath)) {
      return tryExecute(`node ${viteBinPath} build`);
    } else {
      console.log(`Vite binary not found at: ${viteBinPath}`);
      return false;
    }
  }
];

// Try each approach
let success = false;
for (let i = 0; i < approaches.length; i++) {
  console.log(`\n--- Attempt ${i + 1}/${approaches.length} ---`);
  if (approaches[i]()) {
    success = true;
    break;
  }
}

if (!success) {
  console.error('\nAll build approaches failed. Exiting with error.');
  process.exit(1);
} else {
  console.log('\nBuild completed successfully!');
}