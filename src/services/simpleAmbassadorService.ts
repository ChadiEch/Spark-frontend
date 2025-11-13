// Simplified ambassador service for Winnerforce Spark platform
import { Ambassador, APIListResponse, APIResponse } from '../types';
import { ambassadorAPI } from './apiService';
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
  if (converted.startDate && typeof converted.startDate === 'string') {
    converted.startDate = new Date(converted.startDate);
  }
  if (converted.endDate && typeof converted.endDate === 'string') {
    converted.endDate = new Date(converted.endDate);
  }
  
  return converted;
};

// Helper function to convert dates in array of objects
const convertDatesInArray = (array: any[]): any[] => {
  return array.map(item => convertDatesInObject(item)).filter(item => item !== undefined);
};

// Simplified ambassador service
export const simpleAmbassadorService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }): Promise<Ambassador[]> => {
    try {
      const response = await ambassadorAPI.getAll(params);
      const ambassadors = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      return convertDatesInArray(ambassadors);
    } catch (error) {
      handleApiError(error, 'fetching', 'ambassadors');
      return [];
    }
  },
  
  getById: async (id: string): Promise<Ambassador | undefined> => {
    try {
      const response = await ambassadorAPI.getById(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : undefined;
    } catch (error) {
      handleApiError(error, 'fetching', 'ambassador');
      return undefined;
    }
  },
  
  create: async (ambassadorData: Omit<Ambassador, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ambassador> => {
    try {
      const response = await ambassadorAPI.create(ambassadorData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : {
        ...ambassadorData,
        id: `ambassador-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Ambassador;
    } catch (error) {
      handleApiError(error, 'creating', 'ambassador');
      throw error;
    }
  },
  
  update: async (id: string, ambassadorData: Partial<Ambassador>): Promise<Ambassador | null> => {
    try {
      const response = await ambassadorAPI.update(id, ambassadorData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'ambassador');
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await ambassadorAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      handleApiError(error, 'deleting', 'ambassador');
      return false;
    }
  },
  
  getPerformance: async (id: string): Promise<any> => {
    try {
      const response = await ambassadorAPI.getPerformance(id);
      return response.data?.data;
    } catch (error) {
      handleApiError(error, 'fetching', 'ambassador performance');
      throw error;
    }
  },
  
  updateMetrics: async (id: string, metrics: Partial<Ambassador['metrics']>): Promise<Ambassador | null> => {
    try {
      const response = await ambassadorAPI.updateMetrics(id, { metrics });
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'ambassador metrics');
      return null;
    }
  },
};