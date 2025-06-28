import { useEffect, useState } from 'react';
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
import { AuthProvider } from '@/contexts/AuthContext';
import { initializeDefaultData } from '@/utils/storage';
import { requestNotificationPermissions, addNotificationResponseReceivedListener, cleanupExpiredNotifications } from '@/utils/notificationService';
import { router } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the default splash screen
      SplashScreen.hideAsync();
      
      // Initialize app data
      initializeDefaultData();
      
      // Initialize notifications
      initializeNotifications();
      
      // Show custom splash for a minimum duration
      setTimeout(() => {
        setShowCustomSplash(false);
      }, 3000); // Show for 3 seconds minimum
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

  // Show loading state while fonts are loading
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {showCustomSplash ? (
            <Stack.Screen name="splash" />
          ) : (
            <>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="templates" />
              <Stack.Screen name="create-template" />
              <Stack.Screen name="workout-plans" />
              <Stack.Screen name="create-plan" />
              <Stack.Screen name="set-fitness-goal" />
              <Stack.Screen name="goal-countdown" />
              <Stack.Screen name="fitness-goals" />
              <Stack.Screen name="step-tracker" />
              <Stack.Screen name="+not-found" />
            </>
          )}
        </Stack>
        <StatusBar style="auto" />
      </UserProvider>
    </AuthProvider>
  );
}