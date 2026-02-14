import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessagesStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';
import { useAuth } from '../../context/AuthContext';
import { messageService, InboxMessage } from '../../services/messageService';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

type Tab = 'inbox' | 'sent' | 'teachers' | 'groups';

const TABS: { key: Tab; label: string }[] = [
  { key: 'inbox', label: 'Inkorg' },
  { key: 'sent', label: 'Skickat' },
  { key: 'teachers', label: 'Lärare' },
  { key: 'groups', label: 'Grupper' },
];

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const AVATAR_COLORS = ['#2547f4', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const InboxScreen: React.FC = () => {
  const { currentTheme } = useTheme();
  const colors = getThemeColors(currentTheme);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<MessagesStackParamList>>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('inbox');
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [contacts, setContacts] = useState<Record<string, any[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [inboxData, unread, contactData] = await Promise.all([
        activeTab === 'sent' ? messageService.getSent() : messageService.getInbox(),
        messageService.getUnreadCount(),
        messageService.getContacts(),
      ]);
      setMessages(inboxData);
      setUnreadCount(unread);
      setContacts(contactData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const handleMessagePress = async (msg: InboxMessage) => {
    if (!msg.isRead) {
      try { await messageService.markAsRead(msg.id); } catch { }
    }
    navigation.navigate('Conversation', {
      userId: user?.id === msg.senderId ? msg.recipientId : msg.senderId,
      userName: user?.id === msg.senderId ? msg.recipientName : msg.senderName,
    });
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(m =>
      m.senderName.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  const teacherContacts = useMemo(() => contacts.administration || [], [contacts]);
  const groupContacts = useMemo(() => contacts.classmates || [], [contacts]);

  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.avatarGradient}>
              <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Meddelanden</Text>
              {unreadCount > 0 && (
                <Text style={styles.headerSubtitle}>{unreadCount} olästa meddelanden</Text>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="options-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={{ marginLeft: 14 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök meddelanden, lärare..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 28, paddingHorizontal: 20 }}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabChange(tab.key)}
              style={styles.tabItem}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (activeTab === 'inbox' || activeTab === 'sent') ? (
          filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => {
              const isUnread = !msg.isRead && activeTab === 'inbox';
              const displayName = activeTab === 'sent' ? msg.recipientName : msg.senderName;
              const displayId = activeTab === 'sent' ? msg.recipientId : msg.senderId;
              const timeStr = formatDistanceToNow(new Date(msg.timestamp), { addSuffix: false, locale: sv });

              return (
                <TouchableOpacity
                  key={msg.id}
                  style={[styles.messageCard, isUnread && styles.messageCardUnread]}
                  onPress={() => handleMessagePress(msg)}
                  activeOpacity={0.7}
                >
                  {isUnread && <View style={styles.unreadStripe} />}
                  <View style={[styles.messageAvatar, { backgroundColor: `${getAvatarColor(displayId)}20` }]}>
                    <Text style={[styles.messageAvatarText, { color: getAvatarColor(displayId) }]}>
                      {getInitials(displayName)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.messageTopRow}>
                      <Text style={[styles.messageSender, isUnread && styles.messageSenderUnread]} numberOfLines={1}>
                        {displayName}
                      </Text>
                      <Text style={[styles.messageTime, isUnread && { color: colors.primary }]}>
                        {timeStr}
                      </Text>
                    </View>
                    <Text style={[styles.messageSubject, isUnread && { color: colors.text }]} numberOfLines={1}>
                      {msg.subject}
                    </Text>
                    <Text style={styles.messagePreview} numberOfLines={2}>
                      {msg.content}
                    </Text>
                  </View>
                  <View style={styles.messageActions}>
                    {isUnread && <View style={styles.unreadDot} />}
                    <Ionicons name="star-outline" size={14} color={colors.textMuted} style={{ opacity: 0.5 }} />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="mail-open-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Inga meddelanden hittades' : activeTab === 'sent' ? 'Inga skickade meddelanden' : 'Inkorgen är tom'}
              </Text>
            </View>
          )
        ) : activeTab === 'teachers' ? (
          teacherContacts.length > 0 ? (
            teacherContacts.map((contact: any) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                onPress={() => navigation.navigate('Conversation', { userId: contact.id, userName: contact.fullName })}
              >
                <View style={[styles.messageAvatar, { backgroundColor: `${getAvatarColor(contact.id)}20` }]}>
                  <Text style={[styles.messageAvatarText, { color: getAvatarColor(contact.id) }]}>
                    {getInitials(contact.fullName)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{contact.fullName}</Text>
                  <Text style={styles.contactRole}>{contact.role}</Text>
                </View>
                <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Inga lärare</Text>
            </View>
          )
        ) : (
          groupContacts.length > 0 ? (
            groupContacts.map((contact: any) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                onPress={() => navigation.navigate('Conversation', { userId: contact.id, userName: contact.fullName })}
              >
                <View style={styles.groupAvatar}>
                  <Ionicons name="people" size={20} color={colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{contact.fullName}</Text>
                  <Text style={styles.contactRole}>{contact.role}</Text>
                </View>
                <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Inga grupper</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewMessage')}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof getThemeColors>, insets: { top: number }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Header
    header: {
      paddingTop: insets.top + 8,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.isDark ? 'rgba(10,12,22,0.8)' : 'rgba(245,246,248,0.9)',
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    avatarGradient: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 20,
      color: colors.text,
    },
    headerSubtitle: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 11,
      color: colors.textMuted,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 14,
      height: 48,
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      color: colors.text,
      marginLeft: 10,
      marginRight: 14,
    },

    // Tabs
    tabBar: {
      borderBottomWidth: 1,
      borderBottomColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    },
    tabItem: {
      paddingBottom: 12,
      position: 'relative',
    },
    tabText: {
      fontFamily: 'Lexend_500Medium',
      fontSize: 14,
      color: colors.textMuted,
    },
    tabTextActive: {
      fontFamily: 'Lexend_700Bold',
      color: colors.text,
    },
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      marginLeft: -10,
      width: 20,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },

    // Scroll
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 100,
    },

    // Message Cards
    messageCard: {
      backgroundColor: colors.isDark ? 'rgba(24,29,52,0.3)' : 'rgba(255,255,255,0.6)',
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      gap: 14,
      marginBottom: 10,
      position: 'relative',
      overflow: 'hidden',
    },
    messageCardUnread: {
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    unreadStripe: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: colors.primary,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    messageAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messageAvatarText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 16,
    },
    messageTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },
    messageSender: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 14,
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    messageSenderUnread: {
      fontFamily: 'Lexend_700Bold',
    },
    messageTime: {
      fontFamily: 'Lexend_500Medium',
      fontSize: 10,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    messageSubject: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 3,
    },
    messagePreview: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: colors.textMuted,
      opacity: 0.7,
      lineHeight: 18,
    },
    messageActions: {
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },

    // Contact Cards
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 14,
      marginBottom: 4,
    },
    groupAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.isDark ? 'rgba(34,41,73,0.6)' : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    contactName: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 14,
      color: colors.text,
    },
    contactRole: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },

    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      gap: 8,
    },
    emptyText: {
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 16,
      color: colors.textMuted,
    },

    // FAB
    fab: {
      position: 'absolute',
      bottom: 90,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  });

export default InboxScreen;
