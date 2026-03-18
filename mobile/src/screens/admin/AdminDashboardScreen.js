import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Users, BookOpen, Activity, Settings, ChevronRight, AlertTriangle, Database, Shield } from 'lucide-react-native';
import { useGetAllUsersQuery, useGetSystemHealthQuery, useGetDataIntegrityQuery } from '../../store/slices/apiSlice';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
    const { data: users } = useGetAllUsersQuery();
    const { data: health } = useGetSystemHealthQuery();
    const { data: integrity } = useGetDataIntegrityQuery();

    const usersCount = users?.content?.length || (Array.isArray(users) ? users.length : 0);

    const stats = [
        { label: 'Användare', value: usersCount, icon: <Users color="#00F5FF" size={20} />, screen: 'Users' },
        { label: 'Systemhälsa', value: health?.status === 'UP' ? 'OK' : (health?.status || 'Laddar...'), icon: <Activity color="#00F5FF" size={20} />, screen: 'OpsCenter' },
        { label: 'Integritet', value: integrity?.orphanedStudentCount || 0, icon: <Shield color="#00F5FF" size={20} />, screen: 'OpsCenter' },
        { label: 'Kurser', value: integrity?.totalCourses || 0, icon: <BookOpen color="#00F5FF" size={20} />, screen: 'GlobalLibrary' },
    ];

    const quickActions = [
        { title: 'Användarkontroll', desc: 'Hantera roller och konton', icon: <Users color="#fff" size={24} />, color: '#4f46e5', screen: 'Users' },
        { title: 'Systemstatus', desc: 'Övervaka microservices', icon: <Database color="#fff" size={24} />, color: '#0891b2', screen: 'OpsCenter' },
        { title: 'Resursbank', desc: 'Globalt materialarkiv', icon: <BookOpen color="#fff" size={24} />, color: '#059669', screen: 'GlobalLibrary' },
        { title: 'Inställningar', desc: 'Systemkonfiguration', icon: <Settings color="#fff" size={24} />, color: '#4b5563', screen: 'Settings' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Admin Kontrollpanel</Text>
                <Text style={styles.subtitle}>EduFlex LMS Management</Text>
            </View>

            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.statCard}
                        onPress={() => navigation.navigate(stat.screen)}
                    >
                        <View style={styles.statHeader}>
                            {stat.icon}
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                        <Text style={styles.statValue}>{stat.value}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Snabbval</Text>
            <View style={styles.actionsGrid}>
                {quickActions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.actionCard, { backgroundColor: action.color }]}
                        onPress={() => navigation.navigate(action.screen)}
                    >
                        <View style={styles.actionIcon}>{action.icon}</View>
                        <View>
                            <Text style={styles.actionTitle}>{action.title}</Text>
                            <Text style={styles.actionDesc}>{action.desc}</Text>
                        </View>
                        <ChevronRight color="rgba(255,255,255,0.5)" size={20} style={styles.chevron} />
                    </TouchableOpacity>
                ))}
            </View>

            {integrity?.orphanedStudentCount > 0 && (
                <View style={styles.alertCard}>
                    <AlertTriangle color="#ff4444" size={24} />
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Systemvarning</Text>
                        <Text style={styles.alertDesc}>{integrity.orphanedStudentCount} föräldralösa studentposter hittades i databasen.</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f1012' },
    content: { padding: 20, paddingTop: 60 },
    header: { marginBottom: 24 },
    greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
    statCard: { width: (width - 52) / 2, backgroundColor: '#1a1b1d', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
    statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    statLabel: { color: '#888', fontSize: 12 },
    statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    actionsGrid: { gap: 12 },
    actionCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, gap: 16 },
    actionIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    actionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    actionDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
    chevron: { marginLeft: 'auto' },
    alertCard: { marginTop: 32, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,68,68,0.1)', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,68,68,0.2)', gap: 16 },
    alertContent: { flex: 1 },
    alertTitle: { color: '#ff4444', fontWeight: 'bold', fontSize: 16 },
    alertDesc: { color: 'rgba(255,68,68,0.8)', fontSize: 13, marginTop: 2 }
});

export default AdminDashboardScreen;
