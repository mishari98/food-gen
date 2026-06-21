import React from 'react';
import type { Meal, MealStatus } from '../types/meal';
import DifficultyBadge from './DifficultyBadge';

interface Props {
  meal?: Meal;
  label?: string;
  status?: MealStatus;
  showRemove?: boolean;
  onRemove?: () => void;
  onStatusClick?: () => void;
  onClick?: () => void;
}

const STATUS_LABELS: Record<MealStatus, string> = {
  planned: '📋 Planned',
  in_progress: '👨‍🍳 Cooking',
  completed: '✅ Done',
  skipped: '⏭️ Skipped',
};

const STATUS_COLORS: Record<MealStatus, string> = {
  planned: '#666',
  in_progress: '#FF9800',
  completed: '#4CAF50',
  skipped: '#9E9E9E',
};

export default function MealCard({ meal, label, status, showRemove, onRemove, onStatusClick, onClick }: Props) {
  if (!meal) {
    return (
      <div className="meal-card">
        <div className="meal-card-empty">No meal assigned</div>
      </div>
    );
  }

  return (
    <div className="meal-card" data-custom={meal.isCustom ? 'true' : undefined}>
      <div className="meal-card-content" onClick={onClick}>
        <div className="meal-card-body">
          <span className="meal-emoji">{meal.emoji}</span>
          <div className="meal-info">
            <span className="meal-name">
              {meal.name}
              {label && <span className="meal-label">{label}</span>}
              {meal.isCustom === 1 && <span className="custom-badge"> 👤 You</span>}
            </span>
            <div className="meal-meta">
              <span className="prep-time">⏱ {meal.prepTimeMinutes} min</span>
              <DifficultyBadge difficulty={meal.difficulty} />
            </div>
          </div>
        </div>
      </div>
      <div className="meal-card-actions">
        {status && (
          <button
            className="status-badge"
            style={{ backgroundColor: STATUS_COLORS[status] }}
            onClick={(e) => {
              e.stopPropagation();
              onStatusClick?.();
            }}
          >
            {STATUS_LABELS[status]}
          </button>
        )}
        {showRemove && (
          <button
            className="remove-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}