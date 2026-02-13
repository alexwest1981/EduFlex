import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MainTabParamList } from './types';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeStyles';

// Nested Navigators
import CoursesNavigator from './CoursesNavigator';
import MessagesNavigator from './MessagesNavigator';
import ProfileNavigator from './ProfileNavigator';

// Screens
import HomeScreen from '../screens/dashboard/HomeScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import Icon, { IconNames } from '../components/Icon';

// Tab Icon Component using vector icons
const TabIcon: React.FC<{ name: string; focused: boolean; color: string }> = ({ name, focused, color }) => {
  const iconMap: Record<string, { default: any; active: any }> = {
    home: { default: IconNames.home, active: IconNames.homeActive },
    courses: { default: IconNames.courses, active: IconNames.coursesActive },
    calendar: { default: IconNames.calendar, active: IconNames.calendarActive },
    messages: { default: IconNames.messages, active: IconNames.messagesActive },
    profile: { default: IconNames.profile, active: IconNames.profileActive },
  };

  const iconName = iconMap[name]?.[focused ? 'active' : 'default'] || IconNames.home;

  return <Icon name={iconName} size={24} color={color} />;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const { currentTheme } = useTheme();
  const colors = getThemeColors(currentTheme);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: colors.isDark ? colors.surface : '#FFFFFF',
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.isDark ? '#FFFFFF' : colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: {
          ...styles.tabLabel,
          fontFamily: 'Lexend_600SemiBold',
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Hem',
          tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesNavigator}
        options={{
          tabBarLabel: 'Kurser',
          tabBarIcon: ({ focused, color }) => <TabIcon name="courses" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Kalender',
          tabBarIcon: ({ focused, color }) => <TabIcon name="calendar" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesNavigator}
        options={{
          tabBarLabel: 'Meddelanden',
          tabBarIcon: ({ focused, color }) => <TabIcon name="messages" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused, color }) => <TabIcon name="profile" focused={focused} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    height: Platform.OS === 'ios' ? 88 : 64,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default MainTabNavigator;
