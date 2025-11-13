// Custom hooks for Winnerforce Marketing Platform data management
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  userService, 
  postService, 
  campaignService, 
  taskService, 
  goalService, 
  assetService, 
  ambassadorService,
  activityService
} from '../services/dataService';
import { 
  User, 
  Post, 
  Campaign, 
  Task, 
  Goal, 
  Asset, 
  Ambassador,
  Activity
} from '../types';
import { retryRequest } from '../lib/retryUtils';
import { useGenericData } from './useGenericData';

// Helper function to safely filter out undefined values
const filterUndefined = <T>(array: (T | undefined)[]): T[] => {
  return array.filter((item): item is T => item !== undefined);
};

// Hook for user data
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await retryRequest(() => userService.getAll(), 2);
      // Filter out any undefined values
      const filteredUsers = filterUndefined(userData);
      setUsers(filteredUsers);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
      setUsers([]); // Set to empty array on error
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) => {
    try {
      const newUser = await retryRequest(() => userService.register(user), 2);
      if (newUser) {
        setUsers(prev => [...prev, newUser]);
        return newUser;
      }
      return null;
    } catch (error: any) {
      console.error('Error adding user:', error);
      setError(error.message || 'Failed to add user');
      return null;
    }
  };

  const getUserById = async (id: string) => {
    try {
      return await retryRequest(() => userService.getById(id), 2);
    } catch (error: any) {
      console.error('Error fetching user by ID:', error);
      setError(error.message || 'Failed to fetch user');
      return undefined;
    }
  };

  return { users, loading, error, addUser, getUserById };
};

// Hook for post data
export const usePosts = () => {
  // Memoize the options object to prevent unnecessary re-renders
  const postOptions = useMemo(() => ({
    fetchData: () => postService.getAll(),
    createItem: (post) => postService.create(post),
    updateItem: (id, post) => postService.update(id, post),
    deleteItem: (id) => postService.delete(id)
  }), []);

  const { data, loading, error, addItem, updateItem, deleteItem } = useGenericData<Post>(postOptions);
  
  return {
    posts: data,
    loading,
    error,
    addPost: addItem,
    updatePost: updateItem,
    deletePost: deleteItem
  };
};

// Hook for campaign data
export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignData = await retryRequest(() => campaignService.getAll(), 2);
      // Filter out any undefined values
      const filteredCampaigns = filterUndefined(campaignData);
      setCampaigns(filteredCampaigns);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      setError(error.message || 'Failed to fetch campaigns');
      setCampaigns([]); // Set to empty array on error
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'activities'> & { goals?: string[] }) => {
    try {
      // Ensure goals field is included in the data and is an array of strings
      const campaignDataWithGoals = {
        ...campaign,
        goals: Array.isArray(campaign.goals) ? campaign.goals : []
      };
      
      const newCampaign = await retryRequest(() => campaignService.create(campaignDataWithGoals), 2);
      if (newCampaign) {
        setCampaigns(prev => [...prev, newCampaign]);
        return newCampaign;
      }
      return null;
    } catch (error: any) {
      console.error('Error adding campaign:', error);
      setError(error.message || 'Failed to add campaign');
      return null;
    }
  };

  const updateCampaign = async (id: string, campaign: Partial<Campaign>) => {
    try {
      // Ensure goals field is properly handled if present
      if (campaign.goals && !Array.isArray(campaign.goals)) {
        campaign.goals = [];
      }
      
      const updatedCampaign = await retryRequest(() => campaignService.update(id, campaign), 2);
      if (updatedCampaign) {
        setCampaigns(prev => prev.map(c => c.id === id ? updatedCampaign : c));
      }
      return updatedCampaign;
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      setError(error.message || 'Failed to update campaign');
      return null;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      console.log('useData: Attempting to delete campaign with ID:', id);
      if (!id || id === 'undefined' || id === 'null') {
        console.error('useData: Invalid campaign ID:', id);
        return false;
      }
      
      const success = await retryRequest(() => campaignService.delete(id), 2);
      console.log('useData: Delete campaign service response:', success);
      if (success) {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('useData: Error deleting campaign:', error);
      setError(error.message || 'Failed to delete campaign');
      return false;
    }
  };

  const getCampaignById = async (id: string) => {
    try {
      return await retryRequest(() => campaignService.getById(id), 2);
    } catch (error: any) {
      console.error('Error fetching campaign by ID:', error);
      setError(error.message || 'Failed to fetch campaign');
      return undefined;
    }
  };

  return { campaigns, loading, error, addCampaign, updateCampaign, deleteCampaign, getCampaignById };
};

