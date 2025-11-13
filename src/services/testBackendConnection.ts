// Test backend connection for Winnerforce Spark
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api'  // Use relative path with proxy
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    console.log('Backend connection test result:', response.data);
    
    // Check if the backend is running
    if (response.data.success && response.data.data && response.data.data.message === 'OK') {
      console.log('✅ Backend is running and accessible');
      return true;
    } else {
      console.log('❌ Backend is not running properly');
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
};

export const testBackendEndpoints = async () => {
  try {
    console.log('Testing backend endpoints...');
    
    // Test health endpoint
    const healthResponse = await api.get('/health');
    console.log('Health endpoint:', healthResponse.data);
    
    // Test auth endpoints
    try {
      const registerResponse = await api.post('/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });
      console.log('Auth register endpoint:', registerResponse.data);
    } catch (error: any) {
      console.log('Auth register endpoint error (expected without DB):', error.response?.data);
    }
    
    // Test user endpoints
    try {
      const usersResponse = await api.get('/users');
      console.log('Users endpoint:', usersResponse.data);
    } catch (error: any) {
      console.log('Users endpoint error (expected without DB):', error.response?.data);
    }
    
    console.log('✅ Backend endpoint tests completed');
    return true;
  } catch (error) {
    console.error('❌ Backend endpoint tests failed:', error);
    return false;
  }
};

export default testBackendConnection;