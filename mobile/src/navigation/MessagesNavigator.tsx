import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessagesStackParamList } from './types';

// Screens
import MessagesScreen from '../screens/messages/MessagesScreen';
import ConversationScreen from '../screens/messages/ConversationScreen';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

const MessagesNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Inbox"
        component={MessagesScreen}
        options={{ title: 'Meddelanden', headerShown: false }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={({ route }) => ({ title: route.params.userName })}
      />
    </Stack.Navigator>
  );
};

export default MessagesNavigator;
