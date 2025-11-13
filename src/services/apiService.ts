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
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
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

// Add a refresh connection method
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available
          // For the getMe endpoint, we don't want to redirect as it's expected to fail when not logged in
          if (originalRequest.url.includes('/auth/me')) {
            return Promise.reject(error);
          }
          // For other endpoints, we might want to handle the redirect differently
          return Promise.reject(error);
        }
        
        // Try to refresh the auth token
        const response = await api.post('/auth/refresh', { refreshToken });
        
        // Store the new tokens
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          // Update the authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          // Retry the original request
          return api(originalRequest);
        } else {
          // If refresh didn't return a new token
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If refresh fails, remove tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
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
  getTrashed: (params?: { page?: number; limit?: number }) => 
    api.get<APIListResponse<Task>>('/tasks/trash', { params }),
  delete: (id: string) => api.delete<APIResponse<any>>('/tasks/' + id)
};

// Goal API
export const goalAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; owner?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Goal>>('/goals', { params }),
  getById: (id: string) => api.get<APIResponse<Goal>>('/goals/' + id),
  create: (data: Partial<Goal>) => api.post<APIResponse<Goal>>('/goals', data),
  update: (id: string, data: Partial<Goal>) => api.put<APIResponse<Goal>>('/goals/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/goals/' + id)
};

// Asset API
export const assetAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; kind?: string; uploader?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Asset>>('/assets', { params }),
  getById: (id: string) => api.get<APIResponse<Asset>>('/assets/' + id),
  create: (data: Partial<Asset>) => api.post<APIResponse<Asset>>('/assets', data),
  update: (id: string, data: Partial<Asset>) => api.put<APIResponse<Asset>>('/assets/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/assets/' + id),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<APIResponse<Asset>>('/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Ambassador API
export const ambassadorAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }) => 
    api.get<APIListResponse<Ambassador>>('/ambassadors', { params }),
  getById: (id: string) => api.get<APIResponse<Ambassador>>('/ambassadors/' + id),
  create: (data: Partial<Ambassador>) => api.post<APIResponse<Ambassador>>('/ambassadors', data),
  update: (id: string, data: Partial<Ambassador>) => api.put<APIResponse<Ambassador>>('/ambassadors/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/ambassadors/' + id),
  getPerformance: (id: string) => api.get<APIResponse<any>>('/ambassadors/' + id + '/performance'),
  updateMetrics: (id: string, data: any) => api.put<APIResponse<Ambassador>>('/ambassadors/' + id + '/metrics', data)
};

// Activity API
export const activityAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; type?: string; campaign?: string; goal?: string }) => 
    api.get<APIListResponse<Activity>>('/activities', { params }),
  getById: (id: string) => api.get<APIResponse<Activity>>('/activities/' + id),
  create: (data: Partial<Activity>) => api.post<APIResponse<Activity>>('/activities', data),
  update: (id: string, data: Partial<Activity>) => api.put<APIResponse<Activity>>('/activities/' + id, data),
  delete: (id: string) => api.delete<APIResponse<any>>('/activities/' + id)
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get<APIResponse<any>>('/analytics/overview'),
  getDetailedReport: () => api.get<APIResponse<any>>('/analytics/report'),
  getPlatformMetrics: () => api.get<APIResponse<any>>('/analytics/platforms'),
  getCampaignPerformance: () => api.get<APIResponse<any>>('/analytics/campaigns'),
  getContentPerformance: () => api.get<APIResponse<any>>('/analytics/content'),
  exportReport: (format: string) => api.get<APIResponse<any>>(`/analytics/export/${format}`)
};

// Billing API
export const billingAPI = {
  getBillingInfo: () => api.get<APIResponse<Billing>>('/billing'),
  updateSubscription: (plan: string) => api.put<APIResponse<Billing>>('/billing/subscription', { plan }),
  updatePaymentMethod: (paymentMethod: Billing['paymentMethod']) => api.put<APIResponse<Billing>>('/billing/payment-method', { paymentMethod }),
  getInvoiceHistory: () => api.get<APIListResponse<Invoice>>('/billing/invoices'),
  addInvoice: (invoice: Omit<Invoice, 'id' | 'date'>) => api.post<APIResponse<Invoice>>('/billing/invoices', invoice)
};

// Security API
export const securityAPI = {
  getSecurityInfo: () => api.get<APIResponse<any>>('/security'),
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post<APIResponse<any>>('/security/change-password', { currentPassword, newPassword }),
  toggleTwoFactorAuth: (enabled: boolean) => 
    api.post<APIResponse<any>>('/security/two-factor', { enabled }),
  revokeSession: (sessionId: string) => 
    api.delete<APIResponse<any>>(`/security/sessions/${sessionId}`),
  revokeAllSessions: () => 
    api.delete<APIResponse<any>>('/security/sessions')
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get<APIListResponse<any>>('/notifications'),
  getUnreadCount: () => api.get<APIResponse<{count: number}>>('/notifications/unread-count'),
  markAsRead: (id: string) => api.put<APIResponse<any>>(`/notifications/${id}/read`),
  markAllAsRead: () => api.put<APIResponse<any>>('/notifications/read-all'),
  delete: (id: string) => api.delete<APIResponse<any>>(`/notifications/${id}`),
  deleteRead: () => api.delete<APIResponse<any>>('/notifications/read')
};

// Search API
export const searchAPI = {
  searchAll: (query: string, type?: string, limit?: number) => 
    api.get<APIResponse<any>>('/search', { params: { query, type, limit } }),
  searchPosts: (params: { query: string; status?: string; platform?: string; limit?: number; page?: number }) => 
    api.get<APIListResponse<Post>>('/search/posts', { params }),
  searchCampaigns: (params: { query: string; status?: string; limit?: number; page?: number }) => 
    api.get<APIListResponse<Campaign>>('/search/campaigns', { params }),
  searchTasks: (params: { query: string; status?: string; priority?: string; limit?: number; page?: number }) => 
    api.get<APIListResponse<Task>>('/search/tasks', { params })
};

// Export API
export const exportAPI = {
  exportData: (entity: string, format: string, startDate?: string, endDate?: string) => 
    api.get(`/export/${entity}/${format}`, { 
      params: { startDate, endDate },
      responseType: 'blob'
    }),
  exportAnalytics: (format: string) => 
    api.get(`/export/analytics/${format}`, { 
      responseType: 'blob'
    })
};

// Invitation API
export const invitationAPI = {
  inviteMember: (data: { email: string; role: string }) => 
    api.post<APIResponse<{ invitationId: string; email: string; role: string; invitationLink: string; expiresAt: string }>>('/invitations', data),
  getInvitation: (token: string) => 
    api.get<APIResponse<{ email: string; role: string; invitedBy: string; expiresAt: string }>>(`/invitations/${token}`),
  acceptInvitation: (token: string, data: { name: string; password: string }) => 
    api.post<APIResponse<{ userId: string; email: string; name: string }>>(`/invitations/${token}/accept`, data)
};

export default api;