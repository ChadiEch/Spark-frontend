import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Eye, 
  Edit, 
  Trash2,
  Image
} from 'lucide-react';
import { format } from 'date-fns';
// Import our data service
import { postService, activityService } from '@/services/dataService';
import { toast } from '@/components/ui/use-toast';
import { Post, PostStatus, ChannelType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const ViewPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  // Load existing post data
  useEffect(() => {
    const fetchPost = async () => {
      console.log('ViewPost: id from useParams:', id);
      
      // Check if id exists and is valid
      if (!id) {
        console.error('ViewPost: No ID provided in route params');
        toast({
          title: "Error",
          description: "No post ID provided.",
          variant: "destructive",
        });
        navigate('/posts');
        return;
      }
      
      // Check if id is "undefined" or "null" string
      if (id === "undefined" || id === "null") {
        console.error('ViewPost: Received invalid ID string:', id);
        toast({
          title: "Error",
          description: "Invalid post ID.",
          variant: "destructive",
        });
        navigate('/posts');
        return;
      }
      
      try {
        const postData = await postService.getById(id);
        if (postData) {
          // Check if current user is the creator of the post
          if (currentUser && postData.createdBy && postData.createdBy.id !== currentUser.id && currentUser.role !== 'ADMIN') {
            toast({
              title: "Access Denied",
              description: "You don't have permission to view this post.",
              variant: "destructive",
            });
            navigate('/posts');
            return;
          }
          setPost(postData);
        } else {
          toast({
            title: "Post Not Found",
            description: "The post you're looking for doesn't exist.",
            variant: "destructive",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "Failed to load post. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, currentUser, navigate]);

  const handleEditPost = () => {
    if (id) {
      navigate(`/posts/edit/${id}`);
    }
  };

  const handleDeletePost = async () => {
    if (!id) return;
    
    // Delete post functionality
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // Delete corresponding activity for the post
        try {
          // Find the activity associated with this post
          const activities = await activityService.getAll();
          const postActivity = activities.find(activity => 
            activity.type === 'POST' && activity.post && 
            (typeof activity.post === 'string' ? activity.post === id : activity.post.id === id)
          );
          
          if (postActivity) {
            await activityService.delete(postActivity.id);
            console.log('Activity deleted for post:', id);
          }
        } catch (activityError) {
          console.error('Failed to delete activity for post:', activityError);
          // Don't fail the post deletion if activity deletion fails
        }
        
        const success = await postService.delete(id);
        if (success) {
          toast({
            title: "Post Deleted",
            description: "Your post has been deleted successfully.",
          });
          navigate('/calendar');
        } else {
          toast({
            title: "Error",
            description: "Failed to delete post. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="p-6">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Loading post data...</p>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <div className="p-6">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
            <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/calendar')}>Back to Calendar</Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Get platform information
  const platformInfo = {
    INSTAGRAM: { name: 'Instagram', color: 'bg-pink-500' },
    FACEBOOK: { name: 'Facebook', color: 'bg-blue-600' },
    TWITTER: { name: 'Twitter', color: 'bg-black' },
    LINKEDIN: { name: 'LinkedIn', color: 'bg-blue-700' },
    YOUTUBE: { name: 'YouTube', color: 'bg-red-600' },
    PINTEREST: { name: 'Pinterest', color: 'bg-red-700' },
    X: { name: 'X', color: 'bg-black' }
  };

  const platform = platformInfo[post.platform] || { name: post.platform, color: 'bg-gray-500' };

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold gradient-text">View Post</h1>
            <p className="text-muted-foreground">
              View your social media content
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Only show edit/delete buttons if user is the creator or admin */}
            {(currentUser && post.createdBy && (post.createdBy.id === currentUser.id || currentUser.role === 'ADMIN')) && (
              <>
                <Button variant="outline" className="gap-2" onClick={handleEditPost}>
                  <Edit className="w-4 h-4" />
                  Edit Post
                </Button>
                <Button variant="destructive" className="gap-2" onClick={handleDeletePost}>
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-muted-foreground">
                    {post.caption || "No content available"}
                  </p>
                </div>

                {/* Media Display */}
                {post.attachments && post.attachments.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">Media</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {post.attachments.map((attachment) => (
                        <div key={attachment.id} className="border rounded-lg overflow-hidden">
                          {attachment.kind === 'IMAGE' ? (
                            <img 
                              src={attachment.url.startsWith('http') ? attachment.url : `${import.meta.env.VITE_API_BASE_URL || ''}${attachment.url}`} 
                              alt={attachment.name} 
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          ) : attachment.kind === 'VIDEO' ? (
                            <div className="w-full h-48 bg-muted flex items-center justify-center">
                              <div className="text-center">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">{attachment.name}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-muted flex items-center justify-center">
                              <div className="text-center">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">{attachment.name}</p>
                              </div>
                            </div>
                          )}
                          <div className="p-2">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(attachment.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-medium">Media</h4>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center">
                        <Image className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">No Media Attached</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge 
                      className={post.status === 'POSTED' ? 'bg-green-500' : 
                                post.status === 'SCHEDULED' ? 'bg-blue-500' : 
                                post.status === 'DRAFT' ? 'bg-yellow-500' : 'bg-gray-500'}
                    >
                      {post.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Platform</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${platform.color}`}>
                        <span className="text-xs text-white font-bold">
                          {platform.name.charAt(0)}
                        </span>
                      </div>
                      <span>{platform.name}</span>
                    </div>
                  </div>

                  {post.scheduledAt && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(post.scheduledAt), "PPP")}</span>
                      </div>
                    </div>
                  )}

                  {post.publishedAt && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Published Date</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(post.publishedAt), "PPP")}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created By</p>
                    <p className="mt-1">{post.createdBy?.name || 'Unknown User'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                    <p className="mt-1">{format(new Date(post.createdAt), "PPP")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics if available */}
            {post.metrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-2xl font-bold">{post.metrics.reach || 0}</p>
                      <p className="text-xs text-muted-foreground">Reach</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-2xl font-bold">{post.metrics.likes || 0}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-2xl font-bold">{post.metrics.comments || 0}</p>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-2xl font-bold">{post.metrics.shares || 0}</p>
                      <p className="text-xs text-muted-foreground">Shares</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ViewPost;