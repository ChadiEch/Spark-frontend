// Simplified asset service for Winnerforce Spark platform
import { Asset, APIListResponse, APIResponse } from '../types';
import { assetAPI } from './apiService';
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
  if (converted.uploadedBy && typeof converted.uploadedBy === 'object') {
    converted.uploadedBy = convertDatesInObject(converted.uploadedBy);
  }
  
  // Handle campaign object
  if (converted.campaign && typeof converted.campaign === 'object') {
    converted.campaign = convertDatesInObject(converted.campaign);
  }
  
  // Handle post object
  if (converted.post && typeof converted.post === 'object') {
    converted.post = convertDatesInObject(converted.post);
  }
  
  // Handle goal object
  if (converted.goal && typeof converted.goal === 'object') {
    converted.goal = convertDatesInObject(converted.goal);
  }
  
  return converted;
};

// Helper function to convert dates in array of objects
const convertDatesInArray = (array: any[]): any[] => {
  return array.map(item => convertDatesInObject(item)).filter(item => item !== undefined);
};

// Simplified asset service
export const simpleAssetService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; kind?: string; uploader?: string; startDate?: string; endDate?: string }): Promise<Asset[]> => {
    try {
      const response = await assetAPI.getAll(params);
      const assets = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      return convertDatesInArray(assets);
    } catch (error) {
      handleApiError(error, 'fetching', 'assets');
      return [];
    }
  },
  
  getById: async (id: string): Promise<Asset | undefined> => {
    try {
      const response = await assetAPI.getById(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : undefined;
    } catch (error) {
      handleApiError(error, 'fetching', 'asset');
      return undefined;
    }
  },
  
  create: async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> => {
    try {
      const response = await assetAPI.create(assetData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : {
        ...assetData,
        id: `asset-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Asset;
    } catch (error) {
      handleApiError(error, 'creating', 'asset');
      throw error;
    }
  },
  
  upload: async (file: File): Promise<Asset | null> => {
    try {
      const response = await assetAPI.upload(file);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'uploading', 'asset');
      return null;
    }
  },
  
  update: async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      const response = await assetAPI.update(id, assetData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'asset');
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await assetAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      handleApiError(error, 'deleting', 'asset');
      return false;
    }
  }
};