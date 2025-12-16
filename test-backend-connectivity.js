#!/usr/bin/env node

/**
 * Simple script to test backend and database connectivity
 * Usage: node test-backend-connectivity.js
 */

const https = require('https');
const http = require('http');

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8083';
const HEALTH_ENDPOINT = '/api/health';

console.log('🔍 Testing Backend & Database Connectivity');
console.log('========================================');
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log(`Health Endpoint: ${HEALTH_ENDPOINT}`);
console.log('');

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    
    const req = lib.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Main test function
async function testConnectivity() {
  try {
    console.log('📡 Testing backend connectivity through frontend proxy...');
    
    const healthUrl = `${FRONTEND_URL}${HEALTH_ENDPOINT}`;
    console.log(`🔗 Checking: ${healthUrl}`);
    
    const response = await makeRequest(healthUrl);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ Backend is reachable through frontend proxy');
      
      // Check database connectivity
      const healthData = response.data.data;
      if (healthData && healthData.database) {
        const dbInfo = healthData.database;
        if (dbInfo.status === 'connected') {
          console.log('✅ Database is connected');
          console.log(`   Host: ${dbInfo.host}`);
          console.log(`   Name: ${dbInfo.name}`);
          console.log(`   Port: ${dbInfo.port}`);
          if (dbInfo.ping) {
            console.log(`   Ping: ${dbInfo.ping}`);
          }
        } else {
          console.log('⚠️  Database is not connected');
          console.log(`   Status: ${dbInfo.status}`);
          if (dbInfo.message) {
            console.log(`   Message: ${dbInfo.message}`);
          }
        }
      }
      
      // Display additional info
      console.log('');
      console.log('📊 Backend Information:');
      console.log(`   Uptime: ${Math.floor(healthData.uptime)} seconds`);
      console.log(`   Platform: ${healthData.platform?.platform}`);
      console.log(`   Architecture: ${healthData.platform?.arch}`);
      
      return true;
    } else {
      console.log('❌ Backend is not responding correctly');
      console.log(`   Status Code: ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to connect to backend');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Run the test
testConnectivity()
  .then((success) => {
    console.log('');
    if (success) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('💥 Some tests failed!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.log('💥 Unexpected error occurred:');
    console.log(`   ${error.message}`);
    process.exit(1);
  });