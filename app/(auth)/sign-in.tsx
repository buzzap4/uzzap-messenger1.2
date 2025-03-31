import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Animated, Image, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Mail, Lock } from 'lucide-react-native';
import { useToast } from '@/context/toast';
import { useTheme } from '@/context/theme';

const useDynamicStyles = (colors: any) =>
  StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border, // Adjust border color dynamically
      marginBottom: 16,
      padding: Platform.OS === 'ios' ? 12 : 4,
    },
    inputIcon: {
      marginRight: 8,
      marginLeft: 8,
      color: colors.text, // Adjust icon color dynamically
    },
    input: {
      flex: 1,
      fontSize: 16,
      borderRadius: 8,
      padding: Platform.OS === 'ios' ? 12 : 8,
      color: colors.text, // Adjust text color dynamically
      transform: [{ scale: 1 }],
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    logoContainer: {
      flexDirection: 'row',
      marginBottom: 40,
    },
    logoImage: {
      width: 450, // Further increased width
      height: 180, // Further increased height
    },
    formContainer: {
      padding: 24,
      borderRadius: 16,
      backgroundColor: colors.surface,
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      elevation: 8,
      width: '100%',
      maxWidth: 400,
      transform: [{ scale: 1 }],
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 24,
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#28A745', // Match button color
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
      transform: [{ scale: 1 }],
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center', // Center align the text
      alignItems: 'center', // Vertically align the text
      marginTop: 24,
    },
    footerText: {
      color: '#666',
      textAlign: 'center', // Ensure text is centered
    },
    link: {
      marginTop: 0, // Remove extra margin
    },
    linkText: {
      color: '#28A745', // Match button color
      fontWeight: '600',
      textAlign: 'center', // Ensure text is centered
    },
    error: {
      color: '#ff3b30',
      marginBottom: 16,
      textAlign: 'center',
    },
    progressBarContainer: {
      height: 60, // Increased height for progress bar and label
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20,
    },
    stepLabel: {
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins-Bold', // Updated font family
      color: '#28A745', // Match button color
      marginBottom: 10,
    },
    progressBarBackground: {
      width: '80%',
      height: 8,
      backgroundColor: '#ddd',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#28A745', // Match button color
      borderRadius: 4,
      boxShadow: '0px 0px 8px rgba(40, 167, 69, 0.3)',
    },
    forgotPasswordButton: {
      alignSelf: 'flex-end',
      marginBottom: 20,
    },
    forgotPasswordText: {
      color: '#007AFF',
      fontSize: 14,
    },
  });

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const animatedValues = useRef([...Array(5)].map(() => new Animated.Value(0))).current; // 5 letters in "Uzzap"
  const { showToast } = useToast();
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation value for fading
  const [currentStep, setCurrentStep] = useState(0); // Track the current step
  const progressAnim = useRef(new Animated.Value(0)).current; // Animation value for progress bar
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const styles = useDynamicStyles(colors);

  const steps = ['Connecting', 'Authenticating', 'Initializing'];

  useEffect(() => {
    Animated.stagger(100, animatedValues.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    )).start();
  }, [animatedValues, fadeAnim, progressAnim, steps.length]); // Added missing dependencies

  useEffect(() => {
    const animateSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        Animated.timing(progressAnim, {
          toValue: (i + 1) / steps.length,
          duration: 1000,
          useNativeDriver: false,
        }).start();

        await new Promise(resolve => setTimeout(resolve, 1000));
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };

    animateSteps();
  }, [fadeAnim, progressAnim, steps.length]); // Added missing dependencies

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 40,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const renderLogo = () => (
    <View style={styles.logoContainer}>
      <Image
        source={require('../../assets/uzzap-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressBarContainer}>
      <Animated.Text
        style={[
          styles.stepLabel,
          { opacity: fadeAnim }, // Bind opacity to animation
        ]}
      >
        {steps[currentStep]}
      </Animated.Text>
      <View style={styles.progressBarBackground}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start login process in parallel with animations
      const loginPromise = (async () => {
        // Simulate "Connecting"
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate "Authenticating"
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Simulate "Initializing"
        await new Promise(resolve => setTimeout(resolve, 1500));
      })();

      // Wait for login to complete
      await loginPromise;

      // Navigate to the next page after login completes
      router.replace('/');
      showToast('Successfully signed in', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      showToast(message, 'error');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        throw new Error('Please enter your email address');
      }

      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myapp://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'Password Reset',
        'If an account exists for this email, you will receive password reset instructions.'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      showToast(message, 'error');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: colors.background },
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      {renderLogo()}
      {renderProgressBar()}
      <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.gray }]}>Sign in to continue chatting</Text>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <Mail size={20} color={colors.text} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBackground, color: colors.text },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.gray}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <Lock size={20} color={colors.text} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBackground, color: colors.text },
            ]}
            placeholder="Password"
            placeholderTextColor={colors.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {loading ? (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <ActivityIndicator color="#fff" />
            </Animated.View>
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/sign-up" style={styles.link}>
            <Text style={styles.linkText}>Sign Up</Text>
          </Link>
        </View>
      </View>
    </Animated.View>
  );
}

export const screenOptions = {
  headerShown: false, // Ensure the header is hidden
};