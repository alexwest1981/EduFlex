import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const DashboardScreen = () => {
    const { logout, userInfo } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Välkommen,</Text>
            <Text style={styles.name}>{userInfo ? userInfo.firstName : 'Användare'}!</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>EduFlex Admin</Text>
                <Text style={styles.cardText}>Mobilappen är ansluten till backend. Mer funktionalitet för offline-läge kommer snart.</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={logout}>
                <Text style={styles.buttonText}>Logga ut</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1012',
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        color: '#888',
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 32,
    },
    card: {
        backgroundColor: '#1a1b1d',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 32,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00F5FF',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#aaa',
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#ff4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DashboardScreen;
