import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';

export default function LoginRedirect() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to main app
        router.replace('/(tabs)');
      } else {
        // User is not authenticated, redirect to welcome screen
        router.replace('/(auth)/welcome');
      }
    }
  }, [user, loading]);

  // Show loading screen while checking auth state
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});