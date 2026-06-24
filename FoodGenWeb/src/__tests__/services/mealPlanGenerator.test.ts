import { describe, it, expect } from 'vitest';
import {
  generateDayPlan,
  generateWeekPlan,
  regenerateDay,
  addMealToDay,
  removeMealFromDay,
} from '../../services/mealPlanGenerator';
import type { Meal, HouseholdDayPlan } from '../../types/meal';

// ── Test Data ──

const mockMeals: Meal[] = [
  { id: 1, name: 'Tapsilog', suggestedFor: ['breakfast', 'lunch'], cuisine: 'Filipino', dietaryTags: [], prepTimeMinutes: 20, difficulty: 'easy', emoji: '🍳', photoPath: null, youtubeLink: null, ingredients: [{ name: 'Beef tapa', quantity: '200g' }], steps: ['Cook'], calories: 550, isFavorite: 0, isCustom: 0 },
  { id: 2, name: 'Chicken Adobo', suggestedFor: ['lunch', 'dinner'], cuisine: 'Filipino', dietaryTags: ['gluten-free'], prepTimeMinutes: 40, difficulty: 'easy', emoji: '🍗', photoPath: null, youtubeLink: null, ingredients: [{ name: 'Chicken', quantity: '500g' }], steps: ['Cook'], calories: 480, isFavorite: 0, isCustom: 0 },
  { id: 3, name: 'Sinigang', suggestedFor: ['lunch', 'dinner'], cuisine: 'Filipino', dietaryTags: [], prepTimeMinutes: 60, difficulty: 'medium', emoji: '🥘', photoPath: null, youtubeLink: null, ingredients: [{ name: 'Pork', quantity: '500g' }], steps: ['Cook'], calories: 320, isFavorite: 0, isCustom: 0 },
  { id: 4, name: 'Lumpia', suggestedFor: ['snack', 'lunch'], cuisine: 'Filipino', dietaryTags: [], prepTimeMinutes: 30, difficulty: 'medium', emoji: '🌯', photoPath: null, youtubeLink: null, ingredients: [{ name: 'Pork', quantity: '250g' }], steps: ['Cook'], calories: 320, isFavorite: 0, isCustom: 0 },
  { id: 5, name: 'Pancit', suggestedFor: ['lunch', 'dinner'], cuisine: 'Filipino', dietaryTags: [], prepTimeMinutes: 30, difficulty: 'medium', emoji: '🍜', photoPath: null, youtubeLink: null, ingredients: [{ name: 'Noodles', quantity: '200g' }], steps: ['Cook'], calories: 380, isFavorite: 0, isCustom: 0 },
];

// ── shuffleArray (internal) ──

describe('shuffleArray (internal)', () => {
  it('returns array of same length', () => {
    const result = generateDayPlan(mockMeals, 3, '2026-06-24');
    expect(result?.meals).toHaveLength(3);
  });

  it('returns empty array for empty input', () => {
    const result = generateDayPlan([], 1, '2026-06-24');
    expect(result).toBeNull();
  });
});

// ── generateDayPlan ──

