// Generic service utility to reduce code duplication in data services
import { handleApiError, showSuccessMessage } from '../lib/errorUtils';
import { BaseServiceImpl } from './BaseService';
import { BaseEntity } from '../lib/types';

interface APIFunctions<T> {
  getAll: (params?: any) => Promise<any>;
  getById: (id: string) => Promise<any>;
  create?: (data: Partial<T>) => Promise<any>;
  update: (id: string, data: Partial<T>) => Promise<any>;
  delete: (id: string) => Promise<any>;
}

interface ServiceConfig<T extends BaseEntity> {
  storageKey: string;
  apiFunctions?: APIFunctions<T>;
  useAPI: () => boolean;
  convertDatesInObject: (obj: any) => any;
  convertDatesInArray: (array: any[]) => any[];
  idPrefix?: string;
}

/**
 * Generic service class that extends BaseServiceImpl to provide standard CRUD operations
 */
export class GenericService<T extends BaseEntity> extends BaseServiceImpl<T> {
  private apiFunctions?: APIFunctions<T>;
  private idPrefix: string;

  constructor(config: ServiceConfig<T>) {
    super(config.storageKey, config.useAPI);
    this.apiFunctions = config.apiFunctions;
    this.idPrefix = config.idPrefix || config.storageKey.substring(0, 4);
  }

  /**
   * Get all items
   */
  async getAll(params?: any): Promise<T[]> {
    try {
      if (this.useAPI() && this.apiFunctions) {
        const response = await this.apiFunctions.getAll(params);
        const items = response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : [];
        return this.convertDatesInArray(items); // Use inherited method
      } else {
        // When not using API, return empty array instead of mock data
        const items = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        // Convert string dates back to Date objects
        return this.convertDatesInArray(items); // Use inherited method
      }
    } catch (error) {
      console.error(`Error fetching ${this.storageKey}:`, error);
      return [];
    }
  }

  /**
   * Get item by ID
   */
  async getById(id: string): Promise<T | undefined> {
    try {
      if (this.useAPI() && this.apiFunctions) {
        const response = await this.apiFunctions.getById(id);
        return response.data && (response.data as any).data ? this.convertDatesInObject((response.data as any).data) : undefined; // Use inherited method
      } else {
        const items = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const item = items.find((item: T & { id: string }) => item.id === id);
        // Convert string dates back to Date objects
        return item ? this.convertDatesInObject(item) : undefined; // Use inherited method
      }
    } catch (error) {
      console.error(`Error fetching ${this.storageKey} by ID:`, error);
      return undefined;
    }
  }

  /**
   * Create a new item
   */
  async create(itemData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      if (this.useAPI() && this.apiFunctions && this.apiFunctions.create) {
        const response = await this.apiFunctions.create(itemData as any);
        return response.data && (response.data as any).data ? this.convertDatesInObject((response.data as any).data) : {
          ...(itemData as any),
          id: this.generateId(this.idPrefix),
          createdAt: this.getCurrentTimestamp(),
          updatedAt: this.getCurrentTimestamp()
        } as T;
      } else {
        // For now, we'll keep the existing localStorage implementation
        const items = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const newItem: T = {
          ...(itemData as any),
          id: this.generateId(this.idPrefix),
          createdAt: this.getCurrentTimestamp(),
          updatedAt: this.getCurrentTimestamp()
        } as T;
        
        items.push(newItem);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
        
        return newItem;
      }
    } catch (error) {
      console.error(`Error creating ${this.storageKey}:`, error);
      // Return a default item in case of error
      return {
        ...(itemData as any),
        id: this.generateId(this.idPrefix),
        createdAt: this.getCurrentTimestamp(),
        updatedAt: this.getCurrentTimestamp()
      } as T;
    }
  }

  /**
   * Update an existing item
   */
  async update(id: string, itemData: Partial<T>): Promise<T | null> {
    try {
      if (this.useAPI() && this.apiFunctions) {
        const response = await this.apiFunctions.update(id, itemData as any);
        return response.data && (response.data as any).data ? this.convertDatesInObject((response.data as any).data) : null; // Use inherited method
      } else {
        // For now, we'll keep the existing localStorage implementation
        const items = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const index = items.findIndex((item: T & { id: string }) => item.id === id);
        
        if (index === -1) return null;
        
        const updatedItem = {
          ...items[index],
          ...itemData,
          updatedAt: this.getCurrentTimestamp()
        };
        
        items[index] = updatedItem;
        localStorage.setItem(this.storageKey, JSON.stringify(items));
        
        return updatedItem;
      }
    } catch (error) {
      console.error(`Error updating ${this.storageKey}:`, error);
      return null;
    }
  }

  /**
   * Delete an item
   */
  async delete(id: string): Promise<boolean> {
    try {
      console.log(`Attempting to delete ${this.storageKey} with ID:`, id);
      // Validate ID parameter
      if (!id || id === 'undefined' || id === 'null') {
        console.error(`Invalid ${this.storageKey} ID:`, id);
        handleApiError(new Error(`Invalid ${this.storageKey} ID`), 'deleting', this.storageKey);
        return false;
      }
      
      if (this.useAPI() && this.apiFunctions) {
        const response = await this.apiFunctions.delete(id);
        console.log(`Delete ${this.storageKey} response:`, response);
        // Check if the response indicates success
        // The API returns { success: true, data: {} } on successful deletion
        const success = response.data?.success === true;
        if (success) {
          showSuccessMessage('deleted', this.storageKey);
        }
        return success;
      } else {
        // For now, we'll keep the existing localStorage implementation
        const items = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const filteredItems = items.filter((item: T & { id: string }) => item.id !== id);
      
        if (filteredItems.length === items.length) {
          handleApiError(new Error(`${this.storageKey} not found`), 'deleting', this.storageKey);
          return false;
        }
      
        localStorage.setItem(this.storageKey, JSON.stringify(filteredItems));
        showSuccessMessage('deleted', this.storageKey);
        return true;
      }
    } catch (error: any) {
      console.error(`Error deleting ${this.storageKey}:`, error);
      // Log detailed error information
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      handleApiError(error, 'deleting', this.storageKey);
      return false;
    }
  }
}