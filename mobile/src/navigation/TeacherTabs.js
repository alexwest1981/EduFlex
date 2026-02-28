import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, CheckSquare, Library } from 'lucide-react-native';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';

const Tab = createBottomTabNavigator();

const TeacherTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: { backgroundColor: '#1a1b1d', borderTopColor: '#333' },
                tabBarActiveTintColor: '#00F5FF',
                tabBarInactiveTintColor: '#888',
                tabBarIcon: ({ color, size }) => {
                    let IconComponent;
                    if (route.name === 'Dashboard') IconComponent = Home;
                    else if (route.name === 'Classes') IconComponent = Users;
                    else if (route.name === 'Grading') IconComponent = CheckSquare;
                    else IconComponent = Library;
                    return <IconComponent color={color} size={size} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={TeacherDashboardScreen} />
            <Tab.Screen name="Classes" component={PlaceholderScreen} />
            <Tab.Screen name="Grading" component={PlaceholderScreen} />
            <Tab.Screen name="Library" component={PlaceholderScreen} />
        </Tab.Navigator>
    );
};

export default TeacherTabs;
