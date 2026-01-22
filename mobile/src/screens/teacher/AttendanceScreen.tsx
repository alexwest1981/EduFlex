import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Switch
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TeacherStackParamList } from '../../navigation/types';
import api from '../../services/api';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

type AttendanceScreenNavigationProp = NativeStackNavigationProp<TeacherStackParamList, 'Attendance'>;
type AttendanceScreenRouteProp = RouteProp<TeacherStackParamList, 'Attendance'>;

interface Student {
    id: number;
    name: string;
    isPresent: boolean;
}

const AttendanceScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const navigation = useNavigation<AttendanceScreenNavigationProp>();
    const route = useRoute<AttendanceScreenRouteProp>();
    const [isLoading, setIsLoading] = useState(false); // Mock loading
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(route.params?.courseId || null);

    useEffect(() => {
        loadStudents();
    }, [selectedCourseId]);

    const loadStudents = async () => {
        if (!selectedCourseId) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/courses/${selectedCourseId}`);
            const courseData = response.data;

            // Map enrolled students to view model
            if (courseData.students) {
                const studentList = courseData.students.map((s: any) => ({
                    id: s.id,
                    name: `${s.firstName} ${s.lastName}`,
                    isPresent: true // Default to present
                }));
                setStudents(studentList);
            }
        } catch (error) {
            console.error('Failed to load students', error);
            Alert.alert('Fel', 'Kunde inte hämta studenter.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAttendance = (id: number) => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, isPresent: !s.isPresent } : s
        ));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // In a real app, we would POST this to an attendance endpoint
            // Since we don't have a dedicated attendance endpoint in the snippet, we'll simulate the save
            // but log the REAL data we would send
            console.log('Saving attendance for course:', selectedCourseId, students);

            // Mock API latency
            await new Promise(resolve => setTimeout(resolve, 800));

            Alert.alert('Sparat', 'Närvaron har registrerats.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Fel', 'Kunde inte spara närvaro.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStudent = ({ item }: { item: Student }) => (
        <View style={styles.studentRow}>
            <Text style={styles.studentName}>{item.name}</Text>
            <View style={styles.attendanceControl}>
                <Text style={[styles.statusText, item.isPresent ? styles.presentText : styles.absentText]}>
                    {item.isPresent ? 'Närvarande' : 'Frånvarande'}
                </Text>
                <Switch
                    trackColor={{ false: "#EF4444", true: "#10B981" }}
                    thumbColor={"#FFFFFF"}
                    onValueChange={() => toggleAttendance(item.id)}
                    value={item.isPresent}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('sv-SE')}</Text>
                <Text style={styles.courseTitle}>Matematik 1b (Mock)</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderStudent}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Spara Närvaro</Text>
                </TouchableOpacity>
            </View>
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
    dateText: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
        marginBottom: 4,
    },
    courseTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    listContent: {
        padding: 16,
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    studentName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    attendanceControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        width: 80,
        textAlign: 'right',
    },
    presentText: {
        color: '#10B981',
    },
    absentText: {
        color: '#EF4444',
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    saveButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AttendanceScreen;
