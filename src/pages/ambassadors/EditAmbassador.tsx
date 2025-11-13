import { useState, useEffect, KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Calendar, 
  Target, 
  FileImage, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2,
  Eye,
  DollarSign,
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Instagram,
  Star,
  Save,
  X
} from 'lucide-react';
import { useAmbassadors } from '@/hooks/useData';
import { toast } from '@/components/ui/use-toast';
import { Ambassador, ChannelType } from '@/types';
import { ambassadorAPI } from '@/services/apiService';

const EditAmbassador = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ambassadors, updateAmbassador, deleteAmbassador } = useAmbassadors();
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    platformHandles: {} as Partial<Record<ChannelType, string | undefined>>,
    email: '',
    phone: '',
    platforms: [] as ChannelType[],
    tags: [] as string[],
    notes: '',
  });

  useEffect(() => {
    const fetchAmbassador = async () => {
      if (id) {
        // First try to get from the list
        const foundAmbassador = ambassadors.find(a => a.id === id);
        if (foundAmbassador) {
          setAmbassador(foundAmbassador);
          setFormData({
            name: foundAmbassador.name,
            handle: foundAmbassador.handle,
            platformHandles: foundAmbassador.platformHandles || {},
            email: foundAmbassador.email || '',
            phone: foundAmbassador.phone || '',
            platforms: foundAmbassador.platforms,
            tags: foundAmbassador.tags,
            notes: foundAmbassador.notes || '',
          });
          setLoading(false);
        } else {
          // If not found, fetch directly from API
          try {
            const response = await ambassadorAPI.getById(id);
            if (response.data?.data) {
              const fetchedAmbassador = response.data.data;
              setAmbassador(fetchedAmbassador);
              setFormData({
                name: fetchedAmbassador.name,
                handle: fetchedAmbassador.handle,
                platformHandles: fetchedAmbassador.platformHandles || {},
                email: fetchedAmbassador.email || '',
                phone: fetchedAmbassador.phone || '',
                platforms: fetchedAmbassador.platforms,
                tags: fetchedAmbassador.tags,
                notes: fetchedAmbassador.notes || '',
              });
            }
          } catch (error) {
            console.error('Error fetching ambassador:', error);
            toast({
              title: "Error",
              description: "Failed to load ambassador data.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        }
      }
    };

    fetchAmbassador();
  }, [id, ambassadors]);

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

  const handlePlatformChange = (platform: ChannelType) => {
    setFormData(prev => {
      const platforms = prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform];
      return { ...prev, platforms };
    });
  };

  const handlePlatformHandleChange = (platform: ChannelType, handle: string) => {
    setFormData(prev => ({
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
      if (!formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      target.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.handle) {
      toast({
        title: "Validation Error",
        description: "Name and main handle are required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    try {
      const updatedData = {
        name: formData.name,
        handle: formData.handle,
        platformHandles: formData.platformHandles,
        email: formData.email,
        phone: formData.phone,
        platforms: formData.platforms,
        tags: formData.tags,
        notes: formData.notes,
      };

      const result = await updateAmbassador(id, updatedData);
      if (result) {
        toast({
          title: "Ambassador Updated",
          description: `${formData.name} has been updated successfully.`,
        });
        navigate('/ambassadors');
      } else {
        throw new Error('Failed to update ambassador');
      }
    } catch (error) {
      console.error('Error updating ambassador:', error);
      toast({
        title: "Error",
        description: "Failed to update ambassador. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this ambassador? This action cannot be undone.')) {
      try {
        const success = await deleteAmbassador(id);
        if (success) {
          toast({
            title: "Ambassador Deleted",
            description: "The ambassador has been deleted successfully.",
          });
          navigate('/ambassadors');
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

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading ambassador...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!ambassador) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Ambassador Not Found</h2>
            <p className="text-red-700 mb-4">
              The ambassador you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/ambassadors')}>
              Back to Ambassadors
            </Button>
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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/ambassadors')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold gradient-text">Edit Ambassador</h1>
              <p className="text-muted-foreground">
                Update ambassador information
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate('/ambassadors')}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="p-6 bg-gradient-card shadow-card border-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Basic Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ambassador's full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="handle">Main Handle *</Label>
                <Input
                  id="handle"
                  value={formData.handle}
                  onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                  placeholder="@username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this ambassador"
                  rows={4}
                />
              </div>
            </div>
            
            {/* Platform Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Platform Information</h2>
              
              {/* Active Platforms */}
              <div className="space-y-2">
                <Label>Active Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {(['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'TWITTER', 'YOUTUBE', 'PINTEREST'] as ChannelType[]).map(platform => {
                    const PlatformIcon = getPlatformIcon(platform);
                    return (
                      <Button
                        key={platform}
                        variant={formData.platforms.includes(platform) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePlatformChange(platform)}
                        className="flex items-center gap-1"
                      >
                        <PlatformIcon className="w-4 h-4" />
                        {platform}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              {/* Platform Handles */}
              <div className="space-y-2">
                <Label>Platform Handles</Label>
                <div className="space-y-3">
                  {(['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'TWITTER', 'YOUTUBE', 'PINTEREST'] as ChannelType[]).map(platform => {
                    const PlatformIcon = getPlatformIcon(platform);
                    return (
                      <div key={platform} className="flex items-center gap-2">
                        <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm w-20">{platform}</span>
                        <Input
                          value={formData.platformHandles[platform] || ''}
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
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Press Enter to add tags"
                  onKeyDown={handleAddTag}
                />
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map(tag => (
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
        </Card>
      </div>
    </PageLayout>
  );
};

export default EditAmbassador;