import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Calendar, 
  Target, 
  FileImage, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2,
  Eye,
  DollarSign,
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Instagram,
  Star,
  Hash,
  AtSign,
  RefreshCw
} from 'lucide-react';
import { useAmbassadors, useActivities } from '@/hooks/useData';
import { toast } from '@/components/ui/use-toast';
import { Activity } from '@/types';
import { ambassadorAPI } from '@/services/apiService';
import { getAmbassadorTrackingData } from '@/services/ambassadorTrackingService';

const ViewAmbassador = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ambassadors, loading: ambassadorsLoading, deleteAmbassador } = useAmbassadors();
  const { activities, loading: activitiesLoading } = useActivities();
  const [ambassador, setAmbassador] = useState<any>(null);
  const [ambassadorActivities, setAmbassadorActivities] = useState<Activity[]>([]);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [accountName, setAccountName] = useState('@yourbrand');
  const [specialTags, setSpecialTags] = useState('#sponsored,#ad,#partner');
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    const fetchAmbassador = async () => {
      if (id) {
        // First try to get from the list
        const foundAmbassador = ambassadors.find(a => a.id === id);
        if (foundAmbassador) {
          setAmbassador(foundAmbassador);
        } else {
          // If not found, fetch directly from API
          try {
            const response = await ambassadorAPI.getById(id);
            if (response.data?.data) {
              setAmbassador(response.data.data);
            }
          } catch (error) {
            console.error('Error fetching ambassador:', error);
          }
        }
      }
    };

    fetchAmbassador();
  }, [id, ambassadors]);

  useEffect(() => {
    // Filter activities for this ambassador
    if (id && activities.length > 0) {
      const filteredActivities = activities.filter(activity => 
        activity.ambassador && 
        (typeof activity.ambassador === 'string' ? activity.ambassador === id : activity.ambassador.id === id)
      );
      setAmbassadorActivities(filteredActivities);
    }
  }, [id, activities]);

  const handleEdit = () => {
    // Navigate to edit page
    navigate(`/ambassadors/edit/${id}`);
  };

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this ambassador? This action cannot be undone.')) {
      try {
        const success = await deleteAmbassador(id);
        if (success) {
          toast({
            title: "Ambassador Deleted",
            description: "The ambassador has been deleted successfully.",
          });
          navigate('/ambassadors');
        } else {
          throw new Error('Failed to delete ambassador');
        }
      } catch (error) {
        console.error('Error deleting ambassador:', error);
        toast({
          title: "Error",
          description: "Failed to delete ambassador. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleContactAmbassador = (contactType: 'email' | 'phone') => {
    if (!ambassador) return;
    
    if (contactType === 'email' && ambassador.email) {
      window.location.href = `mailto:${ambassador.email}`;
    } else if (contactType === 'phone' && ambassador.phone) {
      window.location.href = `tel:${ambassador.phone}`;
    } else {
      toast({
        title: "Contact Information Missing",
        description: `No ${contactType} address available for this ambassador.`,
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM': return Instagram;
      case 'TIKTOK': return Star;
      case 'FACEBOOK': return Users;
      case 'TWITTER': return MessageCircle;
      case 'YOUTUBE': return TrendingUp;
      default: return Users;
    }
  };

  const getActivityTitle = (activity: Activity) => {
    if (activity.post) {
      const post = activity.post as any;
      return post.title || 'Untitled Post';
    }
    if (activity.type === 'AD') {
      return 'Ad Campaign';
    }
    if (activity.type === 'AMBASSADOR_TASK') {
      return 'Ambassador Task';
    }
    return 'Activity';
  };

  const handleRefreshTracking = async () => {
    if (!id) return;
    
    setTrackingLoading(true);
    try {
      const tagsArray = specialTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const data = await getAmbassadorTrackingData(id, accountName, tagsArray);
      setTrackingData(data);
      toast({
        title: "Tracking Updated",
        description: "Ambassador tracking data has been refreshed.",
      });
    } catch (error) {
      console.error('Error refreshing tracking data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh tracking data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  if (ambassadorsLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading ambassador...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!ambassador) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Ambassador Not Found</h2>
            <p className="text-red-700 mb-4">
              The ambassador you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/ambassadors')}>
              Back to Ambassadors
            </Button>
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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/ambassadors')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold gradient-text">Ambassador Profile</h1>
              <p className="text-muted-foreground">
                View and manage ambassador information
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Ambassador Details */}
        <Card className="p-6 bg-gradient-card shadow-card border-0">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <img
                src={ambassador.avatar || '/placeholder-avatar.png'}
                alt={ambassador.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <h2 className="text-2xl font-bold text-card-foreground">{ambassador.name}</h2>
                <Badge variant="secondary">{ambassador.handle}</Badge>
              </div>
              <p className="text-muted-foreground mb-4">{ambassador.notes || 'No notes provided'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {ambassador.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{ambassador.email}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-6 px-2"
                      onClick={() => handleContactAmbassador('email')}
                    >
                      Contact
                    </Button>
                  </div>
                )}
                {ambassador.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{ambassador.phone}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-6 px-2"
                      onClick={() => handleContactAmbassador('phone')}
                    >
                      Call
                    </Button>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Joined {new Date(ambassador.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Platform Handles */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Platform Handles</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Main: {ambassador.handle}</span>
                  </div>
                  {ambassador.platformHandles && Object.entries(ambassador.platformHandles).map(([platform, handle]) => {
                    const PlatformIcon = getPlatformIcon(platform);
                    return (
                      <div key={platform} className="flex items-center gap-2">
                        <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{platform}: {String(handle)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Platforms */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {ambassador.platforms.map((platform: string) => {
                    const PlatformIcon = getPlatformIcon(platform);
                    return (
                      <Badge key={platform} variant="outline" className="flex items-center">
                        <PlatformIcon className="w-3 h-3 mr-1" />
                        {platform}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {ambassador.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <FileImage className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{ambassador.metrics.totalPosts}</p>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </Card>
          <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <Eye className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{(ambassador.metrics.totalReach / 1000).toFixed(1)}K</p>
            <p className="text-sm text-muted-foreground">Total Reach</p>
          </Card>
          <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <Heart className="w-8 h-8 mx-auto text-danger mb-2" />
            <p className="text-2xl font-bold">{(ambassador.metrics.totalEngagement / 1000).toFixed(1)}K</p>
            <p className="text-sm text-muted-foreground">Total Engagement</p>
          </Card>
          <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold">{ambassador.metrics.averageEngagementRate}%</p>
            <p className="text-sm text-muted-foreground">Avg. Engagement Rate</p>
          </Card>
        </div>

        {/* Tracking Configuration */}
        <Card className="p-6 bg-gradient-card shadow-card border-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Tracking Configuration</h2>
            <Button 
              onClick={handleRefreshTracking}
              disabled={trackingLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${trackingLoading ? 'animate-spin' : ''}`} />
              Refresh Tracking
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accountName" className="text-sm font-medium">
                <AtSign className="w-4 h-4 inline mr-1" />
                Account to Track Mentions
              </Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="@yourbrand"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Track stories that mention this account
              </p>
            </div>
            
            <div>
              <Label htmlFor="specialTags" className="text-sm font-medium">
                <Hash className="w-4 h-4 inline mr-1" />
                Special Tags to Track
              </Label>
              <Input
                id="specialTags"
                value={specialTags}
                onChange={(e) => setSpecialTags(e.target.value)}
                placeholder="#sponsored,#ad,#partner"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of tags to track
              </p>
            </div>
          </div>
        </Card>

        {/* Tracking Results */}
        {trackingData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-card shadow-card border-0">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <AtSign className="w-5 h-5 mr-2" />
                Account Mentions
              </h3>
              <div className="text-3xl font-bold text-center mb-2">
                {trackingData.totalMentions}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Stories mentioning {accountName}
              </p>
              
              {trackingData.mentionedStories.length > 0 && (
                <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                  {trackingData.mentionedStories.slice(0, 5).map((activity: Activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileImage className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            {activity.post ? (activity.post as any).title || 'Untitled Post' : 'Post'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/activities/view/${activity.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            <Card className="p-6 bg-gradient-card shadow-card border-0">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Tagged Posts
              </h3>
              <div className="text-3xl font-bold text-center mb-2">
                {trackingData.totalTaggedPosts}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Posts with special tags
              </p>
              
              {trackingData.taggedPosts.length > 0 && (
                <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                  {trackingData.taggedPosts.slice(0, 5).map((activity: Activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileImage className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            {activity.post ? (activity.post as any).title || 'Untitled Post' : 'Post'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/activities/view/${activity.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Activities */}
        <Card className="p-6 bg-gradient-card shadow-card border-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Activities</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/activities?ambassador=${id}`)}
            >
              View All Activities
            </Button>
          </div>
          
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : ambassadorActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activities found for this ambassador.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ambassadorActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileImage className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{getActivityTitle(activity)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.type} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">ACTIVE</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/activities/view/${activity.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
};

export default ViewAmbassador;