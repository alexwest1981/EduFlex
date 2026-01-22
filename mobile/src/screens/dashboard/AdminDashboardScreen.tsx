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
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useThemedStyles } from '../../hooks';

const AdminDashboardScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const { colors, styles: themedStyles } = useThemedStyles();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalDocuments: 0,
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentDocuments, setRecentDocuments] = useState<any[]>([]);

    const loadData = async () => {
        try {
            console.log('📊 Admin Dashboard: Starting data load...');

            const [usersResponse, coursesResponse, documentsResponse] = await Promise.all([
                api.get('/users?page=0&size=1000').catch((e) => {
                    console.error('❌ Users API failed:', e.message);
                    return { data: { content: [] } };
                }),
                api.get('/courses').catch((e) => {
                    console.error('❌ Courses API failed:', e.message);
                    return { data: [] };
                }),
                api.get('/documents').catch((e) => {
                    console.error('❌ Documents API failed:', e.message);
                    return { data: [] };
                }),
            ]);

            console.log('✅ API Responses received');
            console.log('   Users response:', usersResponse.data);
            console.log('   Courses response:', coursesResponse.data);
            console.log('   Documents response:', documentsResponse.data);

            const users = usersResponse.data;
            const courses = coursesResponse.data;
            const documents = documentsResponse.data;

            const userList = users.content || users || [];
            console.log(`📈 Parsed data: ${userList.length} users, ${courses.length} courses, ${documents.length} documents`);

            setStats({
                totalUsers: userList.length,
                totalCourses: courses.length || 0,
                totalDocuments: documents.length || 0,
            });

            // Get recent users (last 5)
            const sorted = [...userList].sort((a: any, b: any) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
            setRecentUsers(sorted.slice(0, 5));

            // Get recent documents (last 5)
            const sortedDocs = [...documents].sort((a: any, b: any) => {
                const dateA = new Date(a.uploadedAt || 0).getTime();
                const dateB = new Date(b.uploadedAt || 0).getTime();
                return dateB - dateA;
            });
            setRecentDocuments(sortedDocs.slice(0, 5));

        } catch (error) {
            console.error('💥 Failed to load admin dashboard data:', error);
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
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
            backgroundColor: colors.background,
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: colors.textSecondary,
        },
        header: {
            marginBottom: 24,
        },
        title: {
            fontSize: 26,
            fontWeight: '700',
            color: '#1F2937',
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        statsRow: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 24,
        },
        statCard: {
            flex: 1,
            backgroundColor: colors.text + '10', // 10% opacity
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            borderWidth: 0, // No border
        },
        statValue: {
            fontSize: 32,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 4,
        },
        statLabel: {
            fontSize: 12,
            color: colors.text,
            fontWeight: '600',
            textTransform: 'uppercase',
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 16,
        },
        listCard: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
        },
        avatarCircle: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        avatarText: {
            color: colors.card,
            fontSize: 14,
            fontWeight: '700',
        },
        docIcon: {
            fontSize: 28,
            marginRight: 12,
        },
        listInfo: {
            flex: 1,
        },
        listTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 2,
        },
        listSubtitle: {
            fontSize: 13,
            color: colors.textSecondary,
        },
        roleBadge: {
            fontSize: 11,
            fontWeight: '700',
            color: colors.primary,
            backgroundColor: colors.primary + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            textTransform: 'uppercase',
        },
        emptyText: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            paddingVertical: 20,
        },
        quickActions: {
            flexDirection: 'row',
            gap: 12,
        },
        quickActionButton: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        quickActionIcon: {
            fontSize: 28,
            marginBottom: 8,
        },
        quickActionText: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
        },
    });

    if (isLoading) {
        return (
            <View style={themedStyles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={themedStyles.loadingText}>Laddar...</Text>
            </View>
        );
    }



    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🛡️ Systemöversikt</Text>
                <Text style={styles.subtitle}>Realtidsdata och systemhantering</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalUsers}</Text>
                    <Text style={styles.statLabel}>Användare</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalCourses}</Text>
                    <Text style={styles.statLabel}>Kurser</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalDocuments}</Text>
                    <Text style={styles.statLabel}>Dokument</Text>
                </View>
            </View>

            {/* Recent Users */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👥 Senaste Användare</Text>
                {recentUsers.length > 0 ? (
                    recentUsers.map((usr, index) => (
                        <View key={index} style={styles.listCard}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>
                                    {(usr.firstName?.[0] || '') + (usr.lastName?.[0] || '')}
                                </Text>
                            </View>
                            <View style={styles.listInfo}>
                                <Text style={styles.listTitle}>
                                    {usr.firstName} {usr.lastName}
                                </Text>
                                <Text style={styles.listSubtitle}>{usr.email}</Text>
                            </View>
                            <Text style={styles.roleBadge}>{usr.role?.name || usr.role || 'N/A'}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Inga användare hittades</Text>
                )}
            </View>

            {/* Recent Documents */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📁 Nyligen Uppladdat</Text>
                {recentDocuments.length > 0 ? (
                    recentDocuments.map((doc, index) => (
                        <View key={index} style={styles.listCard}>
                            <Text style={styles.docIcon}>📄</Text>
                            <View style={styles.listInfo}>
                                <Text style={styles.listTitle}>{doc.title || doc.filename}</Text>
                                <Text style={styles.listSubtitle}>
                                    {new Date(doc.uploadedAt).toLocaleDateString('sv-SE')}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Inga dokument hittades</Text>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Admin', { screen: 'UserManagement' })}
                    >
                        <Text style={styles.quickActionIcon}>👥</Text>
                        <Text style={styles.quickActionText}>Hantera Användare</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Admin', { screen: 'ServerSettings' })}
                    >
                        <Text style={styles.quickActionIcon}>⚙️</Text>
                        <Text style={styles.quickActionText}>Serverinställningar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Text style={styles.quickActionIcon}>💾</Text>
                        <Text style={styles.quickActionText}>Backups</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default AdminDashboardScreen;
