import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CampaignForm } from '@/components/forms/CampaignForm';
import { useCampaigns, useUsers } from '@/hooks/useData';
import { toast } from '@/components/ui/use-toast';

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { addCampaign } = useCampaigns();
  const { users } = useUsers();

  const handleCreateCampaign = async (data: any) => {
    try {
      // Set the createdBy field to the first available user if not provided
      const campaignData = {
        ...data,
        createdBy: data.createdBy || (users.length > 0 ? users[0].id : '1')
      };

      const newCampaign = await addCampaign(campaignData);
      if (newCampaign) {
        toast({
          title: "Campaign Created",
          description: `Campaign "${newCampaign.name}" has been created successfully!`,
        });
        navigate('/campaigns');
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
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
            <h1 className="text-3xl font-bold gradient-text">Create New Campaign</h1>
            <p className="text-muted-foreground">
              Create a new marketing campaign
            </p>
          </div>
        </div>

        {/* Campaign Form */}
        <div className="max-w-4xl">
          <CampaignForm 
            onSubmit={handleCreateCampaign}
            onCancel={() => navigate('/campaigns')}
          />
        </div>
      </div>
    </PageLayout>
  );
}