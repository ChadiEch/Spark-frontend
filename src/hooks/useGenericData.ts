// Generic hook for data management with TypeScript generics
import { useState, useEffect, useCallback } from 'react';
import { retryRequest } from '../lib/retryUtils';

interface UseGenericDataOptions<T> {
  fetchData: () => Promise<T[]>;
  createItem?: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
  updateItem?: (id: string, item: Partial<T>) => Promise<T | null>;
  deleteItem?: (id: string) => Promise<boolean>;
  trashItem?: (id: string) => Promise<boolean>;
  restoreItem?: (id: string) => Promise<boolean>;
}

interface UseGenericDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  addItem?: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T | null>;
  updateItem?: (id: string, item: Partial<T>) => Promise<T | null>;
  deleteItem?: (id: string) => Promise<boolean>;
  trashItem?: (id: string) => Promise<boolean>;
  restoreItem?: (id: string) => Promise<boolean>;
}

/**
 * Generic hook for managing data with CRUD operations
 * @template T The type of data being managed
 * @param options Configuration options for the hook
 * @returns Object containing data, loading state, error state, and CRUD functions
 */
export const useGenericData = <T extends { id: string; createdAt: Date; updatedAt: Date }>(
  options: UseGenericDataOptions<T>
): UseGenericDataResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await retryRequest(() => options.fetchData(), 2);
      setData(result);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      setData([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItem = useCallback(async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!options.createItem) {
      console.warn('createItem function not provided');
      return null;
    }

    try {
      const newItem = await retryRequest(() => options.createItem!(item), 2);
      if (newItem) {
        setData(prev => [...prev, newItem]);
        return newItem;
      }
      return null;
    } catch (err: any) {
      console.error('Error adding item:', err);
      setError(err.message || 'Failed to add item');
      return null;
    }
  }, [options.createItem]);

  const updateItem = useCallback(async (id: string, item: Partial<T>) => {
    if (!options.updateItem) {
      console.warn('updateItem function not provided');
      return null;
    }

    try {
      const updatedItem = await retryRequest(() => options.updateItem!(id, item), 2);
      if (updatedItem) {
        setData(prev => prev.map(d => d.id === id ? updatedItem : d));
        return updatedItem;
      }
      return null;
    } catch (err: any) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update item');
      return null;
    }
  }, [options.updateItem]);

  const deleteItem = useCallback(async (id: string) => {
    if (!options.deleteItem) {
      console.warn('deleteItem function not provided');
      return false;
    }

    try {
      const success = await retryRequest(() => options.deleteItem!(id), 2);
      if (success) {
        setData(prev => prev.filter(d => d.id !== id));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error deleting item:', err);
      setError(err.message || 'Failed to delete item');
      return false;
    }
  }, [options.deleteItem]);

  const trashItem = useCallback(async (id: string) => {
    if (!options.trashItem) {
      console.warn('trashItem function not provided');
      return false;
    }

    try {
      const success = await retryRequest(() => options.trashItem!(id), 2);
      if (success) {
        // Refresh data to reflect the change
        fetchData();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error trashing item:', err);
      setError(err.message || 'Failed to trash item');
      return false;
    }
  }, [options.trashItem, fetchData]);

  const restoreItem = useCallback(async (id: string) => {
    if (!options.restoreItem) {
      console.warn('restoreItem function not provided');
      return false;
    }

    try {
      const success = await retryRequest(() => options.restoreItem!(id), 2);
      if (success) {
        // Refresh data to reflect the change
        fetchData();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error restoring item:', err);
      setError(err.message || 'Failed to restore item');
      return false;
    }
  }, [options.restoreItem, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    addItem: options.createItem ? addItem : undefined,
    updateItem: options.updateItem ? updateItem : undefined,
    deleteItem: options.deleteItem ? deleteItem : undefined,
    trashItem: options.trashItem ? trashItem : undefined,
    restoreItem: options.restoreItem ? restoreItem : undefined
  };
};