import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { 
  Activity as ActivityIcon, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Target, 
  FileImage, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2,
  Eye,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
// Import our data hooks
import { useActivities, useCampaigns, useGoals, usePosts } from '@/hooks/useData';
import { Activity, Post, Campaign, Ambassador } from '@/types';

const Activities = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Use our data hooks
  const { activities, loading: activitiesLoading } = useActivities();
  const { campaigns } = useCampaigns();
  const { goals } = useGoals();
  const { posts } = usePosts(); // Add posts data
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'POST': return FileImage;
      case 'AD': return TrendingUp;
      case 'AMBASSADOR_TASK': return Users;
      default: return ActivityIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-success text-success-foreground';
      case 'COMPLETED': return 'bg-primary text-primary-foreground';
      case 'SCHEDULED': return 'bg-warning text-warning-foreground';
      case 'POSTED': return 'bg-success text-success-foreground';
      case 'DRAFT': return 'bg-muted text-muted-foreground';
      case 'ARCHIVED': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Helper function to safely get post title
  const getPostTitle = (post: string | Post | undefined): string => {
    if (!post) return 'Unknown Post';
    if (typeof post === 'string') {
      // Try to find the post in our posts data
      const fullPost = posts.find(p => p.id === post);
      return fullPost ? fullPost.title : `Post: ${post}`;
    }
    return post.title || 'Untitled Post';
  };

  // Helper function to safely get post caption
  const getPostCaption = (post: string | Post | undefined): string => {
    if (!post) return 'No caption';
    if (typeof post === 'string') {
      // Try to find the post in our posts data
      const fullPost = posts.find(p => p.id === post);
      return fullPost?.caption || 'No caption';
    }
    return post.caption || 'No caption';
  };

  // Helper function to safely get post status
  const getPostStatus = (post: string | Post | undefined): string => {
    if (!post) return 'DRAFT';
    if (typeof post === 'string') {
      // Try to find the post in our posts data
      const fullPost = posts.find(p => p.id === post);
      return fullPost?.status || 'DRAFT';
    }
    return post.status || 'DRAFT';
  };

  // Helper function to safely get post platform
  const getPostPlatform = (post: string | Post | undefined): string => {
    if (!post) return 'Unknown';
    if (typeof post === 'string') {
      // Try to find the post in our posts data
      const fullPost = posts.find(p => p.id === post);
      return fullPost?.platform || 'Unknown';
    }
    return post.platform || 'Unknown';
  };

  // Helper function to safely get campaign name
  const getCampaignName = (campaign: string | Campaign | undefined): string => {
    if (!campaign) return 'Unknown Campaign';
    if (typeof campaign === 'string') {
      // Try to find the campaign in our campaigns data
      const fullCampaign = campaigns.find(c => c.id === campaign);
      return fullCampaign ? fullCampaign.name : `Campaign: ${campaign}`;
    }
    return campaign.name || 'Untitled Campaign';
  };

  // Helper function to safely get campaign description
  const getCampaignDescription = (campaign: string | Campaign | undefined): string => {
    if (!campaign) return 'No description';
    if (typeof campaign === 'string') {
      // Try to find the campaign in our campaigns data
      const fullCampaign = campaigns.find(c => c.id === campaign);
      return fullCampaign?.description || 'No description';
    }
    return campaign.description || 'No description';
  };

  // Helper function to safely get ambassador name
  const getAmbassadorName = (ambassador: string | Ambassador | undefined): string => {
    if (!ambassador) return 'Unknown Ambassador';
    if (typeof ambassador === 'string') {
      return `Ambassador: ${ambassador}`;
    }
    return ambassador.name || 'Unnamed Ambassador';
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type.toLowerCase() === filter.toLowerCase();
    
    // Search based on activity type with proper null checking
    let matchesSearch = false;
    if (activity.type === 'POST' && activity.post) {
      // Handle both string references and object references
      if (typeof activity.post === 'string') {
        const postTitle = getPostTitle(activity.post);
        matchesSearch = postTitle.toLowerCase().includes(searchQuery.toLowerCase());
      } else if (typeof activity.post === 'object') {
        const title = activity.post.title || '';
        const caption = activity.post.caption || '';
        matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       caption.toLowerCase().includes(searchQuery.toLowerCase());
      }
    } else if (activity.type === 'AD' && activity.campaign) {
      if (typeof activity.campaign === 'string') {
        const campaignName = getCampaignName(activity.campaign);
        matchesSearch = campaignName.toLowerCase().includes(searchQuery.toLowerCase());
      } else if (typeof activity.campaign === 'object') {
        const name = activity.campaign.name || '';
        matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      }
    } else if (activity.type === 'AMBASSADOR_TASK' && activity.ambassador) {
      if (typeof activity.ambassador === 'string') {
        const ambassadorName = getAmbassadorName(activity.ambassador);
        matchesSearch = ambassadorName.toLowerCase().includes(searchQuery.toLowerCase());
      } else if (typeof activity.ambassador === 'object') {
        const name = activity.ambassador.name || '';
        matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      }
    } else {
      // For other activity types or when references are missing
      matchesSearch = searchQuery === '';
    }
    
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (activityId: string) => {
    // Navigate to activity details page
    navigate(`/activities/view/${activityId}`);
  };

  const handleEditActivity = (activityId: string) => {
    // Navigate to edit activity page
    navigate(`/activities/edit/${activityId}`);
  };

  const handleDeleteActivity = (activityId: string) => {
    // Navigate to delete activity page
    navigate(`/activities/delete/${activityId}`);
  };

  if (activitiesLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading activities...</p>
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
            <h1 className="text-3xl font-bold gradient-text">Activities</h1>
            <p className="text-muted-foreground">
              Track all marketing activities across campaigns and goals
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {['all', 'post', 'ad', 'ambassador_task'].map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                  className={filter === filterType ? 'bg-gradient-primary' : ''}
                >
                  {filterType.replace('_', ' ').charAt(0).toUpperCase() + 
                   filterType.replace('_', ' ').slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card key="total-activities" className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <ActivityIcon className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{activities.length}</p>
            <p className="text-sm text-muted-foreground">Total Activities</p>
          </Card>
          <Card key="posts" className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <FileImage className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{activities.filter(a => a.type === 'POST').length}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </Card>
          <Card key="ads" className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{activities.filter(a => a.type === 'AD').length}</p>
            <p className="text-sm text-muted-foreground">Ads</p>
          </Card>
          <Card key="ambassador-tasks" className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{activities.filter(a => a.type === 'AMBASSADOR_TASK').length}</p>
            <p className="text-sm text-muted-foreground">Ambassador Tasks</p>
          </Card>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <Card key={activity.id} className="p-6 bg-gradient-card shadow-card border-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-card-foreground">
                          {activity.type === 'POST' && activity.post ? 
                            getPostTitle(activity.post) :
                           activity.type === 'AD' && activity.campaign ? 
                            getCampaignName(activity.campaign) :
                           activity.type === 'AMBASSADOR_TASK' && activity.ambassador ? 
                            getAmbassadorName(activity.ambassador) :
                           `${activity.type} Activity`}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          activity.type === 'POST' && activity.post ? getPostStatus(activity.post) : 'DRAFT'
                        )}`}>
                          {activity.type === 'POST' && activity.post ? 
                            getPostStatus(activity.post) : 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.type === 'POST' && activity.post ? 
                          getPostCaption(activity.post) : 
                         activity.type === 'AD' && activity.campaign ? 
                          getCampaignDescription(activity.campaign) : 
                         activity.type === 'AMBASSADOR_TASK' && activity.ambassador ? 
                          `Task for ${getAmbassadorName(activity.ambassador)}` : 
                         'No description'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center" key={`timestamp-${activity.id}`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        {activity.campaign && (
                          <div className="flex items-center" key={`campaign-${activity.id}`}>
                            <Target className="w-3 h-3 mr-1" />
                            {getCampaignName(activity.campaign)}
                          </div>
                        )}
                        {activity.goal && (
                          <div className="flex items-center" key={`goal-${activity.id}`}>
                            <Target className="w-3 h-3 mr-1" />
                            {typeof activity.goal === 'string' ? activity.goal : activity.goal.title}
                          </div>
                        )}
                        {activity.ambassador && (
                          <div className="flex items-center" key={`ambassador-${activity.id}`}>
                            <Users className="w-3 h-3 mr-1" />
                            {getAmbassadorName(activity.ambassador)}
                          </div>
                        )}
                        {activity.type === 'POST' && activity.post && (
                          <div className="flex items-center" key={`post-platform-${activity.id}`}>
                            <FileImage className="w-3 h-3 mr-1" />
                            {getPostPlatform(activity.post)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(activity.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditActivity(activity.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteActivity(activity.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Metrics */}
                {activity.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-border">
                    <div className="text-center" key={`reach-${activity.id}`}>
                      <p className="text-2xl font-bold text-card-foreground">
                        {activity.metrics.reach?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-muted-foreground">Reach</p>
                    </div>
                    <div className="text-center" key={`likes-${activity.id}`}>
                      <p className="text-2xl font-bold text-card-foreground">
                        {activity.metrics.likes?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center" key={`comments-${activity.id}`}>
                      <p className="text-2xl font-bold text-card-foreground">
                        {activity.metrics.comments?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </div>
                    <div className="text-center" key={`shares-${activity.id}`}>
                      <p className="text-2xl font-bold text-card-foreground">
                        {activity.metrics.shares?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-muted-foreground">Shares</p>
                    </div>
                    <div className="text-center" key={`saves-${activity.id}`}>
                      <p className="text-2xl font-bold text-card-foreground">
                        {activity.metrics.saves?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-muted-foreground">Saves</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default Activities;