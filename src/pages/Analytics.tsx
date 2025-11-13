import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ExportButton from '../components/ExportButton';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Calendar, 
  Filter, 
  Download, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  DollarSign,
  Target,
  Users,
  Instagram,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
// Import our data hooks
import { usePosts, useCampaigns, useGoals } from '../hooks/useData';
import { analyticsAPI } from '../services/apiService';
import { useQuery } from '@tanstack/react-query';
import { RoleBasedContent, ResourceBasedContent } from '../components/ui/RoleBasedContent';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  
  // Use our data hooks
  const { posts: postsData, loading: postsLoading } = usePosts();
  const posts = postsData || [];
  const { campaigns } = useCampaigns();
  const { goals } = useGoals();

  // Fetch detailed analytics report
  const { data: analyticsReport, isLoading: reportLoading } = useQuery({
    queryKey: ['analyticsReport', dateRange],
    queryFn: () => analyticsAPI.getDetailedReport(),
  });

  // Calculate overview metrics from actual data
  const totalReach = posts.reduce((sum, post) => sum + (post.metrics?.reach || 0), 0);
  const totalEngagement = posts.reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0);
  const engagementRate = posts.length > 0 ? (totalEngagement / totalReach * 100) : 0;
  const totalInteractions = posts.reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0) + (post.metrics?.saves || 0), 0);
  const revenueGenerated = campaigns.reduce((sum, campaign) => sum + (campaign.budgetCents || 0), 0) / 100; // Simplified calculation

  const overviewMetrics = [
    {
      title: 'Total Reach',
      value: `${(totalReach / 1000000).toFixed(1)}M`,
      change: '+15.3%',
      trend: 'up' as const,
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Engagement Rate',
      value: `${engagementRate.toFixed(1)}%`,
      change: '+2.1%',
      trend: 'up' as const,
      icon: Heart,
      color: 'text-red-500',
    },
    {
      title: 'Total Interactions',
      value: `${(totalInteractions / 1000).toFixed(1)}K`,
      change: '+8.7%',
      trend: 'up' as const,
      icon: MessageCircle,
      color: 'text-green-500',
    },
    {
      title: 'Revenue Generated',
      value: `$${(revenueGenerated / 1000).toFixed(1)}K`,
      change: '-3.2%',
      trend: 'down' as const,
      icon: DollarSign,
      color: 'text-yellow-500',
    },
  ];

  // Convert campaigns to performance data
  const campaignPerformance = campaigns.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    reach: campaign.goals.reduce((sum, goal) => {
      // Handle both string IDs and Goal objects
      if (typeof goal === 'string') {
        // If it's a string ID, we can't get the currentValue
        return sum;
      }
      // If it's a Goal object, we can access currentValue
      return sum + (goal.currentValue || 0);
    }, 0), // Simplified
    engagement: Math.floor(Math.random() * 50000), // Placeholder
    conversions: Math.floor(Math.random() * 500), // Placeholder
    roi: Math.floor(Math.random() * 400), // Placeholder
    status: campaign.status.toLowerCase(),
  }));

  // Platform metrics from posts
  const platformMetrics = [
    {
      platform: 'Instagram',
      followers: '125K',
      reach: `${Math.floor(posts.filter(p => p.platform === 'INSTAGRAM').reduce((sum, p) => sum + (p.metrics?.reach || 0), 0) / 1000)}K`,
      engagement: `${(posts.filter(p => p.platform === 'INSTAGRAM').reduce((sum, p) => sum + (p.metrics?.likes || 0), 0) / posts.filter(p => p.platform === 'INSTAGRAM').reduce((sum, p) => sum + (p.metrics?.reach || 1), 0) * 100).toFixed(1)}%`,
      posts: posts.filter(p => p.platform === 'INSTAGRAM').length,
      color: 'bg-pink-500',
    },
    {
      platform: 'TikTok',
      followers: '87K',
      reach: `${Math.floor(posts.filter(p => p.platform === 'TIKTOK').reduce((sum, p) => sum + (p.metrics?.reach || 0), 0) / 1000)}K`,
      engagement: `${(posts.filter(p => p.platform === 'TIKTOK').reduce((sum, p) => sum + (p.metrics?.likes || 0), 0) / posts.filter(p => p.platform === 'TIKTOK').reduce((sum, p) => sum + (p.metrics?.reach || 1), 0) * 100).toFixed(1)}%`,
      posts: posts.filter(p => p.platform === 'TIKTOK').length,
      color: 'bg-black',
    },
    {
      platform: 'Facebook',
      followers: '45K',
      reach: `${Math.floor(posts.filter(p => p.platform === 'FACEBOOK').reduce((sum, p) => sum + (p.metrics?.reach || 0), 0) / 1000)}K`,
      engagement: `${(posts.filter(p => p.platform === 'FACEBOOK').reduce((sum, p) => sum + (p.metrics?.likes || 0), 0) / posts.filter(p => p.platform === 'FACEBOOK').reduce((sum, p) => sum + (p.metrics?.reach || 1), 0) * 100).toFixed(1)}%`,
      posts: posts.filter(p => p.platform === 'FACEBOOK').length,
      color: 'bg-blue-600',
    },
  ];

  // Top content from posts with highest engagement
  const topContent = [...posts]
    .sort((a, b) => {
      const engagementA = (a.metrics?.likes || 0) + (a.metrics?.comments || 0) + (a.metrics?.shares || 0);
      const engagementB = (b.metrics?.likes || 0) + (b.metrics?.comments || 0) + (b.metrics?.shares || 0);
      return engagementB - engagementA;
    })
    .slice(0, 3)
    .map(post => ({
      id: post.id,
      title: post.title,
      platform: post.platform,
      reach: post.metrics?.reach || 0,
      engagement: (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0),
      date: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A',
    }));

  const handleViewAllCampaigns = () => {
    // Navigate to campaigns page
    navigate('/goals');
  };

  const handleViewCampaignDetails = (campaignId: string) => {
    // Navigate to campaign details page (would be implemented in a real app)
    console.log('Viewing details for campaign:', campaignId);
  };

  const handleEditCampaign = (campaignId: string) => {
    // Edit campaign (would be implemented in a real app)
    console.log('Editing campaign:', campaignId);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    // Delete campaign (would be implemented in a real app)
    console.log('Deleting campaign:', campaignId);
  };

  const handleViewContentDetails = (contentId: string) => {
    // View content details (would be implemented in a real app)
    console.log('Viewing details for content:', contentId);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    // Update data based on date range (would be implemented in a real app)
    console.log('Date range changed to:', range);
  };

  if (postsLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
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
            <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
            <p className="text-muted-foreground">
              Track performance metrics across all campaigns and platforms
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Last {dateRange} Days
            </Button>
            <ResourceBasedContent 
              resource="analytics" 
              permission="view"
              fallback={
                <ExportButton 
                  data={posts} 
                  dataType="posts" 
                  fileName={`analytics_report_${new Date().toISOString().split('T')[0]}`}
                  disabled
                />
              }
            >
              <ExportButton 
                data={posts} 
                dataType="posts" 
                fileName={`analytics_report_${new Date().toISOString().split('T')[0]}`}
              />
            </ResourceBasedContent>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'overview' ? 'bg-gradient-primary' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'reports' ? 'bg-gradient-primary' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </Button>
          <Button
            variant={activeTab === 'user-activity' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'user-activity' ? 'bg-gradient-primary' : ''}`}
            onClick={() => setActiveTab('user-activity')}
          >
            User Activity
          </Button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card key={index} className="p-6 bg-gradient-card shadow-card border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.title}</p>
                        <p className="text-2xl font-bold mt-1">{metric.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10`}>
                        <Icon className={`w-6 h-6 ${metric.color}`} />
                      </div>
                    </div>
                    <div className="flex items-center mt-4">
                      <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                        {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4 inline mr-1" /> : <ArrowDownRight className="w-4 h-4 inline mr-1" />}
                        {metric.change}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">vs last period</span>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Performance */}
              <Card className="p-6 bg-gradient-card shadow-card border-0">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Campaign Performance</h2>
                  <Button variant="outline" size="sm" onClick={handleViewAllCampaigns}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {campaignPerformance.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{campaign.name}</h3>
                          <Badge 
                            variant={campaign.status === 'active' ? 'default' : campaign.status === 'at_risk' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>Reach: {campaign.reach.toLocaleString()}</span>
                          <span>Engagement: {campaign.engagement.toLocaleString()}</span>
                          <span>ROI: {campaign.roi}%</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewCampaignDetails(campaign.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <ResourceBasedContent 
                          resource="campaigns" 
                          permission="edit"
                          fallback={
                            <Button variant="ghost" size="sm" disabled>
                              <Edit className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <Button variant="ghost" size="sm" onClick={() => handleEditCampaign(campaign.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </ResourceBasedContent>
                        <ResourceBasedContent 
                          resource="campaigns" 
                          permission="delete"
                          fallback={
                            <Button variant="ghost" size="sm" disabled>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCampaign(campaign.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </ResourceBasedContent>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Platform Metrics */}
              <Card className="p-6 bg-gradient-card shadow-card border-0">
                <h2 className="text-xl font-semibold mb-6">Platform Metrics</h2>
                <div className="space-y-4">
                  {platformMetrics.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                        <span className="font-medium">{platform.platform}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{platform.followers} followers</span>
                        <span>{platform.reach} reach</span>
                        <span>{platform.engagement} engagement</span>
                        <span>{platform.posts} posts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Top Performing Content */}
            <Card className="p-6 bg-gradient-card shadow-card border-0">
              <h2 className="text-xl font-semibold mb-6">Top Performing Content</h2>
              <div className="space-y-4">
                {topContent.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{content.title}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Instagram className="w-4 h-4 mr-1" />
                          {content.platform}
                        </span>
                        <span>Reach: {content.reach.toLocaleString()}</span>
                        <span>Engagement: {content.engagement.toLocaleString()}</span>
                        <span>{content.date}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewContentDetails(content.id)}>
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'reports' && (
          <Card className="p-6 bg-gradient-card shadow-card border-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Detailed Analytics Report</h2>
              <ExportButton 
                data={posts} 
                dataType="posts" 
                fileName={`detailed_analytics_report_${new Date().toISOString().split('T')[0]}`}
              />
            </div>
            
            {reportLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Generating detailed report...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <BarChart className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-muted-foreground">Total Posts</p>
                        <p className="text-xl font-bold">
                          {analyticsReport?.data?.data?.metrics?.totalPosts || 0}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-muted-foreground">Engagement Rate</p>
                        <p className="text-xl font-bold">
                          {analyticsReport?.data?.data?.metrics?.engagementRate?.toFixed(2) || 0}%
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-muted-foreground">Total Reach</p>
                        <p className="text-xl font-bold">
                          {(analyticsReport?.data?.data?.metrics?.totalReach / 1000).toFixed(1) || 0}K
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Platform Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(analyticsReport?.data?.data?.platformDistribution || {}).map(([platform, data]: [string, any]) => (
                        <div key={platform} className="flex items-center justify-between">
                          <span className="font-medium">{platform}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {data.count} posts
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {data.engagement.toLocaleString()} engagement
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Top Performing Posts</h3>
                    <div className="space-y-3">
                      {(analyticsReport?.data?.data?.topPosts || []).slice(0, 5).map((post: any) => (
                        <div key={post.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate">{post.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {post.platform}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {post.engagementRate.toFixed(1)}% ER
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{post.engagement.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">engagement</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Campaign Performance</h3>
                  <div className="space-y-4">
                    {(analyticsReport?.data?.data?.campaignPerformance || []).map((campaign: any) => (
                      <div key={campaign.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge 
                            variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Overall Progress</span>
                            <span>{campaign.overallProgress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${campaign.overallProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {(campaign.goalsProgress || []).map((goal: any, index: number) => (
                            <div key={index} className="bg-muted/50 rounded p-3">
                              <p className="text-sm font-medium truncate">{goal.title}</p>
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{goal.progress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full" 
                                    style={{ width: `${goal.progress}%` }}
                                  ></div>
                                </div>
                                <div className="flex items-center justify-between text-xs mt-1">
                                  <span>{goal.current.toLocaleString()}</span>
                                  <span>{goal.target.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'user-activity' && (
          <Card className="p-6 bg-gradient-card shadow-card border-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">User Activity Metrics</h2>
              <ExportButton 
                data={[]} 
                dataType="users" 
                fileName={`user_activity_report_${new Date().toISOString().split('T')[0]}`}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Posts</th>
                    <th className="text-left py-3 px-4">Reach</th>
                    <th className="text-left py-3 px-4">Engagement</th>
                    <th className="text-left py-3 px-4">Engagement Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                          JD
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-muted-foreground">john@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">Admin</Badge>
                    </td>
                    <td className="py-3 px-4">24</td>
                    <td className="py-3 px-4">1.2M</td>
                    <td className="py-3 px-4">45.6K</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="mr-2">4.2%</span>
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          SJ
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">Sarah Johnson</p>
                          <p className="text-sm text-muted-foreground">sarah@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">Content Manager</Badge>
                    </td>
                    <td className="py-3 px-4">18</td>
                    <td className="py-3 px-4">890K</td>
                    <td className="py-3 px-4">32.1K</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="mr-2">3.8%</span>
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">
                          MP
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">Mike Peterson</p>
                          <p className="text-sm text-muted-foreground">mike@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">Team Member</Badge>
                    </td>
                    <td className="py-3 px-4">12</td>
                    <td className="py-3 px-4">450K</td>
                    <td className="py-3 px-4">18.7K</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="mr-2">4.1%</span>
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Analytics;