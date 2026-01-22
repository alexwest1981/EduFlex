import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemedStyles } from '../hooks';

/**
 * Simple demo screen showing dynamic theme support
 * Navigate here to see theme changes in action
 */
const ThemeDemoScreen = () => {
    const { colors, styles: themedStyles } = useThemedStyles();

    // Component-specific styles - these will update when theme changes!
    const styles = StyleSheet.create({
        header: {
            padding: 20,
            backgroundColor: colors.card,
            borderBottomWidth: 2,
            borderBottomColor: colors.primary,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: colors.textSecondary,
        },
        colorBox: {
            padding: 16,
            marginBottom: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        colorLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        colorValue: {
            fontSize: 12,
            fontFamily: 'monospace',
            color: colors.textSecondary,
        },
    });

    return (
        <ScrollView style={themedStyles.containerPadded}>
            <View style={styles.header}>
                <Text style={styles.title}>🎨 Theme Demo</Text>
                <Text style={styles.subtitle}>
                    Change theme in Settings to see this screen update!
                </Text>
            </View>

            <View style={{ marginTop: 24 }}>
                <Text style={themedStyles.h2}>Current Theme Colors:</Text>

                <View style={{ marginTop: 16 }}>
                    <View style={[styles.colorBox, { backgroundColor: colors.background }]}>
                        <Text style={styles.colorLabel}>Background</Text>
                        <Text style={styles.colorValue}>{colors.background}</Text>
                    </View>

                    <View style={[styles.colorBox, { backgroundColor: colors.card }]}>
                        <Text style={styles.colorLabel}>Card</Text>
                        <Text style={styles.colorValue}>{colors.card}</Text>
                    </View>

                    <View style={[styles.colorBox, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.colorLabel, { color: '#FFFFFF' }]}>Primary</Text>
                        <Text style={[styles.colorValue, { color: '#FFFFFF' }]}>{colors.primary}</Text>
                    </View>

                    <View style={[styles.colorBox, { backgroundColor: colors.text }]}>
                        <Text style={[styles.colorLabel, { color: colors.background }]}>Text</Text>
                        <Text style={[styles.colorValue, { color: colors.background }]}>{colors.text}</Text>
                    </View>

                    <View style={[styles.colorBox, { backgroundColor: colors.textSecondary }]}>
                        <Text style={[styles.colorLabel, { color: colors.background }]}>Text Secondary</Text>
                        <Text style={[styles.colorValue, { color: colors.background }]}>{colors.textSecondary}</Text>
                    </View>
                </View>

                <View style={themedStyles.card}>
                    <Text style={themedStyles.h3}>Instructions:</Text>
                    <Text style={themedStyles.textSecondary}>
                        1. Go to Profile → Settings → Theme{'\n'}
                        2. Select a different theme{'\n'}
                        3. Come back to this screen{'\n'}
                        4. All colors should have changed!
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default ThemeDemoScreen;
