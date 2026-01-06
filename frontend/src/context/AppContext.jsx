import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    // NYTT: Håller globala inställningar (t.ex. site_name)
    const [systemSettings, setSystemSettings] = useState({});

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [licenseStatus, setLicenseStatus] = useState('checking');

    // Bas-URL för API (används av ChatModule m.m.)
    const API_BASE = 'http://127.0.0.1:8080/api';

    // Ladda användare & inställningar vid start
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Kunde inte läsa användardata", e);
                localStorage.removeItem('user');
            }
        }
        checkLicense();
        loadSettings(); // <--- Hämta sidans namn m.m.
    }, []);

    // Hantera Mörkt läge
    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Hämta inställningar från Backend
    const loadSettings = async () => {
        try {
            const settings = await api.settings.getAll();
            setSystemSettings(settings || {});

            // Uppdatera webbläsarflikens titel direkt
            if(settings && settings.site_name) {
                document.title = settings.site_name;
            }
        } catch (e) {
            console.error("Kunde inte hämta inställningar", e);
        }
    };

    // Uppdatera inställningar live (utan omladdning)
    const updateSystemSetting = (key, value) => {
        setSystemSettings(prev => ({ ...prev, [key]: value }));
        if (key === 'site_name') document.title = value;
    };

    const checkLicense = async () => {
        try {
            // Här kan du lägga till riktig licenskontroll senare
            setLicenseStatus('active');
        } catch (e) {
            setLicenseStatus('error');
        }
    };

    const login = (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        loadSettings(); // Ladda om inställningar vid inloggning för säkerhets skull
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
    };

    const refreshUser = async () => {
        if(!currentUser) return;
        try {
            const updated = await api.users.getById(currentUser.id);
            // Slå ihop befintlig data (som token) med ny data
            const merged = { ...currentUser, ...updated };
            localStorage.setItem('user', JSON.stringify(merged));
            setCurrentUser(merged);
        } catch (e) { console.error(e); }
    };

    return (
        <AppContext.Provider value={{
            currentUser,
            login,
            logout,
            refreshUser,
            systemSettings,      // <--- Nu tillgänglig i hela appen
            loadSettings,
            updateSystemSetting, // <--- För att ändra namn live
            theme,
            toggleTheme,
            licenseStatus,
            API_BASE,
            api
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);