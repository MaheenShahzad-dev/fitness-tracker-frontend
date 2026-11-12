
import React, { useState, useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import { WorkoutCategory, Workout } from '../types';
import { PRESET_EXERCISES } from '../data/mockData';
import {
  Dumbbell,
  Save,
  ArrowLeft,
  Sparkles,
  Calendar,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

import {
  createWorkout,
  updateWorkout,
  getWorkoutById
} from '../services/workoutService';

export const CreateEditWorkoutPage: React.FC = () => {

const {
  editingWorkoutId,
  workouts,
  navigate,
  user,
  refreshNotifications,
} = useFitness();

  const isEditing = Boolean(editingWorkoutId);

  const existingWorkout = workouts.find(
    (w) => String(w.id) === String(editingWorkoutId)
  );

  const [exerciseName, setExerciseName] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('Strength');
  const [sets, setSets] = useState<number>(4);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number>(60);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState<number>(300);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Load workout for editing
  useEffect(() => {

    const loadWorkout = async () => {

      if (!isEditing) return;

      try {
        setFetching(true);
        setError('');

        let workout: any = existingWorkout;

        if (!workout) {
          workout = await getWorkoutById(editingWorkoutId as string);
        }

        // Handle common API response formats
        workout = workout?.data ?? workout?.workout ?? workout;

        setExerciseName(workout.exerciseName ?? '');
        setCategory(workout.category ?? 'Strength');
        setSets(Number(workout.sets ?? 4));
        setReps(Number(workout.reps ?? 10));
        setWeight(Number(workout.weight ?? 60));
        setDurationMinutes(Number(workout.durationMinutes ?? 45));
        setDate(
          workout.date
            ? String(workout.date).split('T')[0]
            : new Date().toISOString().split('T')[0]
        );
        setNotes(workout.notes ?? '');
        setCaloriesBurned(Number(workout.caloriesBurned ?? 300));

      } catch (err: any) {

        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load workout.'
        );

      } finally {
        setFetching(false);
      }
    };

    loadWorkout();

  }, [isEditing, editingWorkoutId]);

  // Apply exercise preset
  const applyPreset = (preset: typeof PRESET_EXERCISES[0]) => {
    setExerciseName(preset.name);
    setCategory(preset.category as WorkoutCategory);
    setSets(preset.defaultSets);
    setReps(preset.defaultReps);
  };

  // Submit workout to backend
  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (loading) return;

    try {

      setLoading(true);
      setError('');

      const workoutData = {
        exerciseName: exerciseName.trim(),
        category,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        durationMinutes: Number(durationMinutes),
        date,
        notes: notes.trim(),
        caloriesBurned: Number(caloriesBurned),
      };

      if (!workoutData.exerciseName) {
        setError('Exercise name is required.');
        return;
      }

      if (isEditing) {

  await updateWorkout(
    editingWorkoutId as string,
    workoutData
  );

} else {

  await createWorkout(workoutData);

}

// Refresh Navbar notifications after successful workout operation
await refreshNotifications();

// Navigate after successful API response
navigate('workouts');

    } catch (err: any) {

      console.error('Workout API Error:', err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message ||
        'Something went wrong. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-sm text-slate-500">
          Loading workout...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">

        <button
          type="button"
          onClick={() => navigate('workouts')}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workout Registry
        </button>

        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
          {isEditing ? 'Editing Mode' : 'Create Mode'}
        </span>

      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6"
      >

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />

            {isEditing ? 'Edit Workout Session' : 'Log New Workout'}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill in the exercise details below.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Presets */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Quick Select Exercise Presets
          </div>

          <div className="flex flex-wrap gap-1.5">

            {PRESET_EXERCISES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded-md text-[11px] bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {p.name}
              </button>
            ))}

          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Exercise Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">

            <div className="sm:col-span-8">
              <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Exercise Name *
              </label>

              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. Barbell Back Squat"
                required
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Category *
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="HIIT">HIIT</option>
                <option value="Yoga">Yoga</option>
                <option value="Flexibility">Flexibility</option>
              </select>
            </div>

          </div>

          {/* Workout Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            {[
              {
                label: 'Sets *',
                value: sets,
                change: setSets,
                min: 1,
                max: 50
              },
              {
                label: 'Reps per Set *',
                value: reps,
                change: setReps,
                min: 1,
                max: 500
              },
              {
                label: `Weight (${user.preferences.units === 'imperial' ? 'lbs' : 'kg'})`,
                value: weight,
                change: setWeight,
                min: 0,
                max: 600
              },
              {
                label: 'Duration (min) *',
                value: durationMinutes,
                change: (value: number) => {
                  setDurationMinutes(value);
                  setCaloriesBurned(Math.round(value * 7.5));
                },
                min: 1,
                max: 300
              }
            ].map((field) => (

              <div key={field.label}>

                <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                  {field.label}
                </label>

                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.label.startsWith('Weight') ? 0.5 : 1}
                  value={field.value}
                  onChange={(e) => field.change(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />

              </div>

            ))}

          </div>

          {/* Date & Calories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Session Date *
              </label>

              <div className="relative">

                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />

              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Estimated Calories Burned (kcal)
              </label>

              <input
                type="number"
                min="0"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">
              Personal Notes & Form Observations
            </label>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter workout notes..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">

            <button
              type="button"
              onClick={() => navigate('workouts')}
              disabled={loading}
              className="px-4 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-950 dark:bg-emerald-400 rounded-lg flex items-center gap-1.5 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}

              <span>
                {loading
                  ? 'Please wait...'
                  : isEditing
                    ? 'Update Workout'
                    : 'Save Workout'}
              </span>

            </motion.button>

          </div>

        </form>

      </motion.div>

    </div>
  );
};
