import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Clock,
  Instagram,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  FileText,
  Target
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { toast } from '../components/ui/use-toast';
// Import our new hooks
import { usePosts, useCampaigns } from '../hooks/useData';
import { Post, Campaign } from '../types';
import { CampaignForm } from '../components/forms/CampaignForm';
// Import our new CalendarGrid component
import { CalendarGrid } from '../components/calendar/CalendarGrid';

// Helper function to safely parse dates
const safeDateParse = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) return dateValue;
  
  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // If it's a number (timestamp)
  if (typeof dateValue === 'number') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // If it's an object with nested properties
  if (typeof dateValue === 'object') {
    // Try common date properties
    if (dateValue._seconds && dateValue._nanoseconds) {
      // Firebase timestamp
      return new Date(dateValue._seconds * 1000);
    }
    if (dateValue.$date) {
      // MongoDB date
      return new Date(dateValue.$date);
    }
  }
  
  return null;
};

// Helper function to normalize dates for comparison
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();
  
  // Use our new data hooks
  const { posts: postsData, loading: postsLoading, error: postsError, deletePost } = usePosts();
  const posts = postsData || [];
  const { campaigns, loading: campaignsLoading, error: campaignsError, addCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  
  // Generate calendar events from data
  const generateCalendarEvents = useCallback(() => {
    const events: any[] = [];
    
    // Add posts as events
    posts.forEach((post, index) => {
      // Validate post has required fields
      if (!post.id) {
        return; // Skip this post
      }
      
      if (!post.title) {
        return; // Skip this post
      }
      
      if (post.scheduledAt) {
        try {
          // Safely parse the date
          const scheduledDate = safeDateParse(post.scheduledAt);
          
          // Validate the date
          if (!scheduledDate) {
            return;
          }
          
          // Ensure post.id is valid before creating event ID
          if (post.id && post.id !== 'undefined' && post.id !== 'null') {
            const event = {
              id: `post-${post.id}`,
              title: post.title,
              date: scheduledDate,
              type: 'post',
              status: post.status,
              platform: post.platform,
              data: post
            };
            events.push(event);
          }
        } catch (error) {
          console.error('Error processing post date:', error, post);
        }
      }
    });
    
    // Add campaigns as events
    campaigns.forEach((campaign, index) => {
      // Validate campaign has required fields
      if (!campaign.id) {
        return; // Skip this campaign
      }
      
      if (!campaign.name) {
        return; // Skip this campaign
      }
      
      try {
        // Safely parse dates
        const startDate = safeDateParse(campaign.start);
        const endDate = safeDateParse(campaign.end);
        
        // Validate the dates
        if (!startDate) {
          return;
        }
        
        // Ensure campaign.id is valid before creating event ID
        if (campaign.id && campaign.id !== 'undefined' && campaign.id !== 'null') {
          const startEvent = {
            id: `campaign-${campaign.id}`,
            title: campaign.name,
            date: startDate,
            type: 'campaign',
            status: campaign.status,
            data: campaign
          };
          events.push(startEvent);
          
          // Add campaign end date as well if it exists
          if (endDate) {
            const endEvent = {
              id: `campaign-end-${campaign.id}`,
              title: `${campaign.name} ends`,
              date: endDate,
              type: 'campaign-end',
              status: campaign.status,
              data: campaign
            };
            events.push(endEvent);
          }
        }
      } catch (error) {
        console.error('Error processing campaign dates:', error, campaign);
      }
    });
    
    return events;
  }, [posts, campaigns]);
  
  const calendarEvents = generateCalendarEvents();

  const handleCreatePost = () => {
    // Navigate to post creation page
    navigate('/posts/create');
  };

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    } else if (view === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else {
      // For day view, move to previous day and update selected date
      const previousDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
      setCurrentDate(previousDay);
      setSelectedDate(previousDay);
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    } else if (view === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else {
      // For day view, move to next day and update selected date
      const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      setCurrentDate(nextDay);
      setSelectedDate(nextDay);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (view === 'day') {
      setSelectedDate(today);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Switch to day view when clicking on a day
    if (view !== 'day') {
      setView('day');
    }
  };

  const handleSaveCampaign = (campaignData: any) => {
    try {
      // Ensure dates are properly formatted as Date objects
      const startDate = safeDateParse(campaignData.startDate) || new Date(campaignData.startDate);
      const endDate = safeDateParse(campaignData.endDate) || new Date(campaignData.endDate);
    
      if (editingCampaign) {
        // Update existing campaign (don't update createdBy as it shouldn't change)
        const updatedCampaign = updateCampaign(editingCampaign.id, {
          name: campaignData.name,
          description: campaignData.description,
          status: campaignData.status,
          start: startDate,
          end: endDate,
          budgetCents: campaignData.budget ? campaignData.budget * 100 : 0,
          channels: campaignData.channels,
          goals: campaignData.goals || [],
        });
      
        if (updatedCampaign) {
          toast({
            title: "Campaign Updated",
            description: `Campaign "${campaignData.name}" has been updated successfully!`,
          });
        }
      } else {
        // For new campaigns, let the backend set the createdBy field
        // The backend will use the authenticated user's ID
        const newCampaign = addCampaign({
          name: campaignData.name,
          description: campaignData.description,
          status: campaignData.status,
          start: startDate,
          end: endDate,
          budgetCents: campaignData.budget ? campaignData.budget * 100 : 0,
          channels: campaignData.channels,
          goals: campaignData.goals || [],
          // createdBy will be set by the backend
        } as any); // Type assertion to bypass TypeScript error
      
        toast({
          title: "Campaign Created",
          description: `Campaign "${campaignData.name}" has been created successfully!`,
        });
      }
      setShowCampaignForm(false);
      setEditingCampaign(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewPost = (postId: string) => {
    // Validate postId
    if (!postId || postId === 'undefined' || postId === 'null') {
      toast({
        title: "Error",
        description: `Invalid post ID: ${postId}. Cannot view post.`,
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to post view page
    navigate(`/posts/view/${postId}`);
  };

  const handleEditPost = (postId: string) => {
    // Validate postId
    if (!postId || postId === 'undefined' || postId === 'null') {
      toast({
        title: "Error",
        description: `Invalid post ID: ${postId}. Cannot edit post.`,
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to post edit page
    navigate(`/posts/edit/${postId}`);
  };

  const handleDeletePost = async (postId: string) => {
    // Validate postId
    if (!postId || postId === 'undefined' || postId === 'null') {
      toast({
        title: "Error",
        description: `Invalid post ID: ${postId}. Cannot delete post.`,
        variant: "destructive",
      });
      return;
    }
    
    // Delete post
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

  const handleViewCampaign = (campaignId: string) => {
    // Validate campaignId
    if (!campaignId || campaignId === 'undefined' || campaignId === 'null') {
      toast({
        title: "Error",
        description: `Invalid campaign ID: ${campaignId}. Cannot view campaign.`,
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to campaign details
    toast({
      title: "View Campaign",
      description: "Viewing campaign details...",
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignForm(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    // Validate campaignId
    if (!campaignId || campaignId === 'undefined' || campaignId === 'null') {
      toast({
        title: "Error",
        description: `Invalid campaign ID: ${campaignId}. Cannot delete campaign.`,
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      const success = await deleteCampaign(campaignId);
      if (success) {
        toast({
          title: "Campaign Deleted",
          description: "The campaign has been deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete campaign. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportReport = () => {
    // Generate a simple CSV report
    const csvContent = `data:text/csv;charset=utf-8,` 
      + `Report Type,Date Range,Total Posts,Total Campaigns\\n`
      + `Content Calendar,${new Date().toLocaleDateString()},${posts.length},${campaigns.length}\\n`
      + `\\nPosts Details\\n`
      + `Title,Platform,Status,Scheduled Date\\n${
       posts.map(post => {
         const scheduledDate = safeDateParse(post.scheduledAt);
         return `"${post.title}",${post.platform},${post.status},"${scheduledDate ? scheduledDate.toLocaleDateString() : 'N/A'}"`;
       }).join("\\n")
       }\\n\\nCampaign Details\\n`
      + `Name,Status,Start Date,End Date,Budget\\n${
       campaigns.map(campaign => {
         // Safely parse dates for proper formatting
         const startDate = safeDateParse(campaign.start);
         const endDate = safeDateParse(campaign.end);
         return `"${campaign.name}",${campaign.status},"${startDate ? startDate.toLocaleDateString() : 'N/A'}","${endDate ? endDate.toLocaleDateString() : 'N/A'}",${(campaign.budgetCents || 0) / 100}`;
       }).join("\\n")}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `content_calendar_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report Exported",
      description: "Your report has been exported successfully!",
    });
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setShowCampaignForm(true);
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setView(newView);
    // When switching to day view, make sure we have a selected date
    if (newView === 'day' && !selectedDate) {
      setSelectedDate(currentDate);
    }
  };

  // Helper functions needed for the UI
  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getStartOfWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek;
  };

  const getEndOfWeek = (date: Date) => {
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
    return endOfWeek;
  };

  const upcomingPosts = posts.filter(post => post.status === 'DRAFT' || post.status === 'SCHEDULED');

  return (
    <PageLayout>
      <div className="space-y-6 p-1 md:p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
            <p className="text-muted-foreground">
              Plan and schedule your marketing content
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCreateCampaign} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
            <Button onClick={handleCreatePost}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
          </div>
        </div>

        {/* Calendar View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {view === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {view === 'week' && `Week of ${getStartOfWeek(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getEndOfWeek(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              {view === 'day' && (selectedDate || currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={view === 'month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setView('month')}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Month
            </Button>
            <Button 
              variant={view === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setView('week')}
            >
              <List className="w-4 h-4 mr-2" />
              Week
            </Button>
            <Button 
              variant={view === 'day' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleViewChange('day')}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Day
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <CalendarGrid 
          currentDate={currentDate}
          view={view}
          selectedDate={selectedDate}
          calendarEvents={calendarEvents}
          onViewPost={(postId) => navigate(`/posts/view/${postId}`)}
          onEditPost={(postId) => navigate(`/posts/edit/${postId}`)}
          onDeletePost={handleDeletePost}
          onViewCampaign={(campaignId) => console.log('View campaign:', campaignId)}
          onEditCampaign={(campaign) => {
            setEditingCampaign(campaign);
            setShowCampaignForm(true);
          }}
          onDeleteCampaign={handleDeleteCampaign}
          onDateSelect={handleDateSelect}
          onChangeView={handleViewChange}
        />

        {/* Upcoming Posts Section */}
        {view === 'month' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upcoming Posts</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/posts')}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {upcomingPosts.slice(0, 3).map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {post.scheduledAt ? (safeDateParse(post.scheduledAt) || new Date(post.scheduledAt)).toLocaleDateString() : 'Not scheduled'}
                        </p>
                        <div className="flex items-center mt-2">
                          <Badge variant="secondary" className="mr-2">
                            {post.platform}
                          </Badge>
                          <Badge variant={
                            post.status === 'DRAFT' ? 'secondary' : 
                            post.status === 'SCHEDULED' ? 'default' : 
                            post.status === 'POSTED' ? 'default' : 'secondary'
                          }>
                            {post.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/posts/view/${post.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/posts/edit/${post.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {upcomingPosts.length > 3 && (
                  <Card className="p-4 flex items-center justify-center">
                    <Button variant="ghost" onClick={() => navigate('/posts')}>
                      View all {upcomingPosts.length} posts
                    </Button>
                  </Card>
                )}
              </div>
            </div>

            {/* Active Campaigns Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Active Campaigns</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {campaigns.filter(c => c.status === 'ACTIVE').slice(0, 3).map((campaign) => (
                  <Card key={campaign.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {campaign.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {campaign.start ? (safeDateParse(campaign.start) || new Date(campaign.start)).toLocaleDateString() : 'N/A'} - {campaign.end ? (safeDateParse(campaign.end) || new Date(campaign.end)).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/campaigns/edit/${campaign.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCampaign(campaign.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center">
                        <Badge variant={
                          campaign.status === 'ACTIVE' ? 'default' : 
                          campaign.status === 'UPCOMING' ? 'secondary' : 
                          campaign.status === 'COMPLETED' ? 'default' : 'secondary'
                        }>
                          {campaign.status}
                        </Badge>
                      </div>
                      {campaign.goals && campaign.goals.length > 0 && (
                        <div className="flex items-center">
                          <Target className="w-4 h-4 text-muted-foreground mr-1" />
                          <span className="text-xs text-muted-foreground">{campaign.goals.length}</span>
                        </div>
                      )}
                    </div>
                    {campaign.goals && campaign.goals.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Associated Goals:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {campaign.goals.slice(0, 2).map((goal: any) => (
                            <Badge key={typeof goal === 'string' ? goal : goal.id} variant="outline" className="text-xs">
                              {typeof goal === 'string' ? `Goal ${String(goal).substring(0, 8)}` : goal.title}
                            </Badge>
                          ))}
                          {campaign.goals.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{campaign.goals.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
                {campaigns.length > 3 && (
                  <Card className="p-4 flex items-center justify-center">
                    <Button variant="ghost" onClick={() => navigate('/campaigns')}>
                      View all {campaigns.length} campaigns
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Campaign Form Dialog */}
        <Dialog open={showCampaignForm} onOpenChange={setShowCampaignForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
            </DialogHeader>
            <CampaignForm 
              onSubmit={handleSaveCampaign} 
              onCancel={() => {
                setShowCampaignForm(false);
                setEditingCampaign(null);
              }}
              initialData={editingCampaign ? {
                name: editingCampaign.name,
                description: editingCampaign.description || '',
                status: editingCampaign.status,
                startDate: safeDateParse(editingCampaign.start) || new Date(editingCampaign.start),
                endDate: safeDateParse(editingCampaign.end) || new Date(editingCampaign.end),
                budget: editingCampaign.budgetCents ? editingCampaign.budgetCents / 100 : 0,
                channels: editingCampaign.channels || [],
                goals: editingCampaign.goals?.map(goal => typeof goal === 'string' ? goal : goal.id) || [],
                createdBy: editingCampaign.createdBy?.id || '1',
              } : undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Calendar;