import React, { useEffect, useState } from 'react';
import {
  Mail,
  Calendar,
  Flame,
  Edit3,
  Save,
  X,
  Target,
  TrendingUp,
  Weight,
  Activity,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useFitness } from '../context/FitnessContext';
import {
  getProfile,
  updateProfile,
  updateProfilePic,
  getProfileWorkouts,
  getProfileNutrition,
  getProfileProgress,
  createProfileProgress,
  updateProfileProgress,
  getProfileGoal,
  updateProfileGoal,
} from '../services/profileService';

export const UserProfilePage = () => {
    const { refreshProfile } = useFitness();
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [progress, setProgress] = useState([]);
  const [goal, setGoal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');

  const [weeklyWorkoutTarget, setWeeklyWorkoutTarget] = useState(5);

  const [progressForm, setProgressForm] = useState({
    weight: '',
    chest: '',
    waist: '',
    runTime: '',
    runDistance: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const [editingProgressId, setEditingProgressId] = useState(null);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      const [
        profileResponse,
        workoutResponse,
        nutritionResponse,
        progressResponse,
        goalResponse,
      ] = await Promise.all([
        getProfile(),
        getProfileWorkouts({ page: 1, limit: 100 }),
        getProfileNutrition({ page: 1, limit: 100 }),
        getProfileProgress({ page: 1, limit: 100 }),
        getProfileGoal(),
      ]);

      const profileData = profileResponse.user;
      const workoutData = workoutResponse.workouts || [];
      const nutritionData = nutritionResponse.nutrition || [];
      const progressData = progressResponse.progress || [];
      const goalData = goalResponse.goal;

      setUser(profileData);
      setName(profileData.name || '');
      setWorkouts(workoutData);
      setNutrition(nutritionData);
      setProgress(progressData);
      setGoal(goalData);
      setWeeklyWorkoutTarget(goalData?.weeklyWorkoutTarget || 5);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const totalVolume = workouts.reduce(
    (total, workout) =>
      total +
      (Number(workout.weight) > 0
        ? Number(workout.weight) * Number(workout.sets) * Number(workout.reps)
        : 0),
    0
  );

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const latestProgress = progress[0];

const handleProfileSave = async (e) => {
  e.preventDefault();

  if (!name.trim()) {
    toast.error('Please enter your name');
    return;
  }

  try {
    setSaving(true);

    const profileResponse = await updateProfile({
      name: name.trim(),
    });

    let updatedUser = profileResponse.user || {
      ...user,
      name: name.trim(),
    };

    if (profileFile) {
      const formData = new FormData();
      formData.append('profilePic', profileFile);

      const imageResponse = await updateProfilePic(formData);

      updatedUser = imageResponse.user || updatedUser;
    }

    // Update the Profile page
    setUser(updatedUser);

    // Refresh the Navbar separately
    try {
      await refreshProfile();
    } catch (refreshError) {
      console.error('Profile refresh error:', refreshError);
    }

    setIsEditing(false);
    setProfileFile(null);
    setProfilePreview('');

    toast.success('Profile updated successfully');

  } catch (error) {
    console.error('Profile save error:', error);
    console.error('Server response:', error.response?.data);

    toast.error(
      error.response?.data?.message || 'Unable to update profile'
    );
  } finally {
    setSaving(false);
  }
};

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5 MB');
      return;
    }

    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleGoalSave = async (e) => {
    e.preventDefault();

    const target = Number(weeklyWorkoutTarget);

    if (!Number.isInteger(target) || target < 1) {
      toast.error('Weekly target must be at least 1 workout');
      return;
    }

    try {
      setSaving(true);

      const response = await updateProfileGoal({
        weeklyWorkoutTarget: target,
      });

      setGoal(response.goal);
      setIsEditingGoal(false);
      toast.success('Weekly goal updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update goal');
    } finally {
      setSaving(false);
    }
  };

  const openProgressModal = (record = null) => {
    if (record) {
      setEditingProgressId(record._id);

      setProgressForm({
        weight: record.weight ?? '',
        chest: record.measurements?.chest ?? '',
        waist: record.measurements?.waist ?? '',
        runTime: record.performanceMetrics?.runTime ?? '',
        runDistance: record.performanceMetrics?.runDistance ?? '',
        date: record.date
          ? new Date(record.date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      });
    } else {
      setEditingProgressId(null);

      setProgressForm({
        weight: '',
        chest: '',
        waist: '',
        runTime: '',
        runDistance: '',
        date: new Date().toISOString().slice(0, 10),
      });
    }

    setIsEditingProgress(true);
  };

  const handleProgressChange = (e) => {
    const { name, value } = e.target;

    setProgressForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProgressSave = async (e) => {
    e.preventDefault();

    const data = {
      date: progressForm.date,
    };

    if (progressForm.weight !== '') {
      data.weight = Number(progressForm.weight);
    }

    const measurements = {};

    if (progressForm.chest !== '') {
      measurements.chest = Number(progressForm.chest);
    }

    if (progressForm.waist !== '') {
      measurements.waist = Number(progressForm.waist);
    }

    if (Object.keys(measurements).length > 0) {
      data.measurements = measurements;
    }

    const performanceMetrics = {};

    if (progressForm.runTime !== '') {
      performanceMetrics.runTime = Number(progressForm.runTime);
    }

    if (progressForm.runDistance !== '') {
      performanceMetrics.runDistance = Number(progressForm.runDistance);
    }

    if (Object.keys(performanceMetrics).length > 0) {
      data.performanceMetrics = performanceMetrics;
    }

    if (Object.keys(data).length === 1) {
      toast.error('Please enter at least one progress value');
      return;
    }

    try {
      setSaving(true);

      if (editingProgressId) {
        await updateProfileProgress(editingProgressId, data);
        toast.success('Progress updated successfully');
      } else {
        await createProfileProgress(data);
        toast.success('Progress added successfully');
      }

      setIsEditingProgress(false);

      const response = await getProfileProgress({ page: 1, limit: 100 });
      setProgress(response.progress || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save progress');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-sm text-slate-500 dark:text-slate-400">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-sm text-slate-500 dark:text-slate-400">
        Unable to load your profile.
      </div>
    );
  }

  const avatar = profilePreview || user.profilePic;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with Ring */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-full border-2 border-emerald-500 shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-emerald-600">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-950 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 fill-current" />
              <span>Fitness Member</span>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {user.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user.email}
                  </span>

                  <span>·</span>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setName(user.name || '');
                  setProfileFile(null);
                  setProfilePreview('');
                  setIsEditing(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 self-center sm:self-start shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Edit Profile</span>
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-3">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 font-medium">
                Weekly Goal: {goal?.weeklyWorkoutTarget || 5} Workouts
              </span>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-50 dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-slate-700 font-medium">
                Weight Unit: {user.settings?.weightUnit || 'kg'}
              </span>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700 font-medium">
                Distance Unit: {user.settings?.distanceUnit || 'km'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Edit Fitness Profile</span>
                </h3>

                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Email address cannot be changed here.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 file:mr-3 file:border-0 file:bg-emerald-50 file:text-emerald-700 file:px-3 file:py-1 file:rounded-md"
                  />

                  {profilePreview && (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="mt-3 w-16 h-16 rounded-full object-cover border border-emerald-500"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950 font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aggregate Lifetime Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total Workouts
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {workouts.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Recorded sessions
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total Volume Lifted
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {(totalVolume / 1000).toFixed(1)}k{' '}
            <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Cumulative tonnage
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Food Entries Tracked
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
            {nutrition.length}
          </div>
          <div className="text-[11px] text-slate-500">Meals cataloged</div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Progress Check-Ins
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {progress.length}
          </div>
          <div className="text-[11px] text-slate-500">Bodyweight logs</div>
        </div>
      </div>

      {/* Weekly Goal and Recent Progress */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Weekly Workout Goal</span>
          </h3>

          <button
            onClick={() => {
              setWeeklyWorkoutTarget(goal?.weeklyWorkoutTarget || 5);
              setIsEditingGoal(true);
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Edit Goal
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Your weekly target
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {goal?.weeklyWorkoutTarget || 5}
              <span className="text-sm font-normal text-slate-500 ml-2">
                workouts
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Set a weekly workout target to track your consistency.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Latest recorded weight
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {latestProgress?.weight != null
                ? `${latestProgress.weight} ${user.settings?.weightUnit || 'kg'}`
                : 'Not recorded'}
            </div>
            <p className="text-[11px] text-slate-500">
              {latestProgress?.date
                ? new Date(latestProgress.date).toLocaleDateString()
                : 'Add a progress check-in to record your weight.'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Recent Progress
            </h4>

            <button
              onClick={() => openProgressModal()}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Progress
            </button>
          </div>

          {progress.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-700">
              <Activity className="w-7 h-7 mx-auto mb-2 text-slate-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No progress records yet.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Add your first check-in to start tracking your progress.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.slice(0, 5).map((record) => (
                <div
                  key={record._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Weight className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {record.weight != null
                          ? `${record.weight} ${user.settings?.weightUnit || 'kg'}`
                          : 'Progress check-in'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {record.date
                          ? new Date(record.date).toLocaleDateString()
                          : 'Date unavailable'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    {record.measurements?.chest != null && (
                      <span>Chest: {record.measurements.chest}</span>
                    )}

                    {record.measurements?.waist != null && (
                      <span>Waist: {record.measurements.waist}</span>
                    )}

                    {record.performanceMetrics?.runDistance != null && (
                      <span>
                        Run: {record.performanceMetrics.runDistance}{' '}
                        {user.settings?.distanceUnit || 'km'}
                      </span>
                    )}

                    <button
                      onClick={() => openProgressModal(record)}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Weekly Goal Modal */}
      <AnimatePresence>
        {isEditingGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Weekly Goal
                </h3>

                <button onClick={() => setIsEditingGoal(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleGoalSave} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Workouts per week
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={weeklyWorkoutTarget}
                    onChange={(e) => setWeeklyWorkoutTarget(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingGoal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950 font-semibold disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Progress Modal */}
      <AnimatePresence>
        {isEditingProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg my-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingProgressId ? 'Edit Progress' : 'Add Progress'}
                </h3>

                <button onClick={() => setIsEditingProgress(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleProgressSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={progressForm.date}
                    onChange={handleProgressChange}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Weight ({user.settings?.weightUnit || 'kg'})
                    </label>
                    <input
                      type="number"
                      name="weight"
                      min="0"
                      step="0.1"
                      value={progressForm.weight}
                      onChange={handleProgressChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Chest Measurement
                    </label>
                    <input
                      type="number"
                      name="chest"
                      min="0"
                      step="0.1"
                      value={progressForm.chest}
                      onChange={handleProgressChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Waist Measurement
                    </label>
                    <input
                      type="number"
                      name="waist"
                      min="0"
                      step="0.1"
                      value={progressForm.waist}
                      onChange={handleProgressChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Run Distance ({user.settings?.distanceUnit || 'km'})
                    </label>
                    <input
                      type="number"
                      name="runDistance"
                      min="0"
                      step="0.1"
                      value={progressForm.runDistance}
                      onChange={handleProgressChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Run Time (seconds)
                    </label>
                    <input
                      type="number"
                      name="runTime"
                      min="0"
                      value={progressForm.runTime}
                      onChange={handleProgressChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingProgress(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950 font-semibold disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Progress'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};