import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testBackendConnection, testBackendEndpoints } from '@/services/testBackendConnection';
import { testAndSetAPIAvailability } from '@/services/dataService';

export function ApiTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [endpointStatus, setEndpointStatus] = useState<any>(null);

  useEffect(() => {
    const runTests = async () => {
      // Test backend connection
      const isBackendAvailable = await testBackendConnection();
      setConnectionStatus(isBackendAvailable ? 'Connected' : 'Not Connected');
      
      // Test API availability
      const isAPIAvailable = await testAndSetAPIAvailability();
      setApiStatus(isAPIAvailable ? 'Available' : 'Not Available');
      
      // Test endpoints if backend is available
      if (isBackendAvailable) {
        const endpoints = await testBackendEndpoints();
        setEndpointStatus(endpoints);
      }
    };
    
    runTests();
  }, []);

  const handleRerunTests = async () => {
    setConnectionStatus('Checking...');
    setApiStatus('Checking...');
    setEndpointStatus(null);
    
    // Test backend connection
    const isBackendAvailable = await testBackendConnection();
    setConnectionStatus(isBackendAvailable ? 'Connected' : 'Not Connected');
    
    // Test API availability
    const isAPIAvailable = await testAndSetAPIAvailability();
    setApiStatus(isAPIAvailable ? 'Available' : 'Not Available');
    
    // Test endpoints if backend is available
    if (isBackendAvailable) {
      const endpoints = await testBackendEndpoints();
      setEndpointStatus(endpoints);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Backend Connection:</span>
          <span className={connectionStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}>
            {connectionStatus}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>API Status:</span>
          <span className={apiStatus === 'Available' ? 'text-green-600' : 'text-red-600'}>
            {apiStatus}
          </span>
        </div>
        
        {endpointStatus && (
          <div className="space-y-2">
            <h3 className="font-medium">Endpoint Tests:</h3>
            {Object.entries(endpointStatus).map(([endpoint, status]) => (
              <div key={endpoint} className="flex items-center justify-between text-sm">
                <span>{endpoint}:</span>
                <span className={status === 'OK' ? 'text-green-600' : 'text-red-600'}>
                  {status as string}
                </span>
              </div>
            ))}
          </div>
        )}
        
        <Button onClick={handleRerunTests} className="w-full">
          Re-run Tests
        </Button>
      </CardContent>
    </Card>
  );
}