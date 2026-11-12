import React from 'react';
import { useFitness } from '../context/FitnessContext';
import { Dumbbell, Home, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export const NotFoundPage: React.FC = () => {
  const { navigate, isAuthenticated } = useFitness();

  return (
    <div className="max-w-md mx-auto my-16 px-4 text-center space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-md dark:shadow-2xl relative"
      >
        <Dumbbell className="w-10 h-10 rotate-45" />
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
          404
        </span>
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Skipped Leg Day & Got Lost?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          The fitness page or resource you are looking for has been racked away or moved to another section.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(isAuthenticated ? 'dashboard' : 'landing')}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>{isAuthenticated ? 'Return to Dashboard' : 'Return Home'}</span>
        </motion.button>

        <button
          onClick={() => navigate('workouts')}
          className="px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Browse Workouts</span>
        </button>
      </div>
    </div>
  );
};
