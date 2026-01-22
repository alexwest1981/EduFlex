import api from './api';
import { Course, Assignment, Submission, PaginatedResponse, Lesson, Quiz, QuizResult, CourseMaterial } from '../types';

export const courseService = {
  /**
   * Get all courses (paginated)
   */
  getCourses: async (page = 0, size = 20): Promise<PaginatedResponse<Course>> => {
    const response = await api.get<PaginatedResponse<Course>>('/courses', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get courses for a specific student
   */
  getStudentCourses: async (studentId: number): Promise<Course[]> => {
    const response = await api.get<Course[]>(`/courses/student/${studentId}`);
    return response.data;
  },

  /**
   * Get a single course by ID
   */
  getCourse: async (courseId: number): Promise<Course> => {
    const response = await api.get<Course>(`/courses/${courseId}`);
    return response.data;
  },

  /**
   * Enroll in a course
   */
  enrollInCourse: async (courseId: number, userId: number): Promise<void> => {
    await api.post(`/courses/${courseId}/enroll/${userId}`);
  },

  /**
   * Get assignments for a course
   */
  getCourseAssignments: async (courseId: number): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>(`/courses/${courseId}/assignments`);
    return response.data;
  },

  /**
   * Get lessons for a course
   */
  getCourseLessons: async (courseId: number): Promise<Lesson[]> => {
    const response = await api.get<Lesson[]>(`/lessons/course/${courseId}`);
    return response.data;
  },

  /**
   * Get student's assignments across all courses
   */
  getMyAssignments: async (userId: number): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>('/assignments/my', {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Submit an assignment
   */
  submitAssignment: async (
    assignmentId: number,
    studentId: number,
    file: { uri: string; name: string; type: string }
  ): Promise<Submission> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await api.post<Submission>(
      `/assignments/${assignmentId}/submit/${studentId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get my submission for an assignment
   */
  getMySubmission: async (assignmentId: number, studentId: number): Promise<Submission | null> => {
    try {
      const response = await api.get<Submission>(
        `/assignments/${assignmentId}/my-submission/${studentId}`
      );
      return response.data;
    } catch (error) {
      // Return null if 404/Not found or just empty
      return null;
    }
  },

  /**
   * Get submission details
   */
  getSubmission: async (submissionId: number): Promise<Submission> => {
    const response = await api.get<Submission>(`/submissions/${submissionId}`);
    return response.data;
  },



  /**
   * Mark material as read/completed
   */
  markMaterialRead: async (materialId: number, userId: number): Promise<void> => {
    await api.post(`/materials/${materialId}/read/${userId}`);
  },
  /**
   * Get quizzes for a course
   */
  getCourseQuizzes: async (courseId: number): Promise<Quiz[]> => {
    const response = await api.get<Quiz[]>(`/quizzes/course/${courseId}`);
    return response.data;
  },

  /**
   * Submit quiz result
   */
  submitQuizResult: async (
    quizId: number,
    studentId: number,
    score: number,
    maxScore: number
  ): Promise<QuizResult> => {
    const response = await api.post<QuizResult>(`/quizzes/${quizId}/submit`, {
      studentId,
      score,
      maxScore,
    });
    return response.data;
  },

  /**
   * Create a new course
   */
  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    const response = await api.post<Course>('/courses', courseData);
    return response.data;
  },

  /**
   * Get pending applications for a teacher
   */
  getTeacherApplications: async (teacherId: number): Promise<any[]> => {
    const response = await api.get<any[]>(`/courses/applications/teacher/${teacherId}`);
    return response.data;
  },

  /**
   * Respond to a course application
   */
  respondToApplication: async (applicationId: number, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    await api.post(`/courses/applications/${applicationId}/${status}`);
  },

  /**
   * Get course materials
   */
  getCourseMaterials: async (courseId: number): Promise<CourseMaterial[]> => {
    const response = await api.get<CourseMaterial[]>(`/courses/${courseId}/materials`);
    return response.data;
  },
};
