import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/theme';
import { AuthProvider } from '@/context/auth';
import { ToastProvider } from '@/context/toast';
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
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: true }} 
      />
      <Stack.Screen 
        name="(auth)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="chatroom/[id]" 
        options={{ 
          headerShown: true,
          presentation: 'card'  // Changed from 'push' to 'card'
        }} 
      />
      <Stack.Screen 
        name="direct-message/[id]" 
        options={{ 
          headerShown: true,
          presentation: 'card'  // Changed from 'push' to 'card'
        }} 
      />
      <Stack.Screen 
        name="new-message" 
        options={{ 
          headerShown: true,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="privacy-settings" 
        options={{ headerShown: true }} 
      />
      <Stack.Screen 
        name="blocked-users" 
        options={{ headerShown: true }} 
      />
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
        <ToastProvider>
          <StackNavigator />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}