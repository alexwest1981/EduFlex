import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { enqueueAction } from '../../store/slices/offlineQueueSlice';
import { Book, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const EbookScreen = ({ route }) => {
    // In reality, route.params would pass bookId and title
    const { bookId = 1, bookTitle = "Systemarkitektur" } = route.params || {};
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 15;

    // Simulate saving reading progress on every page turn
    useEffect(() => {
        dispatch(enqueueAction({
            url: `/ebook-progress`,
            method: 'POST',
            body: { ebookId: bookId, pageNumber: currentPage, savedAt: new Date().toISOString() }
        }));
    }, [currentPage, bookId, dispatch]);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{bookTitle}</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Bookmark color="#00F5FF" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.readerContent}>
                <Text style={styles.chapterTitle}>Kapitel {currentPage}</Text>
                <Text style={styles.readerText}>
                    Detta är platshållartext för e-boken. I en verklig offline-implementation
                    skulle vi ladda ner EPUB-filen eller PDF:en till lokal lagring (t.ex. med expo-file-system)
                    och rendera innehållet via en webvy eller PDF-läsare.
                    {"\n\n"}
                    När du byter sida registreras dina framsteg (Save progress locally).
                    SyncManager plockar sedan upp denna kö av ändringar när telefonen återfår anslutning, och skickar det till `/api/ebook-progress`.
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
