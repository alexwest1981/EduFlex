import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../../services/api';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

const TeacherOverviewScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await api.get('/users?role=TEACHER');
                const data = response.data.content || response.data;
                setTeachers(data.filter((u: any) => u.role === 'TEACHER' || u.role?.name === 'TEACHER'));
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    return (
        <View style={styles.container}>
            {isLoading ? <ActivityIndicator size="large" color="#4F46E5" /> : (
                <FlatList
                    data={teachers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                            <Text style={styles.email}>{item.email}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB' padding: 16 },
    card: { backgroundColor: '#fff', padding: 16, marginBottom: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
    name: { fontWeight: '600', fontSize: 16 },
    email: { color: 'gray' }
});

export default TeacherOverviewScreen;
