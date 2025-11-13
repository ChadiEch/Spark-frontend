import axios from 'axios';
import { Post, Campaign, Task, Goal, Asset, Ambassador, User } from '@/types';

// Create axios instance for export API
const exportAPI = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add auth token to requests
exportAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  fileName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

export class ExportService {
  // Export data to CSV using backend endpoint
  static async exportToCSV(entity: string, fileName: string, fields?: string[]) {
    try {
      const params: any = {};
      if (fields && fields.length > 0) {
        params.fields = fields.join(',');
      }
      
      const response = await exportAPI.get(`/export/${entity}`, {
        params,
        responseType: 'blob'
      });
      
      // Create and download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error('Failed to export data to CSV');
    }
  }

  // Export data to Excel (client-side)
  static exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1') {
    // In a real implementation, you would use a library like xlsx
    // For now, we'll export as JSON
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Export data to PDF (client-side)
  static exportToPDF(data: any[], fileName: string, title: string = 'Report') {
    // In a real implementation, you would use a library like jspdf
    // For now, we'll export as JSON
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Export posts
  static async exportPosts(posts: Post[], options: ExportOptions) {
    const fileName = options.fileName || `posts_export_${new Date().toISOString().split('T')[0]}`;
    
    switch (options.format) {
      case 'csv':
        await this.exportToCSV('posts', fileName);
        break;
      case 'xlsx':
        const exportPostsData = posts.map(post => ({
          id: post.id,
          title: post.title,
          caption: post.caption,
          status: post.status,
          platform: post.platform,
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : '',
          publishedAt: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '',
          reach: post.metrics?.reach || 0,
          likes: post.metrics?.likes || 0,
          comments: post.metrics?.comments || 0,
          shares: post.metrics?.shares || 0,
          saves: post.metrics?.saves || 0,
          engagementRate: post.metrics?.engagementRate || 0,
          createdAt: new Date(post.createdAt).toLocaleDateString(),
          updatedAt: new Date(post.updatedAt).toLocaleDateString()
        }));
        this.exportToExcel(exportPostsData, fileName, 'Posts');
        break;
      case 'pdf':
        const exportPostsPDFData = posts.map(post => ({
          id: post.id,
          title: post.title,
          caption: post.caption,
          status: post.status,
          platform: post.platform,
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : '',
          publishedAt: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '',
          reach: post.metrics?.reach || 0,
          likes: post.metrics?.likes || 0,
          comments: post.metrics?.comments || 0,
          shares: post.metrics?.shares || 0,
          saves: post.metrics?.saves || 0,
          engagementRate: post.metrics?.engagementRate || 0,
          createdAt: new Date(post.createdAt).toLocaleDateString(),
          updatedAt: new Date(post.updatedAt).toLocaleDateString()
        }));
        this.exportToPDF(exportPostsPDFData, fileName, 'Posts Report');
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export campaigns
  static async exportCampaigns(campaigns: Campaign[], options: ExportOptions) {
    const fileName = options.fileName || `campaigns_export_${new Date().toISOString().split('T')[0]}`;
    
    switch (options.format) {
      case 'csv':
        await this.exportToCSV('campaigns', fileName);
        break;
      case 'xlsx':
        const exportCampaignsData = campaigns.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
          startDate: new Date(campaign.start).toLocaleDateString(),
          endDate: new Date(campaign.end).toLocaleDateString(),
          budget: (campaign.budgetCents || 0) / 100,
          spent: (campaign.spentCents || 0) / 100,
          channels: campaign.channels?.join(', ') || '',
          createdAt: new Date(campaign.createdAt).toLocaleDateString(),
          updatedAt: new Date(campaign.updatedAt).toLocaleDateString()
        }));
        this.exportToExcel(exportCampaignsData, fileName, 'Campaigns');
        break;
      case 'pdf':
        const exportCampaignsPDFData = campaigns.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
          startDate: new Date(campaign.start).toLocaleDateString(),
          endDate: new Date(campaign.end).toLocaleDateString(),
          budget: (campaign.budgetCents || 0) / 100,
          spent: (campaign.spentCents || 0) / 100,
          channels: campaign.channels?.join(', ') || '',
          createdAt: new Date(campaign.createdAt).toLocaleDateString(),
          updatedAt: new Date(campaign.updatedAt).toLocaleDateString()
        }));
        this.exportToPDF(exportCampaignsPDFData, fileName, 'Campaigns Report');
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export tasks
  static async exportTasks(tasks: Task[], options: ExportOptions) {
    const fileName = options.fileName || `tasks_export_${new Date().toISOString().split('T')[0]}`;
    
    switch (options.format) {
      case 'csv':
        await this.exportToCSV('tasks', fileName);
        break;
      case 'xlsx':
        const exportTasksData = tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.due ? new Date(task.due).toLocaleDateString() : '',
          assignees: task.assignees?.map(a => a.name).join(', ') || '',
          createdAt: new Date(task.createdAt).toLocaleDateString(),
          updatedAt: new Date(task.updatedAt).toLocaleDateString()
        }));
        this.exportToExcel(exportTasksData, fileName, 'Tasks');
        break;
      case 'pdf':
        const exportTasksPDFData = tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.due ? new Date(task.due).toLocaleDateString() : '',
          assignees: task.assignees?.map(a => a.name).join(', ') || '',
          createdAt: new Date(task.createdAt).toLocaleDateString(),
          updatedAt: new Date(task.updatedAt).toLocaleDateString()
        }));
        this.exportToPDF(exportTasksPDFData, fileName, 'Tasks Report');
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export goals
  static async exportGoals(goals: Goal[], options: ExportOptions) {
    const fileName = options.fileName || `goals_export_${new Date().toISOString().split('T')[0]}`;
    
    switch (options.format) {
      case 'csv':
        await this.exportToCSV('goals', fileName);
        break;
      case 'xlsx':
        const exportGoalsData = goals.map(goal => ({
          id: goal.id,
          title: goal.title,
          type: goal.type,
          targetValue: goal.targetValue,
          targetUnit: goal.targetUnit,
          currentValue: goal.currentValue,
          progress: goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0,
          startDate: new Date(goal.start).toLocaleDateString(),
          endDate: new Date(goal.end).toLocaleDateString(),
          status: goal.status,
          createdAt: new Date(goal.createdAt).toLocaleDateString(),
          updatedAt: new Date(goal.updatedAt).toLocaleDateString()
        }));
        this.exportToExcel(exportGoalsData, fileName, 'Goals');
        break;
      case 'pdf':
        const exportGoalsPDFData = goals.map(goal => ({
          id: goal.id,
          title: goal.title,
          type: goal.type,
          targetValue: goal.targetValue,
          targetUnit: goal.targetUnit,
          currentValue: goal.currentValue,
          progress: goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0,
          startDate: new Date(goal.start).toLocaleDateString(),
          endDate: new Date(goal.end).toLocaleDateString(),
          status: goal.status,
          createdAt: new Date(goal.createdAt).toLocaleDateString(),
          updatedAt: new Date(goal.updatedAt).toLocaleDateString()
        }));
        this.exportToPDF(exportGoalsPDFData, fileName, 'Goals Report');
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export assets
  static async exportAssets(assets: Asset[], options: ExportOptions) {
    const fileName = options.fileName || `assets_export_${new Date().toISOString().split('T')[0]}`;
    
    switch (options.format) {
      case 'csv':
        await this.exportToCSV('assets', fileName);
        break;
      case 'xlsx':
        const exportAssetsData = assets.map(asset => ({
          id: asset.id,
          name: asset.name,
          url: asset.url,
          mimeType: asset.mimeType,
          size: asset.size,
          tags: asset.tags?.join(', ') || '',
          kind: asset.kind,
          uploadedBy: asset.uploadedBy?.name || '',
          createdAt: new Date(asset.createdAt).toLocaleDateString(),
          updatedAt: new Date(asset.updatedAt).toLocaleDateString()
        }));
        this.exportToExcel(exportAssetsData, fileName, 'Assets');
        break;
      case 'pdf':
        const exportAssetsPDFData = assets.map(asset => ({
          id: asset.id,
          name: asset.name,
          url: asset.url,
          mimeType: asset.mimeType,
          size: asset.size,
          tags: asset.tags?.join(', ') || '',
          kind: asset.kind,
          uploadedBy: asset.uploadedBy?.name || '',
          createdAt: new Date(asset.createdAt).toLocaleDateString(),
          updatedAt: new Date(asset.updatedAt).toLocaleDateString()
        }));
        this.exportToPDF(exportAssetsPDFData, fileName, 'Assets Report');
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export ambassadors
  static async exportAmbassadors(ambassadors: Ambassador[], options: ExportOptions) {
    const fileName = options.fileName || `ambassadors_export_${new Date().toISOString().split('T')[0]}`;
    
    switch (options.format) {
      case 'csv':
        await this.exportToCSV('ambassadors', fileName);
        break;
      case 'xlsx':
        const exportAmbassadorsData = ambassadors.map(ambassador => ({
          id: ambassador.id,
          name: ambassador.name,
          handle: ambassador.handle,
          platforms: ambassador.platforms?.join(', ') || '',
          email: ambassador.email || '',
          tags: ambassador.tags?.join(', ') || '',
          totalPosts: ambassador.metrics?.totalPosts || 0,
          totalReach: ambassador.metrics?.totalReach || 0,
          averageEngagementRate: ambassador.metrics?.averageEngagementRate || 0,
          createdAt: new Date(ambassador.createdAt).toLocaleDateString(),
          updatedAt: new Date(ambassador.updatedAt).toLocaleDateString()
        }));
        this.exportToExcel(exportAmbassadorsData, fileName, 'Ambassadors');
        break;
      case 'pdf':
        const exportAmbassadorsPDFData = ambassadors.map(ambassador => ({
          id: ambassador.id,
          name: ambassador.name,
          handle: ambassador.handle,
          platforms: ambassador.platforms?.join(', ') || '',
          email: ambassador.email || '',
          tags: ambassador.tags?.join(', ') || '',
          totalPosts: ambassador.metrics?.totalPosts || 0,
          totalReach: ambassador.metrics?.totalReach || 0,
          averageEngagementRate: ambassador.metrics?.averageEngagementRate || 0,
          createdAt: new Date(ambassador.createdAt).toLocaleDateString(),
          updatedAt: new Date(ambassador.updatedAt).toLocaleDateString()
        }));
        this.exportToPDF(exportAmbassadorsPDFData, fileName, 'Ambassadors Report');
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export users
  static async exportUsers(users: User[], options: ExportOptions) {
    const fileName = options.fileName || `users_export_${new Date().toISOString().split('T')[0]}`;
    
    switch (options.format) {
      case 'csv':
        await this.exportToCSV('users', fileName);
        break;
      case 'xlsx':
        const exportUsersData = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: new Date(user.createdAt).toLocaleDateString(),
          updatedAt: new Date(user.updatedAt).toLocaleDateString()
        }));
        this.exportToExcel(exportUsersData, fileName, 'Users');
        break;
      case 'pdf':
        const exportUsersPDFData = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: new Date(user.createdAt).toLocaleDateString(),
          updatedAt: new Date(user.updatedAt).toLocaleDateString()
        }));
        this.exportToPDF(exportUsersPDFData, fileName, 'Users Report');
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Get available export fields for an entity
  static async getExportFields(entity: string): Promise<string[]> {
    try {
      const response = await exportAPI.get(`/export/${entity}/fields`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching export fields:', error);
      return [];
    }
  }
}