
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getProfile,
} from '../services/profileService';
import {
  getNotifications,
  markNotificationRead as markNotificationReadApi,
  markAllNotificationsRead as markAllNotificationsReadApi,
  clearAllNotifications as clearAllNotificationsApi,
} from '../services/notificationService';
import {
  getProgress,
  createProgress,
  deleteProgress,
} from '../services/progressService';

import {
  User,
  Workout,
  NutritionItem,
  ProgressEntry,
  NotificationItem,
  CommunityUser,
  MealType,
} from '../types';

import {
  INITIAL_USER,
  INITIAL_WORKOUTS,
  INITIAL_NUTRITION,
  INITIAL_PROGRESS,
  INITIAL_NOTIFICATIONS,
  COMMUNITY_USERS,
} from '../data/mockData';

export type PageId =
  | 'landing'
  | 'register'
  | 'login'
  | 'dashboard'
  | 'profile'
  | 'workouts'
  | 'create-workout'
  | 'nutrition'
  | 'add-nutrition'
  | 'progress'
  | 'analytics'
  | 'search'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'support'
  | 'not-found';


// Connect each page to its browser URL
const pagePaths: Record<PageId, string> = {
  landing: '/',
  register: '/register',
  login: '/login',
  dashboard: '/dashboard',
  profile: '/profile',
  workouts: '/workouts',
  'create-workout': '/workouts/create',
  nutrition: '/nutrition',
  'add-nutrition': '/nutrition/add',
  progress: '/progress',
  analytics: '/analytics',
  search: '/search',
  reports: '/reports',
  notifications: '/notifications',
  settings: '/settings',
  support: '/support',
  'not-found': '/not-found',
};

