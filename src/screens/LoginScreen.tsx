import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/utils/constants';

const { width, height } = Dimensions.get('window');

type LoginMode = 'login' | 'signup';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, signup, loading, error, clearError } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearError();

    if (!email.trim() || !password.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await login(email.trim(), password);
        if (result.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Login Failed', result.error || 'Invalid credentials');
        }
      } else {
        const result = await signup(email.trim(), password, selectedRole);
        if (result.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('🎉 Success', 'Account created successfully!');
          setMode('login');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Signup Failed', result.error || 'Could not create account');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    Haptics.selectionAsync();
    setMode(mode === 'login' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    clearError();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Logo Section */}
          <View style={styles.header}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoContainer}
            >
              <Feather name="book-open" size={40} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.title}>Blog App</Text>
            <Text style={styles.subtitle}>
              {mode === 'login' ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
              <Feather 
                name="mail" 
                size={20} 
                color={emailFocused ? COLORS.primary : COLORS.gray400} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray400}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isSubmitting}
              />
              {email.length > 0 && (
                <Pressable onPress={() => setEmail('')} style={styles.clearButton}>
                  <Feather name="x-circle" size={16} color={COLORS.gray400} />
                </Pressable>
              )}
            </View>

            {/* Password Input */}
            <View style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
              <Feather 
                name="lock" 
                size={20} 
                color={passwordFocused ? COLORS.primary : COLORS.gray400} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor={COLORS.gray400}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                editable={!isSubmitting}
              />
              <Pressable 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeButton}
              >
                <Feather 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={COLORS.gray400} 
                />
              </Pressable>
            </View>

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <View style={[styles.inputContainer, styles.confirmPasswordContainer]}>
                <Feather 
                  name="lock" 
                  size={20} 
                  color={COLORS.gray400} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={COLORS.gray400}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isSubmitting}
                />
                <Pressable 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.eyeButton}
                >
                  <Feather 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={COLORS.gray400} 
                  />
                </Pressable>
              </View>
            )}

            {/* Role Selection (Signup only) */}
            {mode === 'signup' && (
              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Account Type</Text>
                <View style={styles.roleButtons}>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedRole('user');
                    }}
                    style={[
                      styles.roleButton,
                      selectedRole === 'user' && styles.roleButtonActive,
                    ]}
                  >
                    <Feather 
                      name="user" 
                      size={16} 
                      color={selectedRole === 'user' ? COLORS.white : COLORS.gray600} 
                    />
                    <Text style={[
                      styles.roleButtonText,
                      selectedRole === 'user' && styles.roleButtonTextActive,
                    ]}>User</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedRole('admin');
                    }}
                    style={[
                      styles.roleButton,
                      selectedRole === 'admin' && styles.roleButtonActive,
                    ]}
                  >
                    <Feather 
                      name="shield" 
                      size={16} 
                      color={selectedRole === 'admin' ? COLORS.white : COLORS.gray600} 
                    />
                    <Text style={[
                      styles.roleButtonText,
                      selectedRole === 'admin' && styles.roleButtonTextActive,
                    ]}>Admin</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <Animated.View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.submitButton,
                { opacity: pressed || isSubmitting ? 0.8 : 1 },
              ]}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Feather 
                      name={mode === 'login' ? 'log-in' : 'user-plus'} 
                      size={20} 
                      color={COLORS.white} 
                      style={styles.submitIcon}
                    />
                    <Text style={styles.submitText}>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Switch Mode */}
            <Pressable
              onPress={switchMode}
              style={({ pressed }) => [
                styles.switchMode,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={styles.switchModeText}>
                {mode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </Text>
            </Pressable>

            
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.gray500,
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray500,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmPasswordContainer: {
    marginTop: -8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.gray900,
    fontFamily: Platform.OS === 'web' ? 'Inter_400Regular' : undefined,
  },
  eyeButton: {
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 8,
    fontWeight: '500',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  roleButtonText: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.error,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitIcon: {
    marginRight: 4,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  switchMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray400,
    marginBottom: 4,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  footerDot: {
    fontSize: 12,
    color: COLORS.gray400,
  },
});