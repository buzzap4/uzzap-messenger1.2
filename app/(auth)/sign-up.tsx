import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator, Animated } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User } from 'lucide-react-native';
import { createProfile } from '@/src/services/profileService';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const animatedValues = useRef([...Array(5)].map(() => new Animated.Value(0))).current; // 5 letters in "Uzzap"

  useEffect(() => {
    Animated.stagger(100, animatedValues.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    )).start();
  }, []);

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

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (!email || !password || !username) {
        throw new Error('Please fill in all fields');
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

      const { error: updateError } = await supabase.auth.updateUser({
        data: { username: username },
      });
      if (updateError) throw updateError;

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Signup failed - no user returned');

      // Create profile using the createProfile function
      const { error: profileError } = await createProfile({
        id: user.id,
        username,
        display_name: username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If profile creation fails, clean up the auth user
        await supabase.auth.signOut();
        throw new Error('Failed to create profile');
      }

      // Success - navigate to home
      router.replace('/');
    } catch (error) {
<<<<<<< HEAD

=======
      console.error('Sign up error:', error);
>>>>>>> 12b7d51 (update)
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
    <View style={styles.container}>
      {renderLogo()}
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>
      <Link href="/sign-in" style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
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
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#28A745', // Changed to green
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
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
    color: '#007BFF',
    fontSize: 14,
  },
  error: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
});