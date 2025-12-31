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

    // Hantera tema (Ljust/Mörkt)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const API_BASE = 'http://127.0.0.1:8080/api';

    // Effekt som styr CSS-klassen 'dark' på hela sidan
    useEffect(() => {
        const isModuleActive = systemSettings['dark_mode_enabled'] === 'true';

        if (!isModuleActive) {
            document.documentElement.classList.remove('dark');
            return;
        }

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme, systemSettings]);

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
            // Vi använder direkt fetch mot din endpoint
            const response = await fetch(`${API_BASE}/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const settingsMap = {};
                // Hantera både om backend skickar lista eller map
                if (Array.isArray(data)) {
                    data.forEach(s => settingsMap[s.settingKey] = s.settingValue);
                } else {
                    Object.assign(settingsMap, data);
                }
                setSystemSettings(settingsMap);
            }
        } catch (e) { console.error("Kunde inte hämta inställningar"); }
    };

    // --- FUNKTIONEN SOM SAKNADES ---
    const updateSystemSetting = async (key, value) => {
        try {
            // Optimistisk uppdatering i UI
            setSystemSettings(prev => ({ ...prev, [key]: value }));

            // Skicka till backend
            await fetch(`${API_BASE}/settings/${key}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ value: value })
            });
        } catch (error) {
            console.error("Fel vid uppdatering av inställning:", error);
            fetchSystemSettings(); // Rulla tillbaka vid fel
        }
    };
    // -------------------------------

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

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value = {
        token, currentUser, systemSettings, notifications, licenseStatus, API_BASE,
        theme, toggleTheme,
        setLicenseStatus, login, logout, markNotificationAsRead, fetchSystemSettings,
        updateSystemSetting // <--- Exporterad
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};