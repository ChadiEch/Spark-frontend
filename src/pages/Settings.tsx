import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Key, 
  CreditCard,
  Users,
  Webhook,
  Save,
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  HelpCircle,
  Send,
  FileText
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Role, User } from '@/types';
// Import our new settings components
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationsSettings } from '@/components/settings/NotificationsSettings';
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings';
import { TeamMemberModal } from '@/components/settings/TeamMemberModal';
import { RoleManagement } from '@/components/settings/RoleManagement';
import { HelpSupport } from '@/components/HelpSupport';
// Add imports for new components
import { TermsOfService } from '@/components/settings/TermsOfService';
import { PrivacyPolicy } from '@/components/settings/PrivacyPolicy';
// Import billing service
import { billingService } from '@/services/billingService';
import { Billing, Invoice } from '@/types';
// Import security service
import { securityService } from '@/services/securityService';
// Import API service
import api from '@/services/apiService';
import { integrationService } from '@/services/integrationService';

const Settings = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    timezone: '',
    avatar: undefined as string | undefined,
  });
  const { user: currentUser, updateProfile, isLoading } = useAuth();
  const [notifications, setNotifications] = useState({
    campaignUpdates: true,
    goalProgress: true,
    teamActivity: true,
    weeklyReports: true,
    mentions: true,
    taskAssignments: true,
    urgentAlerts: true,
  });
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  // Add billing state
  const [billingInfo, setBillingInfo] = useState<Billing | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  // Add security state
  const [securityInfo, setSecurityInfo] = useState<{
    twoFactorAuth?: {
      enabled: boolean;
    };
    sessions?: Array<{
      id: string;
      userAgent?: string;
      location?: string;
      lastActive?: string;
      current?: boolean;
    }>;
  } | null>(null);
  const [securityLoading, setSecurityLoading] = useState(true);
  // Add state for modals
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showInvoiceHistoryModal, setShowInvoiceHistoryModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [isAssigningTeam, setIsAssigningTeam] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'CONTRIBUTOR' as Role
  });

  const handleInviteTeamMember = async () => {
    if (!inviteData.email || !inviteData.role) {
      toast({
        title: "Validation Error",
        description: "Please provide both email and role for the invitation",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      // Import the invitation service
      const { invitationAPI } = await import('@/services/apiService');
      
      // Send invitation
      const response = await invitationAPI.inviteMember({
        email: inviteData.email,
        role: inviteData.role
      });

      if (response.data?.success) {
        toast({
          title: "Invitation Created",
          description: `Invitation created successfully. Share the link with ${inviteData.email}.`,
        });
        
        // Show the invitation link in a toast or alert
        if (response.data.data?.invitationLink) {
          // You might want to show this in a modal or copy it to clipboard
          navigator.clipboard.writeText(response.data.data.invitationLink).then(() => {
            toast({
              title: "Link Copied",
              description: "Invitation link copied to clipboard!",
            });
          }).catch(() => {
            // If clipboard fails, show the link in a toast
            toast({
              title: "Invitation Link",
              description: `Share this link: ${response.data.data.invitationLink}`,
            });
          });
        }
        
        // Reset form
        setInviteData({
          email: '',
          role: 'CONTRIBUTOR'
        });
      } else {
        throw new Error(response.data?.message || 'Failed to create invitation');
      }
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Function to save team assignment
  const saveTeamAssignment = () => {
    if (currentUser?.role === 'ADMIN' && currentUser.id) {
      const teamAssignmentKey = `admin_team_${currentUser.id}`;
      localStorage.setItem(teamAssignmentKey, JSON.stringify(selectedTeamMembers));
      toast({
        title: "Team Assignment Saved",
        description: "Your team assignment has been saved successfully.",
      });
    }
  };

  // Function to load team assignment
  const loadTeamAssignment = () => {
    if (currentUser?.role === 'ADMIN' && currentUser.id) {
      const teamAssignmentKey = `admin_team_${currentUser.id}`;
      const savedTeamMembers = localStorage.getItem(teamAssignmentKey);
      if (savedTeamMembers) {
        setSelectedTeamMembers(JSON.parse(savedTeamMembers));
      }
    }
  };

  // Function to toggle team member selection
  const toggleTeamMemberSelection = (memberId: string) => {
    setSelectedTeamMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  // Function to select all team members
  const selectAllTeamMembers = () => {
    const nonAdminMemberIds = teamMembers
      .filter(member => member.role !== 'ADMIN' || member.id !== currentUser?.id)
      .map(member => member.id);
    setSelectedTeamMembers(nonAdminMemberIds);
  };

  // Function to clear team selection
  const clearTeamSelection = () => {
    setSelectedTeamMembers([]);
  };

  // Get active tab from URL query parameter or default to 'profile'
  const getActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'profile';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.search]);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Settings page error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Load current user data when component mounts
  useEffect(() => {
    if (currentUser && !isLoading) {
      try {
        setProfileData({
          firstName: currentUser.name?.split(' ')[0] || '',
          lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
          email: currentUser.email || '',
          title: currentUser.role || '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          avatar: currentUser.avatar || '',
        });
      } catch (error) {
        console.error('Error setting profile data:', error);
        // Set default values in case of error
        setProfileData({
          firstName: '',
          lastName: '',
          email: currentUser.email || '',
          title: currentUser.role || '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          avatar: currentUser.avatar || '',
        });
      }
    }
  }, [currentUser, isLoading]);

  // Load team members data
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setTeamMembersLoading(true);
        const { userService } = await import('@/services/dataService');
        
        // Get all users first
        const allMembers = await userService.getAll();
        
        // Filter to show only users assigned to the current admin's team
        // Since there's no explicit team field in the User model, we'll implement
        // a simple filtering mechanism based on a simulated team assignment
        let filteredMembers = allMembers;
        
        if (currentUser?.role === 'ADMIN') {
          // Check if there's a team assignment in localStorage for this admin
          const teamAssignmentKey = `admin_team_${currentUser.id}`;
          const savedTeamMembers = localStorage.getItem(teamAssignmentKey);
          
          if (savedTeamMembers) {
            // If team assignment exists, filter by that
            const teamMemberIds = JSON.parse(savedTeamMembers);
            filteredMembers = allMembers.filter(member => 
              teamMemberIds.includes(member.id) || member.id === currentUser.id
            );
          } else {
            // Default: show all users for admins
            filteredMembers = allMembers;
          }
        } else if (currentUser?.role === 'MANAGER') {
          // Managers see contributors and viewers only
          filteredMembers = allMembers.filter(member => 
            member.role === 'CONTRIBUTOR' || member.role === 'VIEWER'
          );
        } else if (currentUser?.role === 'CONTRIBUTOR') {
          // Contributors see only viewers
          filteredMembers = allMembers.filter(member => 
            member.role === 'VIEWER'
          );
        } else {
          // Viewers see no one
          filteredMembers = [];
        }
        
        setTeamMembers(filteredMembers);
      } catch (error) {
        console.error('Error loading team members:', error);
        toast({
          title: "Error",
          description: "Failed to load team members. Please try again.",
          variant: "destructive",
        });
      } finally {
        setTeamMembersLoading(false);
      }
    };

    if (activeTab === 'team') {
      loadTeamMembers();
    }
  }, [activeTab, currentUser]);

  // Load billing data
  useEffect(() => {
    const loadBillingData = async () => {
      try {
        setBillingLoading(true);
        const billingData = await billingService.getBillingInfo();
        setBillingInfo(billingData);
        
        // Load invoices
        const invoiceData = await billingService.getInvoiceHistory();
        setInvoices(invoiceData);
      } catch (error) {
        console.error('Error loading billing data:', error);
        toast({
          title: "Error",
          description: "Failed to load billing information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setBillingLoading(false);
      }
    };

    if (activeTab === 'billing') {
      loadBillingData();
    }
  }, [activeTab]);

  // Load security data
  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        setSecurityLoading(true);
        const securityData = await securityService.getSecurityInfo();
        setSecurityInfo(securityData);
      } catch (error) {
        console.error('Error loading security data:', error);
        toast({
          title: "Error",
          description: "Failed to load security information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSecurityLoading(false);
      }
    };

    if (activeTab === 'security') {
      loadSecurityData();
    }
  }, [activeTab]);

  // Render loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Loading...</h2>
            <p className="text-muted-foreground">
              Loading your settings
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-red-700 mb-4">
              There was an error loading the settings page. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Webhook },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    // Add new tabs
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: FileText },
  ];

  const [integrations, setIntegrations] = useState([
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your Instagram Business account',
      icon: () => <svg className="h-6 w-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
      connected: true,
      color: 'text-pink-500',
      connectionId: undefined,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Manage Facebook Pages and ads',
      icon: () => <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>,
      connected: true,
      color: 'text-blue-600',
      connectionId: undefined,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Schedule and publish TikTok videos',
      icon: () => <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
      connected: false,
      color: 'text-black',
      connectionId: undefined,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Upload and manage YouTube content',
      icon: () => <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>,
      connected: false,
      color: 'text-red-500',
      connectionId: undefined,
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Connect your Google Drive for file storage and sharing',
      icon: () => (
        <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.894 14.429l-10.5 6.303c-.285.171-.629.265-.991.265-.362 0-.706-.094-.991-.265l-10.5-6.303C.332 14.082 0 13.494 0 12.857v-1.714c0-.637.332-1.225.906-1.572l10.5-6.303c.285-.171.629-.265.991-.265.362 0 .706.094.991.265l10.5 6.303c.574.347.906.935.906 1.572v1.714c0 .637-.332 1.225-.906 1.572zM12 4.286l-9.844 5.909 9.844 5.909 9.844-5.909L12 4.286z"/>
        </svg>
      ),
      connected: false,
      color: 'text-blue-500',
      connectionId: undefined,
    },
  ] as Array<{
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    connected: boolean;
    color: string;
    connectionId?: string;
  }>);

  // Load integrations data
  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        // Load available integrations
        const availableIntegrations = await integrationService.getAll();
        
        // Load user's connected integrations
        const userConnections = await integrationService.getUserConnections();
        
        // Log the data for debugging
        console.log('Available integrations:', availableIntegrations);
        console.log('User connections:', userConnections);
        
        // Merge the data to show which integrations are connected
        const mergedIntegrations = availableIntegrations.map(integration => {
          // Find connection by matching connection.integrationId with integration.id
          const connection = userConnections.find(conn => 
            conn.integrationId?.toString() === integration.id?.toString()
          );
          
          // Map to the component structure
          let iconComponent;
          let color = 'text-gray-500';
          
          switch (integration.key) {
            case 'instagram':
              iconComponent = () => <svg className="h-6 w-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
              color = 'text-pink-500';
              break;
            case 'facebook':
              iconComponent = () => <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;
              color = 'text-blue-600';
              break;
            case 'tiktok':
              iconComponent = () => <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>;
              color = 'text-black';
              break;
            case 'youtube':
              iconComponent = () => <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>;
              color = 'text-red-500';
              break;
            case 'google-drive':
              iconComponent = () => (
                <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.894 14.429l-10.5 6.303c-.285.171-.629.265-.991.265-.362 0-.706-.094-.991-.265l-10.5-6.303C.332 14.082 0 13.494 0 12.857v-1.714c0-.637.332-1.225.906-1.572l10.5-6.303c.285-.171.629-.265.991-.265.362 0 .706.094.991.265l10.5 6.303c.574.347.906.935.906 1.572v1.714c0 .637-.332 1.225-.906 1.572zM12 4.286l-9.844 5.909 9.844 5.909 9.844-5.909L12 4.286z"/>
                </svg>
              );
              color = 'text-blue-500';
              break;
            default:
              iconComponent = Globe;
              break;
          }
          
          return {
            ...integration,
            icon: iconComponent,
            color,
            connected: !!connection,
            connectionId: connection?.id
          };
        });
        
        setIntegrations(mergedIntegrations);
      } catch (error) {
        console.error('Error loading integrations:', error);
        toast({
          title: "Error",
          description: "Failed to load integrations. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (activeTab === 'integrations') {
      loadIntegrations();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (data: { firstName: string; lastName: string; email: string; title: string; timezone: string; avatar?: string; }, avatarFile?: File) => {
    try {
      // Prepare user data for update
      const userData: Partial<User> = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
      };
      
      // Handle avatar upload if a file is provided
      if (avatarFile) {
        try {
          // Import the asset service to upload the avatar
          const { assetService } = await import('@/services/dataService');
          
          // Upload the avatar file
          const uploadedAsset = await assetService.upload(avatarFile);
          if (uploadedAsset) {
            // Set the avatar URL in the user data
            userData.avatar = uploadedAsset.url;
          }
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast({
            title: "Avatar Upload Failed",
            description: "Failed to upload avatar. Profile will be updated without avatar.",
            variant: "destructive",
          });
        }
      }
      
      // Update user profile through AuthContext
      const updatedUser = await updateProfile(userData);
      
      if (updatedUser) {
        // Update local state with new data
        setProfileData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          title: data.title,
          timezone: data.timezone,
          avatar: userData.avatar || data.avatar || ''
        });
        console.log('Profile updated:', data);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateNotifications = async (settings: typeof notifications) => {
    try {
      // In a real app, this would call an API to persist the settings
      // For now, we'll update the local state and simulate a successful API call
      setNotifications(settings);
      console.log('Notifications updated:', settings);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, you would do something like:
      // const { notificationService } = await import('@/services/dataService');
      // await notificationService.updateSettings(settings);
    } catch (error) {
      console.error('Error updating notifications:', error);
      // Re-throw the error so the calling function can handle it
      throw error;
    }
  };

  const handleToggleIntegration = async (id: string) => {
    try {
      // Find the integration
      const integrationItem = integrations.find(i => i.id === id);
      if (!integrationItem) {
        toast({
          title: "Error",
          description: "Integration not found.",
          variant: "destructive",
        });
        return;
      }
      
      if (integrationItem.connected) {
        // Disconnect integration
        if (integrationItem.connectionId) {
          await integrationService.disconnect(integrationItem.connectionId);
        }
        
        toast({
          title: "Integration Disconnected",
          description: `${integrationItem.name} has been disconnected from your account.`,
        });
        
        // Update the integrations state
        setIntegrations(prev => 
          prev.map(int => 
            int.id === id ? {...int, connected: false, connectionId: undefined} : int
          )
        );
      } else {
        // Connect integration
        const result = await integrationService.connect(id);
        
        if (result?.authorizationUrl) {
          toast({
            title: "Redirecting to OAuth",
            description: `Redirecting to ${integrationItem.name} for authentication...`,
          });
          
          // Redirect to the authorization URL to initiate OAuth flow
          window.location.href = result.authorizationUrl;
        } else {
          throw new Error('Failed to get authorization URL');
        }
      }
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Error",
        description: "Failed to toggle integration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTeamMember = async (memberData: Partial<User>) => {
    try {
      const { userService } = await import('@/services/dataService');
      // For new members, we need to include the password
      const newMemberData = {
        ...memberData,
        password: (memberData as any).password || 'defaultpassword'
      };
      const newMember = await userService.register(newMemberData as any);
      
      if (newMember) {
        // Add the new member to the local state
        setTeamMembers(prev => [...prev, newMember]);
        
        // If current user is admin, automatically assign new member to their team
        if (currentUser?.role === 'ADMIN' && currentUser.id) {
          setSelectedTeamMembers(prev => [...prev, newMember.id]);
        }
        
        toast({
          title: "Team Member Added",
          description: "The new team member has been successfully added.",
        });
      } else {
        throw new Error('Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEditTeamMember = (member: User) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleUpdateTeamMember = async (memberData: Partial<User>) => {
    try {
      if (!editingMember) return;
      
      const { userService } = await import('@/services/dataService');
      const updatedMember = await userService.update(editingMember.id, memberData);
      
      if (updatedMember) {
        // Update the member in the local state
        setTeamMembers(prev => 
          prev.map(member => 
            member.id === editingMember.id ? updatedMember : member
          )
        );
        toast({
          title: "Team Member Updated",
          description: "The team member has been successfully updated.",
        });
      } else {
        throw new Error('Failed to update team member');
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Error",
        description: "Failed to update team member. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    try {
      const { userService } = await import('@/services/dataService');
      const result = await userService.delete(id);
      
      if (result) {
        // Remove the member from the local state
        setTeamMembers(prev => prev.filter(member => member.id !== id));
        toast({
          title: "Team Member Removed",
          description: "The team member has been successfully removed.",
        });
      } else {
        throw new Error('Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleModalSubmit = async (memberData: Partial<User>) => {
    if (editingMember) {
      await handleUpdateTeamMember(memberData);
    } else {
      await handleAddTeamMember(memberData);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL with tab parameter
    navigate(`/settings?tab=${tabId}`);
  };

  const renderTeamTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => {
            setEditingMember(null);
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button variant="outline" onClick={() => handleTabChange('roles')}>
            <Shield className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
        </div>
      </div>
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Role Management</h3>
            <p className="text-sm text-blue-700">
              Only ADMIN users can manage roles and permissions. Role changes take effect immediately.
              Refer to the Role Management tab for detailed access permissions for each role.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Invitation Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="inviteEmail">Email Address</Label>
            <Input
              id="inviteEmail"
              type="email"
              placeholder="user@example.com"
              value={inviteData.email}
              onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteRole">Role</Label>
            <select
              id="inviteRole"
              className="w-full p-2 border border-input rounded-md bg-background"
              value={inviteData.role}
              onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as Role })}
            >
              <option value="CONTRIBUTOR">Contributor</option>
              <option value="MANAGER">Manager</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
        </div>
        <Button 
          className="mt-4" 
          onClick={handleInviteTeamMember}
          disabled={isInviting}
        >
          {isInviting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Sending Invitation...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </>
          )}
        </Button>
      </Card>
      
      <Card className="p-6">
        {teamMembersLoading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading team members...</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No team members found.</p>
            <Button 
              className="mt-4" 
              onClick={() => {
                setEditingMember(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Team Member
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {member.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'ADMIN' ? 'destructive' : member.role === 'MANAGER' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditTeamMember(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteTeamMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
        }}
        onSubmit={handleModalSubmit}
        onInvite={handleInviteMember}
        member={editingMember}
      />
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Billing & Subscription</h2>
      {billingLoading ? (
        <div className="flex items-center justify-center p-8">
          <p>Loading billing information...</p>
        </div>
      ) : billingInfo ? (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Current Plan</h3>
                <p className="text-muted-foreground">
                  {billingInfo.subscription.plan.charAt(0).toUpperCase() + billingInfo.subscription.plan.slice(1)} Plan - 
                  ${billingInfo.subscription.price.amount}/{billingInfo.subscription.price.currency.toLowerCase()}/month
                </p>
              </div>
              <Button variant="outline" onClick={() => handleUpdateSubscription()}>Change Plan</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Payment Method</h4>
                </div>
                {billingInfo.paymentMethod ? (
                  <>
                    <p className="text-sm">
                      {billingInfo.paymentMethod.brand} ending in {billingInfo.paymentMethod.last4}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {billingInfo.paymentMethod.expiryMonth}/{billingInfo.paymentMethod.expiryYear}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No payment method on file</p>
                )}
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Next Billing Date</h4>
                </div>
                <p className="text-sm">
                  {billingInfo.subscription.endDate 
                    ? new Date(billingInfo.subscription.endDate).toLocaleDateString() 
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Auto-renewal {billingInfo.subscription.autoRenew ? 'enabled' : 'disabled'}
                </p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Amount</h4>
                </div>
                <p className="text-sm">
                  ${billingInfo.subscription.price.amount.toFixed(2)} {billingInfo.subscription.price.currency}
                </p>
                <p className="text-xs text-muted-foreground">Billed monthly</p>
              </Card>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleUpdatePaymentMethod()}>
                Update Payment Method
              </Button>
              <Button onClick={() => handleViewInvoiceHistory()}>View Invoice History</Button>
            </div>
          </Card>
          
          {invoices.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
              <div className="space-y-3">
                {invoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Invoice {invoice.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()} • ${invoice.amount.value.toFixed(2)} {invoice.amount.currency}
                      </p>
                    </div>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">No billing information available.</p>
        </Card>
      )}
      
      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Change Subscription Plan</h3>
              <div className="space-y-4">
                {['free', 'starter', 'professional', 'enterprise'].map((plan) => (
                  <div 
                    key={plan}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={async () => {
                      try {
                        const updatedBilling = await billingService.updateSubscription(plan);
                        setBillingInfo(updatedBilling);
                        setShowSubscriptionModal(false);
                        toast({
                          title: "Subscription Updated",
                          description: `Your subscription has been updated to the ${plan} plan.`,
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to update subscription. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</p>
                      {plan !== 'free' && (
                        <p className="text-sm text-muted-foreground">
                          ${plan === 'starter' ? '19' : plan === 'professional' ? '29' : '99'}/month
                        </p>
                      )}
                    </div>
                    {billingInfo?.subscription.plan === plan && (
                      <Badge>Current</Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowSubscriptionModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Payment Method Modal */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Update Payment Method</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowPaymentMethodModal(false)}>
                  Cancel
                </Button>
                <Button onClick={async () => {
                  // In a real implementation, this would process the payment method update
                  try {
                    // For demo purposes, we'll just show a success message
                    setShowPaymentMethodModal(false);
                    toast({
                      title: "Payment Method Updated",
                      description: "Your payment method has been updated successfully.",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update payment method. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}>
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Invoice History Modal */}
      {showInvoiceHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Invoice History</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowInvoiceHistoryModal(false)}>
                  Close
                </Button>
              </div>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Invoice {invoice.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString()} • ${invoice.amount.value.toFixed(2)} {invoice.amount.currency}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                        {invoice.pdfUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(invoice.pdfUrl, '_blank')}>
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No invoices found.</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Security Settings</h2>
      
      {securityLoading ? (
        <div className="flex items-center justify-center p-8">
          <p>Loading security information...</p>
        </div>
      ) : (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={async () => {
                const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement).value;
                const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
                const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
                
                if (!currentPassword || !newPassword || !confirmPassword) {
                  toast({
                    title: "Error",
                    description: "All password fields are required.",
                    variant: "destructive",
                  });
                  return;
                }
                
                if (newPassword !== confirmPassword) {
                  toast({
                    title: "Error",
                    description: "New passwords do not match.",
                    variant: "destructive",
                  });
                  return;
                }
                
                if (newPassword.length < 8) {
                  toast({
                    title: "Error",
                    description: "New password must be at least 8 characters long.",
                    variant: "destructive",
                  });
                  return;
                }
                
                try {
                  await securityService.changePassword(currentPassword, newPassword);
                  toast({
                    title: "Success",
                    description: "Password updated successfully.",
                  });
                  
                  // Clear the form
                  (document.getElementById('currentPassword') as HTMLInputElement).value = '';
                  (document.getElementById('newPassword') as HTMLInputElement).value = '';
                  (document.getElementById('confirmPassword') as HTMLInputElement).value = '';
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.response?.data?.message || "Failed to update password. Please try again.",
                    variant: "destructive",
                  });
                }
              }}>
                <Key className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable 2FA</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch 
                checked={securityInfo?.twoFactorAuth?.enabled || false}
                onCheckedChange={async (enabled) => {
                  try {
                    const result = await securityService.toggleTwoFactorAuth(enabled);
                    setSecurityInfo(prev => ({
                      ...prev,
                      twoFactorAuth: {
                        ...prev?.twoFactorAuth,
                        enabled
                      }
                    } as {
                      twoFactorAuth?: {
                        enabled: boolean;
                      };
                      sessions?: Array<{
                        id: string;
                        userAgent?: string;
                        location?: string;
                        lastActive?: string;
                        current?: boolean;
                      }>;
                    }));
                    
                    toast({
                      title: "Success",
                      description: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully.`,
                    });
                    
                    // If 2FA was enabled, show backup codes
                    if (enabled && result.backupCodes) {
                      toast({
                        title: "Backup Codes",
                        description: `Your backup codes: ${result.backupCodes.join(', ')}. Store them securely!`,
                      });
                    }
                  } catch (error: any) {
                    toast({
                      title: "Error",
                      description: error.response?.data?.message || "Failed to update 2FA settings. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              />
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
            {securityInfo?.sessions && securityInfo.sessions.length > 0 ? (
              <div className="space-y-3">
                {securityInfo.sessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.userAgent || 'Unknown Browser'}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.current ? 'Current session' : `Last active: ${new Date(session.lastActive).toLocaleString()}`} • {session.location || 'Unknown Location'}
                      </p>
                    </div>
                    {!session.current && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            await securityService.revokeSession(session.id);
                            setSecurityInfo(prev => ({
                              ...prev,
                              sessions: prev?.sessions?.filter((s: any) => s.id !== session.id)
                            }));
                            toast({
                              title: "Success",
                              description: "Session revoked successfully.",
                            });
                          } catch (error: any) {
                            toast({
                              title: "Error",
                              description: error.response?.data?.message || "Failed to revoke session. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Revoke
                      </Button>
                    )}
                    {session.current && (
                      <Button variant="outline" size="sm">Current</Button>
                    )}
                  </div>
                ))}
                {securityInfo.sessions.filter((s: any) => !s.current).length > 0 && (
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await securityService.revokeAllSessions();
                          setSecurityInfo(prev => ({
                            ...prev,
                            sessions: prev?.sessions?.filter((s: any) => s.current)
                          }));
                          toast({
                            title: "Success",
                            description: "All other sessions have been revoked.",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.response?.data?.message || "Failed to revoke sessions. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Revoke All Other Sessions
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No active sessions found.</p>
            )}
          </Card>
        </>
      )}
    </div>
  );

  const handleUpdateSubscription = () => {
    setShowSubscriptionModal(true);
  };

  const handleUpdatePaymentMethod = () => {
    setShowPaymentMethodModal(true);
  };

  const handleViewInvoiceHistory = () => {
    setShowInvoiceHistoryModal(true);
  };

  const handleInviteMember = async (email: string, role: string) => {
    try {
      const response = await api.post('/invitations', { email, role });
      if (response.data.success) {
        // Return the invitation link so the modal can display it
        return { invitationLink: response.data.data.invitationLink };
      } else {
        throw new Error(response.data.message || 'Failed to send invitation');
      }
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <ProfileSettings 
                profileData={profileData} 
                onUpdateProfile={handleUpdateProfile} 
              />
            )}
            
            {activeTab === 'team' && renderTeamTab()}
            
            {activeTab === 'roles' && (
              <RoleManagement 
                users={teamMembers} 
                onUsersUpdate={async () => {
                  // Reload team members to reflect role changes
                  try {
                    const { userService } = await import('@/services/dataService');
                    const members = await userService.getAll();
                    setTeamMembers(members);
                  } catch (error) {
                    console.error('Error reloading team members:', error);
                  }
                }} 
              />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationsSettings 
                notifications={notifications} 
                onUpdateNotifications={handleUpdateNotifications} 
              />
            )}
            
            {activeTab === 'integrations' && (
              <IntegrationsSettings 
                integrations={integrations} 
                onToggleConnection={handleToggleIntegration} 
              />
            )}
            
            {activeTab === 'billing' && renderBillingTab()}
            
            {activeTab === 'security' && renderSecurityTab()}
            
            {activeTab === 'help' && (
              <HelpSupport />
            )}
            
            {/* Add new tab content */}
            {activeTab === 'terms' && (
              <TermsOfService />
            )}
            
            {activeTab === 'privacy' && (
              <PrivacyPolicy />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;