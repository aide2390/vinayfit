import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Heart, Target, TrendingUp, Star, Users, Award, Zap } from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors, width, height);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const features = [
    {
      icon: Dumbbell,
      title: 'Smart Workouts',
      description: 'AI-powered workout plans tailored to your goals and fitness level',
      color: colors.primary,
      gradient: ['#667EEA', '#764BA2'],
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set ambitious goals and track your progress with detailed analytics',
      color: colors.success,
      gradient: ['#10B981', '#059669'],
    },
    {
      icon: Heart,
      title: 'Health Insights',
      description: 'Monitor your health metrics and get personalized recommendations',
      color: colors.error,
      gradient: ['#EF4444', '#DC2626'],
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description: 'Visualize your fitness journey with beautiful charts and insights',
      color: colors.warning,
      gradient: ['#F59E0B', '#D97706'],
    },
  ];

  const stats = [
    { icon: Users, value: '50K+', label: 'Active Users' },
    { icon: Award, value: '1M+', label: 'Goals Achieved' },
    { icon: Star, value: '4.9', label: 'App Rating' },
    { icon: Zap, value: '24/7', label: 'Support' },
  ];

  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const isLandscape = width > height;
  const isTablet = width >= 768;

  const logoRotationInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const renderFeatureCard = (feature: any, index: number) => {
    const IconComponent = feature.icon;
    const animationDelay = index * 200;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.featureCard,
          isLandscape && styles.featureCardLandscape,
          isTablet && styles.featureCardTablet,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 50 + animationDelay / 10],
                }),
              },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={feature.gradient}
          style={styles.featureCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.featureIconContainer}>
            <IconComponent size={isTablet ? 32 : 28} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
          
          {/* Decorative elements */}
          <View style={styles.featureDecoration}>
            <View style={styles.decorationDot} />
            <View style={[styles.decorationDot, styles.decorationDotDelayed]} />
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderStatCard = (stat: any, index: number) => {
    const IconComponent = stat.icon;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.statCard,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: floatingTranslateY },
            ],
          },
        ]}
      >
        <View style={[styles.statIcon, { backgroundColor: `${colors.primary}15` }]}>
          <IconComponent size={20} color={colors.primary} />
        </View>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Background with animated gradient */}
      <LinearGradient
        colors={colorScheme === 'dark' 
          ? ['#0F172A', '#1E293B', '#334155'] 
          : ['#F8FAFC', '#E2E8F0', '#CBD5E1']
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated background pattern */}
        <View style={styles.backgroundPattern}>
          {Array.from({ length: 15 }).map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.patternElement,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.1],
                  }),
                  transform: [
                    {
                      rotate: logoRotationInterpolate,
                    },
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.05],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                  left: `${(index % 5) * 20 + Math.random() * 10}%`,
                  top: `${Math.floor(index / 5) * 25 + Math.random() * 10}%`,
                },
              ]}
            />
          ))}
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Logo with glow effect */}
            <View style={styles.logoContainer}>
              <Animated.View
                style={[
                  styles.logoGlow,
                  {
                    transform: [{ rotate: logoRotationInterpolate }, { scale: pulseAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.logo,
                  {
                    transform: [{ rotate: logoRotationInterpolate }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2', '#F093FB']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Dumbbell size={isTablet ? 48 : 40} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </Animated.View>
            </View>

            <Text style={styles.appName}>VinayFit</Text>
            <Text style={styles.tagline}>Transform Your Body, Elevate Your Life</Text>
            <Text style={styles.subtitle}>
              Join thousands of fitness enthusiasts on their journey to a healthier, stronger you
            </Text>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View
            style={[
              styles.statsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.statsTitle}>Trusted by Fitness Enthusiasts Worldwide</Text>
            <View style={[
              styles.statsContainer,
              isLandscape && styles.statsContainerLandscape
            ]}>
              {stats.map(renderStatCard)}
            </View>
          </Animated.View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Animated.Text
              style={[
                styles.sectionTitle,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              Everything You Need to Succeed
            </Animated.Text>
            
            <View style={[
              styles.featuresContainer,
              isLandscape && styles.featuresContainerLandscape
            ]}>
              {features.map(renderFeatureCard)}
            </View>
          </View>

          {/* CTA Section */}
          <Animated.View
            style={[
              styles.ctaSection,
              isLandscape && styles.ctaSectionLandscape,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaTitle}>Ready to Start Your Journey?</Text>
              <Text style={styles.ctaSubtitle}>
                Join VinayFit today and unlock your full potential
              </Text>
              
              <View style={[
                styles.actionContainer,
                isLandscape && styles.actionContainerLandscape
              ]}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push('/(auth)/sign-up')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    style={styles.primaryButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.primaryButtonText}>Get Started Free</Text>
                    <View style={styles.buttonIcon}>
                      <Zap size={18} color="#667EEA" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push('/(auth)/sign-in')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
              },
            ]}
          >
            <Text style={styles.footerText}>
              🔒 Your data is secure • 🌟 No ads, ever • 💪 Cancel anytime
            </Text>
            <View style={styles.footerDots}>
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.footerDot,
                    {
                      opacity: pulseAnim.interpolate({
                        inputRange: [1, 1.05],
                        outputRange: [0.5, 1],
                      }),
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
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
    backgroundPattern: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 0,
    },
    patternElement: {
      position: 'absolute',
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    scrollView: {
      flex: 1,
      zIndex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: isTablet ? 40 : 20,
      paddingVertical: isSmallScreen ? 20 : 40,
    },
    heroSection: {
      alignItems: 'center',
      paddingTop: isLandscape ? 20 : isSmallScreen ? 30 : 60,
      paddingBottom: isLandscape ? 30 : isSmallScreen ? 30 : 50,
    },
    logoContainer: {
      position: 'relative',
      marginBottom: isSmallScreen ? 20 : 30,
    },
    logoGlow: {
      position: 'absolute',
      width: isTablet ? 140 : isSmallScreen ? 100 : 120,
      height: isTablet ? 140 : isSmallScreen ? 100 : 120,
      borderRadius: isTablet ? 70 : isSmallScreen ? 50 : 60,
      backgroundColor: '#667EEA',
      opacity: 0.3,
      top: -10,
      left: -10,
      zIndex: 0,
    },
    logo: {
      zIndex: 1,
    },
    logoGradient: {
      width: isTablet ? 120 : isSmallScreen ? 80 : 100,
      height: isTablet ? 120 : isSmallScreen ? 80 : 100,
      borderRadius: isTablet ? 60 : isSmallScreen ? 40 : 50,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#667EEA',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 16,
    },
    appName: {
      fontFamily: 'Inter-Bold',
      fontSize: isTablet ? 48 : isSmallScreen ? 32 : 40,
      color: colors.text,
      marginBottom: isSmallScreen ? 8 : 12,
      textAlign: 'center',
      letterSpacing: -1,
    },
    tagline: {
      fontFamily: 'Inter-SemiBold',
      fontSize: isTablet ? 24 : isSmallScreen ? 18 : 20,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: isSmallScreen ? 8 : 12,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: isTablet ? 26 : 22,
      maxWidth: isTablet ? 500 : 320,
    },
    statsSection: {
      marginBottom: isLandscape ? 30 : 40,
    },
    statsTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: isTablet ? 20 : 16,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    statsContainerLandscape: {
      justifyContent: 'center',
      gap: 40,
    },
    statCard: {
      alignItems: 'center',
      padding: 12,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    statValue: {
      fontFamily: 'Inter-Bold',
      fontSize: isTablet ? 20 : 18,
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: isTablet ? 14 : 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    featuresSection: {
      marginBottom: isLandscape ? 30 : 40,
    },
    sectionTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: isTablet ? 28 : isSmallScreen ? 20 : 24,
      color: colors.text,
      textAlign: 'center',
      marginBottom: isSmallScreen ? 20 : 30,
      letterSpacing: -0.5,
    },
    featuresContainer: {
      gap: isSmallScreen ? 16 : 20,
    },
    featuresContainerLandscape: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    featureCard: {
      borderRadius: isTablet ? 24 : 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    featureCardLandscape: {
      width: '48%',
    },
    featureCardTablet: {
      borderRadius: 28,
    },
    featureCardGradient: {
      padding: isTablet ? 28 : isSmallScreen ? 20 : 24,
      position: 'relative',
      overflow: 'hidden',
    },
    featureIconContainer: {
      width: isTablet ? 72 : isSmallScreen ? 56 : 64,
      height: isTablet ? 72 : isSmallScreen ? 56 : 64,
      borderRadius: isTablet ? 36 : isSmallScreen ? 28 : 32,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isSmallScreen ? 16 : 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: isTablet ? 22 : isSmallScreen ? 18 : 20,
      color: '#FFFFFF',
      marginBottom: isSmallScreen ? 6 : 8,
      letterSpacing: -0.3,
    },
    featureDescription: {
      fontFamily: 'Inter-Regular',
      fontSize: isTablet ? 16 : isSmallScreen ? 14 : 15,
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: isTablet ? 24 : 22,
    },
    featureDecoration: {
      position: 'absolute',
      top: 20,
      right: 20,
    },
    decorationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      marginBottom: 4,
    },
    decorationDotDelayed: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    ctaSection: {
      marginBottom: 40,
      borderRadius: isTablet ? 28 : 24,
      overflow: 'hidden',
      shadowColor: '#667EEA',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
    },
    ctaSectionLandscape: {
      marginHorizontal: isTablet ? 40 : 20,
    },
    ctaGradient: {
      padding: isTablet ? 40 : isSmallScreen ? 24 : 32,
      alignItems: 'center',
    },
    ctaTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: isTablet ? 28 : isSmallScreen ? 22 : 24,
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: isSmallScreen ? 8 : 12,
      letterSpacing: -0.5,
    },
    ctaSubtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      marginBottom: isSmallScreen ? 24 : 32,
      lineHeight: isTablet ? 26 : 22,
    },
    actionContainer: {
      width: '100%',
      gap: 16,
    },
    actionContainerLandscape: {
      flexDirection: 'row',
      justifyContent: 'center',
      maxWidth: 400,
    },
    primaryButton: {
      borderRadius: isTablet ? 20 : 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    primaryButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isTablet ? 20 : isSmallScreen ? 16 : 18,
      paddingHorizontal: isTablet ? 40 : 32,
      borderRadius: isTablet ? 20 : 16,
      gap: 8,
    },
    primaryButtonText: {
      fontFamily: 'Inter-Bold',
      fontSize: isTablet ? 20 : isSmallScreen ? 16 : 18,
      color: '#667EEA',
    },
    buttonIcon: {
      marginLeft: 4,
    },
    secondaryButton: {
      paddingVertical: isTablet ? 18 : 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: isTablet ? 20 : 16,
    },
    secondaryButtonText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
      color: '#FFFFFF',
    },
    footer: {
      alignItems: 'center',
      paddingBottom: isSmallScreen ? 20 : 30,
    },
    footerText: {
      fontFamily: 'Inter-Regular',
      fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
      color: colors.textTertiary,
      textAlign: 'center',
      lineHeight: isTablet ? 22 : 20,
      marginBottom: 20,
    },
    footerDots: {
      flexDirection: 'row',
      gap: 8,
    },
    footerDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
  });
};