import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setDisplayName, setOnboardingComplete, getFirebaseUid, setFirebaseUid, getDisplayName, getMealsPerDay, getWeekStartDay } from '../services/preferenceManager';
import { loginAnonymously, getCurrentUser } from '../firebase/auth';
import { pushPreferences } from '../services/syncService';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name to continue.');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Save name locally
      await setDisplayName(trimmedName);

      // Try anonymous Firebase login
      try {
        const existingUid = await getFirebaseUid();
        if (existingUid) {
          // We already have a UID, just try to sign in again
          try {
            await loginAnonymously();
          } catch {
            // If it fails, that's okay - we'll work offline
            console.warn('Anonymous login failed, continuing offline');
          }
        } else {
          try {
            const user = await loginAnonymously();
            await setFirebaseUid(user.uid);
          } catch {
            // If it fails, that's okay - we'll work offline
            console.warn('Anonymous login failed, continuing offline');
          }
        }
      } catch {
        console.warn('Firebase not available, continuing offline');
      }

      // Mark onboarding complete
      await setOnboardingComplete();
      
      // Sync preferences to Firebase
      const uid = await getFirebaseUid();
      if (uid) {
        const mpd = await getMealsPerDay();
        const wsd = await getWeekStartDay();
        await pushPreferences(uid, {
          displayName: trimmedName,
          mealsPerDay: mpd,
          weekStartDay: wsd,
        });
      }
      
      // Notify App to re-check onboarding status
      window.dispatchEvent(new Event('onboarding-complete'));

      // Navigate to main app
      navigate('/', { replace: true });
    } catch (e) {
      console.error('Onboarding error:', e);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-icon">🍽️</div>
        <h1 className="onboarding-title">Welcome to FoodGen</h1>
        <p className="onboarding-subtitle">
          Plan your meals, your way.
        </p>
        <p className="onboarding-description">
          Generate daily and weekly meal plans. Your data syncs across all your devices automatically.
        </p>

        <div className="onboarding-form">
          <label className="onboarding-label">What should we call you?</label>
          <input
            className="onboarding-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name..."
            autoFocus
            maxLength={30}
            disabled={isLoading}
          />
          {error && <p className="onboarding-error">{error}</p>}
        </div>

        <button
          className="onboarding-btn"
          onClick={handleStart}
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? 'Setting up...' : '🚀 Get Started'}
        </button>
      </div>
    </div>
  );
}