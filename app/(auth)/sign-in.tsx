import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator, Animated } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Mail, Lock } from 'lucide-react-native';
import { useToast } from '@/context/toast';
import { useTheme } from '@/context/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animatedValues = useRef([...Array(5)].map(() => new Animated.Value(0))).current; // 5 letters in "Uzzap"
  const { showToast } = useToast();
  const { colors } = useTheme();

  useEffect(() => {
    Animated.stagger(100, animatedValues.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    )).start();
  }, [animatedValues]);

  const renderLogo = () => {
    const letters = ['U', 'z', 'z', 'a', 'p'];
    return (
      <View style={styles.logoContainer}>
        {letters.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.logoLetter,
              {
                transform: [
                  {
                    translateY: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0], // Drop from -50 to 0
                    }),
                  },
                ],
                opacity: animatedValues[index],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    );
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderLogo()}
      <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.gray }]}>Sign in to continue chatting</Text>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <View style={styles.inputContainer}>
          <Mail size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/sign-up" style={styles.link}>
            Sign Up
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  logoLetter: {
    fontSize: 48, // Increased font size
    fontWeight: '900', // Bolder font weight
    fontFamily: 'Inter-Bold', // Changed to a more appropriate font
    color: 'green',
    marginHorizontal: 4, // Slightly increased spacing
  },
  formContainer: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    padding: Platform.OS === 'ios' ? 12 : 4,
  },
  inputIcon: {
    marginRight: 8,
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#28A745', // Changed to green
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#007BFF',
    fontWeight: '600',
  },
  error: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
});