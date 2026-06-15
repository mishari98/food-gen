import { getDatabase } from './database';
import { DayPlan, DayPlanWithMeals, Meal, SavedWeekPlan } from '../types/meal';

export async function insertDayPlan(plan: Omit<DayPlan, 'id'>): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT OR REPLACE INTO day_plans (date, week_of_year, year, breakfast_id, lunch_id, dinner_id, snack_id, is_generated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    plan.date,
    plan.weekOfYear,
    plan.year,
    plan.breakfastId,
    plan.lunchId,
    plan.dinnerId,
    plan.snackId,
    plan.isGenerated ? 1 : 0
  );
  return result.lastInsertRowId;
}

export async function getDayPlan(date: string): Promise<DayPlan | null> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DayPlan>('SELECT * FROM day_plans WHERE date = ?', date);
  return rows.length > 0 ? rows[0] : null;
}

export async function getWeekPlans(weekOfYear: number, year: number): Promise<DayPlanWithMeals[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT dp.*,
            b.name as b_name, b.emoji as b_emoji, b.difficulty as b_difficulty, b.prep_time_minutes as b_prep, b.suggested_for as b_suggested, b.ingredients as b_ingredients, b.steps as b_steps, b.calories as b_calories, b.photo_path as b_photo, b.youtube_link as b_youtube, b.is_custom as b_custom, b.dietary_tags as b_tags,
            l.name as l_name, l.emoji as l_emoji, l.difficulty as l_difficulty, l.prep_time_minutes as l_prep, l.suggested_for as l_suggested, l.ingredients as l_ingredients, l.steps as l_steps, l.calories as l_calories, l.photo_path as l_photo, l.youtube_link as l_youtube, l.is_custom as l_custom, l.dietary_tags as l_tags,
            d.name as d_name, d.emoji as d_emoji, d.difficulty as d_difficulty, d.prep_time_minutes as d_prep, d.suggested_for as d_suggested, d.ingredients as d_ingredients, d.steps as d_steps, d.calories as d_calories, d.photo_path as d_photo, d.youtube_link as d_youtube, d.is_custom as d_custom, d.dietary_tags as d_tags,
            s.name as s_name, s.emoji as s_emoji, s.difficulty as s_difficulty, s.prep_time_minutes as s_prep, s.suggested_for as s_suggested, s.ingredients as s_ingredients, s.steps as s_steps, s.calories as s_calories, s.photo_path as s_photo, s.youtube_link as s_youtube, s.is_custom as s_custom, s.dietary_tags as s_tags
     FROM day_plans dp
     LEFT JOIN meals b ON dp.breakfast_id = b.id
     LEFT JOIN meals l ON dp.lunch_id = l.id
     LEFT JOIN meals d ON dp.dinner_id = d.id
     LEFT JOIN meals s ON dp.snack_id = s.id
     WHERE dp.week_of_year = ? AND dp.year = ?
     ORDER BY dp.date ASC`,
    weekOfYear,
    year
  );
  return rows.map(mapRowToDayPlan);
}

function mapRowToDayPlan(row: any): DayPlanWithMeals {
  const breakfast = row.b_name ? {
    id: row.breakfast_id,
    name: row.b_name,
    emoji: row.b_emoji,
    difficulty: row.b_difficulty,
    prepTimeMinutes: row.b_prep,
    suggestedFor: row.b_suggested,
    ingredients: row.b_ingredients,
    steps: row.b_steps,
    calories: row.b_calories,
    photoPath: row.b_photo,
    youtubeLink: row.b_youtube,
    isCustom: row.b_custom,
    dietaryTags: row.b_tags,
    cuisine: 'Filipino',
    isFavorite: 0
  } : undefined;

  const lunch = row.l_name ? {
    id: row.lunch_id,
    name: row.l_name,
    emoji: row.l_emoji,
    difficulty: row.l_difficulty,
    prepTimeMinutes: row.l_prep,
    suggestedFor: row.l_suggested,
    ingredients: row.l_ingredients,
    steps: row.l_steps,
    calories: row.l_calories,
    photoPath: row.l_photo,
    youtubeLink: row.l_youtube,
    isCustom: row.l_custom,
    dietaryTags: row.l_tags,
    cuisine: 'Filipino',
    isFavorite: 0
  } : undefined;

  const dinner = row.d_name ? {
    id: row.dinner_id,
    name: row.d_name,
    emoji: row.d_emoji,
    difficulty: row.d_difficulty,
    prepTimeMinutes: row.d_prep,
    suggestedFor: row.d_suggested,
    ingredients: row.d_ingredients,
    steps: row.d_steps,
    calories: row.d_calories,
    photoPath: row.d_photo,
    youtubeLink: row.d_youtube,
    isCustom: row.d_custom,
    dietaryTags: row.d_tags,
    cuisine: 'Filipino',
    isFavorite: 0
  } : undefined;

  const snack = row.s_name ? {
    id: row.snack_id,
    name: row.s_name,
    emoji: row.s_emoji,
    difficulty: row.s_difficulty,
    prepTimeMinutes: row.s_prep,
    suggestedFor: row.s_suggested,
    ingredients: row.s_ingredients,
    steps: row.s_steps,
    calories: row.s_calories,
    photoPath: row.s_photo,
    youtubeLink: row.s_youtube,
    isCustom: row.s_custom,
    dietaryTags: row.s_tags,
    cuisine: 'Filipino',
    isFavorite: 0
  } : undefined;

  return {
    id: row.id,
    date: row.date,
    weekOfYear: row.week_of_year,
    year: row.year,
    breakfastId: row.breakfast_id,
    lunchId: row.lunch_id,
    dinnerId: row.dinner_id,
    snackId: row.snack_id,
    isGenerated: row.is_generated,
    breakfast,
    lunch,
    dinner,
    snack,
  };
}

export async function deleteWeekPlans(weekOfYear: number, year: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM day_plans WHERE week_of_year = ? AND year = ?', weekOfYear, year);
}

export async function saveWeekPlan(name: string | null, weekOfYear: number, year: number): Promise<number> {
  const db = await getDatabase();
  // Check if a saved plan already exists for this week
  const existing = await db.getAllAsync<any>(
    'SELECT id FROM saved_week_plans WHERE week_of_year = ? AND year = ?',
    weekOfYear, year
  );
  if (existing.length > 0) {
    // Update existing
    await db.runAsync(
      'UPDATE saved_week_plans SET name = ?, created_at = datetime(\'now\') WHERE id = ?',
      name, existing[0].id
    );
    return existing[0].id;
  }
  const result = await db.runAsync(
    'INSERT INTO saved_week_plans (name, week_of_year, year) VALUES (?, ?, ?)',
    name, weekOfYear, year
  );
  return result.lastInsertRowId;
}

export async function getSavedWeekPlans(): Promise<SavedWeekPlan[]> {
  const db = await getDatabase();
  return await db.getAllAsync<SavedWeekPlan>(
    'SELECT * FROM saved_week_plans ORDER BY created_at DESC'
  );
}

export async function deleteSavedWeekPlan(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM saved_week_plans WHERE id = ?', id);
}

export async function loadSavedWeekPlan(savedPlanId: number): Promise<DayPlanWithMeals[]> {
  const db = await getDatabase();
  const savedPlan = await db.getFirstAsync<any>(
    'SELECT * FROM saved_week_plans WHERE id = ?', savedPlanId
  );
  if (!savedPlan) return [];
  return getWeekPlans(savedPlan.week_of_year, savedPlan.year);
}
