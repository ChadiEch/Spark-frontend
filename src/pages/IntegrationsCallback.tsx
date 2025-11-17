import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { integrationService } from '@/services/integrationService';
import { toast } from '@/components/ui/use-toast';

export default function IntegrationsCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Parse query parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        
        console.log('OAuth callback received', { code, state, error, search: location.search });
        
        // Check for OAuth errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }
        
        if (!code) {
          throw new Error('No authorization code received');
        }
        
        if (!state) {
          throw new Error('No state parameter received');
        }
        
        // Parse state to get integration info
        let stateData;
        try {
          stateData = JSON.parse(decodeURIComponent(state));
          console.log('Parsed state data', stateData);
        } catch (e) {
          throw new Error('Invalid state parameter');
        }
        
        const { integrationId, userId } = stateData;
        
        if (!integrationId) {
          throw new Error('No integration ID in state');
        }
        
        if (!userId) {
          throw new Error('No user ID in state');
        }
        
        // Exchange the authorization code for access tokens
        setStatus('loading');
        setMessage('Exchanging authorization code for access tokens...');
        
        // Use the redirect URI from the environment or default to the frontend callback
        // On Railway, we need to use the production URL instead of window.location.origin
        const isRailway = window.location.hostname.includes('railway.app');
        const frontendUrl = isRailway 
          ? 'https://spark-frontend-production.up.railway.app'
          : window.location.origin;
        const redirectUri = `${frontendUrl}/integrations/callback`;
        console.log('Exchanging code for tokens', { integrationId, code, redirectUri, userId });
        const connection = await integrationService.exchangeCodeForTokens(integrationId, code, redirectUri, userId);
        
        console.log('Exchange result', connection);
        
        if (!connection) {
          throw new Error('Failed to exchange code for tokens');
        }
        
        setStatus('success');
        setMessage('Authentication successful! Integration connected.');
        
        // Show success toast
        toast({
          title: "Integration Connected",
          description: "The integration has been successfully connected to your account.",
        });
        
        // Redirect to settings after a delay
        setTimeout(() => {
          navigate('/settings?tab=integrations');
        }, 3000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(`Authentication failed: ${(error as Error).message}`);
        
        // Show error toast
        toast({
          title: "Authentication Failed",
          description: `Failed to connect integration: ${(error as Error).message}`,
          variant: "destructive",
        });
        
        // Redirect to settings after a delay
        setTimeout(() => {
          navigate('/settings?tab=integrations');
        }, 5000);
      }
    };
    
    handleOAuthCallback();
  }, [location, navigate]);
  
  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Integration Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">{message}</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <p className="text-green-500 font-medium">{message}</p>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to settings shortly...
                </p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <p className="text-red-500 font-medium">{message}</p>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to settings shortly...
                </p>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings?tab=integrations')}
              className="w-full mt-4"
            >
              Back to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}