import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Layers, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetDueFlashcardsQuery, useSubmitFlashcardReviewMutation } from '../../store/slices/apiSlice';

const FlashcardsScreen = () => {
    const navigation = useNavigation();
    const { data: dueCards, isLoading, refetch } = useGetDueFlashcardsQuery();
    const [submitReview] = useSubmitFlashcardReviewMutation();

    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentCard = dueCards && dueCards.length > currentIndex ? dueCards[currentIndex] : null;

    const handleRating = async (quality) => {
        if (!currentCard) return;

        try {
            await submitReview({ cardId: currentCard.id, quality }).unwrap();

            if (currentIndex < dueCards.length - 1) {
                setCurrentIndex(c => c + 1);
                setIsFlipped(false);
            } else {
                Alert.alert('Bra jobbat!', 'Du har repeterat alla kort för idag.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Fel', 'Kunde inte spara ditt resultat.');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00F5FF" />
            </View>
        );
    }

    if (!dueCards || dueCards.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Layers color="#444" size={64} style={{ marginBottom: 20 }} />
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Inga kort att repetera!</Text>
                <Text style={{ color: '#888', marginTop: 10 }}>Kom tillbaka senare.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 30, padding: 15, backgroundColor: '#1a1b1d', borderRadius: 12 }}>
                    <Text style={{ color: '#00F5FF' }}>Gå tillbaka</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Spaced Repetition ({currentIndex + 1}/{dueCards.length})</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.cardContainer}>
                <TouchableOpacity
                    style={styles.flashcard}
                    activeOpacity={0.8}
                    onPress={() => setIsFlipped(!isFlipped)}
                >
                    <Layers color="#FBBF24" size={32} style={{ position: 'absolute', top: 20, right: 20, opacity: 0.2 }} />
                    <Text style={styles.cardText}>{isFlipped ? currentCard.back : currentCard.front}</Text>
                    <Text style={styles.flipInstruction}>(Tryck för att vända)</Text>
                </TouchableOpacity>
            </View>

            {isFlipped && (
                <View style={styles.ratingRow}>
                    <TouchableOpacity style={[styles.rateBtn, { backgroundColor: '#ff4444' }]} onPress={() => handleRating(1)}>
                        <Text style={styles.rateText}>Svår</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.rateBtn, { backgroundColor: '#FBBF24' }]} onPress={() => handleRating(3)}>
                        <Text style={styles.rateText}>Bra</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.rateBtn, { backgroundColor: '#00F5FF' }]} onPress={() => handleRating(5)}>
                        <Text style={[styles.rateText, { color: '#000' }]}>Lätt</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center', padding: 40 },
    container: { flex: 1, backgroundColor: '#0f1012' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#1a1b1d', borderBottomWidth: 1, borderBottomColor: '#333' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },
    cardContainer: { flex: 1, justifyContent: 'center', padding: 20 },
    flashcard: { backgroundColor: '#1a1b1d', height: 400, borderRadius: 24, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    cardText: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
    flipInstruction: { position: 'absolute', bottom: 30, color: '#888', fontSize: 14 },
    ratingRow: { flexDirection: 'row', padding: 20, gap: 16, marginBottom: 40 },
    rateBtn: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    rateText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default FlashcardsScreen;
