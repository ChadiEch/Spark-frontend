import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Users, 
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Plus
} from "lucide-react";
import { useGoals, useCampaigns, useUsers } from "@/hooks/useData";
import { Goal, Campaign } from "@/types";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CampaignForm } from "@/components/forms/CampaignForm"

// Helper function to safely get goal ID from different data structures
const getGoalId = (goal: any): string => {
  if (!goal) return '';
  if (typeof goal === 'string') return goal;
  if (goal.id) return goal.id;
  if (goal._id) return goal._id;
  return '';
};

// Helper function to check if a campaign is associated with a goal
const isCampaignAssociatedWithGoal = (campaign: Campaign, goalId: string): boolean => {
  if (!campaign.goals || !goalId) return false;
  
  return campaign.goals.some(goalRef => {
    // Handle both string IDs and Goal objects
    if (typeof goalRef === 'string') {
      return goalRef === goalId;
    } else if (typeof goalRef === 'object' && goalRef !== null) {
      // For object references, extract the ID
      const refId = getGoalId(goalRef);
      return refId === goalId;
    }
    return false;
  });
};

export default function ViewGoalCampaigns() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goals, loading: goalsLoading, getGoalById } = useGoals();
  const { campaigns, loading: campaignsLoading, addCampaign } = useCampaigns();
  const { users, loading: usersLoading } = useUsers();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalCampaigns, setGoalCampaigns] = useState<Campaign[]>([]);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  
  console.log('ViewGoalCampaigns: Component rendered with ID:', id);
  console.log('ViewGoalCampaigns: Goals:', goals);
  console.log('ViewGoalCampaigns: Campaigns:', campaigns);

  useEffect(() => {
    console.log('ViewGoalCampaigns: useEffect triggered');
    console.log('ViewGoalCampaigns: ID:', id);
    console.log('ViewGoalCampaigns: Goals length:', goals.length);
    console.log('ViewGoalCampaigns: Campaigns length:', campaigns.length);
    console.log('ViewGoalCampaigns: Goals loading:', goalsLoading);
    console.log('ViewGoalCampaigns: Campaigns loading:', campaignsLoading);
    
    // Only proceed if we have the ID and data is loaded
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      console.log('ViewGoalCampaigns: Invalid ID, redirecting to goals');
      toast({
        title: "Error",
        description: "Invalid goal ID",
        variant: "destructive",
      });
      navigate('/goals');
      return;
    }
    
    // Wait for data to load
    if (goalsLoading || campaignsLoading) {
      console.log('ViewGoalCampaigns: Still loading data, waiting...');
      return;
    }
    
    // Check if we have data
    if (goals.length === 0 && campaigns.length === 0) {
      console.log('ViewGoalCampaigns: No data available, waiting...');
      return;
    }
    
    const loadGoalData = async () => {
      console.log('ViewGoalCampaigns: Loading goal data for ID:', id);
      
      try {
        // Try to get goal from the goals array first
        const foundGoal = goals.find(g => {
          const goalId = getGoalId(g);
          console.log(`Comparing goal ID: ${goalId} with route ID: ${id}`);
          return goalId === id;
        });
        console.log('ViewGoalCampaigns: Found goal in goals array:', foundGoal);
        if (foundGoal) {
          setGoal(foundGoal);
          
          // Filter campaigns that are associated with this goal
          console.log('ViewGoalCampaigns: Filtering campaigns for goal ID:', id);
          console.log('ViewGoalCampaigns: All campaigns:', campaigns);
          const associatedCampaigns = campaigns.filter(campaign => {
            console.log('ViewGoalCampaigns: Checking campaign:', campaign.id, campaign.name);
            const isAssociated = isCampaignAssociatedWithGoal(campaign, id);
            console.log('ViewGoalCampaigns: Campaign', campaign.id, 'is associated:', isAssociated);
            return isAssociated;
          });
          console.log('ViewGoalCampaigns: Associated campaigns:', associatedCampaigns);
          setGoalCampaigns(associatedCampaigns);
        } else {
          // If not found in the array, try to fetch it directly
          console.log('ViewGoalCampaigns: Goal not found in array, fetching directly');
          const fetchedGoal = await getGoalById(id);
          console.log('ViewGoalCampaigns: Fetched goal:', fetchedGoal);
          if (fetchedGoal) {
            setGoal(fetchedGoal);
            
            // Filter campaigns that are associated with this goal
            console.log('ViewGoalCampaigns: Filtering campaigns for fetched goal ID:', id);
            console.log('ViewGoalCampaigns: All campaigns:', campaigns);
            const associatedCampaigns = campaigns.filter(campaign => {
              console.log('ViewGoalCampaigns: Checking campaign:', campaign.id, campaign.name);
              const isAssociated = isCampaignAssociatedWithGoal(campaign, id);
              console.log('ViewGoalCampaigns: Campaign', campaign.id, 'is associated:', isAssociated);
              return isAssociated;
            });
            console.log('ViewGoalCampaigns: Associated campaigns (fetched):', associatedCampaigns);
            setGoalCampaigns(associatedCampaigns);
          } else {
            console.log('ViewGoalCampaigns: Goal not found, showing error');
            toast({
              title: "Error",
              description: "Goal not found",
              variant: "destructive",
            });
            navigate('/goals');
          }
        }
      } catch (error) {
        console.error('Error loading goal:', error);
        toast({
          title: "Error",
          description: "Failed to load goal data",
          variant: "destructive",
        });
        navigate('/goals');
      }
    };

    loadGoalData();
  }, [id, goals, campaigns, getGoalById, navigate]);

  // Update campaign list when campaigns data changes
  useEffect(() => {
    console.log('ViewGoalCampaigns: Campaigns data updated');
    console.log('ViewGoalCampaigns: Current goal:', goal);
    console.log('ViewGoalCampaigns: Updated campaigns:', campaigns);
    
    if (goal && campaigns.length > 0) {
      // Re-filter campaigns when campaigns data changes
      const goalId = getGoalId(goal);
      const associatedCampaigns = campaigns.filter(campaign => {
        console.log('ViewGoalCampaigns: Re-checking campaign:', campaign.id, campaign.name);
        const isAssociated = isCampaignAssociatedWithGoal(campaign, goalId);
        console.log('ViewGoalCampaigns: Campaign', campaign.id, 'is associated:', isAssociated);
        return isAssociated;
      });
      console.log('ViewGoalCampaigns: Updated associated campaigns:', associatedCampaigns);
      setGoalCampaigns(associatedCampaigns);
    }
  }, [campaigns, goal]);

  const handleViewCampaign = (campaignId: string) => {
    // Navigate to the campaign view page
    navigate(`/campaigns/view/${campaignId}`);
  };

  const handleEditCampaign = (campaignId: string) => {
    navigate(`/campaigns/edit/${campaignId}`);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    toast({
      title: "Delete Campaign",
      description: "Campaign deletion functionality would be implemented here",
    });
  };

  const handleAddCampaign = () => {
    setEditingCampaign(null);
    setShowCampaignForm(true);
  };

  const handleSaveCampaign = async (campaignData: any) => {
    try {
      console.log('Campaign data being sent:', campaignData);
      
      // Get the full user object for createdBy field
      const createdByUser = users.find(user => user.id === campaignData.createdBy) || users[0] || null;
      
      // Format the campaign data to match backend expectations
      const formattedCampaignData = {
        ...campaignData,
        createdBy: createdByUser?.id || createdByUser || campaignData.createdBy, // Send user ID or the original value
        goals: id ? [id] : [], // Associate with the current goal
        budgetCents: campaignData.budgetCents || (campaignData.budget ? Math.round(campaignData.budget * 100) : 0),
        start: campaignData.startDate || campaignData.start,
        end: campaignData.endDate || campaignData.end
      };
      
      // Remove the budget field if budgetCents exists
      if (formattedCampaignData.budgetCents && formattedCampaignData.budget !== undefined) {
        delete formattedCampaignData.budget;
      }
      
      // Remove startDate/endDate if we're using start/end
      if (formattedCampaignData.startDate !== undefined) {
        delete formattedCampaignData.startDate;
      }
      if (formattedCampaignData.endDate !== undefined) {
        delete formattedCampaignData.endDate;
      }
      
      console.log('Formatted campaign data being sent:', formattedCampaignData);
      
      const newCampaign = await addCampaign(formattedCampaignData);
      
      if (newCampaign) {
        toast({
          title: "Campaign Created",
          description: `Campaign "${campaignData.name}" has been created successfully!`,
        });
        setShowCampaignForm(false);
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      toast({
        title: "Error",
        description: `Failed to create campaign: ${error.response?.data?.message || error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  };

  const loading = goalsLoading || campaignsLoading || usersLoading;
  console.log('ViewGoalCampaigns: Loading state - Goals:', goalsLoading, 'Campaigns:', campaignsLoading, 'Users:', usersLoading, 'Overall:', loading);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading goal and campaigns...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!goal) {
    console.log('ViewGoalCampaigns: No goal found, showing not found page');
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Goal Not Found</h2>
            <p className="text-red-700 mb-4">
              The requested goal could not be found.
            </p>
            <Button onClick={() => navigate('/goals')}>
              Back to Goals
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Get the goal ID safely
  const goalId = getGoalId(goal);
  console.log('ViewGoalCampaigns: Using goalId for edit button:', goalId);

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/goals')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Goals
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{goal.title}</h1>
              <p className="text-muted-foreground">
                View campaigns associated with this goal
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddCampaign} className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
            <Button onClick={() => {
              console.log('Edit button clicked with goalId:', goalId);
              navigate(`/goals/edit/${goalId}`);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Goal
            </Button>
          </div>
        </div>

        {/* Goal Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goal Overview
            </CardTitle>
            <CardDescription>
              Details about this goal and its progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="text-lg font-semibold">
                  {goal.targetValue?.toLocaleString()} {goal.targetUnit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Progress</p>
                <p className="text-lg font-semibold">
                  {(goal.currentValue || 0).toLocaleString()} {goal.targetUnit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={
                  goal.status === 'ACTIVE' ? 'default' : 
                  goal.status === 'AT_RISK' ? 'destructive' : 
                  goal.status === 'OFF_TRACK' ? 'destructive' : 
                  goal.status === 'COMPLETE' ? 'default' : 'secondary'
                }>
                  {(goal.status || '').replace('_', ' ')}
                </Badge>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>
                  {goal.targetValue ? Math.round(((goal.currentValue || 0) / goal.targetValue) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={goal.targetValue ? ((goal.currentValue || 0) / goal.targetValue) * 100 : 0} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {goal.start ? new Date(goal.start).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {goal.end ? new Date(goal.end).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">
                {goal.owner?.name || 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Associated Campaigns</h2>
            <Badge variant="secondary">
              {goalCampaigns.length} {goalCampaigns.length === 1 ? 'Campaign' : 'Campaigns'}
            </Badge>
          </div>
          
          {goalCampaigns.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No campaigns are currently associated with this goal.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={handleAddCampaign}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goalCampaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{campaign.name}</CardTitle>
                    <Badge variant={
                      campaign.status === 'ACTIVE' ? 'default' : 
                      campaign.status === 'UPCOMING' ? 'secondary' : 
                      campaign.status === 'COMPLETED' ? 'default' : 'secondary'
                    }>
                      {campaign.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {campaign.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {campaign.start ? new Date(campaign.start).toLocaleDateString() : 'N/A'}
                      </span>
                      <span>
                        {campaign.budgetCents ? `$${(campaign.budgetCents / 100).toFixed(2)}` : 'N/A'}
                      </span>
                    </div>
                    
                    {campaign.channels && campaign.channels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {campaign.channels.slice(0, 3).map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                        {campaign.channels.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{campaign.channels.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewCampaign(campaign.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditCampaign(campaign.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Form Dialog */}
        <Dialog open={showCampaignForm} onOpenChange={setShowCampaignForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Create a new campaign associated with this goal
              </DialogDescription>
            </DialogHeader>
            <CampaignForm 
              onSubmit={handleSaveCampaign} 
              onCancel={() => {
                setShowCampaignForm(false);
                setEditingCampaign(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}