import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DailyChallenge } from '../types';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
}

const getChallengeIcon = (type: string): string => {
  switch (type) {
    case 'COMPLETE_ASSIGNMENTS':
      return '📝';
    case 'HIGH_SCORE':
      return '🎯';
    case 'LOGIN_STREAK':
      return '🔥';
    case 'STUDY_TIME':
      return '⏱️';
    default:
      return '✨';
  }
};

const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({ challenge }) => {
  const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
  const isCompleted = challenge.completed;

  return (
    <View style={[styles.container, isCompleted && styles.completedContainer]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getChallengeIcon(challenge.type)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isCompleted && styles.completedTitle]} numberOfLines={1}>
            {challenge.title}
          </Text>
          <View style={[styles.xpBadge, isCompleted && styles.completedXpBadge]}>
            <Text style={[styles.xpText, isCompleted && styles.completedXpText]}>
              +{challenge.xpReward} XP
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={1}>
          {challenge.description}
        </Text>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` },
                isCompleted && styles.completedProgressFill,
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {challenge.progress}/{challenge.target}
          </Text>
        </View>
      </View>

      {isCompleted && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  completedTitle: {
    color: '#059669',
  },
  xpBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedXpBadge: {
    backgroundColor: '#D1FAE5',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  completedXpText: {
    color: '#059669',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  completedProgressFill: {
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 36,
    textAlign: 'right',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DailyChallengeCard;
