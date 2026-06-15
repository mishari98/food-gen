export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Meal {
  id: number;
  name: string;
  suggestedFor: string; // JSON array e.g. '["breakfast","lunch","dinner"]'
  cuisine: string;
  dietaryTags: string; // JSON array
  prepTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
  photoPath: string | null;
  youtubeLink: string | null;
  ingredients: string; // JSON array of Ingredient
  steps: string; // JSON array of strings
  calories: number | null;
  isFavorite: number; // 0 or 1
  isCustom: number; // 0 or 1
}

export interface DayPlan {
  id: number;
  date: string; // ISO "2026-06-15"
  weekOfYear: number;
  year: number;
  breakfastId: number | null;
  lunchId: number | null;
  dinnerId: number | null;
  snackId: number | null;
  isGenerated: number;
}

export interface SavedWeekPlan {
  id: number;
  name: string | null;
  createdAt: string;
  weekOfYear: number;
  year: number;
}

export interface DayPlanWithMeals extends DayPlan {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snack?: Meal;
}