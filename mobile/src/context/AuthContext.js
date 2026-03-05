import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const login = async (username, password) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });

            // Hämta token från svaret
            const token = response.data.token || response.data;

            if (!token || typeof token !== 'string') {
                throw new Error('Inget giltigt token mottogs från servern.');
            }

            // Spara token direkt – navigeringen sker när userToken sätts
            setUserToken(token);
            await AsyncStorage.setItem('userToken', token);

            // Hämta användarinfo separat – om det misslyckas klarar vi oss ändå
            try {
                const userResp = await api.get('/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserInfo(userResp.data);
            } catch (userErr) {
                console.warn('Kunde inte hämta användarinfo, försöker igen efter navigering:', userErr);
            }

        } catch (e) {
            console.error(`Login error: ${e}`);
            alert('Inloggning misslyckades. Kontrollera dina uppgifter.');
        }
        setIsLoading(false);
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
                const userResp = await api.get('/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserInfo(userResp.data);
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
