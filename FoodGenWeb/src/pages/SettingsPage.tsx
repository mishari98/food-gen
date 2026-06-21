import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    user,
    household,
    householdRole,
    householdMembers,
    pendingJoinRequests,
    logout,
  } = useMealPlan();

  const isAdmin = householdRole === 'admin';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/dashboard')}>🏠</button>
        <div className="header-title">
          <span className="app-title">⚙️ Settings</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div className="content-area">
        {/* Household Info */}
        {household && (
          <div className="settings-section">
            <h3 className="settings-section-title">Household</h3>
            <p className="household-setting-name">🏠 {household.name}</p>
            <span className="role-badge">{householdRole}</span>
            <div className="household-setting-details">
              <p>📅 Week starts on {household.weekStartDay}</p>
              <p>👥 Members: {householdMembers.length}</p>
            </div>

            {isAdmin && (
              <button
                className="secondary-button"
                onClick={() => navigate('/household/manage')}
                style={{ marginTop: 12 }}
              >
                ⚙️ Manage Household
              </button>
            )}

            {isAdmin && pendingJoinRequests.length > 0 && (
              <p className="pending-requests-badge">
                🔔 {pendingJoinRequests.length} pending request{pendingJoinRequests.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Account */}
        <div className="settings-section">
          <h3 className="settings-section-title">Account</h3>
          <div className="account-info">
            <span className="account-avatar">👤</span>
            <span className="account-name">{user?.displayName || 'User'}</span>
          </div>
          <p className="account-email">{user?.email}</p>

          <button
            className="danger-button"
            onClick={async () => {
              if (window.confirm('Are you sure you want to sign out?')) {
                await logout();
                navigate('/');
              }
            }}
            style={{ marginTop: 12 }}
          >
            Sign Out
          </button>
        </div>

        {/* About */}
        <div className="settings-section">
          <h3 className="settings-section-title">About</h3>
          <p className="settings-about-text">
            <strong>FoodGen</strong> — Filipino meal planner for households<br />
            Version 1.0.0 (Web)<br />
            Data: 77 Filipino dishes<br />
            {user ? 'Synced via Firebase' : 'Local mode'}
          </p>
        </div>
      </div>
    </div>
  );
}