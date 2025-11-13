import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog"
import ExportButton from "../components/ExportButton"
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Grid3X3,
  List,
  FolderOpen,
  Calendar,
  Tag,
  X
} from "lucide-react"
// Import our data hooks
import { useAssets, useCampaigns, usePosts, useGoals } from "../hooks/useData"
import { assetService } from "../services/dataService"
import { Asset, Campaign, Post, Goal } from "../types"
import { toast } from "../components/ui/use-toast"
// Import JSZip for creating zip files
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { RoleBasedContent, ResourceBasedContent } from "../components/ui/RoleBasedContent"

export default function Assets() {
  const { assets: assetsData, loading, error, deleteAsset: deleteAssetHook, updateAsset, addAsset } = useAssets()
  const { campaigns, loading: campaignsLoading } = useCampaigns()
  const { posts: postsData, loading: postsLoading } = usePosts()
  const { goals, loading: goalsLoading } = useGoals()
  
  const assets = assetsData || []
  const posts = postsData || []
  const deleteAssetFunc = deleteAssetHook || (async (id: string) => { console.warn('Delete not implemented'); return false; })
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [postFilter, setPostFilter] = useState('all')
  const [goalFilter, setGoalFilter] = useState('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [assetForm, setAssetForm] = useState({
    name: '',
    tags: [] as string[],
    campaignId: 'none',
    newTag: '',
    postId: 'none',
    goalId: 'none'
  })
  const navigate = useNavigate()

  // Debounce search term updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Initialize form when editing asset
  useEffect(() => {
    if (editingAsset) {
      setAssetForm({
        name: editingAsset.name,
        tags: [...editingAsset.tags],
        campaignId: editingAsset.campaign?.id || 'none',
        newTag: '',
        // Initialize post and goal associations
        postId: editingAsset.post?.id || 'none',
        goalId: editingAsset.goal?.id || 'none'
      })
    }
  }, [editingAsset, editingAsset?.campaign?.id, editingAsset?.post?.id, editingAsset?.goal?.id, editingAsset?.name, editingAsset?.tags])

  // Safety check for data
  const safeAssets = assets || [];
  const safeCampaigns = campaigns || [];
  const safePosts = posts || [];
  const safeGoals = goals || [];

  // Show loading state
  const isLoading = loading || campaignsLoading || postsLoading || goalsLoading;
  
  // Filter assets
  const filteredAssets = safeAssets.filter(asset => {
    const matchesSearch = debouncedSearchTerm === '' || 
                         asset.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                         asset.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
                         (asset.campaign && asset.campaign.name && asset.campaign.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
                         (asset.post && asset.post.title && asset.post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
                         (asset.goal && asset.goal.title && asset.goal.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' || asset.kind === filter.toUpperCase() as any;
    const matchesCampaignFilter = campaignFilter === 'all' || 
                                 (campaignFilter === 'none' && !asset.campaign) || 
                                 (asset.campaign && asset.campaign.id === campaignFilter);
    const matchesPostFilter = postFilter === 'all' || 
                             (postFilter === 'none' && !asset.post) || 
                             (asset.post && asset.post.id === postFilter);
    const matchesGoalFilter = goalFilter === 'all' || 
                             (goalFilter === 'none' && !asset.goal) || 
                             (asset.goal && asset.goal.id === goalFilter);
    return matchesSearch && matchesFilter && matchesCampaignFilter && matchesPostFilter && matchesGoalFilter;
  });

  const getAssetIcon = (kind: string) => {
    switch (kind) {
      case 'IMAGE': return ImageIcon;
      case 'VIDEO': return Video;
      case 'DOC': return FileText;
      default: return FolderOpen;
    }
  };

  const getAssetColor = (kind: string) => {
    switch (kind) {
      case 'IMAGE': return 'bg-blue-100 text-blue-600';
      case 'VIDEO': return 'bg-purple-100 text-purple-600';
      case 'DOC': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      const success = await deleteAssetFunc(assetId);
      if (success) {
        toast({
          title: "Asset Deleted",
          description: "The asset has been deleted successfully!",
        });
        // Remove from selection if it was selected
        if (selectedAssets.has(assetId)) {
          const newSelectedAssets = new Set(selectedAssets);
          newSelectedAssets.delete(assetId);
          setSelectedAssets(newSelectedAssets);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete asset. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewAsset = (assetId: string) => {
    // For view, we'll open photos and videos in modal, others in new tab
    const asset = safeAssets.find(a => a.id === assetId);
    if (asset) {
      if (asset.kind === 'IMAGE' || asset.kind === 'VIDEO') {
        // Open in modal for photos and videos
        handleViewAssetInModal(assetId);
      } else {
        // Open in new tab for other assets
        const assetUrl = asset.url.startsWith('http') ? asset.url : `${import.meta.env.VITE_API_BASE_URL || ''}${asset.url}`;
        window.open(assetUrl, '_blank');
      }
    }
  };

  // Add a separate function for viewing in modal
  const handleViewAssetInModal = (assetId: string) => {
    // For view, we'll show the asset in a view-only modal
    const asset = safeAssets.find(a => a.id === assetId);
    if (asset) {
      setViewingAsset(asset);
      setIsViewModalOpen(true);
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    const newSelectedAssets = new Set(selectedAssets);
    if (newSelectedAssets.has(assetId)) {
      newSelectedAssets.delete(assetId);
    } else {
      newSelectedAssets.add(assetId);
    }
    setSelectedAssets(newSelectedAssets);
  };

  const selectAllAssets = () => {
    const newSelectedAssets = new Set(filteredAssets.map(asset => asset.id));
    setSelectedAssets(newSelectedAssets);
  };

  const clearSelection = () => {
    setSelectedAssets(new Set());
  };

  const handleDownloadAsset = async (asset: Asset) => {
    try {
      const assetUrl = asset.url.startsWith('http') ? asset.url : `${import.meta.env.VITE_API_BASE_URL || ''}${asset.url}`;
      
      // Fetch the asset
      const response = await fetch(assetUrl);
      if (!response.ok) {
        throw new Error(`Failed to download asset: ${asset.name}`);
      }
      
      // Get the blob and create a download link
      const blob = await response.blob();
      
      // Create a filename with proper extension
      const fileName = asset.name.replace(/[^a-zA-Z0-9._-]/g, '_') + getFileExtension(assetUrl, asset.kind);
      
      // Use file-saver to download the file
      saveAs(blob, fileName);
      
      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${asset.name}`,
      });
    } catch (error) {
      console.error("Error downloading asset:", error);
      toast({
        title: "Download Failed",
        description: `Failed to download asset: ${asset.name}`,
        variant: "destructive",
      });
    }
  };

  const handleDownloadSelectedAssets = async () => {
    if (selectedAssets.size === 0) {
      toast({
        title: "No Assets Selected",
        description: "Please select at least one asset to download.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Array to hold promises for asset downloads
      const downloadPromises: Promise<void>[] = [];
      
      // Create a toast to show download progress
      const progressToast = toast({
        title: "Preparing Download",
        description: `Downloading ${selectedAssets.size} asset(s)...`,
      });
      
      // Download each selected asset
      selectedAssets.forEach(assetId => {
        const asset = safeAssets.find(a => a.id === assetId);
        if (asset) {
          const assetUrl = asset.url.startsWith('http') ? asset.url : `${import.meta.env.VITE_API_BASE_URL || ''}${asset.url}`;
          
          // Create a promise for each asset download
          const downloadPromise = fetch(assetUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to download asset: ${asset.name}`);
              }
              return response.blob();
            })
            .then(blob => {
              // Add the file to the zip with a sanitized filename
              const fileName = asset.name.replace(/[^a-zA-Z0-9._-]/g, '_') + getFileExtension(assetUrl, asset.kind);
              zip.file(fileName, blob);
            })
            .catch(error => {
              console.error(`Error downloading asset ${asset.name}:`, error);
              toast({
                title: "Download Error",
                description: `Failed to download asset: ${asset.name}`,
                variant: "destructive",
              });
            });
            
          downloadPromises.push(downloadPromise);
        }
      });
      
      // Wait for all downloads to complete
      await Promise.all(downloadPromises);
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Save the zip file
      saveAs(zipBlob, `selected_assets_${new Date().toISOString().slice(0, 10)}.zip`);
      
      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${selectedAssets.size} asset(s) as a zip file.`,
      });
    } catch (error) {
      console.error("Error creating zip file:", error);
      toast({
        title: "Download Failed",
        description: "Failed to create zip file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to get file extension based on asset kind or URL
  const getFileExtension = (url: string, kind: string): string => {
    // Try to get extension from URL
    const urlParts = url.split('.');
    if (urlParts.length > 1) {
      return '.' + urlParts[urlParts.length - 1].split('?')[0];
    }
    
    // Fallback to kind-based extension
    switch (kind) {
      case 'IMAGE': return '.jpg';
      case 'VIDEO': return '.mp4';
      case 'DOC': return '.pdf';
      default: return '.bin';
    }
  };

  const handleEditAsset = (assetId: string) => {
    const asset = safeAssets.find(a => a.id === assetId);
    if (asset) {
      setEditingAsset(asset);
      setIsEditModalOpen(true);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    try {
      // Import the asset service
      const { assetService } = await import('../services/dataService');
      
      // Upload the file
      const uploadedAsset = await assetService.upload(file);
      
      if (uploadedAsset) {
        toast({
          title: "Asset Uploaded",
          description: "Your asset has been uploaded successfully!",
        });
        // Refresh the assets list
        // Manually refresh assets by calling the service directly
        const updatedAssets = await assetService.getAll();
        // Update the assets state manually
        // This is a workaround since refetch is not available in the hook
      } else {
        toast({
          title: "Error",
          description: "Failed to upload asset. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error uploading asset:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload asset. Please try again.",
        variant: "destructive",
      });
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadAsset = () => {
    // Trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const applyFilter = (filterType: string) => {
    setFilter(filterType);
    setShowFilterMenu(false);
  };

  const handleSaveAsset = async () => {
    if (!editingAsset) return;

    try {
      // Prepare update data with proper typing
      const updateData: any = {
        name: assetForm.name,
        tags: assetForm.tags,
        campaign: assetForm.campaignId !== 'none' ? assetForm.campaignId : null,
        post: assetForm.postId !== 'none' ? assetForm.postId : null,
        goal: assetForm.goalId !== 'none' ? assetForm.goalId : null
      };
      
      const updatedAsset = await updateAsset?.(editingAsset.id, updateData);

      if (updatedAsset) {
        toast({
          title: "Asset Updated",
          description: "Your asset has been updated successfully!",
        });
        setIsEditModalOpen(false);
        // Manually refresh assets by calling the service directly
        const updatedAssets = await assetService.getAll();
        // Update the assets state manually
        // This is a workaround since refetch is not available in the hook
      } else {
        toast({
          title: "Error",
          description: "Failed to update asset. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error updating asset:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update asset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = () => {
    if (assetForm.newTag.trim() && !assetForm.tags.includes(assetForm.newTag.trim())) {
      setAssetForm({
        ...assetForm,
        tags: [...assetForm.tags, assetForm.newTag.trim()],
        newTag: ''
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAssetForm({
      ...assetForm,
      tags: assetForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setAssetForm({
      ...assetForm,
      [field]: value
    });
  };

  const clearAllFilters = () => {
    setFilter('all');
    setCampaignFilter('all');
    setPostFilter('all');
    setGoalFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = filter !== 'all' || campaignFilter !== 'all' || postFilter !== 'all' || goalFilter !== 'all' || debouncedSearchTerm !== '';

  // Get filter labels for display
  const getActiveFilterLabels = () => {
    const labels = [];
    if (filter !== 'all') labels.push(`Type: ${filter}`);
    if (campaignFilter !== 'all') {
      if (campaignFilter === 'none') {
        labels.push('Campaign: None');
      } else {
        const campaign = safeCampaigns?.find(c => c.id === campaignFilter);
        if (campaign) labels.push(`Campaign: ${campaign.name}`);
      }
    }
    if (postFilter !== 'all') {
      if (postFilter === 'none') {
        labels.push('Post: None');
      } else {
        const post = safePosts?.find(p => p.id === postFilter);
        if (post) labels.push(`Post: ${post.title}`);
      }
    }
    if (goalFilter !== 'all') {
      if (goalFilter === 'none') {
        labels.push('Goal: None');
      } else {
        const goal = safeGoals?.find(g => g.id === goalFilter);
        if (goal) labels.push(`Goal: ${goal.title}`);
      }
    }
    if (debouncedSearchTerm) labels.push(`Search: "${debouncedSearchTerm}"`);
    return labels;
  };

  // Move the loading check to the render section to avoid conditional hook execution
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading assets...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
        />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold gradient-text">Assets</h1>
            <p className="text-muted-foreground">
              Manage your media assets and files
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ExportButton 
              data={assets} 
              dataType="assets" 
              fileName={`assets_export_${new Date().toISOString().split('T')[0]}`}
            />
            <Button 
              className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" 
              onClick={handleDownloadSelectedAssets}
              disabled={selectedAssets.size === 0}
            >
              <Download className="w-4 h-4" />
              Download Selected ({selectedAssets.size})
            </Button>
            <ResourceBasedContent 
              resource="assets" 
              permission="create"
              fallback={
                <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" disabled>
                  <Upload className="w-4 h-4" />
                  Upload Asset (Permission Required)
                </Button>
              }
            >
              <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90" onClick={handleUploadAsset}>
                <Upload className="w-4 h-4" />
                Upload Asset
              </Button>
            </ResourceBasedContent>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center space-x-1"
              >
                <Filter className="w-4 h-4" />
                <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
              </Button>
              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-1 bg-card shadow-card border border-border rounded-md w-48 z-50">
                  <Button
                    key="all"
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyFilter('all')}
                    className="w-full justify-start"
                  >
                    All
                  </Button>
                  <Button
                    key="image"
                    variant={filter === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyFilter('image')}
                    className="w-full justify-start"
                  >
                    Images
                  </Button>
                  <Button
                    key="video"
                    variant={filter === 'video' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyFilter('video')}
                    className="w-full justify-start"
                  >
                    Videos
                  </Button>
                  <Button
                    key="document"
                    variant={filter === 'document' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyFilter('document')}
                    className="w-full justify-start"
                  >
                    Documents
                  </Button>
                </div>
              )}
            </div>
            
            {/* Campaign Filter */}
            <div className="relative">
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="none">No Campaign</SelectItem>
                  {(campaigns || []).map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id} title={campaign.name}>
                      <span className="truncate max-w-[120px] block">{campaign.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Post Filter */}
            <div className="relative">
              <Select value={postFilter} onValueChange={setPostFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Posts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="none">No Post</SelectItem>
                  {(posts || []).map(post => (
                    <SelectItem key={post.id} value={post.id} title={post.title}>
                      <span className="truncate max-w-[120px] block">{post.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Goal Filter */}
            <div className="relative">
              <Select value={goalFilter} onValueChange={setGoalFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Goals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="none">No Goal</SelectItem>
                  {(goals || []).map(goal => (
                    <SelectItem key={goal.id} value={goal.id} title={goal.title}>
                      <span className="truncate max-w-[120px] block">{goal.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant={view === 'grid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setView('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button 
              variant={view === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
            {getActiveFilterLabels().map((label, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}

        {/* Assets View */}
        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAssets.map(asset => {
              const AssetIcon = getAssetIcon(asset.kind);
              return (
                <Card key={asset.id} className="overflow-hidden hover:shadow-card transition-shadow">
                  <div className="aspect-square bg-muted relative">
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedAssets.has(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                    {asset.kind === 'IMAGE' ? (
                      <img 
                        src={asset.url.startsWith('http') ? asset.url : `${import.meta.env.VITE_API_BASE_URL || ''}${asset.url}`} 
                        alt={asset.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${getAssetColor(asset.kind)}`}>
                        <AssetIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm truncate">{asset.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {asset.kind.toLowerCase()}
                      </Badge>
                    </div>
                    {asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {asset.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {asset.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{asset.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    {/* Display associated entities */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {asset.campaign && (
                        <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 max-w-[100px] truncate">
                          <span className="truncate" title={asset.campaign.name}>{asset.campaign.name}</span>
                        </Badge>
                      )}
                      {asset.post && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800 max-w-[100px] truncate">
                          <span className="truncate" title={asset.post.title}>{asset.post.title}</span>
                        </Badge>
                      )}
                      {asset.goal && (
                        <Badge variant="default" className="text-xs bg-purple-100 text-purple-800 max-w-[100px] truncate">
                          <span className="truncate" title={asset.goal.title}>{asset.goal.title}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewAsset(asset.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <ResourceBasedContent 
                          resource="assets" 
                          permission="edit"
                          fallback={
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                              <Edit className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditAsset(asset.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </ResourceBasedContent>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadAsset(asset)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <ResourceBasedContent 
                          resource="assets" 
                          permission="delete"
                          fallback={
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteAsset(asset.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </ResourceBasedContent>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedAssets.size > 0 && selectedAssets.size === filteredAssets.length}
                        onChange={(e) => e.target.checked ? selectAllAssets() : clearSelection()}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="text-left py-3 px-4">Asset</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Tags</th>
                    <th className="text-left py-3 px-4">Size</th>
                    <th className="text-left py-3 px-4">Uploaded</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map(asset => {
                    const AssetIcon = getAssetIcon(asset.kind);
                    return (
                      <tr key={asset.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedAssets.has(asset.id)}
                            onChange={() => toggleAssetSelection(asset.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded flex items-center justify-center ${getAssetColor(asset.kind)}`}>
                              <AssetIcon className="w-5 h-5" />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">{asset.name}</p>
                              {/* Display associated entities in list view */}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {asset.campaign && (
                                  <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 max-w-[80px] truncate">
                                    <span className="truncate" title={asset.campaign.name}>{asset.campaign.name}</span>
                                  </Badge>
                                )}
                                {asset.post && (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800 max-w-[80px] truncate">
                                    <span className="truncate" title={asset.post.title}>{asset.post.title}</span>
                                  </Badge>
                                )}
                                {asset.goal && (
                                  <Badge variant="default" className="text-xs bg-purple-100 text-purple-800 max-w-[80px] truncate">
                                    <span className="truncate" title={asset.goal.title}>{asset.goal.title}</span>
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{asset.kind.toLowerCase()}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {asset.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {asset.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{asset.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {asset.size ? `${(asset.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewAsset(asset.id)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <ResourceBasedContent 
                              resource="assets" 
                              permission="edit"
                              fallback={
                                <Button variant="ghost" size="sm" disabled>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              }
                            >
                              <Button variant="ghost" size="sm" onClick={() => handleEditAsset(asset.id)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </ResourceBasedContent>
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadAsset(asset)}>
                              <Download className="w-4 h-4" />
                            </Button>
                            <ResourceBasedContent 
                              resource="assets" 
                              permission="delete"
                              fallback={
                                <Button variant="ghost" size="sm" disabled>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              }
                            >
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </ResourceBasedContent>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-medium">No assets found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button className="mt-4" onClick={handleUploadAsset}>
              Upload Asset
            </Button>
          </div>
        )}

        {/* View Asset Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Asset</DialogTitle>
            </DialogHeader>
            {viewingAsset && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      {viewingAsset.kind === 'IMAGE' ? (
                        <img 
                          src={viewingAsset.url.startsWith('http') ? viewingAsset.url : `${import.meta.env.VITE_API_BASE_URL || ''}${viewingAsset.url}`} 
                          alt={viewingAsset.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      ) : viewingAsset.kind === 'VIDEO' ? (
                        <video 
                          src={viewingAsset.url.startsWith('http') ? viewingAsset.url : `${import.meta.env.VITE_API_BASE_URL || ''}${viewingAsset.url}`} 
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${getAssetColor(viewingAsset.kind)}`}>
                          {React.createElement(getAssetIcon(viewingAsset.kind), { className: "w-16 h-16" })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/2 space-y-4">
                    <div>
                      <Label>Name</Label>
                      <div className="mt-1 font-medium">{viewingAsset.name}</div>
                    </div>
                    
                    <div>
                      <Label>Type</Label>
                      <div className="mt-1">
                        <Badge variant="secondary">{viewingAsset.kind.toLowerCase()}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Size</Label>
                      <div className="mt-1 text-sm">
                        {viewingAsset.size ? `${(viewingAsset.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Uploaded</Label>
                      <div className="mt-1 text-sm">
                        {new Date(viewingAsset.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {viewingAsset.campaign && (
                      <div>
                        <Label>Associated Campaign</Label>
                        <div className="mt-1">
                          <Badge>{viewingAsset.campaign.name}</Badge>
                        </div>
                      </div>
                    )}
                    
                    {/* Display associated posts */}
                    {viewingAsset.post && (
                      <div>
                        <Label>Associated Post</Label>
                        <div className="mt-1">
                          <Badge>{viewingAsset.post.title}</Badge>
                        </div>
                      </div>
                    )}
                    
                    {/* Display associated goals */}
                    {viewingAsset.goal && (
                      <div>
                        <Label>Associated Goal</Label>
                        <div className="mt-1">
                          <Badge>{viewingAsset.goal.title}</Badge>
                        </div>
                      </div>
                    )}
                    
                    {viewingAsset.tags.length > 0 && (
                      <div>
                        <Label>Tags</Label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {viewingAsset.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Asset Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Asset</DialogTitle>
            </DialogHeader>
            {editingAsset && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      {editingAsset.kind === 'IMAGE' ? (
                        <img 
                          src={editingAsset.url.startsWith('http') ? editingAsset.url : `${import.meta.env.VITE_API_BASE_URL || ''}${editingAsset.url}`} 
                          alt={editingAsset.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${getAssetColor(editingAsset.kind)}`}>
                          {React.createElement(getAssetIcon(editingAsset.kind), { className: "w-16 h-16" })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/2 space-y-4">
                    <div>
                      <Label htmlFor="asset-name">Name</Label>
                      <Input
                        id="asset-name"
                        value={assetForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Type</Label>
                      <div className="mt-1">
                        <Badge variant="secondary">{editingAsset.kind.toLowerCase()}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Size</Label>
                      <div className="mt-1 text-sm">
                        {editingAsset.size ? `${(editingAsset.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Uploaded</Label>
                      <div className="mt-1 text-sm">
                        {new Date(editingAsset.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {editingAsset.campaign && (
                      <div>
                        <Label>Associated Campaign</Label>
                        <div className="mt-1">
                          <Badge>{editingAsset.campaign.name}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Tags</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {assetForm.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)}
                          className="rounded-full hover:bg-muted-foreground/20 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={assetForm.newTag}
                    onChange={(e) => handleFormChange('newTag', e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} variant="outline">
                    <Tag className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Label>Associate with Campaign</Label>
                  <Select 
                    value={assetForm.campaignId} 
                    onValueChange={(value) => handleFormChange('campaignId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {(campaigns || []).map(campaign => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <Label>Associate with Post</Label>
                  <Select 
                    value={assetForm.postId} 
                    onValueChange={(value) => handleFormChange('postId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a post" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {(posts || []).map(post => (
                        <SelectItem key={post.id} value={post.id}>
                          {post.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <Label>Associate with Goal</Label>
                  <Select 
                    value={assetForm.goalId} 
                    onValueChange={(value) => handleFormChange('goalId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {(goals || []).map(goal => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAsset}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}