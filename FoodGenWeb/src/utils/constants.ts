export const MEALS_PER_DAY_KEY = 'mealsPerDay';
export const WEEK_START_DAY_KEY = 'weekStartDay';
export const SEED_DATA_LOADED_KEY = 'seed_data_loaded';
export const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
export const DISPLAY_NAME_KEY = 'displayName';
export const FIREBASE_UID_KEY = 'firebase_uid';
export const DEFAULT_MEALS_PER_DAY = 1;
export const DEFAULT_WEEK_START_DAY = 'monday';

export const MEAL_SLOTS = [
  { id: 1, name: 'breakfast', emoji: '🌅' },
  { id: 2, name: 'lunch', emoji: '☀️' },
  { id: 3, name: 'dinner', emoji: '🌙' },
  { id: 4, name: 'snack', emoji: '🍿' },
] as const;

export type MealSlotName = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function getSlotsForMealsPerDay(count: number): MealSlotName[] {
  switch (count) {
    case 1: return ['dinner'];
    case 2: return ['lunch', 'dinner'];
    case 3: return ['breakfast', 'lunch', 'dinner'];
    default: return ['dinner'];
  }
}

export function getSlotEmoji(slot: MealSlotName): string {
  const found = MEAL_SLOTS.find(s => s.name === slot);
  return found?.emoji ?? '🍽️';
}