// Common TypeScript types and generics for the Winnerforce Spark platform

/**
 * Base entity interface that all entities should extend
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generic response type for API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Generic paginated response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
}

/**
 * Generic filter options for queries
 */
export interface FilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic service interface that all services should implement
 */
export interface BaseService<T extends BaseEntity> {
  getAll(filters?: FilterOptions): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Generic hook options for data management
 */
export interface UseDataOptions<T extends BaseEntity> {
  service: BaseService<T>;
  filters?: FilterOptions;
}

/**
 * Generic result type for data hooks
 */
export interface UseDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
}

/**
 * Utility type to make specific properties optional
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/**
 * Utility type to make specific properties required
 */
export type RequiredProperties<T, K extends keyof T> = Pick<Required<T>, K> & Omit<T, K>;

/**
 * Utility type for creating a type with only specific properties
 */
export type PickProperties<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Utility type for removing specific properties from a type
 */
export type OmitProperties<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Generic type for form data that omits id and timestamp fields
 */
export type FormData<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Generic type for update data that makes all properties optional except id
 */
export type UpdateData<T extends BaseEntity> = Partial<Omit<T, 'id'>> & { id: string };

/**
 * Generic type for API error responses
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Generic type for success messages
 */
export interface SuccessMessage {
  message: string;
  data?: any;
}

/**
 * Generic type for validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Generic type for bulk operations
 */
export interface BulkOperationResult {
  successCount: number;
  failureCount: number;
  errors: ValidationError[];
}