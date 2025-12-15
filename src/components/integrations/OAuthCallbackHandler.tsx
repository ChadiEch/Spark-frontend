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
        // Check if we're receiving success or error parameters from backend redirect
        const searchParams = new URLSearchParams(location.search);
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        
        // If we have success or error parameters, it means we were redirected from backend
        if (success !== null || error) {
          if (error) {
            throw new Error(decodeURIComponent(error));
          }
          
          toast({
            title: 'Success',
            description: 'Successfully connected to the integration!'
          });
          
          // Redirect to integrations page
          navigate('/settings?tab=integrations');
          return;
        }
        
        // Otherwise, this is a direct OAuth callback from the provider
        // Parse query parameters
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
        
        // Use the redirect URI from the environment or default to the backend callback
        // Use the backend URL for redirect URI to match OAuth provider configuration
        // On Railway, this should be configured in the Railway dashboard
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 
          (typeof window !== 'undefined' && window.location.hostname.includes('railway.app') 
            ? `https://${window.location.hostname.replace('frontend', 'backend')}`
            : 'http://localhost:5001');
        const redirectUri = `${backendUrl}/api/integrations/callback`;
        
        // Exchange code for tokens
        await integrationService.exchangeCodeForTokens(integrationId, code, redirectUri, '');
        
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Processing OAuth callback...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackHandler;