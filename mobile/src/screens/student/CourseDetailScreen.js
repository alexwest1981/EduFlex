import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PlayCircle, Download, CheckCircle, FileText, Video as VideoIcon, HelpCircle } from 'lucide-react-native';
import { useGetCourseByIdQuery, useGetCourseMaterialsQuery } from '../../store/slices/apiSlice';

const CourseDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { courseId, courseName } = route.params;

    const { data: course, isLoading: isLoadingCourse } = useGetCourseByIdQuery(courseId);
    const { data: materials, isLoading: isLoadingMaterials, refetch: refetchMaterials } = useGetCourseMaterialsQuery(courseId);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        // Pre-fetch all materials to ensure they are in the cache
        await refetchMaterials();
        setTimeout(() => {
            setIsDownloading(false);
            alert('Kursen är nu tillgänglig offline!');
        }, 1500);
    };

    if (isLoadingCourse) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00F5FF" />
            </View>
        );
    }

    const renderMaterialIcon = (type) => {
        switch (type) {
            case 'VIDEO': return <VideoIcon color="#00F5FF" size={20} />;
            case 'QUIZ': return <HelpCircle color="#FBBF24" size={20} />;
            default: return <FileText color="#fff" size={20} />;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{course?.name || courseName}</Text>
                <Text style={styles.subtitle}>{course?.description || 'Video och material för offline-bruk.'}</Text>
            </View>

            <View style={styles.videoPlaceholder}>
                <PlayCircle color="#fff" size={48} />
                <Text style={styles.videoText}>Spela Upp AI-Lektion</Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionButton, isDownloading && { opacity: 0.7 }]}
                    onPress={handleDownload}
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <ActivityIndicator color="#00F5FF" size="small" />
                    ) : (
                        <Download color="#00F5FF" size={20} />
                    )}
                    <Text style={styles.actionButtonText}>
                        {isDownloading ? 'Laddar ner...' : 'Ladda ner för fristående läge'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.modulesSection}>
                <Text style={styles.sectionTitle}>Kursinnehåll</Text>
                {isLoadingMaterials ? (
                    <ActivityIndicator color="#00F5FF" />
                ) : (
                    materials?.map((material, index) => (
                        <TouchableOpacity
                            key={material.id}
                            style={styles.moduleCard}
                            onPress={() => {
                                if (material.type === 'QUIZ') {
                                    navigation.navigate('Quiz', { quizId: material.id, quizTitle: material.title });
                                } else {
                                    // Handle general lesson/media
                                    console.log('Opening material:', material.title);
                                }
                            }}
                        >
                            <View style={styles.moduleInfo}>
                                {renderMaterialIcon(material.type)}
                                <View>
                                    <Text style={styles.moduleTitle}>{index + 1}. {material.title}</Text>
                                    <Text style={styles.moduleSubtitle}>{material.type}</Text>
                                </View>
                            </View>
                            {material.completed && <CheckCircle color="#10b981" size={18} />}
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#0f1012' },
    header: { padding: 20, paddingTop: 60, paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#888' },
    videoPlaceholder: { height: 220, backgroundColor: '#1a1b1d', justifyContent: 'center', alignItems: 'center', gap: 12 },
    videoText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    actionRow: { padding: 20 },
    actionButton: { flexDirection: 'row', backgroundColor: 'rgba(0, 245, 255, 0.1)', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#00F5FF' },
    actionButtonText: { color: '#00F5FF', fontWeight: 'bold', fontSize: 16 },
    modulesSection: { padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    moduleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1a1b1d', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
    moduleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    moduleTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    moduleSubtitle: { fontSize: 12, color: '#888', marginTop: 2, textTransform: 'lowercase' },
});

export default CourseDetailScreen;
