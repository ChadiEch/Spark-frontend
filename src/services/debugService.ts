// Debug service to help troubleshoot authentication issues
import { authAPI } from './apiService';
import { userService } from './dataService';

export const debugAuthService = {
  // Test direct API call
  testDirectAPILogin: async (email: string, password: string) => {
    console.log('=== DEBUG: Direct API Login Test ===');
    console.log('Email:', email);
    console.log('Password:', password ? '****' : 'EMPTY');
    
    try {
      console.log('Calling authAPI.login...');
      const response = await authAPI.login(email, password);
      console.log('Direct API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data?.data);
      return response;
    } catch (error: any) {
      console.log('Direct API Error:', error);
      console.log('Error response:', error.response);
      console.log('Error message:', error.message);
      throw error;
    }
  },
  
  // Test userService login
  testUserServiceLogin: async (email: string, password: string) => {
    console.log('=== DEBUG: UserService Login Test ===');
    console.log('Email:', email);
    console.log('Password:', password ? '****' : 'EMPTY');
    
    try {
      console.log('Calling userService.login...');
      const result = await userService.login(email, password);
      console.log('UserService Result:', result);
      return result;
    } catch (error: any) {
      console.log('UserService Error:', error);
      console.log('Error message:', error.message);
      throw error;
    }
  },
  
  // Check localStorage
  checkLocalStorage: () => {
    console.log('=== DEBUG: LocalStorage Check ===');
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('Token:', token ? 'PRESENT' : 'MISSING');
    console.log('Refresh Token:', refreshToken ? 'PRESENT' : 'MISSING');
    console.log('Current User:', currentUser ? 'PRESENT' : 'MISSING');
    
    if (token) {
      console.log('Token length:', token.length);
    }
    
    return { token, refreshToken, currentUser };
  },
  
  // Clear auth data
  clearAuthData: () => {
    console.log('=== DEBUG: Clearing Auth Data ===');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    console.log('Auth data cleared');
  }
};