import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Users, FileUser, Activity, MessageCircle, Heart } from 'lucide-react-native';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import SyvDashboardScreen from '../screens/syv/SyvDashboardScreen';
import HealthTeamDashboardScreen from '../screens/health/HealthTeamDashboardScreen';
import GuardianDashboardScreen from '../screens/guardian/GuardianDashboardScreen';
import MentorDashboardScreen from '../screens/mentor/MentorDashboardScreen';

const Tab = createBottomTabNavigator();

// Example for SYV (Guidance Counselor) Navigation
export const SyvTabs = () => {
    return (
        <Tab.Navigator screenOptions={tabOptions}>
            <Tab.Screen name="Oversight" component={SyvDashboardScreen} options={{ tabBarIcon: (p) => <Users {...p} /> }} />
            <Tab.Screen name="Meetings" component={PlaceholderScreen} options={{ tabBarIcon: (p) => <MessageCircle {...p} /> }} />
        </Tab.Navigator>
    );
};

// Example for Health Team (Hälsoteam) Navigation
export const HealthTeamTabs = () => {
    return (
        <Tab.Navigator screenOptions={tabOptions}>
            <Tab.Screen name="HealthReports" component={HealthTeamDashboardScreen} options={{ tabBarIcon: (p) => <Activity {...p} /> }} />
            <Tab.Screen name="Checkups" component={PlaceholderScreen} options={{ tabBarIcon: (p) => <Heart {...p} /> }} />
        </Tab.Navigator>
    );
};

// Example for Guardian (Vårdnadshavare) Navigation
export const GuardianTabs = () => {
    return (
        <Tab.Navigator screenOptions={tabOptions}>
            <Tab.Screen name="MyChildren" component={GuardianDashboardScreen} options={{ tabBarIcon: (p) => <Users {...p} /> }} />
            <Tab.Screen name="Grades" component={PlaceholderScreen} options={{ tabBarIcon: (p) => <FileUser {...p} /> }} />
        </Tab.Navigator>
    );
};

// Example for Mentor Navigation
export const MentorTabs = () => {
    return (
        <Tab.Navigator screenOptions={tabOptions}>
            <Tab.Screen name="MyMentees" component={MentorDashboardScreen} options={{ tabBarIcon: (p) => <Users {...p} /> }} />
            <Tab.Screen name="Progress" component={PlaceholderScreen} options={{ tabBarIcon: (p) => <Activity {...p} /> }} />
        </Tab.Navigator>
    );
};

const tabOptions = {
    headerShown: false,
    tabBarStyle: { backgroundColor: '#1a1b1d', borderTopColor: '#333' },
    tabBarActiveTintColor: '#00F5FF',
    tabBarInactiveTintColor: '#888',
};
