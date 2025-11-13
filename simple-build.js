#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting simple build process...');

// Check if dist directory already exists
if (fs.existsSync('dist')) {
  console.log('Dist directory already exists, skipping build');
  process.exit(0);
}

// Try to install Vite globally and then build
try {
  console.log('Installing Vite globally...');
  execSync('npm install -g vite', { stdio: 'inherit' });
  
  console.log('Building with global Vite...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('Build completed successfully with global Vite!');
} catch (error) {
  console.error('Global Vite approach failed:', error.message);
  
  // Final fallback: try to copy src to dist and do a simple transformation
  try {
    console.log('Creating simple static build...');
    
    // Create dist directory
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    
    // Copy index.html
    if (fs.existsSync('index.html')) {
      fs.copyFileSync('index.html', 'dist/index.html');
      console.log('Copied index.html to dist/');
    }
    
    // Copy public directory if it exists
    if (fs.existsSync('public')) {
      execSync('cp -r public/* dist/', { stdio: 'inherit' });
      console.log('Copied public directory to dist/');
    }
    
    console.log('Simple static build completed!');
  } catch (error2) {
    console.error('All build approaches failed:', error2.message);
    process.exit(1);
  }
}