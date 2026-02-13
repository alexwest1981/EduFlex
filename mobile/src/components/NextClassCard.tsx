import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent } from '../types';

interface NextClassCardProps {
    nextClass: CalendarEvent | null;
    onJoin?: () => void;
}

const NextClassCard: React.FC<NextClassCardProps> = ({ nextClass, onJoin }) => {
    if (!nextClass) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
                <Text style={styles.emptyTitle}>Inga fler lektioner idag</Text>
                <Text style={styles.emptySubtitle}>Njut av din lediga tid!</Text>
            </View>
        );
    }

    const startTime = new Date(nextClass.startTime);
    const endTime = new Date(nextClass.endTime);
    const now = new Date();
    const isLive = now >= startTime && now <= endTime;

    const formatTime = (date: Date) =>
        date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

    return (
        <LinearGradient
            colors={['#135bec', '#0a3ad8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.labelRow}>
                    <Ionicons name="book-outline" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.label}>Nästa Lektion</Text>
                </View>
                {isLive && (
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}
            </View>

            <Text style={styles.title} numberOfLines={1}>{nextClass.title}</Text>

            <View style={styles.detailsRow}>
                <View style={styles.detail}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.detailText}>
                        {formatTime(startTime)} - {formatTime(endTime)}
                    </Text>
                </View>
                {nextClass.location && (
                    <View style={styles.detail}>
                        <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.detailText}>{nextClass.location}</Text>
                    </View>
                )}
            </View>

            {nextClass.meetingLink && (
                <TouchableOpacity style={styles.joinButton} onPress={onJoin} activeOpacity={0.8}>
                    <Text style={styles.joinButtonText}>Gå med</Text>
                    <Ionicons name="arrow-forward" size={16} color="#135bec" />
                </TouchableOpacity>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    emptyContainer: {
        backgroundColor: 'rgba(22, 28, 44, 0.7)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    emptyTitle: {
        fontFamily: 'Lexend_600SemiBold',
        fontSize: 16,
        color: '#FFFFFF',
        marginTop: 8,
    },
    emptySubtitle: {
        fontFamily: 'Lexend_400Regular',
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontFamily: 'Lexend_500Medium',
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
    },
    liveText: {
        fontFamily: 'Lexend_700Bold',
        fontSize: 10,
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    title: {
        fontFamily: 'Lexend_700Bold',
        fontSize: 22,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontFamily: 'Lexend_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    joinButton: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
        alignSelf: 'flex-start',
    },
    joinButtonText: {
        fontFamily: 'Lexend_600SemiBold',
        fontSize: 14,
        color: '#135bec',
    },
});

export default NextClassCard;
