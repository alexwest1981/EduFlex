import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    class?: string;
}

const StudentListScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const response = await api.get('/users?role=STUDENT');
            const data = response.data.content || response.data;
            const studentList = data.filter((u: any) =>
                u.role === 'STUDENT' || u.role?.name === 'STUDENT'
            );
            setStudents(studentList);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Student }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('StudentAnalysis', { studentId: item.id })}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.email}>{item.email}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>Inga elever hittades.</Text>}
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
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#4F46E5',  // Theme: '#4F46E5'
        fontWeight: '700',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',  // Theme: '#111827'
    },
    email: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    arrow: {
        fontSize: 24,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    empty: {
        textAlign: 'center',
        color: '#6B7280',  // Theme: '#6B7280'
        marginTop: 20,
    }
});

export default StudentListScreen;
