// Base service implementation for the Winnerforce Spark platform
import { BaseService, FilterOptions } from '../lib/types';
import { BaseEntity } from '../lib/types';

/**
 * Abstract base service class that implements the BaseService interface
 * Provides common functionality for all entity services
 */
export abstract class BaseServiceImpl<T extends BaseEntity> implements BaseService<T> {
  protected storageKey: string;
  protected useAPI: () => boolean;

  constructor(storageKey: string, useAPI: () => boolean) {
    this.storageKey = storageKey;
    this.useAPI = useAPI;
  }

  /**
   * Get all entities with optional filtering
   * @param filters Optional filter options
   * @returns Promise resolving to array of entities
   */
  abstract getAll(filters?: FilterOptions): Promise<T[]>;

  /**
   * Get entity by ID
   * @param id Entity ID
   * @returns Promise resolving to entity or undefined if not found
   */
  abstract getById(id: string): Promise<T | undefined>;

  /**
   * Create a new entity
   * @param data Entity data without ID and timestamps
   * @returns Promise resolving to created entity
   */
  abstract create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Update an existing entity
   * @param id Entity ID
   * @param data Partial entity data to update
   * @returns Promise resolving to updated entity or null if not found
   */
  abstract update(id: string, data: Partial<T>): Promise<T | null>;

  /**
   * Delete an entity
   * @param id Entity ID
   * @returns Promise resolving to boolean indicating success
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * Helper method to convert string dates back to Date objects
   * @param obj Object to convert
   * @returns Converted object with Date objects
   */
  protected convertDatesInObject(obj: any): any {
    if (!obj) return obj;
    
    const converted = { ...obj };
    
    // Convert known date fields
    if (converted.createdAt && typeof converted.createdAt === 'string') {
      converted.createdAt = new Date(converted.createdAt);
    }
    if (converted.updatedAt && typeof converted.updatedAt === 'string') {
      converted.updatedAt = new Date(converted.updatedAt);
    }
    
    return converted;
  }

  /**
   * Helper method to convert dates in array of objects
   * @param array Array of objects to convert
   * @returns Array of converted objects
   */
  protected convertDatesInArray(array: any[]): any[] {
    return array.map(item => this.convertDatesInObject(item));
  }

  /**
   * Helper method to generate a unique ID
   * @param prefix Prefix for the ID
   * @returns Generated unique ID
   */
  protected generateId(prefix: string = 'entity'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper method to get current timestamp
   * @returns Current date
   */
  protected getCurrentTimestamp(): Date {
    return new Date();
  }
}