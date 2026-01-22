import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CoursesStackParamList } from '../../navigation/types';
import { courseService } from '../../services';
import { Quiz, Question, Option, QuizResult } from '../../types';
import { useAuth } from '../../context/AuthContext';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

type QuizScreenNavigationProp = NativeStackNavigationProp<
    CoursesStackParamList,
    'Quiz'
>;
type QuizScreenRouteProp = RouteProp<CoursesStackParamList, 'Quiz'>;

interface Props {
    navigation: QuizScreenNavigationProp;
    route: QuizScreenRouteProp;
}

const QuizScreen: React.FC<Props> = ({ navigation, route }) => {
    const { quizId, courseId } = route.params;
    const { user } = useAuth();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [answers, setAnswers] = useState<{ [questionId: number]: number }>({}); // questionId -> optionId
    const [result, setResult] = useState<QuizResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    const loadQuiz = async () => {
        try {
            // Since we don't have getQuizById, we fetch course quizzes and find it
            // Optimization: Add getQuizById endpoint later
            const quizzes = await courseService.getCourseQuizzes(courseId);
            const found = quizzes.find((q) => q.id === quizId);
            if (found) {
                setQuiz(found);
            } else {
                Alert.alert('Fel', 'Kunde inte hitta quizet.');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to load quiz:', error);
            Alert.alert('Fel', 'Kunde inte ladda quizet.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (questionId: number, optionId: number) => {
        if (result) return; // Read-only if already submitted
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionId,
        }));
    };

    const calculateScore = (): { score: number; maxScore: number } => {
        if (!quiz) return { score: 0, maxScore: 0 };
        let score = 0;
        let maxScore = quiz.questions.length;

        quiz.questions.forEach((q) => {
            const selectedOptionId = answers[q.id];
            const correctOption = q.options.find((o) => o.isCorrect);
            if (correctOption && correctOption.id === selectedOptionId) {
                score++;
            }
        });

        return { score, maxScore };
    };

    const handleSubmit = async () => {
        if (!quiz || !user) return;

        // Validate all questions answered?
        if (Object.keys(answers).length < quiz.questions.length) {
            Alert.alert('Ofullständigt', 'Vänligen svara på alla frågor innan du skickar in.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { score, maxScore } = calculateScore();

            // Submit to backend
            const savedResult = await courseService.submitQuizResult(
                quiz.id,
                user.id,
                score,
                maxScore
            );

            setResult(savedResult);
            Alert.alert('Klar!', `Du fick ${score} av ${maxScore} poäng.`);
        } catch (error) {
            console.error('Submission failed:', error);
            Alert.alert('Fel', 'Kunde inte skicka in resultatet.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!quiz) {
        return null;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{quiz.title}</Text>
                {quiz.description && <Text style={styles.description}>{quiz.description}</Text>}
            </View>

            {result && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Resultat</Text>
                    <Text style={styles.resultScore}>
                        {result.score} / {result.maxScore}
                    </Text>
                    <Text style={styles.resultPercentage}>
                        {Math.round((result.score / result.maxScore) * 100)}%
                    </Text>
                </View>
            )}

            <View style={styles.questionsContainer}>
                {quiz.questions.map((question, index) => (
                    <View key={question.id} style={styles.questionCard}>
                        <Text style={styles.questionIndex}>Fråga {index + 1}</Text>
                        <Text style={styles.questionText}>{question.text}</Text>

                        <View style={styles.optionsContainer}>
                            {question.options.map((option) => {
                                const isSelected = answers[question.id] === option.id;
                                const isCorrect = option.isCorrect;

                                let optionStyle = styles.optionButton;
                                let textStyle = styles.optionText;

                                if (result) {
                                    if (isSelected && isCorrect) {
                                        optionStyle = styles.optionCorrect; // User chose correct
                                    } else if (isSelected && !isCorrect) {
                                        optionStyle = styles.optionWrong; // User chose wrong
                                    } else if (isCorrect) {
                                        optionStyle = styles.optionMissed; // Show correct answer
                                    }
                                } else if (isSelected) {
                                    optionStyle = styles.optionSelected;
                                    textStyle = styles.optionTextSelected;
                                }

                                return (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={optionStyle}
                                        onPress={() => handleOptionSelect(question.id, option.id)}
                                        disabled={!!result}
                                    >
                                        <Text style={textStyle}>{option.text}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>

            {!result && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Lämna in prov</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',  // Theme: '#6B7280'
    },
    resultCard: {
        margin: 20,
        marginBottom: 0,
        backgroundColor: '#EEF2FF',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4F46E5',  // Theme: '#4F46E5'
        marginBottom: 8,
    },
    resultScore: {
        fontSize: 48,
        fontWeight: '800',
        color: '#111827',  // Theme: '#111827'
    },
    resultPercentage: {
        fontSize: 16,
        color: '#6B7280',  // Theme: '#6B7280'
        fontWeight: '500',
    },
    questionsContainer: {
        padding: 20,
    },
    questionCard: {
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    questionIndex: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
        marginBottom: 8,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',  // Theme: '#111827'
        marginBottom: 16,
        lineHeight: 28,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    optionSelected: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#E0E7FF',
        borderWidth: 1,
        borderColor: '#4F46E5',
    },
    optionCorrect: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#D1FAE5',
        borderWidth: 1,
        borderColor: '#059669',
    },
    optionWrong: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#DC2626',
    },
    optionMissed: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#D1FAE5',
        borderWidth: 1,
        borderColor: '#059669',
        opacity: 0.7
    },
    optionText: {
        fontSize: 16,
        color: '#374151',
    },
    optionTextSelected: {
        fontSize: 16,
        color: '#111827',  // Theme: '#111827'
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 40,
    },
    submitButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default QuizScreen;
