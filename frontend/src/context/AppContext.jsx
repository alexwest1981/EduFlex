import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import i18n from '../i18n';

const AppContext = createContext({
    currentUser: null,
    systemSettings: {},
    theme: 'light',
    licenseStatus: 'checking',
    licenseLocked: false,
    login: () => { },
    logout: () => { },
    refreshUser: () => { },
    loadSettings: () => { },
    updateSystemSetting: () => { },
    toggleTheme: () => { },
    API_BASE: '',
    token: null,
    api: {},
    activeAudiobook: null,
    setActiveAudiobook: () => { },
    isAudioPlayerMinimized: false,
    setIsAudioPlayerMinimized: () => { }
});

export const AppProvider = ({ children }) => {
    // ... existing code ...
    // (Ensure this part matches existing file content during apply)
    const [currentUser, setCurrentUser] = useState(null);
    const [systemSettings, setSystemSettings] = useState({});
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [licenseStatus, setLicenseStatus] = useState('checking');
    const [licenseLocked, setLicenseLocked] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [activeAudiobook, setActiveAudiobook] = useState(null);
    const [isAudioPlayerMinimized, setIsAudioPlayerMinimized] = useState(false);

    const API_BASE = '/api';

    // 1. Init Effect
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setCurrentUser(userObj);

                if (userObj.id) {
                    refreshUser(userObj.id);
                }
            } catch (e) {
                console.error("Kunde inte läsa användardata", e);
                localStorage.removeItem('user');
            }
        }

        loadSettings();
        checkLicense();

        // Global Event Listener for Lock
        const handleLock = () => setLicenseLocked(true);
        const handleSessionExpired = () => {
            console.warn('[AppContext] Detected expired session event. Performing global logout.');
            logout();
        };

        window.addEventListener('license-lock', handleLock);
        window.addEventListener('session-expired', handleSessionExpired);

        return () => {
            window.removeEventListener('license-lock', handleLock);
            window.removeEventListener('session-expired', handleSessionExpired);
        };

    }, []);

    // 2. Theme Effect
    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const loadSettings = async () => {
        try {
            const settings = await api.settings.getAll();
            setSystemSettings(settings || {});
            if (settings?.site_name) document.title = settings.site_name;

            // Language Logic
            const userLang = currentUser?.language;
            const sysLang = settings?.default_language;

            if (userLang) {
                i18n.changeLanguage(userLang);
            } else if (sysLang) {
                i18n.changeLanguage(sysLang);
            } else {
                i18n.changeLanguage('sv');
            }

        } catch (e) {
            // If locked, getAll() might fail with 402, triggering the listener
            console.error("Settings load failed", e);
        }
    };

    const updateSystemSetting = (key, value) => {
        setSystemSettings(prev => ({ ...prev, [key]: value }));
        if (key === 'site_name') document.title = value;
    };

    const checkLicense = async () => {
        try {
            const res = await api.system.checkLicense();
            if (res && res.status === 'valid') {
                setLicenseStatus('active');
            } else {
                setLicenseStatus('locked'); // soft lock if just expired but not 402'ing yet
            }
        } catch (e) {
            setLicenseStatus('error');
        }
    };

    const login = (user, token, tenantId) => {
        localStorage.setItem('token', token);
        setToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        if (tenantId) {
            // Persist tenantId for api.js to skip hostname check
            localStorage.setItem('force_tenant', tenantId);
        }
        setCurrentUser(user);
        loadSettings();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('force_tenant'); // Clear tenant context
        setCurrentUser(null);

        const sysLang = systemSettings?.default_language || 'sv';
        i18n.changeLanguage(sysLang);
    };

    const refreshUser = async (id) => {
        const uid = id || currentUser?.id;
        if (!uid) return;
        try {
            const updated = await api.users.getById(uid);
            const merged = { ...(currentUser || {}), ...updated };
            localStorage.setItem('user', JSON.stringify(merged));
            setCurrentUser(merged);
        } catch (e) {
            console.error("Failed to refresh user:", e);
            if (e.message && (e.message.includes('401') || e.message.includes('403') || e.message.includes('LICENSE'))) {
                console.warn("Session invalid or license locked, logging out...");
                logout();
            }
        }
    };

    return (
        <AppContext.Provider value={{
            currentUser,
            login,
            logout,
            refreshUser,
            systemSettings,
            loadSettings,
            updateSystemSetting,
            theme,
            toggleTheme,
            licenseStatus,
            licenseLocked,
            API_BASE,
            token,
            api,
            activeAudiobook,
            setActiveAudiobook,
            isAudioPlayerMinimized,
            setIsAudioPlayerMinimized
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        console.error("useAppContext must be used within an AppProvider. Returning default empty context to prevent crash, but app may behave unexpectedly.");
    }
    return context;
};
