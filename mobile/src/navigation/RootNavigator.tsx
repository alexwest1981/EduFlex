import React from 'react';
import { View } from 'react-native'; // Added View
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import AdminNavigator from './AdminNavigator';
import TeacherNavigator from './TeacherNavigator'; // Added
import MentorNavigator from './MentorNavigator'; // Added
import PrincipalNavigator from './PrincipalNavigator'; // Added

// Screens
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import EbookLibraryScreen from '../screens/ebooks/EbookLibraryScreen';
import WellbeingCenterScreen from '../screens/wellbeing/WellbeingCenterScreen';
import FileManagerScreen from '../screens/files/FileManagerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth(); // Changed isAuthenticated to user

  // Could show a splash screen here while loading
  if (isLoading) {
    return <View style={{ flex: 1 }} />; // Or Splash // Updated loading component
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? ( // Changed !isAuthenticated to user
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerShown: true,
              title: 'Notifikationer',
              presentation: 'modal', // Fixed syntax
            }}
          />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{
              headerShown: true,
              title: 'Topplista',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="EbookLibrary"
            component={EbookLibraryScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="WellbeingCenter"
            component={WellbeingCenterScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="FileManager"
            component={FileManagerScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Admin"
            component={AdminNavigator}
            options={{
              headerShown: false, // AdminNavigator handles its own headers
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="Teacher"
            component={TeacherNavigator}
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="Mentor"
            component={MentorNavigator}
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="Principal"
            component={PrincipalNavigator}
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
