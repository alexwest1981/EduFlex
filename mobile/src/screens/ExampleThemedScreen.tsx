import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createThemedStyles, getThemeColors } from '../utils/themeStyles';

/**
 * Example of a themed screen
 * This demonstrates how to use the theme system in your screens
 */
const ExampleThemedScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const themedStyles = createThemedStyles(currentTheme);
    const colors = getThemeColors(currentTheme);

    return (
        <ScrollView style={[themedStyles.container, styles.scrollView]}>
            <View style={styles.content}>
                {/* Header */}
                <Text style={themedStyles.headingText}>Themed Screen Example</Text>
                <Text style={[themedStyles.secondaryText, styles.subtitle]}>
                    This screen adapts to the selected theme
                </Text>

                {/* Card Example */}
                <View style={[themedStyles.card, styles.card]}>
                    <Text style={themedStyles.primaryText}>This is a themed card</Text>
                    <Text style={themedStyles.secondaryText}>
                        The background, text colors, and shadows change based on your theme
                    </Text>
                </View>

                {/* Button Examples */}
                <TouchableOpacity style={themedStyles.primaryButton}>
                    <Text style={styles.buttonText}>Primary Button</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[themedStyles.secondaryButton, styles.marginTop]}>
                    <Text style={styles.buttonText}>Secondary Button</Text>
                </TouchableOpacity>

                {/* Badge Example */}
                <View style={styles.badgeContainer}>
                    <View style={themedStyles.badge}>
                        <Text style={themedStyles.badgeText}>Badge</Text>
                    </View>
                </View>

                {/* Theme Info */}
                <View style={[themedStyles.card, styles.card]}>
                    <Text style={themedStyles.primaryText}>Current Theme:</Text>
                    <Text style={[themedStyles.primaryText, styles.themeName]}>
                        {currentTheme.name}
                    </Text>
                    <Text style={themedStyles.secondaryText}>{currentTheme.description}</Text>

                    <View style={styles.colorRow}>
                        <View style={[styles.colorSwatch, { backgroundColor: '#4F46E5' }]} />
                        <Text style={themedStyles.secondaryText}>Primary Color</Text>
                    </View>

                    <View style={styles.colorRow}>
                        <View style={[styles.colorSwatch, { backgroundColor: '#9CA3AF' }]} />
                        <Text style={themedStyles.secondaryText}>Secondary Color</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    subtitle: {
        marginTop: 8,
        marginBottom: 24,
    },
    card: {
        marginBottom: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    marginTop: {
        marginTop: 12,
    },
    badgeContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 16,
    },
    themeName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    colorSwatch: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 12,
    },
});

export default ExampleThemedScreen;
