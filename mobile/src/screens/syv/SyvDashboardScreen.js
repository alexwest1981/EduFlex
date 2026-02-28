import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGetUserQuery } from '../../store/slices/apiSlice';
import { Users, Compass, BookOpen, AlertCircle } from 'lucide-react-native';

const SyvDashboardScreen = () => {
    const { data: user } = useGetUserQuery();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hej {user?.firstName || 'SYV'}!</Text>
                <Text style={styles.subtitle}>Studie- och Yrkesvägledning</Text>
            </View>

            <View style={styles.alertCard}>
                <View style={styles.cardHeader}>
                    <AlertCircle color="#FBBF24" size={24} />
                    <Text style={styles.alertCardTitle}>Bokade Möten</Text>
                </View>
                <Text style={styles.cardText}>
                    Du har 3 inbokade vägledningssamtal idag.
                </Text>
                <TouchableOpacity style={styles.lightButton}>
                    <Text style={styles.lightButtonText}>Visa Kalender</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={[styles.statBox, { borderColor: '#b14bff' }]}>
                    <Users color="#aaa" size={20} />
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Möten (Veckan)</Text>
                </View>
                <View style={styles.statBox}>
                    <Compass color="#aaa" size={20} />
                    <Text style={styles.statValue}>85%</Text>
                    <Text style={styles.statLabel}>Gymnasieval Klara</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Snabblänkar</Text>
            <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={styles.actionIconContainer}><BookOpen color="#00F5FF" size={20} /></View>
                    <Text style={styles.actionText}>Programkatalog</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={styles.actionIconContainer}><Users color="#00F5FF" size={20} /></View>
                    <Text style={styles.actionText}>Elevlistor</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { marginBottom: 24 },
    greeting: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
    alertCard: { backgroundColor: 'rgba(251, 191, 36, 0.1)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)', borderRadius: 16, padding: 20, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    alertCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FBBF24' },
    cardText: { fontSize: 14, color: '#ccc', lineHeight: 22, marginBottom: 16 },
    lightButton: { backgroundColor: 'rgba(251, 191, 36, 0.2)', padding: 12, borderRadius: 8, alignItems: 'center' },
    lightButtonText: { color: '#FBBF24', fontWeight: 'bold' },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    statBox: { flex: 1, backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
    statLabel: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    actionGrid: { flexDirection: 'row', gap: 12 },
    actionItem: { flex: 1, backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333', gap: 12 },
    actionIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(0, 245, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
    actionText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
});

export default SyvDashboardScreen;
