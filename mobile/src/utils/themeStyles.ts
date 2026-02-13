import { StyleSheet } from 'react-native';
import { MobileThemeConfig, parseBorderRadius } from './themeDefinitions';

/**
 * Generate dynamic styles based on current theme
 */
export const createThemedStyles = (theme: MobileThemeConfig) => {
    const borderRadius = parseBorderRadius(theme.borderRadius);

    return StyleSheet.create({
        // Container styles
        container: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
        },

        // Card styles
        card: {
            backgroundColor: theme.backgroundColor === '#FFFFFF' || theme.backgroundColor === '#F9F9F9'
                ? '#FFFFFF'
                : 'rgba(255, 255, 255, 0.05)',
            borderRadius: Math.min(borderRadius, 16),
            padding: 16,
            marginBottom: 12,
            ...(theme.componentDepth === 'shadow' && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }),
            ...(theme.componentDepth === 'floating' && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 5,
            }),
            ...(theme.glassmorphism && {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
            }),
        },

        // Button styles
        primaryButton: {
            backgroundColor: theme.activeColor,
            borderRadius: Math.min(borderRadius / 2, 12),
            paddingVertical: 12,
            paddingHorizontal: 24,
            alignItems: 'center',
            justifyContent: 'center',
            ...(theme.componentDepth === 'shadow' && {
                shadowColor: theme.activeColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
            }),
        },

        secondaryButton: {
            backgroundColor: theme.inactiveColor,
            borderRadius: Math.min(borderRadius / 2, 12),
            paddingVertical: 12,
            paddingHorizontal: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Text styles
        primaryText: {
            color: theme.backgroundColor === '#FFFFFF' || theme.backgroundColor === '#F9F9F9'
                ? '#111827'
                : '#FFFFFF',
            fontSize: 16,
        },

        secondaryText: {
            color: theme.inactiveColor,
            fontSize: 14,
        },

        headingText: {
            color: theme.backgroundColor === '#FFFFFF' || theme.backgroundColor === '#F9F9F9'
                ? '#111827'
                : '#FFFFFF',
            fontSize: 24,
            fontWeight: 'bold',
        },

        // Tab bar styles
        tabBar: {
            backgroundColor: theme.backgroundColor,
            borderTopWidth: 1,
            borderTopColor: theme.backgroundColor === '#FFFFFF' || theme.backgroundColor === '#F9F9F9'
                ? '#E5E7EB'
                : 'rgba(255, 255, 255, 0.1)',
            ...(theme.glassmorphism && {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
            }),
        },

        activeTab: {
            color: theme.activeColor,
        },

        inactiveTab: {
            color: theme.inactiveColor,
        },

        // Input styles
        input: {
            backgroundColor: theme.backgroundColor === '#FFFFFF' || theme.backgroundColor === '#F9F9F9'
                ? '#F3F4F6'
                : 'rgba(255, 255, 255, 0.05)',
            borderRadius: Math.min(borderRadius / 2, 12),
            paddingVertical: 12,
            paddingHorizontal: 16,
            color: theme.backgroundColor === '#FFFFFF' || theme.backgroundColor === '#F9F9F9'
                ? '#111827'
                : '#FFFFFF',
            borderWidth: 1,
            borderColor: theme.backgroundColor === '#FFFFFF' || theme.backgroundColor === '#F9F9F9'
                ? '#D1D5DB'
                : 'rgba(255, 255, 255, 0.1)',
        },

        // Badge/Chip styles
        badge: {
            backgroundColor: theme.activeColor,
            borderRadius: borderRadius === 9999 ? 9999 : Math.min(borderRadius / 3, 8),
            paddingVertical: 4,
            paddingHorizontal: 12,
        },

        badgeText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
        },
    });
};

const isDarkBg = (bg: string) =>
    bg !== '#FFFFFF' && bg !== '#F9F9F9' && bg !== '#ffffff';

/**
 * Get theme-aware colors (extended for dashboard components)
 */
export const getThemeColors = (theme: MobileThemeConfig) => {
    const dark = isDarkBg(theme.backgroundColor);

    return {
        background: theme.backgroundColor,
        primary: theme.activeColor,
        secondary: theme.inactiveColor,
        text: dark ? '#FFFFFF' : '#111827',
        textSecondary: theme.inactiveColor,
        textMuted: dark ? '#94a3b8' : '#9CA3AF',
        border: dark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
        card: dark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',

        // Surface / glass
        surface: dark ? '#161c2c' : '#F9FAFB',
        surfaceGlass: dark ? 'rgba(22, 28, 44, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        glassBorder: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',

        // Gradients
        gradientStart: theme.activeColor,
        gradientEnd: dark ? '#0a3ad8' : '#3730a3',

        // Status colors
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',

        // Dark mode awareness
        isDark: dark,
    };
};
