import api from './api';
import { CalendarEvent, ApiResponse } from '../types';

export const calendarService = {
    /**
     * Get all events
     */
    getAllEvents: async (): Promise<CalendarEvent[]> => {
        const response = await api.get<CalendarEvent[]>('/events');
        return response.data;
    },

    /**
     * Get today's schedule (events for current date)
     */
    getTodaySchedule: async (): Promise<CalendarEvent[]> => {
        const today = new Date().toISOString().split('T')[0];
        const response = await api.get<CalendarEvent[]>('/events', {
            params: { date: today },
        });
        return response.data;
    },

    /**
     * Create an event
     */
    createEvent: async (eventData: Partial<CalendarEvent>): Promise<{ id: number; message: string }> => {
        const response = await api.post<{ id: number; message: string }>('/events', eventData);
        return response.data;
    },

    /**
     * Delete an event
     */
    deleteEvent: async (eventId: number): Promise<void> => {
        await api.delete(`/events/${eventId}`);
    },

    /**
     * Update event status
     */
    updateEventStatus: async (eventId: number, status: string): Promise<{ id: number; status: string; message: string }> => {
        const response = await api.patch<{ id: number; status: string; message: string }>(`/events/${eventId}/status`, { status });
        return response.data;
    },
};
