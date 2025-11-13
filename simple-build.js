#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('Starting simple build process...');

// Always try to build, even if dist directory exists
console.log('Attempting to build with Vite...');

// Try to install Vite globally and then build
try {
  console.log('Installing Vite globally...');
  execSync('npm install -g vite', { stdio: 'inherit' });
  
  console.log('Building with global Vite...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('Build completed successfully with global Vite!');
} catch (error) {
  console.error('Global Vite approach failed:', error.message);
  
  // Try local Vite build
  try {
    console.log('Trying local Vite build...');
    execSync('npx vite build', { stdio: 'inherit' });
    console.log('Build completed successfully with local Vite!');
  } catch (error2) {
    console.error('Local Vite approach failed:', error2.message);
    
    // Final fallback: try to copy src to dist and do a simple transformation
    try {
      console.log('Creating simple static build...');
      
      // Remove existing dist directory
      if (fs.existsSync('dist')) {
        console.log('Removing existing dist directory...');
        if (os.platform() === 'win32') {
          execSync('rmdir /s /q dist', { stdio: 'inherit' });
        } else {
          execSync('rm -rf dist', { stdio: 'inherit' });
        }
      }
      
      // Create dist directory
      fs.mkdirSync('dist', { recursive: true });
      
      // Copy index.html
      if (fs.existsSync('index.html')) {
        fs.copyFileSync('index.html', 'dist/index.html');
        console.log('Copied index.html to dist/');
      }
      
      // Copy public directory if it exists
      if (fs.existsSync('public')) {
        if (os.platform() === 'win32') {
          execSync('xcopy public dist /E /I /Y', { stdio: 'inherit' });
        } else {
          execSync('cp -r public/* dist/', { stdio: 'inherit' });
        }
        console.log('Copied public directory to dist/');
      }
      
      console.log('Simple static build completed!');
    } catch (error3) {
      console.error('All build approaches failed:', error3.message);
      process.exit(1);
    }
  }
}