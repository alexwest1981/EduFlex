import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiClient';
import { registerForPushNotificationsAsync } from '../utils/notificationService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const updateDevicePushToken = async () => {
        try {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                console.log('[AuthContext] Registering push token with backend:', token);
                await api.post('/users/update-push-token', { token });
            }
        } catch (e) {
            console.warn('[AuthContext] Could not update push token:', e.message);
        }
    };

    const login = async (username, password) => {
        setIsLoading(true);
        console.log('[AuthContext] Attempting login for:', username);
        try {
            const response = await api.post('/auth/login', { username, password });
            console.log('[AuthContext] Login response status:', response.status);

            // Hämta token från svaret
            const token = response.data.token || response.data;
            console.log('[AuthContext] Token received:', !!token);

            if (!token || typeof token !== 'string') {
                throw new Error('Inget giltigt token mottogs från servern.');
            }

            // Spara token direkt – navigeringen sker när userToken sätts
            setUserToken(token);
            await AsyncStorage.setItem('userToken', token);
            console.log('[AuthContext] Token saved to storage');

            // Uppdatera push token direkt efter inloggning
            updateDevicePushToken();

            // Hämta användarinfo separat
            try {
                console.log('[AuthContext] Fetching user profile...');
                const userResp = await api.get('/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('[AuthContext] User profile received! Full data:', JSON.stringify(userResp.data));
                setUserInfo(userResp.data);
            } catch (userErr) {
                console.warn('[AuthContext] Could not fetch user during login:', userErr.message);
            }

        } catch (e) {
            console.error(`[AuthContext] Login error: ${e.message}`);
            alert('Inloggning misslyckades. Kontrollera dina uppgifter.');
        }
        setIsLoading(false);
        console.log('[AuthContext] Login flow complete');
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        await AsyncStorage.removeItem('userToken');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
            if (token) {
                // Skicka token explicit – interceptorn hinner inte sätta headern i tid vid app-start
                const userResp = await api.get('/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserInfo(userResp.data);

                // Uppdatera även push token vid session-återställning
                updateDevicePushToken();
            }
            setIsLoading(false);
        } catch (e) {
            console.error(`isLoggedIn error: ${e}`);
            setUserToken(null);
            setUserInfo(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo, setUserInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
