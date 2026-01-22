import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import { PrincipalStackParamList } from './types';

// Screens
import StaffListScreen from '../screens/principal/StaffListScreen';
import TeacherOverviewScreen from '../screens/principal/TeacherOverviewScreen';
import CourseStatisticsScreen from '../screens/principal/CourseStatisticsScreen';
import FullReportScreen from '../screens/principal/FullReportScreen'; // Added import

const Stack = createNativeStackNavigator<PrincipalStackParamList>();

const PrincipalNavigator: React.FC = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="StaffList"
                component={StaffListScreen}
                options={{ title: 'Personalöversikt' }}
            />
            {/* Reports placeholder */}
            <Stack.Screen
                name="FullReport"
                component={FullReportScreen}
                options={({ navigation }) => ({
                    title: 'Fullständig Rapport',
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

export default PrincipalNavigator;
