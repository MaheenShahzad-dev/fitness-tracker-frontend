
import React, { useEffect, useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import {
  Search as SearchIcon,
  Dumbbell,
  Utensils,
  TrendingUp,
  Bell,
  ArrowRight,
  X,
} from 'lucide-react';

import {
  searchWorkouts,
  searchNutrition,
  searchProgress,
  searchNotifications,
} from '../services/searchServices';

type FilterType =
  | 'all'
  | 'workouts'
  | 'nutrition'
  | 'progress'
  | 'notifications';

export const SearchPage: React.FC = () => {
  const { navigate, formatWeight } = useFitness();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [nutrition, setNutrition] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [totals, setTotals] = useState({
    workouts: 0,
    nutrition: 0,
    progress: 0,
    notifications: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      const results = await Promise.allSettled([
        searchWorkouts(searchQuery.trim()),
        searchNutrition(searchQuery.trim()),
        searchProgress(searchQuery.trim()),
        searchNotifications(searchQuery.trim()),
      ]);

      const failedRequests = results.filter(
        (result) => result.status === 'rejected'
      ).length;

      if (failedRequests === results.length) {
        setError('Unable to load search results. Please try again.');
        setWorkouts([]);
        setNutrition([]);
        setProgress([]);
        setNotifications([]);
        setTotals({
          workouts: 0,
          nutrition: 0,
          progress: 0,
          notifications: 0,
        });
      } else {
        const workoutResult = results[0];
        const nutritionResult = results[1];
        const progressResult = results[2];
        const notificationResult = results[3];

        if (workoutResult.status === 'fulfilled') {
          setWorkouts(workoutResult.value.workouts || []);
          setTotals((prev) => ({
            ...prev,
            workouts: workoutResult.value.total || 0,
          }));
        } else {
          setWorkouts([]);
          setTotals((prev) => ({ ...prev, workouts: 0 }));
        }

        if (nutritionResult.status === 'fulfilled') {
          setNutrition(nutritionResult.value.nutrition || []);
          setTotals((prev) => ({
            ...prev,
            nutrition: nutritionResult.value.total || 0,
          }));
        } else {
          setNutrition([]);
          setTotals((prev) => ({ ...prev, nutrition: 0 }));
        }

        if (progressResult.status === 'fulfilled') {
          setProgress(progressResult.value.progress || []);
          setTotals((prev) => ({
            ...prev,
            progress: progressResult.value.total || 0,
          }));
        } else {
          setProgress([]);
          setTotals((prev) => ({ ...prev, progress: 0 }));
        }

        if (notificationResult.status === 'fulfilled') {
          setNotifications(notificationResult.value.notifications || []);
          setTotals((prev) => ({
            ...prev,
            notifications: notificationResult.value.total || 0,
          }));
        } else {
          setNotifications([]);
          setTotals((prev) => ({ ...prev, notifications: 0 }));
        }

        if (failedRequests > 0) {
          setError('Some search categories could not be loaded.');
        }
      }

      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totalResults =
    totals.workouts +
    totals.nutrition +
    totals.progress +
    totals.notifications;

  const showCategory = (category: FilterType) =>
    filterType === 'all' || filterType === category;

  const formatDate = (date?: string) => {
    if (!date) return 'No date';

    return new Date(date).toLocaleDateString();
  };

  const tabs: {
    value: FilterType;
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      value: 'all',
      label: 'All Results',
      count: totalResults,
      icon: null,
    },
    {
      value: 'workouts',
      label: 'Workouts',
      count: totals.workouts,
      icon: <Dumbbell className="w-3.5 h-3.5" />,
    },
    {
      value: 'nutrition',
      label: 'Nutrition',
      count: totals.nutrition,
      icon: <Utensils className="w-3.5 h-3.5" />,
    },
    {
      value: 'progress',
      label: 'Progress',
      count: totals.progress,
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    {
      value: 'notifications',
      label: 'Notifications',
      count: totals.notifications,
      icon: <Bell className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <SearchIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Universal Fitness Search
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Search your workouts, nutrition, progress records, and notifications
        </p>
      </div>

      {/* Search Input and Tabs */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">

        <div className="relative">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises, foods, weight, or notifications..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-emerald-500 transition-colors"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value)}
              className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                filterType === tab.value
                  ? 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-12 text-center">
          <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Searching your records...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Search Results */}
      {!loading && !error && (
        <div className="space-y-8">

          {/* Workouts */}
          {showCategory('workouts') && workouts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Workouts ({totals.workouts})
                </h2>

                <button
                  onClick={() => navigate('workouts')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  View Workouts <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workouts.map((wo) => (
                  <div
                    key={wo._id}
                    onClick={() => navigate('workouts')}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-700 cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {wo.exerciseName}
                      </h3>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {wo.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {wo.sets} sets × {wo.reps} reps
                    </p>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>
                        {wo.weight > 0 ? formatWeight(wo.weight) : 'Bodyweight'}
                      </span>
                      <span>{formatDate(wo.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nutrition */}
          {showCategory('nutrition') && nutrition.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Nutrition ({totals.nutrition})
                </h2>

                <button
                  onClick={() => navigate('nutrition')}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  View Nutrition <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nutrition.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate('nutrition')}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-700 cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.foodItem}
                      </h3>

                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                        {item.calories} kcal
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {item.quantity} · {item.mealType}
                    </p>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>
                        P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                      </span>
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Progress */}
          {showCategory('progress') && progress.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Progress Records ({totals.progress})
                </h2>

                <button
                  onClick={() => navigate('progress')}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  View Progress <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {progress.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate('progress')}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-700 cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        Progress Record
                      </h3>

                      <span className="text-[10px] text-slate-500">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      {item.weight !== undefined && (
                        <p>Weight: {formatWeight(item.weight)}</p>
                      )}

                      {item.measurements?.chest !== undefined && (
                        <p>Chest: {item.measurements.chest}</p>
                      )}

                      {item.measurements?.waist !== undefined && (
                        <p>Waist: {item.measurements.waist}</p>
                      )}

                      {item.performanceMetrics?.runDistance !== undefined && (
                        <p>Distance: {item.performanceMetrics.runDistance} km</p>
                      )}

                      {item.performanceMetrics?.runTime !== undefined && (
                        <p>Run time: {item.performanceMetrics.runTime} sec</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notifications */}
          {showCategory('notifications') && notifications.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Notifications ({totals.notifications})
                </h2>

                <button
                  onClick={() => navigate('notifications')}
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                >
                  View Notifications <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notifications.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate('notifications')}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-700 cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {item.message}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>{formatDate(item.createdAt)}</span>

                      <span className={item.isRead ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {item.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No Results */}
          {totalResults === 0 && (
            <div className="py-12 text-center">
              <SearchIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />

              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No results found
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try another keyword or search in a different category.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
