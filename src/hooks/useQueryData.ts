// Custom hooks for Winnerforce Marketing Platform data management with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  userService, 
  postService, 
  campaignService, 
  taskService, 
  goalService, 
  assetService, 
  ambassadorService 
} from '@/services/dataService';
import { userAPI } from '@/services/apiService';
import { 
  User, 
  Post, 
  Campaign, 
  Task, 
  Goal, 
  Asset, 
  Ambassador 
} from '@/types';

// Types for pagination
interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  creator?: string;
  owner?: string;
  uploader?: string;
  kind?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  count: number;
}

// Helper function to safely filter out undefined values
const filterUndefined = <T>(array: (T | undefined)[]): T[] => {
  return array.filter((item): item is T => item !== undefined);
};

// Query keys for caching
const QUERY_KEYS = {
  users: 'users',
  posts: 'posts',
  campaigns: 'campaigns',
  tasks: 'tasks',
  goals: 'goals',
  assets: 'assets',
  ambassadors: 'ambassadors',
};

// Hook for user data with pagination
export const useUsersQuery = (params: PaginationParams = {}) => {
  const { page = 1, limit = 10, search, role, startDate, endDate } = params;
  
  return useQuery<PaginatedResponse<User>>({
    queryKey: [QUERY_KEYS.users, page, limit, search, role, startDate, endDate],
    queryFn: async () => {
      // Call the API with pagination and filtering parameters
      const response: any = await userService.getAll({
        page,
        limit,
        search,
        role,
        startDate,
        endDate
      });
      
      // Check if the response has pagination properties (from API)
      if (response && typeof response === 'object' && 'total' in response && 'pages' in response) {
        // Already paginated response from API
        return response as PaginatedResponse<User>;
      } else {
        // Simulate pagination for localStorage implementation
        const allUsers = Array.isArray(response) ? response : [];
        const filteredUsers = filterUndefined(allUsers);
        
        // Apply filters (in a real implementation, this would be done on the server)
        let filtered = [...filteredUsers];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(user => 
            user.name.toLowerCase().includes(searchLower) || 
            user.email.toLowerCase().includes(searchLower)
          );
        }
        
        if (role) {
          filtered = filtered.filter(user => user.role === role);
        }
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);
        
        return {
          data: paginated,
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          count: paginated.length
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev as PaginatedResponse<User>,
  });
};

// Hook for post data with pagination
export const usePostsQuery = (params: PaginationParams = {}) => {
  const { page = 1, limit = 10, search, status, creator, startDate, endDate } = params;
  
  return useQuery<PaginatedResponse<Post>>({
    queryKey: [QUERY_KEYS.posts, page, limit, search, status, creator, startDate, endDate],
    queryFn: async () => {
      // Call the API with pagination and filtering parameters
      const response: any = await postService.getAll({
        page,
        limit,
        search,
        status,
        creator,
        startDate,
        endDate
      });
      
      // Check if the response has pagination properties (from API)
      if (response && typeof response === 'object' && 'total' in response && 'pages' in response) {
        // Already paginated response from API
        return response as PaginatedResponse<Post>;
      } else {
        // Simulate pagination for localStorage implementation
        const allPosts = Array.isArray(response) ? response : [];
        const filteredPosts = filterUndefined(allPosts);
        
        // Apply filters (in a real implementation, this would be done on the server)
        let filtered = [...filteredPosts];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(post => 
            post.title.toLowerCase().includes(searchLower) || 
            (post.caption && post.caption.toLowerCase().includes(searchLower))
          );
        }
        
        if (status) {
          filtered = filtered.filter(post => post.status === status);
        }
        
        if (creator) {
          filtered = filtered.filter(post => post.createdBy && post.createdBy.id === creator);
        }
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);
        
        return {
          data: paginated,
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          count: paginated.length
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev as PaginatedResponse<Post>,
  });
};

// Hook for campaign data with pagination
export const useCampaignsQuery = (params: PaginationParams = {}) => {
  const { page = 1, limit = 10, search, status, creator, startDate, endDate } = params;
  
  return useQuery<PaginatedResponse<Campaign>>({
    queryKey: [QUERY_KEYS.campaigns, page, limit, search, status, creator, startDate, endDate],
    queryFn: async () => {
      // Call the API with pagination and filtering parameters
      const response: any = await campaignService.getAll({
        page,
        limit,
        search,
        status,
        creator,
        startDate,
        endDate
      });
      
      // Check if the response has pagination properties (from API)
      if (response && typeof response === 'object' && 'total' in response && 'pages' in response) {
        // Already paginated response from API
        return response as PaginatedResponse<Campaign>;
      } else {
        // Simulate pagination for localStorage implementation
        const allCampaigns = Array.isArray(response) ? response : [];
        const filteredCampaigns = filterUndefined(allCampaigns);
        
        // Apply filters (in a real implementation, this would be done on the server)
        let filtered = [...filteredCampaigns];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(campaign => 
            campaign.name.toLowerCase().includes(searchLower) || 
            (campaign.description && campaign.description.toLowerCase().includes(searchLower))
          );
        }
        
        if (status) {
          filtered = filtered.filter(campaign => campaign.status === status);
        }
        
        if (creator) {
          filtered = filtered.filter(campaign => campaign.createdBy && campaign.createdBy.id === creator);
        }
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);
        
        return {
          data: paginated,
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          count: paginated.length
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev as PaginatedResponse<Campaign>,
  });
};

// Hook for task data with pagination
export const useTasksQuery = (params: PaginationParams = {}) => {
  const { page = 1, limit = 10, search, status, priority, assignee, startDate, endDate } = params;
  
  return useQuery<PaginatedResponse<Task>>({
    queryKey: [QUERY_KEYS.tasks, page, limit, search, status, priority, assignee, startDate, endDate],
    queryFn: async () => {
      // Call the API with pagination and filtering parameters
      const response: any = await taskService.getAll({
        page,
        limit,
        search,
        status,
        priority,
        assignee,
        startDate,
        endDate
      });
      
      // Check if the response has pagination properties (from API)
      if (response && typeof response === 'object' && 'total' in response && 'pages' in response) {
        // Already paginated response from API
        return response as PaginatedResponse<Task>;
      } else {
        // Simulate pagination for localStorage implementation
        const allTasks = Array.isArray(response) ? response : [];
        const filteredTasks = filterUndefined(allTasks);
        
        // Apply filters (in a real implementation, this would be done on the server)
        let filtered = [...filteredTasks];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(task => 
            task.title.toLowerCase().includes(searchLower) || 
            (task.description && task.description.toLowerCase().includes(searchLower))
          );
        }
        
        if (status) {
          filtered = filtered.filter(task => task.status === status);
        }
        
        if (priority) {
          filtered = filtered.filter(task => task.priority === priority);
        }
        
        if (assignee) {
          filtered = filtered.filter(task => 
            task.assignees && task.assignees.some(a => a.id === assignee)
          );
        }
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);
        
        return {
          data: paginated,
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          count: paginated.length
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev as PaginatedResponse<Task>,
  });
};

// Hook for goal data with pagination
export const useGoalsQuery = (params: PaginationParams = {}) => {
  const { page = 1, limit = 10, search, status, owner, startDate, endDate } = params;
  
  return useQuery<PaginatedResponse<Goal>>({
    queryKey: [QUERY_KEYS.goals, page, limit, search, status, owner, startDate, endDate],
    queryFn: async () => {
      // Call the API with pagination and filtering parameters
      const response: any = await goalService.getAll({
        page,
        limit,
        search,
        status,
        owner,
        startDate,
        endDate
      });
      
      // Check if the response has pagination properties (from API)
      if (response && typeof response === 'object' && 'total' in response && 'pages' in response) {
        // Already paginated response from API
        return response as PaginatedResponse<Goal>;
      } else {
        // Simulate pagination for localStorage implementation
        const allGoals = Array.isArray(response) ? response : [];
        const filteredGoals = filterUndefined(allGoals);
        
        // Apply filters (in a real implementation, this would be done on the server)
        let filtered = [...filteredGoals];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(goal => 
            goal.title.toLowerCase().includes(searchLower)
          );
        }
        
        if (status) {
          filtered = filtered.filter(goal => goal.status === status);
        }
        
        if (owner) {
          filtered = filtered.filter(goal => goal.owner && goal.owner.id === owner);
        }
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);
        
        return {
          data: paginated,
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          count: paginated.length
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev as PaginatedResponse<Goal>,
  });
};

// Hook for asset data with pagination
export const useAssetsQuery = (params: PaginationParams = {}) => {
  const { page = 1, limit = 10, search, kind, uploader, startDate, endDate } = params;
  
  return useQuery<PaginatedResponse<Asset>>({
    queryKey: [QUERY_KEYS.assets, page, limit, search, kind, uploader, startDate, endDate],
    queryFn: async () => {
      // Call the API with pagination and filtering parameters
      const response: any = await assetService.getAll({
        page,
        limit,
        search,
        kind,
        uploader,
        startDate,
        endDate
      });
      
      // Check if the response has pagination properties (from API)
      if (response && typeof response === 'object' && 'total' in response && 'pages' in response) {
        // Already paginated response from API
        return response as PaginatedResponse<Asset>;
      } else {
        // Simulate pagination for localStorage implementation
        const allAssets = Array.isArray(response) ? response : [];
        const filteredAssets = filterUndefined(allAssets);
        
        // Apply filters (in a real implementation, this would be done on the server)
        let filtered = [...filteredAssets];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(asset => 
            asset.name.toLowerCase().includes(searchLower)
          );
        }
        
        if (kind) {
          filtered = filtered.filter(asset => asset.kind === kind);
        }
        
        if (uploader) {
          filtered = filtered.filter(asset => asset.uploadedBy && asset.uploadedBy.id === uploader);
        }
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);
        
        return {
          data: paginated,
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          count: paginated.length
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev as PaginatedResponse<Asset>,
  });
};

// Hook for ambassador data with pagination
export const useAmbassadorsQuery = (params: PaginationParams = {}) => {
  const { page = 1, limit = 10, search, startDate, endDate } = params;
  
  return useQuery<PaginatedResponse<Ambassador>>({
    queryKey: [QUERY_KEYS.ambassadors, page, limit, search, startDate, endDate],
    queryFn: async () => {
      // Call the API with pagination and filtering parameters
      const response: any = await ambassadorService.getAll({
        page,
        limit,
        search,
        startDate,
        endDate
      });
      
      // Check if the response has pagination properties (from API)
      if (response && typeof response === 'object' && 'total' in response && 'pages' in response) {
        // Already paginated response from API
        return response as PaginatedResponse<Ambassador>;
      } else {
        // Simulate pagination for localStorage implementation
        const allAmbassadors = Array.isArray(response) ? response : [];
        const filteredAmbassadors = filterUndefined(allAmbassadors);
        
        // Apply filters (in a real implementation, this would be done on the server)
        let filtered = [...filteredAmbassadors];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(ambassador => 
            ambassador.name.toLowerCase().includes(searchLower) || 
            ambassador.email.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);
        
        return {
          data: paginated,
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          count: paginated.length
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev as PaginatedResponse<Ambassador>,
  });
};

// Mutation hooks for data operations
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => 
      userService.register(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<User> }) => 
      userService.update(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};

// Similar mutation hooks can be created for other entities as needed