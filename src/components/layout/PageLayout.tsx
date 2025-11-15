import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';
import NotificationBell from '@/components/NotificationBell';
import GlobalSearch from '@/components/GlobalSearch';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showInitButton, setShowInitButton] = useState(true);
  
  // Force show button in development and on Railway for testing
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isRailway = window.location.hostname.includes('railway.app');
    
    if (isDevelopment || isRailway) {
      setShowInitButton(true);
    }
  }, []);
  
  // Also check for Railway in the auto-initialize effect
  useEffect(() => {
    const isRailway = window.location.hostname.includes('railway.app');
    if (isRailway) {
      setShowInitButton(true);
    }
  }, []);

  // Temporary function to initialize integrations
  const handleInitializeIntegrations = async () => {
    try {
      // Use full URL on Railway to ensure proper routing
      const isRailway = window.location.hostname.includes('railway.app');
      const apiUrl = isRailway 
        ? `${window.location.origin}/api/integrations/initialize`
        : '/api/integrations/initialize';
        
      console.log('Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (response.ok) {
        try {
          const data = responseText ? JSON.parse(responseText) : {};
          toast({
            title: 'Success',
            description: data.message || 'Integrations initialized successfully',
          });
          console.log('Integrations initialized:', data);
        } catch (jsonError) {
          console.log('JSON parsing error:', jsonError);
          toast({
            title: 'Success',
            description: 'Integrations initialized successfully',
          });
        }
        // Hide the button after successful initialization
        // setShowInitButton(false);
      } else {
        toast({
          title: 'Error',
          description: `Failed to initialize: ${response.status} - ${responseText.substring(0, 100)}`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.log('Initialization error:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize integrations: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Automatically initialize integrations on page load
  useEffect(() => {
    const autoInitialize = async () => {
      try {
        // Use full URL on Railway to ensure proper routing
        const isRailway = window.location.hostname.includes('railway.app');
        const apiUrl = isRailway 
          ? `${window.location.origin}/api/integrations/initialize`
          : '/api/integrations/initialize';
          
        console.log('Auto-initializing - Making request to:', apiUrl);
          
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Auto-initialize response status:', response.status);
        console.log('Auto-initialize response headers:', [...response.headers.entries()]);
        
        const responseText = await response.text();
        console.log('Auto-initialize response text:', responseText);
        
        if (response.ok) {
          try {
            const data = responseText ? JSON.parse(responseText) : {};
            console.log('Integrations auto-initialized:', data.message);
            console.log('Success response:', data);
            // Keep the button visible for testing
            // setShowInitButton(false);
          } catch (jsonError) {
            console.log('Auto-initialize JSON parsing error:', jsonError);
          }
        } else {
          // If initialization fails, show the button so user can try manually
          console.log('Auto-initialization failed, showing manual button');
          console.log('Response status:', response.status);
          console.log('Response text:', responseText);
          // setShowInitButton(true);
        }
      } catch (error: any) {
        // If initialization fails, show the button so user can try manually
        console.log('Auto-initialization error, showing manual button:', error);
        console.log('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        // Always show button in case of error
        setShowInitButton(true);
      }
    };

    // Run initialization automatically after a short delay to ensure backend is ready
    setTimeout(() => {
      autoInitialize();
    }, 1000);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking on overlay or navigating (mobile only)
  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed h-screen z-50 transition-transform duration-300 ease-in-out bg-sidebar-background",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isMobile ? "w-64" : "w-64"
        )}
      >
        <Sidebar onClose={isMobile ? closeSidebar : undefined} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 bg-background border-b border-sidebar-border z-30 p-3 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSidebar}
              className="text-sidebar-foreground"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        )}
        
        {/* Desktop header */}
        {!isMobile && (
          <div className="fixed top-0 left-64 right-0 bg-background border-b border-sidebar-border z-30 p-4 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <GlobalSearch />
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        )}
        
        {/* Content area with responsive padding */}
        <main 
          className={cn(
            "flex-1 overflow-auto transition-all duration-300",
            isMobile ? "pt-16 px-2 pb-4" : "md:ml-64 pt-20 px-4 pb-6"
          )}
        >
          {/* Wrapper div for consistent padding on all pages */}
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Temporary initialization button - can be removed after use */}
        <div className="fixed bottom-4 right-4 z-50">
          {showInitButton && (
            <button
              onClick={handleInitializeIntegrations}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg"
            >
              Initialize Integrations (Click if auto-init failed)
            </button>
          )}
          {/* Debug indicator - always visible to check if component is rendered */}
          <div className="text-xs text-gray-500 mt-1">
            Env: {process.env.NODE_ENV || 'unknown'} | 
            Host: {window.location.hostname} | 
            API URL: {window.location.hostname.includes('railway.app') ? `${window.location.origin}/api/integrations/initialize` : '/api/integrations/initialize'}
          </div>
          {/* Test button to verify component rendering */}
          <button 
            onClick={() => console.log('Test button clicked - component is rendering')}
            className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-2 rounded"
          >
            Test Component Render
          </button>
        </div>
      </div>
    </div>
  );
}