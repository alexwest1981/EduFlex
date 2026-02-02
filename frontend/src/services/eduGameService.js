import { api } from './api';

const eduGameService = {
    // --- SHOP ---
    getShopItems: async () => {
        return api.get('/gamification/shop/items');
    },

    buyItem: async (itemId) => {
        return api.post(`/gamification/shop/buy/${itemId}`, {});
    },

    equipItem: async (itemId) => {
        return api.post(`/gamification/shop/equip/${itemId}`, {});
    },

    getMyInventory: async () => {
        return api.get('/gamification/shop/inventory');
    },

    // --- QUESTS ---
    getDailyQuests: async () => {
        return api.get('/gamification/quests/daily');
    },

    // --- SOCIAL ---
    getFriends: async () => {
        return api.get('/gamification/social/friends');
    },

    sendFriendRequest: async (targetUserId) => {
        return api.post(`/gamification/social/request/${targetUserId}`, {});
    },

    getPendingRequests: async () => {
        return api.get('/gamification/social/requests/pending');
    },

    acceptFriendRequest: async (requestId) => {
        return api.post(`/gamification/social/request/${requestId}/accept`, {});
    }
};

export default eduGameService;
