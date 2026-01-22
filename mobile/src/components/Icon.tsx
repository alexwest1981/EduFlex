import React from 'react';
import { Ionicons } from '@expo/vector-icons';

/**
 * Icon component that matches desktop icons
 * Uses Ionicons from @expo/vector-icons
 */

interface IconProps {
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
    color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000' }) => {
    return <Ionicons name={name} size={size} color={color} />;
};

// Predefined icon names matching desktop
export const IconNames = {
    // Navigation
    home: 'home-outline' as const,
    homeActive: 'home' as const,
    courses: 'book-outline' as const,
    coursesActive: 'book' as const,
    calendar: 'calendar-outline' as const,
    calendarActive: 'calendar' as const,
    messages: 'chatbubbles-outline' as const,
    messagesActive: 'chatbubbles' as const,
    profile: 'person-outline' as const,
    profileActive: 'person' as const,

    // Admin
    users: 'people-outline' as const,
    documents: 'document-text-outline' as const,
    settings: 'settings-outline' as const,
    stats: 'stats-chart-outline' as const,
    shield: 'shield-checkmark-outline' as const,

    // Actions
    add: 'add-circle-outline' as const,
    edit: 'create-outline' as const,
    delete: 'trash-outline' as const,
    search: 'search-outline' as const,
    filter: 'filter-outline' as const,

    // Notifications
    notifications: 'notifications-outline' as const,
    notificationsActive: 'notifications' as const,

    // Gamification
    trophy: 'trophy-outline' as const,
    star: 'star-outline' as const,
    starActive: 'star' as const,
    flame: 'flame-outline' as const,

    // Files
    folder: 'folder-outline' as const,
    file: 'document-outline' as const,
    download: 'download-outline' as const,
    upload: 'cloud-upload-outline' as const,

    // UI
    checkmark: 'checkmark-circle-outline' as const,
    close: 'close-circle-outline' as const,
    info: 'information-circle-outline' as const,
    warning: 'warning-outline' as const,
    chevronRight: 'chevron-forward-outline' as const,
    chevronLeft: 'chevron-back-outline' as const,

    // Theme
    theme: 'color-palette-outline' as const,
    moon: 'moon-outline' as const,
    sunny: 'sunny-outline' as const,
};

export default Icon;
