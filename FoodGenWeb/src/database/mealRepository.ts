import { db } from './db';
import type { Meal } from '../types/meal';

export interface MealInput {
  name: string;
  suggestedFor: string;
  cuisine: string;
  dietaryTags: string;
  prepTimeMinutes: number;
  difficulty: string;
  emoji: string;
  photoPath?: string | null;
  youtubeLink?: string | null;
  ingredients: string;
  steps: string;
  calories?: number | null;
}

export async function getAllMeals(): Promise<Meal[]> {
  const meals = await db.meals.orderBy('name').toArray();
  return meals.sort((a, b) => a.isCustom - b.isCustom || a.name.localeCompare(b.name));
}

export async function getMealById(id: number): Promise<Meal | undefined> {
  return db.meals.get(id);
}

export async function insertMeal(meal: MealInput): Promise<number> {
  const newMeal = {
    name: meal.name,
    suggestedFor: meal.suggestedFor,
    cuisine: meal.cuisine,
    dietaryTags: meal.dietaryTags,
    prepTimeMinutes: meal.prepTimeMinutes,
    difficulty: meal.difficulty,
    emoji: meal.emoji,
    photoPath: meal.photoPath ?? null,
    youtubeLink: meal.youtubeLink ?? null,
    ingredients: meal.ingredients,
    steps: meal.steps,
    calories: meal.calories ?? null,
    isFavorite: 0,
    isCustom: 1,
  };
  // Use table.add which returns the new auto-incremented id
  return db.meals.add(newMeal as any);
}

export async function insertSeedMeals(meals: MealInput[]): Promise<void> {
  const mealsToInsert = meals.map(meal => ({
    name: meal.name,
    suggestedFor: meal.suggestedFor,
    cuisine: meal.cuisine,
    dietaryTags: meal.dietaryTags,
    prepTimeMinutes: meal.prepTimeMinutes,
    difficulty: meal.difficulty,
    emoji: meal.emoji,
    photoPath: null,
    youtubeLink: null,
    ingredients: meal.ingredients,
    steps: meal.steps,
    calories: meal.calories ?? null,
    isFavorite: 0,
    isCustom: 0,
  }));
  await db.meals.bulkAdd(mealsToInsert as any);
}

export async function updateMeal(meal: Meal): Promise<void> {
  await db.meals.put({ ...meal });
}

export async function deleteCustomMeal(id: number): Promise<void> {
  await db.meals.where('id').equals(id).and(meal => meal.isCustom === 1).delete();
}

export async function getMealCount(): Promise<number> {
  return db.meals.count();
}

export async function toggleFavorite(id: number): Promise<void> {
  const meal = await db.meals.get(id);
  if (meal) {
    await db.meals.update(id, { isFavorite: meal.isFavorite ? 0 : 1 });
  }
}