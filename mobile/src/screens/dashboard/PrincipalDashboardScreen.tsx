import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native'; // Added
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

import { useThemedStyles } from '../../hooks';

const { width } = Dimensions.get('window');

const PrincipalDashboardScreen: React.FC = () => {
    const { colors, styles: themedStyles } = useThemedStyles();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // Added
    const { user } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Mock KPI data - replace with actual API
    const [kpis] = useState({
        totalStudents: 486,
        activeTeachers: 27,
        courseCompletion: 78,
        avgAttendance: 87,
        revenue: '145,200',
        nps: 72,
    });

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // TODO: Fetch actual data
        setTimeout(() => setIsRefreshing(false), 1000);
    };

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
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    kpiCard: {
        width: (width - 52) / 2, // 2 columns with gaps
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    kpiLabel: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    kpiValue: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    kpiChange: {
        fontSize: 11,
        color: '#10B981',
        fontWeight: '500',
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
    chartPlaceholder: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontSize: 16,
        color: '#6B7280',  // Theme: '#6B7280'
        fontWeight: '600',
    },
    placeholderSubtext: {
        fontSize: 12,
        color: '#D1D5DB',
        marginTop: 4,
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
                <Text style={styles.title}>📊 Verksamhetsöversikt</Text>
                <Text style={styles.subtitle}>Strategisk dashboard för ledning</Text>
            </View>

            {/* KPI Grid */}
            <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Studenter</Text>
                    <Text style={styles.kpiValue}>{kpis.totalStudents}</Text>
                    <Text style={styles.kpiChange}>+12% vs förra månaden</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Lärare (Aktiva)</Text>
                    <Text style={styles.kpiValue}>{kpis.activeTeachers}</Text>
                    <Text style={styles.kpiChange}>+2 sedan Q1</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Kurs Genomförande</Text>
                    <Text style={styles.kpiValue}>{kpis.courseCompletion}%</Text>
                    <Text style={styles.kpiChange}>+5% vs Q1</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Närvaro (Snitt)</Text>
                    <Text style={styles.kpiValue}>{kpis.avgAttendance}%</Text>
                    <Text style={styles.kpiChange}>-2% vs förra veckan</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Intäkt (Månad)</Text>
                    <Text style={styles.kpiValue}>{kpis.revenue} kr</Text>
                    <Text style={styles.kpiChange}>+8% MoM</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>NPS Score</Text>
                    <Text style={styles.kpiValue}>{kpis.nps}</Text>
                    <Text style={styles.kpiChange}>+3 poäng</Text>
                </View>
            </View>

            {/* Charts Placeholder */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📈 Intäktstillväxt</Text>
                <View style={styles.chartPlaceholder}>
                    <Text style={styles.placeholderText}>Diagram kommer här</Text>
                    <Text style={styles.placeholderSubtext}>(Integration med Analytics API)</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👥 Användartillväxt</Text>
                <View style={styles.chartPlaceholder}>
                    <Text style={styles.placeholderText}>Diagram kommer här</Text>
                    <Text style={styles.placeholderSubtext}>(Integration med Analytics API)</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Principal', { screen: 'FullReport' })}
                    >
                        <Text style={styles.quickActionIcon}>📄</Text>
                        <Text style={styles.quickActionText}>Hämta Rapport</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Principal', { screen: 'StaffList' })}
                    >
                        <Text style={styles.quickActionIcon}>👥</Text>
                        <Text style={styles.quickActionText}>Personal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Text style={styles.quickActionIcon}>⚙️</Text>
                        <Text style={styles.quickActionText}>Inställningar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default PrincipalDashboardScreen;
