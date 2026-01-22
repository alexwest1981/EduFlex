import api from './api';

export interface Document {
    id: number;
    fileName: string;
    fileType: string;
    fileUrl: string;
    size: number;
    uploadedAt: string;
}

export const documentService = {
    /**
     * Upload a file for a specific user
     */
    uploadFile: async (userId: number, file: any, type: 'IMAGE' | 'FILE' = 'IMAGE'): Promise<Document> => {
        const formData = new FormData();

        // React Native specific FormData structure
        formData.append('file', {
            uri: file.uri,
            name: file.name || 'upload.bin',
            type: file.mimeType || 'application/octet-stream',
        } as any);

        formData.append('title', file.name || 'Mobile Upload');
        formData.append('type', type);

        const response = await api.post<Document>(`/documents/user/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    /**
     * Get documents for a user
     */
    getUserDocuments: async (userId: number): Promise<Document[]> => {
        const response = await api.get<Document[]>(`/documents/user/${userId}`);
        return response.data;
    },

    /**
     * Share (Save) a document to another user's library
     */
    shareDocument: async (docId: number, targetUserId: number): Promise<void> => {
        await api.post(`/documents/${docId}/share?userId=${targetUserId}`);
    }
};
