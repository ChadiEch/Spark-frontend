import React, { Suspense } from "react";
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Goals from "./pages/Goals";
import Tasks from "./pages/Tasks";
import Ambassadors from "./pages/Ambassadors";
import Assets from "./pages/Assets";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import ViewPost from "./pages/ViewPost";
import Posts from "./pages/Posts"; // Add this import
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";
import TestIndex from "./pages/TestIndex";
import SimpleTest from "./pages/SimpleTest";
import ApiTest from "./pages/ApiTest";
import { FallbackContent } from "./components/FallbackContent";
// Import activities components from the activities directory
import Activities from "./pages/activities/Activities";
import ViewActivity from "./pages/activities/ViewActivity";
import EditActivity from "./pages/activities/EditActivity";
import DeleteActivity from "./pages/activities/DeleteActivity";
// Import ViewGoalCampaigns component
import ViewGoalCampaigns from "./pages/ViewGoalCampaigns";
// Import TestData component
import TestData from "./pages/TestData";
// Import TestDateComparison component
import TestDateComparison from "./pages/TestDateComparison";
// Import TestLogin component
import TestLogin from "./pages/TestLogin";
// Import ComprehensiveDebug component
import ComprehensiveDebug from "./pages/ComprehensiveDebug";
// Import TestCalendarLogic component
import TestCalendarLogic from "./pages/TestCalendarLogic";
// Import TestDateLogic component
import TestDateLogic from "./pages/TestDateLogic";
// Import TestCalendarEvents component
import TestCalendarEvents from "./pages/TestCalendarEvents";
// Import TestGoalCampaigns component
import TestGoalCampaigns from "./pages/TestGoalCampaigns";
// Import campaign components
import Campaigns from "./pages/campaigns";
import CreateCampaign from "./pages/campaigns/CreateCampaign";
import EditCampaign from "./pages/campaigns/EditCampaign";
import ViewCampaign from "./pages/campaigns/ViewCampaign";
// Import ambassador components
import ViewAmbassador from "./pages/ambassadors/ViewAmbassador";
import EditAmbassador from "./pages/ambassadors/EditAmbassador";
// Import integration callback component
import IntegrationsCallback from "./pages/IntegrationsCallback";
import AcceptInvitation from "./pages/AcceptInvitation";

import { useEffect, useState } from "react";
// Import AuthProvider
import { AuthProvider } from "@/contexts/AuthContext";
// Import ThemeProvider
import { ThemeProvider } from "@/contexts/ThemeContext";
// Import ProtectedRoute
import { ProtectedRoute } from "@/components/ProtectedRoute";
// Import NotificationProvider
import { NotificationProvider } from "@/contexts/NotificationContext";

