import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { notificationService } from '../../services/notificationService';
import { Notification, NotificationType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

const NotificationsScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        if (!user) return;
        try {
            const data = await notificationService.getUserNotifications(user.id);
            setNotifications(data.reverse()); // Newest first
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const markAllRead = async () => {
        if (!user) return;
        try {
            await notificationService.markAllAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'SUCCESS': return '✅';
            case 'WARNING': return '⚠️';
            case 'INFO': return 'ℹ️';
            case 'ACHIEVEMENT': return '🏆';
            case 'ASSIGNMENT': return '📝';
            case 'MESSAGE': return '💬';
            default: return '🔔';
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.item, !item.read && styles.unreadItem]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{getIcon(item.type)}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: sv })}
                </Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Notifikationer</Text>
                <TouchableOpacity onPress={markAllRead}>
                    <Text style={styles.markAll}>Markera alla som lästa</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadNotifications(); }} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Inga notifikationer</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827'
    },
    markAll: {
        color: '#4F46E5',
        fontSize: 14,
        fontWeight: '500'
    },
    item: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center'
    },
    unreadItem: {
        backgroundColor: '#EEF2FF'
    },
    iconContainer: {
        marginRight: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        fontSize: 20
    },
    content: {
        flex: 1
    },
    message: {
        fontSize: 14,
        color: '#111827',
        marginBottom: 4,
        lineHeight: 20
    },
    time: {
        fontSize: 12,
        color: '#6B7280'
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4F46E5',
        marginLeft: 8
    },
    emptyState: {
        padding: 40,
        alignItems: 'center'
    },
    emptyText: {
        color: '#6B7280'
    }
});

export default NotificationsScreen;
