// API service for Winnerforce Spark platform
import axios from 'axios';
import { 
  User, 
  Post, 
  Campaign, 
  Task, 
  Goal, 
  Asset, 
  Ambassador, 
  APIListResponse, 
  APIResponse, 
  Integration, 
  IntegrationConnection, 
  Billing, 
  Invoice 
} from '../types';
import type { Activity } from '../types';
import { retryRequest, retryRequestWithFeedback } from '../lib/retryUtils';

// Create axios instance
// In production, VITE_API_URL should be set to the backend service URL
// In development, it defaults to localhost:5001
// On Railway, this should be configured in the Railway dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('railway.app') 
    ? `https://${window.location.hostname.replace('frontend', 'backend')}/api`
    : 'http://localhost:5001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add a shorter timeout for Railway environments to prevent hanging
    if (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
      config.timeout = 15000; // 15 seconds on Railway
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a refresh connection method
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('API request timed out:', originalRequest.url);
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken(refreshToken);
          const token = (response.data as any).token;
          
          // Store new token
          localStorage.setItem('token', token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, log out user
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) => 
    api.post<APIResponse<{ token: string; refreshToken: string; user: User }>>('/auth/register', data),
  login: (email: string, password: string) => 
    api.post<APIResponse<{ token: string; refreshToken: string; user: User }>>('/auth/login', { email, password }),
  logout: () => api.get<APIResponse<any>>('/auth/logout'),
  refreshToken: (refreshToken: string) => 
    api.post<APIResponse<{ token: string }>>('/auth/refresh', { refreshToken }),
  getMe: () => api.get<APIResponse<{ user: User }>>('/auth/me')
};

// User API
export const userAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<User>>('/users', { params }),
  getById: (id: string) => api.get<APIResponse<User>>('/users/' + id),
  create: (data: Partial<User>) => api.post<APIResponse<User>>('/users', data),
  update: (id: string, data: Partial<User>) => api.put<APIResponse<User>>('/users/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/users/' + id),
  updateRole: (id: string, data: { role: string }) => api.put<APIResponse<User>>('/users/' + id + '/role', data),
  getRoleStats: () => api.get<APIResponse<{role: string, count: number}[]>>('/users/stats/roles')
};

// Post API
export const postAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; creator?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Post>>('/posts', { params }),
  getById: (id: string) => api.get<APIResponse<Post>>('/posts/' + id),
  create: (data: Partial<Post>) => api.post<APIResponse<Post>>('/posts', data),
  update: (id: string, data: Partial<Post>) => api.put<APIResponse<Post>>('/posts/' + id, data),
  publish: (id: string, data: any) => api.post<APIResponse<any>>('/posts/' + id + '/publish', data),
  delete: (id: string) => api.delete<APIResponse<any>>('/posts/' + id)
};

// Campaign API
export const campaignAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; creator?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Campaign>>('/campaigns', { params }),
  getById: (id: string) => api.get<APIResponse<Campaign>>('/campaigns/' + id),
  create: (data: Partial<Campaign>) => api.post<APIResponse<Campaign>>('/campaigns', data),
  update: (id: string, data: Partial<Campaign>) => api.put<APIResponse<Campaign>>('/campaigns/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/campaigns/' + id)
};

// Task API
export const taskAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; priority?: string; assignee?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Task>>('/tasks', { params }),
  getById: (id: string) => api.get<APIResponse<Task>>('/tasks/' + id),
  create: (data: Partial<Task>) => api.post<APIResponse<Task>>('/tasks', data),
  update: (id: string, data: Partial<Task>) => api.put<APIResponse<Task>>('/tasks/' + id, data),
  trash: (id: string) => api.put<APIResponse<Task>>('/tasks/' + id + '/trash'),
  restore: (id: string) => api.put<APIResponse<Task>>('/tasks/' + id + '/restore'),
  delete: (id: string) => api.delete<APIResponse<any>>('/tasks/' + id)
};

// Goal API
export const goalAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; assignee?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Goal>>('/goals', { params }),
  getById: (id: string) => api.get<APIResponse<Goal>>('/goals/' + id),
  create: (data: Partial<Goal>) => api.post<APIResponse<Goal>>('/goals', data),
  update: (id: string, data: Partial<Goal>) => api.put<APIResponse<Goal>>('/goals/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/goals/' + id)
};

