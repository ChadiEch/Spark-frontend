import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  CalendarIcon,
  User
} from 'lucide-react';
import { usePosts, useTasks } from '@/hooks/useData';
import { Post, PostStatus, ChannelType, Task } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedContent, ResourceBasedContent } from '@/components/ui/RoleBasedContent';

export default function Posts() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { posts: postsData, loading: postsLoading, deletePost } = usePosts();
  const { data: tasksData, loading: tasksLoading } = useTasks();
  const posts = postsData || [];
  const tasks = tasksData || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

  // Create a map of post ID to assignees
  const postAssigneesMap = tasks.reduce((map, task) => {
    if (task.relatedPost) {
      const postId = task.relatedPost.id;
      if (!map[postId]) {
        map[postId] = [];
      }
      // Add assignees to the map
      task.assignees.forEach(assignee => {
        if (!map[postId].some(a => a.id === assignee.id)) {
          map[postId].push(assignee);
        }
      });
    }
    return map;
  }, {} as Record<string, any[]>);

  useEffect(() => {
    const filtered = posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPosts(filtered);
  }, [searchTerm, posts]);

  const handleCreatePost = () => {
    navigate('/posts/create');
  };

  const handleViewPost = (postId: string) => {
    console.log('Posts: Navigating to view post with ID:', postId);
    
    // Check if postId is valid
    if (!postId || postId === "undefined" || postId === "null") {
      console.error('Posts: Invalid post ID provided:', postId);
      toast({
        title: "Error",
        description: "Invalid post ID.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/posts/view/${postId}`);
  };

  const handleEditPost = (postId: string) => {
    console.log('Posts: Navigating to edit post with ID:', postId);
    
    // Check if postId is valid
    if (!postId || postId === "undefined" || postId === "null") {
      console.error('Posts: Invalid post ID provided:', postId);
      toast({
        title: "Error",
        description: "Invalid post ID.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/posts/edit/${postId}`);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const success = await deletePost(postId);
      if (success) {
        toast({
          title: "Post Deleted",
          description: "The post has been deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-500';
      case 'SCHEDULED': return 'bg-blue-500';
      case 'POSTED': return 'bg-green-500';
      case 'ARCHIVED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformColor = (platform: ChannelType) => {
    switch (platform) {
      case 'INSTAGRAM': return 'bg-pink-500';
      case 'FACEBOOK': return 'bg-blue-600';
      case 'X': return 'bg-black';
      case 'YOUTUBE': return 'bg-red-600';
      case 'PINTEREST': return 'bg-red-700';
      case 'TIKTOK': return 'bg-black';
      default: return 'bg-gray-500';
    }
  };

  const loading = postsLoading || tasksLoading;

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading posts...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold gradient-text">Posts</h1>
            <p className="text-muted-foreground">
              Manage your social media posts
            </p>
          </div>
          <ResourceBasedContent 
            resource="posts" 
            permission="create"
            fallback={
              <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" disabled>
                <Plus className="w-4 h-4" />
                Create Post (Permission Required)
              </Button>
            }
          >
            <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" onClick={handleCreatePost}>
              <Plus className="w-4 h-4" />
              Create Post
            </Button>
          </ResourceBasedContent>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-96"
          />
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No posts found</h2>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first post'}
            </p>
            <Button onClick={handleCreatePost}>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.filter(post => post && (post.id || (post as any)._id)).map(post => {
              // Get assignees for this post
              const assignees = postAssigneesMap[post.id] || [];
              
              return (
                <Card key={post.id} className="overflow-hidden hover:shadow-card transition-shadow">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted relative">
                    {post.attachments && post.attachments.length > 0 ? (
                      post.attachments[0].kind === 'IMAGE' ? (
                        <img 
                          src={post.attachments[0].url.startsWith('http') ? post.attachments[0].url : `${import.meta.env.VITE_API_BASE_URL || ''}${post.attachments[0].url}`} 
                          alt={post.attachments[0].name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      ) : post.attachments[0].kind === 'VIDEO' ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/10">
                          <div className="text-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mx-auto flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/10">
                          <div className="text-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mx-auto flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mx-auto flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge className={`${getStatusColor(post.status)} text-white text-xs`}>
                        {post.status}
                      </Badge>
                      <Badge className={`${getPlatformColor(post.platform)} text-white text-xs`}>
                        {post.platform}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1 mb-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.caption || "No caption"}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.hashtags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.hashtags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    {post.scheduledAt && (
                      <div className="flex items-center text-xs text-muted-foreground mb-3">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        <span>{format(new Date(post.scheduledAt), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {assignees.length > 0 ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-xs text-white">
                              {assignees[0].name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">
                              {assignees[0].name}
                              {assignees.length > 1 && ` +${assignees.length - 1}`}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-xs text-white">
                              {post.createdBy?.name ? post.createdBy.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">
                              {post.createdBy?.name || 'Unknown User'}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            console.log('Posts: View button clicked for post:', post);
                            // Check for both id and _id fields
                            const postId = post.id || (post as any)._id;
                            if (post && postId && postId !== "undefined" && postId !== "null") {
                              handleViewPost(postId);
                            } else {
                              console.error('Posts: Post or post ID is missing/invalid:', post);
                              toast({
                                title: "Error",
                                description: "Post data is incomplete or invalid.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <ResourceBasedContent 
                          resource="ownPosts" 
                          permission="edit"
                          fallback={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              disabled
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              console.log('Posts: Edit button clicked for post:', post);
                              // Check for both id and _id fields
                              const postId = post.id || (post as any)._id;
                              if (post && postId && postId !== "undefined" && postId !== "null") {
                                handleEditPost(postId);
                              } else {
                                console.error('Posts: Post or post ID is missing/invalid:', post);
                                toast({
                                  title: "Error",
                                  description: "Post data is incomplete or invalid.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </ResourceBasedContent>
                        <ResourceBasedContent 
                          resource="ownPosts" 
                          permission="delete"
                          fallback={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              disabled
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ResourceBasedContent>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}