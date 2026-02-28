import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { enqueueAction } from '../../store/slices/offlineQueueSlice';
import { Layers, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const FlashcardsScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const deck = [
        { id: 1, front: "Vad står CPU för?", back: "Central Processing Unit" },
        { id: 2, front: "Vilken port används oftast för HTTP?", back: "Port 80" }
    ];

    const currentCard = deck[currentIndex];

    const handleRating = (rating) => {
        // Queue the rating calculation/sync for offline
        dispatch(enqueueAction({
            url: `/flashcards/${currentCard.id}/rate`,
            method: 'POST',
            body: { rating, timestamp: new Date().toISOString() }
        }));

        if (currentIndex < deck.length - 1) {
            setCurrentIndex(c => c + 1);
            setIsFlipped(false);
        } else {
            navigation.goBack();
        }
    };

    if (!currentCard) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Spaced Repetition</Text>
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
