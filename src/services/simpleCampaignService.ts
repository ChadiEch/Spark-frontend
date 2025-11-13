// Simplified campaign service for Winnerforce Spark platform
import { Campaign, APIListResponse, APIResponse } from '../types';
import { campaignAPI } from './apiService';
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
  if (converted.goals && Array.isArray(converted.goals)) {
    converted.goals = converted.goals.map(goal => {
      if (typeof goal === 'string') {
        return goal; // Keep string IDs as is
      }
      return convertDatesInObject(goal);
    }).filter(g => g !== undefined);
  }
  
  if (converted.activities && Array.isArray(converted.activities)) {
    converted.activities = converted.activities.map(activity => convertDatesInObject(activity)).filter(a => a !== undefined);
  }
  
  // Handle createdBy object
  if (converted.createdBy && typeof converted.createdBy === 'object') {
    converted.createdBy = convertDatesInObject(converted.createdBy);
  }
  
  // Ensure we have an ID
  if (!converted.id && converted._id) {
    converted.id = converted._id;
  }
  
  return converted;
};

// Helper function to convert dates in array of objects
const convertDatesInArray = (array: any[]): any[] => {
  return array.map(item => convertDatesInObject(item)).filter(item => item !== undefined);
};

// Simplified campaign service
export const simpleCampaignService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; creator?: string; startDate?: string; endDate?: string }): Promise<Campaign[]> => {
    try {
      console.log('Fetching all campaigns with params:', params);
      const response = await campaignAPI.getAll(params);
      console.log('Campaign API response:', response);
      const campaigns = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      console.log('Raw campaigns data:', campaigns);
      const convertedCampaigns = convertDatesInArray(campaigns);
      console.log('Converted campaigns data:', convertedCampaigns);
      return convertedCampaigns;
    } catch (error) {
      console.error('Error in simpleCampaignService.getAll:', error);
      handleApiError(error, 'fetching', 'campaigns');
      return [];
    }
  },
  
  getById: async (id: string): Promise<Campaign | undefined> => {
    try {
      const response = await campaignAPI.getById(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : undefined;
    } catch (error) {
      handleApiError(error, 'fetching', 'campaign');
      return undefined;
    }
  },
  
  create: async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'activities'> & { goals?: string[] }): Promise<Campaign> => {
    try {
      // Ensure goals field is included in the data and is an array of strings
      const campaignDataWithGoals = {
        ...campaignData,
        goals: Array.isArray(campaignData.goals) ? campaignData.goals : []
      };
      
      const response = await campaignAPI.create(campaignDataWithGoals);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : {
        ...campaignDataWithGoals,
        id: `camp-${Date.now()}`,
        activities: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as Campaign;
    } catch (error) {
      handleApiError(error, 'creating', 'campaign');
      throw error;
    }
  },

  update: async (id: string, campaignData: Partial<Campaign>): Promise<Campaign | null> => {
    try {
      // Ensure goals field is properly handled if present
      if (campaignData.goals && !Array.isArray(campaignData.goals)) {
        campaignData.goals = [];
      }
      
      const response = await campaignAPI.update(id, campaignData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'campaign');
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await campaignAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      handleApiError(error, 'deleting', 'campaign');
      return false;
    }
  }
};