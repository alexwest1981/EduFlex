import api from './api';
import { Ebook } from '../types';
import { API_URL } from '../utils/constants';

export const ebookService = {
    /**
     * Get all ebooks
     */
    getAllEbooks: async (): Promise<Ebook[]> => {
        const response = await api.get<Ebook[]>('/ebooks');
        return response.data;
    },

    /**
     * Get a single ebook by ID
     */
    getEbook: async (id: number): Promise<Ebook> => {
        const response = await api.get<Ebook>(`/ebooks/${id}`);
        return response.data;
    },

    /**
     * Get the cover image URL for an ebook
     */
    getCoverUrl: (id: number): string => {
        const baseUrl = API_URL.replace(/\/api$/, '');
        return `${baseUrl}/api/ebooks/${id}/cover`;
    },

    /**
     * Search ebooks by query
     */
    searchEbooks: async (query: string): Promise<Ebook[]> => {
        const response = await api.get<Ebook[]>('/ebooks', {
            params: { search: query },
        });
        return response.data;
    },
};
