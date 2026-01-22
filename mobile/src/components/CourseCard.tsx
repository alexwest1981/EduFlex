import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const progress = course.progress || 0;
  const themeColor = course.colorTheme || '#4F46E5';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Color accent */}
      <View style={[styles.colorAccent, { backgroundColor: themeColor }]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.courseCode}>{course.code}</Text>
            <Text style={styles.courseName} numberOfLines={2}>
              {course.name}
            </Text>
          </View>
          <View style={[styles.statusBadge, course.isOpen ? styles.openBadge : styles.closedBadge]}>
            <Text style={[styles.statusText, course.isOpen ? styles.openText : styles.closedText]}>
              {course.isOpen ? 'Aktiv' : 'Stängd'}
            </Text>
          </View>
        </View>

        {/* Teacher info */}
        {course.teacherName && (
          <Text style={styles.teacherName}>👨‍🏫 {course.teacherName}</Text>
        )}

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Framsteg</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: themeColor },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorAccent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  openBadge: {
    backgroundColor: '#D1FAE5',
  },
  closedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  openText: {
    color: '#059669',
  },
  closedText: {
    color: '#DC2626',
  },
  teacherName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingRight: 16,
  },
  arrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
});

export default CourseCard;
