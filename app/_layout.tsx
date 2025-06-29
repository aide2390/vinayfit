import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
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
import { useColorScheme, getColors } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded || fontError) {
          // Hide the default splash screen
          await SplashScreen.hideAsync();
          
          // Initialize app data
          await initializeDefaultData();
          
          // Initialize notifications only on mobile platforms
          if (Platform.OS !== 'web') {
            await initializeNotifications();
          }
          
          // Mark as ready
          setIsReady(true);
          
          // Show custom splash for a minimum duration
          setTimeout(() => {
            setShowCustomSplash(false);
          }, 3000); // Show for 3 seconds minimum
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
        setIsReady(true);
        setShowCustomSplash(false);
      }
    }

    prepare();
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
          // Note: Navigation will be handled by the auth flow
          console.log('Notification received for goal:', data.goalId);
        }
      });

      return () => subscription.remove();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  // Show loading state while fonts are loading or app is not ready
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!isReady) {
    return null;
  }

  return (
    <AuthProvider>
      <UserProvider>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Stack screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}>
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
                <Stack.Screen name="activities" />
                <Stack.Screen name="create-activity" />
                <Stack.Screen name="activity-history" />
                <Stack.Screen name="log-activity/[activity]" />
                <Stack.Screen name="+not-found" />
              </>
            )}
          </Stack>
          <StatusBar 
            style={colorScheme === 'dark' ? 'light' : 'dark'} 
            backgroundColor={colors.background}
            translucent={false}
          />
        </View>
      </UserProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});