import React, { useState } from 'react';
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { authService, getErrorMessage } from '../../services';

import { useThemedStyles } from '../../hooks';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      Alert.alert('Fel', 'Vänligen ange ditt förnamn');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Fel', 'Vänligen ange ditt efternamn');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Fel', 'Vänligen ange en giltig e-postadress');
      return false;
    }
    if (!formData.username.trim() || formData.username.length < 3) {
      Alert.alert('Fel', 'Användarnamnet måste vara minst 3 tecken');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Fel', 'Lösenordet måste vara minst 6 tecken');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Fel', 'Lösenorden matchar inte');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        role: 'STUDENT',
      });

      Alert.alert('Konto skapat!', 'Du kan nu logga in med dina uppgifter.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Registrering misslyckades', getErrorMessage(error));
    } finally {
      setIsLoading(false);
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Tillbaka</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Skapa konto</Text>
          <Text style={styles.subtitle}>Fyll i dina uppgifter för att komma igång</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Förnamn</Text>
              <TextInput
                style={styles.input}
                placeholder="Anna"
                placeholderTextColor="#9CA3AF"
                value={formData.firstName}
                onChangeText={(v) => updateField('firstName', v)}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Efternamn</Text>
              <TextInput
                style={styles.input}
                placeholder="Andersson"
                placeholderTextColor="#9CA3AF"
                value={formData.lastName}
                onChangeText={(v) => updateField('lastName', v)}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-post</Text>
            <TextInput
              style={styles.input}
              placeholder="anna@example.com"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(v) => updateField('email', v)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Användarnamn</Text>
            <TextInput
              style={styles.input}
              placeholder="Välj ett användarnamn"
              placeholderTextColor="#9CA3AF"
              value={formData.username}
              onChangeText={(v) => updateField('username', v)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Lösenord</Text>
            <TextInput
              style={styles.input}
              placeholder="Minst 6 tecken"
              placeholderTextColor="#9CA3AF"
              value={formData.password}
              onChangeText={(v) => updateField('password', v)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bekräfta lösenord</Text>
            <TextInput
              style={styles.input}
              placeholder="Ange lösenordet igen"
              placeholderTextColor="#9CA3AF"
              value={formData.confirmPassword}
              onChangeText={(v) => updateField('confirmPassword', v)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Skapa konto</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Har du redan ett konto?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Logga in</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 48,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 24,
  },
  backButtonText: {
    color: '#4F46E5',  // Theme: '#4F46E5'
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
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
  registerButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
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
  loginLink: {
    color: '#4F46E5',  // Theme: '#4F46E5'
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
