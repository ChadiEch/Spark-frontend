import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import ExportButton from "@/components/ExportButton"
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Filter,
  CheckCircle
} from "lucide-react"
// Import our data hooks
import { useGoals, useUsers, useCampaigns } from "@/hooks/useData"
import { Goal } from "@/types"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { GoalForm } from "@/components/forms/GoalForm"
import { CampaignForm } from "@/components/forms/CampaignForm"
import { RoleBasedContent, ResourceBasedContent } from "@/components/ui/RoleBasedContent"

export default function Goals() {
  const { goals, loading: goalsLoading, deleteGoal, addGoal, updateGoal } = useGoals()
  const { users, loading: usersLoading } = useUsers()
  const { campaigns, loading: campaignsLoading, addCampaign } = useCampaigns()
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [filter, setFilter] = useState('all')
  const [hasError, setHasError] = useState(false)
  const filterMenuRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate()

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Goals page error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Goals page - Users:', users);
    console.log('Goals page - Users loading:', usersLoading);
    console.log('Goals page - Goals:', goals);
    console.log('Goals page - Goals loading:', goalsLoading);
  }, [users, usersLoading, goals, goalsLoading]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loading = goalsLoading || usersLoading || campaignsLoading;

  // Render error state
  if (hasError) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-red-700 mb-4">
              There was an error loading the goals page. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Render loading state after all hooks have been called
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading goals...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        const success = await deleteGoal(goalId)
        if (success) {
          toast({
            title: "Goal Deleted",
            description: "The goal has been deleted successfully.",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to delete goal. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete goal. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewDetails = (goalId: string) => {
    // Navigate to the view goal campaigns page
    navigate(`/goals/${goalId}/campaigns`);
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setShowGoalForm(true)
  }

  const handleCreateGoal = () => {
    setEditingGoal(null)
    setShowGoalForm(true)
  }

  const handleCreateCampaign = () => {
    setShowCampaignForm(true)
  }

  const handleFilterClick = () => {
    setShowFilterMenu(!showFilterMenu)
  }

  const applyFilter = (filterType: string) => {
    setFilter(filterType)
    setShowFilterMenu(false)
    toast({
      title: "Filter Applied",
      description: `Showing ${filterType === 'all' ? 'all goals' : filterType.replace('_', ' ')} goals.`,
    })
  }

  const handleSaveGoal = async (goalData: any) => {
    try {
      // Validate required fields
      if (!goalData.title || !goalData.type || !goalData.targetValue || !goalData.targetUnit) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Find the owner user with better error handling
      let ownerUser = null;
      if (goalData.owner) {
        ownerUser = users.find(u => u.id === goalData.owner);
      }

      // Create goal object with all required properties
      const goalObj = {
        title: goalData.title,
        type: goalData.type,
        targetValue: goalData.targetValue,
        targetUnit: goalData.targetUnit,
        currentValue: 0, // Default value
        status: 'UPCOMING' as const, // Correct type
        campaigns: [], // Empty array
        start: goalData.startDate,
        end: goalData.endDate,
        owner: ownerUser || users[0] || null,
      };

      if (editingGoal) {
        // Update existing goal
        const updatedGoal = await updateGoal(editingGoal.id, goalObj);
        if (updatedGoal) {
          toast({
            title: "Goal Updated",
            description: "The goal has been updated successfully.",
          });
          setShowGoalForm(false);
          setEditingGoal(null);
        } else {
          toast({
            title: "Error",
            description: "Failed to update goal. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Add new goal
        const newGoal = await addGoal(goalObj);
        if (newGoal) {
          toast({
            title: "Goal Created",
            description: "The goal has been created successfully.",
          });
          setShowGoalForm(false);
        } else {
          toast({
            title: "Error",
            description: "Failed to create goal. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: "Failed to save goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveCampaign = async (campaignData: any) => {
    try {
      // Validate required fields
      if (!campaignData.name || !campaignData.description || !campaignData.start || !campaignData.end) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Validate date range
      const startDate = new Date(campaignData.start);
      const endDate = new Date(campaignData.end);
      if (startDate >= endDate) {
        toast({
          title: "Validation Error",
          description: "End date must be after start date",
          variant: "destructive",
        });
        return;
      }

      // Add campaign
      const newCampaign = await addCampaign(campaignData);
      
      if (newCampaign) {
        toast({
          title: "Campaign Created",
          description: "The campaign has been created successfully.",
        });
        setShowCampaignForm(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to create campaign. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter goals based on selected filter
  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return goal.status === 'ACTIVE';
    if (filter === 'completed') return goal.status === 'COMPLETE';
    if (filter === 'on_track') {
      const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
      return progress >= 70;
    }
    if (filter === 'at_risk') {
      const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
      return progress < 70;
    }
    return true;
  });

  return (
    <PageLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goals & Campaigns</h1>
            <p className="text-muted-foreground">
              Track your marketing goals and campaigns
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCreateCampaign} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
            <Button onClick={handleCreateGoal}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.length}</div>
              <p className="text-xs text-muted-foreground">
                {goals.filter(g => g.status === 'ACTIVE').length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Goals</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.filter(g => g.status === 'COMPLETE').length}</div>
              <p className="text-xs text-muted-foreground">
                +{goals.filter(g => g.status === 'COMPLETE').length > 0 ? Math.round((goals.filter(g => g.status === 'COMPLETE').length / goals.length) * 100) : 0}% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'ACTIVE').length}</div>
              <p className="text-xs text-muted-foreground">
                {campaigns.length} total campaigns
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goals.length > 0 ? Math.round(goals.reduce((sum, goal) => {
                  const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
                  return sum + progress;
                }, 0) / goals.length) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all active goals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => applyFilter('all')}
            >
              All Goals
            </Button>
            <Button 
              variant={filter === 'active' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => applyFilter('active')}
            >
              Active
            </Button>
            <Button 
              variant={filter === 'completed' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => applyFilter('completed')}
            >
              Completed
            </Button>
            <Button 
              variant={filter === 'on_track' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => applyFilter('on_track')}
            >
              On Track
            </Button>
            <Button 
              variant={filter === 'at_risk' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => applyFilter('at_risk')}
            >
              At Risk
            </Button>
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Button 
              variant="outline" 
              size="sm"
              ref={filterMenuRef}
              onClick={handleFilterClick}
              className="pl-8"
            >
              Filter Options
            </Button>
          </div>
        </div>

        {/* Goals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
            return (
              <Card key={goal.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{goal.title}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(goal.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                    <span className="text-xs text-muted-foreground">
                      {goal.status === 'ACTIVE' ? 'Active' : goal.status === 'COMPLETE' ? 'Completed' : 'Inactive'}
                    </span>
                  </div>
                  <Progress value={progress} className="mb-4" />
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Target className="w-4 h-4 mr-1" />
                    <span>{goal.currentValue} / {goal.targetValue} {goal.targetUnit}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      {goal.start instanceof Date ? goal.start.toLocaleDateString() : new Date(goal.start).toLocaleDateString()} - 
                      {goal.end instanceof Date ? goal.end.toLocaleDateString() : new Date(goal.end).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Users className="w-4 h-4 mr-1" />
                    <span>
                      {goal.owner && typeof goal.owner === 'object' ? goal.owner.name : 'Unassigned'}
                    </span>
                  </div>
                  {goal.campaigns && goal.campaigns.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Campaigns:</p>
                      <div className="flex flex-wrap gap-1">
                        {goal.campaigns.slice(0, 3).map((campaign: any) => (
                          <Badge 
                            key={typeof campaign === 'string' ? campaign : campaign.id} 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-secondary/80"
                            onClick={() => {
                              // Navigate to the campaign view if it's a full object
                              if (typeof campaign === 'object' && campaign !== null && campaign.id) {
                                navigate(`/campaigns/view/${campaign.id}`);
                              }
                            }}
                          >
                            {typeof campaign === 'string' ? `Campaign ${String(campaign).substring(0, 8)}` : campaign.name}
                          </Badge>
                        ))}
                        {goal.campaigns.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{goal.campaigns.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Goal Form Dialog */}
        <Dialog open={showGoalForm} onOpenChange={setShowGoalForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Edit your existing goal details' : 'Create a new goal for your marketing campaign'}
              </DialogDescription>
            </DialogHeader>
            <GoalForm 
              onSubmit={handleSaveGoal} 
              onCancel={() => {
                setShowGoalForm(false);
                setEditingGoal(null);
              }}
              initialData={editingGoal ? {
                title: editingGoal.title || '',
                description: '', // Goal doesn't have description, using empty string
                type: editingGoal.type || 'ENGAGEMENT',
                targetValue: editingGoal.targetValue || 0,
                targetUnit: editingGoal.targetUnit || '',
                startDate: editingGoal.start ? (editingGoal.start instanceof Date ? editingGoal.start : new Date(editingGoal.start)) : new Date(),
                endDate: editingGoal.end ? (editingGoal.end instanceof Date ? editingGoal.end : new Date(editingGoal.end)) : new Date(new Date().setMonth(new Date().getMonth() + 3)),
                owner: editingGoal.owner?.id || users[0]?.id || '',
              } : undefined}
            />
          </DialogContent>
        </Dialog>

        {/* Campaign Form Dialog */}
        <Dialog open={showCampaignForm} onOpenChange={setShowCampaignForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Create a new campaign for your marketing efforts
              </DialogDescription>
            </DialogHeader>
            <CampaignForm 
              onSubmit={handleSaveCampaign} 
              onCancel={() => {
                setShowCampaignForm(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
