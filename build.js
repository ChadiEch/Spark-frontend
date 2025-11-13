#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Starting build process...');

try {
  // Try to build with vite directly
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed with npx, trying alternative approach...');
  
  try {
    // Alternative approach - try using the local vite binary directly
    execSync('node node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
    console.log('Build completed successfully with alternative approach!');
  } catch (error2) {
    console.error('Both build approaches failed:');
    console.error(error2.message);
    process.exit(1);
  }
}