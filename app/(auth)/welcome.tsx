import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Heart, Target, TrendingUp } from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors, width, height);

  const features = [
    {
      icon: Dumbbell,
      title: 'Track Workouts',
      description: 'Log your exercises and monitor progress',
      color: colors.primary,
    },
    {
      icon: Target,
      title: 'Set Goals',
      description: 'Create and achieve your fitness targets',
      color: colors.success,
    },
    {
      icon: Heart,
      title: 'Stay Motivated',
      description: 'Get reminders and celebrate achievements',
      color: colors.error,
    },
    {
      icon: TrendingUp,
      title: 'See Progress',
      description: 'Visualize your fitness journey over time',
      color: colors.warning,
    },
  ];

  const isLandscape = width > height;
  const isTablet = width >= 768;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colorScheme === 'dark' ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#E2E8F0']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.logo}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Dumbbell size={isTablet ? 40 : 32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>VinayFit</Text>
            <Text style={styles.tagline}>Your Personal Fitness Companion</Text>
          </View>

          {/* Features */}
          <View style={[
            styles.featuresContainer,
            isLandscape && styles.featuresContainerLandscape
          ]}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <View key={index} style={[
                  styles.featureCard,
                  isLandscape && styles.featureCardLandscape,
                  isTablet && styles.featureCardTablet
                ]}>
                  <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                    <IconComponent size={isTablet ? 28 : 24} color={feature.color} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={[
            styles.actionContainer,
            isLandscape && styles.actionContainerLandscape
          ]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Join thousands of users achieving their fitness goals
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, screenWidth: number, screenHeight: number) => {
  const isLandscape = screenWidth > screenHeight;
  const isTablet = screenWidth >= 768;
  const isSmallScreen = screenHeight < 700;
  
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: isTablet ? 40 : 20,
      paddingVertical: isSmallScreen ? 20 : 40,
    },
    header: {
      alignItems: 'center',
      paddingTop: isLandscape ? 20 : isSmallScreen ? 30 : 60,
      paddingBottom: isLandscape ? 20 : isSmallScreen ? 20 : 40,
      marginBottom: isLandscape ? 20 : 0,
    },
    logoContainer: {
      marginBottom: isSmallScreen ? 16 : 20,
    },
    logo: {
      width: isTablet ? 100 : isSmallScreen ? 70 : 80,
      height: isTablet ? 100 : isSmallScreen ? 70 : 80,
      borderRadius: isTablet ? 50 : isSmallScreen ? 35 : 40,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    appName: {
      fontFamily: 'Inter-Bold',
      fontSize: isTablet ? 40 : isSmallScreen ? 28 : 32,
      color: colors.text,
      marginBottom: isSmallScreen ? 6 : 8,
      textAlign: 'center',
    },
    tagline: {
      fontFamily: 'Inter-Regular',
      fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: isTablet ? 400 : 300,
    },
    featuresContainer: {
      flex: 1,
      paddingVertical: isSmallScreen ? 16 : 20,
      minHeight: isLandscape ? 'auto' : 300,
    },
    featuresContainerLandscape: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    featureCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: isTablet ? 20 : 16,
      padding: isTablet ? 24 : isSmallScreen ? 16 : 20,
      marginBottom: isSmallScreen ? 12 : 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    featureCardLandscape: {
      width: '48%',
      marginBottom: 12,
    },
    featureCardTablet: {
      padding: 28,
      borderRadius: 24,
    },
    featureIcon: {
      width: isTablet ? 64 : isSmallScreen ? 48 : 56,
      height: isTablet ? 64 : isSmallScreen ? 48 : 56,
      borderRadius: isTablet ? 32 : isSmallScreen ? 24 : 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isTablet ? 20 : 16,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: isTablet ? 20 : isSmallScreen ? 16 : 18,
      color: colors.text,
      marginBottom: isSmallScreen ? 2 : 4,
    },
    featureDescription: {
      fontFamily: 'Inter-Regular',
      fontSize: isTablet ? 16 : isSmallScreen ? 13 : 14,
      color: colors.textSecondary,
      lineHeight: isTablet ? 22 : 20,
    },
    actionContainer: {
      paddingVertical: isSmallScreen ? 20 : 30,
      marginTop: isLandscape ? 20 : 'auto',
    },
    actionContainerLandscape: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      borderRadius: isTablet ? 20 : 16,
      marginBottom: isLandscape ? 0 : 16,
      shadowColor: '#667EEA',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      flex: isLandscape ? 1 : undefined,
      maxWidth: isLandscape ? 200 : undefined,
    },
    buttonGradient: {
      paddingVertical: isTablet ? 20 : isSmallScreen ? 16 : 18,
      paddingHorizontal: isTablet ? 40 : 32,
      borderRadius: isTablet ? 20 : 16,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontFamily: 'Inter-Bold',
      fontSize: isTablet ? 20 : isSmallScreen ? 16 : 18,
      color: '#FFFFFF',
    },
    secondaryButton: {
      paddingVertical: isTablet ? 18 : 16,
      alignItems: 'center',
      flex: isLandscape ? 1 : undefined,
    },
    secondaryButtonText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
      color: colors.primary,
      textAlign: 'center',
    },
    footer: {
      alignItems: 'center',
      paddingBottom: isSmallScreen ? 16 : 20,
      marginTop: isLandscape ? 20 : 0,
    },
    footerText: {
      fontFamily: 'Inter-Regular',
      fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
      color: colors.textTertiary,
      textAlign: 'center',
      maxWidth: isTablet ? 400 : 280,
      lineHeight: isTablet ? 22 : 20,
    },
  });
};