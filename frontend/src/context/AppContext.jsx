import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [systemSettings, setSystemSettings] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [licenseStatus, setLicenseStatus] = useState('checking');

    const API_BASE = 'http://127.0.0.1:8080/api';

    useEffect(() => {
        const checkLicense = async () => {
            try {
                const data = await api.system.checkLicense();
                setLicenseStatus(data.status);
            } catch {
                setLicenseStatus('locked');
            }
        };
        checkLicense();
    }, []);

    useEffect(() => {
        if (licenseStatus === 'valid' && token && currentUser) {
            fetchSystemSettings();
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [token, currentUser, licenseStatus]);

    const fetchSystemSettings = async () => {
        try {
            const data = await api.settings.getAll();
            const settingsMap = {};
            data.forEach(s => settingsMap[s.settingKey] = s.settingValue);
            setSystemSettings(settingsMap);
        } catch (e) { console.error("Kunde inte hämta inställningar"); }
    };

    const fetchNotifications = async () => {
        if (!currentUser) return;
        try {
            const data = await api.notifications.getUserNotifs(currentUser.id);
            setNotifications(data);
        } catch {}
    };

    const login = (userData, authToken) => {
        setToken(authToken);
        setCurrentUser(userData);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const markNotificationAsRead = async (id) => {
        try {
            await api.notifications.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch {}
    };

    const value = {
        token, currentUser, systemSettings, notifications, licenseStatus, API_BASE,
        setLicenseStatus, login, logout, markNotificationAsRead, fetchSystemSettings
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};