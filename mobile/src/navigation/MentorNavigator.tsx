import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import { MentorStackParamList } from './types';

// Screens
import StudentAnalysisScreen from '../screens/mentor/StudentAnalysisScreen';
import StudentListScreen from '../screens/mentor/StudentListScreen';
import BookMeetingScreen from '../screens/mentor/BookMeetingScreen';

const Stack = createNativeStackNavigator<MentorStackParamList>();

const MentorNavigator: React.FC = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="StudentAnalysis"
                component={StudentAnalysisScreen}
                options={{ title: 'Prestationsanalys' }}
            />
            {/* BookMeeting placeholder */}
            <Stack.Screen
                name="BookMeeting"
                component={BookMeetingScreen}
                options={({ navigation }) => ({
                    title: 'Boka Möte',
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

export default MentorNavigator;
