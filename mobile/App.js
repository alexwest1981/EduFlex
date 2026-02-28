import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import SyncManager from './src/components/SyncManager';
import LoginScreen from './src/screens/LoginScreen';
import RoleRouter from './src/navigation/RoleRouter';

const Stack = createNativeStackNavigator();

const AppNav = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1012' }}>
        <ActivityIndicator size="large" color="#00F5FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f1012' } }}>
        {userToken !== null ? (
          <Stack.Screen name="Dashboard" component={RoleRouter} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

import { ThemeProvider } from './src/context/ThemeContext';
import { registerForPushNotificationsAsync } from './src/utils/notificationService';

export default function App() {
  React.useEffect(() => {
    registerForPushNotificationsAsync().then(token => console.log('Init Push Token:', token));
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="large" color="#00F5FF" style={{ flex: 1, backgroundColor: '#0f1012' }} />} persistor={persistor}>
        <ThemeProvider>
          <AuthProvider>
            <SyncManager />
            <AppNav />
          </AuthProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
