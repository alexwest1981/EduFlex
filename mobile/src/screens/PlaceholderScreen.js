import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const PlaceholderScreen = () => {
    const route = useRoute();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{route.name}</Text>
            <Text style={styles.subtitle}>Detta är en platshållarvy. Offline-stöd kommer att implementeras här.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1012',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00F5FF',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
});

export default PlaceholderScreen;
