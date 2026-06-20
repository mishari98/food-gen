import React, { useState } from 'react';
import type { DayPlanWithMeals, Meal } from '../types/meal';
import { getSlotsForMealsPerDay, getSlotEmoji, type MealSlotName } from '../utils/constants';
import MealCard from './MealCard';

interface Props {
  dayPlan: DayPlanWithMeals;
  mealsPerDay: number;
  onMealClick: (meal: Meal) => void;
  onRegenerateDay: (date: string) => void;
}

export default function DayRow({ dayPlan, mealsPerDay, onMealClick, onRegenerateDay }: Props) {
  const [expanded, setExpanded] = useState(false);
  const activeSlots = getSlotsForMealsPerDay(mealsPerDay);

  const date = new Date(dayPlan.date + 'T00:00:00');
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  const getMealForSlot = (slot: MealSlotName): Meal | undefined => {
    switch (slot) {
      case 'breakfast': return dayPlan.breakfast;
      case 'lunch': return dayPlan.lunch;
      case 'dinner': return dayPlan.dinner;
      case 'snack': return dayPlan.snack;
    }
  };

  return (
    <div className={`day-row ${expanded ? 'expanded' : ''}`}>
      <div className="day-row-header" onClick={() => setExpanded(!expanded)}>
        <div className="day-info">
          <span className="day-name">{dayName}</span>
          <span className="day-date">{monthName} {dayNumber}</span>
        </div>
        <div className="day-preview">
          {!expanded && activeSlots.map(slot => {
            const meal = getMealForSlot(slot);
            return (
              <span key={slot} className="day-preview-meal">
                {meal?.emoji || '🍽️'}
              </span>
            );
          })}
        </div>
        <div className="day-actions">
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
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      
      {expanded && (
        <div className="day-row-content">
          {activeSlots.map(slot => {
            const meal = getMealForSlot(slot);
            return (
              <div key={slot} onClick={() => meal && onMealClick(meal)} style={{ cursor: meal ? 'pointer' : 'default' }}>
                <MealCard meal={meal} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}