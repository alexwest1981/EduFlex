import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CoursesStackParamList } from '../../navigation/types';
import { courseService } from '../../services';
import { Lesson } from '../../types';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

type LessonScreenNavigationProp = NativeStackNavigationProp<
    CoursesStackParamList,
    'Lesson'
>;
type LessonScreenRouteProp = RouteProp<CoursesStackParamList, 'Lesson'>;

interface Props {
    navigation: LessonScreenNavigationProp;
    route: LessonScreenRouteProp;
}

const LessonScreen: React.FC<Props> = ({ navigation, route }) => {
    const { lessonId, courseId } = route.params;
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLessons();
    }, [courseId]);

    useEffect(() => {
        if (lessons.length > 0) {
            const found = lessons.find((l) => l.id === lessonId);
            setCurrentLesson(found || null);
        }
    }, [lessonId, lessons]);

    const loadLessons = async () => {
        try {
            const data = await courseService.getCourseLessons(courseId);
            setLessons(data.sort((a, b) => a.sortOrder - b.sortOrder));
        } catch (error) {
            console.error('Failed to load lessons:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextLesson = () => {
        if (!currentLesson) return;
        const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
        if (currentIndex < lessons.length - 1) {
            const nextLesson = lessons[currentIndex + 1];
            navigation.replace('Lesson', { lessonId: nextLesson.id, courseId });
        }
    };

    const handlePrevLesson = () => {
        if (!currentLesson) return;
        const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
        if (currentIndex > 0) {
            const prevLesson = lessons[currentIndex - 1];
            navigation.replace('Lesson', { lessonId: prevLesson.id, courseId });
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!currentLesson) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Lektionen hittades inte</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.courseTitle}>Lektion {currentLesson.sortOrder}</Text>
                <Text style={styles.title}>{currentLesson.title}</Text>
            </View>

            {/* Video Section */}
            {currentLesson.videoUrl && (
                <TouchableOpacity
                    style={styles.videoCard}
                    onPress={() => Linking.openURL(currentLesson.videoUrl!)}
                >
                    <View style={styles.videoIconContainer}>
                        <Text style={styles.videoIcon}>▶️</Text>
                    </View>
                    <View style={styles.videoInfo}>
                        <Text style={styles.videoLabel}>Se videolektion</Text>
                        <Text style={styles.videoUrl} numberOfLines={1}>
                            {currentLesson.videoUrl}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Content Section */}
            <View style={styles.contentContainer}>
                <Text style={styles.content}>{currentLesson.content}</Text>
            </View>

            {/* Attachment Section */}
            {currentLesson.attachmentUrl && (
                <TouchableOpacity
                    style={styles.attachmentCard}
                    onPress={() => Linking.openURL(currentLesson.attachmentUrl!)}
                >
                    <Text style={styles.attachmentIcon}>📎</Text>
                    <Text style={styles.attachmentName}>
                        {currentLesson.attachmentName || 'Bifogad fil'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Navigation Buttons */}
            <View style={styles.navigationButtons}>
                <TouchableOpacity
                    style={[styles.navButton, styles.prevButton]}
                    onPress={handlePrevLesson}
                    disabled={lessons.findIndex((l) => l.id === currentLesson.id) === 0}
                >
                    <Text style={styles.navButtonText}>← Föregående</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navButton, styles.nextButton]}
                    onPress={handleNextLesson}
                    disabled={
                        lessons.findIndex((l) => l.id === currentLesson.id) === lessons.length - 1
                    }
                >
                    <Text style={styles.navButtonText}>Nästa →</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
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
    errorText: {
        fontSize: 16,
        color: '#DC2626',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    courseTitle: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    videoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        margin: 20,
        marginBottom: 0,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    videoIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    videoIcon: {
        fontSize: 20,
    },
    videoInfo: {
        flex: 1,
    },
    videoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F46E5',  // Theme: '#4F46E5'
        marginBottom: 2,
    },
    videoUrl: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    contentContainer: {
        padding: 20,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        color: '#374151',
    },
    attachmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 12,
        borderRadius: 8,
    },
    attachmentIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    attachmentName: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 0,
        gap: 12,
    },
    navButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
    prevButton: {
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
    },
    nextButton: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    navButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
});

export default LessonScreen;
