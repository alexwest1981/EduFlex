import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useGetUserQuery, useGetCoursesQuery } from '../../store/slices/apiSlice';
import { BrainCircuit, BookOpen, Star, PlayCircle } from 'lucide-react-native';

const StudentDashboardScreen = () => {
    const { data: user, isLoading: isUserLoading, refetch: refetchUser } = useGetUserQuery();
    const { data: courses, isLoading: isCoursesLoading, refetch: refetchCourses } = useGetCoursesQuery();

    const handleRefresh = () => {
        refetchUser();
        refetchCourses();
    };

    if (isUserLoading && !user) {
        return (
            <View style={styles.centerContainer}>
                <Text style={{ color: '#888' }}>Laddar data...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isUserLoading} onRefresh={handleRefresh} tintColor="#00F5FF" />}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Hej {user?.firstName || 'Student'}!</Text>
                <Text style={styles.subtitle}>Välkommen till din utbildning.</Text>
            </View>

            {/* AI Insights Card */}
            <View style={styles.aiCard}>
                <View style={styles.cardHeader}>
                    <BrainCircuit color="#00F5FF" size={24} />
                    <Text style={styles.cardTitle}>AI Coach</Text>
                </View>
                <Text style={styles.cardText}>
                    Bra jobbat denna vecka! Jag ser att du ligger över snittet i dina quiz. Fortsätt fokusera på modulen "Kommunikation" för att öka dina chanser på slutprovet.
                </Text>
                <TouchableOpacity style={styles.lightButton}>
                    <Text style={styles.lightButtonText}>Chatta med Coachen</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <BookOpen color="#aaa" size={20} />
                    <Text style={styles.statValue}>{courses ? courses.length : 0}</Text>
                    <Text style={styles.statLabel}>Kurser</Text>
                </View>
                <View style={styles.statBox}>
                    <Star color="#FBBF24" size={20} />
                    <Text style={styles.statValue}>1250</Text>
                    <Text style={styles.statLabel}>XP Poäng</Text>
                </View>
            </View>

            {/* Recent Courses */}
            <Text style={styles.sectionTitle}>Fortsätt lära</Text>
            {isCoursesLoading && !courses ? (
                <Text style={{ color: '#888', padding: 20 }}>Laddar kurser...</Text>
            ) : courses && courses.length > 0 ? (
                courses.slice(0, 3).map((course, index) => (
                    <TouchableOpacity key={course.id || index} style={styles.courseItem}>
                        <View style={styles.courseIconContainer}>
                            <PlayCircle color="#00F5FF" size={24} />
                        </View>
                        <View style={styles.courseInfo}>
                            <Text style={styles.courseName}>{course.name}</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: '45%' }]} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={{ color: '#888', padding: 20 }}>Inga aktiva kurser hittades.</Text>
            )}

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { marginBottom: 24 },
    greeting: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
    aiCard: { backgroundColor: 'rgba(0, 245, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 245, 255, 0.3)', borderRadius: 16, p: 20, padding: 20, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#00F5FF' },
    cardText: { fontSize: 14, color: '#ccc', lineHeight: 22, marginBottom: 16 },
    lightButton: { backgroundColor: 'rgba(0, 245, 255, 0.2)', padding: 12, borderRadius: 8, alignItems: 'center' },
    lightButtonText: { color: '#00F5FF', fontWeight: 'bold' },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    statBox: { flex: 1, backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
    statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    courseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
    courseIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(0, 245, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    courseInfo: { flex: 1 },
    courseName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    progressBar: { height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#00F5FF' },
});

export default StudentDashboardScreen;
