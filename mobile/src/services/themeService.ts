import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../utils/constants';

const THEME_STORAGE_KEY = '@eduflex_mobile_theme';

export interface MobileThemeSettings {
    backgroundColor: string;
    activeColor: string;
    inactiveColor: string;
    glassmorphism: boolean;
    borderRadius: string;
    animationPreset: string;
    componentDepth: string;
    enabledThemes?: string[];
}

/**
 * Fetch mobile themes from backend
 */
export const fetchMobileThemes = async (): Promise<MobileThemeSettings> => {
    try {
        const response = await fetch(`${API_BASE}/api/branding/mobile-themes`);

        if (!response.ok) {
            throw new Error('Failed to fetch mobile themes');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching mobile themes:', error);

        // Return default configuration if API fails
        return {
            backgroundColor: '#111827',
            activeColor: '#f59e0b',
            inactiveColor: '#9ca3af',
            glassmorphism: false,
            borderRadius: '24px',
            animationPreset: 'bouncy',
            componentDepth: 'floating',
            enabledThemes: ['finsights-dark', 'cosmic-growth', 'eduflex-fresh']
        };
    }
};

/**
 * Get current theme ID from storage
 */
export const getCurrentThemeId = async (): Promise<string> => {
    try {
        const themeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        return themeId || 'eduflex-fresh'; // Default theme
    } catch (error) {
        console.error('Error getting current theme:', error);
        return 'eduflex-fresh';
    }
};

/**
 * Save theme ID to storage
 */
export const saveThemeId = async (themeId: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (error) {
        console.error('Error saving theme:', error);
    }
};
