import AsyncStorage from '@react-native-async-storage/async-storage';
import { MEALS_PER_DAY_KEY, SHOW_LABELS_KEY, SEED_DATA_LOADED_KEY, DEFAULT_MEALS_PER_DAY, DEFAULT_SHOW_LABELS } from '../utils/constants';

export async function getMealsPerDay(): Promise<number> {
  const val = await AsyncStorage.getItem(MEALS_PER_DAY_KEY);
  return val !== null ? parseInt(val, 10) : DEFAULT_MEALS_PER_DAY;
}

export async function setMealsPerDay(count: number): Promise<void> {
  await AsyncStorage.setItem(MEALS_PER_DAY_KEY, count.toString());
}

export async function getShowLabels(): Promise<boolean> {
  const val = await AsyncStorage.getItem(SHOW_LABELS_KEY);
  return val !== null ? val === 'true' : DEFAULT_SHOW_LABELS;
}

export async function setShowLabels(show: boolean): Promise<void> {
  await AsyncStorage.setItem(SHOW_LABELS_KEY, show.toString());
}

export async function isSeedDataLoaded(): Promise<boolean> {
  const val = await AsyncStorage.getItem(SEED_DATA_LOADED_KEY);
  return val === 'true';
}

export async function setSeedDataLoaded(): Promise<void> {
  await AsyncStorage.setItem(SEED_DATA_LOADED_KEY, 'true');
}