import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EduAiScreen from '../screens/student/EduAiScreen';
import AiCoachScreen from '../screens/student/AiCoachScreen';
import FlashcardsScreen from '../screens/student/FlashcardsScreen';

const Stack = createNativeStackNavigator();

const EduAiStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f1012' } }}>
            <Stack.Screen name="EduAiHub" component={EduAiScreen} />
            <Stack.Screen name="AiCoach" component={AiCoachScreen} />
            <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
        </Stack.Navigator>
    );
};

export default EduAiStack;
