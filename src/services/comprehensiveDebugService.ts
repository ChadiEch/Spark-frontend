// Comprehensive debug service to trace the entire login process
import axios from 'axios';
import { authAPI } from './apiService';
import { userService } from './dataService';

// Intercept all axios requests and responses for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('=== AXIOS REQUEST ===');
    console.log('Method:', config.method);
    console.log('URL:', config.url);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    return config;
  },
  (error) => {
    console.log('=== AXIOS REQUEST ERROR ===');
    console.log('Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log('=== AXIOS RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    return response;
  },
  (error) => {
    console.log('=== AXIOS RESPONSE ERROR ===');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

export const comprehensiveDebugService = {
  // Test the complete login flow step by step
  testCompleteLoginFlow: async (email: string, password: string) => {
    console.log('=== COMPREHENSIVE LOGIN DEBUG ===');
    console.log('Starting login flow for:', email);
    
    try {
      // Step 1: Direct API call
      console.log('\n--- STEP 1: Direct API Call ---');
      const apiResponse = await authAPI.login(email, password);
      console.log('API Response:', apiResponse);
      
      // Step 2: Check response structure
      console.log('\n--- STEP 2: Response Structure Analysis ---');
      console.log('Response type:', typeof apiResponse);
      console.log('Response keys:', Object.keys(apiResponse));
      console.log('Response.data type:', typeof apiResponse.data);
      console.log('Response.data keys:', apiResponse.data ? Object.keys(apiResponse.data) : 'N/A');
      
      if (apiResponse.data) {
        console.log('Response.data.data:', apiResponse.data.data);
        console.log('Response.data.data type:', typeof apiResponse.data.data);
        if (apiResponse.data.data) {
          console.log('Response.data.data keys:', Object.keys(apiResponse.data.data));
        }
      }
      
      // Step 3: Test userService login
      console.log('\n--- STEP 3: UserService Login ---');
      const userServiceResponse = await userService.login(email, password);
      console.log('UserService Response:', userServiceResponse);
      
      // Step 4: Check localStorage
      console.log('\n--- STEP 4: LocalStorage Check ---');
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const currentUser = localStorage.getItem('currentUser');
      
      console.log('Token in localStorage:', token ? 'PRESENT' : 'MISSING');
      console.log('RefreshToken in localStorage:', refreshToken ? 'PRESENT' : 'MISSING');
      console.log('CurrentUser in localStorage:', currentUser ? 'PRESENT' : 'MISSING');
      
      if (token) {
        console.log('Token length:', token.length);
      }
      
      return {
        apiResponse,
        userServiceResponse,
        localStorage: { token, refreshToken, currentUser }
      };
    } catch (error) {
      console.log('=== COMPREHENSIVE LOGIN DEBUG ERROR ===');
      console.log('Error:', error);
      throw error;
    }
  },
  
  // Clear all auth data
  clearAllAuthData: () => {
    console.log('=== CLEARING ALL AUTH DATA ===');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    console.log('All auth data cleared');
  },
  
  // Check current auth state
  checkAuthState: () => {
    console.log('=== CHECKING AUTH STATE ===');
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('Token:', token ? 'PRESENT' : 'MISSING');
    console.log('RefreshToken:', refreshToken ? 'PRESENT' : 'MISSING');
    console.log('CurrentUser:', currentUser ? 'PRESENT' : 'MISSING');
    
    return { token, refreshToken, currentUser };
  }
};