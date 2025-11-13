import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { integrationAPI } from '@/services/integrationService';
import { useToast } from '@/hooks/use-toast';

interface MetricsData {
  apiCalls: Record<string, { total: number; success: number; failure: number }>;
  errors: Record<string, Record<string, number>>;
  averageResponseTimes: Record<string, number>;
  timestamp: string;
}

const IntegrationMetrics: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const response = await integrationAPI.getMetrics();
      setMetrics(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch metrics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  if (!metrics) {
    return <div>No metrics available</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration Metrics</CardTitle>
          <CardDescription>
            Real-time metrics for all integrations. Last updated: {new Date(metrics.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metrics.apiCalls).map(([integration, stats]) => (
              <Card key={integration}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">{integration}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Calls:</span>
                      <span className="font-semibold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Success:</span>
                      <span className="font-semibold">{stats.success}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Failures:</span>
                      <span className="font-semibold">{stats.failure}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-semibold">
                        {stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                    {metrics.averageResponseTimes[integration] && (
                      <div className="flex justify-between">
                        <span>Avg Response:</span>
                        <span className="font-semibold">{metrics.averageResponseTimes[integration]}ms</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {Object.keys(metrics.errors).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Error Statistics</CardTitle>
            <CardDescription>
              Error distribution across integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.errors).map(([integration, errorTypes]) => (
                <div key={integration}>
                  <h3 className="text-lg font-semibold capitalize mb-2">{integration}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(errorTypes).map(([errorType, count]) => (
                      <Badge key={errorType} variant="destructive">
                        {errorType}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationMetrics;