import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Target,
  Activity,
  Edit,
  Trash2
} from "lucide-react";
import { useCampaigns, useGoals, useUsers } from "@/hooks/useData";
import { Campaign } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { ResourceBasedContent } from "@/components/ui/RoleBasedContent";

export default function ViewCampaign() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, loading: campaignsLoading, error: campaignsError, deleteCampaign } = useCampaigns();
  const { goals } = useGoals();
  const { users } = useUsers();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) {
        setError('No campaign ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // First, check if campaign is already in the list
        const foundCampaign = campaigns.find(c => c.id === id);
        if (foundCampaign) {
          setCampaign(foundCampaign);
          setLoading(false);
          return;
        }

        // If not found in the list, fetch it directly
        // This would require importing the campaignService
        const { campaignService } = await import('@/services/dataService');
        const fetchedCampaign = await campaignService.getById(id);
        if (fetchedCampaign) {
          setCampaign(fetchedCampaign);
        } else {
          setError('Campaign not found');
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, campaigns]);

  const handleDeleteCampaign = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        const success = await deleteCampaign(id);
        if (success) {
          toast({
            title: "Campaign Deleted",
            description: "The campaign has been deleted successfully.",
          });
          navigate('/campaigns');
        } else {
          toast({
            title: "Error",
            description: "Failed to delete campaign. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
            description: "Failed to delete campaign. Please try again.",
            variant: "destructive",
        });
      }
    }
  };

  const handleEditCampaign = () => {
    if (id) {
      navigate(`/campaigns/edit/${id}`);
    }
  };

  const handleBack = () => {
    navigate('/campaigns');
  };

  if (loading || campaignsLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading campaign...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || campaignsError) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Campaign</h2>
            <p className="text-red-700 mb-4">
              {error || campaignsError}
            </p>
            <Button 
              onClick={handleBack}
              className="bg-red-600 hover:bg-red-700"
            >
              Back to Campaigns
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!campaign) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Campaign Not Found</h2>
            <p className="text-red-700 mb-4">
              The requested campaign could not be found.
            </p>
            <Button 
              onClick={handleBack}
              className="bg-red-600 hover:bg-red-700"
            >
              Back to Campaigns
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Find associated goals
  const associatedGoals = campaign.goals?.map(goalId => {
    if (typeof goalId === 'string') {
      return goals.find(g => g.id === goalId);
    }
    return goalId;
  }).filter(Boolean) || [];

  // Find creator
  const creatorUser = users.find(u => u.id === (typeof campaign.createdBy === 'string' ? campaign.createdBy : campaign.createdBy?.id));
  const creatorName = creatorUser?.name || 
                     (typeof campaign.createdBy === 'object' && campaign.createdBy !== null ? (campaign.createdBy as any)?.name : null) || 
                     'Unknown';

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold gradient-text">{campaign.name}</h1>
              <p className="text-muted-foreground">
                Campaign details
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Show "Back to Goal" button if campaign is associated with a single goal */}
            {associatedGoals.length === 1 && (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/goals/${associatedGoals[0].id}/campaigns`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Goal
              </Button>
            )}
            <ResourceBasedContent 
              resource="campaigns" 
              permission="edit"
              fallback={
                <Button variant="outline" disabled>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit (Permission Required)
                </Button>
              }
            >
              <Button variant="outline" onClick={handleEditCampaign}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </ResourceBasedContent>
            <ResourceBasedContent 
              resource="campaigns" 
              permission="delete"
              fallback={
                <Button variant="destructive" disabled>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete (Permission Required)
                </Button>
              }
            >
              <Button variant="destructive" onClick={handleDeleteCampaign}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </ResourceBasedContent>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
              <CardDescription>Basic details about this campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{campaign.description || 'No description provided'}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant={
                    campaign.status === 'ACTIVE' ? 'default' : 
                    campaign.status === 'UPCOMING' ? 'secondary' : 
                    campaign.status === 'COMPLETED' ? 'default' : 'secondary'
                  }>
                    {campaign.status}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                  <p className="mt-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {campaign.budgetCents ? `$${(campaign.budgetCents / 100).toFixed(2)}` : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                  <p className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {campaign.start ? new Date(campaign.start).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                  <p className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {campaign.end ? new Date(campaign.end).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Channels</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {campaign.channels && campaign.channels.length > 0 ? (
                    campaign.channels.map((channel) => (
                      <Badge key={channel} variant="outline">
                        {channel}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No channels specified</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Associated Data</CardTitle>
              <CardDescription>Goals and creator information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Goals
                </h3>
                <div className="mt-2 space-y-2">
                  {associatedGoals.length > 0 ? (
                    associatedGoals.map((goal: any) => (
                      <div key={goal.id} className="flex items-center justify-between p-2 bg-muted rounded hover:bg-accent cursor-pointer" 
                           onClick={() => navigate(`/goals/${goal.id}/campaigns`)}>
                        <span>{goal.title}</span>
                        <Badge variant="secondary">{goal.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No goals associated with this campaign</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Creator
                </h3>
                <p className="mt-1">{creatorName}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}