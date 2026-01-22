import api from './api';
import { Notification } from '../types';

export const notificationService = {
  /**
   * Get all notifications for a user
   */
  getUserNotifications: async (userId: number): Promise<Notification[]> => {
    const response = await api.get<Notification[]>(`/notifications/user/${userId}`);
    return response.data;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (userId: number): Promise<number> => {
    const response = await api.get<{ count: number }>(`/notifications/user/${userId}/unread-count`);
    return response.data.count;
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (userId: number): Promise<void> => {
    await api.put(`/notifications/user/${userId}/mark-all-read`);
  },
};
