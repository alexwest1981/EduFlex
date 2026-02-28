import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGetUserQuery } from '../../store/slices/apiSlice';
import { ShieldCheck, Calendar, Activity, FileText } from 'lucide-react-native';

const HealthTeamDashboardScreen = () => {
    const { data: user } = useGetUserQuery();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hej {user?.firstName || 'Kurator'}!</Text>
                <Text style={styles.subtitle}>Elevhälsoteam (Sekretessbelagt)</Text>
            </View>

            <View style={styles.alertCard}>
                <View style={styles.cardHeader}>
                    <ShieldCheck color="#10b981" size={24} />
                    <Text style={styles.alertCardTitle}>Säker Anslutning</Text>
                </View>
                <Text style={styles.cardText}>
                    Din inloggning är kopplad till säker och lagstadgad hantering av elevhälsoärenden.
                </Text>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Activity color="#aaa" size={20} />
                    <Text style={styles.statValue}>4</Text>
                    <Text style={styles.statLabel}>Aktiva Ärenden</Text>
                </View>
                <View style={styles.statBox}>
                    <Calendar color="#aaa" size={20} />
                    <Text style={styles.statValue}>2</Text>
                    <Text style={styles.statLabel}>Dagens Möten</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Sekretess</Text>
            <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={styles.actionIconContainer}><FileText color="#10b981" size={20} /></View>
                    <Text style={styles.actionText}>Skapa Journal</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { marginBottom: 24 },
    greeting: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
    alertCard: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: 16, padding: 20, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    alertCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
    cardText: { fontSize: 14, color: '#ccc', lineHeight: 22 },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    statBox: { flex: 1, backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
    statLabel: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    actionGrid: { flexDirection: 'row', gap: 12 },
    actionItem: { flex: 1, backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333', gap: 12 },
    actionIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
    actionText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
});

export default HealthTeamDashboardScreen;
