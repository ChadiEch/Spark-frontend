// Simple test script to check authentication flow
import axios from 'axios';

// Test the authentication endpoint directly
const testAuthEndpoint = async () => {
  try {
    console.log('=== TESTING AUTHENTICATION ENDPOINT ===\n');
    
    // Test the /api/auth/me endpoint
    console.log('Testing /api/auth/me endpoint...');
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    console.log('Using API base URL:', API_BASE_URL);
    
    // First check if we can reach the server
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      console.log('✅ Server health check successful:', healthResponse.data);
    } catch (error: any) {
      console.log('❌ Server health check failed:', error.message);
      return;
    }
    
    // Try to access the auth/me endpoint without a token (should fail)
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, { 
        timeout: 5000,
        withCredentials: true
      });
      console.log('Response:', response.data);
    } catch (error: any) {
      if (error.response) {
        console.log('Expected unauthorized response:', error.response.status, error.response.data);
      } else {
        console.log('Network error:', error.message);
      }
    }
    
    console.log('\n=== AUTHENTICATION ENDPOINT TEST COMPLETE ===');
  } catch (error: any) {
    console.error('Error during test:', error);
  }
};

testAuthEndpoint();