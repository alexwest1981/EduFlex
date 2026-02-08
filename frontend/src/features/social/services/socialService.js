import { api } from '../../../services/api';

const SOCIAL_API = '/social/comments';

export const socialService = {
    /**
     * Get comments for a specific target
     * @param {string} targetType - COURSE, LESSON, etc.
     * @param {string} targetId - ID of the target
     */
    getComments: async (targetType, targetId) => {
        return api.get(`${SOCIAL_API}/${targetType}/${targetId}`);
    },

    /**
     * Add a new comment or reply
     * @param {string} content
     * @param {string} targetType
     * @param {string} targetId
     * @param {number|null} parentId - Optional parent ID for replies
     */
    addComment: async (content, targetType, targetId, parentId = null) => {
        return api.post(SOCIAL_API, {
            content,
            targetType,
            targetId,
            parentId
        });
    },

    /**
     * Delete a comment
     * @param {number} commentId
     */
    deleteComment: async (commentId) => {
        return api.delete(`${SOCIAL_API}/${commentId}`);
    },

    /**
     * Like a comment
     * @param {number} commentId
     */
    likeComment: async (commentId) => {
        return api.post(`${SOCIAL_API}/${commentId}/like`);
    }
};
