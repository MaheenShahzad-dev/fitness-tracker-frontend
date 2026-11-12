/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/layout/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
// 17 Pages
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { WorkoutListPage } from './pages/WorkoutListPage';
import { CreateEditWorkoutPage } from './pages/CreateEditWorkoutPage';
import { NutritionLogPage } from './pages/NutritionLogPage';
import { AddNutritionPage } from './pages/AddNutritionPage';
import { ProgressTrackingPage } from './pages/ProgressTrackingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SearchPage } from './pages/SearchPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportPage } from './pages/SupportPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Chatbot } from '../src/components/layout/Chatbot';
import { BrowserRouter } from 'react-router-dom';
const AppContent: React.FC = () => {
  
  const { currentPage, isAuthenticated, navigate } = useFitness();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar is active for all authenticated app views
  const showSidebar = isAuthenticated && currentPage !== 'landing';

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'register':
        return <RegisterPage />;
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'profile':
        return <UserProfilePage />;
      case 'workouts':
        return <WorkoutListPage />;
      case 'create-workout':
        return <CreateEditWorkoutPage />;
      case 'nutrition':
        return <NutritionLogPage />;
      case 'add-nutrition':
        return <AddNutritionPage />;
      case 'progress':
        return <ProgressTrackingPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'search':
        return <SearchPage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'support':
        return <SupportPage />;
      case 'not-found':
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        {showSidebar && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area with Motion Reveal Page Transition */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 min-w-0 transition-all ${
            showSidebar ? 'lg:pl-8' : ''
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {renderCurrentPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Global Toast Banner */}
      <Toast />
{/* Global Toast Notifications */}
<Toaster position="top-right" />
      {/* Footer */}
    {/* Footer */}
<footer className="no-print border-t border-slate-200/80 dark:border-slate-900 bg-white dark:bg-slate-950 py-6 text-xs text-slate-500 transition-colors duration-200">

  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">

    {/* BRAND / COPYRIGHT */}
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <span className="font-semibold text-slate-800 dark:text-slate-300">
        PulseFit System
      </span>

      <span className="hidden sm:inline">•</span>

      <span>
        © {new Date().getFullYear()} PulseFit. All rights reserved.
      </span>
    </div>

    {/* FOOTER LINKS */}
    <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">

      {isAuthenticated ? (
        <>
          <button
            onClick={() => navigate('support')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Support Helpdesk
          </button>

          <button
            onClick={() => navigate('reports')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Audit Reports
          </button>

          <button
            onClick={() => navigate('settings')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Settings
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => navigate('landing')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            About PulseFit
          </button>

          <button
            onClick={() => navigate('login')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('register')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Create Account
          </button>
        </>
      )}

    </div>

  </div>
</footer>
{isAuthenticated && <Chatbot />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
    <FitnessProvider>
      <AppContent />
    </FitnessProvider>
    </BrowserRouter>
  );
}
