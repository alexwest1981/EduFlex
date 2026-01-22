import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';

import { useThemedStyles } from '../hooks';

const NotificationsScreen: React.FC = () => {
  const { colors, styles: themedStyles } = useThemedStyles();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (isRefresh = false) => {
    if (!user) return;
    try {
      const pageToFetch = isRefresh ? 0 : page;
      const data = await notificationService.getNotifications(user.id, pageToFetch);

      if (isRefresh) {
        setNotifications(data.content);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...data.content]);
        setPage(prev => prev + 1);
      }
      setHasMore(!data.last);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications(true);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  const onEndReached = () => {
    if (hasMore && !loading) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (item: Notification) => {
    if (item.read || !user) return;
    try {
      await notificationService.markAsRead(item.id);
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    // Determine icon and color based on type
    let icon = '📢';
    let color = '#3B82F6';

    switch (item.type) {
      case 'SUCCESS': icon = '✅'; color = '#10B981'; break;
      case 'WARNING': icon = '⚠️'; color = '#F59E0B'; break;
      case 'ACHIEVEMENT': icon = '🏆'; color = '#8B5CF6'; break;
      case 'ASSIGNMENT': icon = '📝'; color = '#6366F1'; break;
      case 'MESSAGE': icon = '💬'; color = '#06B6D4'; break;
    }

    return (
      <TouchableOpacity
        style={[styles.itemContainer, !item.read && styles.unreadContainer]}
        onPress={() => handleMarkAsRead(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Text style={{ fontSize: 24 }}>{icon}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.messageText, !item.read && styles.unreadText]}>
            {item.message}
          </Text>
          <Text style={styles.timeText}>
            {format(new Date(item.createdAt), 'd MMM HH:mm', { locale: sv })}
          </Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    markAllText: {
      color: colors.primary,
      fontWeight: '600',
    },
    list: {
      padding: 16,
    },
    itemContainer: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 8,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 3,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unreadContainer: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    contentContainer: {
      flex: 1,
    },
    messageText: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
      lineHeight: 20,
    },
    unreadText: {
      fontWeight: '600',
      color: colors.text,
    },
    timeText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginLeft: 8,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textSecondary,
      marginTop: 40,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifikationer</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllText}>Markera alla som lästa</Text>
        </TouchableOpacity>
      </View>

      {loading && page === 0 ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<Text style={styles.emptyText}>Inga notifikationer än.</Text>}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;
