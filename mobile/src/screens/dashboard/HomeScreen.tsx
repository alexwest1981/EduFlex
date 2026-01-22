import React from 'react';
import { useAuth } from '../../context/AuthContext';

// Import all role-specific dashboards
import StudentDashboardScreen from './StudentDashboardScreen';
import TeacherDashboardScreen from './TeacherDashboardScreen';
import MentorDashboardScreen from './MentorDashboardScreen';
import PrincipalDashboardScreen from './PrincipalDashboardScreen';
import AdminDashboardScreen from './AdminDashboardScreen';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

/**
 * HomeScreen - Role-Based Dashboard Router
 * Routes to the appropriate dashboard based on user role,
 * matching the structure of the desktop application.
 */
const HomeScreen: React.FC = () => {
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
  const { user } = useAuth();

  if (!user) {
    return null; // Auth context will handle redirect to login
  }

  // Safely get role as uppercase string with fallback
  let role = 'STUDENT';
  if (user.role) {
    if (typeof user.role === 'string') {
      role = user.role.toUpperCase();
    } else if (typeof user.role === 'object' && user.role.name) {
      role = user.role.name.toUpperCase();
    }
  }

  // Route to role-specific dashboard
  switch (role) {
    case 'STUDENT':
      return <StudentDashboardScreen />;

    case 'TEACHER':
      return <TeacherDashboardScreen />;

    case 'MENTOR':
      return <MentorDashboardScreen />;

    case 'PRINCIPAL':
      return <PrincipalDashboardScreen />;

    case 'ADMIN':
    case 'SYSTEM_ADMIN':
      return <AdminDashboardScreen />;

    default:
      // Fallback to student dashboard for unknown roles
      return <StudentDashboardScreen />;
  }
};

export default HomeScreen;
