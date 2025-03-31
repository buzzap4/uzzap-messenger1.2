import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated, Image } from 'react-native';
import { Link, router } from 'expo-router'; // Add 'router' to the import
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/theme';

const useDynamicStyles = (colors: any) =>
  StyleSheet.create({
    input: {
      width: '100%',
      padding: 16,
      borderRadius: 12,
      marginVertical: 8,
      fontSize: 16,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
      elevation: 2,
    },
    inputIcon: {
      marginRight: 8,
      color: colors.text, // Adjust icon color dynamically
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f9f9f9',
    },
    logoContainer: {
      flexDirection: 'row',
      marginBottom: 40,
    },
    logoLetter: {
      fontSize: 48, // Increased font size
      fontWeight: '900', // Bolder font weight
      fontFamily: 'Inter-Bold', // Changed to a more appropriate font
      color: 'green',
      marginHorizontal: 4, // Slightly increased spacing
    },
    button: {
      width: '100%',
      padding: 16,
      backgroundColor: '#28A745',
      borderRadius: 12,
      alignItems: 'center',
      marginVertical: 16,
      boxShadow: '0px 4px 8px rgba(40,167,69,0.2)',
      elevation: 4,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    link: {
      marginTop: 20,
    },
    linkText: {
      color: '#28A745', // Match button color
      fontSize: 14,
    },
    error: {
      color: '#ff3b30',
      marginBottom: 16,
      textAlign: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    logoImage: {
      width: 450, // Further increased width
      height: 180, // Further increased height
    },
  });

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const animatedValues = useRef([...Array(5)].map(() => new Animated.Value(0))).current; // 5 letters in "Uzzap"
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const { colors } = useTheme();
  const styles = useDynamicStyles(colors);

  useEffect(() => {
    Animated.stagger(100, animatedValues.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    )).start();

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animatedValues]);

  const renderLogo = () => (
    <View style={styles.logoContainer}>
      <Image
        source={require('../../assets/uzzap-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    return null;
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);

      // Enhanced validation
      if (!email || !password || !username || !confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username already taken');
      }

      // Sign up with Supabase
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Signup failed - no user returned');

      // Inform the user to verify their email
      Alert.alert(
        'Verify Your Email',
        'A verification email has been sent to your email address. Please verify your email before logging in.'
      );

      // Optionally, navigate to the sign-in page
      router.replace('/sign-in');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
        setError(error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: colors.background,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      {renderLogo()}
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
      <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.inputBackground, color: colors.text },
        ]}
        placeholder="Username"
        placeholderTextColor={colors.gray}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
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
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.inputBackground, color: colors.text },
        ]}
        placeholder="Password"
        placeholderTextColor={colors.gray}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.inputBackground, color: colors.text },
        ]}
        placeholder="Confirm Password"
        placeholderTextColor={colors.gray}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>
      <Link href="/sign-in" style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </Link>
    </Animated.View>
  );
}

export const screenOptions = {
  headerShown: false, // Ensure the header is hidden
};