// Test API Integration for Winnerforce Spark
import { userAPI, postAPI, campaignAPI, taskAPI, goalAPI, assetAPI } from './apiService';

export const testAllAPIEndpoints = async () => {
  console.log('Testing API endpoints...');
  
  try {
    // Test user API
    console.log('Testing user API...');
    const usersResponse = await userAPI.getAll();
    console.log('Users API response:', usersResponse.data);
    
    // Test post API
    console.log('Testing post API...');
    const postsResponse = await postAPI.getAll();
    console.log('Posts API response:', postsResponse.data);
    
    // Test campaign API
    console.log('Testing campaign API...');
    const campaignsResponse = await campaignAPI.getAll();
    console.log('Campaigns API response:', campaignsResponse.data);
    
    // Test task API
    console.log('Testing task API...');
    const tasksResponse = await taskAPI.getAll();
    console.log('Tasks API response:', tasksResponse.data);
    
    // Test goal API
    console.log('Testing goal API...');
    const goalsResponse = await goalAPI.getAll();
    console.log('Goals API response:', goalsResponse.data);
    
    // Test asset API
    console.log('Testing asset API...');
    const assetsResponse = await assetAPI.getAll();
    console.log('Assets API response:', assetsResponse.data);
    
    console.log('All API tests completed successfully!');
    return true;
  } catch (error) {
    console.error('API test failed:', error);
    return false;
  }
};

export default testAllAPIEndpoints;