import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toast } = useFitness();

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10',
    error: 'border-rose-500/30 bg-white/95 dark:bg-slate-900/95 text-rose-950 dark:text-rose-100 shadow-rose-500/10',
    info: 'border-cyan-500/30 bg-white/95 dark:bg-slate-900/95 text-cyan-950 dark:text-cyan-100 shadow-cyan-500/10',
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-medium"
        >
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${borders[toast.type]}`}>
            {icons[toast.type]}
            <span className="font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
