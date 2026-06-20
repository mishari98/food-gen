import {
  MEALS_PER_DAY_KEY,
  WEEK_START_DAY_KEY,
  SEED_DATA_LOADED_KEY,
  ONBOARDING_COMPLETE_KEY,
  DISPLAY_NAME_KEY,
  FIREBASE_UID_KEY,
  DEFAULT_MEALS_PER_DAY,
  DEFAULT_WEEK_START_DAY,
} from '../utils/constants';

function getLocalStorage(): Storage {
  return window.localStorage;
}

// --- Onboarding ---

export async function isOnboardingComplete(): Promise<boolean> {
  return getLocalStorage().getItem(ONBOARDING_COMPLETE_KEY) === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  getLocalStorage().setItem(ONBOARDING_COMPLETE_KEY, 'true');
}

export async function getDisplayName(): Promise<string> {
  return getLocalStorage().getItem(DISPLAY_NAME_KEY) || '';
}

export async function setDisplayName(name: string): Promise<void> {
  getLocalStorage().setItem(DISPLAY_NAME_KEY, name);
}

// --- Firebase UID ---

export async function getFirebaseUid(): Promise<string | null> {
  return getLocalStorage().getItem(FIREBASE_UID_KEY) || null;
}

export async function setFirebaseUid(uid: string): Promise<void> {
  getLocalStorage().setItem(FIREBASE_UID_KEY, uid);
}

// --- Meals Per Day ---

export async function getMealsPerDay(): Promise<number> {
  const val = getLocalStorage().getItem(MEALS_PER_DAY_KEY);
  if (val === null) return DEFAULT_MEALS_PER_DAY;
  const parsed = parseInt(val, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 3) return DEFAULT_MEALS_PER_DAY;
  return parsed;
}

export async function setMealsPerDay(count: number): Promise<void> {
  getLocalStorage().setItem(MEALS_PER_DAY_KEY, String(count));
}

// --- Week Start Day ---

export async function getWeekStartDay(): Promise<'monday' | 'sunday'> {
  const val = getLocalStorage().getItem(WEEK_START_DAY_KEY);
  if (val === 'sunday') return 'sunday';
  return 'monday';
}

export async function setWeekStartDay(day: 'monday' | 'sunday'): Promise<void> {
  getLocalStorage().setItem(WEEK_START_DAY_KEY, day);
}

// --- Seed Data ---

export async function isSeedDataLoaded(): Promise<boolean> {
  return getLocalStorage().getItem(SEED_DATA_LOADED_KEY) === 'true';
}

export async function setSeedDataLoaded(): Promise<void> {
  getLocalStorage().setItem(SEED_DATA_LOADED_KEY, 'true');
}