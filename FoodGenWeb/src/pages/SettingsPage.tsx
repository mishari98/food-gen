import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { getDisplayName } from '../services/preferenceManager';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, mealsPerDay, weekStartDay, setMealsPerDay, setWeekStartDay } = useMealPlan();
  const [displayName, setDisplayName] = React.useState('');

  React.useEffect(() => {
    getDisplayName().then(setDisplayName);
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-title">
          <span className="app-title">⚙️ Settings</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div className="content-area">
        {/* Meals Per Day */}
        <div className="settings-section">
          <h3 className="settings-section-title">Meals Per Day</h3>
          <p className="settings-section-desc">How many meals do you want to plan per day?</p>
          <div className="segmented-picker">
            {[1, 2, 3].map(count => (
              <button
                key={count}
                className={`segmented-option ${mealsPerDay === count ? 'active' : ''}`}
                onClick={() => setMealsPerDay(count)}
              >
                {count} {'🍽️'.repeat(count)}
              </button>
            ))}
          </div>
        </div>

        {/* Week Start Day */}
        <div className="settings-section">
          <h3 className="settings-section-title">Week Starts On</h3>
          <p className="settings-section-desc">Choose which day your week begins on.</p>
          <div className="segmented-picker">
            <button
              className={`segmented-option ${weekStartDay === 'monday' ? 'active' : ''}`}
              onClick={() => setWeekStartDay('monday')}
            >
              Monday
            </button>
            <button
              className={`segmented-option ${weekStartDay === 'sunday' ? 'active' : ''}`}
              onClick={() => setWeekStartDay('sunday')}
            >
              Sunday
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="settings-section">
          <h3 className="settings-section-title">Account</h3>
          <div className="account-info">
            <span className="account-avatar">👤</span>
            <span className="account-name">{displayName || 'User'}</span>
          </div>
          <p className="settings-section-desc">
            {user ? (
              <span style={{ color: '#4CAF50' }}>✅ Synced across devices</span>
            ) : (
              <span style={{ color: '#FF9800' }}>⚠️ Offline mode</span>
            )}
          </p>
        </div>

        {/* About */}
        <div className="settings-section">
          <h3 className="settings-section-title">About</h3>
          <p className="settings-about-text">
            <strong>FoodGen</strong> — Filipino meal planner<br />
            Version 1.0.0 (Web)<br />
            Data: 77 Filipino dishes<br />
            {user ? 'Synced via Firebase' : 'Local mode'}
          </p>
        </div>
      </div>
    </div>
  );
}