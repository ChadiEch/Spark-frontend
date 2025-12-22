import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testBackendConnection } from '@/services/testBackendConnection';

export function TestBackendConnectivity() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runTests = async () => {
    setLoading(true);
    try {
      const result = await testBackendConnection();
      setTestResults(result);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Backend & Database Connectivity Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Connection Status</h2>
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Testing...' : 'Run Test'}
            </Button>
          </div>

          {testResults ? (
            <div className="space-y-4">
              {/* Backend Status */}
              <div className="p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Backend Server</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    testResults.backendConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults.backendConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {testResults.healthData && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>Uptime: {Math.floor(testResults.healthData.uptime)} seconds</div>
                    <div>Timestamp: {new Date(testResults.healthData.timestamp).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Database Status */}
              <div className="p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Database</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    testResults.databaseConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults.databaseConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                {testResults.databaseInfo && (
                  <div className="mt-2 text-sm">
                    {testResults.databaseInfo.status === 'connected' ? (
                      <div className="space-y-1">
                        <div>Host: {testResults.databaseInfo.host}</div>
                        <div>Name: {testResults.databaseInfo.name}</div>
                        <div>Port: {testResults.databaseInfo.port}</div>
                        {testResults.databaseInfo.ping && (
                          <div>Ping: {testResults.databaseInfo.ping}</div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div>Status: {testResults.databaseInfo.status}</div>
                        {testResults.databaseInfo.message && (
                          <div>Message: {testResults.databaseInfo.message}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Detailed Health Info */}
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Detailed Health Information</h3>
                <div className="text-sm space-y-1">
                  <div>Platform: {testResults.healthData?.platform?.platform}</div>
                  <div>Architecture: {testResults.healthData?.platform?.arch}</div>
                  <div>Hostname: {testResults.healthData?.platform?.hostname}</div>
                  <div>
                    Memory: {(testResults.healthData?.process?.memory?.rss / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No test results available</p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <h4 className="font-medium mb-2">About this test:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Checks if the backend server is reachable</li>
              <li>Verifies database connectivity status</li>
              <li>Displays detailed health information</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TestBackendConnectivity;