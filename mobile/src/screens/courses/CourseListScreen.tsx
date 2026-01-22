import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CoursesStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services';
import { Course } from '../../types';
import CourseCard from '../../components/CourseCard';

import { useThemedStyles } from '../../hooks';

type CourseListScreenNavigationProp = NativeStackNavigationProp<CoursesStackParamList, 'CourseList'>;

interface Props {
  navigation: CourseListScreenNavigationProp;
}

const CourseListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { colors, styles: themedStyles } = useThemedStyles();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCourses = async () => {
    if (!user) return;
    try {
      const data = await courseService.getStudentCourses(user.id);
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCourses();
    setIsRefreshing(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: 60,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>Inga kurser</Text>
            <Text style={styles.emptyText}>Du är inte registrerad på några kurser ännu.</Text>
          </View>
        }
      />
    </View>
  );
};

export default CourseListScreen;
