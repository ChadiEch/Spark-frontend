// Security service for Winnerforce Spark platform
import { securityAPI } from './apiService';

// Security service
export const securityService = {
  // Get user's security information
  getSecurityInfo: async (): Promise<any> => {
    try {
      const response = await securityAPI.getSecurityInfo();
      return response.data.data;
    } catch (error) {
      console.error('Error fetching security information:', error);
      throw error;
    }
  },

  // Change user password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await securityAPI.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Toggle two-factor authentication
  toggleTwoFactorAuth: async (enabled: boolean): Promise<any> => {
    try {
      const response = await securityAPI.toggleTwoFactorAuth(enabled);
      return response.data;
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      throw error;
    }
  },

  // Revoke a session
  revokeSession: async (sessionId: string): Promise<void> => {
    try {
      await securityAPI.revokeSession(sessionId);
    } catch (error) {
      console.error('Error revoking session:', error);
      throw error;
    }
  },

  // Revoke all sessions except current
  revokeAllSessions: async (): Promise<void> => {
    try {
      await securityAPI.revokeAllSessions();
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      throw error;
    }
  }
};