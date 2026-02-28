import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Server, Users, Settings, Globe } from 'lucide-react-native';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import AdminOpsScreen from '../screens/admin/AdminOpsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import LibraryStack from './LibraryStack';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: { backgroundColor: '#1a1b1d', borderTopColor: '#333' },
                tabBarActiveTintColor: '#00F5FF',
                tabBarInactiveTintColor: '#888',
                tabBarIcon: ({ color, size }) => {
                    let IconComponent;
                    if (route.name === 'OpsCenter') IconComponent = Server;
                    else if (route.name === 'Users') IconComponent = Users;
                    else if (route.name === 'GlobalLibrary') IconComponent = Globe;
                    else IconComponent = Settings;
                    return <IconComponent color={color} size={size} />;
                },
            })}
        >
            <Tab.Screen name="OpsCenter" component={AdminOpsScreen} />
            <Tab.Screen name="Users" component={AdminUsersScreen} />
            <Tab.Screen name="GlobalLibrary" component={LibraryStack} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export default AdminTabs;
