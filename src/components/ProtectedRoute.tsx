import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Only redirect to login if we're not already on the login page
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          // Redirect to login if not authenticated
          navigate('/login');
        }
      } else {
        // User is authenticated, show content
        setShowContent(true);
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user, and we're not on a public page, redirect to login
  if (!user && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/accept-invitation') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render children if user is authenticated or if we're on a public page
  return showContent || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/accept-invitation' ? <>{children}</> : null;
}