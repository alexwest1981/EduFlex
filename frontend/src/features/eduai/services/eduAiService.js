import { api } from '../../../services/api';

const eduAiService = {
    getDueCards: () => api.get('/eduai/review/due'),
    getDueCount: () => api.get('/eduai/review/count'),
    submitReview: (cardId, quality) => api.post('/eduai/review/submit', { cardId, quality }),

    getCoachRecommendation: () => api.get('/eduai/coach/recommendation'),
    markRecommendationAsRead: (id) => api.post(`/eduai/coach/read/${id}`)
};

export default eduAiService;
