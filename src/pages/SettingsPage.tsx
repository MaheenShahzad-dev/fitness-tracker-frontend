
import React, { useEffect, useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { UnitSystem } from '../types';

import {
  Settings as SettingsIcon,
  Bell,
  Scale,
  Palette,
  Check,
  Sun,
  Moon,
  Download,
} from 'lucide-react';

import {
  updateNotificationSettings,
  getUserProfile
} from '../services/authService';

export const SettingsPage: React.FC = () => {

  const {
    user,
    updateUser,
    workouts,
    nutrition,
    progress,
    theme,
    toggleTheme,
    showToast,
    refreshNotifications,
  } = useFitness();

  const [units, setUnits] = useState<UnitSystem>(
    user.preferences?.units ?? 'metric'
  );

  const [workoutReminders, setWorkoutReminders] = useState(
    user.preferences?.workoutReminders ?? true
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user.settings?.notificationsEnabled ?? true
  );

  const [saving, setSaving] = useState(false);

  // Sync settings
  useEffect(() => {
    setUnits(user.preferences?.units ?? 'metric');

    setWorkoutReminders(
      user.preferences?.workoutReminders ?? true
    );

    setNotificationsEnabled(
      user.settings?.notificationsEnabled ?? true
    );
  }, [user.preferences, user.settings]);

  // Update notification setting directly in MongoDB
  const handleNotificationToggle = async (enabled: boolean) => {

    if (saving) return;

    const previousValue = notificationsEnabled;

    try {

      setSaving(true);

      // Optimistic UI update
      setNotificationsEnabled(enabled);

      // Save in MongoDB
      await updateNotificationSettings(enabled);

      // Refresh profile from database
      const profileResponse = await getUserProfile();

      if (profileResponse.status === 'success') {
        const updatedUser = profileResponse.user;

        setNotificationsEnabled(
          updatedUser.settings?.notificationsEnabled ?? true
        );

        // Update FitnessContext user state
        await updateUser({
          settings: updatedUser.settings
        });
      }

      await refreshNotifications();

      showToast(
        enabled
          ? 'All notifications enabled!'
          : 'All notifications disabled!',
        'success'
      );

    } catch (error) {

      console.error('Notification update error:', error);

      // Restore previous state
      setNotificationsEnabled(previousValue);

      showToast(
        'Failed to update notification settings',
        'error'
      );

    } finally {

      setSaving(false);

    }
  };

  // Existing preferences
  const updatePreference = async (
    key: 'units' | 'workoutReminders',
    value: UnitSystem | boolean
  ) => {

    if (saving) return;

    const previousPreferences = user.preferences;

    try {

      setSaving(true);

      await updateUser({
        preferences: {
          ...previousPreferences,
          [key]: value,
        },
      });

      if (key === 'units') {
        setUnits(value as UnitSystem);
      }

      if (key === 'workoutReminders') {
        setWorkoutReminders(value as boolean);
      }

      await refreshNotifications();

      showToast('Settings updated successfully!', 'success');

    } catch (error) {

      console.error(error);

      setUnits(previousPreferences?.units ?? 'metric');

      setWorkoutReminders(
        previousPreferences?.workoutReminders ?? true
      );

      showToast('Failed to update settings', 'error');

    } finally {

      setSaving(false);

    }
  };

  // Backup
  const handleBackupDownload = () => {

    const backupData = {
      user,
      workouts,
      nutrition,
      progress,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob(
      [JSON.stringify(backupData, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = `PulseFit_Backup_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    a.click();

    URL.revokeObjectURL(url);

    showToast('Backup downloaded successfully!', 'success');
  };

  // Toggle component
  const Toggle = ({
    checked,
    onChange,
    disabled = false,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (

    <button
      type="button"
      disabled={saving || disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked
          ? 'bg-emerald-600'
          : 'bg-slate-300 dark:bg-slate-700'
      } disabled:opacity-50`}
    >

      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />

    </button>
  );

  return (

    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">

          <SettingsIcon className="w-6 h-6 text-emerald-600" />

          System & Account Preferences

        </h1>

        <p className="text-xs text-slate-500 mt-1">
          Configure units, notifications and application themes.
        </p>

      </div>

      {/* Units */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4">

        <div className="flex items-center gap-2 font-bold text-sm">

          <Scale className="w-4 h-4 text-emerald-600" />

          Unit Standards

        </div>

        <div className="grid sm:grid-cols-2 gap-4">

          {(['metric', 'imperial'] as UnitSystem[]).map(unit => (

            <button
              key={unit}
              disabled={saving}
              onClick={() => updatePreference('units', unit)}
              className={`p-4 rounded-xl border text-left ${
                units === unit
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
              }`}
            >

              <div className="flex justify-between text-xs font-semibold">

                {unit === 'metric' ? 'Metric System' : 'Imperial System'}

                {units === unit && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}

              </div>

              <p className="text-[11px] text-slate-500 mt-1">

                {unit === 'metric'
                  ? 'Kilograms · Kilometers · Centimeters'
                  : 'Pounds · Miles · Inches'}

              </p>

            </button>

          ))}

        </div>

      </div>

      {/* Theme */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4">

        <div className="flex items-center gap-2 font-bold text-sm">

          <Palette className="w-4 h-4 text-purple-600" />

          Theme & Aesthetics

        </div>

        <div className="grid sm:grid-cols-2 gap-4">

          <button
            onClick={() => {
              if (theme !== 'light') toggleTheme();
            }}
            className="p-4 rounded-xl border flex items-center justify-between"
          >

            <span className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-500" />
              Light Theme
            </span>

            {theme === 'light' && <Check className="w-4 h-4" />}

          </button>

          <button
            onClick={() => {
              if (theme !== 'dark') toggleTheme();
            }}
            className="p-4 rounded-xl border flex items-center justify-between"
          >

            <span className="flex items-center gap-3">
              <Moon className="w-5 h-5" />
              Dark Theme
            </span>

            {theme === 'dark' && <Check className="w-4 h-4" />}

          </button>

        </div>

      </div>

      {/* Notification Settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-5">

        <div className="flex items-center gap-2 font-bold text-sm">

          <Bell className="w-4 h-4 text-cyan-600" />

          Notification Preferences

        </div>

        {/* All notifications */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">

          <div>

            <p className="text-xs font-semibold">
              All Notifications
            </p>

            <p className="text-[11px] text-slate-500 mt-1">

              {notificationsEnabled
                ? 'All notifications are enabled'
                : 'All notifications are disabled'}

            </p>

          </div>

          <Toggle
            checked={notificationsEnabled}
            onChange={handleNotificationToggle}
          />

        </div>

        {/* Workout reminders */}
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          !notificationsEnabled
            ? 'opacity-50 bg-slate-100 dark:bg-slate-900'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
        }`}>

          <div>

            <p className="text-xs font-semibold">
              Workout Reminders
            </p>

            <p className="text-[11px] text-slate-500 mt-1">

              {workoutReminders
                ? 'Workout notifications are enabled'
                : 'Workout notifications are disabled'}

            </p>

          </div>

          <Toggle
            checked={workoutReminders}
            disabled={!notificationsEnabled}
            onChange={value =>
              updatePreference('workoutReminders', value)
            }
          />

        </div>

        <div className={`p-3 rounded-xl border text-xs ${
          notificationsEnabled
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 text-emerald-700 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 text-amber-700 dark:text-amber-400'
        }`}>

          {!notificationsEnabled
            ? 'All notifications are OFF.'
            : workoutReminders
              ? 'All notifications are ON.'
              : 'Notifications are ON, but workout reminders are OFF.'}

        </div>

      </div>

    

    </div>
  );
};
