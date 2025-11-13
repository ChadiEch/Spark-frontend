import axios from 'axios';
import { postAPI, campaignAPI, taskAPI, goalAPI, assetAPI, ambassadorAPI, userAPI } from './apiService';

export interface SearchParams {
  query: string;
  types?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: 'post' | 'campaign' | 'task' | 'goal' | 'asset' | 'ambassador' | 'user';
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Additional properties specific to each type
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  total: number;
  page: number;
  pages: number;
}

// Create axios instance for search API
const searchAPI = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add auth token to requests
searchAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const searchService = {
  // Search across all entity types using backend search endpoint
  searchAll: async (params: SearchParams): Promise<SearchResponse> => {
    const { query, types = ['post', 'campaign', 'task', 'goal', 'asset', 'ambassador', 'user'], page = 1, limit = 10 } = params;
    
    try {
      // Use the new backend search endpoint
      const response = await searchAPI.get<SearchResponse>('/search', {
        params: {
          query,
          types: types.join(','),
          page,
          limit
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      
      // Fallback to client-side search if backend fails
      return await searchService.fallbackSearch(params);
    }
  },
  
  // Fallback client-side search implementation
  fallbackSearch: async (params: SearchParams): Promise<SearchResponse> => {
    const { query, types = ['post', 'campaign', 'task', 'goal', 'asset', 'ambassador', 'user'], page = 1, limit = 10 } = params;
    
    try {
      // Create promises for all search types
      const searchPromises: Promise<any>[] = [];
      
      if (types.includes('post')) {
        searchPromises.push(
          postAPI.getAll({ 
            search: query, 
            page, 
            limit: Math.ceil(limit / types.length) 
          }).catch(() => ({ data: [], total: 0, page: 1, pages: 1 }))
        );
      }
      
      if (types.includes('campaign')) {
        searchPromises.push(
          campaignAPI.getAll({ 
            search: query, 
            page, 
            limit: Math.ceil(limit / types.length) 
          }).catch(() => ({ data: [], total: 0, page: 1, pages: 1 }))
        );
      }
      
      if (types.includes('task')) {
        searchPromises.push(
          taskAPI.getAll({ 
            search: query, 
            page, 
            limit: Math.ceil(limit / types.length) 
          }).catch(() => ({ data: [], total: 0, page: 1, pages: 1 }))
        );
      }
      
      if (types.includes('goal')) {
        searchPromises.push(
          goalAPI.getAll({ 
            search: query, 
            page, 
            limit: Math.ceil(limit / types.length) 
          }).catch(() => ({ data: [], total: 0, page: 1, pages: 1 }))
        );
      }
      
      if (types.includes('asset')) {
        searchPromises.push(
          assetAPI.getAll({ 
            search: query, 
            page, 
            limit: Math.ceil(limit / types.length) 
          }).catch(() => ({ data: [], total: 0, page: 1, pages: 1 }))
        );
      }
      
      if (types.includes('ambassador')) {
        searchPromises.push(
          ambassadorAPI.getAll({ 
            search: query, 
            page, 
            limit: Math.ceil(limit / types.length) 
          }).catch(() => ({ data: [], total: 0, page: 1, pages: 1 }))
        );
      }
      
      if (types.includes('user')) {
        searchPromises.push(
          userAPI.getAll({ 
            search: query, 
            page, 
            limit: Math.ceil(limit / types.length) 
          }).catch(() => ({ data: [], total: 0, page: 1, pages: 1 }))
        );
      }
      
      // Execute all searches in parallel
      const results = await Promise.all(searchPromises);
      
      // Process and combine results
      const combinedResults: SearchResult[] = [];
      let total = 0;
      
      results.forEach((result, index) => {
        if (result.data && Array.isArray(result.data)) {
          const type = types[index];
          total += result.total || result.data.length;
          
          result.data.forEach((item: any) => {
            combinedResults.push({
              id: item.id,
              type: type as SearchResult['type'],
              title: item.title || item.name || item.email || 'Untitled',
              description: item.description || item.caption || item.email || '',
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              ...item
            });
          });
        }
      });
      
      // Sort by relevance (simplified - in a real implementation, you'd use a proper search engine)
      combinedResults.sort((a, b) => {
        // Prioritize exact matches in title
        const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
        const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        // Then sort by updated date (newer first)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      
      return {
        success: true,
        data: combinedResults.slice(0, limit),
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Fallback search error:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page: 1,
        pages: 1
      };
    }
  },
  
  // Get search suggestions (autocomplete)
  getSuggestions: async (query: string, limit: number = 5): Promise<string[]> => {
    if (!query || query.length < 2) {
      return [];
    }
    
    try {
      // Use the new backend suggestions endpoint
      const response = await searchAPI.get<{ success: boolean; data: string[] }>('/search/suggestions', {
        params: {
          query,
          limit
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      // Fallback to client-side suggestions if backend fails
      return await searchService.fallbackGetSuggestions(query, limit);
    } catch (error) {
      console.error('Suggestions error:', error);
      
      // Fallback to client-side suggestions if backend fails
      return await searchService.fallbackGetSuggestions(query, limit);
    }
  },
  
  // Fallback client-side suggestions implementation
  fallbackGetSuggestions: async (query: string, limit: number = 5): Promise<string[]> => {
    try {
      // In a real implementation, this would call a dedicated autocomplete endpoint
      // For now, we'll simulate with a simple approach
      
      // Get recent items from different types
      const [posts, campaigns, tasks] = await Promise.all([
        postAPI.getAll({ search: query, limit: 3 }).catch(() => ({ data: [] })),
        campaignAPI.getAll({ search: query, limit: 3 }).catch(() => ({ data: [] })),
        taskAPI.getAll({ search: query, limit: 3 }).catch(() => ({ data: [] }))
      ]);
      
      // Extract titles for suggestions
      const suggestions = new Set<string>();
      
      // Extract data arrays properly
      const postData = Array.isArray(posts.data) ? posts.data : [];
      const campaignData = Array.isArray(campaigns.data) ? campaigns.data : [];
      const taskData = Array.isArray(tasks.data) ? tasks.data : [];
      
      [...postData, ...campaignData, ...taskData].forEach((item: any) => {
        const title = item.title || item.name;
        if (title && title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(title);
        }
      });
      
      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Fallback suggestions error:', error);
      return [];
    }
  }
};