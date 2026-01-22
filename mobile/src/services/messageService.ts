import api from './api';
import { Message, PaginatedResponse } from '../types';

export const messageService = {
  /**
   * Get chat history with a user
   */
  getChatHistory: async (
    senderId: number,
    recipientId: number,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Message>> => {
    const response = await api.get<PaginatedResponse<Message>>(
      `/messages/${senderId}/${recipientId}`,
      {
        params: { page, size, sort: 'timestamp,desc' },
      }
    );
    return response.data;
  },

  // ...

  /**
   * Get contacts grouped by category
   */
  getContacts: async (): Promise<Record<string, any[]>> => { // Simplified type, ideally better typed
    const response = await api.get('/messages/contacts');
    return response.data;
  },

  /**
   * Send a message (REST)
   */
  sendMessage: async (message: Partial<Message>): Promise<Message> => {
    const response = await api.post<Message>('/chat/send', message);
    return response.data;
  }
};
