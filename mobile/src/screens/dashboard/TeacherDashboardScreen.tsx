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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

import { useThemedStyles } from '../../hooks';
import api from '../../services/api'; // Re-added
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Added
import { RootStackParamList } from '../../navigation/types'; // Added

interface Course {
    id: number;
    name: string;
    students?: any[];
}

interface Submission {
    id: number;
    assignmentId: number;
    studentId: number;
    grade?: string;
}

interface Application {
    id: number;
    student: any;
    course: any;
    status: string;
}

const TeacherDashboardScreen: React.FC = () => {
    const { colors, styles: themedStyles } = useThemedStyles();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [ungradedCount, setUngradedCount] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const [applications, setApplications] = useState<Application[]>([]);
    const [ungradedSubmissions, setUngradedSubmissions] = useState<any[]>([]);
    const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

    const loadData = async () => {
        if (!user) return;

        try {
            // Fetch teacher's courses
            const allCoursesResponse = await api.get('/courses');
            const allCourses = allCoursesResponse.data;
            const teacherCourses = allCourses.filter((c: any) => c.teacher?.id === user.id);
            setMyCourses(teacherCourses);

            // Count unique students
            const uniqueStudents = new Set();
            teacherCourses.forEach((course: Course) => {
                course.students?.forEach((s: any) => uniqueStudents.add(s.id));
            });
            setTotalStudents(uniqueStudents.size);

            // Fetch ungraded submissions
            let ungraded: any[] = [];
            let count = 0;
            for (const course of teacherCourses) {
                try {
                    const assignmentsResponse = await api.get(`/courses/${course.id}/assignments`);
                    const assignments = assignmentsResponse.data;
                    for (const assignment of assignments) {
                        try {
                            const submissionsResponse = await api.get(`/assignments/${assignment.id}/submissions`);
                            const submissions = submissionsResponse.data;
                            const ungradedSubs = submissions.filter((s: any) => !s.grade);
                            ungradedSubs.forEach((sub: any) => {
                                ungraded.push({
                                    ...sub,
                                    assignmentTitle: assignment.title,
                                    courseName: course.name,
                                });
                            });
                            count += ungradedSubs.length;
                        } catch (e) {
                            console.error('Failed to fetch submissions', e);
                        }
                    }
                } catch (e) {
                    console.error('Failed to fetch assignments', e);
                }
            }
            setUngradedCount(count);
            setUngradedSubmissions(ungraded.slice(0, 10)); // Show top 10

            // Fetch pending applications
            try {
                const appsResponse = await api.get(`/courses/applications/teacher/${user.id}`);
                const apps = appsResponse.data;
                setApplications(apps.filter((a: Application) => a.status === 'PENDING'));
            } catch (e) {
                console.error('Failed to fetch applications', e);
            }

            // Identify at-risk students (mock logic - replace with actual API)
            const atRisk: any[] = [];
            teacherCourses.forEach((course: Course) => {
                course.students?.forEach((student: any) => {
                    const lastActive = student.lastActive ? new Date(student.lastActive) : null;
                    const daysSinceActive = lastActive
                        ? Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
                        : 999;

                    if (daysSinceActive > 7) {
                        atRisk.push({
                            ...student,
                            courseName: course.name,
                            daysSinceActive,
                        });
                    }
                });
            });
            setAtRiskStudents(atRisk.slice(0, 5)); // Top 5

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            Alert.alert('Fel', 'Kunde inte ladda dashboard-data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
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
    greeting: {
        fontSize: 16,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    userName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
        marginTop: 4,
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
    statCardWarning: {
        borderColor: '#FCA5A5',
        backgroundColor: '#FEF2F2',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#4F46E5',  // Theme: '#4F46E5'
        marginBottom: 4,
    },
    statValueWarning: {
        color: '#DC2626',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
        textAlign: 'center',
    },
    alertCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    alertIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E40AF',
    },
    alertText: {
        fontSize: 14,
        color: '#374151',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    seeAllText: {
        fontSize: 14,
        color: '#4F46E5',  // Theme: '#4F46E5'
        fontWeight: '600',
    },
    riskCard: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FCA5A5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    riskStudentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 4,
    },
    riskCourseName: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    riskDays: {
        fontSize: 14,
        color: '#DC2626',
        fontWeight: '600',
    },
    submissionCard: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    submissionHeader: {
        marginBottom: 8,
    },
    submissionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 4,
    },
    submissionCourse: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    submissionMeta: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    courseCard: {
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
    courseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 4,
    },
    courseStudents: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    courseArrow: {
        fontSize: 24,
        color: '#6B7280',  // Theme: '#6B7280'
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
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
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
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Välkommen tillbaka,</Text>
                <Text style={styles.userName}>{user?.firstName || 'Lärare'} 👨‍🏫</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <TouchableOpacity style={styles.statCard}>
                    <Text style={styles.statValue}>{myCourses.length}</Text>
                    <Text style={styles.statLabel}>Aktiva Kurser</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statCard}>
                    <Text style={styles.statValue}>{totalStudents}</Text>
                    <Text style={styles.statLabel}>Studenter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.statCard, ungradedCount > 0 && styles.statCardWarning]}>
                    <Text style={[styles.statValue, ungradedCount > 0 && styles.statValueWarning]}>
                        {ungradedCount}
                    </Text>
                    <Text style={styles.statLabel}>Att Rätta</Text>
                </TouchableOpacity>
            </View>

            {/* Applications Alert */}
            {applications.length > 0 && (
                <TouchableOpacity
                    style={styles.alertCard}
                    onPress={() => navigation.navigate('Teacher', { screen: 'CourseApplications' })}
                >
                    <View style={styles.alertHeader}>
                        <Text style={styles.alertIcon}>📬</Text>
                        <Text style={styles.alertTitle}>
                            {applications.length} nya ansökningar
                        </Text>
                    </View>
                    <Text style={styles.alertText}>
                        Du har väntande kursansökningar som behöver granskas
                    </Text>
                </TouchableOpacity>
            )}

            {/* At-Risk Students */}
            {atRiskStudents.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚠️ Studenter i Riskzon</Text>
                    {atRiskStudents.map((student, index) => (
                        <View key={index} style={styles.riskCard}>
                            <View>
                                <Text style={styles.riskStudentName}>
                                    {student.firstName} {student.lastName}
                                </Text>
                                <Text style={styles.riskCourseName}>{student.courseName}</Text>
                            </View>
                            <Text style={styles.riskDays}>
                                {student.daysSinceActive}d sedan aktiv
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Ungraded Submissions */}
            {ungradedSubmissions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📝 Att Rätta ({ungradedCount})</Text>
                    {ungradedSubmissions.map((submission, index) => (
                        <TouchableOpacity key={index} style={styles.submissionCard}>
                            <View style={styles.submissionHeader}>
                                <Text style={styles.submissionTitle}>{submission.assignmentTitle}</Text>
                                <Text style={styles.submissionCourse}>{submission.courseName}</Text>
                            </View>
                            <Text style={styles.submissionMeta}>
                                Inlämnad: {new Date(submission.submittedAt).toLocaleDateString('sv-SE')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* My Courses */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mina Kurser 📚</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>Visa alla →</Text>
                    </TouchableOpacity>
                </View>
                {myCourses.map((course, index) => (
                    <TouchableOpacity key={index} style={styles.courseCard}>
                        <View>
                            <Text style={styles.courseTitle}>{course.name}</Text>
                            <Text style={styles.courseStudents}>
                                {course.students?.length || 0} studenter
                            </Text>
                        </View>
                        <Text style={styles.courseArrow}>→</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Teacher', { screen: 'CreateCourse' })}
                    >
                        <Text style={styles.quickActionIcon}>➕</Text>
                        <Text style={styles.quickActionText}>Skapa Kurs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Teacher', { screen: 'Attendance' })}
                    >
                        <Text style={styles.quickActionIcon}>📋</Text>
                        <Text style={styles.quickActionText}>Närvaro</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Teacher', { screen: 'Statistics' })}
                    >
                        <Text style={styles.quickActionIcon}>📊</Text>
                        <Text style={styles.quickActionText}>Statistik</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default TeacherDashboardScreen;
