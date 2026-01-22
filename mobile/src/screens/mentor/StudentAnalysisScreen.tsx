import React, { useState } from 'react';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

// Mock data for now, waiting for backend endpoint
const MOCK_STUDENTS = [
    { id: 1, name: 'Anna Andersson', attendance: 85, risk: 'LOW', grades: 'B' },
    { id: 2, name: 'Erik Eriksson', attendance: 45, risk: 'HIGH', grades: 'F' },
    { id: 3, name: 'Lars Larsson', attendance: 92, risk: 'LOW', grades: 'A' },
    { id: 4, name: 'Maria Svensson', attendance: 60, risk: 'MEDIUM', grades: 'D' },
];

const StudentAnalysisScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const [students, setStudents] = useState(MOCK_STUDENTS);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'HIGH': return '#EF4444';
            case 'MEDIUM': return '#F59E0B';
            default: return '#10B981';
        }
    };

    const renderItem = ({ item }: { item: typeof MOCK_STUDENTS[0] }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.risk) }]}>
                    <Text style={styles.riskText}>{item.risk}</Text>
                </View>
            </View>
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Närvaro</Text>
                    <Text style={styles.statValue}>{item.attendance}%</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Snittbetyg</Text>
                    <Text style={styles.statValue}>{item.grades}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Se Detaljer</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Elevanalys</Text>
                <Text style={styles.subtitle}>Visar {students.length} elever</Text>
            </View>
            <FlatList
                data={students}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
        marginTop: 4,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',  // Theme: '#111827'
    },
    riskBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    riskText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    actionButton: {
        backgroundColor: '#EEF2FF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#4F46E5',  // Theme: '#4F46E5'
        fontWeight: '600',
    },
});

export default StudentAnalysisScreen;
