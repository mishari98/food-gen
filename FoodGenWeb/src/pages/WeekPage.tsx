import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { getSlotsForMealsPerDay } from '../utils/constants';
import { getWeekNumber, getDateRangeString, formatDateString, getWeekDates } from '../utils/dateHelpers';
import { saveWeekPlanToFirestore } from '../firebase/firestore';
import DayRow from '../components/DayRow';
import MealDetailModal from '../components/MealDetailModal';
import MealsPerDayPicker from '../components/MealsPerDayPicker';
import EmptyState from '../components/EmptyState';
import type { Meal } from '../types/meal';

export default function WeekPage() {
  const navigate = useNavigate();
  const { weekPlans, mealsPerDay, isLoading, selectedWeek, setSelectedWeek, weekStartDay, setWeekStartDay, generateWeekPlan, refreshWeek, regenerateDay, user } = useMealPlan();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const today = new Date();
  const currentWeek = getWeekNumber(today);
  const year = today.getFullYear();

  const handleGenerateWeek = () => {
    if (weekPlans.length > 0) {
      if (!window.confirm('Generate a new weekly plan? This will replace your current plan for this week.')) {
        return;
      }
    }
    generateWeekPlan(selectedWeek, year);
  };

  const handleSavePlan = async () => {
    if (weekPlans.length === 0) return;
    const weekStart = getWeekDates(selectedWeek, year, weekStartDay);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const name = `Week ${selectedWeek} (${formatDateString(weekStart)} - ${formatDateString(weekEnd)})`;
    try {
      if (!user?.uid) {
        alert('You must be logged in to save plans.');
        return;
      }
      await saveWeekPlanToFirestore(user.uid, {
        name,
        weekOfYear: selectedWeek,
        year,
        createdAt: new Date().toISOString(),
      });
      alert(`💾 Week ${selectedWeek} plan saved!`);
    } catch (e) {
      console.error('Failed to save plan:', e);
      alert('Failed to save plan.');
    }
  };

  const handleJumpToThisWeek = () => {
    setSelectedWeek(currentWeek);
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      const week = getWeekNumber(date);
      setSelectedWeek(week);
    }
  };

  const getWeekStartDate = () => {
    const weekStart = getWeekDates(selectedWeek, year, weekStartDay);
    return formatDateString(weekStart);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/settings')}>⚙️</button>
        <div className="header-title">
          <span className="app-title">📆 Week {selectedWeek}</span>
        </div>
        <button className="icon-btn primary" onClick={() => navigate('/add-meal')}>➕</button>
      </div>

      {/* Week Picker */}
      <div className="week-picker-row">
        <input
          type="date"
          className="date-input"
          value={getWeekStartDate()}
          onChange={handleWeekChange}
        />
        <select
          className="week-start-select"
          value={weekStartDay}
          onChange={(e) => setWeekStartDay(e.target.value as 'monday' | 'sunday')}
        >
          <option value="monday">Mon</option>
          <option value="sunday">Sun</option>
        </select>
      </div>

      {/* Meals Per Day Picker */}
      <MealsPerDayPicker
        value={mealsPerDay}
        onChange={() => {}}
      />

      {/* Content */}
      <div className="content-area">
        {isLoading ? (
          <div className="loading-state">Loading your week...</div>
        ) : weekPlans.length === 0 ? (
          <EmptyState
            message="No weekly plan yet"
            actionLabel="Generate Weekly Plan"
            onAction={handleGenerateWeek}
          />
        ) : (
          <div className="week-content">
            {weekPlans
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(dayPlan => (
                <DayRow
                  key={dayPlan.date}
                  dayPlan={dayPlan}
                  mealsPerDay={mealsPerDay}
                  onMealClick={(meal) => setSelectedMeal(meal)}
                  onRegenerateDay={regenerateDay}
                />
              ))}

            <div className="week-actions">
              <button className="primary-btn" onClick={handleGenerateWeek}>
                🔄 Generate This Week
              </button>
              <button className="secondary-btn" onClick={handleSavePlan}>
                💾 Save This Plan
              </button>
              {selectedWeek !== currentWeek && (
                <button className="small-btn" onClick={handleJumpToThisWeek}>
                  📍 Jump to This Week
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Meal Detail Modal */}
      <MealDetailModal
        visible={!!selectedMeal}
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
      />
    </div>
  );
}