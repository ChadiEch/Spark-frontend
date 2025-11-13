# Role Access Matrix

## Overview

This document outlines the specific pages and functions that each user role can access in the Winnerforce Spark platform. The system implements a four-tier role-based access control (RBAC) system with the following roles:

1. **ADMIN** - Full system access
2. **MANAGER** - Content and team management
3. **CONTRIBUTOR** - Content creation and editing
4. **VIEWER** - Read-only access

## Role Access Details

### ADMIN Role (Full Access)

#### Pages Accessible:
- Dashboard (Admin View)
- All Campaigns
- All Posts
- All Tasks
- All Goals
- All Assets
- All Ambassadors
- Analytics & Reports
- Calendar (Full Access)
- Settings (All Tabs)
- User Management
- Role Management
- Team Management
- Notifications
- Integrations
- Billing
- Security
- Help & Support

#### Functions Accessible:
- ✅ Create/Edit/Delete all entities (Campaigns, Posts, Tasks, Goals, Assets, Ambassadors)
- ✅ Manage all users (Create, Update, Delete)
- ✅ Assign roles to users
- ✅ View all analytics and reports
- ✅ Manage system settings
- ✅ Configure integrations
- ✅ Manage billing information
- ✅ Change security settings
- ✅ Access audit logs (if implemented)
- ✅ Export all data
- ✅ Bulk operations on all entities

#### Administrative Functions:
- ✅ User account creation
- ✅ User role assignment
- ✅ User account deletion
- ✅ System configuration
- ✅ Permission management
- ✅ Access control management

### MANAGER Role

#### Pages Accessible:
- Dashboard (Manager View)
- All Campaigns
- All Posts
- All Tasks
- All Goals
- All Assets
- All Ambassadors
- Analytics & Reports
- Calendar (Full Access)
- Settings (Profile, Notifications, Integrations, Help & Support)
- Team Management (View only)

#### Functions Accessible:
- ✅ Create/Edit/Delete campaigns they own or are assigned to
- ✅ Create/Edit/Delete posts they own or are assigned to
- ✅ Create/Edit/Delete tasks they own or are assigned to
- ✅ Create/Edit/Delete goals they own or are assigned to
- ✅ Upload/Edit/Delete assets they own
- ✅ Create/Edit/Delete ambassadors
- ✅ View analytics and reports
- ✅ Manage their own profile settings
- ✅ Configure their notification preferences
- ✅ Connect/disconnect their integrations
- ✅ View team members

#### Functions NOT Accessible:
- ❌ Manage other users (Create, Update, Delete)
- ❌ Assign roles to users
- ❌ Access Role Management page
- ❌ Manage system settings
- ❌ Manage billing information
- ❌ Change security settings for other users
- ❌ Delete other users' content (unless specifically assigned)

### CONTRIBUTOR Role

#### Pages Accessible:
- Dashboard (Contributor View)
- Assigned Campaigns
- Own Posts
- Assigned Tasks
- Own Goals
- Own Assets
- Assigned Ambassadors
- Analytics (Limited)
- Calendar (Assigned Items)
- Settings (Profile, Notifications, Help & Support)

#### Functions Accessible:
- ✅ Create/Edit/Delete their own posts
- ✅ Edit assigned tasks
- ✅ Create/Edit/Delete their own goals
- ✅ Upload/Edit/Delete their own assets
- ✅ View assigned ambassadors
- ✅ View limited analytics
- ✅ Manage their own profile settings
- ✅ Configure their notification preferences

#### Functions NOT Accessible:
- ❌ Create/Edit/Delete campaigns
- ❌ Delete posts they don't own
- ❌ Manage other users
- ❌ Assign roles to users
- ❌ Access Role Management page
- ❌ Access Team Management page
- ❌ Manage system settings
- ❌ Manage billing information
- ❌ Change security settings
- ❌ View all analytics and reports
- ❌ Export data

### VIEWER Role

#### Pages Accessible:
- Dashboard (Viewer View)
- Published Campaigns
- Published Posts
- Assigned Tasks (View Only)
- Public Analytics
- Calendar (View Only)
- Settings (Profile, Help & Support)

#### Functions Accessible:
- ✅ View published campaigns
- ✅ View published posts
- ✅ View assigned tasks (no editing)
- ✅ View public analytics
- ✅ Manage their own profile settings

#### Functions NOT Accessible:
- ❌ Create/Edit/Delete any content
- ❌ Manage any entities
- ❌ Manage other users
- ❌ Assign roles to users
- ❌ Access Role Management page
- ❌ Access Team Management page
- ❌ Manage system settings
- ❌ Manage billing information
- ❌ Change security settings
- ❌ Export data
- ❌ Configure integrations

## Page-Specific Access Control

### Dashboard Page
- **ADMIN**: Full admin dashboard with all KPIs and system metrics
- **MANAGER**: Manager dashboard with team and content metrics
- **CONTRIBUTOR**: Contributor dashboard with personal metrics
- **VIEWER**: Viewer dashboard with limited public metrics

### Campaigns Page
- **ADMIN**: Full access to all campaigns
- **MANAGER**: Full access to all campaigns
- **CONTRIBUTOR**: Access to assigned campaigns only
- **VIEWER**: View published campaigns only

### Posts Page
- **ADMIN**: Full access to all posts
- **MANAGER**: Full access to all posts
- **CONTRIBUTOR**: Access to own posts and assigned posts
- **VIEWER**: View published posts only

### Tasks Page
- **ADMIN**: Full access to all tasks
- **MANAGER**: Full access to all tasks
- **CONTRIBUTOR**: Access to assigned tasks
- **VIEWER**: View assigned tasks only (no editing)

### Goals Page
- **ADMIN**: Full access to all goals
- **MANAGER**: Full access to all goals
- **CONTRIBUTOR**: Access to own goals
- **VIEWER**: No access

### Assets Page
- **ADMIN**: Full access to all assets
- **MANAGER**: Full access to all assets
- **CONTRIBUTOR**: Access to own assets
- **VIEWER**: No access

### Ambassadors Page
- **ADMIN**: Full access to all ambassadors
- **MANAGER**: Full access to all ambassadors
- **CONTRIBUTOR**: Access to assigned ambassadors
- **VIEWER**: No access

### Analytics Page
- **ADMIN**: Full access to all analytics
- **MANAGER**: Full access to all analytics
- **CONTRIBUTOR**: Limited access to personal analytics
- **VIEWER**: Access to public analytics only

### Settings Page
- **ADMIN**: Access to all tabs including Roles, Team, Billing, Security
- **MANAGER**: Access to Profile, Notifications, Integrations, Help & Support
- **CONTRIBUTOR**: Access to Profile, Notifications, Help & Support
- **VIEWER**: Access to Profile, Help & Support

## Security Considerations

1. **Role Escalation Prevention**: Users cannot change their own roles
2. **Privilege Escalation Prevention**: Only ADMIN users can assign ADMIN roles
3. **Self-Deletion Prevention**: Users cannot delete their own accounts
4. **ADMIN Protection**: Non-ADMIN users cannot modify or delete ADMIN users
5. **Data Isolation**: Users can only access data they own or have been granted access to

## Implementation Notes

The access control is implemented at multiple levels:
1. **Frontend**: UI elements are hidden/shown based on user roles
2. **Backend**: API endpoints are protected with role-based authorization middleware
3. **Database**: Data access is filtered based on user permissions and ownership

This matrix ensures that users have appropriate access to perform their job functions while maintaining system security and data integrity.