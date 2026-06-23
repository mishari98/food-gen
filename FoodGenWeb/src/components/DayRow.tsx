import React, { useState } from 'react';
import type { Meal, HouseholdDayPlanWithMeals, MealStatus } from '../types/meal';
import MealCard from './MealCard';

const STATUS_CYCLE: MealStatus[] = ['planned', 'in_progress', 'completed', 'skipped'];

interface Props {
  dayPlan: HouseholdDayPlanWithMeals;
  canEdit?: boolean;
  onMealClick: (meal: Meal) => void;
  onRegenerateDay: (date: string) => void;
  onAddMeal: (date: string) => void;
  onRemoveMeal: (date: string, index: number) => void;
  onStatusChange: (date: string, index: number, status: MealStatus) => void;
}

export default function DayRow({
  dayPlan,
  canEdit = false,
  onMealClick,
  onRegenerateDay,
  onAddMeal,
  onRemoveMeal,
  onStatusChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(dayPlan.date + 'T00:00:00');
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  const meals = dayPlan.meals.filter(m => m.meal);

  return (
    <div className={`day-row ${expanded ? 'expanded' : ''}`}>
      <div className="day-row-header" onClick={() => setExpanded(!expanded)}>
        <div className="day-info">
          <span className="day-name">{dayName}</span>
          <span className="day-date">{monthName} {dayNumber}</span>
        </div>
        <div className="day-preview">
          {!expanded && meals.slice(0, 3).map((entry, idx) => (
            <span key={idx} className="day-preview-meal">
              {entry.meal?.emoji || '🍽️'}
            </span>
          ))}
          {!expanded && meals.length > 3 && (
            <span className="day-preview-more">+{meals.length - 3}</span>
          )}
          {!expanded && meals.length === 0 && (
            <span className="day-preview-empty">No meals</span>
          )}
        </div>
        <div className="day-actions">
          {canEdit && (
            <button
              className="regenerate-day-btn"
              onClick={e => {
                e.stopPropagation();
                if (window.confirm(`Regenerate meals for ${dayName}? This will replace the current plan for this day.`)) {
                  onRegenerateDay(dayPlan.date);
                }
              }}
              title="Regenerate this day"
            >
              ↻
            </button>
          )}
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      
      {expanded && (
        <div className="day-row-content">
          {meals.length === 0 ? (
            <p className="day-row-empty">No meals planned for this day</p>
          ) : (
            meals.map((entry, index) => (
              <div key={index} className="day-meal-wrapper">
                <MealCard
                  meal={entry.meal}
                  label={entry.label}
                  status={entry.status || 'planned'}
                  showRemove={canEdit}
                  onRemove={() => onRemoveMeal(dayPlan.date, index)}
                  onStatusClick={() => {
                    const currentIdx = STATUS_CYCLE.indexOf(entry.status || 'planned');
                    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
                    onStatusChange(dayPlan.date, index, nextStatus);
                  }}
                  onClick={() => entry.meal && onMealClick(entry.meal)}
                />
              </div>
            ))
          )}
          {canEdit && (
            <button className="add-meal-small-btn" onClick={() => onAddMeal(dayPlan.date)}>
              ➕ Add Meal
            </button>
          )}
        </div>
      )}
    </div>
  );
}