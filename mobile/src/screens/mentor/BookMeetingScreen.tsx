import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

const BookMeetingScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const navigation = useNavigation();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Form states
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [time, setTime] = useState('10:00');
    const [topic, setTopic] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setIsLoading(true);
        try {
            // ideally we should have /api/mentor/students, but we use /users and filter for now
            const response = await api.get('/users?role=STUDENT');
            const allUsers = response.data.content || response.data; // Handle pagination or list
            // Filter out non-students just in case backend didn't filter strictly
            const studentList = allUsers.filter((u: any) =>
                (typeof u.role === 'string' && u.role === 'STUDENT') ||
                (typeof u.role === 'object' && u.role.name === 'STUDENT')
            );
            setStudents(studentList);
        } catch (error) {
            console.error(error);
            Alert.alert('Fel', 'Kunde inte hämta studentlistan.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selectedStudent || !date || !time || !topic) {
            Alert.alert('Fel', 'Fyll i alla fält');
            return;
        }

        setIsLoading(true);
        try {
            // Create event
            const startTime = `${date}T${time}:00`;
            // Default 1 hour duration
            const [h, m] = time.split(':').map(Number);
            const endH = h + 1;
            const endTime = `${date}T${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;

            const payload = {
                title: `Utvecklingssamtal: ${selectedStudent.firstName} ${selectedStudent.lastName}`,
                description: `Samtal med ${selectedStudent.firstName} om: ${topic}`,
                startTime: startTime,
                endTime: endTime,
                type: 'MEETING',
                status: 'CONFIRMED',
                topic: topic,
                ownerId: user?.id
            };

            console.log('Booking meeting:', payload);
            await api.post('/events', payload);

            Alert.alert('Bokat', 'Möte har bokats och lagts till i kalendern.');
            navigation.goBack();

        } catch (error) {
            console.error(error);
            Alert.alert('Fel', 'Kunde inte boka mötet.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStudentItem = ({ item }: { item: Student }) => (
        <TouchableOpacity
            style={[styles.studentItem, selectedStudent?.id === item.id && styles.studentItemSelected]}
            onPress={() => setSelectedStudent(item)}
        >
            <Text style={[styles.studentName, selectedStudent?.id === item.id && styles.studentNameSelected]}>
                {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.studentEmail}>{item.email}</Text>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View>
            <View style={styles.section}>
                <Text style={styles.label}>Välj Elev</Text>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View>
            <View style={styles.section}>
                <Text style={styles.label}>Datum (YYYY-MM-DD)</Text>
                <TextInput
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                    placeholder="2024-01-01"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Tid (HH:MM)</Text>
                <TextInput
                    style={styles.input}
                    value={time}
                    onChangeText={setTime}
                    placeholder="10:00"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Ämne / Agenda</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={topic}
                    onChangeText={setTopic}
                    placeholder="Vad ska samtalet handla om?"
                    multiline
                    numberOfLines={4}
                />
            </View>

            <TouchableOpacity
                style={[styles.bookButton, (!selectedStudent) && styles.disabledButton]}
                onPress={handleBook}
                disabled={!selectedStudent || isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.bookButtonText}>Boka Möte</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Boka Utvecklingssamtal</Text>
            </View>

            <FlatList
                data={students}
                renderItem={renderStudentItem}
                keyExtractor={item => item.id.toString()}
                style={styles.content}
                ListHeaderComponent={renderHeader()}
                ListFooterComponent={renderFooter()}
                ListEmptyComponent={
                    isLoading ? <ActivityIndicator color="#4F46E5" /> : <Text style={{ padding: 10, color: '#666' }}>Inga studenter hittades</Text>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </KeyboardAvoidingView>
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
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',  // Theme: '#111827'
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    studentListContainer: {
        height: 200,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
        borderRadius: 8,
    },
    studentItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    studentItemSelected: {
        backgroundColor: '#EFF6FF',
    },
    studentName: {
        fontSize: 16,
        color: '#374151',
    },
    studentNameSelected: {
        fontWeight: '600',
        color: '#1E40AF',
    },
    studentEmail: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    bookButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default BookMeetingScreen;
