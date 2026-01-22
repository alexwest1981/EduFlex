import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';
import api from '../../services/api';
import { User, UserRole } from '../../types';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

type Props = NativeStackScreenProps<AdminStackParamList, 'UserDetail'>;

const UserDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { userId } = route.params;
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadUser();
    }, [userId]);

    const loadUser = async () => {
        try {
            const response = await api.get<User>(`/users/${userId}`);
            setUser(response.data);
            navigation.setOptions({ title: `${response.data.firstName} ${response.data.lastName}` });
        } catch (error) {
            console.error('Failed to load user', error);
            Alert.alert('Fel', 'Kunde inte hämta användardetaljer.');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (newRole: UserRole) => {
        if (!user) return;

        Alert.alert(
            'Bekräfta ändring',
            `Vill du ändra rollen för ${user.firstName} till ${newRole}?`,
            [
                { text: 'Avbryt', style: 'cancel' },
                {
                    text: 'Ändra',
                    onPress: async () => {
                        setIsSaving(true);
                        try {
                            // Using generic update endpoint or role specific one
                            // Assuming PUT /users/{id} accepts Partial<User>
                            await api.put(`/users/${userId}`, { ...user, role: newRole });
                            setUser({ ...user, role: newRole });
                            Alert.alert('Success', 'Användarroll uppdaterad.');
                        } catch (error) {
                            console.error('Failed to update role', error);
                            Alert.alert('Fel', 'Kunde inte uppdatera rollen.');
                        } finally {
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = async () => {
        Alert.alert(
            'Bekräfta radering',
            'Är du säker på att du vill ta bort denna användare? Detta går inte att ångra.',
            [
                { text: 'Avbryt', style: 'cancel' },
                {
                    text: 'Radera',
                    style: 'destructive',
                    onPress: async () => {
                        setIsSaving(true);
                        try {
                            await api.delete(`/users/${userId}`);
                            Alert.alert('Raderad', 'Användaren har tagits bort.');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Failed to delete user', error);
                            Alert.alert('Fel', 'Kunde inte ta bort användaren.');
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading || !user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

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
    header: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarTextLarge: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    nameLarge: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',  // Theme: '#111827'
    },
    emailLarge: {
        fontSize: 16,
        color: '#6B7280',  // Theme: '#6B7280'
        marginTop: 4,
    },
    idText: {
        fontSize: 12,
        color: '#6B7280',  // Theme: '#6B7280'
        marginTop: 8,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    roleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    roleButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
        borderWidth: 1,
        borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    },
    roleButtonActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    roleButtonText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
    },
    roleButtonTextActive: {
        color: '#4F46E5',  // Theme: '#4F46E5'
        fontWeight: '700',
    },
    deleteButton: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#DC2626',
        fontWeight: '700',
        fontSize: 16,
    },
});

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarTextLarge}>{user.firstName[0]}{user.lastName[0]}</Text>
                </View>
                <Text style={styles.nameLarge}>{user.firstName} {user.lastName}</Text>
                <Text style={styles.emailLarge}>{user.email}</Text>
                <Text style={styles.idText}>ID: {user.id}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rollhantering</Text>
                <View style={styles.roleGrid}>
                    {(['STUDENT', 'TEACHER', 'MENTOR', 'PRINCIPAL', 'ADMIN'] as UserRole[]).map(role => {
                        const currentRole = typeof user.role === 'object' ? user.role.name : user.role;
                        return (
                            <TouchableOpacity
                                key={role}
                                style={[
                                    styles.roleButton,
                                    currentRole === role && styles.roleButtonActive
                                ]}
                                onPress={() => handleRoleChange(role)}
                                disabled={isSaving}
                            >
                                <Text style={[
                                    styles.roleButtonText,
                                    currentRole === role && styles.roleButtonTextActive
                                ]}>
                                    {role}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Farlig Zon</Text>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={isSaving}
                >
                    <Text style={styles.deleteButtonText}>
                        {isSaving ? 'Bearbetar...' : 'Ta bort användare'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default UserDetailScreen;
