import { getDatabase } from './database';
import { Meal } from '../types/meal';

// Type for creating meals without DB-specific fields
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
  const db = await getDatabase();
  const rows = await db.getAllAsync<Meal>('SELECT * FROM meals ORDER BY is_custom ASC, name ASC');
  return rows;
}

export async function getMealById(id: number): Promise<Meal | null> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Meal>('SELECT * FROM meals WHERE id = ?', id);
  return rows.length > 0 ? rows[0] : null;
}

export async function insertMeal(meal: Omit<Meal, 'id' | 'isFavorite' | 'isCustom'> & { difficulty: string }): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO meals (name, suggested_for, cuisine, dietary_tags, prep_time_minutes, difficulty, emoji, photo_path, youtube_link, ingredients, steps, calories, is_favorite, is_custom)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`,
    meal.name,
    meal.suggestedFor,
    meal.cuisine,
    meal.dietaryTags,
    meal.prepTimeMinutes,
    meal.difficulty,
    meal.emoji,
    meal.photoPath ?? null,
    meal.youtubeLink ?? null,
    meal.ingredients,
    meal.steps,
    meal.calories ?? null
  );
  return result.lastInsertRowId;
}

export async function insertSeedMeals(meals: MealInput[]): Promise<void> {
  const db = await getDatabase();
  for (const meal of meals) {
    await db.runAsync(
      `INSERT INTO meals (name, suggested_for, cuisine, dietary_tags, prep_time_minutes, difficulty, emoji, photo_path, youtube_link, ingredients, steps, calories, is_favorite, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      meal.name,
      meal.suggestedFor,
      meal.cuisine,
      meal.dietaryTags,
      meal.prepTimeMinutes,
      meal.difficulty,
      meal.emoji,
      null,
      null,
      meal.ingredients,
      meal.steps,
      meal.calories ?? null
    );
  }
}

export async function updateMeal(meal: Meal): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE meals SET name = ?, suggested_for = ?, cuisine = ?, dietary_tags = ?, prep_time_minutes = ?, difficulty = ?, emoji = ?, photo_path = ?, youtube_link = ?, ingredients = ?, steps = ?, calories = ?, is_favorite = ?
     WHERE id = ? AND is_custom = 1`,
    meal.name,
    meal.suggestedFor,
    meal.cuisine,
    meal.dietaryTags,
    meal.prepTimeMinutes,
    meal.difficulty,
    meal.emoji,
    meal.photoPath ?? null,
    meal.youtubeLink ?? null,
    meal.ingredients,
    meal.steps,
    meal.calories ?? null,
    meal.isFavorite,
    meal.id
  );
}

export async function deleteCustomMeal(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM meals WHERE id = ? AND is_custom = 1', id);
}

export async function getMealCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM meals');
  return result?.count ?? 0;
}

export async function toggleFavorite(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE meals SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?',
    id
  );
}