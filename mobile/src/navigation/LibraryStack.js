import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GlobalLibraryScreen from '../screens/admin/GlobalLibraryScreen';
import StripeCheckoutScreen from '../screens/admin/StripeCheckoutScreen';

const Stack = createNativeStackNavigator();

const LibraryStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f1012' } }}>
            <Stack.Screen name="GlobalLibraryMain" component={GlobalLibraryScreen} />
            <Stack.Screen name="StripeCheckout" component={StripeCheckoutScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
    );
};

export default LibraryStack;
