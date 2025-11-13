# Data Service

This directory contains the data management services for the Winnerforce Marketing Platform.

## Overview

The data service provides a simple persistence layer using localStorage as a temporary solution. In a production environment, this would connect to a backend API.

## Services

### User Service
Manages user data including authentication and registration.

### Post Service
Manages social media posts including creation, updating, and deletion.

### Campaign Service
Manages marketing campaigns including creation, updating, and deletion.

### Task Service
Manages tasks including creation, updating, and deletion.

### Goal Service
Manages goals including creation, updating, and deletion.

### Asset Service
Manages media assets including creation, updating, and deletion.

## Hooks

### useData.ts
Provides React hooks for easy integration with components:
- useUsers
- usePosts
- useCampaigns
- useTasks
- useGoals
- useAssets

## Validation

The [validateDataService.ts](validateDataService.ts) file contains a simple validation script that tests all services to ensure they're working correctly.

## Usage

1. Import the service you need:
```typescript
import { postService } from '@/services/dataService';
```

2. Use the service methods:
```typescript
const newPost = postService.create(postData);
const posts = postService.getAll();
const post = postService.getById('post-123');
const updatedPost = postService.update('post-123', updatedData);
const deleted = postService.delete('post-123');
```

3. Or use the hooks in your components:
```typescript
import { usePosts } from '@/hooks/useData';

const MyComponent = () => {
  const { posts, loading, addPost, updatePost, deletePost } = usePosts();
  
  // Use the data and methods as needed
};
```

## Future Improvements

1. Replace localStorage with a real backend API
2. Add data synchronization capabilities
3. Implement proper error handling and retry mechanisms
4. Add data validation and sanitization
5. Implement caching strategies for better performance