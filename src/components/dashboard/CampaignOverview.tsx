import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Clock } from 'lucide-react';
import { Campaign } from '../../types';

interface CampaignOverviewProps {
  campaigns: Campaign[];
  onViewAll: () => void;
}

export function CampaignOverview({ campaigns, onViewAll }: CampaignOverviewProps) {
  // Filter out undefined campaigns
  const validCampaigns = Array.isArray(campaigns) ? campaigns.filter(c => c !== undefined) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Active Campaigns</h2>
        <Button variant="outline" size="sm" onClick={onViewAll}>View All</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {validCampaigns.map((campaign) => (
          campaign ? (
            <Card key={campaign.id} className="p-6 bg-gradient-card shadow-card border-0">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-card-foreground">{campaign.name || 'Unnamed Campaign'}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.description || 'No description'}
                    </p>
                  </div>
                  <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {campaign.status || 'UNKNOWN'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <p className="font-medium">
                      ${(((campaign.budgetCents || 0) / 100).toLocaleString() || '0')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spent:</span>
                    <p className="font-medium">
                      ${(((campaign.spentCents || 0) / 100).toLocaleString() || '0')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {campaign.start ? new Date(campaign.start).toLocaleDateString() : 'N/A'} - {campaign.end ? new Date(campaign.end).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {Array.isArray(campaign.channels) ? campaign.channels.map((channel) => (
                    <Badge key={channel} variant="outline" className="text-xs">
                      {channel}
                    </Badge>
                  )) : null}
                </div>
              </div>
            </Card>
          ) : null
        ))}
      </div>
    </div>
  );
}