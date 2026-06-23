import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { formatDisplayDateFull, getWeekNumber } from '../utils/dateHelpers';
import MealDetailModal from '../components/MealDetailModal';
import type { Meal } from '../types/meal';

export default function HistoryPage() {
  const navigate = useNavigate();
  const {
    household,
    weekPlans,
    selectedDate,
    setSelectedDate,
    regenerateDay,
    allMeals,
  } = useMealPlan();

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Filter plans for selected week
  const weekPlansFiltered = weekPlans.filter(p => p.weekOfYear === selectedWeek && p.year === selectedYear);

  const handleViewDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    navigate('/day');
  };

  const handleRegenerate = (dateStr: string) => {
    if (window.confirm(`Regenerate meals for ${formatDisplayDateFull(dateStr)}? This will replace the current plan.`)) {
      regenerateDay(dateStr, 3); // Default to 3 meals
    }
  };

  const prevWeek = () => {
    const newWeek = selectedWeek - 1;
    if (newWeek < 1) {
      setSelectedWeek(52);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedWeek(newWeek);
    }
  };

  const nextWeek = () => {
    const newWeek = selectedWeek + 1;
    if (newWeek > 52) {
      setSelectedWeek(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedWeek(newWeek);
    }
  };

  const isCurrentWeek = selectedWeek === getWeekNumber(new Date()) && selectedYear === new Date().getFullYear();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/day')}>←</button>
        <div className="header-title">
          <span className="app-title">📋 Plan History</span>
        </div>
        <div className="header-spacer" />
      </div>

      {/* Week Selector */}
      <div className="week-selector">
        <button className="icon-btn" onClick={prevWeek}>◀</button>
        <div className="week-info">
          <span className="week-label">Week {selectedWeek}</span>
          <span className="year-label">{selectedYear}</span>
        </div>
        <button className="icon-btn" onClick={nextWeek}>▶</button>
        {!isCurrentWeek && (
          <button className="small-btn" onClick={() => {
            const now = new Date();
            setSelectedWeek(getWeekNumber(now));
            setSelectedYear(now.getFullYear());
          }}>
            📍 This Week
          </button>
        )}
      </div>

      {/* Content */}
      <div className="content-area">
        {!household ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>No Household</h3>
            <p>Join or create a household to view plan history.</p>
          </div>
        ) : weekPlansFiltered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No plans for this week</h3>
            <p>Generate some meals and they'll appear here for easy access later.</p>
            <button className="primary-btn" onClick={() => navigate('/day')}>
              📅 Go to Meal Plans
            </button>
          </div>
        ) : (
          <div className="history-list">
            {weekPlansFiltered
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(plan => {
                const date = new Date(plan.date + 'T00:00:00');
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const mealCount = plan.meals.length;

                return (
                  <div key={plan.date} className="history-card">
                    <div className="history-card-header">
                      <div>
                        <span className="history-day-name">{dayName}</span>
                        <span className="history-date">{monthDay}</span>
                      </div>
                      <span className="history-meal-count">{mealCount} meal{mealCount !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="history-card-body">
                      <div className="history-meals-preview">
                        {plan.meals.slice(0, 4).map((entry, idx) => (
                          <span key={idx} className="history-meal-emoji" title={entry.meal?.name || 'Unknown'}>
                            {entry.meal?.emoji || '🍽️'}
                          </span>
                        ))}
                        {plan.meals.length > 4 && (
                          <span className="history-more">+{plan.meals.length - 4}</span>
                        )}
                      </div>
                    </div>

                    <div className="history-card-actions">
                      <button
                        className="small-btn"
                        onClick={() => handleViewDay(plan.date)}
                      >
                        👁 View
                      </button>
                      <button
                        className="small-btn secondary"
                        onClick={() => handleRegenerate(plan.date)}
                      >
                        🔄 Regenerate
                      </button>
                    </div>
                  </div>
                );
              })}
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