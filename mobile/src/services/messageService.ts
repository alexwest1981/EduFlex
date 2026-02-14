import api from './api';
import { Message, PaginatedResponse } from '../types';

export interface InboxMessage {
  id: number;
  senderId: number;
  senderName: string;
  recipientId: number;
  recipientName: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  folderId?: number;
  folderName?: string;
  parentId?: number;
  attachments?: { id: number; fileName: string; fileUrl: string; fileType: string; size: number }[];
}

export interface Contact {
  id: number;
  fullName: string;
  role: string;
  profilePictureUrl?: string;
}

export const messageService = {
  getChatHistory: async (
    senderId: number,
    recipientId: number,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Message>> => {
    const response = await api.get<PaginatedResponse<Message>>(
      `/messages/${senderId}/${recipientId}`,
      { params: { page, size, sort: 'timestamp,desc' } },
    );
    return response.data;
  },

  getInbox: async (): Promise<InboxMessage[]> => {
    const response = await api.get<InboxMessage[]>('/messages/inbox');
    return response.data;
  },

  getSent: async (): Promise<InboxMessage[]> => {
    const response = await api.get<InboxMessage[]>('/messages/sent');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<number>('/messages/unread');
    return response.data;
  },

  getThread: async (messageId: number): Promise<InboxMessage[]> => {
    const response = await api.get<InboxMessage[]>(`/messages/thread/${messageId}`);
    return response.data;
  },

  markAsRead: async (messageId: number): Promise<void> => {
    await api.put(`/messages/${messageId}/read`);
  },

  markAllAsRead: async (folder?: string): Promise<void> => {
    await api.put('/messages/read-all', null, { params: folder ? { folder } : {} });
  },

  getContacts: async (): Promise<Record<string, Contact[]>> => {
    const response = await api.get('/messages/contacts');
    return response.data;
  },

  sendMessage: async (message: Partial<Message>): Promise<Message> => {
    const response = await api.post<Message>('/chat/send', message);
    return response.data;
  },

  getFolderMessages: async (folder: string): Promise<InboxMessage[]> => {
    const response = await api.get<InboxMessage[]>(`/messages/folder/${folder}`);
    return response.data;
  },
};
