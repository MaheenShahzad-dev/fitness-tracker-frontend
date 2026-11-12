export type UnitSystem = 'metric' | 'imperial';

export interface UserPreferences {
  units: UnitSystem;
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  workoutReminders: boolean;
  weeklyReport: boolean;
  soundAlerts: boolean;
}

export interface User {
  settings: any;
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  fitnessGoal: 'muscle_gain' | 'fat_loss' | 'endurance' | 'general_fitness';
  targetWeight: number; // in kg (or converted)
  targetCalories: number; // daily kcal
  targetWorkoutsPerWeek: number;
  streakDays: number;
  memberSince: string;
  preferences: UserPreferences;
    profilePic?: string;
}

export type WorkoutCategory = 'Strength' | 'Cardio' | 'HIIT' | 'Yoga' | 'Flexibility';

export interface Workout {
  id: string;
  userId: string;
  exerciseName: string;
  category: WorkoutCategory;
  sets: number;
  reps: number;
  weight: number; // in kg (converted on display if imperial)
  durationMinutes: number;
  notes: string;
  date: string; // ISO date YYYY-MM-DD
  caloriesBurned: number;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface NutritionItem {
  id: string;
  userId: string;
  foodItem: string;
  quantity: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  mealType: MealType;
  date: string; // YYYY-MM-DD
}

export interface BodyMeasurements {
  chest?: number; // cm
  waist?: number; // cm
  biceps?: number; // cm
  thighs?: number; // cm
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  measurements: BodyMeasurements;
  runTime5kMinutes?: number;
  runDistance: number;
  notes?: string;
}

export type NotificationType = 'workout' | 'goal' | 'nutrition' | 'system' | 'reminder';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  date: string;
}

export interface CommunityUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  goal: string;
  streak: number;
  workoutsCount: number;
  isFollowing?: boolean;
}
