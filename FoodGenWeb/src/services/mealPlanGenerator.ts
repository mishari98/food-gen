import type { Meal, MealEntry, HouseholdDayPlan } from '../types/meal';
import { getWeekNumber, formatDateString } from '../utils/dateHelpers';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a day plan with flexible meal count
 * @param allMeals - Pool of meals to choose from (reference + custom)
 * @param mealCount - Number of meals to generate (1-4)
 * @param date - Date string (YYYY-MM-DD), defaults to today
 * @param usedMealIds - Meal IDs already used this week (to avoid repeats)
 */
export function generateDayPlan(
  allMeals: Meal[] = [],
  mealCount: number = 1,
  date?: string,
  usedMealIds: Set<number> = new Set()
): Omit<HouseholdDayPlan, 'createdBy' | 'lastModifiedBy' | 'isGenerated' | 'createdAt' | 'updatedAt'> | null {
  if (allMeals.length === 0) return null;

  // Filter out already-used meals
  const availableMeals = allMeals.filter(m => !usedMealIds.has(m.id));
  const pool = availableMeals.length >= mealCount ? availableMeals : allMeals;

  // Shuffle and pick
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, mealCount);

  // Create MealEntry array with default 'planned' status
  const meals: MealEntry[] = selected.map(meal => ({
    mealId: meal.id,
    label: '', // Optional label (user can add later)
    status: 'planned' as const,
  }));

  const targetDate = date || formatDateString(new Date());
  const dateObj = new Date(targetDate + 'T00:00:00');
  const weekOfYear = getWeekNumber(dateObj);
  const year = dateObj.getFullYear();

  return {
    date: targetDate,
    weekOfYear,
    year,
    meals,
  };
}

/**
 * Generate a full week plan (7 days)
 * @param allMeals - Pool of meals to choose from
 * @param mealCount - Number of meals per day (1-4)
 * @param startDate - Starting date (defaults to today)
 */
export function generateWeekPlan(
  allMeals: Meal[] = [],
  mealCount: number = 1,
  startDate?: Date
): Omit<HouseholdDayPlan, 'createdBy' | 'lastModifiedBy' | 'isGenerated' | 'createdAt' | 'updatedAt'>[] {
  if (allMeals.length === 0) return [];

  const today = startDate || new Date();
  const plans: Omit<HouseholdDayPlan, 'createdBy' | 'lastModifiedBy' | 'isGenerated' | 'createdAt' | 'updatedAt'>[] = [];
  const usedMealIds = new Set<number>();

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = formatDateString(date);

    const plan = generateDayPlan(allMeals, mealCount, dateStr, usedMealIds);
    if (plan) {
      // Track used meals to avoid repeats
      plan.meals.forEach(m => {
        if (m.mealId) usedMealIds.add(m.mealId);
      });
      plans.push(plan);
    }
  }

  return plans;
}

/**
 * Regenerate a single day (replace all meals)
 */
export function regenerateDay(
  allMeals: Meal[] = [],
  mealCount: number = 1,
  dateStr: string,
  existingMeals: MealEntry[] = []
): Omit<HouseholdDayPlan, 'createdBy' | 'lastModifiedBy' | 'isGenerated' | 'createdAt' | 'updatedAt'> | null {
  // Collect used meal IDs from existing plan (excluding current day's meals if we want variety)
  const usedMealIds = new Set<number>();
  existingMeals.forEach(m => {
    if (m.mealId) usedMealIds.add(m.mealId);
  });

  return generateDayPlan(allMeals, mealCount, dateStr, usedMealIds);
}

/**
 * Add a single meal to an existing day plan
 */
export function addMealToDay(
  existingPlan: HouseholdDayPlan | null,
  meal: Meal,
  label?: string
): HouseholdDayPlan | null {
  if (!existingPlan) return null;

  const newEntry: MealEntry = {
    mealId: meal.id,
    label: label || '',
    status: 'planned',
  };

  return {
    ...existingPlan,
    meals: [...existingPlan.meals, newEntry],
  };
}

/**
 * Remove a meal from an existing day plan by index
 */
export function removeMealFromDay(
  existingPlan: HouseholdDayPlan | null,
  mealIndex: number
): HouseholdDayPlan | null {
  if (!existingPlan) return null;

  const updatedMeals = existingPlan.meals.filter((_, idx) => idx !== mealIndex);

  return {
    ...existingPlan,
    meals: updatedMeals,
  };
}