import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit,
  Trash2,
  Eye,
  Filter
} from "lucide-react";
import { useCampaigns, useGoals, useUsers } from "@/hooks/useData";
import { Campaign } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { ResourceBasedContent } from "@/components/ui/RoleBasedContent";

export default function Campaigns() {
  const { campaigns, loading, error, deleteCampaign } = useCampaigns();
  const { goals } = useGoals();
  const { users } = useUsers();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // Filter campaigns based on status
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.status.toLowerCase() === filter.toLowerCase();
  });

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const success = await deleteCampaign(campaignId);
        if (success) {
          toast({
            title: "Campaign Deleted",
            description: "The campaign has been deleted successfully.",
          });
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

  const handleViewCampaign = (campaignId: string) => {
    // Navigate to the dedicated campaign view page
    navigate(`/campaigns/view/${campaignId}`);
  };

  const handleEditCampaign = (campaignId: string) => {
    navigate(`/campaigns/edit/${campaignId}`);
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/create');
  };

  const applyFilter = (filterType: string) => {
    setFilter(filterType);
    setShowFilterMenu(false);
    toast({
      title: "Filter Applied",
      description: `Showing ${filterType === 'all' ? 'all campaigns' : filterType.toLowerCase()} campaigns.`,
    });
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading campaigns...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Campaigns</h2>
            <p className="text-red-700 mb-4">
              {error}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold gradient-text">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage your marketing campaigns
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              
              {showFilterMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => applyFilter('all')}
                    >
                      All Campaigns
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => applyFilter('ACTIVE')}
                    >
                      Active
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => applyFilter('UPCOMING')}
                    >
                      Upcoming
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => applyFilter('COMPLETED')}
                    >
                      Completed
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => applyFilter('ARCHIVED')}
                    >
                      Archived
                    </button>
                  </div>
                </div>
              )}
            </div>
            <ResourceBasedContent 
              resource="campaigns" 
              permission="create"
              fallback={
                <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" disabled>
                  <Plus className="w-4 h-4" />
                  Create Campaign (Permission Required)
                </Button>
              }
            >
              <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" onClick={handleCreateCampaign}>
                <Plus className="w-4 h-4" />
                Create Campaign
              </Button>
            </ResourceBasedContent>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-gradient-card shadow-card border-0">
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
                  <span>
                    {campaign.start ? new Date(campaign.start).toLocaleDateString() : 'N/A'} - {campaign.end ? new Date(campaign.end).toLocaleDateString() : 'N/A'}
                  </span>
                  <span>
                    {campaign.budgetCents ? `$${(campaign.budgetCents / 100).toFixed(2)}` : 'N/A'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {campaign.channels.map((channel) => (
                    <Badge key={channel} variant="outline" className="text-xs">
                      {channel}
                    </Badge>
                  ))}
                </div>
                
                {campaign.goals && campaign.goals.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Associated Goals:</p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.goals.slice(0, 2).map((goal: any) => (
                        <Badge key={typeof goal === 'string' ? goal : goal.id} variant="secondary" className="text-xs">
                          {typeof goal === 'string' ? `Goal ${String(goal).substring(0, 8)}` : goal.title}
                        </Badge>
                      ))}
                      {campaign.goals.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{campaign.goals.length - 2} more
                        </Badge>
                      )}
                    </div>
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
                  <ResourceBasedContent 
                    resource="campaigns" 
                    permission="edit"
                    fallback={
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        disabled
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditCampaign(campaign.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </ResourceBasedContent>
                  <ResourceBasedContent 
                    resource="campaigns" 
                    permission="delete"
                    fallback={
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        disabled
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </ResourceBasedContent>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredCampaigns.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'No campaigns found. Create your first campaign to get started.' 
                    : `No ${filter.toLowerCase()} campaigns found.`}
                </p>
                <Button 
                  className="mt-4" 
                  onClick={handleCreateCampaign}
                >
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}