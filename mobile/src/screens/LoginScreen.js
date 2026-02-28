import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';

const LoginScreen = () => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('123');
    const { login, isLoading } = useContext(AuthContext);

    const handleBiometricAuth = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                alert('Enheten stöder inte biometrisk inloggning.');
                return;
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                alert('Inga biometriska data hittades på enheten.');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Logga in med biometri',
                fallbackLabel: 'Använd lösenord',
            });

            if (result.success) {
                login('admin', '123'); // Simulate stored credential for demonstration
            }
        } catch (e) {
            console.warn('Biometric auth failed', e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>EduFlex LLP</Text>
            <Text style={styles.subtitle}>Logga in på ditt konto</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Användarnamn"
                    placeholderTextColor="#666"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Lösenord"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => login(username, password)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Logga in</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#00F5FF', marginTop: 10 }]}
                    onPress={handleBiometricAuth}
                    disabled={isLoading}
                >
                    <Text style={[styles.buttonText, { color: '#00F5FF' }]}>Logga in med Biometri</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1012',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#00F5FF',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 48,
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: '#1a1b1d',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#00F5FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
