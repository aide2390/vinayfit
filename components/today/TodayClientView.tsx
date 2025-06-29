import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Footprints, 
  Target, 
  UtensilsCrossed,
  TrendingUp,
  Calendar,
  X,
  Play,
  Dumbbell,
  Clock,
  Flame
} from 'lucide-react-native';
import { useColorScheme, getColors } from '../../hooks/useColorScheme';
import { router } from 'expo-router';
import { WorkoutPlan, WorkoutTemplate } from '@/types/workout';
import { getClientPlans, getTemplate } from '@/utils/storage';
import { getDayOfWeek, isToday } from '@/utils/workoutUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TodayClientView() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  const [showMissedWorkout, setShowMissedWorkout] = useState(true);
  const [steps, setSteps] = useState(2847);
  const [stepGoal] = useState(10000);
  const [userName] = useState('Vinay');
  const [todaysWorkout, setTodaysWorkout] = useState<WorkoutTemplate | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [activeGoal, setActiveGoal] = useState({
    title: 'Lose 10kg for Summer',
    emoji: '🏖️',
    daysLeft: 48,
    progress: 65
  });

  useEffect(() => {
    loadTodaysWorkout();
  }, []);

  const loadTodaysWorkout = async () => {
    try {
      // Get current client's plans
      const clientId = 'client-1'; // TODO: Get from user context
      const plans = await getClientPlans(clientId);
      
      // Find active plan for today
      const today = new Date().toISOString().split('T')[0];
      const activePlan = plans.find(plan => 
        plan.startDate <= today && plan.endDate >= today
      );

      if (activePlan) {
        setCurrentPlan(activePlan);
        const dayOfWeek = getDayOfWeek(new Date());
        const templateId = activePlan.schedule[dayOfWeek];
        
        if (templateId) {
          const template = await getTemplate(templateId);
          setTodaysWorkout(template);
        }
      }
    } catch (error) {
      console.error('Error loading today\'s workout:', error);
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stepProgress = (steps / stepGoal) * 100;

  const handleFabPress = () => {
    router.push('/activities');
  };

  const handleStartWorkout = () => {
    if (todaysWorkout) {
      router.push(`/start-workout/${todaysWorkout.id}`);
    }
  };

  const handleGoalPress = () => {
    router.push('/fitness-goals');
  };

  const renderTodaysWorkout = () => {
    if (!todaysWorkout) {
      return (
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#1E40AF', '#3730A3'] : ['#667EEA', '#764BA2']}
          style={styles.restDayCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.restDayContent}>
            <Text style={styles.restDayLabel}>REST DAY</Text>
            <Text style={styles.restDayMessage}>
              Hoo-ray it's your rest-day 🌴
            </Text>
          </View>
        </LinearGradient>
      );
    }

    return (
      <LinearGradient
        colors={colorScheme === 'dark' ? ['#BE185D', '#BE123C'] : ['#F093FB', '#F5576C']}
        style={styles.workoutCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.workoutContent}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutLabel}>TODAY'S WORKOUT</Text>
            <Text style={styles.workoutName}>{todaysWorkout.name}</Text>
            <Text style={styles.workoutDetails}>
              {todaysWorkout.exercises.length} exercises • {todaysWorkout.duration} min
            </Text>
          </View>
          <TouchableOpacity style={styles.playButton} onPress={handleStartWorkout}>
            <Play size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: insets.top + 10,
            paddingBottom: 120, // Space for tab bar and FAB
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <Text style={styles.greetingText}>
            {getGreeting()}, {userName}! 👋
          </Text>
        </View>

        {/* Today's Workout */}
        {renderTodaysWorkout()}

        {/* Fitness Goal Card */}
        <TouchableOpacity style={styles.goalCard} onPress={handleGoalPress}>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleContainer}>
              <Text style={styles.goalEmoji}>{activeGoal.emoji}</Text>
              <View>
                <Text style={styles.goalTitle}>{activeGoal.title}</Text>
                <Text style={styles.goalSubtitle}>
                  {activeGoal.daysLeft} days left • {activeGoal.progress}% complete
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.addGoalButton}
              onPress={() => router.push('/set-fitness-goal')}
            >
              <Plus size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.goalProgressContainer}>
            <View style={styles.goalProgressBar}>
              <View 
                style={[
                  styles.goalProgressFill, 
                  { width: `${activeGoal.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.goalProgressText}>{activeGoal.progress}%</Text>
          </View>

          <View style={styles.goalCountdown}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.goalCountdownText}>
              {activeGoal.daysLeft} days remaining
            </Text>
          </View>
        </TouchableOpacity>

        {/* Missed Workout Alert */}
        {showMissedWorkout && (
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <Text style={styles.alertText}>
                You missed <Text style={styles.alertHighlight}>1 workout</Text> from Saturday
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowMissedWorkout(false)}
              style={styles.alertClose}
            >
              <X size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Steps Tracker */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Steps tracker</Text>
            <Footprints size={24} color={colors.primary} />
          </View>
          
          <View style={styles.stepsContent}>
            <View style={styles.stepsInfo}>
              <Text style={styles.stepsNumber}>
                {steps.toLocaleString()}
              </Text>
              <Text style={styles.stepsGoal}>/ {stepGoal.toLocaleString()} steps</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(stepProgress, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(stepProgress)}%</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <Dumbbell size={24} color={colors.success} />
          </View>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/templates')}
            >
              <Text style={styles.actionButtonText}>View Templates</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/workout-history')}
            >
              <Text style={styles.actionButtonText}>Workout History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Macros */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Macros</Text>
            <Target size={24} color={colors.success} />
          </View>
          
          <Text style={styles.cardSubtitle}>
            Start by setting your daily goal
          </Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Set daily goal</Text>
          </TouchableOpacity>
        </View>

        {/* Food Journal */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Food Journal</Text>
            <UtensilsCrossed size={24} color={colors.warning} />
          </View>
          
          <Text style={styles.cardSubtitle}>
            What did you eat today?
          </Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Add meal</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Progress</Text>
            <TrendingUp size={24} color={colors.error} />
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Water (L)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[
          styles.fab,
          { bottom: 100 + (insets.bottom > 0 ? insets.bottom : 0) }
        ]} 
        onPress={handleFabPress}
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  greetingText: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: colors.text,
    marginTop: 4,
  },
  restDayCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
  },
  restDayContent: {
    alignItems: 'flex-start',
  },
  restDayLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  restDayMessage: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  workoutCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
  },
  workoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  workoutName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutDetails: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  playButton: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  goalEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  goalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  goalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  addGoalButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    marginRight: 12,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  goalProgressText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: colors.success,
    minWidth: 40,
  },
  goalCountdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalCountdownText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  alertContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  alertText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  alertHighlight: {
    fontFamily: 'Inter-SemiBold',
    color: colors.error,
  },
  alertClose: {
    padding: 4,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: colors.text,
  },
  cardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  stepsContent: {
    alignItems: 'flex-start',
  },
  stepsInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  stepsNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: colors.text,
  },
  stepsGoal: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: colors.primary,
    minWidth: 35,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: colors.text,
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
});