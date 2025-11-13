import React from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { Role } from '@/types';

interface RoleBasedContentProps {
  allowedRoles: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null 
}) => {
  const { hasRole } = useRoleCheck();
  
  if (hasRole(allowedRoles)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

interface RoleBasedActionProps {
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedAction: React.FC<RoleBasedActionProps> = ({ 
  action, 
  children, 
  fallback = null 
}) => {
  const { isAuthorized } = useRoleCheck();
  
  if (isAuthorized(['ADMIN', 'MANAGER', 'CONTRIBUTOR'], action)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

interface ResourceBasedContentProps {
  resource: string;
  permission: 'view' | 'edit' | 'create' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ResourceBasedContent: React.FC<ResourceBasedContentProps> = ({ 
  resource,
  permission,
  children, 
  fallback = null 
}) => {
  const { canView, canEdit, canCreate, canDelete } = useRoleCheck();
  
  const hasPermission = () => {
    switch (permission) {
      case 'view':
        return canView(resource);
      case 'edit':
        return canEdit(resource);
      case 'create':
        return canCreate(resource);
      case 'delete':
        return canDelete(resource);
      default:
        return false;
    }
  };
  
  if (hasPermission()) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};