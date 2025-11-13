// Data service for Winnerforce Marketing Platform
// This service handles data persistence using our backend API
import { 
  User, Goal, Campaign, Ambassador, Post, Task, Asset, Activity, 
  KPICard, CalendarEvent, ProgressSnapshot, Role, Billing, Invoice
} from '../types';
import { 
  authAPI, 
  userAPI, 
  postAPI, 
  campaignAPI, 
  taskAPI, 
  goalAPI, 
  assetAPI, 
  ambassadorAPI, 
  activityAPI,
  analyticsAPI,
  billingAPI,
  securityAPI,
  notificationAPI,
  searchAPI,
  exportAPI
} from './apiService';
import { handleApiError, showSuccessMessage } from '../lib/errorUtils';
import { integrationService } from './integrationService';
import { simpleTaskService } from './simpleTaskService';

// For now, we'll keep the localStorage keys for backwards compatibility
// but we'll implement actual API calls
const STORAGE_KEYS = {
  USERS: 'winnerforce_users',
  GOALS: 'winnerforce_goals',
  CAMPAIGNS: 'winnerforce_campaigns',
  AMBASSADORS: 'winnerforce_ambassadors',
  POSTS: 'winnerforce_posts',
  TASKS: 'winnerforce_tasks',
  ASSETS: 'winnerforce_assets',
  ACTIVITIES: 'winnerforce_activities',
  CURRENT_USER: 'winnerforce_current_user'
};

// Always use API
export const useAPI = () => {
  return true;
};

export const testAndSetAPIAvailability = async (): Promise<boolean> => {
  try {
    // Test if the API is available by checking the health endpoint
    const response = await fetch('/api/health', { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't send credentials for this test
      credentials: 'omit'
    });
    
    if (response.ok) {
      const data = await response.json();
      // Check if the backend is running
      if (data.success && data.data && data.data.message === 'OK') {
        console.log('✅ API is available');
        return true;
      }
    }
    
    console.log('❌ API is not available');
    return false;
  } catch (error) {
    console.error('❌ API availability test failed:', error);
    return false;
  }
};

