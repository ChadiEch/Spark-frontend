// Simplified post service for Winnerforce Spark platform
import { Post, APIListResponse, APIResponse } from '../types';
import { postAPI } from './apiService';
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
  if (converted.scheduledAt && typeof converted.scheduledAt === 'string') {
    converted.scheduledAt = new Date(converted.scheduledAt);
  }
  if (converted.publishedAt && typeof converted.publishedAt === 'string') {
    converted.publishedAt = new Date(converted.publishedAt);
  }
  
  // Handle nested objects
  if (converted.campaign && typeof converted.campaign === 'object') {
    converted.campaign = convertDatesInObject(converted.campaign);
  }
  
  if (converted.attachments && Array.isArray(converted.attachments)) {
    converted.attachments = converted.attachments.map(attachment => convertDatesInObject(attachment)).filter(a => a !== undefined);
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

// Simplified post service
export const simplePostService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; creator?: string; startDate?: string; endDate?: string }): Promise<Post[]> => {
    try {
      console.log('Fetching all posts with params:', params);
      const response = await postAPI.getAll(params);
      console.log('Post API response:', response);
      const posts = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      console.log('Raw posts data:', posts);
      const convertedPosts = convertDatesInArray(posts);
      console.log('Converted posts data:', convertedPosts);
      return convertedPosts;
    } catch (error) {
      console.error('Error in simplePostService.getAll:', error);
      handleApiError(error, 'fetching', 'posts');
      return [];
    }
  },
  
  getById: async (id: string): Promise<Post | undefined> => {
    try {
      const response = await postAPI.getById(id);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : undefined;
    } catch (error) {
      handleApiError(error, 'fetching', 'post');
      return undefined;
    }
  },
  
  create: async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> => {
    try {
      const response = await postAPI.create(postData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : {
        ...postData,
        id: `post-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Post;
    } catch (error) {
      handleApiError(error, 'creating', 'post');
      throw error;
    }
  },
  
  update: async (id: string, postData: Partial<Post>): Promise<Post | null> => {
    try {
      const response = await postAPI.update(id, postData);
      return response.data && (response.data as any).data ? convertDatesInObject((response.data as any).data) : null;
    } catch (error) {
      handleApiError(error, 'updating', 'post');
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await postAPI.delete(id);
      return response.data?.success === true;
    } catch (error) {
      handleApiError(error, 'deleting', 'post');
      return false;
    }
  }
};