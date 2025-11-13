import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CalendarIcon, 
  Plus, 
  Image, 
  Link, 
  Hash,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Save,
  Eye,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
// Import our data service
import { postService, assetService, campaignService, goalService, activityService } from '@/services/dataService';
import { integrationService } from '@/services/integrationService';
import { toast } from '@/components/ui/use-toast';
import { useUsers } from '@/hooks/useData';
import { Post, PostStatus, ChannelType, Campaign, Goal, IntegrationConnection } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPlatform, setSelectedPlatform] = useState<string[]>(['instagram']);
  const [hashtags, setHashtags] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [existingPost, setExistingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false); // Add this state for preview modal
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [connectedIntegrations, setConnectedIntegrations] = useState<IntegrationConnection[]>([]);
  const [platformHashtags, setPlatformHashtags] = useState<Record<string, string>>({
    INSTAGRAM: '',
    FACEBOOK: '',
    X: '',
    YOUTUBE: '',
    TIKTOK: '',
    PINTEREST: ''
  });

  // Get current user
  const { users } = useUsers();
  const currentUserData = users[0] || { id: '1', email: 'user@example.com', name: 'Current User', role: 'CONTRIBUTOR', createdAt: new Date(), updatedAt: new Date() };

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500', type: 'INSTAGRAM' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', type: 'FACEBOOK' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-black', type: 'X' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', type: 'LINKEDIN' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600', type: 'YOUTUBE' },
  ];

  // Load existing post data and fetch campaigns, goals, and connected integrations
  useEffect(() => {
    const fetchData = async () => {
      console.log('EditPost: id from useParams:', id);
      
      // Check if id exists and is valid
      if (!id) {
        console.error('EditPost: No ID provided in route params');
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
        console.error('EditPost: Received invalid ID string:', id);
        toast({
          title: "Error",
          description: "Invalid post ID.",
          variant: "destructive",
        });
        navigate('/posts');
        return;
      }
      
      try {
        // Fetch post data
        const post = await postService.getById(id);
        if (post) {
          // Check if current user is the creator of the post
          if (currentUser && post.createdBy && post.createdBy.id !== currentUser.id && currentUser.role !== 'ADMIN') {
            toast({
              title: "Access Denied",
              description: "You don't have permission to edit this post.",
              variant: "destructive",
            });
            navigate('/posts');
            return;
          }
          
          setExistingPost(post);
          setTitle(post.title);
          setContent(post.caption || '');
          setSelectedDate(post.scheduledAt);
          setSelectedPlatform([post.platform.toLowerCase()]);
          setHashtags(post.hashtags.join(' '));
          
          // Set campaign and goal if they exist
          if (post.campaign) {
            setSelectedCampaign(post.campaign.id);
          }
          
          if (post.goal) {
            setSelectedGoal(post.goal.id);
          }
          
          // Set platform-specific hashtags
          if (post.platformHashtags) {
            const platformHashtagsData: Record<string, string> = {};
            Object.keys(post.platformHashtags).forEach(platform => {
              platformHashtagsData[platform] = post.platformHashtags![platform as ChannelType].join(' ');
            });
            setPlatformHashtags(platformHashtagsData);
          }
        } else {
          toast({
            title: "Post Not Found",
            description: "The post you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate('/posts');
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
        navigate('/posts');
      }
      
      try {
        // Fetch campaigns
        const campaignData = await campaignService.getAll();
        setCampaigns(campaignData);
        
        // Fetch goals
        const goalData = await goalService.getAll();
        setGoals(goalData);
        
        // Fetch connected integrations
        const integrationData = await integrationService.getUserConnections();
        setConnectedIntegrations(integrationData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load campaigns, goals, or integrations. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, [id, currentUser, navigate]);

  const handleSaveDraft = async () => {
    if (!id || !existingPost) return;
    
    // Check if current user is the creator of the post
    if (currentUser && existingPost.createdBy.id !== currentUser.id && currentUser.role !== 'ADMIN') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this post.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Prepare update data
      const updateData: any = {
        title,
        caption: content,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        platformHashtags: Object.keys(platformHashtags).reduce((acc, platform) => {
          acc[platform as ChannelType] = platformHashtags[platform].split(' ').filter(tag => tag.startsWith('#'));
          return acc;
        }, {} as Record<ChannelType, string[]>),
        status: 'DRAFT' as PostStatus,
        scheduledAt: selectedDate,
        platform: selectedPlatform[0].toUpperCase() as ChannelType,
      };
      
      // Add campaign and goal if selected
      if (selectedCampaign) {
        updateData.campaign = selectedCampaign;
      } else {
        updateData.campaign = null;
      }
      
      if (selectedGoal) {
        updateData.goal = selectedGoal;
      } else {
        updateData.goal = null;
      }
      
      // Upload media file if selected
      if (media) {
        console.log('Uploading media file:', media.name);
        const uploadedAsset = await assetService.upload(media);
        console.log('Uploaded asset:', uploadedAsset);
        if (uploadedAsset) {
          // If we have existing attachments, add the new one to them
          if (existingPost && existingPost.attachments && existingPost.attachments.length > 0) {
            // Filter out any attachments that were removed
            const existingAttachmentIds = existingPost.attachments.map(attachment => attachment.id);
            updateData.attachments = [...existingAttachmentIds, uploadedAsset.id];
          } else {
            // No existing attachments, just use the new one
            updateData.attachments = [uploadedAsset.id];
          }
          console.log('Attachment IDs:', updateData.attachments);
        }
      } else if (existingPost && existingPost.attachments && existingPost.attachments.length > 0) {
        // Keep existing attachments if no new media is uploaded
        updateData.attachments = existingPost.attachments.map(attachment => attachment.id);
      } else {
        // No attachments at all
        updateData.attachments = [];
      }
      
      console.log('Updating post with data:', updateData);
      
      // Save as draft functionality
      const updatedPost = await postService.update(id, updateData);
      
      if (updatedPost) {
        toast({
          title: "Post Updated",
          description: "Your post has been saved as a draft.",
        });
        // Navigate to view page after saving
        navigate(`/posts/view/${id}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to update post. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePost = async () => {
    if (!id || !existingPost) return;
    
    // Check if current user is the creator of the post
    if (currentUser && existingPost.createdBy && existingPost.createdBy.id !== currentUser.id && currentUser.role !== 'ADMIN') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this post.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Prepare update data
      const updateData: any = {
        title,
        caption: content,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        platformHashtags: Object.keys(platformHashtags).reduce((acc, platform) => {
          acc[platform as ChannelType] = platformHashtags[platform].split(' ').filter(tag => tag.startsWith('#'));
          return acc;
        }, {} as Record<ChannelType, string[]>),
        status: selectedDate ? 'SCHEDULED' as PostStatus : 'DRAFT' as PostStatus,
        scheduledAt: selectedDate,
        platform: selectedPlatform[0].toUpperCase() as ChannelType,
      };
      
      // Add campaign and goal if selected
      if (selectedCampaign) {
        updateData.campaign = selectedCampaign;
      } else {
        updateData.campaign = null;
      }
      
      if (selectedGoal) {
        updateData.goal = selectedGoal;
      } else {
        updateData.goal = null;
      }
      
      // Upload media file if selected
      if (media) {
        console.log('Uploading media file:', media.name);
        const uploadedAsset = await assetService.upload(media);
        console.log('Uploaded asset:', uploadedAsset);
        if (uploadedAsset) {
          // If we have existing attachments, add the new one to them
          if (existingPost && existingPost.attachments && existingPost.attachments.length > 0) {
            // Filter out any attachments that were removed
            const existingAttachmentIds = existingPost.attachments.map(attachment => attachment.id);
            updateData.attachments = [...existingAttachmentIds, uploadedAsset.id];
          } else {
            // No existing attachments, just use the new one
            updateData.attachments = [uploadedAsset.id];
          }
          console.log('Attachment IDs:', updateData.attachments);
        }
      } else if (existingPost && existingPost.attachments && existingPost.attachments.length > 0) {
        // Keep existing attachments if no new media is uploaded
        updateData.attachments = existingPost.attachments.map(attachment => attachment.id);
      } else {
        // No attachments at all
        updateData.attachments = [];
      }
      
      console.log('Updating post with data:', updateData);
      
      // Update post functionality
      const updatedPost = await postService.update(id, updateData);
      
      if (updatedPost) {
        // Update corresponding activity for the post
        try {
          // Find the activity associated with this post
          const activities = await activityService.getAll();
          const postActivity = activities.find(activity => 
            activity.type === 'POST' && activity.post && 
            (typeof activity.post === 'string' ? activity.post === id : activity.post.id === id)
          );
          
          if (postActivity) {
            const activityUpdateData: any = {
              updatedAt: new Date()
            };
            
            // Update campaign and goal in activity if they changed
            if (updateData.campaign !== undefined) {
              activityUpdateData.campaign = updateData.campaign;
            }
            
            if (updateData.goal !== undefined) {
              activityUpdateData.goal = updateData.goal;
            }
            
            // Update metrics if they changed
            if (updateData.metrics !== undefined) {
              activityUpdateData.metrics = updateData.metrics;
            }
            
            await activityService.update(postActivity.id, activityUpdateData);
            console.log('Activity updated for post:', id);
          }
        } catch (activityError) {
          console.error('Failed to update activity for post:', activityError);
          // Don't fail the post update if activity update fails
        }
        
        toast({
          title: "Post Updated",
          description: "Your post has been updated successfully.",
        });
        // Navigate to view page after updating
        navigate(`/posts/view/${id}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to update post. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!id || !existingPost) return;
    
    // Check if current user is the creator of the post
    if (currentUser && existingPost.createdBy && existingPost.createdBy.id !== currentUser.id && currentUser.role !== 'ADMIN') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete this post.",
        variant: "destructive",
      });
      return;
    }
    
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

  const handlePreview = () => {
    // Show the preview modal
    setShowPreview(true);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

  // Function to remove existing attachment
  const removeAttachment = (attachmentId: string) => {
    if (existingPost) {
      const updatedAttachments = existingPost.attachments.filter(attachment => attachment.id !== attachmentId);
      setExistingPost({
        ...existingPost,
        attachments: updatedAttachments
      });
    }
  };

  const togglePlatform = (platformId: string) => {
    if (selectedPlatform.includes(platformId)) {
      setSelectedPlatform(selectedPlatform.filter(id => id !== platformId));
    } else {
      setSelectedPlatform([...selectedPlatform, platformId]);
    }
  };

  // Get connected platform keys
  const connectedPlatformKeys = connectedIntegrations.map(conn => conn.integrationId);

  // Filter platforms to show only connected ones
  const connectedPlatforms = platforms.filter(platform => 
    connectedPlatformKeys.includes(platform.id)
  );

  if (loading) {
    return (
      <PageLayout>
        <div className="p-6">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">
              Loading post data...
            </p>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!existingPost && id) {
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

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold gradient-text">Edit Post</h1>
            <p className="text-muted-foreground">
              Edit your social media content
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="gap-2" onClick={handlePreview}>
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleSaveDraft}>
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleDeletePost}>
              <Trash2 className="w-4 h-4" />
              Delete Post
            </Button>
            <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" onClick={handleUpdatePost}>
              <Save className="w-4 h-4" />
              Update Post
            </Button>
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
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter post title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your post content here..."
                    className="min-h-40"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Media</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {media ? (
                      <div className="flex flex-col items-center">
                        <Image className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">{media.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(media.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Image className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Upload Media</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      id="media-upload"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                    />
                    <label
                      htmlFor="media-upload"
                      className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                  
                  {/* Display existing attachments as thumbnails */}
                  {existingPost && existingPost.attachments && existingPost.attachments.length > 0 && !media && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Current Attachments</h4>
                      <div className="flex flex-wrap gap-2">
                        {existingPost.attachments.map((attachment) => (
                          <div key={attachment.id} className="relative group">
                            <div className="w-16 h-16 rounded border overflow-hidden">
                              {attachment.kind === 'IMAGE' ? (
                                <img 
                                  src={attachment.url.startsWith('http') ? attachment.url : `${import.meta.env.VITE_API_BASE_URL || ''}${attachment.url}`} 
                                  alt={attachment.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    console.error('Image failed to load:', {
                                      url: attachment.url,
                                      fullUrl: attachment.url.startsWith('http') ? attachment.url : `${import.meta.env.VITE_API_BASE_URL || ''}${attachment.url}`,
                                      attachment: attachment
                                    });
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                  }}
                                  onLoad={(e) => {
                                    console.log('Image loaded successfully:', {
                                      url: attachment.url,
                                      fullUrl: attachment.url.startsWith('http') ? attachment.url : `${import.meta.env.VITE_API_BASE_URL || ''}${attachment.url}`,
                                      attachment: attachment
                                    });
                                  }}
                                />
                              ) : attachment.kind === 'VIDEO' ? (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeAttachment(attachment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign & Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign">Campaign</Label>
                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {connectedPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatform.includes(platform.id);
                    return (
                      <div
                        key={platform.id}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all",
                          isSelected 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:bg-accent"
                        )}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", platform.color)}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium">{platform.name}</span>
                      </div>
                    );
                  })}
                </div>
                {connectedPlatforms.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No connected social media platforms. Please connect platforms in{' '}
                    <button 
                      className="text-primary hover:underline"
                      onClick={() => navigate('/settings?tab=integrations')}
                    >
                      Settings
                    </button>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Schedule Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hashtags">Global Hashtags</Label>
                  <div className="flex">
                    <Input
                      id="hashtags"
                      placeholder="#fitness #health"
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button variant="outline" className="rounded-l-none border-l-0">
                      <Hash className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Separate hashtags with spaces
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Platform-Specific Hashtags</Label>
                  {selectedPlatform.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    if (!platform) return null;
                    
                    return (
                      <div key={platform.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", platform.color)}>
                            <platform.icon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium">{platform.name}</span>
                        </div>
                        <Input
                          placeholder="#tag1 #tag2"
                          value={platformHashtags[platform.type] || ''}
                          onChange={(e) => setPlatformHashtags(prev => ({
                            ...prev,
                            [platform.type]: e.target.value
                          }))}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary"></div>
                    <div>
                      <p className="text-sm font-medium">Your Brand</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  </div>
                  
                  {media && (
                    <div className="bg-background rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(media)} 
                        alt="Preview" 
                        className="w-full h-48 object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Show existing attachments in preview */}
                  {!media && existingPost && existingPost.attachments && existingPost.attachments.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {existingPost.attachments.slice(0, 4).map((attachment) => (
                        <div key={attachment.id} className="bg-background rounded-lg overflow-hidden">
                          {attachment.kind === 'IMAGE' ? (
                            <img 
                              src={attachment.url} 
                              alt={attachment.name} 
                              className="w-full h-24 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          ) : attachment.kind === 'VIDEO' ? (
                            <div className="w-full h-24 bg-muted flex items-center justify-center">
                              <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-full h-24 bg-muted flex items-center justify-center">
                              <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      {content || "Your post content will appear here..."}
                    </p>
                    
                    {hashtags && (
                      <div className="flex flex-wrap gap-1">
                        {hashtags.split(' ').map((tag, index) => (
                          tag.startsWith('#') && (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-4 text-xs text-muted-foreground">
                    <span>0 likes</span>
                    <span>0 comments</span>
                    <span>0 shares</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-muted rounded-lg p-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary"></div>
                  <div>
                    <p className="text-sm font-medium">Your Brand</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                
                {/* Display media preview */}
                {(media || (existingPost && existingPost.attachments && existingPost.attachments.length > 0)) && (
                  <div className="space-y-2">
                    {media ? (
                      // Preview for newly selected media
                      <div className="bg-background rounded-lg overflow-hidden">
                        <img 
                          src={URL.createObjectURL(media)} 
                          alt="Preview" 
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                    ) : (
                      // Preview for existing attachments
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {existingPost?.attachments?.slice(0, 4).map((attachment) => (
                          <div key={attachment.id} className="bg-background rounded-lg overflow-hidden">
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{title || "Post Title"}</h3>
                    <p className="text-sm">
                      {content || "Your post content will appear here..."}
                    </p>
                  </div>
                  
                  {hashtags && (
                    <div className="flex flex-wrap gap-1">
                      {hashtags.split(' ').map((tag, index) => (
                        tag.startsWith('#') && (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        )
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4 text-xs text-muted-foreground">
                  <span>0 likes</span>
                  <span>0 comments</span>
                  <span>0 shares</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setShowPreview(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default EditPost;