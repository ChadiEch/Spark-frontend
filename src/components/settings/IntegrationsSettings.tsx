import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Instagram,
  Facebook,
  Globe,
  Youtube,
  Check,
  X
} from 'lucide-react';
import { Integration } from '@/types';

interface IntegrationProps {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
  color: string;
  connectionId?: string;
}

interface IntegrationsSettingsProps {
  integrations: IntegrationProps[];
  onToggleConnection: (id: string) => void;
}

export function IntegrationsSettings({ integrations, onToggleConnection }: IntegrationsSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integrations</h2>
        <p className="text-muted-foreground">Connect your social media accounts and other services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const IconComponent = integration.icon;
          return (
            <Card key={integration.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${integration.connected ? 'bg-primary/10' : 'bg-muted'}`}>
                    <IconComponent className={`h-6 w-6 ${integration.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Badge 
                  variant={integration.connected ? "default" : "secondary"}
                  className={integration.connected ? "bg-green-500" : ""}
                >
                  {integration.connected ? (
                    <span className="flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      Not Connected
                    </span>
                  )}
                </Badge>
              </div>
              <div className="flex justify-end mt-4">
                <Button 
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => onToggleConnection(integration.id)}
                >
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}