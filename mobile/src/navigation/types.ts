import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Courses: NavigatorScreenParams<CoursesStackParamList>;
  Calendar: undefined;
  Messages: NavigatorScreenParams<MessagesStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Courses Stack
export type CoursesStackParamList = {
  CourseList: undefined;
  CourseDetail: { courseId: number };
  Lesson: { lessonId: number; courseId: number }; // Added
  Assignment: { assignmentId: number };
  SubmitAssignment: { assignmentId: number };
  Material: { materialId: number };
  Quiz: { quizId: number; courseId: number }; // Added
};

// Messages Stack
export type MessagesStackParamList = {
  Inbox: undefined;
  Conversation: { userId: number; userName: string };
  NewMessage: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Achievements: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  ThemeSelector: undefined;
};

// Admin Stack
export type AdminStackParamList = {
  UserManagement: undefined;
  UserDetail: { userId: number };
  ServerSettings: undefined;
  Backups: undefined;
};

// Teacher Stack
export type TeacherStackParamList = {
  CreateCourse: undefined;
  CourseApplications: undefined;
  Attendance: { courseId?: number };
  Statistics: { courseId?: number };
};

// Mentor Stack
export type MentorStackParamList = {
  StudentList: undefined;
  StudentAnalysis: { studentId: number };
  BookMeeting: undefined;
};

// Principal Stack
export type PrincipalStackParamList = {
  TeacherOverview: undefined;
  CourseStatistics: undefined;
  FullReport: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>; // Added
  Teacher: NavigatorScreenParams<TeacherStackParamList>; // Added
  Mentor: NavigatorScreenParams<MentorStackParamList>; // Added
  Principal: NavigatorScreenParams<PrincipalStackParamList>; // Added
  Notifications: undefined;
  Leaderboard: { courseId?: number };
  EbookLibrary: undefined;
  WellbeingCenter: undefined;
  FileManager: undefined;
};

// Declare global types for navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
