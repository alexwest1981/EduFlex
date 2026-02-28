import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BrainCircuit, Map as MapIcon, Layers } from 'lucide-react-native';

const EduAiScreen = () => {
    const navigation = useNavigation();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>EduAI Hub</Text>
                <Text style={styles.subtitle}>Din intelligenta läranderesa.</Text>
            </View>

            {/* EduQuest 3D Map Placeholder */}
            <View style={styles.mapContainer}>
                <MapIcon color="#00F5FF" size={48} style={{ marginBottom: 10 }} />
                <Text style={styles.mapTitle}>EduQuest Karta</Text>
                <Text style={styles.mapSubtitle}>(SVG / Skia integration laddas här när online)</Text>
            </View>

            <View style={styles.grid}>
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => navigation.navigate('AiCoach')}
                >
                    <View style={styles.iconContainer}><BrainCircuit color="#b14bff" size={28} /></View>
                    <Text style={styles.gridTitle}>AI-Coach</Text>
                    <Text style={styles.gridSubtitle}>Få personlig hjälp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => navigation.navigate('Flashcards')}
                >
                    <View style={styles.iconContainer}><Layers color="#FBBF24" size={28} /></View>
                    <Text style={styles.gridTitle}>Flashcards</Text>
                    <Text style={styles.gridSubtitle}>Spaced Repetition</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { marginBottom: 24 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
    mapContainer: { backgroundColor: '#1a1b1d', height: 250, borderRadius: 16, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    mapTitle: { color: '#00F5FF', fontSize: 20, fontWeight: 'bold' },
    mapSubtitle: { color: '#888', fontSize: 12, marginTop: 8 },
    grid: { flexDirection: 'row', gap: 16 },
    gridItem: { flex: 1, backgroundColor: '#1a1b1d', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
    iconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    gridTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    gridSubtitle: { color: '#888', fontSize: 12, marginTop: 4, textAlign: 'center' }
});

export default EduAiScreen;
