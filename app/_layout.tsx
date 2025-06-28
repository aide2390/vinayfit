import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { UserProvider } from '@/contexts/UserContext';
import { initializeDefaultData } from '@/utils/storage';
import { requestNotificationPermissions, addNotificationResponseReceivedListener, cleanupExpiredNotifications } from '@/utils/notificationService';
import { router } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      // Initialize default data when app starts
      initializeDefaultData();
      
      // Initialize notifications
      initializeNotifications();
    }
  }, [fontsLoaded, fontError]);

  const initializeNotifications = async () => {
    try {
      // Request notification permissions
      await requestNotificationPermissions();
      
      // Clean up expired notifications
      await cleanupExpiredNotifications();
      
      // Set up notification response listener
      const subscription = addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        
        if (data && data.goalId) {
          // Navigate to goal countdown screen when notification is tapped
          router.push(`/goal-countdown?goalId=${data.goalId}`);
        }
      });

      return () => subscription.remove();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="templates" />
        <Stack.Screen name="create-template" />
        <Stack.Screen name="workout-plans" />
        <Stack.Screen name="create-plan" />
        <Stack.Screen name="set-fitness-goal" />
        <Stack.Screen name="goal-countdown" />
        <Stack.Screen name="fitness-goals" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </UserProvider>
  );
}