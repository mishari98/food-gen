import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { getSlotsForMealsPerDay, getSlotEmoji, type MealSlotName } from '../utils/constants';
import { formatDisplayDate } from '../utils/dateHelpers';
import MealCard from '../components/MealCard';
import MealDetailModal from '../components/MealDetailModal';
import MealsPerDayPicker from '../components/MealsPerDayPicker';
import EmptyState from '../components/EmptyState';
import type { Meal } from '../types/meal';

export default function DayPage() {
  const navigate = useNavigate();
  const {
    dayPlan,
    mealsPerDay,
    isLoading,
    selectedDate,
    setSelectedDate,
    generateDayPlan,
    loadPlanForDate,
  } = useMealPlan();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  // Compute max date (today+30 days into future)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 365);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const activeSlots = getSlotsForMealsPerDay(mealsPerDay);

  const getMealForSlot = (slot: MealSlotName): Meal | undefined => {
    if (!dayPlan) return undefined;
    switch (slot) {
      case 'breakfast': return dayPlan.breakfast;
      case 'lunch': return dayPlan.lunch;
      case 'dinner': return dayPlan.dinner;
      case 'snack': return dayPlan.snack;
    }
  };

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    loadPlanForDate(dateStr);
  };

  const handleGenerate = () => {
    if (dayPlan) {
      if (!window.confirm(`Regenerate meals for ${formatDisplayDate(selectedDate)}? This will replace the current plan for this day.`)) {
        return;
      }
    }
    generateDayPlan(selectedDate);
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/settings')}>⚙️</button>
        <div className="header-title">
          <span className="app-title">🍽️ FoodGen</span>
        </div>
        <button className="icon-btn primary" onClick={() => navigate('/add-meal')}>➕</button>
      </div>

      {/* Date Picker */}
      <div className="date-picker-row">
        <input
          type="date"
          className="date-input"
          value={selectedDate}
          min={todayStr}
          max={maxDateStr}
          onChange={(e) => handleDateChange(e.target.value)}
        />
        {!isToday && (
          <button
            className="small-btn"
            onClick={() => handleDateChange(todayStr)}
          >
            📍 Today
          </button>
        )}
      </div>

      {/* Meals Per Day Picker */}
      <MealsPerDayPicker
        value={mealsPerDay}
        onChange={(count) => {
          // Changing mealsPerDay will auto-trigger via context
        }}
      />

      {/* Content */}
      <div className="content-area">
        {isLoading ? (
          <div className="loading-state">Loading your meals...</div>
        ) : !dayPlan ? (
          <EmptyState
            message={`No meals for ${formatDisplayDate(selectedDate)}`}
            actionLabel="Generate Meals"
            onAction={handleGenerate}
          />
        ) : (
          <div className="meal-list">
            <p className="date-text">{formatDisplayDate(selectedDate)}</p>
            {activeSlots.map(slot => {
              const meal = getMealForSlot(slot);
              return (
                <div
                  key={slot}
                  className="meal-card-wrapper"
                  onClick={() => meal && setSelectedMeal(meal)}
                >
                  <MealCard meal={meal} />
                </div>
              );
            })}

            {/* Regenerate button */}
            <button className="refresh-btn" onClick={handleGenerate}>
              🔄 {dayPlan ? 'Regenerate' : 'Generate'} Meals
            </button>
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