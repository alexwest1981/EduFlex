import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Client, IMessage } from '@stomp/stompjs';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MessagesStackParamList } from '../../navigation/types';
import { messageService } from '../../services/messageService';
import { documentService } from '../../services/documentService';
import { tokenManager } from '../../services/api';
import { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import { format, isToday, isYesterday } from 'date-fns';
import { sv } from 'date-fns/locale';
import { API_URL, WS_URL } from '../../utils/constants';

type ConversationScreenRouteProp = RouteProp<MessagesStackParamList, 'Conversation'>;
type ConversationScreenNavigationProp = NativeStackNavigationProp<MessagesStackParamList, 'Conversation'>;

interface Props {
    route: ConversationScreenRouteProp;
    navigation: ConversationScreenNavigationProp;
}

const ConversationScreen: React.FC<Props> = ({ route, navigation }) => {
    const { userId, userName } = route.params;
    const { user } = useAuth();
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<{ url: string; id?: number; name: string } | null>(null);
    const flatListRef = useRef<FlatList>(null);

    const styles = useMemo(() => createStyles(colors), [colors]);

    // Hide default header
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        const fetchToken = async () => {
            const t = await tokenManager.getToken();
            setAuthToken(t);
        };
        fetchToken();
    }, []);

    useEffect(() => {
        loadMessages();

        if (!user) return;

        const brokerUrl = `${WS_URL}/websocket`;
        const client = new Client({
            brokerURL: brokerUrl,
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,
            reconnectDelay: 5000,
            debug: (str: string) => console.log('STOMP: ' + str),
            onConnect: () => {
                client.subscribe(`/topic/messages/${user.id}`, (message: IMessage) => {
                    if (message.body) {
                        try {
                            const newMsg: Message = JSON.parse(message.body);
                            const isRelevant = (newMsg.senderId == userId) || (newMsg.recipientId == userId);
                            if (isRelevant) {
                                setMessages(prev => {
                                    if (prev.some(m => m.id === newMsg.id)) return prev;
                                    return [...prev, newMsg];
                                });
                                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                            }
                        } catch (e) {
                            console.error('Failed to parse message', e);
                        }
                    }
                });
            },
            onStompError: (frame) => console.error('Stomp Error', frame.headers['message']),
            onWebSocketError: (event) => console.error('WebSocket Error', event),
        });

        client.activate();
        return () => { client.deactivate(); };
    }, [userId, user]);

    const loadMessages = async () => {
        if (!user) return;
        try {
            const result = await messageService.getChatHistory(user.id, userId);
            setMessages(result.content.reverse());
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (
        content: string = inputText,
        type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
        documentId?: number
    ) => {
        if (!content.trim() && type === 'TEXT') return;
        if (!user) return;

        if (type === 'TEXT') setInputText('');

        const optimisticId = Date.now();
        try {
            const newMessage: Partial<Message> = {
                senderId: user.id,
                senderName: user.fullName,
                recipientId: userId,
                recipientName: userName,
                content,
                type,
                documentId,
                isRead: false,
                timestamp: new Date().toISOString(),
            };

            const optimisticMsg = { ...newMessage, id: optimisticId } as Message;
            setMessages(prev => [...prev, optimisticMsg]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

            const savedMessage = await messageService.sendMessage(newMessage);
            setMessages(prev => {
                if (prev.some(m => m.id === savedMessage.id)) {
                    return prev.filter(m => m.id !== optimisticId);
                }
                return prev.map(m => m.id === optimisticId ? savedMessage : m);
            });
        } catch (e) {
            console.error('Failed to send', e);
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
        }
    };

    const handlePickDocument = async () => {
        if (!user) return;
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });
            if (result.canceled) return;

            const file = result.assets[0];
            const isImage = file.mimeType?.startsWith('image/');
            const type = isImage ? 'IMAGE' : 'FILE';

            setIsUploading(true);
            const doc = await documentService.uploadFile(user.id, file, type);
            setIsUploading(false);

            if (doc.fileUrl) {
                handleSend(doc.fileUrl, type, doc.id);
            }
        } catch (err) {
            console.error('Upload failed', err);
            setIsUploading(false);
        }
    };

    const getSafeUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = API_URL.replace(/\/api$/, '');
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
        return `${baseUrl}${encodedPath}`;
    };

    const openFile = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        } catch (err) {
            console.error('Could not open link', err);
        }
    };

    const handleFileAction = async (action: 'OPEN' | 'SAVE') => {
        if (!selectedFile) return;
        if (action === 'OPEN') {
            openFile(selectedFile.url);
        } else if (action === 'SAVE') {
            if (!selectedFile.id || !user) return;
            try {
                await documentService.shareDocument(selectedFile.id, user.id);
                setSelectedFile(null);
            } catch (e) {
                console.error(e);
            }
        }
    };

    // ─── Date separators ──────────────────────────────────────────
    const formatDateSeparator = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Idag';
        if (isYesterday(date)) return 'Igår';
        return format(date, 'EEEE d MMMM', { locale: sv });
    };

    const shouldShowDateSeparator = (index: number) => {
        if (index === 0) return true;
        const current = new Date(messages[index].timestamp).toDateString();
        const previous = new Date(messages[index - 1].timestamp).toDateString();
        return current !== previous;
    };

    // ─── Get file extension info ──────────────────────────────────
    const getFileInfo = (content: string) => {
        const name = content.split('/').pop() || 'Dokument';
        const ext = name.split('.').pop()?.toUpperCase() || '';
        return { name, ext };
    };

    // ─── Render message ───────────────────────────────────────────
    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMe = item.senderId === user?.id;
        const isImage = item.type === 'IMAGE' ||
            (item.content && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.content));
        const isFile = item.type === 'FILE';
        const showDate = shouldShowDateSeparator(index);
        const timeStr = item.timestamp ? format(new Date(item.timestamp), 'HH:mm') : '';

        return (
            <View>
                {/* Date separator */}
                {showDate && (
                    <View style={styles.dateSeparator}>
                        <View style={[styles.dateSeparatorPill, {
                            backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        }]}>
                            <Text style={[styles.dateSeparatorText, { color: colors.textMuted }]}>
                                {formatDateSeparator(item.timestamp)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Message row */}
                <View style={[
                    styles.messageRow,
                    isMe ? styles.messageRowMe : styles.messageRowThem,
                ]}>
                    {/* Avatar for other person */}
                    {!isMe && (
                        <View style={[styles.messageAvatar, {
                            backgroundColor: colors.isDark ? '#1e293b' : '#e2e8f0',
                        }]}>
                            <Text style={[styles.messageAvatarText, { color: colors.primary }]}>
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.messageCol, isMe && { alignItems: 'flex-end' }]}>
                        {/* Bubble */}
                        <View style={[
                            styles.bubble,
                            isMe
                                ? [styles.bubbleMe, { backgroundColor: colors.primary }]
                                : [styles.bubbleThem, {
                                    backgroundColor: colors.isDark ? '#0c0f16' : '#f1f5f9',
                                    borderColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                }],
                        ]}>
                            {isImage ? (
                                <TouchableOpacity onPress={() => setSelectedFile({
                                    url: getSafeUrl(item.content),
                                    id: item.documentId,
                                    name: 'Bild',
                                })}>
                                    <Image
                                        source={{
                                            uri: getSafeUrl(item.content),
                                            headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
                                        }}
                                        style={styles.messageImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Text style={[
                                    styles.messageText,
                                    { color: isMe ? '#FFFFFF' : colors.text },
                                ]}>
                                    {item.content}
                                </Text>
                            )}
                        </View>

                        {/* Attachment card (for FILE type) */}
                        {isFile && !isImage && (() => {
                            const fileInfo = getFileInfo(item.content);
                            return (
                                <TouchableOpacity
                                    style={[styles.attachmentCard, {
                                        backgroundColor: `${colors.primary}15`,
                                        borderColor: `${colors.primary}30`,
                                    }]}
                                    onPress={() => setSelectedFile({
                                        url: getSafeUrl(item.content),
                                        id: item.documentId,
                                        name: fileInfo.name,
                                    })}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.attachmentIcon, { backgroundColor: `${colors.primary}20` }]}>
                                        <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                                    </View>
                                    <View style={styles.attachmentInfo}>
                                        <Text style={[styles.attachmentName, { color: colors.text }]} numberOfLines={1}>
                                            {fileInfo.name}
                                        </Text>
                                        <Text style={[styles.attachmentMeta, { color: `${colors.primary}99` }]}>
                                            {fileInfo.ext} Document
                                        </Text>
                                    </View>
                                    <Ionicons name="download-outline" size={18} color={colors.textMuted} />
                                </TouchableOpacity>
                            );
                        })()}

                        {/* Timestamp + read receipt */}
                        <View style={styles.metaRow}>
                            <Text style={[styles.timeText, { color: colors.textMuted }]}>{timeStr}</Text>
                            {isMe && (
                                <Ionicons
                                    name={item.isRead ? 'checkmark-done' : 'checkmark'}
                                    size={14}
                                    color={item.isRead ? colors.primary : colors.textMuted}
                                    style={{ marginLeft: 4 }}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // ─── Main render ──────────────────────────────────────────────
    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {/* ─── Glass Header ────────────────────────────────────── */}
            <View style={[styles.header, {
                backgroundColor: colors.isDark ? 'rgba(12,15,22,0.85)' : 'rgba(255,255,255,0.9)',
                borderBottomColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
            }]}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.textMuted} />
                </TouchableOpacity>

                <View style={styles.headerProfile}>
                    <View style={[styles.headerAvatar, { borderColor: `${colors.primary}30` }]}>
                        <Text style={[styles.headerAvatarText, { color: colors.primary }]}>
                            {userName.charAt(0).toUpperCase()}
                        </Text>
                        <View style={styles.onlineDot} />
                    </View>
                    <View>
                        <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>
                            {userName}
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: colors.primary }]}>Online</Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="videocam-outline" size={22} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ─── Messages ────────────────────────────────────────── */}
            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* ─── Input Bar ───────────────────────────────────────── */}
            <View style={[styles.inputBar, {
                borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
            }]}>
                <TouchableOpacity
                    style={styles.inputAction}
                    onPress={handlePickDocument}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <ActivityIndicator size="small" color={colors.textMuted} />
                    ) : (
                        <Ionicons name="add-circle" size={26} color={colors.textMuted} />
                    )}
                </TouchableOpacity>

                <TextInput
                    style={[styles.input, {
                        color: colors.text,
                    }]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Skriv ett meddelande..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={2000}
                />

                <TouchableOpacity
                    style={[styles.sendButton, {
                        backgroundColor: colors.primary,
                        opacity: inputText.trim() ? 1 : 0.5,
                    }]}
                    onPress={() => handleSend()}
                    disabled={!inputText.trim()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Safe area bottom padding */}
            <View style={[styles.safeBottom, {
                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
            }]} />

            {/* ─── File Action Modal ───────────────────────────────── */}
            {selectedFile && (
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedFile(null)}
                >
                    <View style={[styles.modalContent, {
                        backgroundColor: colors.isDark ? '#1e293b' : '#FFFFFF',
                    }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                            {selectedFile.name}
                        </Text>

                        <TouchableOpacity
                            style={[styles.modalButton, {
                                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                            }]}
                            onPress={() => handleFileAction('OPEN')}
                        >
                            <Ionicons name="open-outline" size={20} color={colors.text} />
                            <Text style={[styles.modalButtonText, { color: colors.text }]}>Öppna</Text>
                        </TouchableOpacity>

                        {selectedFile.id && (
                            <TouchableOpacity
                                style={[styles.modalButton, {
                                    backgroundColor: `${colors.primary}15`,
                                    borderWidth: 1,
                                    borderColor: `${colors.primary}30`,
                                }]}
                                onPress={() => handleFileAction('SAVE')}
                            >
                                <Ionicons name="save-outline" size={20} color={colors.primary} />
                                <Text style={[styles.modalButtonText, { color: colors.primary }]}>
                                    Spara till mina dokument
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setSelectedFile(null)}
                        >
                            <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>Avbryt</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )}
        </KeyboardAvoidingView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────
const createStyles = (colors: ReturnType<typeof getThemeColors>) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        // ── Header ──────────────────────────────────────────────
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 56 : 16,
            paddingBottom: 12,
            paddingHorizontal: 8,
            borderBottomWidth: 1,
        },
        headerButton: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
        },
        headerProfile: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginLeft: 4,
        },
        headerAvatar: {
            width: 42,
            height: 42,
            borderRadius: 21,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.isDark ? '#1e293b' : '#e2e8f0',
        },
        headerAvatarText: {
            fontFamily: 'Lexend_700Bold',
            fontSize: 16,
        },
        onlineDot: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#22c55e',
            borderWidth: 2,
            borderColor: colors.background,
        },
        headerName: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 15,
        },
        headerSubtitle: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginTop: 1,
        },
        headerActions: {
            flexDirection: 'row',
            gap: 2,
        },

        // ── Messages ────────────────────────────────────────────
        messageList: {
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
        },

        // Date separator
        dateSeparator: {
            alignItems: 'center',
            marginVertical: 16,
        },
        dateSeparatorPill: {
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 99,
        },
        dateSeparatorText: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },

        // Message row
        messageRow: {
            flexDirection: 'row',
            marginBottom: 12,
            maxWidth: '85%',
        },
        messageRowMe: {
            alignSelf: 'flex-end',
            flexDirection: 'row-reverse',
        },
        messageRowThem: {
            alignSelf: 'flex-start',
        },
        messageAvatar: {
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
            alignSelf: 'flex-end',
        },
        messageAvatarText: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 12,
        },
        messageCol: {
            flexShrink: 1,
        },

        // Bubbles
        bubble: {
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
        },
        bubbleMe: {
            borderBottomRightRadius: 4,
        },
        bubbleThem: {
            borderBottomLeftRadius: 4,
            borderWidth: 1,
        },
        messageText: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 14,
            lineHeight: 21,
        },
        messageImage: {
            width: 200,
            height: 150,
            borderRadius: 10,
        },

        // Attachment card
        attachmentCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 10,
            borderRadius: 12,
            borderWidth: 1,
            marginTop: 6,
            maxWidth: 260,
        },
        attachmentIcon: {
            width: 38,
            height: 38,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        attachmentInfo: {
            flex: 1,
        },
        attachmentName: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 12,
        },
        attachmentMeta: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 10,
            marginTop: 1,
        },

        // Meta row (time + read receipt)
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
            marginHorizontal: 4,
        },
        timeText: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 10,
        },

        // ── Input Bar ───────────────────────────────────────────
        inputBar: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 12,
            marginBottom: 4,
            paddingHorizontal: 6,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
            gap: 4,
        },
        inputAction: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        input: {
            flex: 1,
            fontFamily: 'Lexend_400Regular',
            fontSize: 14,
            maxHeight: 100,
            paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        },
        sendButton: {
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Safe bottom
        safeBottom: {
            height: Platform.OS === 'ios' ? 24 : 8,
        },

        // ── Modal ───────────────────────────────────────────────
        modalOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
        },
        modalContent: {
            width: '82%',
            borderRadius: 20,
            padding: 24,
            gap: 10,
        },
        modalTitle: {
            fontFamily: 'Lexend_600SemiBold',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 8,
        },
        modalButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            borderRadius: 12,
        },
        modalButtonText: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 14,
        },
        modalCancel: {
            alignItems: 'center',
            paddingVertical: 10,
            marginTop: 4,
        },
        modalCancelText: {
            fontFamily: 'Lexend_400Regular',
            fontSize: 13,
        },
    });

export default ConversationScreen;
