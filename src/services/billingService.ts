// Billing service for Winnerforce Spark platform
import { billingAPI } from './apiService';
import { Billing, Invoice } from '../types';

// Billing service
export const billingService = {
  // Get user's billing information
  getBillingInfo: async (): Promise<Billing> => {
    try {
      const response = await billingAPI.getBillingInfo();
      return response.data.data;
    } catch (error) {
      console.error('Error fetching billing information:', error);
      throw error;
    }
  },

  // Update user's subscription
  updateSubscription: async (plan: string): Promise<Billing> => {
    try {
      const response = await billingAPI.updateSubscription(plan);
      return response.data.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Update user's payment method
  updatePaymentMethod: async (paymentMethod: Billing['paymentMethod']): Promise<Billing> => {
    try {
      const response = await billingAPI.updatePaymentMethod(paymentMethod);
      return response.data.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  // Get user's invoice history
  getInvoiceHistory: async (): Promise<Invoice[]> => {
    try {
      const response = await billingAPI.getInvoiceHistory();
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invoice history:', error);
      throw error;
    }
  },

  // Add an invoice
  addInvoice: async (invoice: Omit<Invoice, 'id' | 'date'>): Promise<Invoice> => {
    try {
      const response = await billingAPI.addInvoice(invoice);
      return response.data.data;
    } catch (error) {
      console.error('Error adding invoice:', error);
      throw error;
    }
  }
};