/**
 * EXAMPLE: How to use useThemedStyles hook
 * 
 * This file demonstrates the new pattern for themed components.
 * Copy this pattern to any screen that needs theme support.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemedStyles } from './hooks';

const ExampleThemedComponent = () => {
    // Get themed colors and common styles
    const { colors, styles: themedStyles } = useThemedStyles();

    // Create component-specific styles
    // These can use colors directly since they're in component scope
    const styles = StyleSheet.create({
        header: {
            padding: 20,
            backgroundColor: colors.card, // Use colors directly!
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text, // Dynamic color!
        },
        subtitle: {
            fontSize: 14,
            color: colors.textSecondary, // Dynamic color!
            marginTop: 4,
        },
    });

    return (
        <View style={themedStyles.container}>
            {/* Use common themed styles */}
            <View style={themedStyles.card}>
                <Text style={themedStyles.h1}>Using Common Styles</Text>
                <Text style={themedStyles.textSecondary}>This uses pre-defined themed styles</Text>
            </View>

            {/* Use component-specific styles */}
            <View style={styles.header}>
                <Text style={styles.title}>Custom Styles</Text>
                <Text style={styles.subtitle}>These styles are defined in this component</Text>
            </View>

            {/* Use inline styles with colors */}
            <View style={{ backgroundColor: colors.background, padding: 16 }}>
                <Text style={{ color: colors.text }}>Inline Styles</Text>
            </View>

            {/* Combine multiple styles */}
            <TouchableOpacity style={[themedStyles.button, { marginTop: 20 }]}>
                <Text style={themedStyles.buttonText}>Themed Button</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ExampleThemedComponent;
