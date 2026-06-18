import { db } from './db';
import type { DayPlan, Meal, DayPlanWithMeals } from '../types/meal';

export async function getDayPlan(date: string): Promise<DayPlan | undefined> {
  return db.dayPlans.where('date').equals(date).first();
}

export async function deleteWeekPlans(weekOfYear: number, year: number): Promise<void> {
  await db.dayPlans.where({ weekOfYear, year }).delete();
}

export async function deleteDayPlan(date: string): Promise<void> {
  await db.dayPlans.where('date').equals(date).delete();
}

export async function insertDayPlan(plan: Omit<DayPlan, 'id'>): Promise<number> {
  return db.dayPlans.add(plan as DayPlan);
}

export async function updateDayPlan(date: string, updates: Partial<DayPlan>): Promise<number> {
  await db.dayPlans.where('date').equals(date).modify(updates);
  const updated = await db.dayPlans.where('date').equals(date).first();
  return updated?.id ?? 0;
}

export async function getWeekPlans(weekOfYear: number, year: number): Promise<DayPlanWithMeals[]> {
  const plans = await db.dayPlans.where({ weekOfYear, year }).toArray();

  const plansWithMeals: DayPlanWithMeals[] = [];

  for (const plan of plans) {
    const [breakfast, lunch, dinner, snack] = await Promise.all([
      plan.breakfastId ? db.meals.get(plan.breakfastId) : undefined,
      plan.lunchId ? db.meals.get(plan.lunchId) : undefined,
      plan.dinnerId ? db.meals.get(plan.dinnerId) : undefined,
      plan.snackId ? db.meals.get(plan.snackId) : undefined,
    ]);

    plansWithMeals.push({
      ...plan,
      breakfast,
      lunch,
      dinner,
      snack,
    });
  }

  return plansWithMeals;
}

export async function saveWeekPlan(name: string, weekOfYear: number, year: number): Promise<number> {
  return db.savedWeekPlans.add({
    name,
    createdAt: new Date().toISOString(),
    weekOfYear,
    year,
  });
}