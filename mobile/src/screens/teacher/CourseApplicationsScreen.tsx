import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

const CourseApplicationsScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadApplications = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await courseService.getTeacherApplications(user.id);
            // Filter only PENDING
            setApplications(data.filter((app: any) => app.status === 'PENDING'));
        } catch (error) {
            console.error('Failed to load applications', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, [user]);

    const handleResponse = async (appId: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            await courseService.respondToApplication(appId, status);
            Alert.alert('Klart', `Ansökan har ${status === 'APPROVED' ? 'godkänts' : 'avvisats'}.`);
            // Refresh list
            loadApplications();
        } catch (error) {
            console.error('Failed to respond', error);
            Alert.alert('Fel', 'Kunde inte hantera ansökan.');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.studentName}>
                    {item.student?.firstName} {item.student?.lastName}
                </Text>
                <Text style={styles.courseName}>{item.course?.name}</Text>
            </View>
            <Text style={styles.dateText}>
                Ansökte: {new Date(item.appliedAt || Date.now()).toLocaleDateString('sv-SE')}
            </Text>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleResponse(item.id, 'REJECTED')}
                >
                    <Text style={[styles.buttonText, styles.rejectText]}>Neka</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleResponse(item.id, 'APPROVED')}
                >
                    <Text style={styles.buttonText}>Godkänn</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={applications}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Inga väntande ansökningar 🎉</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
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
        marginBottom: 8,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    courseName: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
        fontStyle: 'italic',
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    approveButton: {
        backgroundColor: '#4F46E5',
    },
    rejectButton: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    rejectText: {
        color: '#DC2626',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',  // Theme: '#6B7280'
        fontSize: 16,
    },
});

export default CourseApplicationsScreen;
