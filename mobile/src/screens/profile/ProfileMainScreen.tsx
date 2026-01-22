import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import GamificationCard from '../../components/GamificationCard';

import { useThemedStyles } from '../../hooks';

type ProfileMainScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ProfileMain'
>;

interface Props {
  navigation: ProfileMainScreenNavigationProp;
}

const ProfileMainScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { colors, styles: themedStyles } = useThemedStyles();

  const handleLogout = () => {
    Alert.alert('Logga ut', 'Är du säker på att du vill logga ut?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Logga ut', style: 'destructive', onPress: logout },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 100,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarContainer: {
      marginBottom: 16,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 36,
      fontWeight: '700',
      color: colors.card,
    },
    userName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    userRole: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    section: {
      marginBottom: 24,
    },
    menu: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    menuArrow: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    logoutButton: {
      backgroundColor: '#FEE2E2',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#DC2626',
    },
    version: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 24,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.profilePictureUrl ? (
            <Image source={{ uri: user.profilePictureUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user?.fullName || 'Användare'}</Text>
        <Text style={styles.userRole}>
          {user?.role === 'STUDENT' ? '👨‍🎓 Student' : user?.role === 'TEACHER' ? '👨‍🏫 Lärare' : '👤 Admin'}
        </Text>
      </View>

      {/* Gamification Card */}
      <View style={styles.section}>
        <GamificationCard
          level={user?.level || 1}
          points={user?.points || 0}
          streak={0}
          onPress={() => navigation.navigate('Achievements')}
        />
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Achievements')}>
          <Text style={styles.menuIcon}>🏆</Text>
          <Text style={styles.menuText}>Prestationer</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Inställningar</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Min Statistik</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>Hjälp & Support</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logga ut</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>EduFlex Mobile v1.0.0</Text>
    </ScrollView>
  );
};

export default ProfileMainScreen;
