import React from 'react';
import type { Meal } from '../types/meal';
import DifficultyBadge from './DifficultyBadge';

interface Props {
  visible: boolean;
  meal: Meal | null;
  onClose: () => void;
}

export default function MealDetailModal({ visible, meal, onClose }: Props) {
  if (!visible || !meal) return null;

  const parseJsonField = (field: any, fallback: any[] = []): any[] => {
    if (!field) return fallback;
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field as string);
    } catch {
      return fallback;
    }
  };

  const suggestedFor: string[] = parseJsonField(meal.suggestedFor);
  const ingredients: { name: string; quantity: string }[] = parseJsonField(meal.ingredients);
  const steps: string[] = parseJsonField(meal.steps);
  const dietaryTags: string[] = parseJsonField(meal.dietaryTags);

  const slotEmojis: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍿',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        
        <div className="modal-header">
          <span className="modal-emoji">{meal.emoji}</span>
          <h2 className="modal-title">{meal.name}</h2>
          {meal.isCustom === 1 && <span className="custom-badge-large">👤 You</span>}
        </div>

        <div className="modal-slots">
          {suggestedFor.map((slot: string) => (
            <span key={slot} className="slot-pill">
              {slotEmojis[slot] || '🍽️'} {slot}
            </span>
          ))}
        </div>

        <div className="modal-meta">
          <span className="prep-time">⏱ {meal.prepTimeMinutes} min</span>
          <DifficultyBadge difficulty={meal.difficulty} />
          {meal.calories && <span className="calories">🔥 ~{meal.calories} cal</span>}
        </div>

        {meal.youtubeLink && (
          <a
            href={meal.youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="youtube-btn"
          >
            ▶️ Watch Recipe on YouTube
          </a>
        )}

        <div className="modal-section">
          <h3 className="section-header">Ingredients</h3>
          <ul className="ingredient-list">
            {ingredients.map((ing, i) => (
              <li key={i}>
                <span className="ing-name">{ing.name}</span>
                <span className="ing-qty">{ing.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="modal-section">
          <h3 className="section-header">Steps</h3>
          <ol className="steps-list">
            {steps.map((step, i) => (
              <li key={i}>
                <span className="step-number">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {dietaryTags.length > 0 && (
          <div className="modal-tags">
            {dietaryTags.map((tag: string) => (
              <span key={tag} className="dietary-tag">🌿 {tag}</span>
            ))}
          </div>
        )}

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}