// Hook for task data
export const useTasks = () => {
  // Memoize the options object to prevent unnecessary re-renders
  const taskOptions = useMemo(() => ({
    fetchData: () => taskService.getAll(),
    createItem: (task) => taskService.create(task),
    updateItem: (id, task) => taskService.update(id, task),
    deleteItem: (id) => taskService.delete(id),
    // Add trash functionality
    trashItem: (id) => taskService.trash(id),
    restoreItem: (id) => taskService.restore(id)
  }), []);

  const { data, loading, error, addItem, updateItem, deleteItem, refetch } = useGenericData<Task>(taskOptions);
  
  // Custom functions for trash functionality
  const trashItem = useCallback(async (id: string) => {
    if (!taskOptions.trashItem) {
      console.warn('trashItem function not provided');
      return false;
    }

    try {
      const trashedTask = await retryRequest(() => taskOptions.trashItem!(id), 2);
      if (trashedTask) {
        refetch(); // Refresh the data to reflect the change
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error trashing item:', err);
      return false;
    }
  }, [taskOptions.trashItem, refetch]);

  const restoreItem = useCallback(async (id: string) => {
    if (!taskOptions.restoreItem) {
      console.warn('restoreItem function not provided');
      return false;
    }

    try {
      const restoredTask = await retryRequest(() => taskOptions.restoreItem!(id), 2);
      if (restoredTask) {
        refetch(); // Refresh the data to reflect the change
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error restoring item:', err);
      return false;
    }
  }, [taskOptions.restoreItem, refetch]);
  
  return {
    tasks: data,
    loading,
    error,
    addTask: addItem,
    updateTask: updateItem,
    deleteTask: deleteItem,
    trashItem,
    restoreItem,
    refetch
  };
};

// Hook for goal data
export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const goalData = await retryRequest(() => goalService.getAll(), 2);
      // Filter out any undefined values
      const filteredGoals = filterUndefined(goalData);
      setGoals(filteredGoals);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      setError(error.message || 'Failed to fetch goals');
      setGoals([]); // Set to empty array on error
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>) => {
    try {
      const newGoal = await retryRequest(() => goalService.create(goal), 2);
      if (newGoal) {
        setGoals(prev => [...prev, newGoal]);
        return newGoal;
      }
      return null;
    } catch (error: any) {
      console.error('Error adding goal:', error);
      setError(error.message || 'Failed to add goal');
      return null;
    }
  };

  const updateGoal = async (id: string, goal: Partial<Goal>) => {
    try {
      const updatedGoal = await retryRequest(() => goalService.update(id, goal), 2);
      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
      }
      return updatedGoal;
    } catch (error: any) {
      console.error('Error updating goal:', error);
      setError(error.message || 'Failed to update goal');
      return null;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const success = await retryRequest(() => goalService.delete(id), 2);
      if (success) {
        setGoals(prev => prev.filter(goal => goal.id !== id));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      setError(error.message || 'Failed to delete goal');
      return false;
    }
  };

  const getGoalById = async (id: string) => {
    try {
      return await retryRequest(() => goalService.getById(id), 2);
    } catch (error: any) {
      console.error('Error fetching goal by ID:', error);
      setError(error.message || 'Failed to fetch goal');
      return undefined;
    }
  };

  return { goals, loading, error, addGoal, updateGoal, deleteGoal, getGoalById };
};

// Hook for asset data
export const useAssets = () => {
  // Memoize the options object to prevent unnecessary re-renders
  const assetOptions = useMemo(() => ({
    fetchData: () => assetService.getAll(),
    createItem: (asset) => assetService.create(asset),
    updateItem: (id, asset) => assetService.update(id, asset),
    deleteItem: (id) => assetService.delete(id)
  }), []);

  const { data, loading, error, addItem, updateItem, deleteItem } = useGenericData<Asset>(assetOptions);
  
  return {
    assets: data,
    loading,
    error,
    addAsset: addItem,
    updateAsset: updateItem,
    deleteAsset: deleteItem
  };
};

// Hook for ambassador data
export const useAmbassadors = () => {
  // Memoize the options object to prevent unnecessary re-renders
  const ambassadorOptions = useMemo(() => ({
    fetchData: () => ambassadorService.getAll(),
    createItem: (ambassador) => ambassadorService.create(ambassador),
    updateItem: (id, ambassador) => ambassadorService.update(id, ambassador),
    deleteItem: (id) => ambassadorService.delete(id)
  }), []);

  const { data, loading, error, addItem, updateItem, deleteItem } = useGenericData<Ambassador>(ambassadorOptions);
  
  return {
    ambassadors: data,
    loading,
    error,
    addAmbassador: addItem,
    updateAmbassador: updateItem,
    deleteAmbassador: deleteItem
  };
};

// Hook for activity data
export const useActivities = () => {
  // Memoize the options object to prevent unnecessary re-renders
  const activityOptions = useMemo(() => ({
    fetchData: () => activityService.getAll(),
    createItem: (activity) => activityService.create(activity),
    updateItem: (id, activity) => activityService.update(id, activity),
    deleteItem: (id) => activityService.delete(id)
  }), []);

  const { data, loading, error, addItem, updateItem, deleteItem } = useGenericData<Activity>(activityOptions);
  
  return {
    activities: data,
    loading,
    error,
    addActivity: addItem,
    updateActivity: updateItem,
    deleteActivity: deleteItem
  };
};