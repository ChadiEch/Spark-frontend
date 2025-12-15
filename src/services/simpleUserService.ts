// Simplified user service for Winnerforce Spark platform
import { User, Role } from '../types';
import { authAPI, userAPI } from './apiService';
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
  if (converted.owner && typeof converted.owner === 'object') {
    converted.owner = convertDatesInObject(converted.owner);
  }
  
  if (converted.createdBy && typeof converted.createdBy === 'object') {
    converted.createdBy = convertDatesInObject(converted.createdBy);
  }
  
  return converted;
};

// Simplified user service
export const simpleUserService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string; startDate?: string; endDate?: string }): Promise<User[]> => {
    try {
      const response = await userAPI.getAll(params);
      const users = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      return users.map((user: any) => convertDatesInObject(user));
    } catch (error) {
      handleApiError(error, 'fetching', 'users');
      return [];
    }
  },
  
  getById: async (id: string): Promise<User | undefined> => {
    try {
      const response = await userAPI.getById(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : undefined;
    } catch (error) {
      handleApiError(error, 'fetching', 'user');
      return undefined;
    }
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getCurrentUser request timed out')), 10000)
      );
      
      const apiPromise = authAPI.getMe();
      
      // Race the API call against the timeout
      const response: any = await Promise.race([apiPromise, timeoutPromise])
        .catch(error => {
          console.error('SimpleUserService: getCurrentUser failed or timed out:', error);
          throw error;
        });
      
      if (response.data && response.data.user) {
        return convertDatesInObject(response.data.user);
      }
      return null;
    } catch (error) {
      handleApiError(error, 'fetching', 'current user');
      return null;
    }
  },
  
  update: async (id: string, userData: Partial<User>): Promise<User | null> => {
    try {
      const response = await userAPI.update(id, userData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'user');
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await userAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      handleApiError(error, 'deleting', 'user');
      return false;
    }
  },
  
  updateRole: async (id: string, role: Role): Promise<User | null> => {
    try {
      const response = await userAPI.updateRole(id, { role });
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'user role');
      return null;
    }
  },
  
  getRoleStats: async (): Promise<{role: string, count: number}[]> => {
    try {
      const response = await userAPI.getRoleStats();
      return response.data && (response.data as any).data ? (response.data as any).data : [];
    } catch (error) {
      handleApiError(error, 'fetching', 'role statistics');
      return [];
    }
  }
};