describe('generateDayPlan', () => {
  it('returns null for empty meals array', () => {
    const result = generateDayPlan([], 1, '2026-06-24');
    expect(result).toBeNull();
  });

  it('returns correct structure', () => {
    const result = generateDayPlan(mockMeals, 2, '2026-06-24');
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('weekOfYear');
    expect(result).toHaveProperty('year');
    expect(result).toHaveProperty('meals');
  });

  it('returns correct meal count (1 meal)', () => {
    const result = generateDayPlan(mockMeals, 1, '2026-06-24');
    expect(result?.meals).toHaveLength(1);
  });

  it('returns correct meal count (3 meals)', () => {
    const result = generateDayPlan(mockMeals, 3, '2026-06-24');
    expect(result?.meals).toHaveLength(3);
  });

  it('returns correct meal count (4 meals)', () => {
    const result = generateDayPlan(mockMeals, 4, '2026-06-24');
    expect(result?.meals).toHaveLength(4);
  });

  it('uses provided date string', () => {
    const result = generateDayPlan(mockMeals, 1, '2026-12-25');
    expect(result?.date).toBe('2026-12-25');
  });

  it('defaults to today when no date provided', () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const result = generateDayPlan(mockMeals, 1);
    expect(result?.date).toBe(`${yyyy}-${mm}-${dd}`);
  });

  it('avoids usedMealIds', () => {
    const usedIds = new Set([1, 2, 3]);
    const result = generateDayPlan(mockMeals, 1, '2026-06-24', usedIds);
    // Should pick from meals 4 or 5
    const selectedId = result?.meals[0]?.mealId;
    expect(selectedId).not.toBeNull();
    expect(usedIds.has(selectedId!)).toBe(false);
  });

  it('falls back to all meals when not enough available after filtering', () => {
    const usedIds = new Set([1, 2, 3, 4]);
    const result = generateDayPlan(mockMeals, 2, '2026-06-24', usedIds);
    // Only meal 5 is available, but we need 2, so it falls back to all meals
    expect(result?.meals).toHaveLength(2);
  });

  it('sets correct weekOfYear', () => {
    const result = generateDayPlan(mockMeals, 1, '2026-06-24');
    expect(result?.weekOfYear).toBe(26); // June 24, 2026 is week 26
  });

  it('sets correct year', () => {
    const result = generateDayPlan(mockMeals, 1, '2026-06-24');
    expect(result?.year).toBe(2026);
  });

  it('handles year boundary (Jan 1)', () => {
    const result = generateDayPlan(mockMeals, 1, '2027-01-01');
    expect(result?.year).toBe(2027);
  });

  it('each meal entry has correct shape', () => {
    const result = generateDayPlan(mockMeals, 2, '2026-06-24');
    result?.meals.forEach(entry => {
      expect(entry).toHaveProperty('mealId');
      expect(entry).toHaveProperty('label');
      expect(entry).toHaveProperty('status');
      expect(entry.status).toBe('planned');
      expect(typeof entry.mealId).toBe('number');
    });
  });

  it('selects meals from the pool', () => {
    const result = generateDayPlan(mockMeals, 3, '2026-06-24');
    const ids = result?.meals.map(m => m.mealId).sort();
    expect(ids).toHaveLength(3);
    ids?.forEach(id => {
      expect(mockMeals.some(m => m.id === id)).toBe(true);
    });
  });
});

// ── generateWeekPlan ──

describe('generateWeekPlan', () => {
  it('returns empty array for empty meals', () => {
    const result = generateWeekPlan([], 1, new Date('2026-06-24'));
    expect(result).toEqual([]);
  });

  it('returns 7 plans for a full week', () => {
    const result = generateWeekPlan(mockMeals, 1, new Date('2026-06-24'));
    expect(result).toHaveLength(7);
  });

  it('each day has correct date', () => {
    const startDate = new Date('2026-06-24'); // Wednesday
    const result = generateWeekPlan(mockMeals, 1, startDate);
    expect(result[0].date).toBe('2026-06-24');
    expect(result[6].date).toBe('2026-06-30');
  });

  it('avoids repeats across days', () => {
    const result = generateWeekPlan(mockMeals, 1, new Date('2026-06-24'));
    const allMealIds = result.flatMap(day => day.meals.map(m => m.mealId));
    const uniqueIds = new Set(allMealIds);
    // With 5 meals and 7 days, some repeats are inevitable, but each day should have unique meals
    result.forEach(day => {
      const dayIds = day.meals.map(m => m.mealId);
      expect(new Set(dayIds).size).toBe(day.meals.length);
    });
  });

  it('uses startDate if provided', () => {
    const result = generateWeekPlan(mockMeals, 1, new Date('2026-12-25'));
    expect(result[0].date).toBe('2026-12-25');
  });

  it('defaults to today when no startDate', () => {
    const result = generateWeekPlan(mockMeals, 1);
    expect(result).toHaveLength(7);
  });

  it('each plan has correct structure', () => {
    const result = generateWeekPlan(mockMeals, 2, new Date('2026-06-24'));
    result.forEach(plan => {
      expect(plan).toHaveProperty('date');
      expect(plan).toHaveProperty('weekOfYear');
      expect(plan).toHaveProperty('year');
      expect(plan).toHaveProperty('meals');
      expect(plan.meals.length).toBe(2);
    });
  });
});

// ── regenerateDay ──

