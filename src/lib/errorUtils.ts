// Utility functions for enhanced error handling
import { toast } from '../components/ui/use-toast';

// Enhanced error handling with user-friendly messages
export const handleApiError = (error: any, operation: string, entity: string = 'item') => {
  console.error(`Error ${operation} ${entity}:`, error);
  
  let message = '';
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        message = data?.message || `Invalid request data for ${entity}`;
        break;
      case 401:
        message = 'Authentication required. Please log in again.';
        break;
      case 403:
        message = `Access denied. You don't have permission to ${operation} this ${entity}.`;
        break;
      case 404:
        message = `${entity} not found.`;
        break;
      case 409:
        message = data?.message || `${entity} already exists.`;
        break;
      case 422:
        message = data?.message || `Unable to process ${entity} data.`;
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        message = `Server error occurred while ${operation} ${entity}. Please try again later.`;
        break;
      case 502:
      case 503:
      case 504:
        message = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        message = data?.message || `An error occurred while ${operation} ${entity}.`;
    }
  } else if (error.request) {
    // Network error
    message = `Network error occurred while ${operation} ${entity}. Please check your internet connection.`;
  } else {
    // Other errors
    message = error.message || `An unexpected error occurred while ${operation} ${entity}.`;
  }
  
  // Show toast notification
  toast({
    title: `Error ${operation} ${entity}`,
    description: message,
    variant: 'destructive',
  });
  
  return message;
};

// Success notification
export const showSuccessMessage = (operation: string, entity: string = 'item') => {
  toast({
    title: `${entity} ${operation} successfully`,
    description: `The ${entity} has been ${operation.toLowerCase()} successfully.`,
  });
};

// Loading state management
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

export const createLoadingState = (message?: string): LoadingState => ({
  isLoading: true,
  loadingMessage: message,
});

export const createLoadedState = (): LoadingState => ({
  isLoading: false,
  loadingMessage: undefined,
});

export const createErrorState = (): LoadingState => ({
  isLoading: false,
  loadingMessage: undefined,
});

// Form validation error handling
export const handleFormValidationError = (error: any, formName: string) => {
  console.error(`Form validation error in ${formName}:`, error);
  
  let message = '';
  
  if (error?.message) {
    message = error.message;
  } else if (error?.errors) {
    // Handle Zod validation errors
    const errorMessages = Object.values(error.errors).map((err: any) => err.message);
    message = errorMessages.join(', ');
  } else {
    message = `Invalid data in ${formName}. Please check your input.`;
  }
  
  // Show toast notification
  toast({
    title: `Form Validation Error`,
    description: message,
    variant: 'destructive',
  });
  
  return message;
};