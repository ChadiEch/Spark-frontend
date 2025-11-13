# Role Management System

## Overview

The Winnerforce Spark platform implements a comprehensive role-based access control (RBAC) system with four distinct user roles:

1. **ADMIN** - Full access to all platform features and settings
2. **MANAGER** - Can manage content and team members
3. **CONTRIBUTOR** - Can create and edit their own content
4. **VIEWER** - Can view content and analytics only

## Role Permissions

### ADMIN
- Full access to all platform features
- Can create, read, update, and delete any entity
- Can manage user accounts and roles
- Can access all administrative settings
- Can view all analytics and reports

### MANAGER
- Can create, read, update, and delete content they own
- Can manage team members (excluding ADMIN users)
- Can view and edit campaigns, posts, tasks, and goals
- Can access analytics and reports
- Cannot change platform settings or manage other MANAGER/ADMIN users

### CONTRIBUTOR
- Can create and edit their own posts, tasks, and goals
- Can view campaigns and assigned tasks
- Can upload and manage their own assets
- Cannot delete content they don't own
- Cannot manage other users or access administrative settings

### VIEWER
- Can view published content, campaigns, and analytics
- Can view assigned tasks
- Cannot create, edit, or delete any content
- Cannot manage users or access administrative settings

## Backend Implementation

### User Model
The User model includes a `role` field with enum validation:
```javascript
role: {
  type: String,
  enum: ['ADMIN', 'MANAGER', 'CONTRIBUTOR', 'VIEWER'],
  default: 'CONTRIBUTOR'
}
```

### Controllers
The user controller includes enhanced role management functions:
- `updateUserRole` - Updates a user's role (ADMIN only)
- `getRoleStats` - Retrieves statistics about user roles (ADMIN only)

### Routes
New API endpoints for role management:
- `PUT /api/users/:id/role` - Update user role
- `GET /api/users/stats/roles` - Get role statistics

### Middleware
The authorization middleware provides role-based access control:
```javascript
// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - user not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
```

## Frontend Implementation

### Role-Based Components
The frontend uses role-based components to show/hide features:
- `RoleBasedContent` - Conditionally renders content based on user role
- `RoleBasedAction` - Conditionally enables actions based on user role

### Hooks
The `useRoleCheck` hook provides role checking functions:
- `hasRole` - Checks if user has a specific role
- `isAuthorized` - Checks if user is authorized for an action
- `canView` - Checks if user can view a resource
- `canEdit` - Checks if user can edit a resource
- `canCreate` - Checks if user can create a resource
- `canDelete` - Checks if user can delete a resource

### Role Management UI
The Settings page includes a dedicated Roles tab with:
- Role statistics dashboard
- User role assignment interface
- Real-time role updates

## API Endpoints

### User Management
- `GET /api/users` - Get all users (with filtering)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user (ADMIN only)
- `PUT /api/users/:id` - Update user (ADMIN only)
- `PUT /api/users/:id/role` - Update user role (ADMIN only)
- `DELETE /api/users/:id` - Delete user (ADMIN only)
- `GET /api/users/stats/roles` - Get role statistics (ADMIN only)

## Security Considerations

1. **Role Escalation Prevention** - Users cannot change their own roles
2. **Privilege Escalation Prevention** - Only ADMIN users can assign ADMIN roles
3. **Self-Deletion Prevention** - Users cannot delete their own accounts
4. **ADMIN Protection** - Non-ADMIN users cannot modify or delete ADMIN users
5. **Input Validation** - All role inputs are validated against allowed values

## Testing

The role management system includes comprehensive tests:
- Unit tests for role checking functions
- Integration tests for API endpoints
- UI tests for role management components
- Security tests for privilege escalation prevention

## Future Enhancements

1. **Fine-grained Permissions** - More granular permission controls beyond roles
2. **Role Hierarchies** - Support for role inheritance and complex hierarchies
3. **Audit Logging** - Track all role changes and access attempts
4. **Temporary Role Assignments** - Time-limited role assignments
5. **Custom Roles** - Allow administrators to create custom roles with specific permissions