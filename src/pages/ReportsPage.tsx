
import React, { useEffect,  useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import apiConfig from '../config/apiConfig';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Dumbbell,
  Utensils,
  Scale,
  RefreshCw,
  AlertCircle,
  Activity,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'motion/react';

type DateRange = '7days' | '30days' | 'all';

interface WorkoutRecord {
  _id: string;
  exerciseName: string;
  category: 'Strength' | 'Cardio';
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
  date: string;
}

interface NutritionRecord {
  _id: string;
  foodItem: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  date: string;
}

interface ProgressRecord {
  _id: string;
  weight?: number | null;
  date: string;
  measurements?: {
    chest?: number | null;
    waist?: number | null;
  };
  performanceMetrics?: {
    runTime?: number | null;
    runDistance?: number | null;
  };
}

interface ReportResponse {
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
    workoutsByDate: {
      date: string;
      totalWorkouts: number;
      strengthWorkouts: number;
      cardioWorkouts: number;
    }[];
    nutritionByDate: {
      date: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[];
    weightProgress: {
      date: string;
      weight: number;
    }[];
    bodyMeasurements: {
      date: string;
      chest: number | null;
      waist: number | null;
    }[];
    runningProgress: {
      date: string;
      runTime: number | null;
      runDistance: number | null;
    }[];
  };
  records: {
    workouts: WorkoutRecord[];
    nutrition: NutritionRecord[];
    progress: ProgressRecord[];
  };
}

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDate = (date: string) => {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '—';

  return parsedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return '0';
  }

  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
};

const escapeCSV = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const getDateFilters = (range: DateRange) => {
  if (range === 'all') return {};

  const today = new Date();
  const start = new Date(today);

  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - (range === '7days' ? 6 : 29));

  return {
    startDate: getLocalDateString(start),
    endDate: getLocalDateString(today),
  };
};

