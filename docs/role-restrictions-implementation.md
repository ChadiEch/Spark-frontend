# Role Restrictions Implementation

## Overview

This document outlines the implementation of role-based access control (RBAC) restrictions across all pages in the Winnerforce Spark platform. The system implements a four-tier role-based access control system with clear separation of privileges and responsibilities.

## Implemented Role Restrictions

### 1. Posts Page (`src/pages/Posts.tsx`)

#### Header Actions
- **Create Post Button**: Restricted to users with `create` permission on `posts` resource
  - **ADMIN**: ✅ Can create posts
  - **MANAGER**: ✅ Can create posts
  - **CONTRIBUTOR**: ✅ Can create posts
  - **VIEWER**: ❌ Cannot create posts

#### Post Actions (Edit/Delete)
- **Edit Button**: Restricted to users with `edit` permission on `ownPosts` resource
  - **ADMIN**: ✅ Can edit all posts
  - **MANAGER**: ✅ Can edit all posts
  - **CONTRIBUTOR**: ✅ Can edit their own posts
  - **VIEWER**: ❌ Cannot edit posts

- **Delete Button**: Restricted to users with `delete` permission on `ownPosts` resource
  - **ADMIN**: ✅ Can delete all posts
  - **MANAGER**: ✅ Can delete all posts
  - **CONTRIBUTOR**: ✅ Can delete their own posts
  - **VIEWER**: ❌ Cannot delete posts

### 2. Tasks Page (`src/pages/Tasks.tsx`)

#### Header Actions
- **Create Task Button**: Restricted to users with `create` permission on `tasks` resource
  - **ADMIN**: ✅ Can create tasks
  - **MANAGER**: ✅ Can create tasks
  - **CONTRIBUTOR**: ✅ Can create tasks
  - **VIEWER**: ❌ Cannot create tasks

#### Task Actions (Edit/Delete)
- **Edit Button**: Restricted to users with `edit` permission on `assignedTasks` resource
  - **ADMIN**: ✅ Can edit all tasks
  - **MANAGER**: ✅ Can edit all tasks
  - **CONTRIBUTOR**: ✅ Can edit assigned tasks
  - **VIEWER**: ❌ Cannot edit tasks

- **Delete Button**: Restricted to users with `delete` permission on `assignedTasks` resource
  - **ADMIN**: ✅ Can delete all tasks
  - **MANAGER**: ✅ Can delete all tasks
  - **CONTRIBUTOR**: ✅ Can delete assigned tasks
  - **VIEWER**: ❌ Cannot delete tasks

### 3. Goals Page (`src/pages/Goals.tsx`)

#### Header Actions
- **Create Goal Button**: Restricted to users with `create` permission on `goals` resource
  - **ADMIN**: ✅ Can create goals
  - **MANAGER**: ✅ Can create goals
  - **CONTRIBUTOR**: ✅ Can create goals
  - **VIEWER**: ❌ Cannot create goals

#### Goal Actions (Edit/Delete)
- **Edit Button**: Restricted to users with `edit` permission on `goals` resource
  - **ADMIN**: ✅ Can edit all goals
  - **MANAGER**: ✅ Can edit all goals
  - **CONTRIBUTOR**: ❌ Cannot edit goals (goals are typically managed by managers)
  - **VIEWER**: ❌ Cannot edit goals

- **Delete Button**: Restricted to users with `delete` permission on `goals` resource
  - **ADMIN**: ✅ Can delete all goals
  - **MANAGER**: ✅ Can delete all goals
  - **CONTRIBUTOR**: ❌ Cannot delete goals
  - **VIEWER**: ❌ Cannot delete goals

### 4. Assets Page (`src/pages/Assets.tsx`)

#### Header Actions
- **Upload Asset Button**: Restricted to users with `create` permission on `assets` resource
  - **ADMIN**: ✅ Can upload assets
  - **MANAGER**: ✅ Can upload assets
  - **CONTRIBUTOR**: ✅ Can upload assets
  - **VIEWER**: ❌ Cannot upload assets

#### Asset Actions (Edit/Delete)
- **Edit Button**: Restricted to users with `edit` permission on `assets` resource
  - **ADMIN**: ✅ Can edit all assets
  - **MANAGER**: ✅ Can edit all assets
  - **CONTRIBUTOR**: ✅ Can edit their own assets
  - **VIEWER**: ❌ Cannot edit assets

- **Delete Button**: Restricted to users with `delete` permission on `assets` resource
  - **ADMIN**: ✅ Can delete all assets
  - **MANAGER**: ✅ Can delete all assets
  - **CONTRIBUTOR**: ✅ Can delete their own assets
  - **VIEWER**: ❌ Cannot delete assets

### 5. Ambassadors Page (`src/pages/Ambassadors.tsx`)

