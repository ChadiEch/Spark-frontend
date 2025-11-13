import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CampaignForm } from '@/components/forms/CampaignForm';
import { useCampaigns } from '@/hooks/useData';
import { toast } from '@/components/ui/use-toast';
import { Campaign } from '@/types';

export default function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, loading, updateCampaign, getCampaignById } = useCampaigns();
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const loadCampaign = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Invalid campaign ID",
          variant: "destructive",
        });
        navigate('/campaigns');
        return;
      }

      try {
        // First try to find in the existing campaigns
        const existingCampaign = campaigns.find(c => c.id === id);
        if (existingCampaign) {
          setCampaign(existingCampaign);
          return;
        }

        // If not found, fetch directly from the API
        const fetchedCampaign = await getCampaignById(id);
        if (fetchedCampaign) {
          setCampaign(fetchedCampaign);
        } else {
          toast({
            title: "Error",
            description: "Campaign not found",
            variant: "destructive",
          });
          navigate('/campaigns');
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        toast({
          title: "Error",
          description: "Failed to load campaign data",
          variant: "destructive",
        });
        navigate('/campaigns');
      }
    };

    loadCampaign();
  }, [id, campaigns, getCampaignById, navigate]);

  const handleUpdateCampaign = async (data: any) => {
    if (!id) return;

    try {
      const updatedCampaign = await updateCampaign(id, data);
      if (updatedCampaign) {
        toast({
          title: "Campaign Updated",
          description: `Campaign "${updatedCampaign.name}" has been updated successfully!`,
        });
        navigate('/campaigns');
      } else {
        throw new Error('Failed to update campaign');
      }
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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

  if (!campaign) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Campaign Not Found</h2>
            <p className="text-red-700 mb-4">
              The requested campaign could not be found.
            </p>
            <Button onClick={() => navigate('/campaigns')}>
              Back to Campaigns
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Prepare initial data for the form
  const initialData = {
    name: campaign.name,
    description: campaign.description || '',
    status: campaign.status,
    startDate: new Date(campaign.start),
    endDate: new Date(campaign.end),
    budget: campaign.budgetCents ? campaign.budgetCents / 100 : 0,
    channels: campaign.channels,
    createdBy: campaign.createdBy?.id || '1',
    goals: campaign.goals?.map(goal => typeof goal === 'string' ? goal : goal.id) || [],
  };

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/campaigns')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Edit Campaign</h1>
            <p className="text-muted-foreground">
              Edit campaign: {campaign.name}
            </p>
          </div>
        </div>

        {/* Campaign Form */}
        <div className="max-w-4xl">
          <CampaignForm 
            onSubmit={handleUpdateCampaign}
            onCancel={() => navigate('/campaigns')}
            initialData={initialData}
          />
        </div>
      </div>
    </PageLayout>
  );
}