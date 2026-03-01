import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import i18n from '../i18n';

const AppContext = createContext({
    currentUser: null,
    systemSettings: {},
    theme: 'light',
    licenseStatus: 'checking',
    licenseTier: null,
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
    setIsAudioPlayerMinimized: () => { },
    activeCourseId: null,
    setActiveCourseId: () => { }
});

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [systemSettings, setSystemSettings] = useState({});
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [licenseStatus, setLicenseStatus] = useState('checking');
    const [licenseTier, setLicenseTier] = useState(null);
    const [licenseLocked, setLicenseLocked] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [activeAudiobook, setActiveAudiobook] = useState(null);
    const [isAudioPlayerMinimized, setIsAudioPlayerMinimized] = useState(false);
    const [activeCourseId, setActiveCourseId] = useState(null);

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

        const handleLock = () => setLicenseLocked(true);
        const handleSessionExpired = () => {
            console.warn('[AppContext] Detected expired session event. Performing global logout.');
            logout();
        };

        const handleXpUpdated = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed?.id) {
                        api.users.getById(parsed.id).then(updated => {
                            const merged = { ...parsed, ...updated };
                            localStorage.setItem('user', JSON.stringify(merged));
                            setCurrentUser(merged);
                        }).catch(e => console.error("Failed xp refresh", e));
                    }
                } catch (e) { console.warn("LMS refresh failed", e); }
            }
        };

        window.addEventListener('license-lock', handleLock);
        window.addEventListener('session-expired', handleSessionExpired);
        window.addEventListener('xpUpdated', handleXpUpdated);

        return () => {
            window.removeEventListener('license-lock', handleLock);
            window.removeEventListener('session-expired', handleSessionExpired);
            window.removeEventListener('xpUpdated', handleXpUpdated);
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
            // The backend returns { valid: boolean, tier: string }
            // It does NOT return 'status' field directly in the map based on LicenseController.java
            // Let's adapt to what LicenseController actually returns.

            if (res && res.valid === true) {
                setLicenseStatus('valid');
                setLicenseTier(res.tier);
                setLicenseLocked(false);
            } else {
                setLicenseStatus('locked');
                setLicenseTier(null);
                setLicenseLocked(true);
            }
        } catch (e) {
            console.error("License check failed", e);
            // If the check fails (e.g. 500 error), we might want to be lenient or strict.
            // Given the logs show 500 error for heartbeat, let's assume valid if we can't check,
            // OR better, fix the backend error.
            // But to unblock the user now:
            // setLicenseStatus('error');
            // setLicenseLocked(true);

            // Temporary fallback to allow access if check fails due to server error (e.g. during dev)
            // setLicenseStatus('valid');
            // setLicenseLocked(false);

            // Strict mode:
            setLicenseStatus('error');
            setLicenseLocked(true);
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
            licenseTier, // Exposed licenseTier
            licenseLocked,
            API_BASE,
            token,
            api,
            activeAudiobook,
            setActiveAudiobook,
            isAudioPlayerMinimized,
            setIsAudioPlayerMinimized,
            activeCourseId,
            setActiveCourseId
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