export const ReportsPage: React.FC = () => {
  const { user, formatWeight, showToast } = useFitness();

  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async (range: DateRange) => {
    try {
      setLoading(true);
      setError('');

      const params = getDateFilters(range);
      const token = localStorage.getItem('token');

      const response = await apiConfig.get('/reports', {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.status !== 'success') {
        throw new Error('Unable to load your report data.');
      }

      setReport(response.data);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong while loading reports.';

      setError(message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(dateRange);
  }, [dateRange]);

  const workouts = report?.records.workouts || [];
  const nutrition = report?.records.nutrition || [];
  const progress = report?.records.progress || [];
  const summary = report?.summary;

  const hasRecords =
    workouts.length > 0 || nutrition.length > 0 || progress.length > 0;

  

  const weightChange = summary?.weightChange ?? null;

  const weightChangeText =
    weightChange === null
      ? '—'
      : `${weightChange > 0 ? '+' : ''}${formatNumber(weightChange)} kg`;

  const handleExportCSV = () => {
    if (!report || !hasRecords) {
      showToast('There is no report data to export.', 'info');
      return;
    }

    const lines: string[] = [];

    lines.push('PULSEFIT FITNESS REPORT');
    lines.push(`Generated For,${escapeCSV(user?.name || 'User')}`);
    lines.push(`Email,${escapeCSV(user?.email || '')}`);
    lines.push(`Generated Date,${escapeCSV(new Date().toLocaleDateString())}`);
    lines.push(`Report Period,${escapeCSV(dateRange === 'all' ? 'All Time' : dateRange === '7days' ? 'Last 7 Days' : 'Last 30 Days')}`);
    lines.push('');

    lines.push('REPORT SUMMARY');
    lines.push('Metric,Value');
    lines.push(`Total Workouts,${summary?.totalWorkouts ?? 0}`);
    lines.push(`Strength Workouts,${summary?.strengthWorkouts ?? 0}`);
    lines.push(`Cardio Workouts,${summary?.cardioWorkouts ?? 0}`);
    lines.push(`Nutrition Entries,${summary?.totalNutritionEntries ?? 0}`);
    lines.push(`Calories Consumed (kcal),${summary?.totalCaloriesConsumed ?? 0}`);
    lines.push(`Average Daily Calories (kcal),${summary?.averageDailyCalories ?? 0}`);
    lines.push(`Protein (g),${summary?.totalProtein ?? 0}`);
    lines.push(`Carbohydrates (g),${summary?.totalCarbs ?? 0}`);
    lines.push(`Fat (g),${summary?.totalFat ?? 0}`);
    lines.push(`Weight Change (kg),${weightChange ?? 'Not available'}`);
    lines.push('');

    lines.push('WORKOUT RECORDS');
    lines.push('ID,Date,Exercise,Category,Sets,Reps,Weight (kg),Notes');

    workouts.forEach((item) => {
      lines.push([
        escapeCSV(item._id),
        escapeCSV(formatDate(item.date)),
        escapeCSV(item.exerciseName),
        escapeCSV(item.category),
        item.sets,
        item.reps,
        item.weight,
        escapeCSV(item.notes || ''),
      ].join(','));
    });

    lines.push('');
    lines.push('NUTRITION RECORDS');
    lines.push('ID,Date,Meal Type,Food Item,Quantity,Calories (kcal),Protein (g),Carbs (g),Fat (g)');

    nutrition.forEach((item) => {
      lines.push([
        escapeCSV(item._id),
        escapeCSV(formatDate(item.date)),
        escapeCSV(item.mealType),
        escapeCSV(item.foodItem),
        item.quantity,
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
      ].join(','));
    });

    lines.push('');
    lines.push('PROGRESS RECORDS');
    lines.push('ID,Date,Weight (kg),Chest (cm),Waist (cm),Run Time (seconds),Run Distance (km)');

    progress.forEach((item) => {
      lines.push([
        escapeCSV(item._id),
        escapeCSV(formatDate(item.date)),
        item.weight ?? '',
        item.measurements?.chest ?? '',
        item.measurements?.waist ?? '',
        item.performanceMetrics?.runTime ?? '',
        item.performanceMetrics?.runDistance ?? '',
      ].join(','));
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const safeName = (user?.name || 'User')
      .trim()
      .replace(/[^a-z0-9_-]/gi, '_');

    link.href = url;
    link.download = `PulseFit_Report_${safeName}_${getLocalDateString(new Date())}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast('CSV report downloaded successfully.', 'success');
  };

  const handleExportPDF = () => {
    if (!report || !hasRecords) {
      showToast('There is no report data to print.', 'info');
      return;
    }

    window.print();
  };

  const handleRetry = () => {
    fetchReports(dateRange);
  };

  const getWeightDisplay = (weight: number) => {
    return typeof formatWeight === 'function'
      ? formatWeight(weight)
      : `${weight} kg`;
  };

  if (loading && !report) {
    return (
      <div className="space-y-6 pb-10">
        <div className="animate-pulse space-y-2">
          <div className="h-7 w-48 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-72 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse"
            />
          ))}
        </div>

        <div className="h-72 rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Unable to load reports
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {error}
          </p>

          <button
            onClick={handleRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reports
            </h1>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and export your workout, nutrition, and progress records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={!hasRecords || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Printer className="w-4 h-4" />
            Export PDF
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!hasRecords || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">Report period</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            ['7days', 'Last 7 Days'],
            ['30days', 'Last 30 Days'],
            ['all', 'All Time'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDateRange(value)}
              disabled={loading}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${
                dateRange === value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && report && (
        <div className="no-print text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Updating report...
        </div>
      )}

      {error && report && (
        <div className="no-print rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          The latest report could not be refreshed. Showing the previously loaded data.
          <button onClick={handleRetry} className="ml-2 underline font-semibold">
            Retry
          </button>
        </div>
      )}

      <div className="report-document space-y-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
              PulseFit Fitness Report
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Fitness Activity Summary
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Prepared for{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.name || 'User'}
              </span>
              {user?.email ? ` · ${user.email}` : ''}
            </p>
          </div>

          <div className="text-sm sm:text-right text-slate-500 dark:text-slate-400">
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p>
              Period:{' '}
              {dateRange === 'all'
                ? 'All Time'
                : dateRange === '7days'
                  ? 'Last 7 Days'
                  : 'Last 30 Days'}
            </p>
          </div>
        </div>

        {!hasRecords ? (
          <div className="py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-4">
              No records for this period
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try another date range or start adding workouts, nutrition entries, and progress records.
            </p>

            <button
              onClick={() => setDateRange('all')}
              className="no-print mt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all-time records
            </button>
          </div>
        ) : (
          <>
            <section>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Report Overview
              </h3>

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  {
                    title: 'Workouts',
                    value: formatNumber(summary?.totalWorkouts),
                    detail: `${summary?.strengthWorkouts ?? 0} strength · ${summary?.cardioWorkouts ?? 0} cardio`,
                    icon: Dumbbell,
                    color: 'text-emerald-600 dark:text-emerald-400',
                  },
                {
  title: 'Progress Records',
  value: formatNumber(progress.length),
  detail: 'Total progress check-ins',
  icon: Scale,
  color: 'text-violet-600 dark:text-violet-400',
},
                  {
                    title: 'Calories Consumed',
                    value: formatNumber(summary?.totalCaloriesConsumed),
                    detail: `${formatNumber(summary?.averageDailyCalories)} daily average`,
                    icon: Utensils,
                    color: 'text-amber-600 dark:text-amber-400',
                  },
                  {
                    title: 'Weight Change',
                    value: weightChangeText,
                    detail:
                      summary?.firstWeight != null && summary?.latestWeight != null
                        ? `${formatNumber(summary.firstWeight)} kg → ${formatNumber(summary.latestWeight)} kg`
                        : 'Not enough weight records',
                    icon: Scale,
                    color: 'text-violet-600 dark:text-violet-400',
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {item.title}
                        </span>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>

                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-3 break-words">
                        {item.value}
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {item.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-slate-200 dark:border-slate-800 pt-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Workout Records
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {workouts.length} records
                </span>
              </div>

              {workouts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-5 text-center">
                  No workouts recorded during this period.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        <th className="py-3 px-2 font-medium">Date</th>
                        <th className="py-3 px-2 font-medium">Exercise</th>
                        <th className="py-3 px-2 font-medium">Category</th>
                        <th className="py-3 px-2 font-medium">Sets × Reps</th>
                        <th className="py-3 px-2 font-medium">Weight</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {workouts.map((item) => (
                        <tr key={item._id}>
                          <td className="py-3 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(item.date)}
                          </td>
                          <td className="py-3 px-2 font-medium text-slate-900 dark:text-white">
                            {item.exerciseName}
                          </td>
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                            {item.category}
                          </td>
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                            {item.sets} × {item.reps}
                          </td>
                          <td className="py-3 px-2 text-emerald-700 dark:text-emerald-400 font-medium">
                            {getWeightDisplay(item.weight)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="border-t border-slate-200 dark:border-slate-800 pt-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Utensils className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Nutrition Records
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {nutrition.length} records
                </span>
              </div>

              {nutrition.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-5 text-center">
                  No nutrition records during this period.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        <th className="py-3 px-2 font-medium">Date</th>
                        <th className="py-3 px-2 font-medium">Meal</th>
                        <th className="py-3 px-2 font-medium">Food</th>
                        <th className="py-3 px-2 font-medium">Quantity</th>
                        <th className="py-3 px-2 font-medium">Calories</th>
                        <th className="py-3 px-2 font-medium">Protein / Carbs / Fat</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {nutrition.map((item) => (
                        <tr key={item._id}>
                          <td className="py-3 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(item.date)}
                          </td>
                          <td className="py-3 px-2 text-cyan-700 dark:text-cyan-400 font-medium">
                            {item.mealType}
                          </td>
                          <td className="py-3 px-2 font-medium text-slate-900 dark:text-white">
                            {item.foodItem}
                          </td>
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                            {formatNumber(item.quantity)}
                          </td>
                          <td className="py-3 px-2 text-slate-700 dark:text-slate-200">
                            {formatNumber(item.calories)} kcal
                          </td>
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {formatNumber(item.protein)}g / {formatNumber(item.carbs)}g / {formatNumber(item.fat)}g
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="border-t border-slate-200 dark:border-slate-800 pt-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Scale className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Progress Records
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {progress.length} records
                </span>
              </div>

              {progress.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-5 text-center">
                  No progress records during this period.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        <th className="py-3 px-2 font-medium">Date</th>
                        <th className="py-3 px-2 font-medium">Weight</th>
                        <th className="py-3 px-2 font-medium">Chest</th>
                        <th className="py-3 px-2 font-medium">Waist</th>
                        <th className="py-3 px-2 font-medium">Run Time</th>
                        <th className="py-3 px-2 font-medium">Run Distance</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {progress.map((item) => (
                        <tr key={item._id}>
                          <td className="py-3 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(item.date)}
                          </td>
                          <td className="py-3 px-2 text-slate-700 dark:text-slate-200">
                            {item.weight != null ? getWeightDisplay(item.weight) : '—'}
                          </td>
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                            {item.measurements?.chest != null ? `${item.measurements.chest} cm` : '—'}
                          </td>
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                            {item.measurements?.waist != null ? `${item.measurements.waist} cm` : '—'}
                          </td>
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                            {item.performanceMetrics?.runTime != null
                              ? `${formatNumber(item.performanceMetrics.runTime)} sec`
                              : '—'}
                          </td>
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                            {item.performanceMetrics?.runDistance != null
                              ? `${formatNumber(item.performanceMetrics.runDistance)} km`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="border-t border-slate-200 dark:border-slate-800 pt-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Nutrition Summary
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Calories', value: summary?.totalCaloriesConsumed, unit: 'kcal' },
                  { label: 'Protein', value: summary?.totalProtein, unit: 'g' },
                  { label: 'Carbohydrates', value: summary?.totalCarbs, unit: 'g' },
                  { label: 'Fat', value: summary?.totalFat, unit: 'g' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-3"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {formatNumber(item.value)}
                      <span className="text-xs font-normal text-slate-500 ml-1">
                        {item.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>PulseFit · Personal Fitness Report</span>
              <span>Generated on {new Date().toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