// Lazy load heavier components
const CalendarComponent = React.lazy(() => import("./pages/Calendar"));
const AnalyticsComponent = React.lazy(() => import("./pages/Analytics"));
const SettingsComponent = React.lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient();

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState(false);
  const [showInitButton, setShowInitButton] = useState(true);

  // Auto-initialize on component mount and force show button on Railway
  useEffect(() => {
    const autoInitialize = async () => {
      const isRailway = window.location.hostname.includes('railway.app');
      
      // Always show button on Railway
      if (isRailway) {
        setShowInitButton(true);
      }
      
      // Skip auto-initialization on Railway to prevent hanging
      if (isRailway) {
        console.log('Skipping auto-initialization on Railway');
        return;
      }
      
      try {
        // Use full URL on Railway to ensure proper routing
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
            // Hide button after success only if not on Railway (for debugging)
            if (!isRailway) {
              // setShowInitButton(false);
            }
          } catch (jsonError) {
            console.log('Auto-initialize JSON parsing error:', jsonError);
          }
        } else {
          console.log('Auto-initialization failed:', response.status, responseText);
          // Keep button visible for manual retry
          setShowInitButton(true);
        }
      } catch (error: any) {
        console.log('Auto-initialization error:', error);
        // Keep button visible for manual retry
        setShowInitButton(true);
      }
    };
    
    // Run initialization with delay
    setTimeout(() => {
      autoInitialize();
    }, 1000);
  }, []);

  // Force show button on Railway
  useEffect(() => {
    const isRailway = window.location.hostname.includes('railway');
    if (isRailway) {
      setShowInitButton(true);
    }
  }, []);

  // Auto-initialize on component mount
  useEffect(() => {
    const autoInitialize = async () => {
      const isRailway = window.location.hostname.includes('railway.app');
      
      // Skip auto-initialization on Railway to prevent hanging
      if (isRailway) {
        console.log('Skipping auto-initialization on Railway (second useEffect)');
        return;
      }
      
      try {
        // Use full URL on Railway to ensure proper routing
        const apiUrl = isRailway 
          ? `${window.location.origin}/api/integrations/initialize`
          : '/api/integrations/initialize';
          
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Integrations auto-initialized:', data.message);
          // Hide button after success
          // setShowInitButton(false);
        } else {
          const errorText = await response.text();
          console.log('Auto-initialization failed:', response.status, errorText);
          // Keep button visible for manual retry
          setShowInitButton(true);
        }
      } catch (error: any) {
        console.log('Auto-initialization error:', error);
        // Keep button visible for manual retry
        setShowInitButton(true);
      }
    };

    // Run initialization with delay
    setTimeout(() => {
      autoInitialize();
    }, 1000);
  }, []);

  // Initialize data when app starts
  useEffect(() => {
    // Set app ready immediately since we don't have initializeData
    setAppReady(true);
  }, []);

  // Temporary function to initialize integrations
  const handleInitializeIntegrations = async () => {
    try {
      // Use full URL on Railway to ensure proper routing
      const isRailway = window.location.hostname.includes('railway.app');
      
      // Skip initialization on Railway
      if (isRailway) {
        console.log('Skipping initialization on Railway - not supported');
        toast({
          title: "Initialization",
          description: "Initialization is handled automatically on Railway deployments.",
        });
        return;
      }
      
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

  if (!appReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  // If there was an initialization error, show fallback content
  if (initError) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  {/* Temporary initialization button - can be removed after use */}
                  {showInitButton && (
                    <div className="fixed top-4 right-4 z-50">
                      <button
                        onClick={handleInitializeIntegrations}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg"
                      >
                        Initialize Integrations (Railway)
                      </button>
                    </div>
                  )}
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/simple-test" element={<SimpleTest />} />
                    <Route path="/test-index" element={<TestIndex />} />
                    <Route path="/" element={<FallbackContent />} />
                    <Route path="/calendar" element={<FallbackContent />} />
                    <Route path="/goals" element={<FallbackContent />} />
                    <Route path="/activities" element={<FallbackContent />} />
                    <Route path="/tasks" element={<FallbackContent />} />
                    <Route path="/ambassadors" element={<FallbackContent />} />
                    <Route path="/assets" element={<FallbackContent />} />
                    <Route path="/analytics" element={<FallbackContent />} />
                    <Route path="/settings" element={<FallbackContent />} />
                    <Route path="/posts/create" element={<FallbackContent />} />
                    <Route path="/posts/edit/:id" element={<FallbackContent />} />
                    <Route path="/posts/view/:id" element={<FallbackContent />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  // Loading component for lazy loaded routes
  const LazyLoading = () => (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                {/* Temporary initialization button - can be removed after use */}
                {showInitButton && (
                  <div className="fixed top-4 right-4 z-50">
                    <button
                      onClick={handleInitializeIntegrations}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg"
                    >
                      Initialize Integrations (Railway)
                    </button>
                  </div>
                )}
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/simple-test" element={<SimpleTest />} />
                  <Route path="/api-test" element={<ApiTest />} />
                  <Route path="/test-index" element={
                    <ProtectedRoute>
                      <TestIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <Suspense fallback={<LazyLoading />}>
                      <ProtectedRoute>
                        <CalendarComponent />
                      </ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="/goals" element={
                    <ProtectedRoute>
                      <Goals />
                    </ProtectedRoute>
                  } />
                  <Route path="/goals/:id/campaigns" element={
                    <ProtectedRoute>
                      <ViewGoalCampaigns />
                    </ProtectedRoute>
                  } />
                  <Route path="/test-data" element={
                    <ProtectedRoute>
                      <TestData />
                    </ProtectedRoute>
                  } />
                  <Route path="/test-date-comparison" element={
                    <ProtectedRoute>
                      <TestDateComparison />
                    </ProtectedRoute>
                  } />
                  <Route path="/test-calendar-logic" element={
                    <ProtectedRoute>
                      <TestCalendarLogic />
                    </ProtectedRoute>
                  } />
                  <Route path="/test-date-logic" element={
                    <ProtectedRoute>
                      <TestDateLogic />
                    </ProtectedRoute>
                  } />
                  <Route path="/test-calendar-events" element={
                    <ProtectedRoute>
                      <TestCalendarEvents />
                    </ProtectedRoute>
                  } />
                  <Route path="/test-goal-campaigns" element={
                    <ProtectedRoute>
                      <TestGoalCampaigns />
                    </ProtectedRoute>
                  } />
                  <Route path="/tasks" element={
                    <ProtectedRoute>
                      <Tasks />
                    </ProtectedRoute>
                  } />
                  <Route path="/ambassadors" element={
                    <ProtectedRoute>
                      <Ambassadors />
                    </ProtectedRoute>
                  } />
                  <Route path="/ambassadors/:id" element={
                    <ProtectedRoute>
                      <ViewAmbassador />
                    </ProtectedRoute>
                  } />
                  <Route path="/ambassadors/edit/:id" element={
                    <ProtectedRoute>
                      <EditAmbassador />
                    </ProtectedRoute>
                  } />
                  <Route path="/assets" element={
                    <ProtectedRoute>
                      <Assets />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <Suspense fallback={<LazyLoading />}>
                      <ProtectedRoute>
                        <AnalyticsComponent />
                      </ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="/settings" element={
                    <Suspense fallback={<LazyLoading />}>
                      <ProtectedRoute>
                        <SettingsComponent />
                      </ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="/posts/create" element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  } />
                  <Route path="/posts/edit/:id" element={
                    <ProtectedRoute>
                      <EditPost />
                    </ProtectedRoute>
                  } />
                  <Route path="/posts/view/:id" element={
                    <ProtectedRoute>
                      <ViewPost />
                    </ProtectedRoute>
                  } />
                  <Route path="/posts" element={
                    <ProtectedRoute>
                      <Posts />
                    </ProtectedRoute>
                  } />
                  {/* Campaign routes */}
                  <Route path="/campaigns" element={
                    <ProtectedRoute>
                      <Campaigns />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaigns/create" element={
                    <ProtectedRoute>
                      <CreateCampaign />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaigns/edit/:id" element={
                    <ProtectedRoute>
                      <EditCampaign />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaigns/view/:id" element={
                    <ProtectedRoute>
                      <ViewCampaign />
                    </ProtectedRoute>
                  } />
                  {/* Activities routes */}
                  <Route path="/activities" element={
                    <ProtectedRoute>
                      <Activities />
                    </ProtectedRoute>
                  } />
                  <Route path="/activities/view/:id" element={
                    <ProtectedRoute>
                      <ViewActivity />
                    </ProtectedRoute>
                  } />
                  <Route path="/activities/edit/:id" element={
                    <ProtectedRoute>
                      <EditActivity />
                    </ProtectedRoute>
                  } />
                  <Route path="/activities/delete/:id" element={
                    <ProtectedRoute>
                      <DeleteActivity />
                    </ProtectedRoute>
                  } />
                  {/* Integration callback route */}
                  <Route path="/integrations/callback" element={
                    <ProtectedRoute>
                      <IntegrationsCallback />
                    </ProtectedRoute>
                  } />
                  <Route path="/accept-invitation" element={<AcceptInvitation />} />
                  <Route path="/test-login" element={<TestLogin />} />
                  <Route path="/comprehensive-debug" element={<ComprehensiveDebug />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;