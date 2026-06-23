import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { formatDisplayDate } from '../utils/dateHelpers';
import MealCard from '../components/MealCard';
import MealDetailModal from '../components/MealDetailModal';
import EmptyState from '../components/EmptyState';
import MealsPerDayPicker from '../components/MealsPerDayPicker';
import type { Meal, MealStatus, HouseholdDayPlanWithMeals } from '../types/meal';

const STATUS_CYCLE: MealStatus[] = ['planned', 'in_progress', 'completed', 'skipped'];

export default function DayPage() {
  const navigate = useNavigate();
  const {
    household,
    householdRole,
    dayPlan,
    isLoading,
    error,
    selectedDate,
    setSelectedDate,
    generateDayPlan,
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
  const [generateError, setGenerateError] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 365);
  const maxDateStr = maxDate.toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const isAdminOrEditor = householdRole === 'admin' || householdRole === 'editor';

  // Update selected day plan when date changes
  useEffect(() => {
    // The real-time listener in context handles plan updates
    // This just ensures we re-render when date changes
  }, [selectedDate]);

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
    setGenerateError(null);
  };

  const handleConfirmGenerate = async () => {
    try {
      setGenerateError(null);
      console.log('[DayPage] Generating meals:', selectedDate, mealCount);
      await generateDayPlan(selectedDate, mealCount);
      setShowGeneratePrompt(false);
    } catch (error: any) {
      console.error('[DayPage] Generate failed:', error);
      setGenerateError(error.message || 'Failed to generate meals. Check console for details.');
    }
  };

  const handleMealCountSelect = (count: number) => {
    setMealCount(count);
  };

  const handleAddMeal = (meal: Meal) => {
    addMealToDay(selectedDate, meal.id);
    setShowMealPicker(false);
    setSearchQuery('');
  };

  const handleRemoveMeal = (mealIndex: number) => {
    if (!window.confirm('Remove this meal from the plan?')) return;
    removeMealFromDay(selectedDate, mealIndex);
  };

  const handleStatusClick = (mealIndex: number, currentStatus: MealStatus) => {
    const currentIdx = STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    updateMealStatus(selectedDate, mealIndex, nextStatus);
  };

  // Filter meals for picker
  const mealPool = [...allMeals, ...customMeals];
  const filteredMeals = searchQuery
    ? mealPool.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mealPool;

  // Display meals from Firestore dayPlan
  const displayedMeals = dayPlan
    ? dayPlan.meals
        .filter(entry => entry.meal)
        .map(entry => ({
          ...entry,
          status: (entry.status || 'planned') as MealStatus,
        }))
    : [];

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

      {/* Error message from context */}
      {error && (
        <div className="global-error">{error}</div>
      )}

      {/* Date Picker */}
      <div className="date-picker-row">
        <input
          type="date"
          className="date-input"
          value={selectedDate}
          min={todayStr}
          max={maxDateStr}
          onChange={(e) => handleDateChange((e.target as HTMLInputElement).value)}
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
        ) : displayedMeals.length === 0 ? (
          <div className="meal-list">
            <p className="date-text">{formatDisplayDate(selectedDate)}</p>
            <EmptyState
              message="No meals planned yet"
              actionLabel={isAdminOrEditor ? 'Generate Meals' : undefined}
              onAction={isAdminOrEditor ? handleGenerate : undefined}
              secondaryMessage={
                !isAdminOrEditor ? "Ask your household admin to plan meals" :
                allMeals.length === 0 ? "Please wait, loading meals..." : undefined
              }
            />
            {isAdminOrEditor && (
              <div className="day-actions" style={{ marginTop: 12 }}>
                <button className="add-meal-btn" onClick={() => setShowMealPicker(true)}>
                  ➕ Add Meal Manually
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="meal-list">
            <p className="date-text">{formatDisplayDate(selectedDate)}</p>

            {displayedMeals.map((entry, index) => (
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
            {isAdminOrEditor && (
              <div className="day-actions">
                <button className="refresh-btn" onClick={handleGenerate}>
                  🔄 {displayedMeals.length > 0 ? 'Regenerate' : 'Generate'} Meals
                </button>
                <button className="add-meal-btn" onClick={() => setShowMealPicker(true)}>
                  ➕ Add Meal
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Prompt Modal */}
      {showGeneratePrompt && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>How many meals?</h2>
            <p>Choose how many meals to generate for {formatDisplayDate(selectedDate)}</p>
            {generateError && (
              <div className="error-message" style={{ marginBottom: 12 }}>{generateError}</div>
            )}
            <MealsPerDayPicker value={mealCount} onChange={handleMealCountSelect} max={4} />
            <div className="button-group">
              <button className="primary-btn" onClick={handleConfirmGenerate} disabled={isLoading}>
                {isLoading ? 'Generating...' : '✅ Generate'}
              </button>
              <button className="secondary-btn" onClick={() => setShowGeneratePrompt(false)}>
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
            {allMeals.length === 0 && mealPool.length === 0 ? (
              <p className="no-results">Loading meals, please wait...</p>
            ) : (
              <>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
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
                    <p className="no-results">No meals found matching "{searchQuery}"</p>
                  )}
                </div>
              </>
            )}
            <button className="secondary-btn" onClick={() => { setShowMealPicker(false); setSearchQuery(''); }}>
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