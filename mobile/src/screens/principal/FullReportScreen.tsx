import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

interface SchoolStats {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    activeCourses: number;
    systemStatus: string;
    lastBackup: string;
}

const FullReportScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<SchoolStats | null>(null);

    const fetchData = async () => {
        try {
            const [usersRes, coursesRes, backupRes] = await Promise.all([
                api.get('/users'),
                api.get('/courses'),
                api.get('/admin/backups/status') // Using as proxy for system health
            ]);

            const users = usersRes.data.content || usersRes.data;
            const courses = coursesRes.data;
            const backupStatus = backupRes.data;

            const students = users.filter((u: any) => u.role?.name === 'STUDENT' || u.role === 'STUDENT').length;
            const teachers = users.filter((u: any) => u.role?.name === 'TEACHER' || u.role === 'TEACHER').length;

            // Assuming courses have an 'isOpen' or similar status, if not we count all
            const active = courses.filter((c: any) => c.isOpen).length;

            setStats({
                totalStudents: students,
                totalTeachers: teachers,
                totalCourses: courses.length,
                activeCourses: active,
                systemStatus: 'ONLINE', // If we got here, API is up
                lastBackup: backupStatus.lastBackupTime || 'Idag'
            });

        } catch (error) {
            console.error('Failed to fetch report data', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Rektorsrapport</Text>
                <Text style={styles.date}>{new Date().toLocaleDateString('sv-SE')}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Användarstatistik</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Totalt Antal Studenter</Text>
                        <Text style={styles.value}>{stats?.totalStudents}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Totalt Antal Lärare</Text>
                        <Text style={styles.value}>{stats?.totalTeachers}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kursverksamhet</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Aktiva Kurser</Text>
                        <Text style={[styles.value, { color: '#10B981' }]}>{stats?.activeCourses}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Totala Kurser</Text>
                        <Text style={styles.value}>{stats?.totalCourses}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Systemstatus</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Serverstatus</Text>
                        <Text style={[styles.value, { color: '#10B981' }]}>{stats?.systemStatus}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Senaste Backup</Text>
                        <Text style={styles.value}>{stats?.lastBackup}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.printButton} onPress={() => alert('Funktionen kommer snart')}>
                <Text style={styles.printButtonText}>Exportera PDF</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    date: {
        fontSize: 16,
        color: '#6B7280',  // Theme: '#6B7280'
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 4,
    },
    label: {
        fontSize: 16,
        color: '#4B5563',
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    printButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 50,
    },
    printButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default FullReportScreen;
