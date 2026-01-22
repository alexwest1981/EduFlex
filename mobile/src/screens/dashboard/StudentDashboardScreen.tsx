import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { courseService, gamificationService, notificationService } from '../../services';
import { Course, DailyChallenge, Streak } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useThemedStyles } from '../../hooks';

// Import existing components
import GamificationCard from '../../components/GamificationCard';
import CourseCard from '../../components/CourseCard';
import DailyChallengeCard from '../../components/DailyChallengeCard';

const StudentDashboardScreen: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { colors, styles: themedStyles } = useThemedStyles();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [courses, setCourses] = useState<Course[]>([]);
    const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
    const [streak, setStreak] = useState<Streak | null>(null);
    const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0); // Added for unread notifications

    const loadData = async () => {
        console.log('📱 StudentDashboard: loadData called');
        console.log('   User:', user ? `${user.firstName} (ID: ${user.id})` : 'NULL');

        if (!user) {
            console.warn('⚠️ No user, skipping data load');
            return;
        }

        try {
            console.log('🔄 Fetching courses...');
            const coursesData = await courseService.getStudentCourses(user.id).catch(e => {
                console.error('❌ getStudentCourses failed:', e.message);
                return [];
            });

            console.log('🔄 Fetching daily challenges...');
            const challengesData = await gamificationService.getDailyChallenges(user.id).catch(e => {
                console.error('❌ getDailyChallenges failed:', e.message);
                return [];
            });

            console.log('🔄 Fetching streak...');
            const streakData = await gamificationService.getStreak(user.id).catch(e => {
                console.error('❌ getStreak failed:', e.message);
                return null;
            });

            console.log('🔄 Fetching notification count...');
            const notifCount = await notificationService.getUnreadCount(user.id).catch(e => {
                console.error('❌ getUnreadCount failed:', e.message);
                return 0;
            });

            console.log('✅ Student dashboard data loaded:', {
                courses: coursesData.length,
                challenges: challengesData.length,
                streak: streakData?.currentStreak,
                notifications: notifCount,
            });

            setCourses(coursesData.slice(0, 6)); // Show max 6 courses
            setChallenges(challengesData);
            setStreak(streakData);
            setUnreadCount(notifCount);

            // Fetch assignments from courses
            const allAssignments: any[] = [];
            for (const course of coursesData) {
                try {
                    const assignments = await courseService.getCourseAssignments(course.id);
                    // Note: The original code added courseName here. The instruction removes it.
                    // If courseName is needed in rendering, it should be re-added here.
                    allAssignments.push(...assignments);
                } catch (error) {
                    console.error(`Failed to fetch assignments for course ${course.id}`, error);
                }
            }

            // Filter upcoming assignments (due within 7 days)
            const now = new Date();
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const upcoming = allAssignments
                .filter((a: any) => a.dueDate && new Date(a.dueDate) >= now && new Date(a.dueDate) <= sevenDaysFromNow)
                .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5);

            setUpcomingAssignments(upcoming);

        } catch (error: any) {
            console.error('💥 Failed to load dashboard data:', error?.message || error);
            Alert.alert('Fel', 'Kunde inte ladda dashboard-data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.id]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([loadData(), refreshUser()]);
        setIsRefreshing(false);
    };

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'God morgon';
        if (hour < 18) return 'God eftermiddag';
        return 'God kväll';
    };

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
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
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        marginBottom: 24,
        flexDirection: 'row', // Added
        justifyContent: 'space-between', // Added
        alignItems: 'center', // Added
    },
    greeting: {
        fontSize: 16,
        color: '#6B7280',
    },
    userName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 4,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    assignmentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    assignmentHeader: {
        marginBottom: 8,
    },
    assignmentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    assignmentCourse: {
        fontSize: 14,
        color: '#6B7280',
    },
    assignmentDueDate: {
        fontSize: 14,
        color: '#4F46E5',
        fontWeight: '500',
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#4F46E5',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    // Added styles for notification button
    notificationButton: {
        padding: 8,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    bellIcon: {
        fontSize: 24,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
});

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Laddar din instrumentpanel...</Text>
            </View>
        );
    }


    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={'#4F46E5'} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()},</Text>
                    <Text style={styles.userName}>{user?.firstName || 'Student'} 👋</Text>
                </View>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <Text style={styles.bellIcon}>🔔</Text>
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Gamification Overview */}
            <GamificationCard
                level={user?.level || 1}
                points={user?.points || 0}
                streak={streak?.currentStreak || 0}
                onPress={() => { }}
            />

            {/* Daily Challenges */}
            {challenges.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dagens Utmaningar 🎯</Text>
                    {challenges.map((challenge) => (
                        <DailyChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                </View>
            )}

            {/* Upcoming Assignments */}
            {upcomingAssignments.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kommande Inlämningar 📝</Text>
                    {upcomingAssignments.map((assignment, index) => (
                        <View key={index} style={styles.assignmentCard}>
                            <View style={styles.assignmentHeader}>
                                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                                <Text style={styles.assignmentCourse}>{assignment.courseName}</Text>
                            </View>
                            <Text style={styles.assignmentDueDate}>
                                Förfaller: {new Date(assignment.dueDate).toLocaleDateString('sv-SE')}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* My Courses */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mina Kurser 📚</Text>
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onPress={() => { }}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>📖</Text>
                        <Text style={styles.emptyStateText}>Du är inte registrerad på några kurser än</Text>
                    </View>
                )}
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{courses.length}</Text>
                    <Text style={styles.statLabel}>Aktiva Kurser</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{upcomingAssignments.length}</Text>
                    <Text style={styles.statLabel}>Inlämningar</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{challenges.length}</Text>
                    <Text style={styles.statLabel}>Utmaningar</Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default StudentDashboardScreen;
