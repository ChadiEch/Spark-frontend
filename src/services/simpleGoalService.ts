// Simplified goal service for Winnerforce Spark platform
import { Goal, APIListResponse, APIResponse } from '../types';
import { goalAPI } from './apiService';
import { handleApiError } from '../lib/errorUtils';

// Helper function to convert string dates back to Date objects and handle ID conversion
const convertDatesInObject = (obj: any): any => {
  if (!obj) return obj;
  
  const converted = { ...obj };
  
  // Convert _id to id for MongoDB compatibility
  if (converted._id && !converted.id) {
    converted.id = converted._id;
  }
  
  // Convert known date fields
  if (converted.createdAt && typeof converted.createdAt === 'string') {
    converted.createdAt = new Date(converted.createdAt);
  }
  if (converted.updatedAt && typeof converted.updatedAt === 'string') {
    converted.updatedAt = new Date(converted.updatedAt);
  }
  if (converted.start && typeof converted.start === 'string') {
    converted.start = new Date(converted.start);
  }
  if (converted.end && typeof converted.end === 'string') {
    converted.end = new Date(converted.end);
  }
  
  // Handle nested objects
  if (converted.campaigns && Array.isArray(converted.campaigns)) {
    converted.campaigns = converted.campaigns.map(campaign => convertDatesInObject(campaign)).filter(c => c !== undefined);
  }
  
  // Handle owner object
  if (converted.owner && typeof converted.owner === 'object') {
    converted.owner = convertDatesInObject(converted.owner);
  }
  
  return converted;
};

// Helper function to convert dates in array of objects
const convertDatesInArray = (array: any[]): any[] => {
  return array.map(item => convertDatesInObject(item)).filter(item => item !== undefined);
};

// Simplified goal service
export const simpleGoalService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; owner?: string; startDate?: string; endDate?: string }): Promise<Goal[]> => {
    try {
      const response = await goalAPI.getAll(params);
      const goals = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      return convertDatesInArray(goals);
    } catch (error) {
      handleApiError(error, 'fetching', 'goals');
      return [];
    }
  },
  
  getById: async (id: string): Promise<Goal | undefined> => {
    try {
      const response = await goalAPI.getById(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : undefined;
    } catch (error) {
      handleApiError(error, 'fetching', 'goal');
      return undefined;
    }
  },
  
  create: async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'campaigns'>): Promise<Goal> => {
    try {
      const response = await goalAPI.create(goalData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : {
        ...goalData,
        id: `goal-${Date.now()}`,
        campaigns: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as Goal;
    } catch (error) {
      handleApiError(error, 'creating', 'goal');
      throw error;
    }
  },
  
  update: async (id: string, goalData: Partial<Goal>): Promise<Goal | null> => {
    try {
      const response = await goalAPI.update(id, goalData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'goal');
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await goalAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      handleApiError(error, 'deleting', 'goal');
      return false;
    }
  }
};