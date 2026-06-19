import type { Meal, DayPlan } from '../types/meal';
import { getMealsPerDay } from './preferenceManager';
import { getSlotsForMealsPerDay } from '../utils/constants';
import { getWeekNumber, formatDateString } from '../utils/dateHelpers';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function generateTodayPlan(allMeals: Meal[] = []): Promise<Omit<DayPlan, 'id'> | null> {
  const mealsPerDay = await getMealsPerDay();
  const activeSlots = getSlotsForMealsPerDay(mealsPerDay);

  if (allMeals.length === 0) return null;

  const shuffled = shuffleArray(allMeals);
  const today = new Date();
  const dateStr = formatDateString(today);
  const weekOfYear = getWeekNumber(today);
  const year = today.getFullYear();

  const slotToMeal: Record<string, number | null> = {
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  };

  let mealIndex = 0;
  for (const slot of activeSlots) {
    if (mealIndex < shuffled.length) {
      slotToMeal[slot] = shuffled[mealIndex].id;
      mealIndex++;
    }
  }

  return {
    date: dateStr,
    weekOfYear,
    year,
    breakfastId: slotToMeal.breakfast,
    lunchId: slotToMeal.lunch,
    dinnerId: slotToMeal.dinner,
    snackId: slotToMeal.snack,
    isGenerated: 1,
  };
}

export async function generateWeeklyPlan(allMeals: Meal[] = []): Promise<Omit<DayPlan, 'id'>[]> {
  const mealsPerDay = await getMealsPerDay();
  const activeSlots = getSlotsForMealsPerDay(mealsPerDay);

  if (allMeals.length === 0) return [];

  const shuffled = shuffleArray(allMeals);
  const today = new Date();
  const weekOfYear = getWeekNumber(today);
  const year = today.getFullYear();

  const plans: Omit<DayPlan, 'id'>[] = [];
  let mealIndex = 0;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = formatDateString(date);

    const slotToMeal: Record<string, number | null> = {
      breakfast: null,
      lunch: null,
      dinner: null,
      snack: null,
    };

    for (const slot of activeSlots) {
      if (mealIndex < shuffled.length) {
        slotToMeal[slot] = shuffled[mealIndex].id;
        mealIndex++;
      } else {
        const reshuffled = shuffleArray(allMeals);
        slotToMeal[slot] = reshuffled[0].id;
        mealIndex++;
      }
    }

    plans.push({
      date: dateStr,
      weekOfYear,
      year,
      breakfastId: slotToMeal.breakfast,
      lunchId: slotToMeal.lunch,
      dinnerId: slotToMeal.dinner,
      snackId: slotToMeal.snack,
      isGenerated: 1,
    });
  }

  return plans;
}

export async function regenerateDay(dateStr: string, allMeals: Meal[] = []): Promise<Omit<DayPlan, 'id'> | null> {
  const mealsPerDay = await getMealsPerDay();
  const activeSlots = getSlotsForMealsPerDay(mealsPerDay);

  if (allMeals.length === 0) return null;

  const shuffled = shuffleArray(allMeals);
  const date = new Date(dateStr + 'T00:00:00');
  const weekOfYear = getWeekNumber(date);
  const year = date.getFullYear();

  const slotToMeal: Record<string, number | null> = {
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  };

  let mealIndex = 0;
  for (const slot of activeSlots) {
    if (mealIndex < shuffled.length) {
      slotToMeal[slot] = shuffled[mealIndex].id;
      mealIndex++;
    }
  }

  return {
    date: dateStr,
    weekOfYear,
    year,
    breakfastId: slotToMeal.breakfast,
    lunchId: slotToMeal.lunch,
    dinnerId: slotToMeal.dinner,
    snackId: slotToMeal.snack,
    isGenerated: 1,
  };
}