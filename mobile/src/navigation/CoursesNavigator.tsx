import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CoursesStackParamList } from './types';

// Screens
import CourseListScreen from '../screens/courses/CourseListScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import AssignmentScreen from '../screens/courses/AssignmentScreen';
import LessonScreen from '../screens/courses/LessonScreen';
import QuizScreen from '../screens/courses/QuizScreen'; // Added // Added
import { useTheme } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeStyles';

const Stack = createNativeStackNavigator<CoursesStackParamList>();

const CoursesNavigator: React.FC = () => {
  const { currentTheme } = useTheme();
  const colors = getThemeColors(currentTheme);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="CourseList"
        component={CourseListScreen}
        options={{ title: 'Mina Kurser' }}
      />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: 'Kurs' }}
      />
      <Stack.Screen
        name="Assignment"
        component={AssignmentScreen}
        options={{ title: 'Uppgift' }}
      />
      <Stack.Screen
        name="Lesson"
        component={LessonScreen}
        options={{ title: 'Lektion' }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ title: 'Prov' }}
      />
    </Stack.Navigator>
  );
};

export default CoursesNavigator;
