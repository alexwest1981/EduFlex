import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import { courseService, gamificationService, notificationService, calendarService } from '../../services';
import { Course, DailyChallenge, Streak, CalendarEvent } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

import NextClassCard from '../../components/NextClassCard';
import ScheduleItem, { ScheduleStatus } from '../../components/ScheduleItem';
import AssignmentCard from '../../components/AssignmentCard';

const StudentDashboardScreen: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [courses, setCourses] = useState<Course[]>([]);
    const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
    const [streak, setStreak] = useState<Streak | null>(null);
    const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [todaySchedule, setTodaySchedule] = useState<CalendarEvent[]>([]);

    const loadData = async () => {
        if (!user) return;

        try {
            const [coursesData, challengesData, streakData, notifCount, scheduleData] = await Promise.all([
                courseService.getStudentCourses(user.id).catch(() => []),
                gamificationService.getDailyChallenges(user.id).catch(() => []),
                gamificationService.getStreak(user.id).catch(() => null),
                notificationService.getUnreadCount(user.id).catch(() => 0),
                calendarService.getTodaySchedule().catch(() => []),
            ]);

            setCourses(coursesData.slice(0, 6));
            setChallenges(challengesData);
            setStreak(streakData);
            setUnreadCount(notifCount);
            setTodaySchedule(scheduleData);

            // Fetch upcoming assignments from courses
            const allAssignments: any[] = [];
            for (const course of coursesData) {
                try {
                    const assignments = await courseService.getCourseAssignments(course.id);
                    allAssignments.push(...assignments.map((a: any) => ({ ...a, courseName: course.name })));
                } catch { /* skip */ }
            }

            const now = new Date();
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const upcoming = allAssignments
                .filter((a: any) => a.dueDate && new Date(a.dueDate) >= now && new Date(a.dueDate) <= sevenDaysFromNow)
                .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 4);

            setUpcomingAssignments(upcoming);
        } catch (error: any) {
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

    // Determine next class and schedule status
    const { nextClass, scheduleItems } = useMemo(() => {
        const now = new Date();
        let next: CalendarEvent | null = null;
        const items = todaySchedule
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map(event => {
                const start = new Date(event.startTime);
                const end = new Date(event.endTime);
                let status: ScheduleStatus = 'upcoming';

                if (now >= start && now <= end) {
                    status = 'ongoing';
                    if (!next) next = event;
                } else if (now > end) {
                    status = 'completed';
                } else {
                    if (!next) next = event;
                }

                return {
                    event,
                    time: start.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
                    status,
                };
            });

        return { nextClass: next, scheduleItems: items };
    }, [todaySchedule]);

    const styles = useMemo(() => createStyles(colors), [colors]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Laddar din instrumentpanel...</Text>
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
            {/* Top App Bar */}
            <View style={styles.topBar}>
                <View style={styles.topBarLeft}>
                    <View style={styles.avatar}>
                        {user?.profilePictureUrl ? (
                            <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {(user?.firstName?.[0] || 'S').toUpperCase()}
                            </Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()},</Text>
                        <Text style={styles.userName}>{user?.firstName || 'Student'}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <Ionicons name="notifications-outline" size={22} color={colors.text} />
                    {unreadCount > 0 && (
                        <View style={styles.notifBadge}>
                            <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Next Class Card */}
            <NextClassCard
                nextClass={nextClass}
                onJoin={() => {
                    if (nextClass?.meetingLink) {
                        Linking.openURL(nextClass.meetingLink);
                    }
                }}
            />

            {/* Today's Schedule */}
            {scheduleItems.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Dagens Schema</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Calendar' as any)}>
                            <Text style={styles.sectionLink}>Visa alla</Text>
                        </TouchableOpacity>
                    </View>
                    {scheduleItems.slice(0, 4).map(({ event, time, status }) => (
                        <ScheduleItem
                            key={event.id}
                            time={time}
                            subject={event.title}
                            room={event.location}
                            status={status}
                        />
                    ))}
                </View>
            )}

            {/* Pending Assignments — 2 column grid */}
            {upcomingAssignments.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Väntande Uppgifter</Text>
                        <TouchableOpacity>
                            <Text style={styles.sectionLink}>Visa alla</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.assignmentGrid}>
                        {upcomingAssignments.map((assignment, index) => (
                            <View key={index} style={styles.assignmentGridItem}>
                                <AssignmentCard
                                    subject={assignment.courseName || 'Kurs'}
                                    title={assignment.title}
                                    progress={0}
                                    deadline={assignment.dueDate}
                                />
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassBorder }]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{courses.length}</Text>
                    <Text style={styles.statLabel}>Aktiva Kurser</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassBorder }]}>
                    <Text style={[styles.statValue, { color: colors.warning }]}>{upcomingAssignments.length}</Text>
                    <Text style={styles.statLabel}>Inlämningar</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassBorder }]}>
                    <Text style={[styles.statValue, { color: colors.danger }]}>{streak?.currentStreak || 0}</Text>
                    <Text style={styles.statLabel}>Streak</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const createStyles = (colors: ReturnType<typeof getThemeColors>) =>
    StyleSheet.create({
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
            fontFamily: 'Lexend_400Regular',
            marginTop: 16,
            fontSize: 16,
            color: colors.textMuted,
        },

        // Top Bar
        topBar: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        topBarLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        avatar: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surfaceGlass,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        avatarImage: {
            width: 44,
            height: 44,
            borderRadius: 22,
        },
        avatarText: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 18,
            color: colors.primary,
        },
        greeting: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 13,
            color: colors.textMuted,
        },
        userName: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 20,
            color: colors.text,
        },
        notificationButton: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: colors.surfaceGlass,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            alignItems: 'center',
            justifyContent: 'center',
        },
        notifBadge: {
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: colors.danger,
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
        },
        notifBadgeText: {
            fontFamily: 'Lexend_700Bold',
            color: '#FFFFFF',
            fontSize: 10,
        },

        // Sections
        section: {
            marginBottom: 24,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        sectionTitle: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 18,
            color: colors.text,
        },
        sectionLink: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 13,
            color: colors.primary,
        },

        // Assignment Grid
        assignmentGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },
        assignmentGridItem: {
            width: '48%' as any,
        },

        // Stats Row
        statsRow: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 8,
        },
        statCard: {
            flex: 1,
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
        },
        statValue: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 24,
            marginBottom: 4,
        },
        statLabel: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 11,
            color: colors.textMuted,
            textAlign: 'center',
        },
    });

export default StudentDashboardScreen;