const getPageFromPath = (pathname: string): PageId => {
  const matchingPage = (Object.keys(pagePaths) as PageId[]).find(
    (page) => pagePaths[page] === pathname
  );

  return matchingPage || 'not-found';
};

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface FitnessContextType {
  currentPage: PageId;
  previousPage: PageId | null;
  navigate: (page: PageId, params?: { editingWorkoutId?: string; preselectedMeal?: MealType }) => void;
  isAuthenticated: boolean;
  user: User;
  workouts: Workout[];
  nutrition: NutritionItem[];
  progress: ProgressEntry[];
  notifications: NotificationItem[];
  communityUsers: CommunityUser[];
  editingWorkoutId: string | null;
  preselectedMeal: MealType | null;
  waterGlassesToday: number;
  toast: ToastMessage | null;
  login: (email: string, pass: string) => boolean;
  demoLogin: () => void;
  register: (name: string, email: string, pass: string, avatarUrl?: string) => void;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
  addWorkout: (wo: Omit<Workout, 'id' | 'userId'>) => void;
  updateWorkout: (wo: Workout) => void;
  deleteWorkout: (id: string) => void;
  addNutrition: (item: Omit<NutritionItem, 'id' | 'userId'>) => void;
  deleteNutrition: (id: string) => void;
  addProgressEntry: (entry: Omit<ProgressEntry, 'id' | 'userId'>) => Promise<void>;
  deleteProgressEntry: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  toggleFollowUser: (id: string) => void;
  logWater: (delta: number) => void;
  resetToDefaultData: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  formatWeight: (kg: number) => string;
  formatDistance: (km: number) => string;
  formatLength: (cm: number) => string;
  refreshProfile: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const routerNavigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState<PageId>(() =>
    getPageFromPath(location.pathname)
  );
  const [previousPage, setPreviousPage] = useState<PageId | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [preselectedMeal, setPreselectedMeal] = useState<MealType | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('token') !== null;
  });


  // Keep the current page in sync with the browser URL.
  useEffect(() => {
    const page = getPageFromPath(location.pathname);

    const publicPages: PageId[] = [
      'landing',
      'register',
      'login',
      'not-found',
    ];

    // Prevent logged-out users from opening protected pages.
    if (!isAuthenticated && !publicPages.includes(page)) {
      routerNavigate('/login', { replace: true });
      return;
    }

    setCurrentPage(page);
  }, [location.pathname, isAuthenticated, routerNavigate]);

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('pulsefit_user');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        return {
          ...INITIAL_USER,
          ...parsed,
          preferences: parsed.preferences || INITIAL_USER.preferences,
        };
      } catch {
        return INITIAL_USER;
      }
    }

    return INITIAL_USER;
  });

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('pulsefit_workouts');
    return saved ? JSON.parse(saved) : INITIAL_WORKOUTS;
  });

  const [nutrition, setNutrition] = useState<NutritionItem[]>(() => {
    const saved = localStorage.getItem('pulsefit_nutrition');
    return saved ? JSON.parse(saved) : INITIAL_NUTRITION;
  });

  // Progress is kept in React state and fetched from MongoDB.
  const [progress, setProgress] = useState<ProgressEntry[]>([]);

  // Notifications are kept in React state, not localStorage.
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return localStorage.getItem('pulsefit_is_demo') === 'true'
      ? INITIAL_NOTIFICATIONS
      : [];
  });

  const [communityUsers, setCommunityUsers] = useState<CommunityUser[]>(() => {
    const saved = localStorage.getItem('pulsefit_community');
    return saved ? JSON.parse(saved) : COMMUNITY_USERS;
  });

  const [waterGlassesToday, setWaterGlassesToday] = useState<number>(() => {
    const saved = localStorage.getItem('pulsefit_water');
    return saved ? parseInt(saved, 10) : 6;
  });

  const refreshProfile = async () => {
    try {
      const response = await getProfile();
      const profile = response?.user;

      if (profile) {
        setUser((prev) => ({
          ...prev,
          ...profile,
          id: profile._id || profile.id || prev.id,
          profilePic: profile.profilePic || '',
          avatarUrl: profile.profilePic || prev.avatarUrl,
          memberSince: profile.createdAt || prev.memberSince,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const refreshNotifications = async () => {
    if (
      !localStorage.getItem('token') ||
      localStorage.getItem('pulsefit_is_demo') === 'true'
    ) {
      return;
    }

    try {
      const response = await getNotifications();

      const list =
        response?.notifications ||
        response?.data?.notifications ||
        (Array.isArray(response) ? response : []);

      const formatted = list.map((item: any) => ({
        id: item._id || item.id,
        userId: item.userId?._id || item.userId || '',
        title: item.title || '',
        message: item.message || '',
        type: (item.type || 'System').toLowerCase(),
        isRead: Boolean(item.isRead),
        date: item.createdAt || item.date || '',
      }));

      setNotifications(formatted);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  const refreshProgress = async () => {
    if (
      !localStorage.getItem('token') ||
      localStorage.getItem('pulsefit_is_demo') === 'true'
    ) {
      return;
    }

    try {
      const response = await getProgress();
      const list = response?.progress || [];

      const formattedProgress: ProgressEntry[] = list.map((item: any) => ({
        id: item._id || item.id,
        userId: item.userId?._id || item.userId || '',
        weight: item.weight,
        date: item.date ? String(item.date).split('T')[0] : '',
        measurements: {
          chest: item.measurements?.chest || 0,
          waist: item.measurements?.waist || 0,
          biceps: item.measurements?.biceps || 0,
          thighs: item.measurements?.thighs || 0,
        },
        runTime5kMinutes: item.performanceMetrics?.runTime || 0,
        runDistance: item.performanceMetrics?.runDistance || 0,
        notes: item.notes || '',
      }));

      setProgress(formattedProgress);
    } catch (error) {
      console.error('Failed to refresh progress:', error);
    }
  };

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Save context data
  useEffect(() => {
    localStorage.setItem('pulsefit_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('pulsefit_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pulsefit_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('pulsefit_nutrition', JSON.stringify(nutrition));
  }, [nutrition]);

  useEffect(() => {
    localStorage.setItem('pulsefit_community', JSON.stringify(communityUsers));
  }, [communityUsers]);

  // Fetch current profile, notifications and progress from MongoDB
  useEffect(() => {
    if (!isAuthenticated || !localStorage.getItem('token')) {
      setNotifications([]);
      setProgress([]);
      return;
    }

    if (localStorage.getItem('pulsefit_is_demo') === 'true') {
      setNotifications(INITIAL_NOTIFICATIONS);
      setProgress(INITIAL_PROGRESS);
      return;
    }

    let isActive = true;

    const fetchLiveData = async () => {
      setNotifications([]);
      setProgress([]);

      try {
        const profileResponse = await getProfile();

        if (!isActive) return;

        const profileData = profileResponse?.user;

        if (profileData) {
          const latestProfilePic = profileData.profilePic || '';

          setUser((previousUser) => ({
            ...previousUser,
            ...profileData,
            id: profileData._id || profileData.id || previousUser.id,
            name: profileData.name || previousUser.name,
            email: profileData.email || previousUser.email,
            profilePic: latestProfilePic,
            avatarUrl: latestProfilePic || previousUser.avatarUrl,
            preferences: previousUser.preferences || INITIAL_USER.preferences,
          }));
        }
      } catch (error) {
        console.error('Could not fetch live profile:', error);
      }

      try {
        const notificationResponse = await getNotifications();

        if (!isActive) return;

        const notificationList =
          notificationResponse?.notifications ||
          notificationResponse?.data?.notifications ||
          (Array.isArray(notificationResponse) ? notificationResponse : []);

        const formattedNotifications: NotificationItem[] = notificationList.map((item: any) => ({
          id: item._id || item.id,
          userId: item.userId?._id || item.userId || '',
          title: item.title || '',
          message: item.message || '',
          type: (item.type || 'system').toLowerCase(),
          isRead: Boolean(item.isRead),
          date: item.createdAt || item.date || '',
        }));

        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Could not fetch live notifications:', error);

        if (isActive) {
          setNotifications([]);
        }
      }

      try {
        const progressResponse = await getProgress();

        if (!isActive) return;

        const progressList = progressResponse?.progress || [];

        const formattedProgress: ProgressEntry[] = progressList.map((item: any) => ({
          id: item._id || item.id,
          userId: item.userId?._id || item.userId || '',
          weight: item.weight,
          date: item.date ? String(item.date).split('T')[0] : '',
          measurements: {
            chest: item.measurements?.chest || 0,
            waist: item.measurements?.waist || 0,
            biceps: item.measurements?.biceps || 0,
            thighs: item.measurements?.thighs || 0,
          },
          runTime5kMinutes: item.performanceMetrics?.runTime || 0,
          notes: item.notes || '',
        }));

        setProgress(formattedProgress);
      } catch (error) {
        console.error('Could not fetch live progress:', error);

        if (isActive) {
          setProgress([]);
        }
      }
    };

    fetchLiveData();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  const currentTheme: 'light' | 'dark' =
    user?.preferences?.theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    }
  }, [currentTheme]);

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'error' = 'success'
  ) => {
    const id = Date.now().toString();

    setToast({ id, message, type });

    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3200);
  };

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    setUser((previousUser) => ({
      ...previousUser,
      preferences: {
        ...(previousUser.preferences || INITIAL_USER.preferences),
        theme: nextTheme,
      },
    }));

    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
  };

  const navigate = (
    page: PageId,
    params?: { editingWorkoutId?: string; preselectedMeal?: MealType }
  ) => {
    setPreviousPage(currentPage);
    setEditingWorkoutId(params?.editingWorkoutId || null);
    setPreselectedMeal(params?.preselectedMeal || null);
    setCurrentPage(page);
    routerNavigate(pagePaths[page]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = (email: string, pass: string): boolean => {
    if (email && pass.length >= 3) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
      routerNavigate('/dashboard');
      return true;
    }

    return false;
  };

  const demoLogin = () => {
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('pulsefit_is_demo', 'true');

    setUser(INITIAL_USER);
    setWorkouts(INITIAL_WORKOUTS);
    setNutrition(INITIAL_NUTRITION);
    setProgress(INITIAL_PROGRESS);
    setNotifications(INITIAL_NOTIFICATIONS);

    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    routerNavigate('/dashboard');

    showToast('Logged in as Alex Morgan (Demo Account)', 'success');
  };

  const register = (
    name: string,
    email: string,
    pass: string,
    avatarUrl?: string
  ) => {
    const newUser: User = {
      ...INITIAL_USER,
      id: 'usr_' + Date.now(),
      name: name || 'Fitness Enthusiast',
      email,
      avatarUrl: avatarUrl || INITIAL_USER.avatarUrl,
      memberSince: new Date().toISOString().split('T')[0],
    };

    setUser(newUser);
    setCurrentPage('login');
    routerNavigate('/login');

    showToast('Registration successful! Please log in with your credentials.', 'success');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('pulsefit_is_demo');
    localStorage.removeItem('pulsefit_user');
    localStorage.removeItem('pulsefit_workouts');
    localStorage.removeItem('pulsefit_nutrition');
    localStorage.removeItem('pulsefit_auth');

    setIsAuthenticated(false);
    setNotifications([]);
    setProgress([]);
    setUser(INITIAL_USER);
    setCurrentPage('login');
    routerNavigate('/login');

    showToast('You have been logged out safely.', 'info');
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((previousUser) => ({
      ...previousUser,
      ...updated,
      avatarUrl: updated.profilePic || updated.avatarUrl || previousUser.avatarUrl,
    }));

    showToast('Profile updated successfully!', 'success');
  };
const createLocalNotification = (
  title: string,
  message: string,
  type: NotificationItem['type']
) => {
  const notification: NotificationItem = {
    id: `local_${Date.now()}`,
    userId: user.id,
    title,
    message,
    type,
    isRead: false,
    date: new Date().toISOString(),
  };

  setNotifications((previous) => {
    const updated = [notification, ...previous];

    localStorage.setItem(
      'pulsefit_local_notifications',
      JSON.stringify(
        updated.filter((n) => n.id.startsWith('local_'))
      )
    );

    console.log('🔔 Notification Created:', notification);
    console.log('📢 Updated Notifications:', updated);

    return updated;
  });
};
  
const addWorkout = (wo: Omit<Workout, 'id' | 'userId'>) => {

  console.log('🏋️ ADD WORKOUT FUNCTION CALLED');
  console.log('Workout Data:', wo);

  const newWorkout: Workout = {
    ...wo,
    id: 'wo_' + Date.now(),
    userId: user.id,
  };

  setWorkouts((previous) => [newWorkout, ...previous]);

  const workoutReminders =
    user?.preferences?.workoutReminders ?? true;

  console.log('🔔 Reminder Setting:', workoutReminders);

  if (workoutReminders) {

    console.log('🚀 Creating workout notification...');

    createLocalNotification(
      'Workout Saved',
      `Your workout "${newWorkout.exerciseName}" has been saved successfully! 💪`,
      'workout'
    );

  } else {
    console.log('⏸️ Workout reminders disabled');
  }

  showToast(
    `Workout "${newWorkout.exerciseName}" logged successfully!`,
    'success'
  );
};


  const updateWorkout = (wo: Workout) => {
    setWorkouts((previous) =>
      previous.map((item) => (item.id === wo.id ? wo : item))
    );

    showToast(`Workout "${wo.exerciseName}" updated!`, 'success');
  };

  const deleteWorkout = (id: string) => {
    setWorkouts((previous) => previous.filter((item) => item.id !== id));
    showToast('Workout removed.', 'info');
  };

  const addNutrition = (item: Omit<NutritionItem, 'id' | 'userId'>) => {
    const newItem: NutritionItem = {
      ...item,
      id: 'nut_' + Date.now(),
      userId: user.id,
    };

    setNutrition((previous) => [newItem, ...previous]);

    showToast(`Added ${newItem.foodItem} to ${newItem.mealType}!`, 'success');
  };

  const deleteNutrition = (id: string) => {
    setNutrition((previous) => previous.filter((item) => item.id !== id));
    showToast('Food entry removed.', 'info');
  };

  const addProgressEntry = async (
    entry: Omit<ProgressEntry, 'id' | 'userId'>
  ) => {
    try {
      await createProgress({
        weight: entry.weight,
        date: entry.date,
        measurements: {
          chest: entry.measurements.chest,
          waist: entry.measurements.waist,
        },
        performanceMetrics: {
          runTime: entry.runTime5kMinutes,
        },
      });

      await refreshProgress();
      await refreshNotifications();

      setUser((previous) => ({
        ...previous,
        targetWeight: entry.weight,
      }));

      showToast('Body progress check-in saved!', 'success');
    } catch (error) {
      console.error('Could not save progress:', error);
      showToast('Could not save progress. Please try again.', 'error');
    }
  };

  const deleteProgressEntry = async (id: string) => {
    try {
      await deleteProgress(id);

      await refreshProgress();
      await refreshNotifications();

      showToast('Progress record deleted.', 'info');
    } catch (error) {
      console.error('Could not delete progress:', error);
      showToast('Could not delete progress. Please try again.', 'error');
    }
  };

  const markNotificationRead = async (id: string) => {
    if (localStorage.getItem('pulsefit_is_demo') !== 'true') {
      try {
        await markNotificationReadApi(id);
      } catch (error) {
        console.error('Could not mark notification as read:', error);
        showToast('Could not update notification.', 'error');
        return;
      }
    }

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllNotificationsRead = async () => {
    if (localStorage.getItem('pulsefit_is_demo') !== 'true') {
      try {
        await markAllNotificationsReadApi();
      } catch (error) {
        console.error('Could not mark all notifications as read:', error);
        showToast('Could not update notifications.', 'error');
        return;
      }
    }

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    showToast('All notifications marked as read', 'info');
  };

  const clearAllNotifications = async () => {
    if (localStorage.getItem('pulsefit_is_demo') !== 'true') {
      try {
        await clearAllNotificationsApi();
      } catch (error) {
        console.error('Could not clear notifications:', error);
        showToast('Could not clear notifications.', 'error');
        return;
      }
    }

    setNotifications([]);
    showToast('Notifications cleared', 'info');
  };

  const toggleFollowUser = (id: string) => {
    setCommunityUsers((previous) =>
      previous.map((communityUser) => {
        if (communityUser.id === id) {
          const newState = !communityUser.isFollowing;

          showToast(
            newState
              ? `Now following ${communityUser.name}`
              : `Unfollowed ${communityUser.name}`,
            'info'
          );

          return { ...communityUser, isFollowing: newState };
        }

        return communityUser;
      })
    );
  };

  const logWater = (delta: number) => {
    setWaterGlassesToday((previous) => Math.max(0, previous + delta));

    if (delta > 0) {
      showToast('Hydration logged: +1 glass of water 💧', 'info');
    }
  };

  const resetToDefaultData = () => {
    setUser(INITIAL_USER);
    setWorkouts(INITIAL_WORKOUTS);
    setNutrition(INITIAL_NUTRITION);
    setProgress(INITIAL_PROGRESS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCommunityUsers(COMMUNITY_USERS);
    setWaterGlassesToday(6);

    showToast('Sample dataset restored to initial state!', 'success');
  };

  const formatWeight = (kg: number): string => {
    if (user?.preferences?.units === 'imperial') {
      return `${(kg * 2.20462).toFixed(1)} lbs`;
    }

    return `${kg} kg`;
  };

  const formatDistance = (km: number): string => {
    if (user?.preferences?.units === 'imperial') {
      return `${(km * 0.621371).toFixed(1)} mi`;
    }

    return `${km} km`;
  };

  const formatLength = (cm: number): string => {
    if (user?.preferences?.units === 'imperial') {
      return `${(cm * 0.393701).toFixed(1)} in`;
    }

    return `${cm} cm`;
  };

  return (
    <FitnessContext.Provider
      value={{
        refreshProfile,
        refreshNotifications,
        refreshProgress,
        currentPage,
        previousPage,
        navigate,
        isAuthenticated,
        user,
        workouts,
        nutrition,
        progress,
        notifications,
        communityUsers,
        editingWorkoutId,
        preselectedMeal,
        waterGlassesToday,
        toast,
        login,
        demoLogin,
        register,
        logout,
        updateUser,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        addNutrition,
        deleteNutrition,
        addProgressEntry,
        deleteProgressEntry,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        toggleFollowUser,
        logWater,
        resetToDefaultData,
        showToast,
        theme: currentTheme,
        toggleTheme,
        formatWeight,
        formatDistance,
        formatLength,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);

  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }

  return context;
};