// Asset API
export const assetAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; type?: string; owner?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Asset>>('/assets', { params }),
  getById: (id: string) => api.get<APIResponse<Asset>>('/assets/' + id),
  create: (data: Partial<Asset>) => api.post<APIResponse<Asset>>('/assets', data),
  update: (id: string, data: Partial<Asset>) => api.put<APIResponse<Asset>>('/assets/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/assets/' + id)
};

// Ambassador API
export const ambassadorAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; program?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Ambassador>>('/ambassadors', { params }),
  getById: (id: string) => api.get<APIResponse<Ambassador>>('/ambassadors/' + id),
  create: (data: Partial<Ambassador>) => api.post<APIResponse<Ambassador>>('/ambassadors', data),
  update: (id: string, data: Partial<Ambassador>) => api.put<APIResponse<Ambassador>>('/ambassadors/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/ambassadors/' + id)
};

// Analytics API
export const analyticsAPI = {
  getOverview: (startDate?: string, endDate?: string) => 
    api.get<APIResponse<any>>('/analytics/overview', { params: { startDate, endDate } }),
  getPosts: (startDate?: string, endDate?: string) => 
    api.get<APIResponse<any>>('/analytics/posts', { params: { startDate, endDate } }),
  getCampaigns: (startDate?: string, endDate?: string) => 
    api.get<APIResponse<any>>('/analytics/campaigns', { params: { startDate, endDate } }),
  getTasks: (startDate?: string, endDate?: string) => 
    api.get<APIResponse<any>>('/analytics/tasks', { params: { startDate, endDate } }),
  getGoals: (startDate?: string, endDate?: string) => 
    api.get<APIResponse<any>>('/analytics/goals', { params: { startDate, endDate } })
};

// Activity API
export const activityAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; type?: string; user?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Activity>>('/activities', { params }),
  getById: (id: string) => api.get<APIResponse<Activity>>('/activities/' + id),
  create: (data: Partial<Activity>) => api.post<APIResponse<Activity>>('/activities', data),
  update: (id: string, data: Partial<Activity>) => api.put<APIResponse<Activity>>('/activities/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/activities/' + id)
};

// Integration API
export const integrationAPI = {
  getAll: () => api.get<APIListResponse<Integration>>('/integrations'),
  getById: (id: string) => api.get<APIResponse<Integration>>('/integrations/' + id),
  getUserConnections: () => api.get<APIListResponse<IntegrationConnection>>('/integrations/connections'),
  connect: (integrationId: string) => api.post<APIResponse<any>>('/integrations/connect', { integrationId }),
  disconnect: (id: string) => api.delete<APIResponse<any>>('/integrations/connections/' + id),
  refresh: (id: string) => api.post<APIResponse<IntegrationConnection>>('/integrations/connections/' + id + '/refresh'),
  getStatus: (id: string) => api.get<APIResponse<any>>('/integrations/connections/' + id + '/status')
};

// Notification API
export const notificationAPI = {
  getAll: (params?: { page?: number; limit?: number; read?: boolean }) => 
    api.get<APIListResponse<any>>('/notifications', { params }),
  markAsRead: (id: string) => api.put<APIResponse<any>>('/notifications/' + id + '/read'),
  markAllAsRead: () => api.put<APIResponse<any>>('/notifications/read-all')
};

// Billing API
export const billingAPI = {
  getInvoices: () => api.get<APIListResponse<Invoice>>('/billing/invoices'),
  getInvoiceById: (id: string) => api.get<APIResponse<Invoice>>('/billing/invoices/' + id),
  getBillingInfo: () => api.get<APIResponse<Billing>>('/billing/info')
};

// Export API
export const exportAPI = {
  exportData: (type: string, format: string) => 
    api.get('/export/' + type + '/' + format, { responseType: 'blob' })
};

// Search API
export const searchAPI = {
  global: (query: string) => api.get<APIResponse<any>>('/search', { params: { q: query } })
};

// Export the api instance as default for backward compatibility
export default api;
