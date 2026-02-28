import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BookOpen, Home, Settings, Activity } from 'lucide-react-native';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CourseStack from './CourseStack';
import EduAiStack from './EduAiStack';

const Tab = createBottomTabNavigator();

const StudentTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1a1b1d',
                    borderTopColor: '#333',
                },
                tabBarActiveTintColor: '#00F5FF',
                tabBarInactiveTintColor: '#888',
                tabBarIcon: ({ color, size }) => {
                    let IconComponent;
                    if (route.name === 'Dashboard') IconComponent = Home;
                    else if (route.name === 'Courses') IconComponent = BookOpen;
                    else if (route.name === 'EduAI') IconComponent = Activity;
                    else IconComponent = Settings;

                    return <IconComponent color={color} size={size} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={StudentDashboardScreen} />
            <Tab.Screen name="Courses" component={CourseStack} />
            <Tab.Screen name="EduAI" component={EduAiStack} />
            <Tab.Screen name="Profile" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export default StudentTabs;
