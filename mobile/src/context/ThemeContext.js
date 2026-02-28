import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to our current dark theme
    const [themeLoaded, setThemeLoaded] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('@app_theme');
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            } else {
                // If no saved preference, try to use system (though our UI is mostly hardcoded dark right now)
                setIsDarkMode(systemColorScheme === 'dark' || true); // Forcing dark default for the current design
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setThemeLoaded(true);
        }
    };

    const toggleTheme = async () => {
        try {
            const newIsDark = !isDarkMode;
            setIsDarkMode(newIsDark);
            await AsyncStorage.setItem('@app_theme', newIsDark ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    // A simple theme object that components can consume to dynamic style
    const theme = {
        isDark: isDarkMode,
        colors: {
            background: isDarkMode ? '#0f1012' : '#f5f5f5',
            card: isDarkMode ? '#1a1b1d' : '#ffffff',
            text: isDarkMode ? '#ffffff' : '#111827',
            subText: isDarkMode ? '#888888' : '#6b7280',
            border: isDarkMode ? '#333333' : '#e5e7eb',
            primary: '#00F5FF',
            primaryBg: isDarkMode ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 245, 255, 0.2)',
        }
    };

    if (!themeLoaded) return null; // Avoid flicker

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};
