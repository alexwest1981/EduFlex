import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Send, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { enqueueAction } from '../../store/slices/offlineQueueSlice';

const CHAT_STORAGE_KEY = '@ai_coach_history';

const AiCoachScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const h = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
            if (h) setMessages(JSON.parse(h));
            else {
                setMessages([{ id: '0', text: 'Hej! Jag är din AI-coach. Hur kan jag hjälpa dig idag?', sender: 'ai' }]);
            }
        } catch (e) {
            console.error('Failed to load chat history', e);
        }
    };

    const saveHistory = async (newMessages) => {
        try {
            await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
        } catch (e) { }
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
        const updatedMessages = [...messages, userMsg];

        setMessages(updatedMessages);
        saveHistory(updatedMessages);
        setInputText('');

        // Enqueue to backend sync layer
        dispatch(enqueueAction({
            url: `/ai/chat`,
            method: 'POST',
            body: { message: userMsg.text }
        }));

        // Simulate optimistic AI response if offline
        setTimeout(() => {
            const aiReply = { id: (Date.now() + 1).toString(), text: 'Denna konversation sparas lokalt och synkas med AI-motorn när du är online.', sender: 'ai' };
            const withReply = [...updatedMessages, aiReply];
            setMessages(withReply);
            saveHistory(withReply);
        }, 1000);
    };

    const renderMessage = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>AI-Coach</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatContainer}
                inverted={false}
            />

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Skriv ett meddelande..."
                    placeholderTextColor="#888"
                    value={inputText}
                    onChangeText={setInputText}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                    <Send color="#fff" size={20} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f1012' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#1a1b1d', borderBottomWidth: 1, borderBottomColor: '#333' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },
    chatContainer: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
    messageBubble: { maxWidth: '80%', padding: 16, borderRadius: 16, marginBottom: 12 },
    userBubble: { backgroundColor: '#00F5FF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: '#1a1b1d', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#333', borderBottomLeftRadius: 4 },
    messageText: { color: '#fff', fontSize: 16 },
    inputRow: { flexDirection: 'row', padding: 16, backgroundColor: '#1a1b1d', borderTopWidth: 1, borderTopColor: '#333', alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#0f1012', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
    sendBtn: { backgroundColor: '#00F5FF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }
});

export default AiCoachScreen;
