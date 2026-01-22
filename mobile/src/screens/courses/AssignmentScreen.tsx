import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CoursesStackParamList } from '../../navigation/types';
import { courseService } from '../../services';
import { Assignment, Submission } from '../../types';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

type AssignmentScreenNavigationProp = NativeStackNavigationProp<
  CoursesStackParamList,
  'Assignment'
>;
type AssignmentScreenRouteProp = RouteProp<CoursesStackParamList, 'Assignment'>;

interface Props {
  navigation: AssignmentScreenNavigationProp;
  route: AssignmentScreenRouteProp;
}

const AssignmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { assignmentId } = route.params;
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const loadData = async () => {
    try {
      if (!user) return;
      // Fetch assignment details from the course (find it) - Wait, we only have ID.
      // We need getAssignment endpoint or find it from course.
      // Let's assume we can fetch it via courseService.getCourseAssignments or we need a new endpoint.
      // For now, let's try to get it from the list of assignments for the student or course.
      // Actually courseService doesn't have getAssignmentById.
      // But we can get submission.

      // Limitation: We don't have getAssignmentById in frontend service yet, but we have getCourseAssignments.
      // Ideally we should pass assignment object or fetch it.
      // Let's assume we fetch submission first.
      const sub = await courseService.getMySubmission(assignmentId, user.id);
      setSubmission(sub);

      // We need assignment details. Since we don't have a direct endpoint, 
      // we might need to fetch course assignments and find it. 
      // OR we can update backend to support getAssignmentById.
      // For now, let's rely on global fetch if possible or just display basics.
      // WAIT! Backend has no public endpoint for single assignment?
      // AssignmentController has: getAssignments(courseId) and getMyAssignments(userId).
      // We can use getMyAssignments and find it.
      const myAssignments = await courseService.getMyAssignments(user.id);
      const found = myAssignments.find((a) => a.id === assignmentId);
      if (found) {
        setAssignment(found);
      } else {
        // Fallback: try to finding from course assignments if we knew courseId
        // But we don't have courseId in params necessarily? 
        // Check types: Assignment: { assignmentId: number };
        // We might update params to include courseId for easier lookup.
      }

    } catch (error) {
      console.error('Failed to load assignment data:', error);
      Alert.alert('Fel', 'Kunde inte ladda uppgiften.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setSelectedFile(result.assets[0]);
    } catch (err) {
      console.error('Unknown error: ', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user || !assignment) return;

    setIsSubmitting(true);
    try {
      const newSubmission = await courseService.submitAssignment(
        assignment.id,
        user.id,
        {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/octet-stream',
        }
      );
      setSubmission(newSubmission);
      Alert.alert('Framgång', 'Din uppgift har lämnats in!');
      setSelectedFile(null);
    } catch (error) {
      console.error('Submission failed:', error);
      Alert.alert('Fel', 'Inlämningen misslyckades. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!assignment) {
    // If we couldn't find it
    return (
      <View style={styles.errorContainer}>
        <Text>Uppgiften hittades inte.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{assignment.title}</Text>
        <Text style={styles.deadline}>
          📅 Deadline: {new Date(assignment.deadline).toLocaleDateString('sv-SE')}
        </Text>
        {assignment.description && (
          <Text style={styles.description}>{assignment.description}</Text>
        )}
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>{assignment.xpReward} XP</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Din Inlämning</Text>

        {submission ? (
          <View style={styles.submissionCard}>
            <View style={[styles.statusBadge, styles.submittedBadge]}>
              <Text style={styles.statusText}>✅ Inlämnad</Text>
            </View>
            <Text style={styles.submittedDate}>
              Datum: {new Date(submission.submittedAt).toLocaleString('sv-SE')}
            </Text>
            {submission.fileName && (
              <Text style={styles.fileName}>📄 {submission.fileName}</Text>
            )}

            {submission.grade && (
              <View style={styles.gradeContainer}>
                <Text style={styles.gradeLabel}>Betyg:</Text>
                <Text style={styles.gradeValue}>{submission.grade}</Text>
              </View>
            )}

            {submission.feedback && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackLabel}>Feedback:</Text>
                <Text style={styles.feedbackText}>{submission.feedback}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.uploadContainer}>
            <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument}>
              <Text style={styles.uploadIcon}>📎</Text>
              <Text style={styles.uploadText}>
                {selectedFile ? selectedFile.name : 'Välj fil att ladda upp'}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Lämna in uppgift</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',  // Theme: '#111827'
    marginBottom: 8,
  },
  deadline: {
    fontSize: 14,
    color: '#6B7280',  // Theme: '#6B7280'
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  xpBadge: {
    backgroundColor: '#EEF2FF', // Indigo-50
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  xpText: {
    color: '#4F46E5',  // Theme: '#4F46E5' // Indigo-600
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',  // Theme: '#111827'
    marginBottom: 16,
  },
  uploadContainer: {
    backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    borderStyle: 'dashed',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
  },
  uploadIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  uploadText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  submissionCard: {
    backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12
  },
  submittedBadge: {
    backgroundColor: '#D1FAE5', // Green-100
  },
  statusText: {
    color: '#065F46', // Green-800
    fontWeight: '600',
    fontSize: 14
  },
  submittedDate: {
    fontSize: 14,
    color: '#6B7280',  // Theme: '#6B7280'
    marginBottom: 8
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',  // Theme: '#111827'
    marginBottom: 16
  },
  gradeContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  gradeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151'
  },
  gradeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5'
  },
  feedbackContainer: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
    padding: 12,
    borderRadius: 8
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4
  },
  feedbackText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic'
  }
});

export default AssignmentScreen;
