import api from './apiService';

export interface Notification {
  id: string;
  recipient: string;
  sender?: string;
  type: 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'CAMPAIGN_STARTED' | 'CAMPAIGN_ENDED' | 'GOAL_PROGRESS' | 'MENTION' | 'COMMENT' | 'REMINDER' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  relatedEntity?: {
    type: string;
    id: string;
  };
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  count?: number;
  total?: number;
  pages?: number;
  page?: number;
  data: Notification | Notification[];
  message?: string;
}

export const notificationAPI = {
  // Get user notifications
  getNotifications: (params?: {
    page?: number;
    limit?: number;
    read?: boolean;
    type?: string;
    priority?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';
    return api.get<NotificationResponse>(url);
  },

  // Get unread notifications count
  getUnreadCount: () => {
    return api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
  },

  // Mark notification as read
  markAsRead: (id: string) => {
    return api.put<NotificationResponse>(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.put<NotificationResponse>('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: (id: string) => {
    return api.delete<NotificationResponse>(`/notifications/${id}`);
  }
};