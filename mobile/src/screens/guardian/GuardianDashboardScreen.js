import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGetUserQuery } from '../../store/slices/apiSlice';
import { User, Activity, FileText, Bell } from 'lucide-react-native';

const GuardianDashboardScreen = () => {
    const { data: user } = useGetUserQuery();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hej {user?.firstName || 'Vårdnadshavare'}!</Text>
                <Text style={styles.subtitle}>Översikt för dina barn</Text>
            </View>

            <View style={styles.childrenCard}>
                <View style={styles.childHeader}>
                    <View style={styles.avatar}><User color="#fff" size={24} /></View>
                    <View>
                        <Text style={styles.childName}>Lisa (Åk 8)</Text>
                        <Text style={styles.childStatus}>Lektion: Matematik (Aulan)</Text>
                    </View>
                </View>

                <View style={styles.childStats}>
                    <View style={styles.statBox}>
                        <Activity color="#00F5FF" size={16} />
                        <Text style={styles.statText}>Närvaro: 98%</Text>
                    </View>
                    <View style={styles.statBox}>
                        <FileText color="#FBBF24" size={16} />
                        <Text style={styles.statText}>Muntlig redovisning imorgon</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Senaste Meddelanden</Text>
            <View style={styles.alertCard}>
                <View style={styles.cardHeader}>
                    <Bell color="#00F5FF" size={24} />
                    <Text style={styles.alertCardTitle}>FriluftsDag</Text>
                </View>
                <Text style={styles.cardText}>
                    Glöm inte matsäck för fredagens friluftsdag. Samling kl 08:30 vid skogen.
                </Text>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { marginBottom: 24 },
    greeting: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
    childrenCard: { backgroundColor: '#1a1b1d', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 24 },
    childHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    childName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    childStatus: { color: '#888', fontSize: 13, marginTop: 4 },
    childStats: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 16, gap: 12 },
    statBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statText: { color: '#ccc', fontSize: 14 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    alertCard: { backgroundColor: 'rgba(0, 245, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(0, 245, 255, 0.2)', borderRadius: 16, padding: 20, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    alertCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#00F5FF' },
    cardText: { fontSize: 14, color: '#ccc', lineHeight: 22 },
});

export default GuardianDashboardScreen;
