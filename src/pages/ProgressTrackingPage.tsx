
import React, { useEffect, useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { LineChart } from '../components/charts/Charts';
import {
  TrendingUp,
  Plus,
  Trash2,
  Activity,
  Ruler,
  Save,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  createProgress,
  updateProgress,
  deleteProgress,
} from '../services/progressService';

type ToastType = 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
}

export const ProgressTrackingPage: React.FC = () => {
  const {
    progress,
    formatWeight,
    user,
    refreshNotifications,
    refreshProgress,
  } = useFitness();

  const [weight, setWeight] = useState<number>(76.0);
  const [chest, setChest] = useState<number>(104);
  const [waist, setWaist] = useState<number>(80.5);
  const [runTime5k, setRunTime5k] = useState<number>(22.1);
  const [runDistance, setRunDistance] = useState<number>(5);

  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    refreshProgress();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const getErrorMessage = (error: any) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Something went wrong. Please try again.'
    );
  };

  const resetForm = () => {
    setWeight(76.0);
    setChest(104);
    setWaist(80.5);
    setRunTime5k(22.1);
    setRunDistance(5);
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  const handleNewCheckIn = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setWeight(entry.weight);
    setChest(entry.measurements?.chest || 0);
    setWaist(entry.measurements?.waist || 0);
    setRunTime5k(entry.runTime5kMinutes || 0);
    setRunDistance(entry.runDistance || 5);
    setDate(entry.date ? entry.date.slice(0, 10) : '');
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const progressData = {
        weight: Number(weight),
        date,
        measurements: {
          chest: Number(chest),
          waist: Number(waist),
        },
        performanceMetrics: {
          runTime: Number(runTime5k),
          runDistance: Number(runDistance),
        },
      };

      if (editingId) {
        await updateProgress(editingId, progressData);
        showToast('Progress updated successfully!', 'success');
      } else {
        await createProgress(progressData);
        showToast('Progress recorded successfully!', 'success');
      }

      await refreshProgress();
      await refreshNotifications();

      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save progress:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      setIsDeleting(true);

      await deleteProgress(pendingDeleteId);

      await refreshProgress();
      await refreshNotifications();

      showToast('Progress entry deleted successfully!', 'success');

      if (editingId === pendingDeleteId) {
        setShowForm(false);
        resetForm();
      }

      setPendingDeleteId(null);
    } catch (error) {
      console.error('Failed to delete progress:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const chartData = [...progress]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({
      label: p.date.slice(5),
      value: p.weight,
      subtext: `${p.weight} kg`,
    }));

  return (
    <div className="space-y-6 pb-12">

      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-5 right-5 z-[120] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === 'success'
                ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}

            <span className="text-sm font-medium">{toast.message}</span>

            <button
              onClick={() => setToast(null)}
              className="ml-2 opacity-60 hover:opacity-100"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {pendingDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !isDeleting && setPendingDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>

                <button
                  onClick={() => setPendingDeleteId(null)}
                  disabled={isDeleting}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-50"
                  aria-label="Close confirmation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">
                Delete Progress Entry?
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Are you sure you want to delete this progress entry? This action
                cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Progress & Body Composition</span>
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log bodyweight, anatomical tape measurements, and running endurance benchmarks
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewCheckIn}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 dark:text-slate-950 dark:bg-amber-400 dark:hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Check-In</span>
        </motion.button>
      </div>

      {/* Progress Chart Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Weight Trajectory Over Time</span>
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive timeline graph synced across your Dashboard and Analytics
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              Target: {formatWeight(user.targetWeight)}
            </span>

            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Current: {formatWeight(progress[0]?.weight || 76)}
            </span>
          </div>
        </div>

        <LineChart data={chartData} color="#f59e0b" unit="kg" height={240} />
      </div>

      {/* Check-in Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-amber-200 dark:border-amber-500/30 shadow-md dark:shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-amber-600 dark:text-amber-400" />

                  <span>
                    {editingId
                      ? 'Update Body Metric Check-In'
                      : 'New Body Metric Check-In'}
                  </span>
                </h3>

                <span className="text-xs font-mono text-slate-500">
                  Record Date: {date}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Body Weight ({user.preferences.units === 'imperial' ? 'lbs' : 'kg'}) *
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="300"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      5K Run Time (Minutes)
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="90"
                      value={runTime5k}
                      onChange={(e) => setRunTime5k(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Running Distance (KM)
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={runDistance}
                      onChange={(e) => setRunDistance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Check-In Date *
                    </label>

                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Circumference Measurements */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Body Measurements ({user.preferences.units === 'imperial' ? 'Inches' : 'Centimeters'})
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        Chest
                      </label>

                      <input
                        type="number"
                        step="0.5"
                        value={chest}
                        onChange={(e) => setChest(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        Waist
                      </label>

                      <input
                        type="number"
                        step="0.5"
                        value={waist}
                        onChange={(e) => setWaist(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-lg bg-amber-600 text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-950 font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />

                    <span>
                      {isSaving
                        ? editingId
                          ? 'Updating...'
                          : 'Saving...'
                        : editingId
                          ? 'Update Check-In'
                          : 'Save Check-In'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historical Entries Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Check-In Historical Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Weight</th>
                <th className="py-3 px-3">Measurements (Chest / Waist)</th>
                <th className="py-3 px-3">Run Time</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {progress.map((entry: any, idx) => {
                const nextEntry = progress[idx + 1];

                const diff = nextEntry
                  ? (entry.weight - nextEntry.weight).toFixed(1)
                  : null;

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {entry.date}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {formatWeight(entry.weight)}
                      </span>

                      {diff && (
                        <span
                          className={`ml-2 text-[10px] ${
                            Number(diff) <= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {Number(diff) > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {entry.measurements?.chest || '-'}{' '}
                      <span className="text-slate-300 dark:text-slate-600">/</span>{' '}
                      {entry.measurements?.waist || '-'}
                    </td>

                    <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                      {entry.runTime5kMinutes
                        ? `${entry.runTime5kMinutes} min`
                        : 'N/A'}
                    </td>

                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {entry.runDistance
                        ? `${entry.runDistance} km`
                        : 'N/A'}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                          title="Edit Entry"
                          aria-label="Edit Entry"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setPendingDeleteId(entry.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete Entry"
                          aria-label="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {progress.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    No progress entries found. Log your first check-in to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
