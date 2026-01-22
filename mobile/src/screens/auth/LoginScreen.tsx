import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage, tokenManager } from '../../services';

import { useThemedStyles } from '../../hooks';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Load saved tenant ID
    const loadTenant = async () => {
      const saved = await tokenManager.getTenantId();
      if (saved) setTenantId(saved);
    };
    loadTenant();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Fel', 'Vänligen fyll i användarnamn och lösenord');
      return;
    }

    try {
      // Save tenant ID before login (if provided)
      if (tenantId.trim()) {
        await tokenManager.setTenantId(tenantId.trim());
      } else {
        // Clear tenant if empty (standard login)
        await tokenManager.setTenantId('');
      }
      await login({ username: username.trim(), password });
    } catch (error) {
      Alert.alert('Inloggning misslyckades', getErrorMessage(error));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>EduFlex</Text>
          <Text style={styles.subtitle}>Nästa Generations Lärplattform</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Skola ID (Valfritt)</Text>
            <TextInput
              style={styles.input}
              placeholder="Lämna tomt för Standard/Admin"
              placeholderTextColor="#9CA3AF"
              value={tenantId}
              onChangeText={setTenantId}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Användarnamn</Text>
            <TextInput
              style={styles.input}
              placeholder="Ange ditt användarnamn"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Lösenord</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ange ditt lösenord"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPasswordText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Glömt lösenord?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Logga in</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Har du inget konto?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Registrera dig</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>EduFlex Mobile v1.0.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',  // Theme: '#111827'
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',  // Theme: '#6B7280'
  },
  form: {
    backgroundColor: '#FFFFFF',  // Theme: '#FFFFFF'
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
    borderWidth: 1,
    borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',  // Theme: '#111827'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',  // Theme: '#F9FAFB'
    borderWidth: 1,
    borderColor: '#E5E7EB',  // Theme: '#E5E7EB'
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',  // Theme: '#111827'
  },
  showPasswordButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  showPasswordText: {
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4F46E5',  // Theme: '#4F46E5'
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    color: '#6B7280',  // Theme: '#6B7280'
    fontSize: 14,
  },
  registerLink: {
    color: '#4F46E5',  // Theme: '#4F46E5'
    fontSize: 14,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#6B7280',  // Theme: '#6B7280'
    fontSize: 12,
    marginTop: 32,
  },
});

export default LoginScreen;
