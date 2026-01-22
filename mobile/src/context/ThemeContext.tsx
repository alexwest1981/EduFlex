import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { MobileThemeConfig, MOBILE_THEMES, getThemeById, getDefaultTheme } from '../utils/themeDefinitions';
import { fetchMobileThemes, getCurrentThemeId, saveThemeId } from '../services/themeService';

interface ThemeContextType {
    currentTheme: MobileThemeConfig;
    availableThemes: MobileThemeConfig[];
    setTheme: (themeId: string) => Promise<void>;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<MobileThemeConfig>(getDefaultTheme());
    const [availableThemes, setAvailableThemes] = useState<MobileThemeConfig[]>(MOBILE_THEMES);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeTheme();
    }, []);

    const initializeTheme = async () => {
        try {
            // Fetch enabled themes from backend
            const themeSettings = await fetchMobileThemes();

            // Filter available themes based on enabledThemes from backend
            if (themeSettings.enabledThemes && themeSettings.enabledThemes.length > 0) {
                const enabled = MOBILE_THEMES.filter(theme =>
                    themeSettings.enabledThemes!.includes(theme.id)
                );
                setAvailableThemes(enabled.length > 0 ? enabled : MOBILE_THEMES);
            }

            // Load saved theme ID
            const savedThemeId = await getCurrentThemeId();
            const theme = getThemeById(savedThemeId);

            if (theme) {
                setCurrentTheme(theme);
            }
        } catch (error) {
            console.error('Error initializing theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setTheme = async (themeId: string) => {
        console.log('📝 ThemeContext.setTheme called with:', themeId);
        const theme = getThemeById(themeId);
        if (theme) {
            console.log('🎨 Setting theme to:', theme.name);
            setCurrentTheme(theme);
            await saveThemeId(themeId);
            console.log('💾 Theme saved to AsyncStorage');
        } else {
            console.log('❌ Theme not found:', themeId);
        }
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, availableThemes, setTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
