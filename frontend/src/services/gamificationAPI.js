// Gamification API methods
const API_BASE = '/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const handleResponse = async (response) => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const gamificationAPI = {
    getDailyChallenges: (userId) =>
        fetch(`${API_BASE}/gamification/challenges/daily/${userId}`, {
            headers: getHeaders()
        }).then(handleResponse),

    getLoginStreak: (userId) =>
        fetch(`${API_BASE}/gamification/streak/login/${userId}`, {
            headers: getHeaders()
        }).then(handleResponse),

    updateLoginStreak: (userId) =>
        fetch(`${API_BASE}/gamification/streak/login/${userId}`, {
            method: 'POST',
            headers: getHeaders()
        }).then(handleResponse),

    incrementChallenge: (userId, challengeType) =>
        fetch(`${API_BASE}/gamification/challenges/${userId}/increment`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ challengeType })
        }).then(handleResponse),
};
