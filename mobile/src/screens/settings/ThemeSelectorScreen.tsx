import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MobileThemeConfig, parseBorderRadius } from '../../utils/themeDefinitions';
import { useNavigation } from '@react-navigation/native';

const ThemeSelectorScreen: React.FC = () => {
    const { currentTheme, availableThemes, setTheme, isLoading } = useTheme();
    const navigation = useNavigation();

    const handleSelectTheme = async (themeId: string) => {
        console.log('🎨 Selecting theme:', themeId);
        await setTheme(themeId);
        console.log('✅ Theme set to:', themeId);
    };

    const renderThemeCard = (theme: MobileThemeConfig) => {
        const isSelected = currentTheme.id === theme.id;
        const borderRadiusValue = parseBorderRadius(theme.borderRadius);

        return (
            <TouchableOpacity
                key={theme.id}
                style={[
                    styles.themeCard,
                    isSelected && styles.selectedCard,
                ]}
                onPress={() => handleSelectTheme(theme.id)}
                activeOpacity={0.7}
            >
                {/* Theme Preview */}
                <View
                    style={[
                        styles.themePreview,
                        {
                            backgroundColor: theme.backgroundColor,
                            borderRadius: Math.min(borderRadiusValue / 2, 20),
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.previewElement,
                            {
                                backgroundColor: theme.activeColor,
                                borderRadius: Math.min(borderRadiusValue / 3, 12),
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.previewElement,
                            {
                                backgroundColor: theme.inactiveColor,
                                borderRadius: Math.min(borderRadiusValue / 3, 12),
                                opacity: 0.6,
                            },
                        ]}
                    />
                </View>

                {/* Theme Info */}
                <View style={styles.themeInfo}>
                    <Text style={styles.themeName}>{theme.name}</Text>
                    <Text style={styles.themeDescription}>{theme.description}</Text>

                    {/* Theme Details */}
                    <View style={styles.themeDetails}>
                        <View style={styles.detailBadge}>
                            <Text style={styles.detailText}>{theme.animationPreset}</Text>
                        </View>
                        <View style={styles.detailBadge}>
                            <Text style={styles.detailText}>{theme.componentDepth}</Text>
                        </View>
                        {theme.glassmorphism && (
                            <View style={[styles.detailBadge, styles.glassBadge]}>
                                <Text style={styles.detailText}>Glass</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Selection Indicator */}
                {isSelected && (
                    <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedText}>✓</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Laddar teman...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Välj Tema</Text>
                <Text style={styles.subtitle}>
                    Anpassa utseendet på din mobilapp
                </Text>
            </View>

            <View style={styles.themesContainer}>
                {availableThemes.map(theme => renderThemeCard(theme))}
            </View>

            {availableThemes.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Inga teman tillgängliga</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    contentContainer: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    themesContainer: {
        gap: 16,
    },
    themeCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedCard: {
        borderColor: '#4f46e5',
        backgroundColor: '#eef2ff',
    },
    themePreview: {
        height: 120,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    previewElement: {
        width: 60,
        height: 60,
    },
    themeInfo: {
        gap: 8,
    },
    themeName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    themeDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    themeDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    detailBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    glassBadge: {
        backgroundColor: '#dbeafe',
    },
    detailText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
    },
});

export default ThemeSelectorScreen;
