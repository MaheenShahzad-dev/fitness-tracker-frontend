
import React, { useCallback, useEffect, useState } from 'react';
import { useFitness } from '../context/FitnessContext';

import {
  Bell,
  CheckCircle,
  Dumbbell,
  Award,
  Utensils,
  Info,
  Trash2,
  CheckCheck,
  Search,
  Activity,
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from '../services/notificationService';

import toast from 'react-hot-toast';

type NotificationType =
  | 'Workout'
  | 'Nutrition'
  | 'Progress'
  | 'Goal'
  | 'System';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  isRead: boolean;
  createdAt: string;
}

type NotificationFilter = 'all' | 'unread' | 'read';

export const NotificationsPage: React.FC = () => {

  const { user, refreshNotifications } = useFitness();

  const workoutReminders =
    user.preferences?.workoutReminders ?? true;

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [filter, setFilter] =
    useState<NotificationFilter>('all');

  const [search, setSearch] = useState('');

  const [unreadCount, setUnreadCount] = useState(0);
  const [readCount, setReadCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Normalize notification type
  const isWorkoutNotification = (item: NotificationItem) => {
    return item.type?.toLowerCase() === 'workout';
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {

    try {

      setIsLoading(true);

      const params: {
        page: number;
        limit: number;
        search?: string;
        isRead?: string;
      } = {
        page: 1,
        limit: 100,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      // Filter locally so counts are calculated consistently
      const response = await getNotifications(params);

      if (response.status === 'success') {

        const allNotifications: NotificationItem[] =
          response.notifications || [];

        // Hide workout notifications when disabled
        const visibleNotifications = workoutReminders
          ? allNotifications
          : allNotifications.filter(
              item => !isWorkoutNotification(item)
            );

        // Apply read/unread filters
        let filteredNotifications = visibleNotifications;

        if (filter === 'unread') {
          filteredNotifications = visibleNotifications.filter(
            item => !item.isRead
          );
        }

        if (filter === 'read') {
          filteredNotifications = visibleNotifications.filter(
            item => item.isRead
          );
        }

        setNotifications(filteredNotifications);

        // Counts from all visible notifications
        setUnreadCount(
          visibleNotifications.filter(
            item => !item.isRead
          ).length
        );

        setReadCount(
          visibleNotifications.filter(
            item => item.isRead
          ).length
        );

      }

    } catch (error) {

      console.error('Notification fetch error:', error);

      toast.error('Failed to load notifications');

    } finally {

      setIsLoading(false);

    }

  }, [filter, search, workoutReminders]);

  // Refresh when settings, search or filters change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single notification as read
  const handleMarkRead = async (id: string) => {

    if (isUpdating) return;

    try {

      setIsUpdating(true);

      await markNotificationRead(id);

      await refreshNotifications();

      await fetchNotifications();

      toast.success('Notification marked as read');

    } catch (error) {

      console.error(error);

      toast.error('Failed to update notification');

    } finally {

      setIsUpdating(false);

    }

  };

  // Mark all visible notifications as read
  const handleMarkAllRead = async () => {

    if (isUpdating || unreadCount === 0) return;

    try {

      setIsUpdating(true);

      await markAllNotificationsRead();

      await refreshNotifications();

      await fetchNotifications();

      toast.success('All notifications marked as read');

    } catch (error) {

      console.error(error);

      toast.error('Failed to mark notifications as read');

    } finally {

      setIsUpdating(false);

    }

  };

  // Clear all notifications
  const handleClearAll = () => {

    toast(
      (t) => (

        <div className="flex flex-col gap-3">

          <p className="text-sm font-medium text-slate-800">
            Delete all notifications?
          </p>

          <p className="text-xs text-slate-500">
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2">

            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-700"
            >
              Cancel
            </button>

            <button
              onClick={async () => {

                toast.dismiss(t.id);

                if (isUpdating) return;

                try {

                  setIsUpdating(true);

                  await clearAllNotifications();

                  await refreshNotifications();

                  await fetchNotifications();

                  toast.success('All notifications deleted');

                } catch (error) {

                  console.error(error);

                  toast.error('Failed to delete notifications');

                } finally {

                  setIsUpdating(false);

                }

              }}
              className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white"
            >
              Delete All
            </button>

          </div>

        </div>

      ),
      { duration: Infinity }
    );

  };

  // Notification icons
  const getIcon = (type: NotificationType | string) => {

    switch (type?.toLowerCase()) {

      case 'workout':
        return (
          <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        );

      case 'goal':
        return (
          <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        );

      case 'nutrition':
        return (
          <Utensils className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        );

      case 'progress':
        return (
          <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        );

      default:
        return (
          <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        );

    }

  };

  // Format date
  const formatDate = (date: string) => {

    return new Date(date).toLocaleString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  };

  return (

    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">

        <div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">

            <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />

            Activity Notifications

          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            System alerts, personal records, milestones and achievements
          </p>

        </div>

        <div className="flex items-center gap-2.5">

          {unreadCount > 0 && (

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAllRead}
              disabled={isUpdating}
              className="px-3.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >

              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />

              Mark All Read

            </motion.button>

          )}

          {notifications.length > 0 && (

            <button
              onClick={handleClearAll}
              disabled={isUpdating}
              className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >

              <Trash2 className="w-3.5 h-3.5" />

              Clear All

            </button>

          )}

        </div>

      </div>

      {/* Workout reminder status */}
      {!workoutReminders && (

        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-700 dark:text-amber-400">

          Workout reminders are disabled. Workout notifications are hidden.

        </div>

      )}

      {/* Search */}
      <div className="relative">

        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notifications..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500"
        />

      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">

        {(['all', 'unread', 'read'] as NotificationFilter[]).map(
          item => (

            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                filter === item
                  ? 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >

              {item === 'all'
                ? `All (${readCount + unreadCount})`
                : item === 'unread'
                ? `Unread (${unreadCount})`
                : `Read (${readCount})`}

            </button>

          )
        )}

      </div>

      {/* Notification List */}
      {isLoading ? (

        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">

          <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-xs text-slate-500 mt-3">
            Loading notifications...
          </p>

        </div>

      ) : notifications.length === 0 ? (

        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">

          <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto" />

          <h3 className="text-base font-semibold text-slate-900 dark:text-white">

            {search.trim()
              ? 'No notifications found'
              : 'All caught up!'}

          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400">

            {search.trim()
              ? 'Try another search keyword.'
              : 'You have no notifications in this view.'}

          </p>

        </div>

      ) : (

        <div className="space-y-3">

          <AnimatePresence>

            {notifications.map(item => (

              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={() => {
                  if (!item.isRead && !isUpdating) {
                    handleMarkRead(item._id);
                  }
                }}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  !item.isRead
                    ? 'bg-emerald-50/70 dark:bg-slate-900 border-emerald-200 dark:border-emerald-500/40 shadow-sm cursor-pointer'
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >

                <div className="flex items-start gap-3.5">

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 mt-0.5">

                    {getIcon(item.type)}

                  </div>

                  <div className="space-y-1">

                    <div className="flex items-center gap-2">

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      {!item.isRead && (

                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />

                      )}

                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      {formatDate(item.createdAt)}
                    </div>

                  </div>

                </div>

                {!item.isRead && (

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(item._id);
                    }}
                    disabled={isUpdating}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap shrink-0 mt-1 disabled:opacity-50"
                  >

                    Mark read

                  </button>

                )}

              </motion.div>

            ))}

          </AnimatePresence>

        </div>

      )}

    </div>

  );

};
