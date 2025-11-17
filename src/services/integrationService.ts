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
  exchangeCodeForTokens: (integrationId: string, code: string, redirectUri?: string) => {
    // Use the redirect URI from the environment or default to the frontend callback
    const finalRedirectUri = redirectUri || `${window.location.origin}/integrations/callback`;
    const data: any = { integrationId, code, redirectUri: finalRedirectUri };
    
    console.log('Sending exchange code request', { integrationId, code: code ? 'present' : 'missing', redirectUri: finalRedirectUri });
    
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

// Simple integration service for local development
export const simpleIntegrationService = {
  integrations: [
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your Instagram Business account',
      key: 'instagram',
      icon: 'instagram',
      category: 'social',
      clientId: 'instagram_client_id',
      clientSecret: 'instagram_client_secret',
      redirectUri: 'http://localhost:5173/integrations/callback',
      scopes: ['read', 'write'],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Manage Facebook Pages and ads',
      key: 'facebook',
      icon: 'facebook',
      category: 'social',
      clientId: 'facebook_client_id',
      clientSecret: 'facebook_client_secret',
      redirectUri: 'http://localhost:5173/integrations/callback',
      scopes: ['read', 'write'],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Schedule and publish TikTok videos',
      key: 'tiktok',
      icon: 'tiktok',
      category: 'social',
      clientId: 'tiktok_client_id',
      clientSecret: 'tiktok_client_secret',
      redirectUri: 'http://localhost:5173/integrations/callback',
      scopes: ['read', 'write'],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Upload and manage YouTube content',
      key: 'youtube',
      icon: 'youtube',
      category: 'social',
      clientId: 'youtube_client_id',
      clientSecret: 'youtube_client_secret',
      redirectUri: 'http://localhost:5173/integrations/callback',
      scopes: ['read', 'write'],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Connect your Google Drive for file storage and sharing',
      key: 'google-drive',
      icon: 'google-drive',
      category: 'storage',
      clientId: 'google-drive_client_id',
      clientSecret: 'google-drive_client_secret',
      redirectUri: 'http://localhost:5173/integrations/callback',
      scopes: ['read', 'write'],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as Integration[],
  
  connections: [] as IntegrationConnection[],
  
  getAll: async (): Promise<Integration[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return simpleIntegrationService.integrations;
  },
  
  getUserConnections: async (): Promise<IntegrationConnection[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return simpleIntegrationService.connections;
  },
  
  connect: async (integrationId: string): Promise<{ authorizationUrl: string } | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the integration
    const integration = simpleIntegrationService.integrations.find(i => i.id === integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }
    
    // For demo purposes, we'll return a mock authorization URL
    // In a real implementation, this would redirect to the OAuth provider
    const authorizationUrl = `/oauth/${integration.key}?redirect_uri=${encodeURIComponent(window.location.origin + '/integrations/callback')}`;
    
    return { authorizationUrl };
  },
  
  disconnect: async (connectionId: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove the connection
    simpleIntegrationService.connections = simpleIntegrationService.connections.filter(c => c.id !== connectionId);
    
    return true;
  },
  
  handleOAuthCallback: async (integrationId: string, code: string): Promise<IntegrationConnection | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a new connection
    const newConnection: IntegrationConnection = {
      id: `conn_${Date.now()}`,
      integrationId,
      userId: 'current_user_id', // This would come from the auth context in a real app
      accessToken: `access_token_${code}`,
      refreshToken: `refresh_token_${code}`,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      scope: 'read,write',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to connections
    simpleIntegrationService.connections.push(newConnection);
    
    return newConnection;
  },
  
  exchangeCodeForTokens: async (integrationId: string, code: string): Promise<IntegrationConnection | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a new connection
    const newConnection: IntegrationConnection = {
      id: `conn_${Date.now()}`,
      integrationId,
      userId: 'current_user_id', // This would come from the auth context in a real app
      accessToken: `access_token_${code}`,
      refreshToken: `refresh_token_${code}`,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      scope: 'read,write',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to connections
    simpleIntegrationService.connections.push(newConnection);
    
    return newConnection;
  }
};

// Main integration service
export const integrationService = {
  getAll: async (): Promise<Integration[]> => {
    try {
      // Try to use the real API
      console.log('Fetching integrations from API...');
      const response = await integrationAPI.getAll();
      console.log('API response:', response);
      
      // Check if response has data
      if (response && response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.warn('Failed to fetch integrations from API, using local data:', error);
      // Fallback to simple service
      const localData = await simpleIntegrationService.getAll();
      console.log('Using local integration data:', localData);
      return localData;
    }
  },
  
  getUserConnections: async (): Promise<IntegrationConnection[]> => {
    try {
      // Try to use the real API
      console.log('Fetching user connections from API...');
      const response = await integrationAPI.getUserConnections();
      console.log('API response:', response);
      
      // Check if response has data
      if (response && response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.warn('Failed to fetch integration connections from API, using local data:', error);
      // Fallback to simple service
      const localData = await simpleIntegrationService.getUserConnections();
      console.log('Using local connection data:', localData);
      return localData;
    }
  },
  
  connect: async (integrationId: string): Promise<{ authorizationUrl: string } | null> => {
    try {
      // Use the redirect URI from the environment or default to the frontend callback
      const redirectUri = `${window.location.origin}/integrations/callback`;
      // Try to use the real API
      const response = await integrationAPI.connect(integrationId, redirectUri);
      return response.data.data;
    } catch (error) {
      console.error('Failed to connect to integration via API:', error);
      // Don't fallback to simple service for connect - re-throw the error
      throw error;
    }
  },
  
  disconnect: async (connectionId: string): Promise<boolean> => {
    try {
      // Try to use the real API
      await integrationAPI.disconnect(connectionId);
      return true;
    } catch (error) {
      console.warn('Failed to disconnect from integration via API, using local simulation:', error);
      // Fallback to simple service
      return await simpleIntegrationService.disconnect(connectionId);
    }
  },
  
  handleOAuthCallback: async (integrationId: string, code: string): Promise<IntegrationConnection | null> => {
    // This would typically be handled by the backend in a real implementation
    return await simpleIntegrationService.handleOAuthCallback(integrationId, code);
  },
  
  exchangeCodeForTokens: async (integrationId: string, code: string, redirectUri?: string): Promise<IntegrationConnection | null> => {
    try {
      // Try to use the real API
      console.log('Attempting to exchange code for tokens via API', { integrationId, code: code ? 'present' : 'missing', redirectUri });
      const response = await integrationAPI.exchangeCodeForTokens(integrationId, code, redirectUri);
      console.log('API exchange response', response);
      
      // Handle redirect if provided in response
      if (response && response.data && (response.data as any).redirectUrl) {
        console.log('Redirecting to:', (response.data as any).redirectUrl);
        // Use window.location for full page redirect
        window.location.href = (response.data as any).redirectUrl;
        return response.data.data;
      }
      
      return response.data.data;
    } catch (error: any) {
      console.warn('Failed to exchange code for tokens via API:', error);
      
      // Check if it's a network error or server error
      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received from server:', error.request);
      } else {
        // Something else happened
        console.error('Error setting up request:', error.message);
      }
      
      // Fallback to simple service
      return await simpleIntegrationService.exchangeCodeForTokens(integrationId, code);
    }
  },
  
  refreshConnection: async (connectionId: string): Promise<IntegrationConnection> => {
    try {
      // Try to use the real API
      const response = await integrationAPI.refreshConnection(connectionId);
      return response.data.data;
    } catch (error) {
      console.error('Failed to refresh connection via API:', error);
      throw error;
    }
  },
  
  getHealthMetrics: async (): Promise<any> => {
    try {
      // Use the real API
      const response = await integrationAPI.getHealthMetrics();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch health metrics via API:', error);
      throw error;
    }
  },
  
  initializeIntegrations: async (): Promise<any> => {
    try {
      // Use the real API
      const response = await integrationAPI.initializeIntegrations();
      return response.data.data;
    } catch (error) {
      console.error('Failed to initialize integrations via API:', error);
      throw error;
    }
  }
};
