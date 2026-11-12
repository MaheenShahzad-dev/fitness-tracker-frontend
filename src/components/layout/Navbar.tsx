
import React, { useEffect, useMemo } from 'react';
import { useFitness, PageId } from '../../context/FitnessContext';

import {
  Bell,
  Flame,
  Menu,
  X,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';

import { motion } from 'motion/react';

export const Navbar: React.FC<{
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}> = ({ onToggleSidebar, isSidebarOpen }) => {

  const {
    isAuthenticated,
    currentPage,
    navigate,
    user,
    notifications,
    demoLogin,
    theme,
    toggleTheme,
  } = useFitness();

  // =====================================
  // WORKOUT NOTIFICATION SETTINGS
  // =====================================

  const workoutReminders =
    user?.preferences?.workoutReminders ?? true;

  const allNotifications = notifications ?? [];

  // =====================================
  // FILTER NOTIFICATIONS
  // =====================================

  const visibleNotifications = useMemo(() => {

    if (workoutReminders) {
      return allNotifications;
    }

    return allNotifications.filter((notification) => {
      const type = String(notification.type || '')
        .trim()
        .toLowerCase();

      return type !== 'workout';
    });

  }, [allNotifications, workoutReminders]);

  // =====================================
  // UNREAD COUNT
  // =====================================

  const unreadCount = visibleNotifications.filter(
    (notification) => !notification.isRead
  ).length;

  // =====================================
  // DEBUG CONSOLE LOGS
  // =====================================

  useEffect(() => {

    console.group('🔔 PulseFit Notification Debug');

    console.log(
      'Authentication:',
      isAuthenticated
    );

    console.log(
      'Workout Reminders:',
      workoutReminders
    );

    console.log(
      'All Notifications:',
      allNotifications
    );

    console.log(
      'Total Notifications:',
      allNotifications.length
    );

    console.log(
      'Visible Notifications:',
      visibleNotifications
    );

    console.log(
      'Visible Notification Count:',
      visibleNotifications.length
    );

    console.log(
      'Unread Count:',
      unreadCount
    );

    console.log(
      'Workout Notifications:',
      allNotifications.filter(
        (n) =>
          String(n.type || '').trim().toLowerCase() === 'workout'
      )
    );

    console.groupEnd();

  }, [
    isAuthenticated,
    workoutReminders,
    allNotifications,
    visibleNotifications,
    unreadCount,
  ]);

  // =====================================
  // PAGE TITLES
  // =====================================

  const pageTitles: Record<PageId, string> = {
    landing: 'Home',
    register: 'Create Account',
    login: 'Sign In',
    dashboard: 'Dashboard',
    profile: 'User Profile',
    workouts: 'Workout Registry',
    'create-workout': 'Log Workout',
    nutrition: 'Nutrition Daily Log',
    'add-nutrition': 'Add Food Item',
    progress: 'Progress & Measurements',
    analytics: 'Performance Analytics',
    search: 'Universal Search',
    reports: 'Summary & Export',
    notifications: 'Notifications',
    settings: 'System Preferences',
    support: 'Support & Helpdesk',
    'not-found': 'Page Not Found',
  };

  // =====================================
  // NAVBAR
  // =====================================

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 transition-colors duration-200">

      <div className="flex h-full items-center justify-between gap-6 max-w-7xl mx-auto">

        {/* BRAND */}

        <div className="flex items-center gap-4">

          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md"
              aria-label="Toggle Navigation Menu"
            >
              {isSidebarOpen
                ? <X className="w-5 h-5" />
                : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div
            onClick={() =>
              navigate( 'landing')
            }
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Flame className="w-5 h-5" />
            </div>

            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              PulseFit
            </span>
          </div>

          {isAuthenticated && (
            <div className="hidden sm:flex items-center text-xs text-slate-500 dark:text-slate-400 pl-4 border-l border-slate-200 dark:border-slate-800">

              <span
                onClick={() => navigate('landing')}
                className="cursor-pointer"
              >
                PulseFit
              </span>

              <span className="mx-2">/</span>

              <span className="text-slate-900 dark:text-slate-200 font-medium">
                {pageTitles[currentPage] || 'Overview'}
              </span>

            </div>
          )}

        </div>

        {/* NAVIGATION */}

        {!isAuthenticated ? (

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">

          

          </nav>

        ) : (

          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">

            <button onClick={() => navigate('workouts')}>
              Workouts
            </button>

            <button onClick={() => navigate('nutrition')}>
              Nutrition
            </button>

            <button onClick={() => navigate('analytics')}>
              Analytics
            </button>

            <button onClick={() => navigate('reports')}>
              Reports
            </button>

          </div>

        )}

        {/* ACTIONS */}

        <div className="flex items-center gap-2.5 shrink-0">

          {/* THEME */}

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800"
            title={
              theme === 'dark'
                ? 'Switch to Light mode'
                : 'Switch to Dark mode'
            }
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </motion.button>

          {/* AUTHENTICATION */}

          {!isAuthenticated ? (

            <div className="flex items-center gap-2.5">

              <button
                onClick={() => navigate('login')}
                className="px-3.5 py-1.5 text-xs font-medium"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 dark:bg-emerald-400 dark:text-slate-950 rounded-lg"
              >
                Register
              </button>

            </div>

          ) : (

            <div className="flex items-center gap-2.5">

              {/* NOTIFICATION BELL */}

              <button
                type="button"
                onClick={() => {
                  console.log(
                    '🔔 Notification bell clicked'
                  );

                  console.log(
                    'Notifications being displayed:',
                    visibleNotifications
                  );

                  console.log(
                    'Unread notifications:',
                    unreadCount
                  );

                  navigate('notifications');
                }}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
                aria-label={`View Notifications. ${unreadCount} unread`}
              >

                <Bell className="w-4 h-4" />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-950">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}

              </button>

              {/* PROFILE */}

              <button
                onClick={() => navigate('profile')}
                className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/60 transition-colors"
                aria-label="User Profile"
              >

                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </span>

                {user?.profilePic || user?.avatarUrl ? (

                  <img
                    src={user.profilePic || user.avatarUrl}
                    alt={user?.name || 'Profile'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                ) : (

                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                )}

              </button>

            </div>

          )}

        </div>

      </div>
    </header>
  );
};




