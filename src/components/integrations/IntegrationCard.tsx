import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Integration, IntegrationConnection } from '@/types';
import { integrationService } from '@/services/integrationService';
import { useToast } from '@/hooks/use-toast';

interface IntegrationCardProps {
  integration: Integration;
  connection?: IntegrationConnection;
  onConnectionChange: () => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ 
  integration, 
  connection, 
  onConnectionChange 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const result = await integrationService.connect(integration.id);
      if (result?.authorizationUrl) {
        // Open OAuth provider in a new window
        window.open(result.authorizationUrl, '_blank', 'width=600,height=800');
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to integration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    
    setIsLoading(true);
    try {
      await integrationService.disconnect(connection.id);
      toast({
        title: 'Disconnected',
        description: `Successfully disconnected from ${integration.name}`
      });
      onConnectionChange();
    } catch (error) {
      toast({
        title: 'Disconnection Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect integration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!connection) return;
    
    setIsLoading(true);
    try {
      await integrationService.refreshConnection(connection.id);
      toast({
        title: 'Tokens Refreshed',
        description: `Successfully refreshed connection to ${integration.name}`
      });
      onConnectionChange();
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: error instanceof Error ? error.message : 'Failed to refresh integration connection',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">{integration.name.charAt(0)}</span>
            </div>
            <div>
              <CardTitle>{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
          </div>
          <Badge variant={integration.category === 'social' ? 'default' : 'secondary'}>
            {integration.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {integration.scopes.map((scope, index) => (
            <Badge key={index} variant="outline">{scope}</Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {connection ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh Tokens'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                disabled={isLoading}
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
              <div className="ml-auto text-sm text-muted-foreground">
                Connected since {new Date(connection.createdAt).toLocaleDateString()}
              </div>
            </>
          ) : (
            <Button 
              onClick={handleConnect}
              disabled={isLoading || !integration.enabled}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
        
        {!integration.enabled && (
          <div className="mt-2 text-sm text-yellow-600">
            This integration is currently disabled.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;