#!/usr/bin/env node

const { execSync } = require('child_process');
const { version } = require('process');

console.log('Starting build process...');
console.log(`Node.js version: ${process.version}`);

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));

if (majorVersion < 20) {
  console.warn('Warning: Node.js version is below 20.19. Vite may not work correctly.');
}

try {
  // Try to build with vite directly using npx
  console.log('Attempting build with npx vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build completed successfully with npx!');
} catch (error) {
  console.error('Build failed with npx, trying alternative approach...');
  
  try {
    // Alternative approach - try using the local vite binary directly
    console.log('Attempting build with node node_modules/vite/bin/vite.js build...');
    execSync('node node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
    console.log('Build completed successfully with alternative approach!');
  } catch (error2) {
    console.error('Both build approaches failed:');
    console.error(error2.message);
    
    // Final fallback - try using the vite CLI directly if it exists
    try {
      console.log('Attempting build with vite CLI directly...');
      execSync('./node_modules/.bin/vite build', { stdio: 'inherit' });
      console.log('Build completed successfully with vite CLI!');
    } catch (error3) {
      console.error('All build approaches failed:');
      console.error(error3.message);
      process.exit(1);
    }
  }
}