#### Header Actions
- **Add Ambassador Button**: Restricted to users with `create` permission on `ambassadors` resource
  - **ADMIN**: ✅ Can add ambassadors
  - **MANAGER**: ✅ Can add ambassadors
  - **CONTRIBUTOR**: ❌ Cannot add ambassadors
  - **VIEWER**: ❌ Cannot add ambassadors

#### Ambassador Actions (Edit/Delete)
- **Edit Button**: Restricted to users with `edit` permission on `ambassadors` resource
  - **ADMIN**: ✅ Can edit all ambassadors
  - **MANAGER**: ✅ Can edit all ambassadors
  - **CONTRIBUTOR**: ❌ Cannot edit ambassadors
  - **VIEWER**: ❌ Cannot edit ambassadors

- **Delete Button**: Restricted to users with `delete` permission on `ambassadors` resource
  - **ADMIN**: ✅ Can delete all ambassadors
  - **MANAGER**: ✅ Can delete all ambassadors
  - **CONTRIBUTOR**: ❌ Cannot delete ambassadors
  - **VIEWER**: ❌ Cannot delete ambassadors

### 6. Analytics Page (`src/pages/Analytics.tsx`)

#### Header Actions
- **Export Report Button**: Restricted to users with `view` permission on `analytics` resource
  - **ADMIN**: ✅ Can export analytics reports
  - **MANAGER**: ✅ Can export analytics reports
  - **CONTRIBUTOR**: ✅ Can export analytics reports
  - **VIEWER**: ❌ Cannot export analytics reports

#### Campaign Actions (Edit/Delete)
- **Edit Button**: Restricted to users with `edit` permission on `campaigns` resource
  - **ADMIN**: ✅ Can edit all campaigns
  - **MANAGER**: ✅ Can edit all campaigns
  - **CONTRIBUTOR**: ❌ Cannot edit campaigns
  - **VIEWER**: ❌ Cannot edit campaigns

- **Delete Button**: Restricted to users with `delete` permission on `campaigns` resource
  - **ADMIN**: ✅ Can delete all campaigns
  - **MANAGER**: ✅ Can delete all campaigns
  - **CONTRIBUTOR**: ❌ Cannot delete campaigns
  - **VIEWER**: ❌ Cannot delete campaigns

## New Components

### ResourceBasedContent Component (`src/components/ui/RoleBasedContent.tsx`)

A new component `ResourceBasedContent` was added to provide more granular control over resource-based permissions:

```tsx
interface ResourceBasedContentProps {
  resource: string;
  permission: 'view' | 'edit' | 'create' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

This component checks if the current user has the specified permission on the given resource using the `useRoleCheck` hook.

## Role Permission Matrix

| Role | Posts | Tasks | Goals | Assets | Ambassadors | Analytics | Campaigns |
|------|-------|-------|-------|--------|-------------|-----------|-----------|
| **ADMIN** | Create/Edit/Delete | Create/Edit/Delete | Create/Edit/Delete | Create/Edit/Delete | Create/Edit/Delete | View/Export | Create/Edit/Delete |
| **MANAGER** | Create/Edit/Delete | Create/Edit/Delete | Create/Edit/Delete | Create/Edit/Delete | Create/Edit/Delete | View/Export | Create/Edit/Delete |
| **CONTRIBUTOR** | Create/Edit/Delete Own | Edit Assigned | View Only | Create/Edit/Delete Own | No Access | View Only | No Access |
| **VIEWER** | View Only | View Only | No Access | View Only | No Access | No Access | No Access |

## Implementation Details

### Files Modified

1. `src/components/ui/RoleBasedContent.tsx` - Added `ResourceBasedContent` component
2. `src/pages/Posts.tsx` - Added role restrictions to header and action buttons
3. `src/pages/Tasks.tsx` - Added role restrictions to header and action buttons
4. `src/pages/Goals.tsx` - Added role restrictions to header and action buttons
5. `src/pages/Assets.tsx` - Added role restrictions to header and action buttons
6. `src/pages/Ambassadors.tsx` - Added role restrictions to header and action buttons
7. `src/pages/Analytics.tsx` - Added role restrictions to header and action buttons

### Security Considerations

1. **Frontend Restrictions**: UI elements are hidden/disabled based on user roles
2. **Backend Validation**: All API endpoints should validate permissions server-side
3. **Resource Ownership**: Permissions are checked based on resource ownership where applicable
4. **Fallback UI**: Disabled buttons with descriptive tooltips indicate why actions are unavailable

## Testing

The implementation has been tested to ensure:
- Appropriate UI elements are hidden/disabled for each role
- Permission checks work correctly for all resource types
- Fallback UI provides clear feedback to users
- No functionality is broken by the role restrictions

## Future Enhancements

Planned improvements include:
1. More granular permission controls for specific actions
2. Audit logging for permission-related activities
3. Dynamic permission configuration through the admin interface
4. Time-based permission restrictions
5. Role inheritance and complex permission hierarchies