import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';

export const useRoleCheck = () => {
  const { user } = useAuth();

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  const isAuthorized = (requiredRoles: Role | Role[], action?: string): boolean => {
    if (!user) return false;
    
    // ADMIN can do everything
    if (user.role === 'ADMIN') return true;
    
    // MANAGER can do most things
    if (user.role === 'MANAGER') {
      // There might be specific actions that only ADMIN can do
      if (action === 'deleteUser' || action === 'createUser') {
        return false;
      }
      return true;
    }
    
    // Check if user has one of the required roles
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    
    return user.role === requiredRoles;
  };

  const canView = (resource: string): boolean => {
    if (!user) return false;
    
    // ADMIN can view everything
    if (user.role === 'ADMIN') return true;
    
    // MANAGER can view most resources
    if (user.role === 'MANAGER') {
      // Define what MANAGER can see
      const viewableResources = [
        'dashboard',
        'calendar',
        'posts',
        'goals',
        'activities',
        'tasks',
        'ambassadors',
        'assets',
        'analytics',
        'settings'
      ];
      
      return viewableResources.includes(resource) || resource === 'ambassadors';
    }
    
    // CONTRIBUTOR can view most resources
    if (user.role === 'CONTRIBUTOR') {
      const viewableResources = [
        'dashboard',
        'calendar',
        'posts',
        'goals',
        'activities',
        'tasks',
        'ambassadors',
        'assets',
        'analytics'
      ];
      
      return viewableResources.includes(resource);
    }
    
    // VIEWER has limited viewing rights
    if (user.role === 'VIEWER') {
      // Define what VIEWER can see
      const viewableResources = [
        'dashboard',
        'analytics',
        'publishedPosts',
        'activeCampaigns',
        'assignedTasks',
        'ambassadors'
      ];
      
      return viewableResources.includes(resource);
    }
    
    return false;
  };

  const canEdit = (resource: string): boolean => {
    if (!user) return false;
    
    // ADMIN can edit everything
    if (user.role === 'ADMIN') return true;
    
    // MANAGER can edit most resources
    if (user.role === 'MANAGER') {
      const editableResources = [
        'posts',
        'goals',
        'activities',
        'tasks',
        'ambassadors',
        'assets',
        'campaigns'
      ];
      
      return editableResources.includes(resource);
    }
    
    // CONTRIBUTOR can edit most resources they own
    if (user.role === 'CONTRIBUTOR') {
      const editableResources = [
        'ownPosts',
        'assignedTasks',
        'ownGoals',
        'ownAssets',
        'ambassadors' // Allow contributors to interact with ambassadors
      ];
      
      return editableResources.includes(resource);
    }
    
    // VIEWER cannot edit anything
    return false;
  };

  const canCreate = (resource: string): boolean => {
    if (!user) return false;
    
    // ADMIN can create everything
    if (user.role === 'ADMIN') return true;
    
    // MANAGER and CONTRIBUTOR can create resources
    if (['MANAGER', 'CONTRIBUTOR'].includes(user.role)) {
      const creatableResources = [
        'posts',
        'tasks',
        'goals',
        'assets',
        'campaigns',
        'ambassadors' // Allow creating ambassadors
      ];
      
      return creatableResources.includes(resource);
    }
    
    // VIEWER cannot create anything
    return false;
  };

  const canDelete = (resource: string): boolean => {
    if (!user) return false;
    
    // Only ADMIN can delete most resources
    if (user.role === 'ADMIN') return true;
    
    // MANAGER can delete some resources
    if (user.role === 'MANAGER') {
      const deletableResources = [
        'posts',
        'tasks',
        'goals',
        'assets',
        'ambassadors' // Allow deleting ambassadors
      ];
      
      return deletableResources.includes(resource);
    }
    
    // CONTRIBUTOR can delete their own resources
    if (user.role === 'CONTRIBUTOR') {
      const deletableResources = [
        'ownPosts',
        'ownTasks',
        'ownGoals',
        'ownAssets'
      ];
      
      return deletableResources.includes(resource);
    }
    
    // VIEWER cannot delete anything
    return false;
  };

  return {
    userRole: user?.role,
    hasRole,
    isAuthorized,
    canView,
    canEdit,
    canCreate,
    canDelete
  };
};