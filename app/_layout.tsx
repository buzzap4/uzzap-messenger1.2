import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/theme';
import { AuthProvider } from '@/context/auth';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import Header from '@/components/Header';

SplashScreen.preventAutoHideAsync();

function StackNavigator() {
  const { colors } = useTheme();
  return (
    <Stack 
      screenOptions={{ 
        headerShown: true,
        header: () => <Header />,
        contentStyle: {
          backgroundColor: colors.background
        }
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      <Stack.Screen name="(auth)" options={{ headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <StackNavigator />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </AuthProvider>
    </ThemeProvider>
  );
}