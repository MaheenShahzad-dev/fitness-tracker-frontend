import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Flame, Lock, Mail, ArrowRight, ShieldCheck, Zap, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { login as loginApi } from '../services/authService';

export const LoginPage: React.FC = () => {
  const { demoLogin, navigate } = useFitness();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('[LOGIN] calling DB with:', email);
      const res: any = await loginApi(email, password);
      console.log('[LOGIN] DB response:', res);

      if (!res?.token) {
        setError(res?.message || 'Login failed — no token received.');
        return;
      }

      // ✅ TOKEN, NAME AUR IMAGE SAVE KARNA
      localStorage.setItem('token', res.token);
      localStorage.setItem('pulsefit_is_demo', 'false');
      
      const userData = res.user || res; 
      
      localStorage.setItem('pulsefit_user', JSON.stringify({
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.profilePic || userData.avatarUrl,
        fitnessGoal: userData.fitnessGoal,
      }));

      localStorage.setItem('pulsefit_workouts', '[]');
      localStorage.setItem('pulsefit_nutrition', '[]');
      localStorage.setItem('pulsefit_progress', '[]');

      console.log('[LOGIN] success — Data saved. Redirecting...');
      window.location.href = '/dashboard';

    } catch (err: any) {
      console.error('[LOGIN] error:', err);
      setError(err?.response?.data?.message || err?.message || 'Login failed. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    setError('');
    demoLogin();
  };

  const inputClasses = "w-full pl-10 pr-3 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-60";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        {/* Background Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-50 dark:opacity-30"></div>
        
        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-2xl dark:shadow-none">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30 text-white mx-auto transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Flame className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in to access your fitness dashboard and analytics.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-sm flex items-start gap-2"
            >
              <div className="shrink-0 mt-0.5">⚠️</div>
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  required
                  disabled={submitting}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={submitting}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500/50 dark:bg-slate-950"
                />
                <span>Remember me</span>
              </label>
             
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Log In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        

          {/* Footer link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('register')}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
};