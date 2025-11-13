import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity as ActivityIcon, 
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
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react';
import { useActivities } from '@/hooks/useData';
import { toast } from '@/components/ui/use-toast';

const ViewActivity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getActivityById, deleteActivity, loading } = useActivities();
  const [activity, setActivity] = useState<any>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (id) {
        const fetchedActivity = await getActivityById(id);
        setActivity(fetchedActivity);
      }
    };

    fetchActivity();
  }, [id, getActivityById]);

  const handleEdit = () => {
    // Navigate to edit page
    navigate(`/activities/edit/${id}`);
  };

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this activity?')) {
      const success = await deleteActivity(id);
      if (success) {
        toast({
          title: "Activity Deleted",
          description: "The activity has been deleted successfully.",
        });
        navigate('/activities');
      } else {
        toast({
          title: "Error",
          description: "Failed to delete activity. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading activity...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!activity) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Activity Not Found</h2>
            <p className="text-red-700 mb-4">
              The activity you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/activities')}>
              Back to Activities
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

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
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const Icon = getActivityIcon(activity.type);

  // Helper function to get the name or title from a referenced object
  const getReferenceName = (ref: any) => {
    if (!ref) return 'N/A';
    if (typeof ref === 'string') return ref;
    return ref.name || ref.title || 'Untitled';
  };

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/activities')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold gradient-text">Activity Details</h1>
              <p className="text-muted-foreground">
                View and manage activity information
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

        {/* Activity Details */}
        <Card className="p-6 bg-gradient-card shadow-card border-0">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold text-card-foreground">{activity.title || 'Untitled Activity'}</h2>
                <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(activity.status || 'DRAFT')}`}>
                  {activity.status || 'DRAFT'}
                </span>
              </div>
              <p className="text-muted-foreground mb-4">{activity.description || 'No description provided'}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <ActivityIcon className="w-4 h-4 mr-2" />
                  <span>{activity.type}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                {activity.campaign && (
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    <span>{getReferenceName(activity.campaign)}</span>
                  </div>
                )}
                {activity.goal && (
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    <span>{getReferenceName(activity.goal)}</span>
                  </div>
                )}
                {activity.ambassador && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{getReferenceName(activity.ambassador)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Related Content */}
        {activity.post && (
          <Card className="p-6 bg-gradient-card shadow-card border-0">
            <h3 className="text-lg font-semibold mb-4">Related Post</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <FileImage className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{getReferenceName(activity.post)}</h4>
                <p className="text-sm text-muted-foreground">
                  Posted on {activity.post.platform || 'Unknown platform'} • {activity.post.status || 'Unknown status'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(`/posts/view/${activity.post.id}`)}>
                View Post
              </Button>
            </div>
          </Card>
        )}

        {/* Metrics */}
        {activity.metrics && (
          <Card className="p-6 bg-gradient-card shadow-card border-0">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">
                  {activity.metrics.reach?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Reach</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">
                  {activity.metrics.likes?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">
                  {activity.metrics.comments?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Comments</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">
                  {activity.metrics.shares?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Shares</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">
                  {activity.metrics.saves?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Saves</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">
                  {activity.metrics.clicks?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Clicks</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">
                  ${(activity.metrics.spendCents || 0) / 100}
                </p>
                <p className="text-sm text-muted-foreground">Spend</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">
                  ${(activity.metrics.revenueCents || 0) / 100}
                </p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ViewActivity;