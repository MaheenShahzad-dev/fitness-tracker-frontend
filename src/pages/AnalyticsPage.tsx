
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LineChart, BarChart, DonutChart } from '../components/charts/Charts';
import {
  BarChart3,
  Dumbbell,
  Utensils,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertCircle,
  Scale,
  Flame,
  Target,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAnalytics } from '../services/analyticsServices';

type TabType = 'workouts' | 'nutrition' | 'body';

interface AnalyticsResponse {
  status: string;
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  summary: {
    totalWorkouts: number;
    strengthWorkouts: number;
    cardioWorkouts: number;
    totalNutritionEntries: number;
    totalCaloriesConsumed: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    averageDailyCalories: number;
    firstWeight: number | null;
    latestWeight: number | null;
    weightChange: number | null;
  };
  charts: {
    workoutsByDate: any[];
    nutritionByDate: any[];
    weightProgress: any[];
    bodyMeasurements: any[];
    runningProgress: any[];
  };
  records: {
    workouts: any[];
    nutrition: any[];
    progress: any[];
  };
}

const formatNumber = (value: number | null | undefined) => {
  return Number(value || 0).toLocaleString();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const getDateKey = (date: string) => {
  const d = new Date(date);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes} min ${remainingSeconds} sec`;
};

const EmptyChart = ({ message }: { message: string }) => (
  <div className="h-52 flex flex-col items-center justify-center text-center">
    <BarChart3 className="w-9 h-9 text-slate-300 dark:text-slate-700 mb-3" />
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
      {message}
    </p>
    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
      Add records to see your analytics here.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"
        />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800"
        />
      ))}
    </div>

    <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
  </div>
);

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('workouts');

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getAnalytics();

      if (response.status !== 'success') {
        throw new Error('Unable to load analytics data.');
      }

      setAnalytics(response);
    } catch (e: any) {
      setError(
        e.response?.data?.message ||
        e.message ||
        'Something went wrong while loading analytics.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = analytics?.summary;
  const workouts = analytics?.records?.workouts || [];
  const nutrition = analytics?.records?.nutrition || [];
  const progress = analytics?.records?.progress || [];

  // Workout volume grouped by date
  const volumeData = useMemo(() => {
    const grouped: Record<string, number> = {};

    workouts.forEach((workout) => {
      if (!workout.date || !workout.weight) return;

      const key = getDateKey(workout.date);
      const volume =
        Number(workout.sets || 0) *
        Number(workout.reps || 0) *
        Number(workout.weight || 0);

      grouped[key] = (grouped[key] || 0) + volume;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        label: formatDate(date),
        value,
        subtext: `${formatNumber(value)} kg volume`
      }));
  }, [workouts]);

  // Workout frequency for the last seven days
  const frequencyDays = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const key = getDateKey(date.toISOString());

      const count = workouts.filter(
        (workout) => workout.date && getDateKey(workout.date) === key
      ).length;

      days.push({
        label: date.toLocaleDateString('en-US', {
          weekday: 'short'
        }),
        value: count
      });
    }

    return days;
  }, [workouts]);

 // Workout category totals
const workoutCategories = [
  { label: 'Strength', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Cardio', color: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400' },
  { label: 'HIIT', color: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  { label: 'Yoga', color: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400' },
  { label: 'Flexibility', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' }
];

const categoryCounts = workoutCategories.map((category) => ({
  ...category,
  count: workouts.filter(
    (workout) => workout.category === category.label
  ).length
}));

const totalCategoryWorkouts = categoryCounts.reduce(
  (total, category) => total + category.count,
  0
);

const strengthCount = categoryCounts.find(
  (category) => category.label === 'Strength'
)?.count || 0;

const cardioCount = categoryCounts.find(
  (category) => category.label === 'Cardio'
)?.count || 0;



  // Nutrition calories grouped by date
  const calorieData = useMemo(() => {
    const grouped: Record<string, number> = {};

    nutrition.forEach((item) => {
      if (!item.date) return;

      const key = getDateKey(item.date);

      grouped[key] =
        (grouped[key] || 0) + Number(item.calories || 0);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, value]) => ({
        label: formatDate(date),
        value
      }));
  }, [nutrition]);

  // Weight history
  const weightData = useMemo(() => {
    return progress
      .filter((item) => Number(item.weight) > 0 && item.date)
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .map((item) => ({
        label: formatDate(item.date),
        value: Number(item.weight),
        subtext: `${item.weight} kg`
      }));
  }, [progress]);

  // Chest measurement history
  const chestData = useMemo(() => {
    return progress
      .filter((item) => Number(item.measurements?.chest) > 0 && item.date)
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .map((item) => ({
        label: formatDate(item.date),
        value: Number(item.measurements.chest)
      }));
  }, [progress]);

  // Waist measurement history
  const waistData = useMemo(() => {
    return progress
      .filter((item) => Number(item.measurements?.waist) > 0 && item.date)
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .map((item) => ({
        label: formatDate(item.date),
        value: Number(item.measurements.waist)
      }));
  }, [progress]);

  // Running distance history
  const runningData = useMemo(() => {
    return progress
      .filter(
        (item) =>
          Number(item.performanceMetrics?.runDistance) > 0 &&
          item.date
      )
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .map((item) => ({
        label: formatDate(item.date),
        value: Number(item.performanceMetrics.runDistance),
        subtext: item.performanceMetrics.runTime
          ? formatDuration(Number(item.performanceMetrics.runTime))
          : ''
      }));
  }, [progress]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Performance Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your fitness progress and performance.
          </p>
        </div>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4">
            Unable to load analytics
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {error}
          </p>

          <button
            onClick={fetchAnalytics}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || !summary) return null;

  const hasAnyRecords =
    workouts.length > 0 ||
    nutrition.length > 0 ||
    progress.length > 0;

  const summaryCards = [
    {
      title: 'Total Workouts',
      value: formatNumber(summary.totalWorkouts),
     subtitle: `${categoryCounts.filter((item) => item.count > 0).length} active categories`,
      icon: Dumbbell,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      title: 'Nutrition Entries',
      value: formatNumber(summary.totalNutritionEntries),
      subtitle: 'Food records logged',
      icon: Utensils,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40'
    },
    {
      title: 'Calories Consumed',
      value: `${formatNumber(summary.totalCaloriesConsumed)} kcal`,
      subtitle: `Average ${formatNumber(summary.averageDailyCalories)} kcal/day`,
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/40'
    },
    {
      title: 'Weight Change',
      value:
        summary.weightChange === null
          ? '—'
          : `${summary.weightChange > 0 ? '+' : ''}${summary.weightChange} kg`,
      subtitle:
        summary.firstWeight !== null && summary.latestWeight !== null
          ? `${summary.firstWeight} kg → ${summary.latestWeight} kg`
          : 'Record your weight to track changes',
      icon: Scale,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40'
    }
  ];

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-700 dark:text-red-400" />
            Performance Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Understand your workouts, nutrition, and fitness progress.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    {card.value}
                  </h3>
                </div>

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Macro Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Protein',
            value: summary.totalProtein,
            unit: 'g',
            color: 'text-emerald-600 dark:text-emerald-400'
          },
          {
            title: 'Carbohydrates',
            value: summary.totalCarbs,
            unit: 'g',
            color: 'text-cyan-600 dark:text-cyan-400'
          },
          {
            title: 'Fat',
            value: summary.totalFat,
            unit: 'g',
            color: 'text-amber-600 dark:text-amber-400'
          }
        ].map((item) => (
          <div
            key={item.title}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total {item.title}
            </p>
            <p className={`text-xl font-bold mt-1 ${item.color}`}>
              {formatNumber(item.value)} {item.unit}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        {[
          { id: 'workouts', label: 'Workouts', icon: Dumbbell },
          { id: 'nutrition', label: 'Nutrition', icon: Utensils },
          { id: 'body', label: 'Body & Cardio', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-red-700 dark:bg-slate-700 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* WORKOUT TAB */}
        {activeTab === 'workouts' && (
          <motion.div
            key="workouts"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Workout Volume */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Workout Volume Progression
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sets × reps × weight for recorded sessions
                  </p>
                </div>

                {volumeData.length > 0 ? (
                  <LineChart data={volumeData} color="#10b981" unit="kg volume" height={220} />
                ) : (
                  <EmptyChart message="No workout volume data available" />
                )}
              </div>

              {/* Weekly Frequency */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Workout Frequency
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Workouts completed over the last seven days
                  </p>
                </div>

                {workouts.length > 0 ? (
                  <BarChart data={frequencyDays} color="#10b981" unit="sessions" height={200} />
                ) : (
                  <EmptyChart message="No workout records available" />
                )}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Workout Category Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
             Distribution of your workouts across all categories
                </p>
              </div>

              {totalCategoryWorkouts > 0 ? (
                <div className="space-y-5">
                 {categoryCounts.map((item) => {
                    const percentage =
                      (item.count / totalCategoryWorkouts) * 100;

                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className={`font-medium ${item.text}`}>
                            {item.label}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {item.count} sessions ({percentage.toFixed(1)}%)
                          </span>
                        </div>

                        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyChart message="No workout categories to display" />
              )}
            </div>
          </motion.div>
        )}

        {/* NUTRITION TAB */}
        {activeTab === 'nutrition' && (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Macronutrients */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-cyan-600" />
                    Macronutrient Distribution
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Total protein, carbohydrates, and fat
                  </p>
                </div>

                {summary.totalProtein + summary.totalCarbs + summary.totalFat > 0 ? (
                  <DonutChart
                    protein={summary.totalProtein}
                    carbs={summary.totalCarbs}
                    fat={summary.totalFat}
                    totalCalories={summary.totalCaloriesConsumed}
                  />
                ) : (
                  <EmptyChart message="No macronutrient data available" />
                )}
              </div>

              {/* Calorie History */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Calorie Intake
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Daily calories from your nutrition records
                  </p>
                </div>

                {calorieData.length > 0 ? (
                  <BarChart data={calorieData} color="#06b6d4" unit="kcal" height={220} />
                ) : (
                  <EmptyChart message="No calorie records available" />
                )}
              </div>
            </div>

            {/* Nutrition Summary */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Nutrition Overview
              </h3>

              {nutrition.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total Nutrition Entries
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {formatNumber(summary.totalNutritionEntries)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Average Daily Calories
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {formatNumber(summary.averageDailyCalories)} kcal
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyChart message="No nutrition entries recorded yet" />
              )}
            </div>
          </motion.div>
        )}

        {/* BODY & CARDIO TAB */}
        {activeTab === 'body' && (
          <motion.div
            key="body"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Weight Progress */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-600" />
                  Weight Progress
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your recorded bodyweight history
                </p>
              </div>

              {weightData.length > 0 ? (
                <LineChart data={weightData} color="#f59e0b" unit="kg" height={220} />
              ) : (
                <EmptyChart message="No weight records available" />
              )}
            </div>

            {/* Body Measurements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Chest Measurements
                </h3>

                {chestData.length > 0 ? (
                  <LineChart data={chestData} color="#06b6d4" unit="cm" height={200} />
                ) : (
                  <EmptyChart message="No chest measurements recorded" />
                )}
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Waist Measurements
                </h3>

                {waistData.length > 0 ? (
                  <LineChart data={waistData} color="#10b981" unit="cm" height={200} />
                ) : (
                  <EmptyChart message="No waist measurements recorded" />
                )}
              </div>
            </div>

            {/* Running Progress */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-red-600" />
                  Running Progress
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Recorded running distance in kilometers
                </p>
              </div>

              {runningData.length > 0 ? (
                <LineChart data={runningData} color="#ef4444" unit="km" height={220} />
              ) : (
                <EmptyChart message="No running records available" />
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {!hasAnyRecords && (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
          <Target className="w-6 h-6 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Your analytics journey starts here
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add workouts, nutrition entries, or progress records to see your statistics and charts.
          </p>
        </div>
      )}

    </div>
  );
};
