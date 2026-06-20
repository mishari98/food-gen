import React from 'react';
import type { Meal } from '../types/meal';
import DifficultyBadge from './DifficultyBadge';

interface Props {
  meal: Meal | undefined;
}

export default function MealCard({ meal }: Props) {
  if (!meal) {
    return (
      <div className="meal-card">
        <div className="meal-card-empty">No meal assigned</div>
      </div>
    );
  }

  return (
    <div className="meal-card" data-custom={meal.isCustom ? 'true' : undefined}>
      <div className="meal-card-content">
        <div className="meal-card-body">
          <span className="meal-emoji">{meal.emoji}</span>
          <div className="meal-info">
            <span className="meal-name">
              {meal.name}
              {meal.isCustom === 1 && <span className="custom-badge"> 👤 You</span>}
            </span>
            <div className="meal-meta">
              <span className="prep-time">⏱ {meal.prepTimeMinutes} min</span>
              <DifficultyBadge difficulty={meal.difficulty} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}