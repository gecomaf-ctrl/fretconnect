import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { useFonts } from 'expo-font';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setBaseUrl } from '@workspace/api-client-react';

SplashScreen.preventAutoHideAsync();

// The API base URL is only needed once the backend is wired up. Guard against
// building an invalid URL like "https://undefined" when the env var is unset.
const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
if (apiDomain) setBaseUrl(`https://${apiDomain}`);

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Retour' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="wallet" options={{ title: 'Mon Wallet' }} />
      <Stack.Screen name="become-carrier" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="shipper/publish" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="shipper/freight/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="shipper/tracking/[id]" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="carrier/mission/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="carrier/vehicle" options={{ headerShown: false }} />
      <Stack.Screen name="carrier/revenue" options={{ headerShown: false }} />
      <Stack.Screen name="carrier/tracking/[id]" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // expo-font uses FontFaceObserver on web. The Replit preview can keep a
    // local TTF in "loading" state and leave the whole router blank after its
    // 6-second timeout. Native still loads the bundled Inter files normally;
    // web uses the browser fallback for the same styles.
    ...(Platform.OS === 'web'
      ? {}
      : {
          Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
          Inter_500Medium:  require('../assets/fonts/Inter_500Medium.ttf'),
          Inter_600SemiBold: require('../assets/fonts/Inter_600SemiBold.ttf'),
          Inter_700Bold:    require('../assets/fonts/Inter_700Bold.ttf'),
        }),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <RootLayoutNav />
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
