import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useGetUserQuery, useGetCoursesQuery } from '../../store/slices/apiSlice';
import { Users, BookOpen, AlertCircle, FileText } from 'lucide-react-native';

const TeacherDashboardScreen = () => {
    const { data: user, isLoading: isUserLoading, refetch: refetchUser } = useGetUserQuery();
    const { data: courses, isLoading: isCoursesLoading, refetch: refetchCourses } = useGetCoursesQuery();

    const handleRefresh = () => {
        refetchUser();
        refetchCourses();
    };

    if (isUserLoading && !user) {
        return (
            <View style={styles.centerContainer}>
                <Text style={{ color: '#888' }}>Laddar data...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isUserLoading} onRefresh={handleRefresh} tintColor="#00F5FF" />}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Hej {user?.firstName || 'Lärare'}!</Text>
                <Text style={styles.subtitle}>Din undervisningsöversikt.</Text>
            </View>

            {/* Action Needed Card */}
            <View style={styles.alertCard}>
                <View style={styles.cardHeader}>
                    <AlertCircle color="#ff4444" size={24} />
                    <Text style={styles.alertCardTitle}>Att göra</Text>
                </View>
                <Text style={styles.cardText}>
                    Du har 12 oinkade inlämningar i kursen "Systemutveckling 1".
                </Text>
                <TouchableOpacity style={styles.lightButton}>
                    <Text style={styles.lightButtonText}>Betygsätt nu</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Users color="#aaa" size={20} />
                    <Text style={styles.statValue}>124</Text>
                    <Text style={styles.statLabel}>Elever</Text>
                </View>
                <View style={styles.statBox}>
                    <BookOpen color="#aaa" size={20} />
                    <Text style={styles.statValue}>{courses ? courses.length : 0}</Text>
                    <Text style={styles.statLabel}>Aktiva Kurser</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
            <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={styles.actionIconContainer}><FileText color="#00F5FF" size={20} /></View>
                    <Text style={styles.actionText}>Skapa Upgifft</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={styles.actionIconContainer}><Users color="#00F5FF" size={20} /></View>
                    <Text style={styles.actionText}>Hantera Klasser</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { marginBottom: 24 },
    greeting: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
    alertCard: { backgroundColor: 'rgba(255, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)', borderRadius: 16, padding: 20, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    alertCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#ff4444' },
    cardText: { fontSize: 14, color: '#ccc', lineHeight: 22, marginBottom: 16 },
    lightButton: { backgroundColor: 'rgba(255, 68, 68, 0.2)', padding: 12, borderRadius: 8, alignItems: 'center' },
    lightButtonText: { color: '#ff4444', fontWeight: 'bold' },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    statBox: { flex: 1, backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
    statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    actionGrid: { flexDirection: 'row', gap: 12 },
    actionItem: { flex: 1, backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333', gap: 12 },
    actionIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(0, 245, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
    actionText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
});

export default TeacherDashboardScreen;
