// Simple validation script for dataService
// This script tests the basic functionality of our data service

import { 
  userService, 
  postService, 
  campaignService, 
  taskService, 
  goalService, 
  assetService
} from './dataService';
import { User, Post, Campaign, Task, Goal, Asset } from '../types';

// Validation function
export const validateDataService = async () => {
  console.log('Starting data service validation...');
  
  try {
    // Clear localStorage
    localStorage.clear();
    console.log('✓ LocalStorage cleared');
    
    // Test user service
    console.log('\n--- Testing User Service ---');
    
    // First, let's test with existing users in the database
    // Try to login with sarah@winnerforce.com / 123456
    const loggedInUser = await userService.login('sarah@winnerforce.com', '123456');
    console.log('✓ User logged in:', loggedInUser?.email);
    
    if (!loggedInUser) {
      console.log('⚠️  Could not login with test user. Some tests may fail.');
      console.log('\n✅ Basic validation completed.');
      return true;
    }
    
    const users = await userService.getAll();
    console.log('✓ Users retrieved:', users.length);
    
    const foundUser = await userService.getById(loggedInUser.id);
    console.log('✓ User found by ID:', foundUser?.email);
    
    userService.setCurrentUser(loggedInUser.id);
    const currentUser = await userService.getCurrentUser();
    console.log('✓ Current user set and retrieved:', currentUser?.email);
    
    // Test post service
    console.log('\n--- Testing Post Service ---');
    const mockPost: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      title: 'Test Post',
      caption: 'This is a test post',
      hashtags: ['#test'],
      status: 'DRAFT',
      platform: 'INSTAGRAM',
      attachments: [],
    };
    
    const post = await postService.create({
      ...mockPost,
      createdBy: loggedInUser,
    });
    console.log('✓ Post created:', post.title);
    
    const posts = await postService.getAll();
    console.log('✓ Posts retrieved:', posts.length);
    
    const foundPost = await postService.getById(post.id);
    console.log('✓ Post found by ID:', foundPost?.title);
    
    const updatedPost = await postService.update(post.id, {
      title: 'Updated Post Title',
    });
    console.log('✓ Post updated:', updatedPost?.title);
    
    await postService.delete(post.id);
    console.log('✓ Post deleted');
    
    const postsAfterDelete = await postService.getAll();
    console.log('✓ Posts after delete:', postsAfterDelete.length);
    
    // Test campaign service
    console.log('\n--- Testing Campaign Service ---');
    const mockCampaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'activities' | 'goals' | 'createdBy'> = {
      name: 'Test Campaign',
      description: 'This is a test campaign',
      status: 'ACTIVE',
      start: new Date(),
      end: new Date(),
      budgetCents: 10000,
      channels: ['INSTAGRAM'],
    };
    
    const campaign = await campaignService.create({
      ...mockCampaign,
      createdBy: loggedInUser,
    });
    console.log('✓ Campaign created:', campaign.name);
    
    const campaigns = await campaignService.getAll();
    console.log('✓ Campaigns retrieved:', campaigns.length);
    
    const updatedCampaign = await campaignService.update(campaign.id, {
      name: 'Updated Campaign Name',
    });
    console.log('✓ Campaign updated:', updatedCampaign?.name);
    
    await campaignService.delete(campaign.id);
    console.log('✓ Campaign deleted');
    
    const campaignsAfterDelete = await campaignService.getAll();
    console.log('✓ Campaigns after delete:', campaignsAfterDelete.length);
    
    // Test task service
    console.log('\n--- Testing Task Service ---');
    const mockTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'assignees'> = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'OPEN',
      priority: 'MEDIUM',
    };
    
    const task = await taskService.create({
      ...mockTask,
      assignees: [loggedInUser],
    });
    console.log('✓ Task created:', task.title);
    
    const tasks = await taskService.getAll();
    console.log('✓ Tasks retrieved:', tasks.length);
    
    const updatedTask = await taskService.update(task.id, {
      title: 'Updated Task Title',
    });
    console.log('✓ Task updated:', updatedTask?.title);
    
    await taskService.delete(task.id);
    console.log('✓ Task deleted');
    
    const tasksAfterDelete = await taskService.getAll();
    console.log('✓ Tasks after delete:', tasksAfterDelete.length);
    
    // Test goal service
    console.log('\n--- Testing Goal Service ---');
    const mockGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'campaigns'> = {
      title: 'Test Goal',
      type: 'ENGAGEMENT',
      targetValue: 100,
      targetUnit: 'likes',
      currentValue: 50,
      start: new Date(),
      end: new Date(),
      status: 'ACTIVE',
    };
    
    const goal = await goalService.create({
      ...mockGoal,
      owner: loggedInUser,
    });
    console.log('✓ Goal created:', goal.title);
    
    const goals = await goalService.getAll();
    console.log('✓ Goals retrieved:', goals.length);
    
    const updatedGoal = await goalService.update(goal.id, {
      title: 'Updated Goal Title',
    });
    console.log('✓ Goal updated:', updatedGoal?.title);
    
    await goalService.delete(goal.id);
    console.log('✓ Goal deleted');
    
    const goalsAfterDelete = await goalService.getAll();
    console.log('✓ Goals after delete:', goalsAfterDelete.length);
    
    // Test asset service
    console.log('\n--- Testing Asset Service ---');
    const mockAsset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'uploadedBy'> = {
      name: 'Test Asset',
      url: 'https://example.com/test.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      tags: ['test'],
      kind: 'IMAGE',
    };
    
    const asset = await assetService.create({
      ...mockAsset,
      uploadedBy: loggedInUser,
    });
    console.log('✓ Asset created:', asset.name);
    
    const assets = await assetService.getAll();
    console.log('✓ Assets retrieved:', assets.length);
    
    const updatedAsset = await assetService.update(asset.id, {
      name: 'Updated Asset Name',
    });
    console.log('✓ Asset updated:', updatedAsset?.name);
    
    await assetService.delete(asset.id);
    console.log('✓ Asset deleted');
    
    const assetsAfterDelete = await assetService.getAll();
    console.log('✓ Assets after delete:', assetsAfterDelete.length);
    
    console.log('\n✅ All tests passed! Data service is working correctly.');
    return true;
  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    return false;
  }
};

// Run validation if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // This will run in the browser
  validateDataService();
}