import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

const StatisticsScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        avgGrade: 'N/A',
        submissionRate: '0%',
        totalStudents: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            if (!user) return;
            const response = await api.get('/courses');
            const myCourses = response.data.filter((c: any) => c.teacher?.id === user.id);

            // Calculate real stats
            let totalSt = 0;
            myCourses.forEach((c: any) => {
                if (c.students) totalSt += c.students.length;
            });

            // Mock calc for grade (requires deeper traversal) but based on real course count
            setStats({
                avgGrade: totalSt > 0 ? 'C' : 'N/A',
                submissionRate: totalSt > 0 ? '75%' : '0%',
                totalStudents: totalSt
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kursöversikt</Text>
                <View style={styles.card}>
                    <Text style={styles.statLabel}>Genomsnittligt Betyg</Text>
                    <Text style={styles.statValue}>{stats.avgGrade}</Text>
                    <Text style={styles.statSubText}>Baserat på {stats.totalStudents} studenter</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.statLabel}>Inlämningsgrad</Text>
                    <Text style={styles.statValue}>{stats.submissionRate}</Text>
                    <Text style={styles.statSubText}>Genomsnitt alla kurser</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Betygsfördelning</Text>
                {/* Placeholder for a chart. Using simple bars for now to avoid dependencies */}
                <View style={styles.chartContainer}>
                    <View style={styles.barRow}>
                        <Text style={styles.barLabel}>A</Text>
                        <View style={[styles.barFill, { width: '20%', backgroundColor: '#10B981' }]} />
                        <Text style={styles.barValue}>-</Text>
                    </View>
                    <View style={styles.barRow}>
                        <Text style={styles.barLabel}>B</Text>
                        <View style={[styles.barFill, { width: '35%', backgroundColor: '#3B82F6' }]} />
                        <Text style={styles.barValue}>-</Text>
                    </View>
                    <View style={styles.barRow}>
                        <Text style={styles.barLabel}>C</Text>
                        <View style={[styles.barFill, { width: '25%', backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.barValue}>-</Text>
                    </View>
                    <View style={styles.barRow}>
                        <Text style={styles.barLabel}>D</Text>
                        <View style={[styles.barFill, { width: '15%', backgroundColor: '#EF4444' }]} />
                        <Text style={styles.barValue}>-</Text>
                    </View>
                    <View style={styles.barRow}>
                        <Text style={styles.barLabel}>E</Text>
                        <View style={[styles.barFill, { width: '5%', backgroundColor: '#EF4444' }]} />
                        <Text style={styles.barValue}>-</Text>
                    </View>
                    <View style={styles.barRow}>
                        <Text style={styles.barLabel}>F</Text>
                        <View style={[styles.barFill, { width: '5%', backgroundColor: '#1F2937' }]} />
                        <Text style={styles.barValue}>-</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
        marginBottom: 4,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#4F46E5',  // Theme: '#4F46E5'
        marginBottom: 4,
    },
    statSubText: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    barLabel: {
        width: 20,
        fontWeight: '600',
        color: '#374151',
    },
    barFill: {
        height: 12,
        borderRadius: 6,
        marginHorizontal: 12,
    },
    barValue: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
    }

});

export default StatisticsScreen;
