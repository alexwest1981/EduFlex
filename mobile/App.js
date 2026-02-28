import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>EduFlex LLP Mobile</Text>
            <Text style={styles.subtitle}>Connecting you to the future of learning.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1012' },
    title: { color: '#00F5FF', fontSize: 28, fontWeight: 'bold' },
    subtitle: { color: '#888', fontSize: 16, marginTop: 10 }
});

export default App;
