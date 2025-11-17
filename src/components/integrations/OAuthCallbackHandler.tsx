import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { integrationService } from '@/services/integrationService';
import { useToast } from '@/hooks/use-toast';

const OAuthCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Parse query parameters
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          throw new Error('No authorization code received');
        }
        
        // Parse state to get integration ID
        let integrationId = '';
        if (state) {
          try {
            const stateObj = JSON.parse(decodeURIComponent(state));
            integrationId = stateObj.integrationId;
          } catch (e) {
            // If we can't parse state, we'll try to get integration ID from other sources
            console.warn('Could not parse state parameter', e);
          }
        }
        
        // Use the redirect URI from the environment or default to the frontend callback
        // On Railway, we need to use the production URL instead of window.location.origin
        const isRailway = window.location.hostname.includes('railway.app');
        const frontendUrl = isRailway 
          ? 'https://spark-frontend-production.up.railway.app'
          : window.location.origin;
        const redirectUri = `${frontendUrl}/integrations/callback`;
        
        // Exchange code for tokens
        await integrationService.exchangeCodeForTokens(integrationId, code, redirectUri);
        
        toast({
          title: 'Success',
          description: 'Successfully connected to the integration!'
        });
        
        // Redirect to integrations page
        navigate('/settings?tab=integrations');
      } catch (error) {
        toast({
          title: 'Connection Failed',
          description: error instanceof Error ? error.message : 'Failed to connect to integration',
          variant: 'destructive'
        });
        
        // Redirect to integrations page even on failure
        navigate('/settings?tab=integrations');
      } finally {
        setProcessing(false);
      }
    };
    
    handleOAuthCallback();
  }, [location, navigate, toast]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Integration Connection</h2>
        <p className="text-muted-foreground">
          {processing 
            ? 'Please wait while we complete the connection...' 
            : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
};

export default OAuthCallbackHandler;