import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RoleRouter from './src/navigation/RoleRouter';

const Stack = createNativeStackNavigator();

// Global Error Boundary fall-back
function SafeApp() {
  const [bootError, setBootError] = useState(null);

  if (bootError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#700', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Startup Crash Detected</Text>
        <Text style={{ color: '#ffaaaa', marginTop: 10 }}>{bootError}</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate
        loading={<ActivityIndicator size="large" color="#00F5FF" style={{ flex: 1, backgroundColor: '#0f1012' }} />}
        persistor={persistor}
      >
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f1012' } }}>
                <Stack.Screen name="Main" component={RoleRouter} />
                <Stack.Screen name="Login" component={LoginScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default SafeApp;
