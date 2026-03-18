import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Book, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGetEbookByIdQuery, useGetEbookProgressQuery, useSaveEbookProgressMutation } from '../../store/slices/apiSlice';

const EbookScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { ebookId, bookTitle: initialTitle } = route.params || {};

    const { data: ebook, isLoading: isLoadingEbook } = useGetEbookByIdQuery(ebookId);
    const { data: progress, isLoading: isLoadingProgress } = useGetEbookProgressQuery(ebookId);
    const [saveProgress] = useSaveEbookProgressMutation();

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = ebook?.pagesCount || 10; // Fallback to 10 if not specified

    useEffect(() => {
        if (progress?.lastPage) {
            setCurrentPage(progress.lastPage);
        }
    }, [progress]);

    // Save progress when page changes (debounced or on unmount is better, but here we do it on change for simplicity/real-time)
    useEffect(() => {
        if (ebookId && currentPage) {
            saveProgress({
                id: ebookId,
                data: { lastPage: currentPage, savedAt: new Date().toISOString() }
            });
        }
    }, [currentPage, ebookId]);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    if (isLoadingEbook || isLoadingProgress) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00F5FF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{ebook?.title || initialTitle || "E-bok"}</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Bookmark color="#00F5FF" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.readerContent}>
                <Text style={styles.chapterTitle}>{ebook?.title || "Kapitel " + currentPage}</Text>
                <Text style={styles.readerText}>
                    {ebook?.description || "Innehållet i denna e-bok laddas från servern."}
                    {"\n\n"}
                    Detta är en live-vy av e-boken baserad på data från backend.
                    Dina framsteg sparas automatiskt på sida {currentPage}.
                </Text>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity onPress={handlePrev} disabled={currentPage === 1} style={[styles.navButton, currentPage === 1 && styles.disabled]}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.pageCount}>Sida {currentPage} av {totalPages}</Text>
                <TouchableOpacity onPress={handleNext} disabled={currentPage === totalPages} style={[styles.navButton, currentPage === totalPages && styles.disabled]}>
                    <ChevronRight color="#fff" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#0f1012' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#1a1b1d', borderBottomWidth: 1, borderBottomColor: '#333' },
    iconButton: { padding: 8 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
    readerContent: { padding: 24 },
    chapterTitle: { fontSize: 24, fontWeight: 'bold', color: '#00F5FF', marginBottom: 20 },
    readerText: { fontSize: 18, color: '#ccc', lineHeight: 32 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#1a1b1d', borderTopWidth: 1, borderTopColor: '#333' },
    navButton: { padding: 12, backgroundColor: '#333', borderRadius: 12 },
    disabled: { opacity: 0.3 },
    pageCount: { color: '#888', fontSize: 16 }
});

export default EbookScreen;
