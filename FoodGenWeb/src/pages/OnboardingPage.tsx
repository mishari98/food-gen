import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { signup, login, isLoading, error, user } = useMealPlan();
  const [isLogin, setIsLogin] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!isLogin && password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setLocalError('Please enter your name');
          return;
        }
        await signup(displayName, email, password);
      }
      // Redirect to dashboard after successful auth
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed');
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Timeout for loading state (5 seconds max)
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        // If still loading after 5 seconds, something is wrong
        console.error('Auth loading timeout - Firebase may not be initialized correctly');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-icon">🍽️</div>
        <h1 className="onboarding-title">FoodGen</h1>
        <p className="onboarding-subtitle">Filipino Meal Planning for Your Household</p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {!isLogin && (
            <div className="form-group">
              <label className="onboarding-label" htmlFor="displayName">Your Name</label>
              <input
                id="displayName"
                className="onboarding-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Juan Dela Cruz"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="onboarding-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="onboarding-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="onboarding-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="onboarding-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="onboarding-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                className="onboarding-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required={!isLogin}
              />
            </div>
          )}

          {(error || localError) && (
            <div className="onboarding-error">{error || localError}</div>
          )}

          <button 
            type="submit" 
            className="onboarding-btn" 
            disabled={isLoading}
            style={{ 
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="onboarding-toggle">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsLogin(false)} className="onboarding-link">
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsLogin(true)} className="onboarding-link">
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}