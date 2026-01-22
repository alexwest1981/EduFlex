import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TeacherStackParamList } from './types';

// Screens
import CreateCourseScreen from '../screens/teacher/CreateCourseScreen';
import CourseApplicationsScreen from '../screens/teacher/CourseApplicationsScreen';
import AttendanceScreen from '../screens/teacher/AttendanceScreen';
import StatisticsScreen from '../screens/teacher/StatisticsScreen';
import { TouchableOpacity, Text } from 'react-native';

const Stack = createNativeStackNavigator<TeacherStackParamList>();

const TeacherNavigator: React.FC = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="CreateCourse"
                component={CreateCourseScreen}
                options={{ title: 'Skapa Kurs' }}
            />
            <Stack.Screen
                name="CourseApplications"
                component={CourseApplicationsScreen}
                options={{ title: 'Hantera Ansökningar' }}
            />
            {/* Attendance placeholder if needed later */}
            <Stack.Screen
                name="Attendance"
                component={AttendanceScreen}
                options={({ navigation }) => ({
                    title: 'Närvarorapportering',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 16 }}>
                            <Text style={{ color: '#4F46E5', fontSize: 16 }}>Stäng</Text>
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="Statistics"
                component={StatisticsScreen}
                options={({ navigation }) => ({
                    title: 'Statistik & Analys',
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

export default TeacherNavigator;
