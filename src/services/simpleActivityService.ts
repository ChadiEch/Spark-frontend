// Simplified activity service for Winnerforce Spark platform
import { Activity, APIListResponse, APIResponse } from '../types';
import { activityAPI } from './apiService';
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
  
  // Handle nested objects
  if (converted.campaign && typeof converted.campaign === 'object') {
    converted.campaign = convertDatesInObject(converted.campaign);
  }
  
  if (converted.goal && typeof converted.goal === 'object') {
    converted.goal = convertDatesInObject(converted.goal);
  }
  
  if (converted.ambassador && typeof converted.ambassador === 'object') {
    converted.ambassador = convertDatesInObject(converted.ambassador);
  }
  
  if (converted.post && typeof converted.post === 'object') {
    converted.post = convertDatesInObject(converted.post);
  }
  
  return converted;
};

// Helper function to convert dates in array of objects
const convertDatesInArray = (array: any[]): any[] => {
  return array.map(item => convertDatesInObject(item)).filter(item => item !== undefined);
};

// Simplified activity service
export const simpleActivityService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; type?: string; campaign?: string; goal?: string }): Promise<Activity[]> => {
    try {
      const response = await activityAPI.getAll(params);
      const activities = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      return convertDatesInArray(activities);
    } catch (error) {
      handleApiError(error, 'fetching', 'activities');
      return [];
    }
  },
  
  getById: async (id: string): Promise<Activity | undefined> => {
    try {
      const response = await activityAPI.getById(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : undefined;
    } catch (error) {
      handleApiError(error, 'fetching', 'activity');
      return undefined;
    }
  },
  
  create: async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> => {
    try {
      const response = await activityAPI.create(activityData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : {
        ...activityData,
        id: `activity-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Activity;
    } catch (error) {
      handleApiError(error, 'creating', 'activity');
      throw error;
    }
  },
  
  update: async (id: string, activityData: Partial<Activity>): Promise<Activity | null> => {
    try {
      const response = await activityAPI.update(id, activityData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'activity');
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await activityAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      handleApiError(error, 'deleting', 'activity');
      return false;
    }
  }
};