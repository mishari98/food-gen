import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { getSlotsForMealsPerDay, getSlotEmoji, type MealSlotName } from '../utils/constants';
import { formatDisplayDate } from '../utils/dateHelpers';
import MealCard from '../components/MealCard';
import MealDetailModal from '../components/MealDetailModal';
import MealsPerDayPicker from '../components/MealsPerDayPicker';
import EmptyState from '../components/EmptyState';
import type { Meal } from '../types/meal';

export default function TodayPage() {
  const navigate = useNavigate();
  const { todayPlan, mealsPerDay, showLabels, isLoading, refreshToday, setMealsPerDay, setShowLabels } = useMealPlan();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const today = new Date();
  const activeSlots = getSlotsForMealsPerDay(mealsPerDay);

  const getMealForSlot = (slot: MealSlotName): Meal | undefined => {
    if (!todayPlan) return undefined;
    switch (slot) {
      case 'breakfast': return todayPlan.breakfast;
      case 'lunch': return todayPlan.lunch;
      case 'dinner': return todayPlan.dinner;
      case 'snack': return todayPlan.snack;
    }
  };

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

      {/* Date */}
      <p className="date-text">{formatDisplayDate(today.toISOString().split('T')[0])}</p>

      {/* Meals Per Day Picker */}
      <MealsPerDayPicker
        value={mealsPerDay}
        onChange={setMealsPerDay}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
      />

      {/* Content */}
      <div className="content-area">
        {isLoading ? (
          <div className="loading-state">Loading your meals...</div>
        ) : !todayPlan ? (
          <EmptyState
            message="No meals generated yet"
            actionLabel="Generate Today's Meals"
            onAction={refreshToday}
          />
        ) : (
          <div className="meal-list">
            {activeSlots.map(slot => {
              const meal = getMealForSlot(slot);
              return (
                <div
                  key={slot}
                  className="meal-card-wrapper"
                  onClick={() => meal && setSelectedMeal(meal)}
                >
                  <MealCard
                    meal={meal}
                    slotEmoji={getSlotEmoji(slot)}
                    slotName={slot}
                    showLabel={showLabels}
                  />
                </div>
              );
            })}

            {/* Regenerate button */}
            <button className="refresh-btn" onClick={refreshToday}>
              🔄 Regenerate Today's Meals
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