import React, { useState, useEffect } from 'react';
import { Integration, IntegrationConnection } from '@/types';
import { integrationService } from '@/services/integrationService';
import IntegrationCard from './IntegrationCard';
import { useToast } from '@/hooks/use-toast';

const IntegrationList: React.FC = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    try {
      const [integrationsData, connectionsData] = await Promise.all([
        integrationService.getAll(),
        integrationService.getUserConnections()
      ]);
      
      setIntegrations(integrationsData);
      setConnections(connectionsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch integrations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const getConnectionForIntegration = (integrationId: string) => {
    return connections.find(conn => conn.integrationId === integrationId);
  };

  if (loading) {
    return <div>Loading integrations...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {integrations.map(integration => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          connection={getConnectionForIntegration(integration.id)}
          onConnectionChange={fetchIntegrations}
        />
      ))}
    </div>
  );
};

export default IntegrationList;