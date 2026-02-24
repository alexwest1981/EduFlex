import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';

const NotificationBell = ({ className = "" }) => {
    const { currentUser } = useAppContext();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Poll for unread count – with silent failure and exponential backoff
    useEffect(() => {
        if (!currentUser?.id) return;

        let consecutiveFailures = 0;
        let timeoutId = null;

        const scheduleNext = (delayMs) => {
            timeoutId = setTimeout(poll, delayMs);
        };

        const poll = async () => {
            try {
                const response = await api.notifications.getUnreadCount(currentUser.id);
                setUnreadCount(response.count || 0);
                consecutiveFailures = 0;
                scheduleNext(30000); // Back to normal 30s interval on success
            } catch {
                consecutiveFailures++;
                // Back off: 30s → 60s → 120s → 300s (5 min max)
                const backoff = Math.min(30000 * Math.pow(2, consecutiveFailures - 1), 300000);
                scheduleNext(backoff);
            }
        };

        poll();
        return () => clearTimeout(timeoutId);
    }, [currentUser?.id]);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen && currentUser?.id) {
            fetchNotifications();
        }
    }, [isOpen, currentUser?.id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await api.notifications.getUserNotifs(currentUser.id);
            setNotifications(data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.isRead) {
            try {
                await api.notifications.markRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        // Navigate to action URL
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            setIsOpen(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.notifications.markAllAsRead(currentUser.id);
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return '✅';
            case 'WARNING': return '⚠️';
            case 'INFO':
            default: return 'ℹ️';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just nu';
        if (diffMins < 60) return `${diffMins}m sedan`;
        if (diffHours < 24) return `${diffHours}h sedan`;
        if (diffDays < 7) return `${diffDays}d sedan`;
        return date.toLocaleDateString('sv-SE');
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all relative group"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#121212]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">Notifikationer</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                            >
                                <CheckCheck size={14} />
                                Markera alla som lästa
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                Laddar notifikationer...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                Inga notifikationer
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors border-b border-gray-50 dark:border-gray-800 last:border-b-0 ${notification.isRead
                                            ? 'bg-white dark:bg-[#1E1F20] hover:bg-gray-50 dark:hover:bg-[#282a2c]'
                                            : 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                                        }`}
                                >
                                    <div className="text-xl mt-0.5">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white font-medium'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
                            <button
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsOpen(false);
                                }}
                                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                            >
                                Visa alla notifikationer
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
