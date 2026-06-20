import { getMealsFromFirestore, saveCustomMeal } from '../firebase/firestore';
import mealsJson from '../data/meals.json';
import type { Meal } from '../types/meal';

export async function seedDatabase(uid: string): Promise<number> {
  // Check if seed meals already exist in Firestore
  const existingMeals = await getMealsFromFirestore(uid);
  if (existingMeals.length > 0) return existingMeals.length;
  
  // Load all 77 meals from JSON and save to Firestore with numeric IDs
  const meals = mealsJson as unknown as Meal[];
  for (let i = 0; i < meals.length; i++) {
    const meal = meals[i];
    // Use index+1 as numeric ID to match the Meal type
    await saveCustomMeal(uid, { ...meal, id: i + 1, isCustom: 1 } as any);
  }
  return meals.length;
}
