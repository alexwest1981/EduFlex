import api from './api';

export interface SupportRequest {
    id: number;
    type: 'CURATOR' | 'NURSE' | 'PSYCHOLOGIST' | 'OTHER';
    subject: string;
    message: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    confidentialityAgreed: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface SickLeave {
    id: number;
    startDate: string;
    endDate?: string;
    reason?: string;
    status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
    createdAt: string;
}

export const wellbeingService = {
    /**
     * Get my support requests
     */
    getMyRequests: async (): Promise<SupportRequest[]> => {
        const response = await api.get<SupportRequest[]>('/wellbeing/requests/my');
        return response.data;
    },

    /**
     * Create a new support request
     */
    createRequest: async (data: {
        type: string;
        subject: string;
        message: string;
        confidentialityAgreed: boolean;
    }): Promise<SupportRequest> => {
        const response = await api.post<SupportRequest>('/wellbeing/requests', data);
        return response.data;
    },

    /**
     * Get active sick leave
     */
    getActiveSickLeave: async (): Promise<SickLeave | null> => {
        try {
            const response = await api.get<SickLeave>('/sick-leave/active');
            return response.data;
        } catch {
            return null;
        }
    },

    /**
     * Get sick leave history
     */
    getMySickLeave: async (): Promise<SickLeave[]> => {
        const response = await api.get<SickLeave[]>('/sick-leave/my');
        return response.data;
    },

    /**
     * Report sick leave
     */
    reportSickLeave: async (data: {
        startDate: string;
        endDate?: string;
        reason?: string;
    }): Promise<SickLeave> => {
        const response = await api.post<SickLeave>('/sick-leave/report', data);
        return response.data;
    },

    /**
     * Cancel sick leave
     */
    cancelSickLeave: async (id: number): Promise<void> => {
        await api.delete(`/sick-leave/${id}`);
    },
};
