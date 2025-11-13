// Demonstration of generic entity components and hooks
import React, { useState } from 'react';
import { GenericEntityList } from './GenericEntityList';
import { GenericEntityForm } from './GenericEntityForm';
import { useGenericEntity } from '@/hooks/useGenericEntity';
import { User, Post } from '@/types';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'ADMIN',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'MANAGER',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-02-20')
  }
];

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Welcome to Winnerforce',
    hashtags: [],
    status: 'POSTED',
    platform: 'INSTAGRAM',
    attachments: [],
    createdAt: new Date('2023-01-16'),
    updatedAt: new Date('2023-01-16'),
    createdBy: mockUsers[0]
  },
  {
    id: '2',
    title: 'New Features Released',
    hashtags: [],
    status: 'DRAFT',
    platform: 'FACEBOOK',
    attachments: [],
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10'),
    createdBy: mockUsers[1]
  }
];

export function GenericEntityDemo() {
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [showForm, setShowForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<User | Post | null>(null);

  // User entity management
  const userEntity = useGenericEntity<User>(mockUsers, {
    onCreate: async (user) => {
      // Simulate API call
      return Promise.resolve({ ...user, id: `${mockUsers.length + 1}`, createdAt: new Date(), updatedAt: new Date() } as User);
    },
    onUpdate: async (id, user) => {
      // Simulate API call
      return Promise.resolve({ ...mockUsers.find(u => u.id === id)!, ...user, updatedAt: new Date() } as User);
    },
    onDelete: async (id) => {
      // Simulate API call
      return Promise.resolve(true);
    }
  });

  // Post entity management
  const postEntity = useGenericEntity<Post>(mockPosts, {
    onCreate: async (post) => {
      // Simulate API call
      return Promise.resolve({ ...post, id: `${mockPosts.length + 1}`, createdAt: new Date(), updatedAt: new Date() } as Post);
    },
    onUpdate: async (id, post) => {
      // Simulate API call
      return Promise.resolve({ ...mockPosts.find(p => p.id === id)!, ...post, updatedAt: new Date() } as Post);
    },
    onDelete: async (id) => {
      // Simulate API call
      return Promise.resolve(true);
    }
  });

  // User form fields
  const userFormFields: Array<React.ComponentProps<typeof GenericEntityForm<User>>['fields'][number]> = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter full name',
      required: true
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter email address',
      required: true
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'ADMIN', label: 'Administrator' },
        { value: 'MANAGER', label: 'Manager' },
        { value: 'CONTRIBUTOR', label: 'Contributor' },
        { value: 'VIEWER', label: 'Viewer' }
      ],
      required: true
    }
  ];

  // Post form fields
  const postFormFields: Array<React.ComponentProps<typeof GenericEntityForm<Post>>['fields'][number]> = [
    {
      name: 'title',
      label: 'Post Title',
      type: 'text',
      placeholder: 'Enter post title',
      required: true
    },
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      options: [
        { value: 'INSTAGRAM', label: 'Instagram' },
        { value: 'TIKTOK', label: 'TikTok' },
        { value: 'FACEBOOK', label: 'Facebook' },
        { value: 'PINTEREST', label: 'Pinterest' },
        { value: 'X', label: 'X (Twitter)' },
        { value: 'YOUTUBE', label: 'YouTube' }
      ],
      required: true
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'SCHEDULED', label: 'Scheduled' },
        { value: 'POSTED', label: 'Posted' },
        { value: 'ARCHIVED', label: 'Archived' }
      ],
      required: true
    }
  ];

  const handleAddUser = () => {
    setEditingEntity(null);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingEntity(user);
    setShowForm(true);
  };

  const handleDeleteUser = (user: User) => {
    userEntity.deleteEntity(user.id);
  };

  const handleAddPost = () => {
    setEditingEntity(null);
    setShowForm(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingEntity(post);
    setShowForm(true);
  };

  const handleDeletePost = (post: Post) => {
    postEntity.deleteEntity(post.id);
  };

  const handleUserFormSubmit = (data: User) => {
    if (editingEntity) {
      userEntity.updateEntity(editingEntity.id, data);
    } else {
      userEntity.createEntity(data);
    }
    setShowForm(false);
    setEditingEntity(null);
  };

  const handlePostFormSubmit = (data: Post) => {
    if (editingEntity) {
      postEntity.updateEntity(editingEntity.id, data);
    } else {
      postEntity.createEntity(data);
    }
    setShowForm(false);
    setEditingEntity(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntity(null);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Generic Entity Components Demo</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'posts' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
        </div>
      </div>

      {showForm ? (
        activeTab === 'users' ? (
          <GenericEntityForm<User>
            title={editingEntity ? "Edit User" : "Create New User"}
            fields={userFormFields}
            initialValues={editingEntity || undefined}
            onSubmit={handleUserFormSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <GenericEntityForm<Post>
            title={editingEntity ? "Edit Post" : "Create New Post"}
            fields={postFormFields}
            initialValues={editingEntity || undefined}
            onSubmit={handlePostFormSubmit}
            onCancel={handleCancel}
          />
        )
      ) : (
        <>
          {activeTab === 'users' ? (
            <GenericEntityList<User>
              title="Users"
              entities={userEntity.data}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { 
                  key: 'role', 
                  label: 'Role',
                  render: (value) => <Badge variant="secondary">{value}</Badge>
                },
                { 
                  key: 'createdAt', 
                  label: 'Created',
                  render: (value) => new Date(value).toLocaleDateString()
                }
              ]}
              onAdd={handleAddUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              loading={userEntity.loading}
              searchable
              searchableFields={['name', 'email']}
            />
          ) : (
            <GenericEntityList<Post>
              title="Posts"
              entities={postEntity.data}
              columns={[
                { key: 'title', label: 'Title' },
                { 
                  key: 'platform', 
                  label: 'Platform',
                  render: (value) => <Badge>{value}</Badge>
                },
                { 
                  key: 'status', 
                  label: 'Status',
                  render: (value) => <Badge variant={value === 'POSTED' ? 'default' : 'secondary'}>{value}</Badge>
                },
                { 
                  key: 'createdBy', 
                  label: 'Created By',
                  render: (value) => value?.name || 'Unknown'
                },
                { 
                  key: 'createdAt', 
                  label: 'Created',
                  render: (value) => new Date(value).toLocaleDateString()
                }
              ]}
              onAdd={handleAddPost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              loading={postEntity.loading}
              searchable
              searchableFields={['title']}
            />
          )}
        </>
      )}
    </div>
  );
}