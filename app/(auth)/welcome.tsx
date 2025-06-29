import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell } from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors, width, height);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: logoScale }
              ],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Dumbbell size={48} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
          </View>

          <Text style={styles.appName}>VinayFit</Text>
          <Text style={styles.tagline}>Transform Your Fitness Journey</Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.actionSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/sign-up')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.primaryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/sign-in')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
            },
          ]}
        >
          <Text style={styles.footerText}>
            Start your fitness transformation today
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, screenWidth: number, screenHeight: number) => {
  const isLandscape = screenWidth > screenHeight;
  const isTablet = screenWidth >= 768;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 60 : 40,
      paddingVertical: isLandscape ? 40 : 60,
    },
    logoSection: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    logoContainer: {
      marginBottom: 32,
    },
    logo: {
      width: isTablet ? 120 : 100,
      height: isTablet ? 120 : 100,
      borderRadius: isTablet ? 60 : 50,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#667EEA',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    },
    appName: {
      fontFamily: 'Inter-Bold',
      fontSize: isTablet ? 48 : 40,
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
      letterSpacing: -1,
    },
    tagline: {
      fontFamily: 'Inter-Regular',
      fontSize: isTablet ? 20 : 18,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
    },
    actionSection: {
      width: '100%',
      maxWidth: 320,
      gap: 16,
    },
    primaryButton: {
      borderRadius: 16,
      shadowColor: '#667EEA',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    primaryButtonGradient: {
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: '#FFFFFF',
    },
    secondaryButton: {
      paddingVertical: 18,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
    secondaryButtonText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 18,
      color: colors.text,
    },
    footer: {
      alignItems: 'center',
      paddingBottom: 20,
    },
    footerText: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: 'center',
    },
  });
};