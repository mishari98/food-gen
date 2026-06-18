import Dexie, { type Table } from 'dexie';
import type { Meal, DayPlan, SavedWeekPlan } from '../types/meal';

export class FoodGenDatabase extends Dexie {
  meals!: Table<Meal, number>;
  dayPlans!: Table<DayPlan, number>;
  savedWeekPlans!: Table<SavedWeekPlan, number>;

  constructor() {
    super('foodgen');

    // Version 2: Full schema with savedWeekPlans table
    this.version(2).stores({
      meals: '++id, name, cuisine, isCustom',
      dayPlans: '++id, date, weekOfYear, year',
      savedWeekPlans: '++id, weekOfYear, year',
    });
  }
}

export const db = new FoodGenDatabase();