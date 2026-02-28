import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { enqueueAction } from '../../store/slices/offlineQueueSlice';
import { UploadCloud, CheckCircle, Paperclip } from 'lucide-react-native';

const AssignmentSubmissionScreen = ({ route, navigation }) => {
    const { assignmentId = 1, assignmentTitle = "Laboration 1: React Native" } = route.params || {};
    const dispatch = useDispatch();

    const [submissionText, setSubmissionText] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        // Enqueue the submission text to be sent when online
        dispatch(enqueueAction({
            url: `/assignments/${assignmentId}/submit`,
            method: 'POST',
            body: { text: submissionText, submittedAt: new Date().toISOString() }
        }));
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <View style={styles.centerContainer}>
                <CheckCircle color="#00F5FF" size={64} style={{ marginBottom: 20 }} />
                <Text style={styles.title}>Inlämning mottagen!</Text>
                <Text style={styles.subtitle}>Din inlämning ligger i kön.</Text>
                <Text style={styles.note}>(Om du är offline kommer den att laddas upp automatiskt i bakgrunden så fort du får uppkoppling)</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Tillbaka till Kurs</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{assignmentTitle}</Text>
                <Text style={styles.subtitle}>Sista inlämning: 15 Mars kl 23:59</Text>
            </View>

            <View style={styles.instructionsContainer}>
                <Text style={styles.sectionTitle}>Instruktioner</Text>
                <Text style={styles.instructionsText}>
                    Beskriv hur du har implementerat state management i din applikation.
                    Bifoga kodsnuttar om nödvändigt.
                </Text>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.sectionTitle}>Ditt svar</Text>
                <TextInput
                    style={styles.textInput}
                    multiline
                    numberOfLines={8}
                    placeholder="Skriv din inlämning här..."
                    placeholderTextColor="#666"
                    value={submissionText}
                    onChangeText={setSubmissionText}
                    textAlignVertical="top"
                />
            </View>

            <TouchableOpacity style={styles.attachButton}>
                <Paperclip color="#00F5FF" size={20} />
                <Text style={styles.attachButtonText}>Bifoga Fil (Kräver Nätverk för full uppladdning)</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, submissionText.trim() === '' && styles.disabledButton]}
                    disabled={submissionText.trim() === ''}
                    onPress={handleSubmit}
                >
                    <UploadCloud color={submissionText.trim() === '' ? "#888" : "#000"} size={20} style={{ marginRight: 10 }} />
                    <Text style={[styles.buttonText, submissionText.trim() === '' && { color: '#888' }]}>Skicka Inlämning</Text>
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
    subtitle: { fontSize: 14, color: '#888', marginTop: 5 },
    note: { fontSize: 13, color: '#666', marginTop: 20, textAlign: 'center', paddingHorizontal: 20 },
    instructionsContainer: { backgroundColor: '#1a1b1d', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#333' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
    instructionsText: { color: '#ccc', lineHeight: 22 },
    inputContainer: { marginBottom: 20 },
    textInput: { backgroundColor: '#1a1b1d', color: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#333', minHeight: 150 },
    attachButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 245, 255, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 245, 255, 0.3)', marginBottom: 30 },
    attachButtonText: { color: '#00F5FF', fontWeight: 'bold', marginLeft: 10 },
    footer: { marginTop: 10, paddingBottom: 40 },
    button: { flexDirection: 'row', backgroundColor: '#00F5FF', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    disabledButton: { backgroundColor: '#333' },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});

export default AssignmentSubmissionScreen;
