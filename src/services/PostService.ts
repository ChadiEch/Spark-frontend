// Post service implementation using the generic service
import { Post } from '../types';
import { GenericService } from './genericService';
import { postAPI } from './apiService';
import { useAPI } from './dataService';

// Helper function to convert string dates back to Date objects
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
  if (converted.createdBy && typeof converted.createdBy === 'object') {
    converted.createdBy = convertDatesInObject(converted.createdBy);
  }
  
  if (converted.campaign && typeof converted.campaign === 'object') {
    converted.campaign = convertDatesInObject(converted.campaign);
  }
  
  if (converted.attachments && Array.isArray(converted.attachments)) {
    converted.attachments = converted.attachments.map(attachment => convertDatesInObject(attachment));
  }
  
  if (converted.metrics && typeof converted.metrics === 'object') {
    converted.metrics = convertDatesInObject(converted.metrics);
  }
  
  return converted;
};

// Helper function to convert dates in array of objects
const convertDatesInArray = (array: any[]): any[] => {
  return array.map(item => convertDatesInObject(item));
};

/**
 * Post service that extends the generic service
 */
export class PostService extends GenericService<Post> {
  constructor() {
    super({
      storageKey: 'winnerforce_posts',
      apiFunctions: {
        getAll: postAPI.getAll,
        getById: postAPI.getById,
        create: postAPI.create,
        update: postAPI.update,
        delete: postAPI.delete
      },
      useAPI,
      convertDatesInObject,
      convertDatesInArray,
      idPrefix: 'post'
    });
  }

  /**
   * Get all posts with specific parameters
   */
  async getAllPosts(params?: { page?: number; limit?: number; search?: string; status?: string; creator?: string; startDate?: string; endDate?: string }): Promise<Post[]> {
    return this.getAll(params);
  }

  /**
   * Get post by ID with validation
   */
  async getById(id: string): Promise<Post | undefined> {
    // Validate ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      console.error('PostService: Invalid post ID provided:', id);
      return undefined;
    }
    
    return super.getById(id);
  }

  /**
   * Publish a post to social media
   */
  async publish(id: string, publishData: any): Promise<any> {
    try {
      const response = await postAPI.publish(id, publishData);
      return response.data;
    } catch (error) {
      console.error('PostService: Error publishing post:', error);
      throw error;
    }
  }
}
