import { useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Star, 
  TrendingUp, 
  Instagram, 
  MessageCircle, 
  Heart, 
  Share2, 
  Eye,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  UserPlus,
  Activity
} from 'lucide-react';
// Import our data hooks
import { useUsers, useAmbassadors } from '@/hooks/useData';
import { RoleBasedContent, ResourceBasedContent } from '@/components/ui/RoleBasedContent';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Ambassador, ChannelType } from '@/types';

const Ambassadors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAmbassador, setNewAmbassador] = useState({
    name: '',
    handle: '',
    platformHandles: {} as Partial<Record<ChannelType, string | undefined>>,
    email: '',
    phone: '',
    platforms: [] as string[],
    tags: [] as string[],
    notes: '',
  });
  const navigate = useNavigate();
  
  // Use our data hooks
  const { users } = useUsers();
  const { ambassadors, loading, addAmbassador, deleteAmbassador } = useAmbassadors();

  const filteredAmbassadors = ambassadors.filter(ambassador => {
    const matchesSearch = ambassador.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ambassador.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ambassador.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filter === 'all' || 
                         (filter === 'top_performer' && ambassador.metrics.averageEngagementRate > 4.5) ||
                         (filter === 'new' && new Date(ambassador.createdAt).getTime() > Date.now() - 30*24*60*60*1000);
    return matchesSearch && matchesFilter;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM': return Instagram;
      case 'TIKTOK': return Star;
      case 'FACEBOOK': return Users;
      case 'TWITTER': return MessageCircle;
      case 'YOUTUBE': return TrendingUp;
      default: return Users;
    }
  };

  const handleAddAmbassador = () => {
    setShowAddDialog(true);
  };

  const handleViewProfile = (ambassadorId: string) => {
    // Navigate to ambassador profile page
    navigate(`/ambassadors/${ambassadorId}`);
  };

  const handleViewActivities = (ambassadorId: string) => {
    // Navigate to activities page filtered by ambassador
    navigate(`/activities?ambassador=${ambassadorId}`);
  };

  const handleEditAmbassador = (ambassadorId: string) => {
    // Navigate to edit ambassador page
    navigate(`/ambassadors/edit/${ambassadorId}`);
  };

  const handleDeleteAmbassador = async (ambassadorId: string) => {
    if (window.confirm('Are you sure you want to delete this ambassador? This action cannot be undone.')) {
      try {
        const success = await deleteAmbassador(ambassadorId);
        if (success) {
          toast({
            title: "Ambassador Deleted",
            description: "The ambassador has been deleted successfully.",
          });
        } else {
          throw new Error('Failed to delete ambassador');
        }
      } catch (error) {
        console.error('Error deleting ambassador:', error);
        toast({
          title: "Error",
          description: "Failed to delete ambassador. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleContactAmbassador = (ambassadorId: string, contactType: 'email' | 'phone') => {
    // Contact ambassador via email or phone
    const ambassador = ambassadors.find(a => a.id === ambassadorId);
    if (!ambassador) return;
    
    if (contactType === 'email' && ambassador.email) {
      window.location.href = `mailto:${ambassador.email}`;
    } else if (contactType === 'phone' && ambassador.phone) {
      window.location.href = `tel:${ambassador.phone}`;
    } else {
      toast({
        title: "Contact Information Missing",
        description: `No ${contactType} address available for this ambassador.`,
        variant: "destructive",
      });
    }
  };

  const handlePlatformChange = (platform: string) => {
    setNewAmbassador(prev => {
      const platforms = prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform];
      return { ...prev, platforms };
    });
  };

  const handlePlatformHandleChange = (platform: ChannelType, handle: string) => {
    setNewAmbassador(prev => ({
      ...prev,
      platformHandles: {
        ...prev.platformHandles,
        [platform]: handle
      }
    }));
  };

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (e.key === 'Enter' && target.value.trim()) {
      const tag = target.value.trim();
      if (!newAmbassador.tags.includes(tag)) {
        setNewAmbassador(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      target.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewAmbassador(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSaveAmbassador = async () => {
    if (!newAmbassador.name || !newAmbassador.handle) {
      toast({
        title: "Validation Error",
        description: "Name and main handle are required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create ambassador object with default metrics
      const ambassadorData: Omit<Ambassador, 'id' | 'createdAt' | 'updatedAt'> = {
        name: newAmbassador.name,
        handle: newAmbassador.handle,
        platformHandles: newAmbassador.platformHandles,
        email: newAmbassador.email,
        phone: newAmbassador.phone,
        platforms: newAmbassador.platforms as ChannelType[],
        tags: newAmbassador.tags,
        notes: newAmbassador.notes,
        trackingConfig: {
          accountToMention: '@yourbrand',
          specialTags: ['#sponsored', '#ad', '#partner']
        },
        metrics: {
          totalPosts: 0,
          totalReach: 0,
          totalEngagement: 0,
          averageEngagementRate: 0
        }
      };

      const result = await addAmbassador(ambassadorData);
      if (result) {
        toast({
          title: "Ambassador Added",
          description: `${newAmbassador.name} has been added successfully.`,
        });
        setShowAddDialog(false);
        // Reset form
        setNewAmbassador({
          name: '',
          handle: '',
          platformHandles: {} as Partial<Record<ChannelType, string | undefined>>,
          email: '',
          phone: '',
          platforms: [],
          tags: [],
          notes: '',
        });
      } else {
        throw new Error('Failed to add ambassador');
      }
    } catch (error) {
      console.error('Error adding ambassador:', error);
      toast({
        title: "Error",
        description: "Failed to add ambassador. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading ambassadors...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold gradient-text">Ambassadors</h1>
            <p className="text-muted-foreground">
              Manage your brand ambassadors and track their performance
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <ResourceBasedContent 
              resource="ambassadors" 
              permission="create"
              fallback={
                <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" disabled>
                  <Plus className="w-4 h-4" />
                  Add Ambassador (Permission Required)
                </Button>
              }
            >
              <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" onClick={handleAddAmbassador}>
                <Plus className="w-4 h-4" />
                Add Ambassador
              </Button>
            </ResourceBasedContent>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search ambassadors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {['all', 'top_performer', 'new'].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className={filter === filterType ? 'bg-gradient-primary' : ''}
              >
                {filterType.replace('_', ' ').charAt(0).toUpperCase() + 
                 filterType.replace('_', ' ').slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <Users className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{ambassadors.length}</p>
            <p className="text-sm text-muted-foreground">Active Ambassadors</p>
          </Card>
          <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold">4.8%</p>
            <p className="text-sm text-muted-foreground">Avg. Engagement Rate</p>
          </Card>
          <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <Eye className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">
              {(ambassadors.reduce((sum, amb) => sum + amb.metrics.totalReach, 0) / 1000).toFixed(1)}K
            </p>
            <p className="text-sm text-muted-foreground">Total Reach</p>
          </Card>
          <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <Heart className="w-8 h-8 mx-auto text-danger mb-2" />
            <p className="text-2xl font-bold">
              {(ambassadors.reduce((sum, amb) => sum + amb.metrics.totalEngagement, 0) / 1000).toFixed(1)}K
            </p>
            <p className="text-sm text-muted-foreground">Total Engagement</p>
          </Card>
        </div>

        {/* Ambassadors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAmbassadors.map((ambassador) => (
            <Card key={ambassador.id} className="p-6 bg-gradient-card shadow-card border-0 hover:shadow-lg transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={ambassador.avatar || '/placeholder-avatar.png'}
                        alt={ambassador.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{ambassador.name}</h3>
                      <p className="text-sm text-muted-foreground">{ambassador.handle}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <ResourceBasedContent 
                      resource="ambassadors" 
                      permission="edit"
                      fallback={
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      }
                    >
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditAmbassador(ambassador.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </ResourceBasedContent>
                    <ResourceBasedContent 
                      resource="ambassadors" 
                      permission="delete"
                      fallback={
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      }
                    >
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAmbassador(ambassador.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </ResourceBasedContent>
                  </div>
                </div>

                {/* Platforms */}
                <div className="flex items-center space-x-2">
                  {ambassador.platforms.map((platform) => {
                    const PlatformIcon = getPlatformIcon(platform);
                    return (
                      <div key={platform} className="flex items-center space-x-1 text-xs">
                        <PlatformIcon className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{platform}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{ambassador.metrics.totalPosts}</p>
                    <p className="text-xs text-muted-foreground">Total Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{(ambassador.metrics.totalReach / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground">Total Reach</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{(ambassador.metrics.totalEngagement / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground">Total Engagement</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{ambassador.metrics.averageEngagementRate}%</p>
                    <p className="text-xs text-muted-foreground">Avg. Rate</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {ambassador.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleContactAmbassador(ambassador.id, 'email')}
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleViewActivities(ambassador.id)}
                  >
                    <Activity className="w-3 h-3" />
                    Activities
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleViewProfile(ambassador.id)}
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Ambassador Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Ambassador</DialogTitle>
            <DialogDescription>
              Enter the details for the new brand ambassador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={newAmbassador.name}
                  onChange={(e) => setNewAmbassador(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ambassador's full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="handle" className="text-sm font-medium">
                  Main Handle *
                </Label>
                <Input
                  id="handle"
                  value={newAmbassador.handle}
                  onChange={(e) => setNewAmbassador(prev => ({ ...prev, handle: e.target.value }))}
                  placeholder="@username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newAmbassador.email}
                  onChange={(e) => setNewAmbassador(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newAmbassador.phone}
                  onChange={(e) => setNewAmbassador(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={newAmbassador.notes}
                  onChange={(e) => setNewAmbassador(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this ambassador"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Platform Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Platform Information</h3>
              
              {/* Active Platforms */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Active Platforms
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'TWITTER', 'YOUTUBE', 'PINTEREST'] as ChannelType[]).map(platform => {
                    const PlatformIcon = getPlatformIcon(platform);
                    return (
                      <Button
                        key={platform}
                        variant={newAmbassador.platforms.includes(platform) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePlatformChange(platform)}
                        className="flex items-center gap-1"
                      >
                        <PlatformIcon className="w-4 h-4" />
                        <span className="text-xs">{platform}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              {/* Platform Handles */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Platform Handles
                </Label>
                <div className="space-y-3">
                  {(['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'TWITTER', 'YOUTUBE', 'PINTEREST'] as ChannelType[]).map(platform => {
                    const PlatformIcon = getPlatformIcon(platform);
                    return (
                      <div key={platform} className="flex items-center gap-2">
                        <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm w-20 truncate">{platform}</span>
                        <Input
                          value={newAmbassador.platformHandles[platform] || ''}
                          onChange={(e) => handlePlatformHandleChange(platform, e.target.value)}
                          placeholder={`@${platform.toLowerCase()}handle`}
                          className="flex-1"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="Press Enter to add tags"
                  onKeyDown={handleAddTag}
                />
                <div className="flex flex-wrap gap-1">
                  {newAmbassador.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full"
                    >
                      {tag}
                      <button 
                        type="button" 
                        className="ml-1 hover:bg-primary/80 rounded-full"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAmbassador}>
              Add Ambassador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Ambassadors;