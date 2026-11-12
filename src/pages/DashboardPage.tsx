import React, { useEffect, useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { LineChart, DonutChart } from '../components/charts/Charts';
import { getDashboard } from '../services/dashboardService';
import { getProfileGoal } from '../services/profileService';
import {
  Flame, Dumbbell, Utensils, TrendingUp, Plus, ArrowRight, Droplets, Calendar, Award, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

export const DashboardPage: React.FC = () => {
  const {
    user,
    waterGlassesToday,
    logWater,
    navigate,
    formatWeight,
  } = useFitness();

  const [dbData, setDbData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyWorkoutTarget, setWeeklyWorkoutTarget] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const res = await getDashboard();
        const goalRes = await getProfileGoal();

if (goalRes?.goal) {
  setWeeklyWorkoutTarget(goalRes.goal.weeklyWorkoutTarget);
}
        console.log('[DASHBOARD] Raw response from backend:', res);

        // ✅ SMART CHECK: Agar response direct dashboard hai, ya status ke andar hai
        if (res?.dashboard) {
          setDbData(res.dashboard);
        } else if (res?.status === 'success' && res?.dashboard) {
          setDbData(res.dashboard);
        } else if (res?.recentWorkouts || res?.todayNutrition) {
          // Agar backend seedha data bhej raha hai bina wrapper ke
          setDbData(res);
        } else {
          setError('Invalid data format received from server.');
        }
      } catch (err: any) {
        console.error('[DASHBOARD] Error:', err);
        
        // ✅ 401 Unauthorized ka matlab token expire ho gaya hai
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('login');
          return;
        }

        setError(err.response?.data?.message || err.message || 'Could not connect to the database.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-sm font-medium">Fetching data from database...</p>
      </div>
    );
  }

  // Error State (With Console hint)
  if (error || !dbData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500 px-4">
        <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-400 mb-4 text-sm max-w-md text-center space-y-2">
          <p className="font-semibold">⚠️ {error || 'No data found.'}</p>
          <p className="text-xs opacity-80">Check the browser console (F12) to see exactly what the backend returned.</p>
        </div>
        <button onClick={() => window.location.reload()} className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-lg transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  // --- Data Extraction (Safe fallback to 0/empty arrays) ---
  const displayWorkouts = dbData?.recentWorkouts || [];
  const totalCaloriesToday = dbData?.todayNutrition?.calories || 0;
  const totalProteinToday = dbData?.todayNutrition?.protein || 0;
  const totalCarbsToday = dbData?.todayNutrition?.carbs || 0;
  const totalFatToday = dbData?.todayNutrition?.fat || 0;
  
  const latestWeight = dbData?.latestWeight || 0;
  const weightData = dbData?.weightHistory?.map((p: any) => ({
    label: new Date(p.date).toISOString().slice(5, 10),
    value: p.weight,
    subtext: `${p.weight} kg`
  })) || [];

  const prevWeight = weightData.length > 1 ? weightData[weightData.length - 2].value : latestWeight;
  const weightDiff = (latestWeight - prevWeight).toFixed(1);

  const weeklyTotal = dbData?.weeklyWorkoutSummary?.total || 0;
  const unreadCount = dbData?.unreadNotifications || 0;
const weightChange = Number(weightDiff);
  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-emerald-500/20 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-slate-600 dark:text-slate-400">Unread Alerts: {unreadCount}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || 'Athlete'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Here is your live database summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('create-workout')} className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-950 dark:bg-emerald-400 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /><span>Log Workout</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('add-nutrition')} className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Utensils className="w-3.5 h-3.5 text-cyan-600" /><span>Add Food</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Calories Today</span>
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Flame className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalCaloriesToday} <span className="text-xs font-normal text-slate-400">/ {user?.targetCalories || 2450} kcal</span>
          </div>
        </div>

        {/* Workouts */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Weekly Workouts</span>
            <div className="w-7 h-7 rounded-md bg-cyan-500/10 text-cyan-600 flex items-center justify-center"><Dumbbell className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
{weeklyTotal} <span className="text-xs font-normal text-slate-400">/ {weeklyWorkoutTarget} sessions</span>          </div>
        </div>

        {/* Weight */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Current Weight</span>
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {latestWeight > 0 ? formatWeight(latestWeight) : 'N/A'}
          </div>
        </div>

    {/* Weight Change */}
<div className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-slate-500">Weight Change</span>
    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
      weightChange < 0
        ? 'bg-emerald-500/10 text-emerald-600'
        : weightChange > 0
        ? 'bg-amber-500/10 text-amber-600'
        : 'bg-slate-500/10 text-slate-500'
    }`}>
      <TrendingUp className="w-4 h-4" />
    </div>
  </div>

  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
    {weightData.length > 1
      ? `${weightChange > 0 ? '+' : ''}${weightDiff} kg`
      : 'N/A'}
  </div>

  <p className="text-xs text-slate-400">
    Compared with previous record
  </p>
</div>
      </div>

      {/* Charts & Workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-600" /><span>Recent Workouts (DB)</span>
            </h3>
            {displayWorkouts.length === 0 ? (
               <p className="text-sm text-slate-500 text-center py-4">No recent workouts found in DB.</p>
            ) : (
              <div className="space-y-3">
                {displayWorkouts.map((workout: any) => (
                  <div key={workout._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{workout.exerciseName}</h4>
                      <p className="text-xs text-slate-500 mt-1">{workout.sets} sets × {workout.reps} reps</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{new Date(workout.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /><span>Weight Progression (DB)</span>
            </h3>
            {weightData.length > 0 ? <LineChart data={weightData} unit="kg" height={190} /> : <p className="text-sm text-slate-500 text-center">No weight history found.</p>}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-cyan-600" /><span>Nutrition (DB)</span>
            </h3>
            <DonutChart protein={totalProteinToday} carbs={totalCarbsToday} fat={totalFatToday} totalCalories={totalCaloriesToday} />
          </div>
        </div>
      </div>
    </div>
  );
};