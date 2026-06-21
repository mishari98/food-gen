import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { formatDisplayDate } from '../utils/dateHelpers';
import MealCard from '../components/MealCard';
import MealDetailModal from '../components/MealDetailModal';
import EmptyState from '../components/EmptyState';
import type { Meal, MealStatus, HouseholdDayPlanWithMeals } from '../types/meal';

const STATUS_CYCLE: MealStatus[] = ['planned', 'in_progress', 'completed', 'skipped'];

export default function DayPage() {
  const navigate = useNavigate();
  const {
    dayPlan,
    weekPlans,
    householdRole,
    isLoading,
    selectedDate,
    setSelectedDate,
    generateDayPlan,
    regenerateDay,
    updateMealStatus,
    addMealToDay,
    removeMealFromDay,
    allMeals,
    customMeals,
  } = useMealPlan();

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [showGeneratePrompt, setShowGeneratePrompt] = useState(false);
  const [mealCount, setMealCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 365);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const isAdminOrEditor = householdRole === 'admin' || householdRole === 'editor';
  const isToday = selectedDate === todayStr;

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleGenerate = () => {
    if (dayPlan && dayPlan.meals.length > 0) {
      if (!window.confirm(`Regenerate meals for ${formatDisplayDate(selectedDate)}? This will replace the current plan.`)) {
        return;
      }
    }
    setShowGeneratePrompt(true);
  };

  const handleConfirmGenerate = () => {
    generateDayPlan(selectedDate, mealCount);
    setShowGeneratePrompt(false);
  };

  const handleStatusClick = (mealIndex: number, currentStatus: MealStatus) => {
    const currentIdx = STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    updateMealStatus(selectedDate, mealIndex, nextStatus);
  };

  const handleAddMeal = (meal: Meal) => {
    addMealToDay(selectedDate, meal.id);
    setShowMealPicker(false);
    setSearchQuery('');
  };

  const handleRemoveMeal = (mealIndex: number) => {
    if (window.confirm('Remove this meal from the plan?')) {
      removeMealFromDay(selectedDate, mealIndex);
    }
  };

  // Filter meals for picker
  const mealPool = [...allMeals, ...customMeals];
  const filteredMeals = searchQuery
    ? mealPool.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mealPool;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/dashboard')}>🏠</button>
        <div className="header-title">
          <span className="app-title">🍽️ FoodGen</span>
        </div>
        <button className="icon-btn" onClick={() => navigate('/settings')}>⚙️</button>
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
          <button className="small-btn" onClick={() => handleDateChange(todayStr)}>
            📍 Today
          </button>
        )}
      </div>

      {/* Content */}
      <div className="content-area">
        {isLoading ? (
          <div className="loading-state">Loading your meals...</div>
        ) : !dayPlan || dayPlan.meals.length === 0 ? (
          <EmptyState
            message={`No meals for ${formatDisplayDate(selectedDate)}`}
            actionLabel={isAdminOrEditor ? 'Generate Meals' : undefined}
            onAction={isAdminOrEditor ? handleGenerate : undefined}
            secondaryMessage={!isAdminOrEditor ? "Ask your household admin to plan meals" : undefined}
          />
        ) : (
          <div className="meal-list">
            <p className="date-text">{formatDisplayDate(selectedDate)}</p>

            {dayPlan.meals.map((entry, index) => (
              <div key={index} className="meal-card-wrapper">
                <MealCard
                  meal={entry.meal}
                  label={entry.label}
                  status={entry.status}
                  showRemove={isAdminOrEditor}
                  onRemove={() => handleRemoveMeal(index)}
                  onStatusClick={() => handleStatusClick(index, entry.status)}
                  onClick={() => entry.meal && setSelectedMeal(entry.meal)}
                />
              </div>
            ))}

            {/* Action buttons */}
            <div className="day-actions">
              {isAdminOrEditor && (
                <>
                  <button className="refresh-btn" onClick={handleGenerate}>
                    🔄 {dayPlan.meals.length > 0 ? 'Regenerate' : 'Generate'} Meals
                  </button>
                  <button className="add-meal-btn" onClick={() => setShowMealPicker(true)}>
                    ➕ Add Meal
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generate Prompt Modal */}
      {showGeneratePrompt && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>How many meals?</h2>
            <p>Choose how many meals to generate for {formatDisplayDate(selectedDate)}</p>
            <div className="meal-count-options">
              {[1, 2, 3, 4].map(count => (
                <button
                  key={count}
                  className={`meal-count-btn ${mealCount === count ? 'selected' : ''}`}
                  onClick={() => setMealCount(count)}
                >
                  {count} {count === 1 ? 'Meal' : 'Meals'}
                </button>
              ))}
            </div>
            <div className="button-group">
              <button className="primary-button" onClick={handleConfirmGenerate}>
                Generate
              </button>
              <button className="secondary-button" onClick={() => setShowGeneratePrompt(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Picker Modal */}
      {showMealPicker && (
        <div className="modal-overlay">
          <div className="modal meal-picker-modal">
            <h2>Add a Meal</h2>
            <input
              type="text"
              className="search-input"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="meal-picker-list">
              {filteredMeals.map(meal => (
                <button
                  key={meal.id}
                  className="meal-picker-item"
                  onClick={() => handleAddMeal(meal)}
                >
                  <span className="meal-picker-emoji">{meal.emoji}</span>
                  <span className="meal-picker-name">{meal.name}</span>
                  <span className="meal-picker-time">⏱ {meal.prepTimeMinutes}min</span>
                </button>
              ))}
              {filteredMeals.length === 0 && (
                <p className="no-results">No meals found</p>
              )}
            </div>
            <button className="secondary-button" onClick={() => { setShowMealPicker(false); setSearchQuery(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Meal Detail Modal */}
      <MealDetailModal
        visible={!!selectedMeal}
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
      />
    </div>
  );
}