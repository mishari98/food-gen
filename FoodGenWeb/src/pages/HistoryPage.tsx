import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { formatDisplayDateFull } from '../utils/dateHelpers';
import MealDetailModal from '../components/MealDetailModal';
import type { Meal } from '../types/meal';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { historyPlans, mealsPerDay, regenerateDay, loadPlanForDate, setSelectedDate } = useMealPlan();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [viewingDate, setViewingDate] = useState<string | null>(null);

  const handleView = (dateStr: string) => {
    setViewingDate(dateStr);
    setSelectedDate(dateStr);
    loadPlanForDate(dateStr);
    navigate('/');
  };

  const handleRegenerate = (dateStr: string) => {
    if (window.confirm(`Regenerate meals for ${formatDisplayDateFull(dateStr)}? This will replace the current plan.`)) {
      regenerateDay(dateStr);
    }
  };

  // Group by week
  const groupedByWeek: { weekKey: string; plans: typeof historyPlans }[] = [];
  historyPlans.forEach(plan => {
    const weekKey = `Week ${plan.weekOfYear}`;
    const existing = groupedByWeek.find(g => g.weekKey === weekKey);
    if (existing) {
      existing.plans.push(plan);
    } else {
      groupedByWeek.push({ weekKey, plans: [plan] });
    }
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <div className="header-title">
          <span className="app-title">📋 Plan History</span>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        {historyPlans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No past plans yet</h3>
            <p>Generate some meals and they'll appear here for easy access later.</p>
          </div>
        ) : (
          <div className="history-list">
            {groupedByWeek.map(group => (
              <div key={group.weekKey} className="history-week-group">
                <h3 className="history-week-title">{group.weekKey}</h3>
                {group.plans
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(plan => {
                    const date = new Date(plan.date + 'T00:00:00');
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const mealCount = mealsPerDay;
                    
                    return (
                      <div key={plan.date} className="history-card">
                        <div className="history-card-header">
                          <span className="history-day-name">{dayName}</span>
                          <span className="history-date">{monthDay}</span>
                        </div>
                        <div className="history-card-body">
                          <div className="history-meals-preview">
                            {plan.breakfast && <span className="history-meal-emoji">{plan.breakfast.emoji}</span>}
                            {plan.lunch && <span className="history-meal-emoji">{plan.lunch.emoji}</span>}
                            {plan.dinner && <span className="history-meal-emoji">{plan.dinner.emoji}</span>}
                          </div>
                          <span className="history-meal-count">{mealCount} meal{mealCount > 1 ? 's' : ''}</span>
                        </div>
                        <div className="history-card-actions">
                          <button
                            className="small-btn"
                            onClick={() => handleView(plan.date)}
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
            ))}
          </div>
        )}
      </div>

      {/* Meal Detail Modal */}
      <MealDetailModal
        visible={!!selectedMeal}
        meal={selectedMeal}
        onClose={() => {
          setSelectedMeal(null);
          setViewingDate(null);
        }}
      />
    </div>
  );
}