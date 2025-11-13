import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Activity as ActivityIcon, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useActivities } from '@/hooks/useData';
import { toast } from '@/components/ui/use-toast';

// Define the Activity type
interface Activity {
  id: string;
  type: 'POST' | 'AD' | 'AMBASSADOR_TASK';
  title?: string;
  description?: string;
  createdAt?: string;
}

const DeleteActivity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getActivityById, deleteActivity, loading } = useActivities();
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (id) {
        try {
          const fetchedActivityData: any = await getActivityById(id);
          // Type assertion to our Activity interface
          const fetchedActivity = fetchedActivityData as Activity;
          setActivity(fetchedActivity);
        } catch (error) {
          console.error('Error fetching activity:', error);
        }
      }
    };

    fetchActivity();
  }, [id, getActivityById]);

  const handleDelete = async () => {
    if (id) {
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

  const handleCancel = () => {
    navigate('/activities');
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
              The activity you're trying to delete doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/activities')}>
              Back to Activities
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/activities')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold gradient-text">Delete Activity</h1>
            <p className="text-muted-foreground">
              Confirm deletion of activity
            </p>
          </div>
        </div>

        {/* Delete Confirmation */}
        <Card className="p-6 bg-gradient-card shadow-card border-0">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Delete Activity</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete the activity <span className="font-semibold">"{activity.title || 'Untitled Activity'}"</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Activity
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DeleteActivity;