// User service
export const userService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string; startDate?: string; endDate?: string }): Promise<User[]> => {
    try {
      const response = await userAPI.getAll(params);
      let data = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      
      // Convert _id to id for MongoDB compatibility
      data = data.map(item => {
        if (item && item._id && !item.id) {
          return { ...item, id: item._id };
        }
        return item;
      });
      
      return data;
    } catch (error) {
      console.error('Error in userService.getAll:', error);
      return []; // Return empty array instead of throwing error
    }
  },
  
  getById: async (id: string): Promise<User | undefined> => {
    try {
      const response = await userAPI.getById(id);
      let rawData = response.data && (response.data as any).data ? (response.data as any).data : undefined;
      
      // Convert _id to id for MongoDB compatibility
      if (rawData && rawData._id && !rawData.id) {
        return { ...rawData, id: rawData._id };
      }
      
      return rawData;
    } catch (error) {
      console.error('Error in userService.getById:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await authAPI.getMe();
      if (response.data && response.data.data && response.data.data.user) {
        return response.data.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error in userService.getCurrentUser:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  setCurrentUser: (userId: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    } catch (error) {
      console.error('Error in userService.setCurrentUser:', error);
    }
  },
  
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      console.log('DataService: Attempting API login with', { email });
      // Always use API for authentication
      const response = await authAPI.login(email, password);
      console.log('DataService: API login response', response);
      
      // Handle the actual response structure from the API
      // The API returns { success: true, token, refreshToken, user } (no nested data)
      // We need to access these properties directly, not through response.data.data
      const apiResponse = response.data as any;
      
      if (apiResponse && apiResponse.token) {
        console.log('DataService: Storing token in localStorage');
        localStorage.setItem('token', apiResponse.token);
      }
      if (apiResponse && apiResponse.refreshToken) {
        console.log('DataService: Storing refresh token in localStorage');
        localStorage.setItem('refreshToken', apiResponse.refreshToken);
      }
      if (apiResponse && apiResponse.user) {
        console.log('DataService: Storing user in localStorage', apiResponse.user);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, apiResponse.user.id);
        return apiResponse.user;
      }
      console.log('DataService: Login failed - no token or user in response');
      return null;
    } catch (error: any) {
      console.log('DataService: Login error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // For API authentication failures (401 errors), don't fall back to localStorage
      if (error.response && error.response.status === 401) {
        console.error('DataService: Login failed:', error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Invalid email or password');
      }
      
      // For network errors or API unavailability, show appropriate error
      console.error('DataService: API login failed:', error);
      throw new Error('Network error: Please check your internet connection and ensure the backend server is running');
    }
  },
  
  logout: (): void => {
    try {
      // Always call API logout
      authAPI.logout().catch(error => {
        console.error('Error during API logout:', error);
      });
    } catch (error) {
      console.error('Error in userService.logout:', error);
    }
    
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error removing localStorage items:', error);
    }
  },
  
  register: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> => {
    try {
      // Always use API for registration
      const registerData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role
      };
      
      // Use authAPI.register instead of userAPI.create for registration
      const response = await authAPI.register(registerData);
      // The backend returns the user in response.data.user for authAPI (no nested data)
      const apiResponse = response.data as any;
      let newUser = apiResponse?.user ? apiResponse.user : undefined;
      
      // Store token if provided
      if (apiResponse?.token) {
        localStorage.setItem('token', apiResponse.token);
      }
      
      // Store refresh token if provided
      if (apiResponse?.refreshToken) {
        localStorage.setItem('refreshToken', apiResponse.refreshToken);
      }
      
      // Convert _id to id for MongoDB compatibility
      if (newUser && (newUser as any)._id && !newUser.id) {
        newUser = { ...newUser, id: (newUser as any)._id };
      }
      
      // Store user ID in localStorage
      if (newUser?.id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newUser.id);
      }
      
      return newUser;
    } catch (error) {
      console.error('Error in userService.register:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  update: async (id: string, userData: Partial<User>): Promise<User | null> => {
    try {
      // Always use API for updating user
      const response = await userAPI.update(id, userData);
      let updatedUser = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedUser && (updatedUser as any)._id && !updatedUser.id) {
        updatedUser = { ...updatedUser, id: (updatedUser as any)._id };
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Error in userService.update:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      // Always use API for deleting user
      const response = await userAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      console.error('Error in userService.delete:', error);
      return false; // Return false instead of throwing error
    }
  },
  
  updateRole: async (id: string, role: string): Promise<User | null> => {
    try {
      // Always use API for updating user role
      const response = await userAPI.updateRole(id, { role });
      let updatedUser = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedUser && (updatedUser as any)._id && !updatedUser.id) {
        updatedUser = { ...updatedUser, id: (updatedUser as any)._id };
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Error in userService.updateRole:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  getRoleStats: async (): Promise<{ role: string; count: number }[]> => {
    try {
      // Always use API for getting role stats
      const response = await userAPI.getRoleStats();
      return response.data?.data || [];
    } catch (error) {
      console.error('Error in userService.getRoleStats:', error);
      return []; // Return empty array instead of throwing error
    }
  }
};

// Post service
export const postService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; creator?: string; startDate?: string; endDate?: string }): Promise<Post[]> => {
    try {
      const response = await postAPI.getAll(params);
      let data = response.data?.data || [];
      
      // Convert _id to id for MongoDB compatibility
      data = data.map(item => {
        if (item && (item as any)._id && !item.id) {
          return { ...item, id: (item as any)._id };
        }
        return item;
      });
      
      return data;
    } catch (error) {
      console.error('Error in postService.getAll:', error);
      return []; // Return empty array instead of throwing error
    }
  },
  
  getById: async (id: string): Promise<Post | undefined> => {
    try {
      const response = await postAPI.getById(id);
      let rawData = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (rawData && (rawData as any)._id && !rawData.id) {
        return { ...rawData, id: (rawData as any)._id };
      }
      
      return rawData;
    } catch (error) {
      console.error('Error in postService.getById:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  create: async (postData: Partial<Post>): Promise<Post> => {
    try {
      const response = await postAPI.create(postData);
      let newPost = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (newPost && (newPost as any)._id && !newPost.id) {
        newPost = { ...newPost, id: (newPost as any)._id };
      }
      
      return newPost;
    } catch (error) {
      console.error('Error in postService.create:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  update: async (id: string, postData: Partial<Post>): Promise<Post | null> => {
    try {
      const response = await postAPI.update(id, postData);
      let updatedPost = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedPost && (updatedPost as any)._id && !updatedPost.id) {
        updatedPost = { ...updatedPost, id: (updatedPost as any)._id };
      }
      
      return updatedPost;
    } catch (error) {
      console.error('Error in postService.update:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await postAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      console.error('Error in postService.delete:', error);
      return false; // Return false instead of throwing error
    }
  }
};

// Campaign service
export const campaignService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; creator?: string; startDate?: string; endDate?: string }): Promise<Campaign[]> => {
    try {
      const response = await campaignAPI.getAll(params);
      let data = response.data?.data || [];
      
      // Convert _id to id for MongoDB compatibility
      data = data.map(item => {
        if (item && (item as any)._id && !item.id) {
          return { ...item, id: (item as any)._id };
        }
        return item;
      });
      
      return data;
    } catch (error) {
      console.error('Error in campaignService.getAll:', error);
      return []; // Return empty array instead of throwing error
    }
  },
  
  getById: async (id: string): Promise<Campaign | undefined> => {
    try {
      const response = await campaignAPI.getById(id);
      let rawData = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (rawData && (rawData as any)._id && !rawData.id) {
        return { ...rawData, id: (rawData as any)._id };
      }
      
      return rawData;
    } catch (error) {
      console.error('Error in campaignService.getById:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  create: async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    try {
      const response = await campaignAPI.create(campaignData);
      let newCampaign = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (newCampaign && (newCampaign as any)._id && !newCampaign.id) {
        newCampaign = { ...newCampaign, id: (newCampaign as any)._id };
      }
      
      return newCampaign;
    } catch (error) {
      console.error('Error in campaignService.create:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  update: async (id: string, campaignData: Partial<Campaign>): Promise<Campaign | null> => {
    try {
      const response = await campaignAPI.update(id, campaignData);
      let updatedCampaign = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedCampaign && (updatedCampaign as any)._id && !updatedCampaign.id) {
        updatedCampaign = { ...updatedCampaign, id: (updatedCampaign as any)._id };
      }
      
      return updatedCampaign;
    } catch (error) {
      console.error('Error in campaignService.update:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await campaignAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      console.error('Error in campaignService.delete:', error);
      return false; // Return false instead of throwing error
    }
  }
};

// Task service
export const taskService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; priority?: string; assignee?: string; startDate?: string; endDate?: string }): Promise<Task[]> => {
    try {
      // Use the simple task service which handles API calls
      return await simpleTaskService.getAll(params);
    } catch (error) {
      console.error('Error in taskService.getAll:', error);
      return []; // Return empty array instead of throwing error
    }
  },
  
  getById: async (id: string): Promise<Task | undefined> => {
    try {
      // Use the simple task service which handles API calls
      return await simpleTaskService.getById(id);
    } catch (error) {
      console.error('Error in taskService.getById:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  create: async (taskData: Partial<Task>): Promise<Task> => {
    try {
      // Use the simple task service which handles API calls
      return await simpleTaskService.create(taskData as any);
    } catch (error) {
      console.error('Error in taskService.create:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  update: async (id: string, taskData: Partial<Task>): Promise<Task | null> => {
    try {
      // Use the simple task service which handles API calls
      return await simpleTaskService.update(id, taskData);
    } catch (error) {
      console.error('Error in taskService.update:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      // Use the simple task service which handles API calls
      return await simpleTaskService.delete(id);
    } catch (error) {
      console.error('Error in taskService.delete:', error);
      return false; // Return false instead of throwing error
    }
  },
  
  // Trash functionality
  trash: async (id: string): Promise<boolean> => {
    try {
      // Use the simple task service which handles API calls
      const result = await simpleTaskService.trash(id);
      return result !== null;
    } catch (error) {
      console.error('Error in taskService.trash:', error);
      return false; // Return false instead of throwing error
    }
  },
  
  restore: async (id: string): Promise<boolean> => {
    try {
      // Use the simple task service which handles API calls
      const result = await simpleTaskService.restore(id);
      return result !== null;
    } catch (error) {
      console.error('Error in taskService.restore:', error);
      return false; // Return false instead of throwing error
    }
  },
  
  getTrashed: async (params?: { page?: number; limit?: number }): Promise<Task[]> => {
    try {
      // Use the simple task service which handles API calls
      return await simpleTaskService.getTrashed(params);
    } catch (error) {
      console.error('Error in taskService.getTrashed:', error);
      return []; // Return empty array instead of throwing error
    }
  }
};

// Goal service
export const goalService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; owner?: string; startDate?: string; endDate?: string }): Promise<Goal[]> => {
    try {
      const response = await goalAPI.getAll(params);
      let data = response.data?.data || [];
      
      // Convert _id to id for MongoDB compatibility
      data = data.map(item => {
        if (item && (item as any)._id && !item.id) {
          return { ...item, id: (item as any)._id };
        }
        return item;
      });
      
      return data;
    } catch (error) {
      console.error('Error in goalService.getAll:', error);
      return []; // Return empty array instead of throwing error
    }
  },
  
  getById: async (id: string): Promise<Goal | undefined> => {
    try {
      const response = await goalAPI.getById(id);
      let rawData = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (rawData && (rawData as any)._id && !rawData.id) {
        return { ...rawData, id: (rawData as any)._id };
      }
      
      return rawData;
    } catch (error) {
      console.error('Error in goalService.getById:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  create: async (goalData: Partial<Goal>): Promise<Goal> => {
    try {
      const response = await goalAPI.create(goalData);
      let newGoal = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (newGoal && (newGoal as any)._id && !newGoal.id) {
        newGoal = { ...newGoal, id: (newGoal as any)._id };
      }
      
      return newGoal;
    } catch (error) {
      console.error('Error in goalService.create:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  update: async (id: string, goalData: Partial<Goal>): Promise<Goal | null> => {
    try {
      const response = await goalAPI.update(id, goalData);
      let updatedGoal = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedGoal && (updatedGoal as any)._id && !updatedGoal.id) {
        updatedGoal = { ...updatedGoal, id: (updatedGoal as any)._id };
      }
      
      return updatedGoal;
    } catch (error) {
      console.error('Error in goalService.update:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await goalAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      console.error('Error in goalService.delete:', error);
      return false; // Return false instead of throwing error
    }
  }
};

// Asset service
export const assetService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; kind?: string; uploader?: string; startDate?: string; endDate?: string }): Promise<Asset[]> => {
    try {
      const response = await assetAPI.getAll(params);
      let data = response.data?.data || [];
      
      // Convert _id to id for MongoDB compatibility
      data = data.map(item => {
        if (item && (item as any)._id && !item.id) {
          return { ...item, id: (item as any)._id };
        }
        return item;
      });
      
      return data;
    } catch (error) {
      console.error('Error in assetService.getAll:', error);
      return []; // Return empty array instead of throwing error
    }
  },
  
  getById: async (id: string): Promise<Asset | undefined> => {
    try {
      const response = await assetAPI.getById(id);
      let rawData = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (rawData && (rawData as any)._id && !rawData.id) {
        return { ...rawData, id: (rawData as any)._id };
      }
      
      return rawData;
    } catch (error) {
      console.error('Error in assetService.getById:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  create: async (assetData: Partial<Asset>): Promise<Asset> => {
    try {
      const response = await assetAPI.create(assetData);
      let newAsset = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (newAsset && (newAsset as any)._id && !newAsset.id) {
        newAsset = { ...newAsset, id: (newAsset as any)._id };
      }
      
      return newAsset;
    } catch (error) {
      console.error('Error in assetService.create:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  update: async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      const response = await assetAPI.update(id, assetData);
      let updatedAsset = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedAsset && (updatedAsset as any)._id && !updatedAsset.id) {
        updatedAsset = { ...updatedAsset, id: (updatedAsset as any)._id };
      }
      
      return updatedAsset;
    } catch (error) {
      console.error('Error in assetService.update:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await assetAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      console.error('Error in assetService.delete:', error);
      return false; // Return false instead of throwing error
    }
  },
  
  upload: async (file: File): Promise<Asset> => {
    try {
      const response = await assetAPI.upload(file);
      let newAsset = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (newAsset && (newAsset as any)._id && !newAsset.id) {
        newAsset = { ...newAsset, id: (newAsset as any)._id };
      }
      
      return newAsset;
    } catch (error) {
      console.error('Error in assetService.upload:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }
};

// Ambassador service
export const ambassadorService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }): Promise<Ambassador[]> => {
    try {
      const response = await ambassadorAPI.getAll(params);
      let data = response.data?.data || [];
      
      // Convert _id to id for MongoDB compatibility
      data = data.map(item => {
        if (item && (item as any)._id && !item.id) {
          return { ...item, id: (item as any)._id };
        }
        return item;
      });
      
      return data;
    } catch (error) {
      console.error('Error in ambassadorService.getAll:', error);
      return []; // Return empty array instead of throwing error
    }
  },
  
  getById: async (id: string): Promise<Ambassador | undefined> => {
    try {
      const response = await ambassadorAPI.getById(id);
      let rawData = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (rawData && (rawData as any)._id && !rawData.id) {
        return { ...rawData, id: (rawData as any)._id };
      }
      
      return rawData;
    } catch (error) {
      console.error('Error in ambassadorService.getById:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  create: async (ambassadorData: Partial<Ambassador>): Promise<Ambassador> => {
    try {
      const response = await ambassadorAPI.create(ambassadorData);
      let newAmbassador = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (newAmbassador && (newAmbassador as any)._id && !newAmbassador.id) {
        newAmbassador = { ...newAmbassador, id: (newAmbassador as any)._id };
      }
      
      return newAmbassador;
    } catch (error) {
      console.error('Error in ambassadorService.create:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  update: async (id: string, ambassadorData: Partial<Ambassador>): Promise<Ambassador | null> => {
    try {
      const response = await ambassadorAPI.update(id, ambassadorData);
      let updatedAmbassador = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedAmbassador && (updatedAmbassador as any)._id && !updatedAmbassador.id) {
        updatedAmbassador = { ...updatedAmbassador, id: (updatedAmbassador as any)._id };
      }
      
      return updatedAmbassador;
    } catch (error) {
      console.error('Error in ambassadorService.update:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await ambassadorAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      console.error('Error in ambassadorService.delete:', error);
      return false; // Return false instead of throwing error
    }
  }
};

// Activity service
export const activityService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; type?: string; campaign?: string; goal?: string }): Promise<Activity[]> => {
    try {
      const response = await activityAPI.getAll(params);
      let data = response.data?.data || [];
      
      // Convert _id to id for MongoDB compatibility
      data = data.map(item => {
        if (item && (item as any)._id && !item.id) {
          return { ...item, id: (item as any)._id };
        }
        return item;
      });
      
      return data;
    } catch (error) {
      console.error('Error in activityService.getAll:', error);
      return []; // Return empty array instead of throwing error
    }
  },
  
  getById: async (id: string): Promise<Activity | undefined> => {
    try {
      const response = await activityAPI.getById(id);
      let rawData = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (rawData && (rawData as any)._id && !rawData.id) {
        return { ...rawData, id: (rawData as any)._id };
      }
      
      return rawData;
    } catch (error) {
      console.error('Error in activityService.getById:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  create: async (activityData: Partial<Activity>): Promise<Activity> => {
    try {
      const response = await activityAPI.create(activityData);
      let newActivity = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (newActivity && (newActivity as any)._id && !newActivity.id) {
        newActivity = { ...newActivity, id: (newActivity as any)._id };
      }
      
      return newActivity;
    } catch (error) {
      console.error('Error in activityService.create:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  update: async (id: string, activityData: Partial<Activity>): Promise<Activity | null> => {
    try {
      const response = await activityAPI.update(id, activityData);
      let updatedActivity = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedActivity && (updatedActivity as any)._id && !updatedActivity.id) {
        updatedActivity = { ...updatedActivity, id: (updatedActivity as any)._id };
      }
      
      return updatedActivity;
    } catch (error) {
      console.error('Error in activityService.update:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await activityAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      console.error('Error in activityService.delete:', error);
      return false; // Return false instead of throwing error
    }
  }
};

// Analytics service
export const analyticsService = {
  getOverview: async (): Promise<any> => {
    try {
      const response = await analyticsAPI.getOverview();
      return response.data?.data;
    } catch (error) {
      console.error('Error in analyticsService.getOverview:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  getDetailedReport: async (): Promise<any> => {
    try {
      const response = await analyticsAPI.getDetailedReport();
      return response.data?.data;
    } catch (error) {
      console.error('Error in analyticsService.getDetailedReport:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  getPlatformMetrics: async (): Promise<any> => {
    try {
      const response = await analyticsAPI.getPlatformMetrics();
      return response.data?.data;
    } catch (error) {
      console.error('Error in analyticsService.getPlatformMetrics:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  getCampaignPerformance: async (): Promise<any> => {
    try {
      const response = await analyticsAPI.getCampaignPerformance();
      return response.data?.data;
    } catch (error) {
      console.error('Error in analyticsService.getCampaignPerformance:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  getContentPerformance: async (): Promise<any> => {
    try {
      const response = await analyticsAPI.getContentPerformance();
      return response.data?.data;
    } catch (error) {
      console.error('Error in analyticsService.getContentPerformance:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  exportReport: async (format: string): Promise<any> => {
    try {
      const response = await analyticsAPI.exportReport(format);
      return response.data?.data;
    } catch (error) {
      console.error('Error in analyticsService.exportReport:', error);
      return undefined; // Return undefined instead of throwing error
    }
  }
};

// Billing service
export const billingService = {
  getBillingInfo: async (): Promise<Billing | undefined> => {
    try {
      const response = await billingAPI.getBillingInfo();
      let rawData = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (rawData && (rawData as any)._id && !rawData.id) {
        return { ...rawData, id: (rawData as any)._id };
      }
      
      return rawData;
    } catch (error) {
      console.error('Error in billingService.getBillingInfo:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  updateSubscription: async (plan: string): Promise<Billing | null> => {
    try {
      const response = await billingAPI.updateSubscription(plan);
      let updatedBilling = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedBilling && (updatedBilling as any)._id && !updatedBilling.id) {
        updatedBilling = { ...updatedBilling, id: (updatedBilling as any)._id };
      }
      
      return updatedBilling;
    } catch (error) {
      console.error('Error in billingService.updateSubscription:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  updatePaymentMethod: async (paymentMethod: Billing['paymentMethod']): Promise<Billing | null> => {
    try {
      const response = await billingAPI.updatePaymentMethod(paymentMethod);
      let updatedBilling = response.data?.data || null;
      
      // Convert _id to id for MongoDB compatibility
      if (updatedBilling && (updatedBilling as any)._id && !updatedBilling.id) {
        updatedBilling = { ...updatedBilling, id: (updatedBilling as any)._id };
      }
      
      return updatedBilling;
    } catch (error) {
      console.error('Error in billingService.updatePaymentMethod:', error);
      return null; // Return null instead of throwing error
    }
  },
  
  getInvoiceHistory: async (): Promise<Invoice[]> => {
    try {
      const response = await billingAPI.getInvoiceHistory();
      let data = response.data?.data || [];
      
      // Convert _id to id for MongoDB compatibility
      data = data.map(item => {
        if (item && (item as any)._id && !item.id) {
          return { ...item, id: (item as any)._id };
        }
        return item;
      });
      
      return data;
    } catch (error) {
      console.error('Error in billingService.getInvoiceHistory:', error);
      return []; // Return empty array instead of throwing error
    }
  },
  
  addInvoice: async (invoice: Omit<Invoice, 'id' | 'date'>): Promise<Invoice> => {
    try {
      const response = await billingAPI.addInvoice(invoice);
      let newInvoice = response.data?.data;
      
      // Convert _id to id for MongoDB compatibility
      if (newInvoice && (newInvoice as any)._id && !newInvoice.id) {
        newInvoice = { ...newInvoice, id: (newInvoice as any)._id };
      }
      
      return newInvoice;
    } catch (error) {
      console.error('Error in billingService.addInvoice:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }
};

// Security service
export const securityService = {
  getSecurityInfo: async (): Promise<any> => {
    try {
      const response = await securityAPI.getSecurityInfo();
      return response.data?.data;
    } catch (error) {
      console.error('Error in securityService.getSecurityInfo:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
    try {
      const response = await securityAPI.changePassword(currentPassword, newPassword);
      return response.data?.data;
    } catch (error) {
      console.error('Error in securityService.changePassword:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  toggleTwoFactorAuth: async (enabled: boolean): Promise<any> => {
    try {
      const response = await securityAPI.toggleTwoFactorAuth(enabled);
      return response.data?.data;
    } catch (error) {
      console.error('Error in securityService.toggleTwoFactorAuth:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }
};

// Notification service
export const notificationService = {
  getAll: async (): Promise<any> => {
    try {
      const response = await notificationAPI.getAll();
      return response.data?.data;
    } catch (error) {
      console.error('Error in notificationService.getAll:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await notificationAPI.getUnreadCount();
      return response.data?.data?.count || 0;
    } catch (error) {
      console.error('Error in notificationService.getUnreadCount:', error);
      return 0; // Return 0 instead of throwing error
    }
  },
  
  markAsRead: async (id: string): Promise<any> => {
    try {
      const response = await notificationAPI.markAsRead(id);
      return response.data?.data;
    } catch (error) {
      console.error('Error in notificationService.markAsRead:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  markAllAsRead: async (): Promise<any> => {
    try {
      const response = await notificationAPI.markAllAsRead();
      return response.data?.data;
    } catch (error) {
      console.error('Error in notificationService.markAllAsRead:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  delete: async (id: string): Promise<any> => {
    try {
      const response = await notificationAPI.delete(id);
      return response.data?.data;
    } catch (error) {
      console.error('Error in notificationService.delete:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  deleteRead: async (): Promise<any> => {
    try {
      const response = await notificationAPI.deleteRead();
      return response.data?.data;
    } catch (error) {
      console.error('Error in notificationService.deleteRead:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }
};

// Search service
export const searchService = {
  searchAll: async (query: string, type?: string, limit?: number): Promise<any> => {
    try {
      const response = await searchAPI.searchAll(query, type, limit);
      return response.data?.data;
    } catch (error) {
      console.error('Error in searchService.searchAll:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  searchPosts: async (query: string, status?: string, platform?: string, limit?: number, page?: number): Promise<any> => {
    try {
      const response = await searchAPI.searchPosts({ query, status, platform, limit, page });
      return response.data?.data;
    } catch (error) {
      console.error('Error in searchService.searchPosts:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  searchCampaigns: async (query: string, status?: string, limit?: number, page?: number): Promise<any> => {
    try {
      const response = await searchAPI.searchCampaigns({ query, status, limit, page });
      return response.data?.data;
    } catch (error) {
      console.error('Error in searchService.searchCampaigns:', error);
      return undefined; // Return undefined instead of throwing error
    }
  },
  
  searchTasks: async (query: string, status?: string, priority?: string, limit?: number, page?: number): Promise<any> => {
    try {
      const response = await searchAPI.searchTasks({ query, status, priority, limit, page });
      return response.data?.data;
    } catch (error) {
      console.error('Error in searchService.searchTasks:', error);
      return undefined; // Return undefined instead of throwing error
    }
  }
};

// Export service
export const exportService = {
  exportData: async (entity: string, format: string, startDate?: string, endDate?: string): Promise<any> => {
    try {
      const response = await exportAPI.exportData(entity, format, startDate, endDate);
      return response.data; // Return raw response for file download
    } catch (error) {
      console.error('Error in exportService.exportData:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  },
  
  exportAnalytics: async (format: string): Promise<any> => {
    try {
      const response = await exportAPI.exportAnalytics(format);
      return response.data; // Return raw response for file download
    } catch (error) {
      console.error('Error in exportService.exportAnalytics:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }
};