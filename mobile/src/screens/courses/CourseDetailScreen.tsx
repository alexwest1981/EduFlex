import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CoursesStackParamList } from '../../navigation/types';
import { courseService } from '../../services';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import { Course, Assignment, Lesson, Quiz, CourseMaterial } from '../../types';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

type CourseDetailScreenNavigationProp = NativeStackNavigationProp<
  CoursesStackParamList,
  'CourseDetail'
>;
type CourseDetailScreenRouteProp = RouteProp<CoursesStackParamList, 'CourseDetail'>;

interface Props {
  navigation: CourseDetailScreenNavigationProp;
  route: CourseDetailScreenRouteProp;
}

const STATUS_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string; bg: string; border: string }> = {
  PENDING: { icon: 'time-outline', color: '#f59e0b', label: 'Ej inlämnad', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  SUBMITTED: { icon: 'checkmark-circle-outline', color: '#2547f4', label: 'Inlämnad', bg: 'rgba(37,71,244,0.1)', border: 'rgba(37,71,244,0.3)' },
  GRADED: { icon: 'ribbon-outline', color: '#10b981', label: 'Rättad', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  LATE: { icon: 'alert-circle-outline', color: '#ef4444', label: 'Sen', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
};

const CourseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { currentTheme } = useTheme();
  const colors = getThemeColors(currentTheme);
  const insets = useSafeAreaInsets();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [courseData, assignmentsData, lessonsData, quizzesData, materialsData] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getCourseAssignments(courseId),
        courseService.getCourseLessons(courseId),
        courseService.getCourseQuizzes(courseId),
        courseService.getCourseMaterials(courseId),
      ]);
      setCourse(courseData);
      setAssignments(assignmentsData);
      setLessons(lessonsData.sort((a, b) => a.sortOrder - b.sortOrder));
      setQuizzes(quizzesData);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    loadData();
  }, [courseId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const submittedAssignments = assignments.filter(a => a.status === 'SUBMITTED' || a.status === 'GRADED').length;
  const progressPercent = course?.progress ?? (
    assignments.length > 0
      ? Math.round((submittedAssignments / assignments.length) * 100)
      : 0
  );

  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>Kursen kunde inte laddas</Text>
      </View>
    );
  }

  const notSubmittedAssignments = assignments.filter(a => !a.status || a.status === 'PENDING');
  const doneAssignments = assignments.filter(a => a.status === 'SUBMITTED' || a.status === 'GRADED');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course.name}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressLabel}>Framsteg</Text>
              <Text style={styles.progressValue}>
                {progressPercent}<Text style={styles.progressPercent}>%</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statusLabel}>
                {progressPercent === 100 ? 'Klar' : 'Pågår'}
              </Text>
              <Text style={styles.statusHint}>
                {progressPercent < 50 ? 'Fortsätt så, du klarar det!' : 'Bra jobbat, snart klart!'}
              </Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
            <View style={[styles.statIconWrap, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {quizzes.length > 0 ? `0/${quizzes.length}` : '0'}
            </Text>
            <Text style={styles.statLabel}>Prov klara</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#7c3aed' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(124,58,237,0.1)' }]}>
              <Ionicons name="document-text-outline" size={22} color="#7c3aed" />
            </View>
            <Text style={styles.statValue}>
              {submittedAssignments}/{assignments.length}
            </Text>
            <Text style={styles.statLabel}>Uppgifter</Text>
          </View>
        </View>

        {/* Quiz Results */}
        {quizzes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mina provresultat</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>Visa alla</Text>
              </TouchableOpacity>
            </View>
            {quizzes.map((quiz) => (
              <TouchableOpacity
                key={quiz.id}
                style={styles.quizCard}
                onPress={() => navigation.navigate('Quiz', { quizId: quiz.id, courseId: course.id })}
              >
                <View style={styles.quizIconWrap}>
                  <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  {quiz.availableTo && (
                    <Text style={styles.quizDate}>
                      Tillgänglig till {format(new Date(quiz.availableTo), 'd MMM', { locale: sv })}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.quizScore}>{quiz.questions?.length || '?'} frågor</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Not Submitted Assignments */}
        {notSubmittedAssignments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Att lämna in</Text>
            </View>
            {notSubmittedAssignments.map((assignment) => {
              const isPastDue = new Date(assignment.deadline) < new Date();
              return (
                <TouchableOpacity
                  key={assignment.id}
                  style={[styles.assignmentCardAlert, isPastDue && styles.assignmentOverdue]}
                  onPress={() => navigation.navigate('Assignment', { assignmentId: assignment.id })}
                >
                  <View style={styles.assignmentTop}>
                    <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                      <View style={[styles.assignmentIconWrap, { backgroundColor: isPastDue ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)' }]}>
                        <Ionicons name="time-outline" size={22} color={isPastDue ? '#ef4444' : '#f59e0b'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Ionicons name="calendar-outline" size={12} color={isPastDue ? '#ef4444' : colors.textMuted} />
                          <Text style={[styles.assignmentDate, isPastDue && { color: '#ef4444' }]}>
                            Deadline: {format(new Date(assignment.deadline), 'd MMM yyyy', { locale: sv })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isPastDue ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', borderColor: isPastDue ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)' }]}>
                      <Text style={[styles.statusBadgeText, { color: isPastDue ? '#ef4444' : '#f59e0b' }]}>
                        {isPastDue ? 'Försenad' : 'Ej inlämnad'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => navigation.navigate('SubmitAssignment', { assignmentId: assignment.id })}
                  >
                    <Text style={styles.submitButtonText}>Lämna in uppgift</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Submitted / Graded Assignments */}
        {doneAssignments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Inlämnade uppgifter</Text>
            </View>
            {doneAssignments.map((assignment) => {
              const config = STATUS_CONFIG[assignment.status || 'SUBMITTED'];
              return (
                <TouchableOpacity
                  key={assignment.id}
                  style={styles.assignmentCardDone}
                  onPress={() => navigation.navigate('Assignment', { assignmentId: assignment.id })}
                >
                  <View style={styles.assignmentTop}>
                    <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                      <View style={[styles.assignmentIconWrap, { backgroundColor: `${config.color}15` }]}>
                        <Ionicons name={config.icon} size={22} color={config.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                          <Text style={[styles.assignmentDate, { color: '#10b981' }]}>
                            {assignment.submittedAt
                              ? `Inlämnad ${format(new Date(assignment.submittedAt), 'd MMM', { locale: sv })}`
                              : 'Inlämnad'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
                      <Text style={[styles.statusBadgeText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Lessons */}
        {lessons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lektioner</Text>
              <Text style={styles.viewAll}>{lessons.length} st</Text>
            </View>
            {lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id, courseId: course.id })}
              >
                <View style={styles.lessonIconWrap}>
                  <Ionicons
                    name={lesson.videoUrl ? 'videocam-outline' : 'document-text-outline'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lessonOrder}>Lektion {lesson.sortOrder}</Text>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Material</Text>
              <Text style={styles.viewAll}>{materials.length} st</Text>
            </View>
            {materials.map((material) => (
              <TouchableOpacity
                key={material.id}
                style={styles.lessonCard}
              >
                <View style={[styles.lessonIconWrap, { backgroundColor: 'rgba(124,58,237,0.1)' }]}>
                  <Ionicons
                    name={
                      material.type === 'VIDEO' ? 'videocam-outline' :
                      material.type === 'LINK' ? 'link-outline' :
                      material.type === 'FILE' ? 'attach-outline' : 'document-outline'
                    }
                    size={20}
                    color="#7c3aed"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lessonTitle}>{material.title}</Text>
                  <Text style={styles.materialType}>{material.type}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty state */}
        {assignments.length === 0 && quizzes.length === 0 && lessons.length === 0 && materials.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Kursinnehåll kommer snart</Text>
            <Text style={styles.emptyHint}>Din lärare har inte lagt till något material ännu</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof getThemeColors>, insets: { top: number }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    errorText: {
      fontFamily: 'Lexend_500Medium',
      fontSize: 16,
      color: colors.textMuted,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: insets.top + 8,
      paddingBottom: 12,
      paddingHorizontal: 20,
      backgroundColor: colors.isDark ? 'rgba(10,12,22,0.8)' : 'rgba(245,246,248,0.9)',
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      fontFamily: 'Lexend_700Bold',
      fontSize: 20,
      color: colors.text,
      textAlign: 'center',
      marginHorizontal: 12,
    },

    // Scroll
    scrollContent: {
      padding: 20,
      paddingBottom: 100,
    },

    // Progress Card
    progressCard: {
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 16,
    },
    progressLabel: {
      fontFamily: 'Lexend_500Medium',
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 4,
    },
    progressValue: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 32,
      color: colors.text,
    },
    progressPercent: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 20,
      color: colors.primary,
    },
    statusLabel: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 11,
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4,
    },
    statusHint: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 11,
      color: colors.textMuted,
    },
    progressTrack: {
      height: 10,
      backgroundColor: colors.isDark ? 'rgba(30,41,59,1)' : 'rgba(226,232,240,1)',
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 5,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 6,
      elevation: 3,
    },

    // Stats Grid
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 16,
      padding: 16,
      borderLeftWidth: 4,
    },
    statIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    statValue: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 24,
      color: colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontFamily: 'Lexend_500Medium',
      fontSize: 11,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Sections
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 17,
      color: colors.text,
    },
    viewAll: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 13,
      color: colors.primary,
    },

    // Quiz Cards
    quizCard: {
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 14,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    quizIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(16,185,129,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(16,185,129,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    quizTitle: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 14,
      color: colors.text,
    },
    quizDate: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    quizScore: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 14,
      color: colors.textMuted,
    },

    // Assignment Cards - Not Submitted
    assignmentCardAlert: {
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: 'rgba(245,158,11,0.3)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    assignmentOverdue: {
      borderColor: 'rgba(239,68,68,0.3)',
      backgroundColor: colors.isDark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.03)',
    },
    assignmentTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    assignmentIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    assignmentTitle: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 15,
      color: colors.text,
    },
    assignmentDate: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: colors.textMuted,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    statusBadgeText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 9,
      textTransform: 'uppercase',
    },
    submitButton: {
      backgroundColor: colors.isDark ? '#fff' : colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    submitButtonText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 14,
      color: colors.isDark ? '#0a0c16' : '#fff',
    },

    // Assignment Cards - Done
    assignmentCardDone: {
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },

    // Lesson Cards
    lessonCard: {
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 14,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    lessonIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    lessonOrder: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 11,
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    lessonTitle: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 14,
      color: colors.text,
    },
    materialType: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },

    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      gap: 8,
    },
    emptyText: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 16,
      color: colors.textMuted,
    },
    emptyHint: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: colors.textMuted,
      opacity: 0.7,
    },
  });

export default CourseDetailScreen;
