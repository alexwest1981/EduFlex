import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // --- FIX: Säker JSON-parsning ---
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            // Kontrollera att det finns data och att det inte är strängen "undefined"
            if (savedUser && savedUser !== "undefined") {
                return JSON.parse(savedUser);
            }
            return null;
        } catch (error) {
            console.error("Kunde inte läsa användardata, rensar...", error);
            localStorage.removeItem('user'); // Rensa trasig data
            return null;
        }
    });
    // --------------------------------

    const [systemSettings, setSystemSettings] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [licenseStatus, setLicenseStatus] = useState('checking');

    // Hantera tema (Ljust/Mörkt)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const API_BASE = 'http://127.0.0.1:8080/api';

    // Effekt som styr CSS-klassen 'dark' på hela sidan
    useEffect(() => {
        const isModuleActive = systemSettings['dark_mode_enabled'] === 'true';

        // Om modulen är avstängd -> Tvinga ljust läge
        if (!isModuleActive) {
            document.documentElement.classList.remove('dark');
            return;
        }

        // Om modulen är på -> Kolla användarens val
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
            const response = await fetch(`${API_BASE}/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const settingsMap = {};
                if (Array.isArray(data)) {
                    data.forEach(s => settingsMap[s.settingKey] = s.settingValue);
                } else {
                    Object.assign(settingsMap, data);
                }
                setSystemSettings(settingsMap);
            }
        } catch (e) { console.error("Kunde inte hämta inställningar"); }
    };

    // --- NY FUNKTION: Uppdatera användardata live ---
    const refreshUser = async () => {
        if (currentUser) {
            try {
                const updatedUser = await api.users.getById(currentUser.id);
                setCurrentUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Spara även i LS
            } catch (e) {
                console.error("Kunde inte uppdatera användare", e);
            }
        }
    };
    // ----------------------------------------------

    const updateSystemSetting = async (key, value) => {
        try {
            setSystemSettings(prev => ({ ...prev, [key]: value }));
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
            fetchSystemSettings();
        }
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

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value = {
        token, currentUser, systemSettings, notifications, licenseStatus, API_BASE,
        theme, toggleTheme,
        setLicenseStatus, login, logout, markNotificationAsRead, fetchSystemSettings,
        updateSystemSetting, refreshUser // <--- Exponera refreshUser här
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};