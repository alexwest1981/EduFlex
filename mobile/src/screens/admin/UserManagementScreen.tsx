import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/types';
import api from '../../services/api';
import { User, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';

type UserManagementNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'UserManagement'>;

const UserManagementScreen: React.FC = () => {
    const navigation = useNavigation<UserManagementNavigationProp>();
    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            // Fetch all users (pagination support can be improved later)
            const response = await api.get('/users?page=0&size=100');
            const data = response.data.content || response.data;
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
            Alert.alert('Fel', 'Kunde inte hämta användare.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, selectedRole, users]);

    const filterUsers = () => {
        let result = users;

        // Filter by Role
        if (selectedRole !== 'ALL') {
            result = result.filter(u => {
                const userRole = typeof u.role === 'object' ? u.role.name : u.role;
                return userRole === selectedRole;
            });
        }

        // Filter by Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(u =>
                (u.firstName?.toLowerCase().includes(lowerQuery)) ||
                (u.lastName?.toLowerCase().includes(lowerQuery)) ||
                (u.email?.toLowerCase().includes(lowerQuery)) ||
                (u.username?.toLowerCase().includes(lowerQuery))
            );
        }

        setFilteredUsers(result);
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <TouchableOpacity
            style={[styles.userCard, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}
            onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
        >
            <View style={[styles.avatar, { backgroundColor: '#4F46E5' }]}>
                <Text style={styles.avatarText}>
                    {item.firstName?.[0]}{item.lastName?.[0]}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: '#111827' }]}>{item.firstName} {item.lastName}</Text>
                <Text style={[styles.userEmail, { color: '#6B7280' }]}>{item.email}</Text>
                <Text style={[styles.userRole, { color: '#4F46E5' }]}>
                    {typeof item.role === 'object' ? item.role.name : item.role}
                </Text>
            </View>
            <Text style={[styles.arrow, { color: '#6B7280' }]}>→</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827' }]}
                    placeholder="Sök användare..."
                    placeholderTextColor={'#6B7280'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterContainer}>
                {(['ALL', 'STUDENT', 'TEACHER', 'ADMIN'] as const).map(role => (
                    <TouchableOpacity
                        key={role}
                        style={[
                            styles.filterButton,
                            selectedRole === role && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedRole(role)}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedRole === role && styles.filterTextActive
                        ]}>
                            {role === 'ALL' ? 'Alla' : role}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderUserItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>Inga användare hittades</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
    },
    filterButtonActive: {
        backgroundColor: '#4F46E5',
    },
    filterText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: 16,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#4F46E5',
        fontWeight: '700',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    userEmail: {
        fontSize: 14,
        color: '#6B7280',
    },
    userRole: {
        fontSize: 12,
        color: '#4F46E5',
        fontWeight: '600',
        marginTop: 2,
    },
    arrow: {
        fontSize: 20,
        color: '#9CA3AF',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#6B7280',
    },
});

export default UserManagementScreen;
