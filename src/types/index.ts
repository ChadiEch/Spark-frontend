// Winnerforce Marketing Platform Types

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface APIListResponse<T> extends APIResponse<T[]> {
  count: number;
}

export type Role = 'ADMIN' | 'MANAGER' | 'CONTRIBUTOR' | 'VIEWER';

export type GoalType = 'ENGAGEMENT' | 'SALES' | 'REACH' | 'CONVERSIONS' | 'AWARENESS';
export type GoalStatus = 'UPCOMING' | 'ACTIVE' | 'AT_RISK' | 'OFF_TRACK' | 'COMPLETE';

export type CampaignStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type ChannelType = 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | 'PINTEREST' | 'X' | 'YOUTUBE';
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'POSTED' | 'ARCHIVED';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'TRASH';
export type ActivityType = 'POST' | 'AD' | 'AMBASSADOR_TASK';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  targetValue: number;
  targetUnit: string;
  currentValue: number;
  baselineValue?: number;
  start: Date;
  end: Date;
  status: GoalStatus;
  owner: User;
  campaigns: Campaign[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  start: Date;
  end: Date;
  budgetCents?: number;
  spentCents?: number;
  channels: ChannelType[];
  goals: (Goal | string)[]; // Can be Goal objects or string IDs
  activities: Activity[];
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ambassador {
  id: string;
  name: string;
  handle: string;
  platformHandles?: {
    [key in ChannelType]?: string;
  };
  platforms: ChannelType[];
  email?: string;
  phone?: string;
  tags: string[];
  notes?: string;
  avatar?: string;
  metrics: {
    totalPosts: number;
    totalReach: number;
    totalEngagement: number;
    averageEngagementRate: number;
  };
  trackingConfig?: {
    accountToMention?: string;
    specialTags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  caption?: string;
  hashtags: string[]; // Global hashtags
  platformHashtags: {
    [key in ChannelType]?: string[]; // Platform-specific hashtags
  };
  notes?: string;
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  platform: ChannelType;
  attachments: Asset[];
  campaign?: Campaign;
  goal?: Goal; // Add goal relationship
  metrics?: PostMetrics;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due?: Date;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignees: User[];
  relatedPost?: Post;
  relatedCampaign?: Campaign;
  checklist?: ChecklistItem[];
  // Trash functionality fields
  trashed?: boolean;
  trashedBy?: User;
  trashedAt?: Date;
  restoreStatus?: TaskStatus;
  startDate?: Date;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  type: ActivityType;
  campaign?: Campaign;
  goal?: Goal;
  ambassador?: Ambassador;
  post?: Post;
  metrics?: ActivityMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  tags: string[];
  kind: 'IMAGE' | 'VIDEO' | 'DOC' | 'TEMPLATE' | 'GUIDELINE';
  uploadedBy: User;
  campaign?: Campaign;
  post?: Post;
  goal?: Goal;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostMetrics {
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number;
}

export interface ActivityMetrics {
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  conversions?: number;
  spendCents?: number;
  revenueCents?: number;
}

export interface ProgressSnapshot {
  id: string;
  goalId: string;
  takenAt: Date;
  currentValue: number;
  source: 'COMPUTED' | 'MANUAL' | 'IMPORTED';
  notes?: string;
}

// Calendar Event for calendar views
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  type: 'POST' | 'CAMPAIGN' | 'TASK' | 'DEADLINE';
  status: PostStatus | CampaignStatus | TaskStatus;
  platform?: ChannelType;
  color?: string;
  data: Post | Campaign | Task;
}

// Dashboard KPI Cards
export interface KPICard {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  status: 'SUCCESS' | 'WARNING' | 'DANGER' | 'NEUTRAL';
  icon: string;
}

// Icons type
export type Icons = {
  [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// Integration types
export interface Integration {
  id: string;
  name: string;
  description: string;
  key: string;
  icon: string;
  category: 'social' | 'storage' | 'analytics' | 'communication' | 'other';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationConnection {
  id: string;
  integrationId: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Billing types
export interface Billing {
  id: string;
  userId: string;
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
    startDate: Date;
    endDate?: Date;
    autoRenew: boolean;
    price: {
      amount: number;
      currency: string;
    };
  };
  paymentMethod?: {
    type: 'card' | 'paypal' | 'bank_transfer';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  invoices: Invoice[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  date: Date;
  amount: {
    value: number;
    currency: string;
  };
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  pdfUrl?: string;
}