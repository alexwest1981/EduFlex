import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeStyles';

/**
 * Custom hook that returns themed styles
 * Automatically updates when theme changes
 * 
 * Usage:
 * const { colors, styles } = useThemedStyles();
 * <View style={styles.container} />
 * <Text style={{ color: colors.text }}>Hello</Text>
 */
export const useThemedStyles = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);

    // Memoize styles to avoid recreating on every render
    // Only recreate when theme changes
    const styles = useMemo(() => StyleSheet.create({
        // Common container styles
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        containerPadded: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 20,
        },

        // Card styles
        card: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        cardShadow: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },

        // Text styles
        text: {
            color: colors.text,
        },
        textSecondary: {
            color: colors.textSecondary,
        },
        textPrimary: {
            color: colors.primary,
        },

        // Heading styles
        h1: {
            fontSize: 28,
            fontWeight: '700',
            color: colors.text,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
        },

        // Button styles
        button: {
            backgroundColor: colors.primary,
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
        },
        buttonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
        buttonSecondary: {
            backgroundColor: colors.card,
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        buttonSecondaryText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },

        // Input styles
        input: {
            backgroundColor: colors.card,
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.text,
            fontSize: 16,
        },

        // Loading styles
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: colors.textSecondary,
        },

        // List item styles
        listItem: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },

        // Divider
        divider: {
            height: 1,
            backgroundColor: colors.border,
        },

    }), [colors]); // Recreate when colors change

    return {
        colors,
        styles,
    };
};
