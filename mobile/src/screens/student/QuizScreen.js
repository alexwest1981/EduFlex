import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { enqueueAction } from '../../store/slices/offlineQueueSlice';
import { CheckCircle, AlertCircle } from 'lucide-react-native';

const QuizScreen = ({ route, navigation }) => {
    const { quizId, quizTitle } = route.params || { quizId: 1, quizTitle: "Test Quiz" };
    const dispatch = useDispatch();

    // Mock Questions
    const questions = [
        { id: 1, text: "Vad är React Native?", options: ["Ett språk", "Ett ramverk", "Ett databassystem"], correct: 1 },
        { id: 2, text: "Vad hanterar state?", options: ["CSS", "Redux", "HTML"], correct: 1 }
    ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSelect = (optionIndex) => {
        setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        // Enqueue the submission to our Offline Queue sync engine
        dispatch(enqueueAction({
            url: `/quiz/${quizId}/submit`,
            method: 'POST',
            body: { answers: selectedAnswers, submittedAt: new Date().toISOString() }
        }));
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <View style={styles.centerContainer}>
                <CheckCircle color="#00F5FF" size={64} style={{ marginBottom: 20 }} />
                <Text style={styles.title}>Bra jobbat!</Text>
                <Text style={styles.subtitle}>Dina svar har sparats.</Text>
                <Text style={styles.note}>(Om du är offline, synkas de automatiskt så fort du får uppkoppling)</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Tillbaka till Kurs</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const q = questions[currentQuestionIndex];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.subtitle}>Fråga {currentQuestionIndex + 1} av {questions.length}</Text>
                <Text style={styles.title}>{q.text}</Text>
            </View>

            <View style={styles.optionsContainer}>
                {q.options.map((opt, i) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === i;
                    return (
                        <TouchableOpacity
                            key={i}
                            style={[styles.optionCard, isSelected && styles.selectedOption]}
                            onPress={() => handleSelect(i)}
                        >
                            <View style={[styles.radioCycle, isSelected && styles.radioSelected]} />
                            <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, selectedAnswers[currentQuestionIndex] === undefined && styles.disabledButton]}
                    disabled={selectedAnswers[currentQuestionIndex] === undefined}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>{currentQuestionIndex < questions.length - 1 ? 'Nästa Fråga' : 'Skicka in svar'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center', padding: 20 },
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 10 },
    subtitle: { fontSize: 14, color: '#888' },
    note: { fontSize: 12, color: '#666', marginTop: 20, textAlign: 'center', paddingHorizontal: 20 },
    optionsContainer: { gap: 16 },
    optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1b1d', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
    selectedOption: { borderColor: '#00F5FF', backgroundColor: 'rgba(0, 245, 255, 0.05)' },
    radioCycle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#555', marginRight: 16 },
    radioSelected: { borderColor: '#00F5FF', backgroundColor: '#00F5FF' },
    optionText: { color: '#fff', fontSize: 16, flex: 1 },
    footer: { marginTop: 40 },
    button: { backgroundColor: '#00F5FF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
    disabledButton: { backgroundColor: '#333' },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});

export default QuizScreen;
