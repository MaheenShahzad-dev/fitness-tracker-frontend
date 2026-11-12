
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFitness } from '../context/FitnessContext';
import { WorkoutCategory } from '../types';
import { deleteWorkout as deleteWorkoutApi } from '../services/workoutService';

import {
  Dumbbell,
  Plus,
  Search,
  Trash2,
  Edit3,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  CalendarDays,
  Activity,
  Repeat,
  Scale,
  X,
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import apiConfig from '../config/apiConfig';

interface WorkoutItem {
  id: string;
  _id?: string;
  exerciseName: string;
  category: WorkoutCategory;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  date: string;
}

type SortOption =
  | 'date_desc'
  | 'date_asc'
  | 'weight_desc'
  | 'reps_desc';

export const WorkoutListPage: React.FC = () => {
const { navigate, formatWeight, refreshNotifications } = useFitness();

  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [confirmWorkout, setConfirmWorkout] =
    useState<WorkoutItem | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [currentPageNum, setCurrentPageNum] = useState(1);

  const itemsPerPage = 4;

  const categories = [
    'All',
    'Strength',
    'Cardio',
    'HIIT',
    'Yoga',
    'Flexibility',
  ];

  // FETCH WORKOUTS
  const fetchWorkouts = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please login again. Authentication token missing.');
      }

      const response = await apiConfig.get('/workouts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const records =
        response.data?.workouts ||
        response.data?.data?.workouts ||
        [];

      const formattedWorkouts: WorkoutItem[] = records.map((w: any) => ({
        ...w,
        id: String(w._id || w.id || ''),
        _id: w._id ? String(w._id) : undefined,
        exerciseName: w.exerciseName || 'Unnamed Exercise',
        category: w.category || 'Strength',
        sets: Number(w.sets) || 0,
        reps: Number(w.reps) || 0,
        weight: Number(w.weight) || 0,
        notes: w.notes || '',
        date: w.date || w.createdAt || new Date().toISOString(),
      }));

      setWorkouts(formattedWorkouts);

      if (showToast) {
        toast.success('Workouts refreshed successfully!');
      }
    } catch (error: any) {
      console.error('Fetch workouts error:', error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load workouts.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // OPEN DELETE MODAL
  const confirmDelete = (workout: WorkoutItem) => {
    setConfirmWorkout(workout);
  };

  // DELETE WORKOUT
  const handleDelete = async () => {
    if (!confirmWorkout) return;

    const id = String(confirmWorkout._id || confirmWorkout.id || '');

    if (!id || id === 'undefined' || id === 'null') {
      toast.error('Invalid workout ID.');
      return;
    }

    if (deletingId !== null) return;

    setDeletingId(id);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please login again.');
      }

    const response = await deleteWorkoutApi(id);

setWorkouts((prev) =>
  prev.filter(
    (item) => String(item._id || item.id) !== id
  )
);

setConfirmWorkout(null);

await refreshNotifications();

toast.success(
  response?.message || 'Workout deleted successfully!'
);
    } catch (error: any) {
      console.error('DELETE API ERROR:', error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Could not delete workout.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // EDIT WORKOUT
  const handleEdit = (workout: WorkoutItem) => {
    navigate('create-workout', {
      editingWorkoutId: workout._id || workout.id,
    });
  };

  // FILTER AND SORT
  const filteredWorkouts = useMemo(() => {
    return workouts
      .filter((w) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          w.category === selectedCategory;

        const search = searchQuery.toLowerCase().trim();

        const matchesSearch =
          w.exerciseName.toLowerCase().includes(search) ||
          w.notes.toLowerCase().includes(search);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (sortBy === 'date_desc') return dateB - dateA;
        if (sortBy === 'date_asc') return dateA - dateB;
        if (sortBy === 'weight_desc') return b.weight - a.weight;

        if (sortBy === 'reps_desc') {
          return (b.sets * b.reps) - (a.sets * a.reps);
        }

        return 0;
      });
  }, [workouts, selectedCategory, searchQuery, sortBy]);

  // PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWorkouts.length / itemsPerPage)
  );

  const paginatedWorkouts = useMemo(() => {
    const start = (currentPageNum - 1) * itemsPerPage;

    return filteredWorkouts.slice(start, start + itemsPerPage);
  }, [filteredWorkouts, currentPageNum]);

  useEffect(() => {
    if (currentPageNum > totalPages) {
      setCurrentPageNum(totalPages);
    }
  }, [currentPageNum, totalPages]);

  // STATISTICS
  const totalSets = workouts.reduce(
    (sum, w) => sum + w.sets,
    0
  );

  const totalReps = workouts.reduce(
    (sum, w) => sum + (w.sets * w.reps),
    0
  );

  const weightedWorkouts = workouts.filter(
    (w) => w.weight > 0
  ).length;

  // LOADING
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />

        <p className="text-sm text-slate-500">
          Loading your workouts...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Dumbbell className="w-6 h-6 text-emerald-500" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Workout Registry
            </h1>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Manage and track all your workout sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchWorkouts(true)}
            disabled={isLoading}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-500 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate('create-workout')}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Workout
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Total Workouts</p>
            <Dumbbell className="w-5 h-5 text-emerald-500" />
          </div>

          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {workouts.length}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Total Sets</p>
            <LayersIcon />
          </div>

          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {totalSets.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Total Reps</p>
            <Repeat className="w-5 h-5 text-cyan-500" />
          </div>

          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {totalReps.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Weighted Exercises</p>
            <Scale className="w-5 h-5 text-violet-500" />
          </div>

          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {weightedWorkouts}
          </p>
        </div>

      </div>

      {/* FILTERS */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPageNum(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPageNum(1);
              }}
              placeholder="Search workouts..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setCurrentPageNum(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white outline-none focus:border-emerald-500"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="weight_desc">Highest Weight</option>
              <option value="reps_desc">Most Reps</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Your Workouts
        </h2>

        <span className="text-xs text-slate-500">
          {filteredWorkouts.length} results
        </span>
      </div>

      {/* WORKOUT LIST */}
      {paginatedWorkouts.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-emerald-500" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-5">
            {workouts.length === 0 ? 'No Workouts Yet' : 'No Workouts Found'}
          </h3>

          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            {workouts.length === 0
              ? 'Start tracking your fitness journey by adding your first workout.'
              : 'Try changing your search or category filters.'}
          </p>

          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setCurrentPageNum(1);
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm"
            >
              Clear Filters
            </button>

            {workouts.length === 0 && (
              <button
                type="button"
                onClick={() => navigate('create-workout')}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
              >
                Add Workout
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {paginatedWorkouts.map((workout) => (
              <motion.div
                key={workout.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm transition-colors"
              >
                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {workout.exerciseName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(workout.date).toLocaleDateString()}
                      </span>

                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {workout.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(workout)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10"
                      title="Edit Workout"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => confirmDelete(workout)}
                      disabled={deletingId !== null}
                      className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 disabled:opacity-40"
                      title="Delete Workout"
                    >
                      {deletingId === workout.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* WORKOUT DETAILS */}
                <div className="grid grid-cols-3 gap-3 mt-5">

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">
                      Sets
                    </p>

                    <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {workout.sets}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">
                      Reps
                    </p>

                    <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {workout.reps}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">
                      Weight
                    </p>

                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                      {workout.weight > 0
                        ? formatWeight(workout.weight)
                        : 'Bodyweight'}
                    </p>
                  </div>

                </div>

                {/* TOTAL REPS */}
                <div className="flex items-center gap-2 mt-4 text-xs text-cyan-600 dark:text-cyan-400">
                  <Repeat className="w-4 h-4" />

                  <span className="font-semibold">
                    {workout.sets * workout.reps} total reps
                  </span>
                </div>

                {workout.notes && (
                  <p className="mt-4 p-3 rounded-lg text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 line-clamp-3">
                    {workout.notes}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* PAGINATION */}
      {filteredWorkouts.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">

          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {(currentPageNum - 1) * itemsPerPage + 1}
              {' - '}
              {Math.min(currentPageNum * itemsPerPage, filteredWorkouts.length)}
            </span>
            {' '}of{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {filteredWorkouts.length}
            </span>
            {' '}workouts
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
              disabled={currentPageNum === 1}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2">
              Page {currentPageNum} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageNum === totalPages}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmWorkout && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              zIndex: 999999,
              backgroundColor: 'rgba(0,0,0,0.70)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget && deletingId === null) {
                setConfirmWorkout(null);
              }
            }}
          >
            <motion.div
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-rose-600" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Delete Workout?
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={deletingId !== null}
                  onClick={() => setConfirmWorkout(null)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-7">
                Are you sure you want to delete{' '}
                <strong className="text-slate-900 dark:text-white">
                  {confirmWorkout.exerciseName}
                </strong>
                ?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={deletingId !== null}
                  onClick={() => setConfirmWorkout(null)}
                  className="px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deletingId !== null}
                  onClick={handleDelete}
                  className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {deletingId !== null ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const LayersIcon = () => (
  <Activity className="w-5 h-5 text-cyan-500" />
);
