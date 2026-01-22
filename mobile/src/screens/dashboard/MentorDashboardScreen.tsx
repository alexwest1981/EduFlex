import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Added
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

import { useThemedStyles } from '../../hooks';
import api from '../../services/api'; // Added import

interface Mentee {
    id: number;
    firstName: string;
    lastName: string;
    class: string;
    risk: 'Low' | 'Medium' | 'High';
    attendance: number; // Represents Level/Points in this context
} const MentorDashboardScreen: React.FC = () => {
    const { colors, styles: themedStyles } = useThemedStyles();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // Added
    const { user } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [mentees, setMentees] = useState<Mentee[]>([]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch students (Role = STUDENT)
            // ideally /api/mentor/mentees but accessing all students for now as per current backend capabilities
            const response = await api.get('/users?role=STUDENT');
            const data = response.data.content || response.data;

            // Transform to view model using REAL data
            // We use 'level' as a proxy for "Performance" and 'points' for "Attendance/Engagement"
            // since specific risk/attendance fields don't exist in User entity.
            const realMentees: Mentee[] = data
                .filter((u: any) => u.role?.name === 'STUDENT' || u.role === 'STUDENT')
                .map((u: any) => ({
                    id: u.id,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    class: 'N/A', // Class info not in User entity yet
                    risk: u.activeMinutes < 100 ? 'High' : (u.activeMinutes < 500 ? 'Medium' : 'Low'), // Calculated risk based on activity
                    attendance: u.level || 1 // Using Level as a proxy to show *something* real
                }));
            setMentees(realMentees);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High': return '#DC2626';
            case 'Medium': return '#F59E0B';
            case 'Low': return '#10B981';
            default: return '#6B7280';
        }
    };

    const highRiskCount = mentees.filter(m => m.risk === 'High').length;
    const avgAttendance = Math.round(mentees.reduce((sum, m) => sum + m.attendance, 0) / mentees.length || 0);

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
    },
    contentContainer: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#10B981',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',  // Theme: '#6B7280'
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 16,
    },
    studentCard: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 4,
    },
    studentClass: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    studentStats: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    statBadge: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statBadgeLabel: {
        fontSize: 10,
        color: '#6B7280',  // Theme: '#6B7280'
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    statBadgeValue: {
        fontSize: 13,
        color: '#111827',  // Theme: '#111827'
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    riskBadge: {
        borderRadius: 8,
        borderWidth: 2,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    riskText: {
        fontSize: 12,
        fontWeight: '700',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    quickActionIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
});

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Laddar...</Text>
            </View>
        );
    }


    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}> Mentoröversikt</Text>
                <Text style={styles.subtitle}>Hantera dina mentorselever och följ deras utveckling</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{mentees.length}</Text>
                    <Text style={styles.statLabel}>Mina Elever</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{highRiskCount}</Text>
                    <Text style={styles.statLabel}>I Farozonen (Låg aktivitet)</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{avgAttendance}</Text>
                    <Text style={styles.statLabel}>Snitt Nivå</Text>
                </View>
            </View>

            {/* Student List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Elevlista</Text>
                {mentees.map((student) => (
                    <TouchableOpacity key={student.id} style={styles.studentCard}>
                        <View style={styles.studentInfo}>
                            <Text style={styles.studentName}>
                                {student.firstName} {student.lastName}
                            </Text>
                            <Text style={styles.studentClass}>{student.attendance} poäng</Text>
                        </View>
                        <View style={styles.studentStats}>
                            <View style={styles.statBadge}>
                                <Text style={styles.statBadgeLabel}>Nivå</Text>
                                <Text style={styles.statBadgeValue}>{student.attendance}</Text>
                            </View>
                            <View style={[styles.riskBadge, { borderColor: getRiskColor(student.risk) }]}>
                                <Text style={[styles.riskText, { color: getRiskColor(student.risk) }]}>
                                    {student.risk}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Mentor', { screen: 'StudentList' })}
                    >
                        <Text style={styles.quickActionIcon}>📊</Text>
                        <Text style={styles.quickActionText}>Prestations-analys</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Text style={styles.quickActionIcon}>💬</Text>
                        <Text style={styles.quickActionText}>Skicka Meddelande</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Mentor', { screen: 'BookMeeting' })}
                    >
                        <Text style={styles.quickActionIcon}>📅</Text>
                        <Text style={styles.quickActionText}>Boka Samtal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default MentorDashboardScreen;
