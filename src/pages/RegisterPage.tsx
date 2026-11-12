import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Flame, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Check, Upload, Sparkles, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { register as registerApi } from '../services/authService';

export const RegisterPage: React.FC = () => {
  const { navigate, demoLogin } = useFitness();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const avatarPresets = [
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&auto=format&fit=crop&q=80',
  ]; 

  const [selectedAvatar, setSelectedAvatar] = useState(avatarPresets[0]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fitnessGoal, setFitnessGoal] = useState<'muscle_gain' | 'fat_loss' | 'endurance' | 'general_fitness'>('muscle_gain');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const urlToFile = async (url: string, filename = 'avatar.jpg'): Promise<File> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (jpg, png, webp, etc).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    setError('');
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);

      let profilePic: File;
      if (uploadedFile) {
        profilePic = uploadedFile;
      } else {
        profilePic = await urlToFile(selectedAvatar);
      }

      const res = await registerApi({
        name,
        email,
        password,
        fitnessGoal,
        profilePic,
      });

      console.log('[REGISTER] success:', res);
      if (res?.token) localStorage.setItem('token', res.token);
      navigate('login');
    } catch (err: any) {
      console.error('[REGISTER] FAILED:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Modern Input Styling
  const inputClasses = "w-full pl-10 pr-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all";

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
              Create Account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Join PulseFit and start tracking your elite performance today.
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
                Full Name
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-3.5 top-3 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputClasses}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  Confirm
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* ── Profile Picture Section ── */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Profile Picture
              </label>

              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <img
                    src={previewUrl || selectedAvatar}
                    alt="preview"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
                  />
                  {uploadedFile && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-1">
                  {avatarPresets.map((url, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setSelectedAvatar(url);
                        setUploadedFile(null);
                        setPreviewUrl('');
                      }}
                      className={`relative rounded-full p-0.5 border-2 transition-all shrink-0 ${
                        selectedAvatar === url && !uploadedFile
                          ? 'border-emerald-500 scale-110 shadow-sm'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Avatar ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all group">
                <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>{uploadedFile ? uploadedFile.name : 'Upload custom image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Fitness Goal (Modern Select Box) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Primary Goal
              </label>
              <div className="relative group">
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as any)}
                  className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="muscle_gain">Hypertrophy & Muscle Gain</option>
                  <option value="fat_loss">Fat Loss & Leaning Out</option>
                  <option value="endurance">Endurance & Marathon Running</option>
                  <option value="general_fitness">General Health & Longevity</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-4 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <span>{submitting ? 'Creating account...' : 'Complete Registration'}</span>
              {!submitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
              Already have an account?{' '}
              <button
                onClick={() => navigate('login')}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Sign In here
              </button>
            </p>

          
          </div>
          
        </div>
      </motion.div>
    </div>
  );
};