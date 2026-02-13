import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AssignmentCardProps {
    subject: string;
    title: string;
    progress: number; // 0-100
    deadline: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
    subject,
    title,
    progress,
    deadline,
    icon = 'document-text-outline',
}) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const isOverdue = new Date(deadline) < new Date();

    const formatDeadline = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Försenad';
        if (diffDays === 0) return 'Idag';
        if (diffDays === 1) return 'Imorgon';
        return `${diffDays} dagar kvar`;
    };

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'rgba(19, 91, 236, 0.15)' }]}>
                <Ionicons name={icon} size={20} color={isOverdue ? '#ef4444' : '#135bec'} />
            </View>

            <Text style={styles.subject} numberOfLines={1}>{subject}</Text>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${clampedProgress}%`,
                                backgroundColor: isOverdue ? '#ef4444' : '#135bec',
                            },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>{clampedProgress}%</Text>
            </View>

            <Text style={[styles.deadline, isOverdue && styles.deadlineOverdue]}>
                {formatDeadline(deadline)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(22, 28, 44, 0.7)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    subject: {
        fontFamily: 'Lexend_500Medium',
        fontSize: 11,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    title: {
        fontFamily: 'Lexend_600SemiBold',
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 12,
        lineHeight: 20,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontFamily: 'Lexend_500Medium',
        fontSize: 11,
        color: '#94a3b8',
    },
    deadline: {
        fontFamily: 'Lexend_400Regular',
        fontSize: 12,
        color: '#94a3b8',
    },
    deadlineOverdue: {
        color: '#ef4444',
    },
});

export default AssignmentCard;
