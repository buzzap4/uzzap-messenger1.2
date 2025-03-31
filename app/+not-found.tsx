import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '@/context/theme';
import { Home, ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef } from 'react';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: '404 - Page Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View
          style={{
            transform: [{
              translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -20]
              })
            }]
          }}
        >
          <Text style={[styles.emoji]}>😕</Text>
        </Animated.View>
        
        <Text style={[styles.title, { color: colors.text }]}>Oops!</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          We couldn't find the page you're looking for.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => window.history.back()}
          >
            <ArrowLeft size={20} color="#fff" />
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          
          <Link href="/" asChild>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
              <Home size={20} color="#fff" />
              <Text style={styles.buttonText}>Home</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
