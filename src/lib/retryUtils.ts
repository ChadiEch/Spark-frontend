// Utility functions for retrying failed requests
import axios, { AxiosError } from 'axios';
import { toast } from '../components/ui/use-toast';

// Function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff and user feedback
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000,
  showFeedback: boolean = false
): Promise<T> => {
  let lastError: Error | AxiosError | null = null;
  
  for (let i = 0; i <= retries; i++) {
    try {
      // Show retry feedback if requested
      if (showFeedback && i > 0) {
        toast({
          title: "Retrying Request",
          description: `Attempt ${i + 1}/${retries + 1}...`,
        });
      }
      
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // If this is the last retry, throw the error
      if (i === retries) {
        // Log final error
        console.error(`Request failed after ${retries + 1} attempts:`, error);
        
        // Show final error feedback if requested
        if (showFeedback) {
          toast({
            title: "Request Failed",
            description: "The request failed after multiple attempts. Please try again later.",
            variant: 'destructive',
          });
        }
        
        throw error;
      }
      
      // Don't retry for certain error types
      if (error.response) {
        const { status } = error.response;
        // Don't retry for client errors (4xx) except for 408, 429, 502, 503, 504
        if (status >= 400 && status < 500 && 
            status !== 408 && status !== 429) {
          throw error;
        }
      }
      
      // Exponential backoff
      const delayTime = delayMs * Math.pow(2, i);
      console.log(`Request failed, retrying in ${delayTime}ms... (attempt ${i + 1}/${retries + 1})`);
      await delay(delayTime);
    }
  }
  
  throw lastError;
};

// Check if error is retryable
export const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }
  
  const { status } = error.response;
  
  // Retry for server errors and specific client errors
  return (
    status >= 500 || 
    status === 408 || // Request Timeout
    status === 429 || // Too Many Requests
    status === 502 || // Bad Gateway
    status === 503 || // Service Unavailable
    status === 504    // Gateway Timeout
  );
};

// Enhanced retry function with more detailed feedback
export const retryRequestWithFeedback = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000,
  operation: string = 'operation'
): Promise<T> => {
  return retryRequest(fn, retries, delayMs, true);
};