#!/usr/bin/env node

// Script to prepare the project for separate Railway deployment
const fs = require('fs');
const path = require('path');

console.log('Preparing project for Railway deployment...');

// Rename railway.frontend.toml to railway.toml in root directory
const frontendRailwayToml = path.join(__dirname, '..', 'railway.frontend.toml');
const rootRailwayToml = path.join(__dirname, '..', 'railway.toml');

if (fs.existsSync(frontendRailwayToml)) {
  fs.renameSync(frontendRailwayToml, rootRailwayToml);
  console.log('✓ Renamed railway.frontend.toml to railway.toml in root directory');
}

// Rename railway.backend.toml to railway.toml in server directory
const backendRailwayToml = path.join(__dirname, '..', 'server', 'railway.backend.toml');
const serverRailwayToml = path.join(__dirname, '..', 'server', 'railway.toml');

if (fs.existsSync(backendRailwayToml)) {
  fs.renameSync(backendRailwayToml, serverRailwayToml);
  console.log('✓ Renamed railway.backend.toml to railway.toml in server directory');
}

// Rename frontend.package.json to package.json in root directory
const frontendPackageJson = path.join(__dirname, '..', 'frontend.package.json');
const rootPackageJson = path.join(__dirname, '..', 'package.json');

if (fs.existsSync(frontendPackageJson)) {
  fs.renameSync(frontendPackageJson, rootPackageJson);
  console.log('✓ Updated package.json in root directory');
}

// Rename deployment.package.json to package.json in server directory
const deploymentPackageJson = path.join(__dirname, '..', 'server', 'deployment.package.json');
const serverPackageJson = path.join(__dirname, '..', 'server', 'package.json');

if (fs.existsSync(deploymentPackageJson)) {
  fs.renameSync(deploymentPackageJson, serverPackageJson);
  console.log('✓ Updated package.json in server directory');
}

console.log('\nDeployment preparation complete!');
console.log('\nNext steps:');
console.log('1. For frontend deployment:');
console.log('   - Deploy the root directory to Railway');
console.log('   - Set VITE_API_URL environment variable to your backend URL');
console.log('\n2. For backend deployment:');
console.log('   - Deploy the server directory to Railway');
console.log('   - Add a MongoDB database service');
console.log('   - Set required environment variables (MONGO_URI, JWT_SECRET, etc.)');
console.log('\nSee RAILWAY_DEPLOYMENT.md for detailed instructions.');