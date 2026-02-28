import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PlayCircle, Download } from 'lucide-react-native';

const CourseDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { courseId, courseName } = route.params;

    // In a real app, query useGetCourseByIdQuery(courseId) here

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{courseName}</Text>
                <Text style={styles.subtitle}>Video och material för offline-bruk.</Text>
            </View>

            <View style={styles.videoPlaceholder}>
                <PlayCircle color="#fff" size={48} />
                <Text style={styles.videoText}>Spela Upp AI-Lektion</Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                    <Download color="#00F5FF" size={20} />
                    <Text style={styles.actionButtonText}>Ladda ner för fristående läge</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { borderColor: '#FBBF24', marginTop: 12 }]}
                    onPress={() => navigation.navigate('Quiz', { quizId: 1, quizTitle: "Test Quiz" })}
                >
                    <Text style={[styles.actionButtonText, { color: '#FBBF24' }]}>Starta Quiz</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { borderColor: '#b14bff', marginTop: 12 }]}
                    onPress={() => navigation.navigate('Ebook', { bookId: 2, bookTitle: "Kurslitteratur" })}
                >
                    <Text style={[styles.actionButtonText, { color: '#b14bff' }]}>Läs E-bok</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { borderColor: '#10b981', marginTop: 12 }]}
                    onPress={() => navigation.navigate('Assignment', { assignmentId: 1, assignmentTitle: "Laboration 1: React Native" })}
                >
                    <Text style={[styles.actionButtonText, { color: '#10b981' }]}>Gör Inlämning</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.modulesSection}>
                <Text style={styles.sectionTitle}>Moduler</Text>
                <View style={styles.moduleCard}>
                    <Text style={styles.moduleTitle}>1. Introduktion</Text>
                    <Text style={styles.moduleSubtitle}>Inkluderar övningsuppgifter</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    moduleCard: { backgroundColor: '#1a1b1d', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    moduleTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    moduleSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
});

export default CourseDetailScreen;
