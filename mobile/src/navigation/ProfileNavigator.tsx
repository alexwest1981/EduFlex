import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeStyles';

// Screens
import ProfileMainScreen from '../screens/profile/ProfileMainScreen';
import AchievementsScreen from '../screens/profile/AchievementsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ThemeSelectorScreen from '../screens/settings/ThemeSelectorScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
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
        name="ProfileMain"
        component={ProfileMainScreen}
        options={{ title: 'Min Profil' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ title: 'Prestationer' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Inställningar' }}
      />
      <Stack.Screen
        name="ThemeSelector"
        component={ThemeSelectorScreen}
        options={{ title: 'Välj Tema' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
