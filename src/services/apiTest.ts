// API Test Service for Winnerforce Spark
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api'  // Use relative path with proxy
  : '/api';

// Create axios instance for testing
const apiTest = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000 // Add timeout to prevent hanging
});

export const testAPIConnection = async (): Promise<boolean> => {
  try {
    const response = await apiTest.get('/health');
    console.log('API Connection Test Result:', response.data);
    return response.data.success === true;
  } catch (error) {
    console.error('API Connection Test Failed:', error);
    return false;
  }
};

export default apiTest;