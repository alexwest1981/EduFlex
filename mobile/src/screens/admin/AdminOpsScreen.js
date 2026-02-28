import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Server, Activity, Database, Cloud } from 'lucide-react-native';

const AdminOpsScreen = () => {
    const [refreshing, setRefreshing] = useState(false);

    // Mock data for system status
    const services = [
        { id: 1, name: 'Core API (WSL)', status: 'online', icon: <Server color="#00F5FF" size={24} /> },
        { id: 2, name: 'PostgreSQL DB', status: 'online', icon: <Database color="#00F5FF" size={24} /> },
        { id: 3, name: 'Redis Cache', status: 'online', icon: <Activity color="#00F5FF" size={24} /> },
        { id: 4, name: 'MinIO Storage', status: 'online', icon: <Cloud color="#00F5FF" size={24} /> }
    ];

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F5FF" />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>System Ops</Text>
                <Text style={styles.subtitle}>Övervaka systemhälsa och tjänster.</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>CPU Lasta</Text>
                    <Text style={styles.statValue}>12%</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Minne</Text>
                    <Text style={styles.statValue}>4.2 GB</Text>
                </View>
                <View style={[styles.statBox, { borderColor: '#00F5FF' }]}>
                    <Text style={styles.statLabel}>Sync Kö</Text>
                    <Text style={[styles.statValue, { color: '#00F5FF' }]}>0 Ligger</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Tjänster</Text>

            {services.map(s => (
                <View key={s.id} style={styles.serviceCard}>
                    <View style={styles.serviceIcon}>{s.icon}</View>
                    <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{s.name}</Text>
                        <Text style={[styles.serviceStatus, s.status === 'online' ? { color: '#10b981' } : { color: '#ff4444' }]}>
                            {s.status.toUpperCase()}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionText}>Starta om</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <TouchableOpacity style={styles.dangerBtn}>
                <Text style={styles.dangerText}>Force Sync Background Queue</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { marginBottom: 24 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
    grid: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    statBox: { flex: 1, backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
    statLabel: { color: '#888', fontSize: 12, marginBottom: 8 },
    statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 16 },
    serviceIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0, 245, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    serviceInfo: { flex: 1 },
    serviceName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    serviceStatus: { fontSize: 13, marginTop: 4 },
    actionBtn: { padding: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 8 },
    actionText: { color: '#fff', fontSize: 12 },
    dangerBtn: { marginTop: 20, marginBottom: 60, padding: 16, backgroundColor: 'rgba(255, 68, 68, 0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)', alignItems: 'center' },
    dangerText: { color: '#ff4444', fontWeight: 'bold' }
});

export default AdminOpsScreen;
