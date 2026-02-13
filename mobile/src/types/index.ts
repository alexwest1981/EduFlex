// User & Auth Types
export interface Role {
  id: number;
  name: UserRole;
  description?: string;
  defaultDashboard?: string;
  permissions?: string[];
  superAdmin?: boolean;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole | Role;
  profilePictureUrl?: string;
  points: number;
  level: number;
  earnedBadges: Badge[];
}

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'MENTOR' | 'PRINCIPAL';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  profilePictureUrl?: string;
  points: number;
  level: number;
  earnedBadges: Badge[];
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  ssn?: string;
  role?: UserRole;
}

// Course Types
export interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  isOpen: boolean;
  colorTheme?: string;
  teacherId?: number;
  teacherName?: string;
  studentCount?: number;
  progress?: number;
}

export interface CourseEnrollment {
  courseId: number;
  userId: number;
  enrolledAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
}

// Assignment Types
export interface Assignment {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  courseName?: string;
  deadline: string;
  maxScore?: number;
  xpReward?: number;
  status?: AssignmentStatus;
  submittedAt?: string;
  grade?: string;
  feedback?: string;
}

export type AssignmentStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';

export interface Lesson {
  id: number;
  title: string;
  content: string;
  videoUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  sortOrder: number;
}

export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  submittedAt: string;
  fileUrl?: string;
  fileName?: string; // Added
  content?: string;
  grade?: string;
  feedback?: string;
  gradedAt?: string;
}

// Gamification Types
export interface Badge {
  id: number;
  name: string;
  description: string;
  iconName: string;
  tier: BadgeTier;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export type BadgeTier = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface DailyChallenge {
  id: number;
  type: ChallengeType;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  expiresAt: string;
}

export type ChallengeType = 'COMPLETE_ASSIGNMENTS' | 'HIGH_SCORE' | 'LOGIN_STREAK' | 'STUDY_TIME';

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  bonusXp: number;
}

export interface Leaderboard {
  rank: number;
  userId: number;
  username: string;
  fullName: string;
  profilePictureUrl?: string;
  points: number;
  level: number;
}

// Notification Types
// Notification Types
export interface Notification {
  id: number;
  type: NotificationType;
  message: string; // Corrected from title/message split if needed, backend has message
  read: boolean;
  createdAt: string;
  actionUrl?: string; // Links to related entity
  userId: number;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export type NotificationType = 'SUCCESS' | 'WARNING' | 'INFO' | 'ACHIEVEMENT' | 'ASSIGNMENT' | 'MESSAGE';

// Message Types
export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  recipientId: number; // Added
  recipientName: string; // Added
  content: string;
  timestamp: string; // Changed from createdAt
  isRead: boolean; // Changed from read
  type?: 'TEXT' | 'IMAGE' | 'FILE'; // TEXT, IMAGE, FILE
  documentId?: number;
}

// Calendar/Event Types
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: EventType;
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  platform?: 'ZOOM' | 'MEET' | 'TEAMS' | 'NONE';
  meetingLink?: string;
  isMandatory?: boolean;
  topic?: string;
  courseId?: number;
  courseName?: string; // Optional if populated
  ownerId?: number;
  ownerName?: string; // Optional if populated
  location?: string;
}

export type EventType = 'LESSON' | 'WORKSHOP' | 'EXAM' | 'DEADLINE' | 'OTHER' | 'MEETING';

// Ebook Types
export interface Ebook {
  id: number;
  title: string;
  author: string;
  category?: string;
  description?: string;
  language?: string;
  isbn?: string;
  filePath?: string;
  coverUrl?: string;
  courses?: { id: number; name: string }[];
  readingProgress?: number;
  currentChapter?: string;
}

export type EbookCategory = {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
};

// Analytics Types
export interface StudentProgress {
  courseId: number;
  courseName: string;
  completedAssignments: number;
  totalAssignments: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageGrade?: number;
  riskLevel: RiskLevel;
  lastActivity?: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Theme Types
export interface Theme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

// Material Types
export interface CourseMaterial {
  id: number;
  title: string;
  content?: string;
  link?: string;
  fileUrl?: string;
  availableFrom?: string;
  type: MaterialType;
  courseId?: number;
}

export type MaterialType = 'TEXT' | 'VIDEO' | 'FILE' | 'LINK' | 'LESSON' | 'STUDY_MATERIAL' | 'QUESTIONS';

// Quiz Types
export interface Quiz {
  id: number;
  title: string;
  description: string;
  courseId: number;
  questions: Question[];
  authorId: number;
  availableFrom?: string;
  availableTo?: string;
}

export interface Question {
  id: number;
  text: string;
  quizId: number;
  options: Option[];
}

export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
  questionId: number;
}

export interface QuizResult {
  id: number;
  quizId: number;
  studentId: number;
  score: number;
  maxScore: number;
  date: string;
}
