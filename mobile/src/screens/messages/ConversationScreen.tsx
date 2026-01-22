import React, { useEffect, useState, useRef } from 'react';
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
import { Client, IMessage, IFrame } from '@stomp/stompjs';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MessagesStackParamList } from '../../navigation/types';
import { messageService } from '../../services/messageService';
import { documentService } from '../../services/documentService';
import { tokenManager } from '../../services/api';
import { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { API_URL, WS_URL } from '../../utils/constants';

import { useThemedStyles } from '../../hooks';

type ConversationScreenRouteProp = RouteProp<MessagesStackParamList, 'Conversation'>;
type ConversationScreenNavigationProp = NativeStackNavigationProp<MessagesStackParamList, 'Conversation'>;

interface Props {
  route: ConversationScreenRouteProp;
  navigation: ConversationScreenNavigationProp;
}

const ConversationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId, userName } = route.params;
  const { user } = useAuth();
  const { colors, styles: themedStyles } = useThemedStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Fixed
  const [isUploading, setIsUploading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const t = await tokenManager.getToken();
      setAuthToken(t);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: userName });
    loadMessages();

    // WebSocket Connection
    if (!user) return;

    // Use WS_URL from constants (append /websocket for raw WS access)
    // Note: WS_URL in constants is 'ws://.../ws'. Spring's raw endpoint is usually at /ws/websocket
    const brokerUrl = `${WS_URL}/websocket`;

    const client = new Client({
      brokerURL: brokerUrl,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      reconnectDelay: 5000,
      debug: (str: string) => console.log('🟢 STOMP: ' + str),
      onConnect: () => {
        console.log('✅ Connected to Chat WebSocket');
        client.subscribe(`/topic/messages/${user.id}`, (message: IMessage) => {
          if (message.body) {
            try {
              const newMsg: Message = JSON.parse(message.body);
              console.log('📩 Mobile RX:', newMsg);
              console.log(`🔍 Checking IDs: msgSender=${newMsg.senderId}, msgRecipient=${newMsg.recipientId}, currentChatPartnerId=${userId}`);

              // Check if message belongs to THIS conversation
              // Using Loose Equality (==) to handle potential String vs Number mismatches
              const isRelevant = (newMsg.senderId == userId) || (newMsg.recipientId == userId);

              if (isRelevant) {
                console.log('✅ Message is relevant, updating state...');
                setMessages(prev => {
                  const exists = prev.some(m => m.id === newMsg.id);
                  if (exists) {
                    console.log('⚠️ Message already exists, skipping.');
                    return prev;
                  }
                  console.log('➕ Appending new message to list');
                  return [...prev, newMsg];
                });

                // Scroll to bottom
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
              } else {
                console.log('⛔ Message ignored (not for this chat).');
              }
            } catch (e) {
              console.error('Failed to parse message', e);
            }
          }
        });
      },
      onStompError: (frame) => { console.error('❌ Stomp Error', frame.headers['message']); },
      onWebSocketError: (event) => { console.error('❌ WebSocket Error', event); }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userId, user]);

  const loadMessages = async () => {
    if (!user) return;
    try {
      const result = await messageService.getChatHistory(user.id, userId);
      // Since API returns paginated (newest first), we reverse for chat view (oldest at top)
      setMessages(result.content.reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (content: string = inputText, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT', documentId?: number) => {
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
        content: content,
        type: type,
        documentId: documentId, // Link message to document
        isRead: false,
        timestamp: new Date().toISOString()
      };

      // UI Optimistic Update (Temporary ID)
      const optimisticMsg = { ...newMessage, id: optimisticId } as Message;
      setMessages(prev => [...prev, optimisticMsg]);

      // Scroll to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      // Send to backend
      const savedMessage = await messageService.sendMessage(newMessage);

      // Handle race condition: WS might have delivered the message while we waited for HTTP
      setMessages(prev => {
        const alreadyExists = prev.some(m => m.id === savedMessage.id);
        if (alreadyExists) {
          // WS beat us to it; just remove the optimistic temp message
          return prev.filter(m => m.id !== optimisticId);
        }
        // We beat WS (or it hasn't arrived); replace optimistic with real
        return prev.map(m => m.id === optimisticId ? savedMessage : m);
      });
    } catch (e) {
      console.error("Failed to send", e);
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      alert("Kunde inte skicka meddelandet.");
    }
  };

  const handlePickDocument = async () => {
    if (!user) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all files, but we mostly handle images
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
      console.error("Upload failed", err);
      setIsUploading(false);
      alert("Kunde inte ladda upp filen.");
    }
  };

  const getSafeUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Remove /api if present to get root
    const baseUrl = API_URL.replace(/\/api$/, '');
    // Ensure neither double slash nor missing slash
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    // Encode the URL to handle spaces and special characters
    // We split by '/' to encode only path segments, protecting slashes
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');

    return `${baseUrl}${encodedPath}`;
  };

  const openFile = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert(`Kan inte öppna denna filtyps URL: ${url}`);
      }
    } catch (err) {
      alert("Kunde inte öppna länken.");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    const isImage = item.type === 'IMAGE' || (item.content && (item.content.endsWith('.jpg') || item.content.endsWith('.png') || item.content.endsWith('.jpeg')));

    return (
      <View style={[
        styles.messageBubble,
        isMe ? styles.myMessage : styles.theirMessage
      ]}>
        {isImage ? (
          <TouchableOpacity onPress={() => setSelectedFile({ url: getSafeUrl(item.content), id: item.documentId, name: 'Bild' })}>
            <Image
              source={{
                uri: getSafeUrl(item.content),
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
              }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : item.type === 'FILE' ? (
          <TouchableOpacity onPress={() => setSelectedFile({ url: getSafeUrl(item.content), id: item.documentId, name: item.content.split('/').pop() || 'Dokument' })} style={styles.fileContainer}>
            <Text style={{ fontSize: 24 }}>📄</Text>
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText, { textDecorationLine: 'underline' }]}>
              {item.content.split('/').pop() || 'Dokument'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {item.content}
          </Text>
        )}
        <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
          {item.timestamp ? format(new Date(item.timestamp), 'HH:mm') : ''}
        </Text>
      </View>
    );
  };

  // File Action Modal State
  const [selectedFile, setSelectedFile] = useState<{ url: string, id?: number, name: string } | null>(null);

  const handleFileAction = async (action: 'OPEN' | 'SAVE') => {
    if (!selectedFile) return;

    if (action === 'OPEN') {
      openFile(selectedFile.url);
    } else if (action === 'SAVE') {
      if (!selectedFile.id) {
        alert("Denna fil kan inte sparas (saknar ID).");
        return;
      }
      if (!user) return;
      try {
        await documentService.shareDocument(selectedFile.id, user.id);
        alert("Filen har sparats i dina dokument!");
        setSelectedFile(null);
      } catch (e) {
        console.error(e);
        alert("Kunde inte spara filen.");
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 8,
    },
    myMessage: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4
    },
    theirMessage: {
      alignSelf: 'flex-start',
      backgroundColor: colors.border,
      borderBottomLeftRadius: 4
    },
    messageText: {
      fontSize: 16,
    },
    messageImage: {
      width: 200,
      height: 150,
      borderRadius: 8,
      backgroundColor: '#E0E0E0'
    },
    myMessageText: {
      color: colors.card
    },
    theirMessageText: {
      color: colors.text
    },
    messageTime: {
      fontSize: 10,
      marginTop: 4,
      alignSelf: 'flex-end'
    },
    myMessageTime: {
      color: '#E0E7FF' // Light indigo
    },
    theirMessageTime: {
      color: colors.textSecondary
    },
    fileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: 'center',
      paddingBottom: Platform.OS === 'ios' ? 24 : 10 // Safe area
    },
    attachButton: {
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    attachIcon: {
      fontSize: 24,
      color: colors.textSecondary
    },
    input: {
      flex: 1,
      backgroundColor: '#F3F4F6',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 10,
      maxHeight: 100
    },
    sendButton: {
      paddingHorizontal: 16,
      paddingVertical: 8
    },
    sendButtonText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 16
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      alignItems: 'stretch',
      gap: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
      color: colors.text
    },
    modalButton: {
      padding: 16,
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      alignItems: 'center'
    },
    modalButtonText: {
      fontSize: 16,
      color: '#374151',
      fontWeight: '500'
    },
    saveButton: {
      backgroundColor: '#EEF2FF',
      borderWidth: 1,
      borderColor: '#C7D2FE'
    },
    saveButtonText: {
      color: colors.primary
    },
    cancelButton: {
      padding: 12,
      alignItems: 'center',
      marginTop: 8
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 14
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* File Action Modal */}
      {selectedFile && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedFile.name}</Text>

            <TouchableOpacity style={styles.modalButton} onPress={() => handleFileAction('OPEN')}>
              <Text style={styles.modalButtonText}>📥 Ladda ner / Öppna</Text>
            </TouchableOpacity>

            {selectedFile.id && (
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={() => handleFileAction('SAVE')}>
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>💾 Spara till mina dokument</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedFile(null)}>
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handlePickDocument} style={styles.attachButton} disabled={isUploading}>
          {isUploading ? <ActivityIndicator size="small" color={colors.textSecondary} /> : <Text style={styles.attachIcon}>📎</Text>}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Skriv ett meddelande..."
          multiline
        />
        <TouchableOpacity onPress={() => handleSend()} style={styles.sendButton} disabled={!inputText.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ConversationScreen;
