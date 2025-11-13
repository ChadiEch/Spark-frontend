import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
// Import our data service
import { postService, assetService, campaignService, goalService, activityService } from '@/services/dataService';
import { integrationService } from '@/services/integrationService';
import { ActivityType } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useUsers } from '@/hooks/useData';
import { PostStatus, ChannelType, Campaign, Goal, IntegrationConnection } from '@/types';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPlatform, setSelectedPlatform] = useState<string[]>(['instagram']);
  const [hashtags, setHashtags] = useState('');
  const [media, setMedia] = useState<File | null>(null);
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
  const navigate = useNavigate();
  
  // Get current user
  const { users } = useUsers();
  const currentUser = users[0] || { id: '1', email: 'user@example.com', name: 'Current User', role: 'CONTRIBUTOR', createdAt: new Date(), updatedAt: new Date() };

  // Fetch campaigns, goals, and connected integrations
  useEffect(() => {
    const fetchData = async () => {
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
  }, []);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500', type: 'INSTAGRAM' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', type: 'FACEBOOK' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-black', type: 'X' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', type: 'LINKEDIN' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600', type: 'YOUTUBE' },
  ];

  const handleSaveDraft = async () => {
    try {
      // Upload media file if selected
      let attachments = [];
      if (media) {
        console.log('Uploading media file:', media.name);
        const uploadedAsset = await assetService.upload(media);
        console.log('Uploaded asset:', uploadedAsset);
        if (uploadedAsset) {
          attachments = [uploadedAsset.id];
          console.log('Attachment ID:', uploadedAsset.id);
        }
      }
      
      // Save as draft functionality
      const postData: any = {
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
        attachments,
        createdBy: currentUser,
      };
      
      // Add campaign and goal if selected (as string IDs, not objects)
      if (selectedCampaign) {
        postData.campaign = selectedCampaign;
      }
      
      if (selectedGoal) {
        postData.goal = selectedGoal;
      }
      
      console.log('Creating post with data:', postData);
      console.log('Attachments in post data:', postData.attachments);
      
      const newPost = await postService.create(postData);
      
      // Create corresponding activity for the post
      if (newPost) {
        try {
          const activityData: any = {
            type: 'POST' as ActivityType,
            post: newPost.id, // Reference to the post
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Add campaign and goal to activity if they exist in the post
          if (newPost.campaign) {
            activityData.campaign = newPost.campaign;
          }
          
          if (newPost.goal) {
            activityData.goal = newPost.goal;
          }
          
          // Add metrics if they exist in the post
          if (newPost.metrics) {
            activityData.metrics = newPost.metrics;
          }
          
          await activityService.create(activityData);
          console.log('Activity created for post:', newPost.id);
        } catch (activityError) {
          console.error('Failed to create activity for post:', activityError);
          // Don't fail the post creation if activity creation fails
        }
      }
      
      toast({
        title: "Post Saved",
        description: "Your post has been saved as a draft.",
      });
      
      navigate('/calendar');
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSchedulePost = async () => {
    try {
      // Upload media file if selected
      let attachments = [];
      if (media) {
        console.log('Uploading media file:', media.name);
        const uploadedAsset = await assetService.upload(media);
        console.log('Uploaded asset:', uploadedAsset);
        if (uploadedAsset) {
          attachments = [uploadedAsset.id];
          console.log('Attachment ID:', uploadedAsset.id);
        }
      }
      
      // Schedule post functionality
      const postData: any = {
        title,
        caption: content,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        platformHashtags: Object.keys(platformHashtags).reduce((acc, platform) => {
          acc[platform as ChannelType] = platformHashtags[platform].split(' ').filter(tag => tag.startsWith('#'));
          return acc;
        }, {} as Record<ChannelType, string[]>),
        status: 'SCHEDULED' as PostStatus,
        scheduledAt: selectedDate,
        platform: selectedPlatform[0].toUpperCase() as ChannelType,
        attachments,
        createdBy: currentUser,
      };
      
      // Add campaign and goal if selected (as string IDs, not objects)
      if (selectedCampaign) {
        postData.campaign = selectedCampaign;
      }
      
      if (selectedGoal) {
        postData.goal = selectedGoal;
      }
      
      console.log('Creating post with data:', postData);
      console.log('Attachments in post data:', postData.attachments);
      
      const newPost = await postService.create(postData);
      
      // Create corresponding activity for the post
      if (newPost) {
        try {
          const activityData: any = {
            type: 'POST' as ActivityType,
            post: newPost.id, // Reference to the post
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Add campaign and goal to activity if they exist in the post
          if (newPost.campaign) {
            activityData.campaign = newPost.campaign;
          }
          
          if (newPost.goal) {
            activityData.goal = newPost.goal;
          }
          
          // Add metrics if they exist in the post
          if (newPost.metrics) {
            activityData.metrics = newPost.metrics;
          }
          
          await activityService.create(activityData);
          console.log('Activity created for post:', newPost.id);
        } catch (activityError) {
          console.error('Failed to create activity for post:', activityError);
          // Don't fail the post creation if activity creation fails
        }
      }
      
      toast({
        title: "Post Scheduled",
        description: "Your post has been scheduled successfully.",
      });
      
      navigate('/calendar');
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: "Error",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    // Preview functionality
    toast({
      title: "Preview",
      description: "Post preview would appear here in a production environment.",
    });
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
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

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold gradient-text">Create New Post</h1>
            <p className="text-muted-foreground">
              Create and schedule your social media content
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
            <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" onClick={handleSchedulePost}>
              <CalendarIcon className="w-4 h-4" />
              Schedule Post
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
                    <div className="bg-background rounded-lg h-48 flex items-center justify-center">
                      <Image className="w-12 h-12 text-muted-foreground" />
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
      </div>
    </PageLayout>
  );
};

export default CreatePost;