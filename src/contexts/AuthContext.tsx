import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { simpleUserService } from '@/services/simpleUserService';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<User | null>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Initializing authentication...');
        
        // Check if we have cached user data to avoid unnecessary API calls
        const cachedUser = localStorage.getItem('winnerforce_current_user');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            // Check if the cached user data is recent (less than 5 minutes old)
            const cacheTime = localStorage.getItem('winnerforce_auth_cache_time');
            if (cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
              setUser(parsedUser);
              console.log('AuthProvider: Using cached user data');
              setIsLoading(false);
              return;
            }
          } catch (e) {
            // If parsing fails, continue with normal authentication
            console.log('AuthProvider: Failed to parse cached user data, continuing with normal auth');
          }
        }
        
        // Add a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication check timed out')), 5000)
        );
        
        const authPromise = simpleUserService.getCurrentUser();
        
        // Race the authentication check against the timeout
        const currentUser = await Promise.race([authPromise, timeoutPromise])
          .catch(error => {
            console.error('AuthProvider: Authentication check failed or timed out:', error);
            return null;
          }) as User | null;
          
        if (currentUser) {
          setUser(currentUser);
          // Cache the user data
          localStorage.setItem('winnerforce_current_user', JSON.stringify(currentUser));
          localStorage.setItem('winnerforce_auth_cache_time', Date.now().toString());
          console.log('AuthProvider: User authenticated:', currentUser.email);
        } else {
          console.log('AuthProvider: No authenticated user found');
          // Clear cache if no user found
          localStorage.removeItem('winnerforce_current_user');
          localStorage.removeItem('winnerforce_auth_cache_time');
        }
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error);
        // Even if there's an error, we still need to finish loading
        setUser(null);
        // Clear cache on error
        localStorage.removeItem('winnerforce_current_user');
        localStorage.removeItem('winnerforce_auth_cache_time');
      } finally {
        setIsLoading(false);
        console.log('AuthProvider: Authentication check completed');
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting login with', { email });
      // Import the userService login function dynamically to avoid circular dependencies
      const { userService } = await import('@/services/dataService');
      const loggedInUser = await userService.login(email, password);
      console.log('AuthContext: Login result', loggedInUser);
      if (loggedInUser) {
        setUser(loggedInUser);
        return loggedInUser;
      }
      // If we get here, authentication failed but no error was thrown
      throw new Error('Invalid email or password');
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Login request timed out. Please try again.');
      }
      // Re-throw the error so the UI can handle it
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    // Import the userService logout function dynamically to avoid circular dependencies
    import('@/services/dataService').then(({ userService }) => {
      userService.logout();
    }).catch(error => {
      console.error('Error during logout:', error);
    });
    
    setUser(null);
    // Clear any stored tokens and cache
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('winnerforce_current_user');
    localStorage.removeItem('winnerforce_auth_cache_time');
    localStorage.removeItem('rememberMe');
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) return null;
      
      // Update user through userService
      const { userService } = await import('@/services/dataService');
      const updatedUser = await userService.update(user.id, userData);
      if (updatedUser) {
        setUser(updatedUser);
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('AuthContext: Update profile error:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}