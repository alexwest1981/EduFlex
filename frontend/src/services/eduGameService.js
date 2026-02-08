import { api } from './api';

const eduGameService = {
    // --- SHOP ---
    getShopItems: async () => {
        return api.shop.getItems();
    },

    buyItem: async (itemId) => {
        return api.shop.buyItem(itemId);
    },

    equipItem: async (itemId) => {
        return api.shop.equipItem(itemId);
    },

    unequipItem: async (type) => {
        return api.shop.unequipItem(type);
    },

    getMyInventory: async () => {
        return api.shop.getInventory();
    },

    // --- QUESTS ---
    getDailyQuests: async () => {
        return api.gamification.getQuests('daily');
    },

    // --- SOCIAL ---
    getFriends: async () => {
        return api.gamification.social.getFriends();
    },

    sendFriendRequest: async (targetUserId) => {
        return api.gamification.social.sendRequest(targetUserId);
    },

    getPendingRequests: async () => {
        return api.gamification.social.getPendingRequests();
    },

    acceptFriendRequest: async (requestId) => {
        return api.gamification.social.acceptRequest(requestId);
    }
};

export default eduGameService;
