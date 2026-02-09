import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useBranding } from './BrandingContext';

const ThemeContext = createContext();

// Palettes defined as hex codes. 
// We will verify mapped variables in Tailwind.
const THEMES = {
    default: { // Indigo (Standard)
        id: 'default',
        name: 'Standard (Indigo)',
        colors: {
            50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
            500: '#3b82f6', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
        }
    },
    emerald: {
        id: 'emerald',
        name: 'Professional Emerald',
        colors: {
            50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
            500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22'
        }
    },
    rose: {
        id: 'rose',
        name: 'Executive Rose',
        colors: {
            50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
            500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519'
        }
    },
    amber: {
        id: 'amber',
        name: 'Warm Amber',
        colors: {
            50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
            500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03'
        }
    },
    violet: {
        id: 'violet',
        name: 'Deep Violet',
        colors: {
            50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
            500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065'
        }
    },
    cyan: {
        id: 'cyan',
        name: 'Corporate Cyan',
        colors: {
            50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
            500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344'
        }
    },
    slate: {
        id: 'slate',
        name: 'Minimal Slate',
        colors: {
            50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
            500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617'
        }
    }
};

export const ThemeProvider = ({ children, currentUser }) => {
    const [themeId, setThemeId] = useState('default');
    const { branding, getCustomTheme, loading } = useBranding();

    // Init Logic
    useEffect(() => {
        // Wait for branding to load
        if (loading || !branding) return;

        // PRIORITY 1: Organization-level enforced theme (Enterprise Whitelabel)
        if (branding.enforceOrgTheme) {
            // If custom theme exists, use 'custom', otherwise use org's defaultThemeId
            if (branding.customTheme) {
                setThemeId('custom');
                return;
            } else if (branding.defaultThemeId && THEMES[branding.defaultThemeId]) {
                setThemeId(branding.defaultThemeId);
                return;
            }
        }

        // PRIORITY 2: User preference (if org doesn't enforce theme)
        if (currentUser && currentUser.settings) {
            try {
                const settings = JSON.parse(currentUser.settings);
                if (settings.theme && THEMES[settings.theme]) {
                    setThemeId(settings.theme);
                    return;
                }
            } catch (e) { /* ignore */ }
        }

        // PRIORITY 3: Organization default (if no user preference)
        if (branding.defaultThemeId) {
            if (branding.defaultThemeId === 'custom' && branding.customTheme) {
                setThemeId('custom');
                return;
            }
            if (THEMES[branding.defaultThemeId]) {
                setThemeId(branding.defaultThemeId);
                return;
            }
        }

        // PRIORITY 4: Fallback to localStorage (browsing before login or if all else fails)
        const local = localStorage.getItem('eduflex_theme');
        if (local && THEMES[local]) {
            setThemeId(local);
        }
    }, [currentUser, branding, loading]);

    // Apply Logic
    useEffect(() => {
        const root = document.documentElement;
        let colorsToApply = null;

        // Check if we should use custom theme from organization branding
        if (themeId === 'custom' && branding.customTheme) {
            const customTheme = getCustomTheme();
            if (customTheme && customTheme.colors) {
                colorsToApply = customTheme.colors;
            }
        }

        // Otherwise use predefined theme
        if (!colorsToApply) {
            const theme = THEMES[themeId] || THEMES['default'];
            colorsToApply = theme.colors;
        }

        // Inject CSS variables
        Object.keys(colorsToApply).forEach(shade => {
            root.style.setProperty(`--color-primary-${shade}`, colorsToApply[shade]);
        });

        localStorage.setItem('eduflex_theme', themeId);
    }, [themeId, branding, getCustomTheme]);

    const changeTheme = async (newThemeId) => {
        // Don't allow theme change if organization enforces theme
        if (branding && branding.enforceOrgTheme) {
            console.warn('Theme changes are disabled. Organization enforces a specific theme.');
            return;
        }

        if (!THEMES[newThemeId]) return;
        setThemeId(newThemeId);

        // Persist to backend if logged in
        if (currentUser) {
            try {
                let currentSettings = {};
                try { currentSettings = JSON.parse(currentUser.settings || '{}'); } catch (e) { /* ignore */ }

                const newSettings = { ...currentSettings, theme: newThemeId };
                await api.users.update(currentUser.id, { settings: JSON.stringify(newSettings) });
            } catch (e) {
                console.error("Failed to persist theme to backend", e);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{
            themeId,
            changeTheme,
            themes: Object.values(THEMES),
            isThemeLocked: branding?.enforceOrgTheme || false
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