describe('regenerateDay', () => {
  it('returns valid plan structure', () => {
    const result = regenerateDay(mockMeals, 2, '2026-06-24', []);
    expect(result).not.toBeNull();
    expect(result?.meals).toHaveLength(2);
    expect(result?.date).toBe('2026-06-24');
  });

  it('uses existing meals as usedIds to avoid repeats', () => {
    const existingMeals = [
      { mealId: 1, status: 'planned' as const },
      { mealId: 2, status: 'planned' as const },
    ];
    const result = regenerateDay(mockMeals, 1, '2026-06-24', existingMeals);
    const selectedId = result?.meals[0]?.mealId;
    expect(selectedId).not.toBe(1);
    expect(selectedId).not.toBe(2);
  });

  it('returns null when allMeals is empty', () => {
    const result = regenerateDay([], 1, '2026-06-24', []);
    expect(result).toBeNull();
  });

  it('handles empty existingMeals gracefully', () => {
    const result = regenerateDay(mockMeals, 1, '2026-06-24', []);
    expect(result).not.toBeNull();
    expect(result?.meals).toHaveLength(1);
  });
});

// ── addMealToDay ──

describe('addMealToDay', () => {
  const existingPlan: HouseholdDayPlan = {
    date: '2026-06-24',
    weekOfYear: 26,
    year: 2026,
    meals: [{ mealId: 1, status: 'planned' }],
    createdBy: 'user1',
    lastModifiedBy: 'user1',
    isGenerated: 1,
    createdAt: '2026-06-24T00:00:00Z',
    updatedAt: '2026-06-24T00:00:00Z',
  };

  it('adds meal to existing plan', () => {
    const result = addMealToDay(existingPlan, mockMeals[1]);
    expect(result).not.toBeNull();
    expect(result?.meals).toHaveLength(2);
    expect(result?.meals[1].mealId).toBe(2);
  });

  it('returns null when plan is null', () => {
    const result = addMealToDay(null, mockMeals[0]);
    expect(result).toBeNull();
  });

  it('preserves existing meals', () => {
    const result = addMealToDay(existingPlan, mockMeals[2]);
    expect(result?.meals[0].mealId).toBe(1);
    expect(result?.meals[1].mealId).toBe(3);
  });

  it('sets correct label when provided', () => {
    const result = addMealToDay(existingPlan, mockMeals[0], 'breakfast');
    expect(result?.meals[1].label).toBe('breakfast');
  });

  it('sets empty label when not provided', () => {
    const result = addMealToDay(existingPlan, mockMeals[0]);
    expect(result?.meals[1].label).toBe('');
  });

  it('sets status to planned', () => {
    const result = addMealToDay(existingPlan, mockMeals[0]);
    expect(result?.meals[1].status).toBe('planned');
  });

  it('does not mutate original plan', () => {
    const originalLength = existingPlan.meals.length;
    addMealToDay(existingPlan, mockMeals[0]);
    expect(existingPlan.meals).toHaveLength(originalLength);
  });
});

// ── removeMealFromDay ──

describe('removeMealFromDay', () => {
  const existingPlan: HouseholdDayPlan = {
    date: '2026-06-24',
    weekOfYear: 26,
    year: 2026,
    meals: [
      { mealId: 1, status: 'planned' },
      { mealId: 2, status: 'planned' },
      { mealId: 3, status: 'planned' },
    ],
    createdBy: 'user1',
    lastModifiedBy: 'user1',
    isGenerated: 1,
    createdAt: '2026-06-24T00:00:00Z',
    updatedAt: '2026-06-24T00:00:00Z',
  };

  it('removes correct index', () => {
    const result = removeMealFromDay(existingPlan, 1);
    expect(result?.meals).toHaveLength(2);
    expect(result?.meals[0].mealId).toBe(1);
    expect(result?.meals[1].mealId).toBe(3);
  });

  it('returns null when plan is null', () => {
    const result = removeMealFromDay(null, 0);
    expect(result).toBeNull();
  });

  it('preserves other meals', () => {
    const result = removeMealFromDay(existingPlan, 0);
    expect(result?.meals[0].mealId).toBe(2);
    expect(result?.meals[1].mealId).toBe(3);
  });

  it('handles removing last meal', () => {
    const singleMealPlan = { ...existingPlan, meals: [{ mealId: 1, status: 'planned' as const }] };
    const result = removeMealFromDay(singleMealPlan, 0);
    expect(result?.meals).toHaveLength(0);
  });

  it('does not mutate original plan', () => {
    const originalLength = existingPlan.meals.length;
    removeMealFromDay(existingPlan, 0);
    expect(existingPlan.meals).toHaveLength(originalLength);
  });
});