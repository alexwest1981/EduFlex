import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../../services/api';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

const CourseStatisticsScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/courses');
                setCourses(response.data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <View style={styles.container}>
            {isLoading ? <ActivityIndicator size="large" color="#4F46E5" /> : (
                <FlatList
                    data={courses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.desc}>{item.description}</Text>
                            <Text style={styles.status}>{item.isOpen ? 'Öppen' : 'Stängd'}</Text>
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
    title: { fontWeight: '600', fontSize: 16 },
    desc: { color: 'gray', marginVertical: 4 },
    status: { color: '#4F46E5',  // Theme: '#4F46E5' fontWeight: '500' }
});

export default CourseStatisticsScreen;
