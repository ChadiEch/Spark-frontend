import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import IntegrationMetrics from '@/components/integrations/IntegrationMetrics';
import IntegrationList from '@/components/integrations/IntegrationList';

const AdminIntegrationsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Integration Management</CardTitle>
          <CardDescription>
            Manage all integrations and view system metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationList />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Integration Metrics</CardTitle>
          <CardDescription>
            Real-time performance and error metrics for all integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationMetrics />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIntegrationsPage;