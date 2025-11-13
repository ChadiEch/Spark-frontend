// Generic hook for entity management with TypeScript generics
import { useState, useCallback } from 'react';
import { UseDataResult } from '@/lib/types';

interface UseGenericEntityOptions<T> {
  onCreate?: (entity: T) => Promise<T | null>;
  onUpdate?: (id: string, entity: Partial<T>) => Promise<T | null>;
  onDelete?: (id: string) => Promise<boolean>;
}

export function useGenericEntity<T extends { id: string }>(
  initialData: T[] = [],
  options: UseGenericEntityOptions<T> = {}
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEntity = useCallback(async (entity: Omit<T, 'id'>) => {
    if (!options.onCreate) {
      console.warn('onCreate function not provided');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const newEntity = await options.onCreate(entity as T);
      if (newEntity) {
        setData(prev => [...prev, newEntity]);
        return newEntity;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to create entity');
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.onCreate]);

  const updateEntity = useCallback(async (id: string, entity: Partial<T>) => {
    if (!options.onUpdate) {
      console.warn('onUpdate function not provided');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedEntity = await options.onUpdate(id, entity);
      if (updatedEntity) {
        setData(prev => prev.map(item => item.id === id ? updatedEntity : item));
        return updatedEntity;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to update entity');
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.onUpdate]);

  const deleteEntity = useCallback(async (id: string) => {
    if (!options.onDelete) {
      console.warn('onDelete function not provided');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      const success = await options.onDelete(id);
      if (success) {
        setData(prev => prev.filter(item => item.id !== id));
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to delete entity');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.onDelete]);

  const refreshData = useCallback(async (fetchFunction: () => Promise<T[]>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    createEntity,
    updateEntity,
    deleteEntity,
    refreshData
  } as UseDataResult<T> & {
    createEntity: (entity: Omit<T, 'id'>) => Promise<T | null>;
    updateEntity: (id: string, entity: Partial<T>) => Promise<T | null>;
    deleteEntity: (id: string) => Promise<boolean>;
    refreshData: (fetchFunction: () => Promise<T[]>) => Promise<void>;
  };
}