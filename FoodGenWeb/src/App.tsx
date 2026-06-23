import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { MealPlanProvider, useMealPlan } from './context/MealPlanContext';
import LoadingSpinner from './components/LoadingSpinner';
import OnboardingPage from './pages/OnboardingPage';
import HouseholdDashboard from './pages/HouseholdDashboard';
import DayPage from './pages/DayPage';
import WeekPage from './pages/WeekPage';
import HistoryPage from './pages/HistoryPage';
import AddMealPage from './pages/AddMealPage';
import SettingsPage from './pages/SettingsPage';
import HouseholdManagementPage from './pages/HouseholdManagementPage';
import DebugPage from './pages/DebugPage';
import './App.css';

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useMealPlan();

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-area">
          <LoadingSpinner text="Loading..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return <OnboardingPage />;
  }

  return <>{children}</>;
}

function HouseholdRoute({ children }: { children: React.ReactNode }) {
  const { user, household, isLoading } = useMealPlan();

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-area">
          <LoadingSpinner text="Loading..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return <OnboardingPage />;
  }

  // If logged in but no household -> go to dashboard
  if (!household) {
    return <HouseholdDashboard />;
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
        <NavLink to="/day" end className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
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
          {/* Onboarding/Auth */}
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Household Dashboard */}
          <Route path="/dashboard" element={
            <AuthRoute>
              <HouseholdDashboard />
            </AuthRoute>
          } />

          {/* Main App (requires household) */}
          <Route path="/day" element={
            <HouseholdRoute>
              <AppLayout>
                <DayPage />
              </AppLayout>
            </HouseholdRoute>
          } />
          <Route path="/week" element={
            <HouseholdRoute>
              <AppLayout>
                <WeekPage />
              </AppLayout>
            </HouseholdRoute>
          } />
          <Route path="/history" element={
            <HouseholdRoute>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </HouseholdRoute>
          } />

          {/* Other pages */}
          <Route path="/add-meal" element={
            <AuthRoute>
              <AddMealPage />
            </AuthRoute>
          } />
          <Route path="/settings" element={
            <AuthRoute>
              <SettingsPage />
            </AuthRoute>
          } />
          <Route path="/household/manage" element={
            <AuthRoute>
              <HouseholdManagementPage />
            </AuthRoute>
          } />

          {/* Debug */}
          <Route path="/debug" element={<DebugPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </MealPlanProvider>
  );
}