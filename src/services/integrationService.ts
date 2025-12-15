// Integration service for Winnerforce Spark platform
import { Integration, IntegrationConnection } from '../types';
import { integrationAPI } from './apiService';
import { handleApiError } from '../lib/errorUtils';

// Integration service
export const integrationService = {
  getAll: async (): Promise<Integration[]> => {
    try {
      const response = await integrationAPI.getAll();
      return response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
    } catch (error) {
      handleApiError(error, 'fetching', 'integrations');
      return [];
    }
  },

  getUserConnections: async (): Promise<IntegrationConnection[]> => {
    try {
      const response = await integrationAPI.getUserConnections();
      return response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
    } catch (error) {
      handleApiError(error, 'fetching', 'integration connections');
      return [];
    }
  },

  connect: async (integrationId: string, redirectUri: string): Promise<any> => {
    try {
      // This would typically redirect the user to the OAuth flow
      // For now, we'll just simulate the connection process
      window.location.href = `/api/integrations/connect?integrationId=${integrationId}&redirectUri=${encodeURIComponent(redirectUri)}`;
      return { success: true };
    } catch (error) {
      handleApiError(error, 'connecting', 'integration');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  disconnect: async (connectionId: string): Promise<boolean> => {
    try {
      const response = await integrationAPI.disconnect(connectionId);
      return response.data?.success === true;
    } catch (error) {
      handleApiError(error, 'disconnecting', 'integration');
      return false;
    }
  },

  refresh: async (connectionId: string): Promise<IntegrationConnection | null> => {
    try {
      const response = await integrationAPI.refresh(connectionId);
      return response.data && (response.data as any).data ? (response.data as any).data : null;
    } catch (error) {
      handleApiError(error, 'refreshing', 'integration connection');
      return null;
    }
  },

  getStatus: async (connectionId: string): Promise<any> => {
    try {
      const response = await integrationAPI.getStatus(connectionId);
      return response.data;
    } catch (error) {
      handleApiError(error, 'checking', 'integration status');
      return null;
    }
  },

  exchangeCodeForTokens: async (
    integrationId: string, 
    code: string, 
    redirectUri: string,
    userId: string
  ): Promise<IntegrationConnection | null> => {
    try {
      // Exchange the authorization code for access tokens
      const response = await fetch('/api/integrations/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrationId,
          code,
          redirectUri,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange code for tokens: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      handleApiError(error, 'exchanging', 'authorization code');
      return null;
    }
  },

  initializeIntegrations: async (): Promise<any> => {
    try {
      // Check if we're on Railway - if so, skip initialization as it's handled automatically
      if (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
        console.log('Skipping integration initialization on Railway - handled automatically');
        return { success: true, message: 'Initialization handled automatically on Railway' };
      }
      
      const response = await fetch('/api/integrations/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize integrations: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      handleApiError(error, 'initializing', 'integrations');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};