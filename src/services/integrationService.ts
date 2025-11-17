// Integration service for Winnerforce Spark platform
import { retryRequestWithFeedback } from '../lib/retryUtils';
import api from './apiService';
import { Integration, IntegrationConnection, APIResponse } from '../types';

// Integration API
export const integrationAPI = {
  // Get all available integrations
  getAll: () => 
    retryRequestWithFeedback(() => api.get<APIResponse<Integration[]>>('/integrations'), 3, 1000, 'fetching integrations'),
  
  // Get integration by ID
  getById: (id: string) => 
    retryRequestWithFeedback(() => api.get<APIResponse<Integration>>(`/integrations/${id}`), 3, 1000, 'fetching integration'),
  
  // Get user's connected integrations
  getUserConnections: () => 
    retryRequestWithFeedback(() => api.get<APIResponse<IntegrationConnection[]>>('/integrations/connections'), 3, 1000, 'fetching integration connections'),
  
  // Connect to an integration (initiates OAuth flow)
  connect: (integrationId: string, redirectUri?: string) => {
    const data: any = { integrationId };
    if (redirectUri) {
      data.redirectUri = redirectUri;
    }
    return retryRequestWithFeedback(() => api.post<APIResponse<{ authorizationUrl: string }>>('/integrations/connect', data), 3, 1000, 'connecting to integration');
  },
  
  // Disconnect from an integration
  disconnect: (connectionId: string) => 
    retryRequestWithFeedback(() => api.delete<APIResponse<{}>>(`/integrations/connections/${connectionId}`), 3, 1000, 'disconnecting from integration'),
  
  // Refresh an integration connection
  refreshConnection: (connectionId: string) => 
    retryRequestWithFeedback(() => api.post<APIResponse<IntegrationConnection>>(`/integrations/connections/${connectionId}/refresh`), 3, 1000, 'refreshing integration connection'),
  
  // Get connection status
  getConnectionStatus: (connectionId: string) => 
    retryRequestWithFeedback(() => api.get<APIResponse<{ connected: boolean; message?: string }>>(`/integrations/connections/${connectionId}/status`), 3, 1000, 'checking connection status'),
  
  // Exchange OAuth code for tokens
  exchangeCodeForTokens: (integrationId: string, code: string, redirectUri?: string, userId?: string) => {
    // Use the redirect URI from the environment or default to the frontend callback
    // On Railway, we need to use the production URL instead of window.location.origin
    const isRailway = window.location.hostname.includes('railway.app');
    const frontendUrl = isRailway 
      ? 'https://spark-frontend-production.up.railway.app'
      : window.location.origin;
    const finalRedirectUri = redirectUri || `${frontendUrl}/integrations/callback`;
    const data: any = { integrationId, code, redirectUri: finalRedirectUri };
    
    // Include userId if provided
    if (userId) {
      data.userId = userId;
    }
    
    console.log('Sending exchange code request', { integrationId, code: code ? 'present' : 'missing', redirectUri: finalRedirectUri, userId });
    
    return retryRequestWithFeedback(() => {
      console.log('Making API request to exchange code', { url: '/integrations/exchange', data });
      return api.post<APIResponse<IntegrationConnection & { redirectUrl?: string }>>('/integrations/exchange', data);
    }, 3, 1000, 'exchanging code for tokens');
  },
  
  // Get integration metrics
  getMetrics: () => 
    retryRequestWithFeedback(() => api.get<APIResponse<any>>('/integrations/metrics'), 3, 1000, 'fetching integration metrics'),
  
  // Get integration health metrics
  getHealthMetrics: () => 
    retryRequestWithFeedback(() => api.get<APIResponse<any>>('/integrations/metrics'), 3, 1000, 'fetching integration health metrics'),
  
  // Initialize integrations collection
  initializeIntegrations: () => 
    retryRequestWithFeedback(() => api.post<APIResponse<any>>('/integrations/initialize'), 3, 1000, 'initializing integrations collection')
};

// Main integration service
export const integrationService = {
  getAll: async (): Promise<Integration[]> => {
    try {
      const response = await integrationAPI.getAll();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      throw error;
    }
  },

  getUserConnections: async (): Promise<IntegrationConnection[]> => {
    try {
      const response = await integrationAPI.getUserConnections();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch integration connections:', error);
      throw error;
    }
  },

  connect: async (integrationId: string, redirectUri?: string): Promise<{ authorizationUrl: string } | null> => {
    try {
      const response = await integrationAPI.connect(integrationId, redirectUri);
      return response.data.data;
    } catch (error) {
      console.error('Failed to connect to integration:', error);
      throw error;
    }
  },

  disconnect: async (connectionId: string): Promise<boolean> => {
    try {
      await integrationAPI.disconnect(connectionId);
      return true;
    } catch (error) {
      console.error('Failed to disconnect from integration:', error);
      throw error;
    }
  },

  refreshConnection: async (connectionId: string): Promise<IntegrationConnection> => {
    try {
      const response = await integrationAPI.refreshConnection(connectionId);
      return response.data.data;
    } catch (error) {
      console.error('Failed to refresh connection:', error);
      throw error;
    }
  },

  getConnectionStatus: async (connectionId: string): Promise<{ connected: boolean; message?: string }> => {
    try {
      const response = await integrationAPI.getConnectionStatus(connectionId);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get connection status:', error);
      throw error;
    }
  },

  exchangeCodeForTokens: async (integrationId: string, code: string, redirectUri?: string, userId?: string): Promise<IntegrationConnection | null> => {
    try {
      const response = await integrationAPI.exchangeCodeForTokens(integrationId, code, redirectUri, userId);
      return response.data.data;
    } catch (error) {
      console.error('Failed to exchange code for tokens:', error);
      throw error;
    }
  },

  getMetrics: async (): Promise<any> => {
    try {
      const response = await integrationAPI.getMetrics();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      throw error;
    }
  },

  getHealthMetrics: async (): Promise<any> => {
    try {
      const response = await integrationAPI.getHealthMetrics();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch health metrics:', error);
      throw error;
    }
  },

  initializeIntegrations: async (): Promise<any> => {
    try {
      const response = await integrationAPI.initializeIntegrations();
      return response.data.data;
    } catch (error) {
      console.error('Failed to initialize integrations:', error);
      throw error;
    }
  }
};