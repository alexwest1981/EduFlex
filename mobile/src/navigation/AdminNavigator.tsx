import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native'; // Added
import { AdminStackParamList } from './types';

// Screens (Creating placeholders if they don't exist yet, but I will create them next)
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import UserDetailScreen from '../screens/admin/UserDetailScreen';
import ServerSettingsScreen from '../screens/admin/ServerSettingsScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator: React.FC = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="UserManagement"
                component={UserManagementScreen}
                options={({ navigation }) => ({
                    title: 'Hantera Användare',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 16 }}>
                            <Text style={{ color: '#4F46E5', fontSize: 16 }}>Stäng</Text>
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="UserDetail"
                component={UserDetailScreen}
                options={{ title: 'Användardetaljer' }}
            />
            <Stack.Screen
                name="ServerSettings"
                component={ServerSettingsScreen}
                options={({ navigation }) => ({
                    title: 'Serverinställningar',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 16 }}>
                            <Text style={{ color: '#4F46E5', fontSize: 16 }}>Stäng</Text>
                        </TouchableOpacity>
                    ),
                })}
            />
        </Stack.Navigator>
    );
};

export default AdminNavigator;
