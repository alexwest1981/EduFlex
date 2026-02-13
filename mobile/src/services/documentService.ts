import api from './api';

export interface UserDocument {
    id: number;
    fileName: string;
    fileType: string;
    fileUrl: string;
    size: number;
    uploadedAt: string;
    category?: string;
    official?: boolean;
    folderId?: number;
}

export interface Folder {
    id: number;
    name: string;
    parentFolder?: { id: number };
    createdAt: string;
    updatedAt: string;
}

export interface FolderContent {
    folders: Folder[];
    documents: UserDocument[];
}

export const documentService = {
    getUserDocuments: async (userId: number): Promise<UserDocument[]> => {
        const response = await api.get<UserDocument[]>(`/documents/user/${userId}`);
        return response.data;
    },

    getRootContent: async (userId: number): Promise<FolderContent> => {
        const response = await api.get<FolderContent>(`/folders/user/${userId}/root`);
        return response.data;
    },

    getFolderContent: async (folderId: number, userId: number): Promise<FolderContent> => {
        const response = await api.get<FolderContent>(`/folders/${folderId}/content`, {
            params: { userId },
        });
        return response.data;
    },

    createFolder: async (userId: number, name: string, parentId?: number): Promise<Folder> => {
        const response = await api.post<Folder>(`/folders/user/${userId}`, { name, parentId });
        return response.data;
    },

    renameFolder: async (folderId: number, name: string): Promise<Folder> => {
        const response = await api.put<Folder>(`/folders/${folderId}/rename`, { name });
        return response.data;
    },

    deleteFolder: async (folderId: number): Promise<void> => {
        await api.delete(`/folders/${folderId}`);
    },

    uploadFile: async (userId: number, file: any, folderId?: number): Promise<UserDocument> => {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            name: file.name || 'upload.bin',
            type: file.mimeType || 'application/octet-stream',
        } as any);

        const url = folderId
            ? `/documents/user/${userId}?folderId=${folderId}`
            : `/documents/user/${userId}`;

        const response = await api.post<UserDocument>(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deleteDocument: async (docId: number): Promise<void> => {
        await api.delete(`/documents/${docId}`);
    },

    getStorageUsage: async (userId: number): Promise<{ used: number; total: number }> => {
        const response = await api.get<{ used: number; total: number }>(`/documents/usage/${userId}`);
        return response.data;
    },

    shareDocument: async (docId: number, targetUserId: number): Promise<void> => {
        await api.post(`/documents/${docId}/share?userId=${targetUserId}`);
    },
};
