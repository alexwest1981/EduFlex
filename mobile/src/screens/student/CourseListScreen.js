import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useGetCoursesQuery } from '../../store/slices/apiSlice';
import { BookOpen } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const CourseListScreen = () => {
    const { data: courses, isLoading } = useGetCoursesQuery();
    const navigation = useNavigation();

    if (isLoading && !courses) {
        return (
            <View style={styles.centerContainer}>
                <Text style={{ color: '#888' }}>Laddar kurser...</Text>
            </View>
        );
    }

    const renderCourseItem = ({ item }) => (
        <TouchableOpacity
            style={styles.courseCard}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id, courseName: item.name })}
        >
            <View style={styles.iconContainer}>
                <BookOpen color="#00F5FF" size={24} />
            </View>
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{item.name}</Text>
                <Text style={styles.courseSubtitle}>{item.modules?.length || 0} moduler</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dina Kurser</Text>
            {(!courses || courses.length === 0) ? (
                <Text style={{ color: '#888' }}>Inga kurser hittades.</Text>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={renderCourseItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
    courseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1b1d', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
    iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0, 245, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    courseInfo: { flex: 1 },
    courseTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    courseSubtitle: { fontSize: 14, color: '#888' },
});

export default CourseListScreen;
