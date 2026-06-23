import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { getWeekNumber, getDateRangeString, formatDateString, getWeekDates } from '../utils/dateHelpers';
import MealCard from '../components/MealCard';
import MealDetailModal from '../components/MealDetailModal';
import EmptyState from '../components/EmptyState';
import type { Meal, MealStatus } from '../types/meal';

const STATUS_CYCLE: MealStatus[] = ['planned', 'in_progress', 'completed', 'skipped'];

export default function WeekPage() {
  const navigate = useNavigate();
  const {
    weekPlans,
    householdRole,
    isLoading,
    selectedWeek,
    setSelectedWeek,
    generateWeekPlan,
    regenerateDay,
    updateMealStatus,
    addMealToDay,
    removeMealFromDay,
    allMeals,
    customMeals,
  } = useMealPlan();

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showGeneratePrompt, setShowGeneratePrompt] = useState(false);
  const [mealCount, setMealCount] = useState(1);
  const [showMealPicker, setShowMealPicker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const currentWeek = getWeekNumber(today);
  const year = today.getFullYear();

  const isAdminOrEditor = householdRole === 'admin' || householdRole === 'editor';

  const handleGenerateWeek = () => {
    if (weekPlans.length > 0) {
      if (!window.confirm('Generate a new weekly plan? This will replace your current plan for this week.')) {
        return;
      }
    }
    setShowGeneratePrompt(true);
  };

  const handleConfirmGenerate = () => {
    generateWeekPlan(selectedWeek, year, mealCount);
    setShowGeneratePrompt(false);
  };

  const handleRegenerateDay = (date: string) => {
    if (!window.confirm(`Regenerate meals for ${formatDateString(new Date(date + 'T00:00:00'))}?`)) return;
    regenerateDay(date, mealCount);
  };

  const handleStatusClick = (date: string, mealIndex: number, currentStatus: MealStatus) => {
    const currentIdx = STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    updateMealStatus(date, mealIndex, nextStatus);
  };

  const handleAddMeal = (date: string, meal: Meal) => {
    addMealToDay(date, meal.id);
    setShowMealPicker(null);
    setSearchQuery('');
  };

  const handleRemoveMeal = (date: string, mealIndex: number) => {
    if (window.confirm('Remove this meal from the plan?')) {
      removeMealFromDay(date, mealIndex);
    }
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
    const weekStart = getWeekDates(selectedWeek, year, 'monday');
    return formatDateString(weekStart);
  };

  const mealPool = [...allMeals, ...customMeals];
  const filteredMeals = searchQuery
    ? mealPool.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : mealPool;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/dashboard')}>🏠</button>
        <div className="header-title">
          <span className="app-title">📆 Week {selectedWeek}</span>
        </div>
        <button className="icon-btn" onClick={() => navigate('/settings')}>⚙️</button>
      </div>

      {/* Week Picker */}
      <div className="week-picker-row">
        <input
          type="date"
          className="date-input"
          value={getWeekStartDate()}
          onChange={handleWeekChange}
        />
        {selectedWeek !== currentWeek && (
          <button className="small-btn" onClick={() => setSelectedWeek(currentWeek)}>
            📍 This Week
          </button>
        )}
      </div>

      {/* Content */}
      <div className="content-area">
        {isLoading ? (
          <div className="loading-state">Loading your week...</div>
        ) : weekPlans.length === 0 ? (
          <EmptyState
            message="No weekly plan yet"
            actionLabel={isAdminOrEditor ? 'Generate Weekly Plan' : undefined}
            onAction={isAdminOrEditor ? handleGenerateWeek : undefined}
            secondaryMessage={!isAdminOrEditor ? "Ask your household admin to plan meals" : undefined}
          />
        ) : (
          <div className="week-content">
            {weekPlans
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(dayPlan => {
                const isExpanded = expandedDay === dayPlan.date;
                return (
                  <div key={dayPlan.date} className="day-row">
                    <div
                      className="day-row-header"
                      onClick={() => setExpandedDay(isExpanded ? null : dayPlan.date)}
                    >
                      <span className="day-row-date">
                        {formatDateString(new Date(dayPlan.date + 'T00:00:00'))}
                      </span>
                      <span className="day-row-summary">
                        {dayPlan.meals.length} meal{dayPlan.meals.length !== 1 ? 's' : ''}
                      </span>
                      <span className="day-row-toggle">{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    {isExpanded && (
                      <div className="day-row-content">
                        {dayPlan.meals.map((entry, index) => (
                          <div key={index} className="meal-card-wrapper">
                            <MealCard
                              meal={entry.meal}
                              label={entry.label}
                              status={entry.status}
                              showRemove={isAdminOrEditor}
                              onRemove={() => handleRemoveMeal(dayPlan.date, index)}
                              onStatusClick={() => handleStatusClick(dayPlan.date, index, entry.status)}
                              onClick={() => entry.meal && setSelectedMeal(entry.meal)}
                            />
                          </div>
                        ))}

                        {isAdminOrEditor && (
                          <div className="day-row-actions">
                            <button
                              className="small-btn"
                              onClick={() => handleRegenerateDay(dayPlan.date)}
                            >
                              🔄 Regenerate
                            </button>
                            <button
                              className="small-btn"
                              onClick={() => setShowMealPicker(dayPlan.date)}
                            >
                              ➕ Add Meal
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            <div className="week-actions">
              {isAdminOrEditor && (
                <button className="primary-btn" onClick={handleGenerateWeek}>
                  🔄 Generate This Week
                </button>
              )}
              {selectedWeek !== currentWeek && (
                <button className="small-btn" onClick={() => setSelectedWeek(currentWeek)}>
                  📍 Jump to This Week
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generate Prompt Modal */}
      {showGeneratePrompt && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>How many meals per day?</h2>
            <p>Choose how many meals to generate for each day of the week</p>
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
              <button className="primary-btn" onClick={handleConfirmGenerate}>
                Generate Week
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
                  onClick={() => handleAddMeal(showMealPicker, meal)}
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
            <button className="secondary-btn" onClick={() => { setShowMealPicker(null); setSearchQuery(''); }}>
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