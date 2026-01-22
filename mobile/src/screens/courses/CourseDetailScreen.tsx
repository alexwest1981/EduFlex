import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CoursesStackParamList } from '../../navigation/types';
import { courseService } from '../../services';

import { useThemedStyles } from '../../hooks';
import { Course, Assignment, Lesson, Quiz, CourseMaterial, MaterialType } from '../../types'; // Added CourseMaterial
import { Linking } from 'react-native'; // Added Linking

type CourseDetailScreenNavigationProp = NativeStackNavigationProp<
  CoursesStackParamList,
  'CourseDetail'
>;
type CourseDetailScreenRouteProp = RouteProp<CoursesStackParamList, 'CourseDetail'>;

interface Props {
  navigation: CourseDetailScreenNavigationProp;
  route: CourseDetailScreenRouteProp;
}

const CourseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, styles: themedStyles } = useThemedStyles();
  const { courseId } = route.params;
  const [course, setCourse] = useState<Course | null>(null); // Restored
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]); // Added materials state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'lessons' | 'quizzes' | 'materials'>('overview'); // Added quizzes tab

  const loadData = async () => {
    try {
      const [courseData, assignmentsData, lessonsData, quizzesData, materialsData] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getCourseAssignments(courseId),
        courseService.getCourseLessons(courseId),
        courseService.getCourseQuizzes(courseId),
        courseService.getCourseMaterials(courseId), // Fetch materials
      ]);
      setCourse(courseData);
      setAssignments(assignmentsData);
      setLessons(lessonsData.sort((a, b) => a.sortOrder - b.sortOrder));
      setQuizzes(quizzesData);
      setMaterials(materialsData); // Set materials
      navigation.setOptions({ title: courseData.name });
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,  // Theme: colors.background
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    errorText: {
      fontSize: 16,
      color: colors.textSecondary,  // Theme: colors.textSecondary
    },
    header: {
      padding: 20,
      paddingTop: 16,
      paddingBottom: 24,
    },
    courseCode: {
      fontSize: 12,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 4,
    },
    courseName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.card,
      marginBottom: 8,
    },
    teacherName: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.card,  // Theme: colors.card
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,  // Theme: colors.textSecondary
    },
    activeTabText: {
      color: colors.primary,  // Theme: colors.primary
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 100,
    },
    section: {
      backgroundColor: colors.card,  // Theme: colors.card
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,  // Theme: colors.border
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,  // Theme: colors.text
      marginBottom: 12,
    },
    description: {
      fontSize: 14,
      color: '#4B5563',
      lineHeight: 22,
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    infoItem: {
      minWidth: '45%',
    },
    infoLabel: {
      fontSize: 12,
      color: colors.textSecondary,  // Theme: colors.textSecondary
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,  // Theme: colors.text
    },
    assignmentCard: {
      backgroundColor: colors.card,  // Theme: colors.card
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,  // Theme: colors.border
    },
    assignmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    assignmentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,  // Theme: colors.text
      flex: 1,
      marginRight: 8,
    },
    xpBadge: {
      backgroundColor: '#EEF2FF',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    xpText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,  // Theme: colors.primary
    },
    assignmentDeadline: {
      fontSize: 13,
      color: colors.textSecondary,  // Theme: colors.textSecondary
      marginBottom: 8,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: '#F3F4F6',
    },
    gradedBadge: {
      backgroundColor: '#D1FAE5',
    },
    submittedBadge: {
      backgroundColor: '#DBEAFE',
    },
    lateBadge: {
      backgroundColor: '#FEF3C7',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#374151',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,  // Theme: colors.textSecondary
    },
    // Added Lesson Styles
    lessonCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,  // Theme: colors.card
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,  // Theme: colors.border
    },
    lessonIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    lessonIcon: {
      fontSize: 20,
    },
    lessonInfo: {
      flex: 1,
    },
    lessonOrder: {
      fontSize: 12,
      color: colors.textSecondary,  // Theme: colors.textSecondary
      marginBottom: 4,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    lessonTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,  // Theme: colors.text
    },
    // Added Quiz Styles
    quizCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,  // Theme: colors.card
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,  // Theme: colors.border
    },
    quizIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FEF3C7',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    quizIcon: {
      fontSize: 20,
    },
    quizInfo: {
      flex: 1,
    },
    quizTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,  // Theme: colors.text
      marginBottom: 4,
    },
    quizDate: {
      fontSize: 12,
      color: colors.textSecondary,  // Theme: colors.textSecondary
    },
    // Added Material Styles
    materialCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,  // Theme: colors.card
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,  // Theme: colors.border
    },
    materialIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#E0E7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    materialIcon: {
      fontSize: 20,
    },
    materialInfo: {
      flex: 1,
    },
    materialTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,  // Theme: colors.text
      marginBottom: 4,
    },
    materialType: {
      fontSize: 12,
      color: colors.textSecondary,  // Theme: colors.textSecondary
    },
    chevron: {
      fontSize: 24,
      color: colors.textSecondary,  // Theme: colors.textSecondary
      marginLeft: 16,
    },
  });

  if (isLoading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>Kursen kunde inte laddas</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Course Header */}
      <View style={[styles.header, { backgroundColor: course.colorTheme || colors.primary }]}>
        <Text style={styles.courseCode}>{course.code}</Text>
        <Text style={styles.courseName}>{course.name}</Text>
        {course.teacherName && <Text style={styles.teacherName}>👨‍🏫 {course.teacherName}</Text>}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['overview', 'lessons', 'assignments', 'quizzes', 'materials'] as const).map((tab) => ( // Added quizzes
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'overview' ? 'Översikt' : tab === 'assignments' ? 'Uppgifter' : tab === 'lessons' ? 'Lektioner' : tab === 'quizzes' ? 'Prov' : 'Material'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {activeTab === 'overview' && (
          <View>
            {course.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Beskrivning</Text>
                <Text style={styles.description}>{course.description}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kursinformation</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={[styles.infoValue, { color: course.isOpen ? '#059669' : '#DC2626' }]}>
                    {course.isOpen ? 'Aktiv' : 'Stängd'}
                  </Text>
                </View>
                {course.startDate && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Startdatum</Text>
                    <Text style={styles.infoValue}>{course.startDate}</Text>
                  </View>
                )}
                {course.endDate && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Slutdatum</Text>
                    <Text style={styles.infoValue}>{course.endDate}</Text>
                  </View>
                )}
                {course.studentCount !== undefined && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Deltagare</Text>
                    <Text style={styles.infoValue}>{course.studentCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <View>
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <TouchableOpacity
                  key={quiz.id}
                  style={styles.quizCard}
                  onPress={() => navigation.navigate('Quiz', { quizId: quiz.id, courseId: course.id })}
                >
                  <View style={styles.quizIconContainer}>
                    <Text style={styles.quizIcon}>❓</Text>
                  </View>
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    {quiz.availableTo && (
                      <Text style={styles.quizDate}>
                        Tillgänglig till: {new Date(quiz.availableTo).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>Inga prov tillgängliga</Text>
              </View>
            )}
          </View>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <View>
            {materials.length > 0 ? (
              materials.map((material) => (
                <TouchableOpacity
                  key={material.id}
                  style={styles.materialCard}
                  onPress={() => {
                    if (material.link) Linking.openURL(material.link);
                    else if (material.fileUrl) Linking.openURL(material.fileUrl);
                    else alert(material.content || 'Inget innehåll');
                  }}
                >
                  <View style={styles.materialIconContainer}>
                    <Text style={styles.materialIcon}>
                      {material.type === 'VIDEO' ? '🎥' :
                        material.type === 'LINK' ? '🔗' :
                          material.type === 'FILE' ? '📎' : '📄'}
                    </Text>
                  </View>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{material.title}</Text>
                    <Text style={styles.materialType}>{material.type}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📂</Text>
                <Text style={styles.emptyText}>Inget material tillgängligt</Text>
              </View>
            )}
          </View>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <View>
            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonCard}
                  onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id, courseId: course.id })}
                >
                  <View style={styles.lessonIconContainer}>
                    <Text style={styles.lessonIcon}>{lesson.videoUrl ? '🎥' : '📄'}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonOrder}>Lektion {lesson.sortOrder}</Text>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📚</Text>
                <Text style={styles.emptyText}>Inga lektioner ännu</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'assignments' && (
          <View>
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <TouchableOpacity
                  key={assignment.id}
                  style={styles.assignmentCard}
                  onPress={() => navigation.navigate('Assignment', { assignmentId: assignment.id })}
                >
                  <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                    {assignment.xpReward && (
                      <View style={styles.xpBadge}>
                        <Text style={styles.xpText}>+{assignment.xpReward} XP</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.assignmentDeadline}>
                    📅 Deadline: {new Date(assignment.deadline).toLocaleDateString('sv-SE')}
                  </Text>
                  {assignment.status && (
                    <View
                      style={[
                        styles.statusBadge,
                        assignment.status === 'GRADED' && styles.gradedBadge,
                        assignment.status === 'SUBMITTED' && styles.submittedBadge,
                        assignment.status === 'LATE' && styles.lateBadge,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {assignment.status === 'GRADED'
                          ? '✓ Rättad'
                          : assignment.status === 'SUBMITTED'
                            ? '📤 Inlämnad'
                            : assignment.status === 'LATE'
                              ? '⚠️ Sen'
                              : '📝 Öppen'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>Inga uppgifter ännu</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'materials' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>Material kommer snart</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CourseDetailScreen;
