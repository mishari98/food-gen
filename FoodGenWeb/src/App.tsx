import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { MealPlanProvider, useMealPlan } from './context/MealPlanContext';
import DayPage from './pages/DayPage';
import WeekPage from './pages/WeekPage';
import HistoryPage from './pages/HistoryPage';
import AddMealPage from './pages/AddMealPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import { isOnboardingComplete } from './services/preferenceManager';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isComplete, setIsComplete] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const check = () => isOnboardingComplete().then(setIsComplete);
    check();
    
    const handler = () => check();
    window.addEventListener('storage', handler);
    window.addEventListener('onboarding-complete', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('onboarding-complete', handler);
    };
  }, []);

  if (isComplete === null) {
    return <div className="loading-state">Loading...</div>;
  }

  if (!isComplete) {
    return <OnboardingPage />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <div className="app-content">
        {children}
      </div>
      <nav className="tab-bar">
        <NavLink to="/" end className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <span className="tab-icon">📅</span>
          <span className="tab-label">Day</span>
        </NavLink>
        <NavLink to="/week" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <span className="tab-icon">📆</span>
          <span className="tab-label">Week</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <span className="tab-icon">📋</span>
          <span className="tab-label">History</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <MealPlanProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <DayPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/week" element={
            <ProtectedRoute>
              <AppLayout>
                <WeekPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/add-meal" element={
            <ProtectedRoute>
              <AddMealPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </MealPlanProvider>
  );
}