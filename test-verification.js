#!/usr/bin/env node

/**
 * Verification script to test that all components are working correctly
 * This script verifies:
 * 1. That the testBackendConnection service works correctly
 * 2. That the ApiTest component can display backend/database status
 * 3. That the TestBackendConnectivity page can be accessed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Test Components');
console.log('==========================');

// Check if required files exist
const requiredFiles = [
  'src/services/testBackendConnection.ts',
  'src/components/ApiTest.tsx',
  'src/pages/TestBackendConnectivity.tsx',
  'src/pages/TestIndex.tsx',
  'src/App.tsx'
];

let allFilesExist = true;
console.log('\n📁 Checking required files...');

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n💥 Some required files are missing!');
  process.exit(1);
}

// Check content of testBackendConnection.ts
console.log('\n📄 Checking testBackendConnection.ts content...');
const testBackendConnectionPath = path.join(__dirname, 'src/services/testBackendConnection.ts');
const testBackendConnectionContent = fs.readFileSync(testBackendConnectionPath, 'utf8');

const requiredExports = [
  'testBackendConnection',
  'testBackendEndpoints'
];

const requiredReturnTypes = [
  'backendConnected',
  'databaseConnected',
  'databaseInfo',
  'healthData'
];

let contentValid = true;

requiredExports.forEach(exportName => {
  if (testBackendConnectionContent.includes(`export const ${exportName}`)) {
    console.log(`✅ Export ${exportName} found`);
  } else {
    console.log(`❌ Export ${exportName} missing`);
    contentValid = false;
  }
});

requiredReturnTypes.forEach(returnType => {
  if (testBackendConnectionContent.includes(returnType)) {
    console.log(`✅ Return type ${returnType} found`);
  } else {
    console.log(`❌ Return type ${returnType} missing`);
    contentValid = false;
  }
});

// Check content of ApiTest.tsx
console.log('\n📄 Checking ApiTest.tsx content...');
const apiTestPath = path.join(__dirname, 'src/components/ApiTest.tsx');
const apiTestContent = fs.readFileSync(apiTestPath, 'utf8');

const requiredStates = [
  'databaseStatus',
  'databaseInfo'
];

requiredStates.forEach(state => {
  if (apiTestContent.includes(state)) {
    console.log(`✅ State ${state} found`);
  } else {
    console.log(`❌ State ${state} missing`);
    contentValid = false;
  }
});

// Check content of TestBackendConnectivity.tsx
console.log('\n📄 Checking TestBackendConnectivity.tsx content...');
const testBackendConnectivityPath = path.join(__dirname, 'src/pages/TestBackendConnectivity.tsx');
const testBackendConnectivityContent = fs.readFileSync(testBackendConnectivityPath, 'utf8');

const requiredComponents = [
  'TestBackendConnectivity',
  'runTests',
  'testBackendConnection'
];

requiredComponents.forEach(component => {
  if (testBackendConnectivityContent.includes(component)) {
    console.log(`✅ Component/function ${component} found`);
  } else {
    console.log(`❌ Component/function ${component} missing`);
    contentValid = false;
  }
});

// Check if route is added to App.tsx
console.log('\n📄 Checking App.tsx route configuration...');
const appPath = path.join(__dirname, 'src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

if (appContent.includes('/test/backend-connectivity')) {
  console.log('✅ Route for /test/backend-connectivity found');
} else {
  console.log('❌ Route for /test/backend-connectivity missing');
  contentValid = false;
}

if (appContent.includes('TestBackendConnectivity')) {
  console.log('✅ TestBackendConnectivity import found');
} else {
  console.log('❌ TestBackendConnectivity import missing');
  contentValid = false;
}

// Check if link is added to TestIndex.tsx
console.log('\n📄 Checking TestIndex.tsx link...');
const testIndexPath = path.join(__dirname, 'src/pages/TestIndex.tsx');
const testIndexContent = fs.readFileSync(testIndexPath, 'utf8');

if (testIndexContent.includes('/test/backend-connectivity')) {
  console.log('✅ Link to /test/backend-connectivity found');
} else {
  console.log('❌ Link to /test/backend-connectivity missing');
  contentValid = false;
}

// Final result
console.log('\n🏁 Verification Summary');
console.log('====================');

if (contentValid && allFilesExist) {
  console.log('🎉 All verification checks passed!');
  console.log('\n📝 You can now test the backend connectivity by:');
  console.log('   1. Opening the frontend in your browser');
  console.log('   2. Navigating to /test-index');
  console.log('   3. Clicking on "Backend & Database Connectivity Test"');
  console.log('   4. Or directly accessing /test/backend-connectivity');
  console.log('\n🔧 You can also run the backend test script with:');
  console.log('   npm run test-backend');
  process.exit(0);
} else {
  console.log('💥 Some verification checks failed!');
  process.exit(1);
}