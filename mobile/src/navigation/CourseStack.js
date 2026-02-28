import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CourseListScreen from '../screens/student/CourseListScreen';
import CourseDetailScreen from '../screens/student/CourseDetailScreen';
import QuizScreen from '../screens/student/QuizScreen';
import EbookScreen from '../screens/student/EbookScreen';
import AssignmentSubmissionScreen from '../screens/student/AssignmentSubmissionScreen';

const Stack = createNativeStackNavigator();

const CourseStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f1012' } }}>
            <Stack.Screen name="CourseList" component={CourseListScreen} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="Ebook" component={EbookScreen} />
            <Stack.Screen name="Assignment" component={AssignmentSubmissionScreen} />
        </Stack.Navigator>
    );
};

export default CourseStack;
