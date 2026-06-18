import { getAllMeals } from '../database/mealRepository';
import { insertDayPlan, deleteDayPlan, deleteWeekPlans } from '../database/planRepository';
import { getMealsPerDay } from './preferenceManager';
import type { DayPlan } from '../types/meal';
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

export async function generateTodayPlan(): Promise<DayPlan | null> {
  const allMeals = await getAllMeals();
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

  const plan: Omit<DayPlan, 'id'> = {
    date: dateStr,
    weekOfYear,
    year,
    breakfastId: slotToMeal.breakfast,
    lunchId: slotToMeal.lunch,
    dinnerId: slotToMeal.dinner,
    snackId: slotToMeal.snack,
    isGenerated: 1,
  };

  // Delete existing plan for today to avoid duplicates
  await deleteDayPlan(dateStr);

  const id = await insertDayPlan(plan);
  return { ...plan, id };
}

export async function generateWeeklyPlan(): Promise<DayPlan[]> {
  const allMeals = await getAllMeals();
  const mealsPerDay = await getMealsPerDay();
  const activeSlots = getSlotsForMealsPerDay(mealsPerDay);

  if (allMeals.length === 0) return [];

  const shuffled = shuffleArray(allMeals);
  const today = new Date();
  const weekOfYear = getWeekNumber(today);
  const year = today.getFullYear();

  // Delete existing week plans
  await deleteWeekPlans(weekOfYear, year);

  const plans: DayPlan[] = [];
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
        // If we ran out of unique meals, reshuffle and reuse
        const reshuffled = shuffleArray(allMeals);
        slotToMeal[slot] = reshuffled[0].id;
        mealIndex++;
      }
    }

    const plan: Omit<DayPlan, 'id'> = {
      date: dateStr,
      weekOfYear,
      year,
      breakfastId: slotToMeal.breakfast,
      lunchId: slotToMeal.lunch,
      dinnerId: slotToMeal.dinner,
      snackId: slotToMeal.snack,
      isGenerated: 1,
    };

    const id = await insertDayPlan(plan);
    plans.push({ ...plan, id });
  }

  return plans;
}

export async function regenerateDay(dateStr: string): Promise<DayPlan | null> {
  const allMeals = await getAllMeals();
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

  const plan: Omit<DayPlan, 'id'> = {
    date: dateStr,
    weekOfYear,
    year,
    breakfastId: slotToMeal.breakfast,
    lunchId: slotToMeal.lunch,
    dinnerId: slotToMeal.dinner,
    snackId: slotToMeal.snack,
    isGenerated: 1,
  };

  // Delete existing plan for that date only
  await deleteDayPlan(dateStr);

  const id = await insertDayPlan(plan);
  return { ...plan, id };
}