import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ScheduleStatus = 'ongoing' | 'upcoming' | 'completed';

interface ScheduleItemProps {
    time: string;
    subject: string;
    room?: string;
    status: ScheduleStatus;
}

const statusConfig: Record<ScheduleStatus, { label: string; color: string; bg: string }> = {
    ongoing: { label: 'Pågår', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
    upcoming: { label: 'Kommande', color: '#135bec', bg: 'rgba(19, 91, 236, 0.15)' },
    completed: { label: 'Klar', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
};

const ScheduleItem: React.FC<ScheduleItemProps> = ({ time, subject, room, status }) => {
    const config = statusConfig[status];

    return (
        <View style={styles.container}>
            <View style={styles.timeCol}>
                <Text style={styles.timeText}>{time}</Text>
            </View>

            <View style={[styles.indicator, { backgroundColor: config.color }]} />

            <View style={styles.content}>
                <Text style={styles.subject} numberOfLines={1}>{subject}</Text>
                {room && (
                    <View style={styles.roomRow}>
                        <Ionicons name="location-outline" size={12} color="#64748b" />
                        <Text style={styles.roomText}>{room}</Text>
                    </View>
                )}
            </View>

            <View style={[styles.badge, { backgroundColor: config.bg }]}>
                <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(22, 28, 44, 0.7)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    timeCol: {
        width: 48,
        marginRight: 12,
    },
    timeText: {
        fontFamily: 'Lexend_600SemiBold',
        fontSize: 13,
        color: '#94a3b8',
    },
    indicator: {
        width: 3,
        height: 32,
        borderRadius: 2,
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    subject: {
        fontFamily: 'Lexend_600SemiBold',
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    roomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    roomText: {
        fontFamily: 'Lexend_400Regular',
        fontSize: 12,
        color: '#64748b',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    badgeText: {
        fontFamily: 'Lexend_500Medium',
        fontSize: 11,
    },
});

export default ScheduleItem;
