import React from 'react';
import { useFitness } from '../context/FitnessContext';
import {
  Flame,
  Dumbbell,
  Utensils,
  TrendingUp,
  BarChart3,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const { navigate, demoLogin } = useFitness();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const },
    },
  };

  return (
    <div className="space-y-20 pb-20">
     
{/* Hero Section */}
<section className="relative pt-8 md:pt-16">
  <div className="max-w-7xl mx-auto">
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
    >
      {/* Left Column: Headline & Value Prop */}
      <div className="lg:col-span-7 space-y-6">

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance"
        >
          Track Your Routine.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            Build Better Habits.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
        >
          Keep your workouts, meals, and fitness progress organised in one place.
          PulseFit gives you a simple way to record your daily activity and see
          how your routine changes over time.
        </motion.p>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('register')}
            className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 rounded-xl transition-all duration-150 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Trust Metric Badges */}
        <motion.div
          variants={itemVariants}
          className="pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg"
        >
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">Daily</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Activity Tracking</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">One</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Personal Fitness Record</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">Anytime</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Progress History</div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Hero Image Card */}
      <motion.div
        variants={itemVariants}
        className="lg:col-span-5 relative"
      >
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 group">
          <img
            src="/src/assets/images/fitness_hero_athlete_1792930403126.jpg"
            alt="Athletic training and fitness tracking"
            referrerPolicy="no-referrer"
            className="w-full h-[440px] object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

          {/* Floating Metric Card Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-white"
          >
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
              <span className="font-medium text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                Your Daily Activity
              </span>
              <span className="font-mono text-emerald-400 font-semibold">Workout & Nutrition</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-4/5 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
              <span>Keep your routine organised</span>
              <span>One step at a time</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  </div>
</section>

{/* Feature Breakdown Grid */}
<section className="max-w-7xl mx-auto">
  <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
      Everything You Need to Stay on Track
    </h2>
    <p className="text-sm text-slate-600 dark:text-slate-400">
      From your first workout to your latest progress update, keep your fitness records organised and easy to review.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[
      {
        icon: <Dumbbell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
        title: 'Workout Tracking',
        desc: 'Record exercises, sets, reps, weights, and notes. Keep your workout history organised and filter sessions by category.',
      },
      {
        icon: <Utensils className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
        badgeBg: 'bg-cyan-500/10 border-cyan-500/20',
        title: 'Daily Nutrition',
        desc: 'Add your meals and track calories, protein, carbohydrates, and fats throughout the day.',
      },
      {
        icon: <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        badgeBg: 'bg-amber-500/10 border-amber-500/20',
        title: 'Progress Records',
        desc: 'Keep track of your weight, body measurements, and running performance over time.',
      },
      {
        icon: <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
        badgeBg: 'bg-purple-500/10 border-purple-500/20',
        title: 'Fitness Analytics',
        desc: 'Review charts and summaries to understand changes in your workouts, nutrition, and progress records.',
      },
      {
        icon: <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
        badgeBg: 'bg-rose-500/10 border-rose-500/20',
        title: 'Downloadable Reports',
        desc: 'Export your fitness records as PDF or CSV files whenever you need them.',
      },
      {
        icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
        title: 'Search Your Records',
        desc: 'Quickly find saved workouts, nutrition entries, and progress records using search.',
      },
    ].map((item, idx) => (
      <motion.div
        key={idx}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3"
      >
        <div className={`w-10 h-10 rounded-xl ${item.badgeBg} border flex items-center justify-center`}>
          {item.icon}
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {item.desc}
        </p>
      </motion.div>
    ))}
  </div>
</section>

  
{/* How PulseFit Works */}
<section className="max-w-7xl mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

    {/* Left: Section Introduction */}
    <div className="space-y-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        A routine you can keep
      </span>

      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
        Make your progress easier to follow.
      </h2>

      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
        Staying consistent is easier when you can see what you have been doing.
        Use PulseFit to record your activity, review your progress, and keep
        everything in one place.
      </p>

      <button
        onClick={() => navigate('register')}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-sm"
      >
        Get Started
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>

    {/* Right: Three Steps */}
    <div className="space-y-4">

      <motion.div
        whileHover={{ x: 4 }}
        className="flex gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            STEP 01
          </span>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Record your activity
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Add your workouts and meals to keep a record of your daily routine.
          </p>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ x: 4 }}
        className="flex gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            STEP 02
          </span>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Review your progress
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Look back at your workout history, nutrition records, and progress charts.
          </p>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ x: 4 }}
        className="flex gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            STEP 03
          </span>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Work towards your goals
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Use your records to understand your habits and plan your next steps.
          </p>
        </div>
      </motion.div>

    </div>
  </div>
</section>

{/* Final Call to Action */}
<section className="max-w-7xl mx-auto">
  <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-800 px-7 py-14 sm:px-12 sm:py-16 text-center">

    {/* Subtle Background Decoration */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

    <div className="relative max-w-2xl mx-auto space-y-6">

      <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-[0.2em]">
        <Flame className="w-4 h-4" />
        Make a start today
      </div>

      <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
        Your goals deserve
        <span className="block text-emerald-400 mt-2">
          your commitment.
        </span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
        Every routine begins somewhere. Create your account and start keeping
        track of the work you put into your health and fitness.
      </p>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => navigate('register')}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition-colors"
        >
          Create Your Account
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigate('login')}
          className="px-7 py-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
        >
          Already a member? Sign In
        </button>
      </div>

    </div>
  </div>
</section>


    </div>
  );
};
