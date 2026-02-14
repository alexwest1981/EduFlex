import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CoursesStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import { Course } from '../../types';

type CourseListScreenNavigationProp = NativeStackNavigationProp<CoursesStackParamList, 'CourseList'>;

interface Props {
  navigation: CourseListScreenNavigationProp;
}

const CATEGORY_FILTERS = [
  { key: 'all', label: 'Alla kurser' },
  { key: 'data', label: 'Data & IT' },
  { key: 'ekonomi', label: 'Ekonomi' },
  { key: 'design', label: 'Design' },
  { key: 'språk', label: 'Språk' },
];

const CourseListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = getThemeColors(currentTheme);
  const insets = useSafeAreaInsets();

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCourses = useCallback(async () => {
    if (!user) return;
    try {
      const [catalogData, myData] = await Promise.all([
        courseService.getCourses(0, 50).then(r => r.content),
        courseService.getStudentCourses(user.id),
      ]);
      setAllCourses(catalogData);
      setMyCourses(myData);
    } catch (error) {
      console.error('Failed to load courses:', error);
      // Fallback to student courses only
      try {
        const myData = await courseService.getStudentCourses(user.id);
        setMyCourses(myData);
        setAllCourses(myData);
      } catch { }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCourses();
    setIsRefreshing(false);
  };

  const myCoursesIds = useMemo(() => new Set(myCourses.map(c => c.id)), [myCourses]);

  const filteredCourses = useMemo(() => {
    let courses = allCourses;

    if (activeCategory !== 'all') {
      courses = courses.filter(c =>
        c.category?.toLowerCase().includes(activeCategory)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      courses = courses.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    }

    return courses;
  }, [allCourses, activeCategory, searchQuery]);

  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.avatarGradient}>
              <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.welcomeText}>Välkommen tillbaka,</Text>
              <Text style={styles.userName}>{user?.fullName || 'Elev'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.getParent()?.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={{ marginLeft: 14 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök kurser, ämnen..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={{ marginBottom: 24 }}
        >
          {CATEGORY_FILTERS.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, activeCategory === cat.key && styles.chipActive]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text style={[styles.chipText, activeCategory === cat.key && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'all' ? 'Alla kurser' : CATEGORY_FILTERS.find(c => c.key === activeCategory)?.label}
          </Text>
          <Text style={styles.courseCount}>{filteredCourses.length} st</Text>
        </View>

        {/* Course Cards */}
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const isEnrolled = myCoursesIds.has(course.id);
            const progressPercent = course.progress ?? 0;

            return (
              <View key={course.id} style={styles.courseCard}>
                {/* Course Image Area */}
                <View style={styles.courseImageArea}>
                  <View style={styles.courseImagePlaceholder}>
                    <Ionicons name="school" size={40} color={`${colors.primary}40`} />
                  </View>
                  <View style={styles.courseImageOverlay} />
                  {course.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{course.category}</Text>
                    </View>
                  )}
                </View>

                {/* Course Info */}
                <View style={styles.courseInfo}>
                  <View style={styles.courseTopRow}>
                    <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
                    {course.code && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="star" size={14} color="#f59e0b" />
                        <Text style={styles.courseCode}>{course.code}</Text>
                      </View>
                    )}
                  </View>

                  {course.description && (
                    <Text style={styles.courseDescription} numberOfLines={2}>
                      {course.description}
                    </Text>
                  )}

                  {/* Meta Info */}
                  <View style={styles.courseMeta}>
                    {course.teacherName && (
                      <View style={styles.metaItem}>
                        <Ionicons name="person-outline" size={14} color={colors.primary} />
                        <Text style={styles.metaText}>{course.teacherName}</Text>
                      </View>
                    )}
                    {course.studentCount !== undefined && (
                      <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={14} color={colors.primary} />
                        <Text style={styles.metaText}>{course.studentCount} elever</Text>
                      </View>
                    )}
                  </View>

                  {/* Progress Bar (if enrolled) */}
                  {isEnrolled && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.infoButton}
                      onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                    >
                      <Text style={styles.infoButtonText}>Info</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryButton, isEnrolled && styles.enrolledButton]}
                      onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                    >
                      <Text style={[styles.primaryButtonText, isEnrolled && styles.enrolledButtonText]}>
                        {isEnrolled ? 'Öppna' : 'Ansök'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Inga kurser hittades</Text>
            <Text style={styles.emptyHint}>
              {searchQuery ? 'Prova med ett annat sökord' : 'Inga kurser i denna kategori'}
            </Text>
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
    },

    // Header
    header: {
      paddingTop: insets.top + 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: colors.isDark ? 'rgba(11,11,12,0.8)' : 'rgba(245,246,248,0.9)',
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    avatarGradient: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.glassBorder,
    },
    welcomeText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 11,
      color: colors.textMuted,
    },
    userName: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 14,
      color: colors.text,
    },
    notifBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderRadius: 14,
      height: 48,
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      color: colors.text,
      marginLeft: 10,
      marginRight: 14,
    },

    // Scroll
    scrollContent: {
      paddingTop: 20,
      paddingHorizontal: 16,
      paddingBottom: 100,
    },

    // Category Chips
    chipsRow: {
      gap: 8,
      paddingRight: 16,
    },
    chip: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 50,
      backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    },
    chipActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    chipText: {
      fontFamily: 'Lexend_500Medium',
      fontSize: 13,
      color: colors.textMuted,
    },
    chipTextActive: {
      color: '#fff',
      fontFamily: 'Lexend_600SemiBold',
    },

    // Section
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 20,
      color: colors.text,
    },
    courseCount: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 13,
      color: colors.primary,
    },

    // Course Cards
    courseCard: {
      backgroundColor: colors.isDark ? '#161618' : '#fff',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
      marginBottom: 20,
    },
    courseImageArea: {
      height: 160,
      backgroundColor: colors.isDark ? 'rgba(37,71,244,0.08)' : 'rgba(37,71,244,0.04)',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    courseImagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    courseImageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: colors.isDark ? '#161618' : '#fff',
      opacity: 0.8,
    },
    categoryBadge: {
      position: 'absolute',
      top: 14,
      left: 14,
      backgroundColor: `${colors.primary}25`,
      borderWidth: 1,
      borderColor: `${colors.primary}40`,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    categoryBadgeText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 9,
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    courseInfo: {
      padding: 18,
    },
    courseTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    courseName: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 17,
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    courseCode: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
      color: '#f59e0b',
      marginLeft: 4,
    },
    courseDescription: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 20,
      marginBottom: 14,
    },
    courseMeta: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metaText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: colors.textMuted,
    },
    progressSection: {
      marginBottom: 16,
    },
    progressTrack: {
      height: 5,
      backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
    },
    infoButton: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 10,
      backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: 'center',
    },
    infoButtonText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 14,
      color: colors.text,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 14,
      color: '#fff',
    },
    enrolledButton: {
      backgroundColor: colors.isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
      shadowOpacity: 0,
      elevation: 0,
    },
    enrolledButtonText: {
      color: '#10b981',
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

export default CourseListScreen;
