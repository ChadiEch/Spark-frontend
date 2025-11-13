import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import IntegrationList from '@/components/integrations/IntegrationList';

const IntegrationsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect your accounts to enable seamless data synchronization and automation workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationList />
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>
              Overview of your connected integrations and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Connected</h3>
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-muted-foreground">Active integrations</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">0</p>
                <p className="text-sm text-muted-foreground">Awaiting setup</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Issues</h3>
                <p className="text-2xl font-bold text-red-600">0</p>
                <p className="text-sm text-muted-foreground">Requiring attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsPage;