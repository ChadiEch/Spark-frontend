// Simplified task service for Winnerforce Spark platform
import { Task, APIListResponse, APIResponse } from '../types';
import { taskAPI } from './apiService';
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
  if (converted.due && typeof converted.due === 'string') {
    converted.due = new Date(converted.due);
  }
  if (converted.trashedAt && typeof converted.trashedAt === 'string') {
    converted.trashedAt = new Date(converted.trashedAt);
  }
  if (converted.startDate && typeof converted.startDate === 'string') {
    converted.startDate = new Date(converted.startDate);
  }
  if (converted.completionDate && typeof converted.completionDate === 'string') {
    converted.completionDate = new Date(converted.completionDate);
  }
  
  // Handle nested objects
  if (converted.assignees && Array.isArray(converted.assignees)) {
    converted.assignees = converted.assignees.map(assignee => convertDatesInObject(assignee)).filter(a => a !== undefined);
  }
  
  // Handle relatedPost object
  if (converted.relatedPost && typeof converted.relatedPost === 'object') {
    converted.relatedPost = convertDatesInObject(converted.relatedPost);
  }
  
  // Handle relatedCampaign object
  if (converted.relatedCampaign && typeof converted.relatedCampaign === 'object') {
    converted.relatedCampaign = convertDatesInObject(converted.relatedCampaign);
  }
  
  return converted;
};

// Helper function to convert dates in array of objects
const convertDatesInArray = (array: any[]): any[] => {
  return array.map(item => convertDatesInObject(item)).filter(item => item !== undefined);
};

// Simplified task service
export const simpleTaskService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; priority?: string; assignee?: string; startDate?: string; endDate?: string }): Promise<Task[]> => {
    try {
      const response = await taskAPI.getAll(params);
      const tasks = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      return convertDatesInArray(tasks);
    } catch (error) {
      handleApiError(error, 'fetching', 'tasks');
      return [];
    }
  },
  
  getById: async (id: string): Promise<Task | undefined> => {
    try {
      const response = await taskAPI.getById(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : undefined;
    } catch (error) {
      handleApiError(error, 'fetching', 'task');
      return undefined;
    }
  },
  
  create: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      const response = await taskAPI.create(taskData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Task;
    } catch (error) {
      handleApiError(error, 'creating', 'task');
      throw error;
    }
  },
  
  update: async (id: string, taskData: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await taskAPI.update(id, taskData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'task');
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await taskAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      handleApiError(error, 'deleting', 'task');
      return false;
    }
  },
  
  // Trash functionality
  trash: async (id: string): Promise<Task | null> => {
    try {
      const response = await taskAPI.trash(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'trashing', 'task');
      return null;
    }
  },
  
  restore: async (id: string): Promise<Task | null> => {
    try {
      const response = await taskAPI.restore(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'restoring', 'task');
      return null;
    }
  },
  
  getTrashed: async (params?: { page?: number; limit?: number }): Promise<Task[]> => {
    try {
      const response = await taskAPI.getTrashed(params);
      const tasks = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      return convertDatesInArray(tasks);
    } catch (error) {
      handleApiError(error, 'fetching', 'trashed tasks');
      return [];
    }
  }
};