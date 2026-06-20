import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  enableIndexedDbPersistence,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import type { Meal, DayPlan, DayPlanWithMeals, SavedWeekPlan, UserPreferences } from '../types/meal';

// Enable offline persistence
try {
  enableIndexedDbPersistence(db);
} catch (e) {
  console.warn('Firestore persistence already enabled or failed:', e);
}

// --- Meals ---

export async function getMealsFromFirestore(uid: string): Promise<Meal[]> {
  const snapshot = await getDocs(collection(db, 'users', uid, 'customMeals'));
  const meals = snapshot.docs.map(d => {
    const data = d.data();
    const id = typeof data.id === 'number' ? data.id : Number(d.id);
    console.log('[Firestore] Meal doc ID:', d.id, 'data.id:', data.id, 'resolved id:', id);
    return {
      id,
      ...data,
    } as Meal;
  });
  console.log('[Firestore] Total meals loaded:', meals.length, 'Sample IDs:', meals.slice(0, 5).map(m => m.id));
  return meals;
}

export async function saveCustomMeal(uid: string, meal: Meal): Promise<string> {
  const ref = doc(collection(db, 'users', uid, 'customMeals'));
  await setDoc(ref, { ...meal, isCustom: 1, deleted: false });
  return ref.id;
}

export async function deleteCustomMeal(uid: string, mealId: string): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'customMeals', mealId), { deleted: true }, { merge: true });
}

// --- Day Plans ---

export async function getDayPlanFromFirestore(uid: string, date: string): Promise<DayPlan | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'dayPlans', date));
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  return {
    date: data.date,
    weekOfYear: data.weekOfYear,
    year: data.year,
    breakfastId: data.breakfastId ?? null,
    lunchId: data.lunchId ?? null,
    dinnerId: data.dinnerId ?? null,
    snackId: data.snackId ?? null,
    isGenerated: data.isGenerated ?? 1,
  };
}

export async function saveDayPlanToFirestore(uid: string, plan: DayPlan): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'dayPlans', plan.date), {
    ...plan,
    updatedAt: serverTimestamp(),
  });
}

export async function getWeekPlansFromFirestore(uid: string, weekOfYear: number, year: number): Promise<DayPlan[]> {
  const q = query(
    collection(db, 'users', uid, 'dayPlans'),
    where('weekOfYear', '==', weekOfYear),
    where('year', '==', year)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data() } as DayPlan));
}

export async function getAllDayPlansFromFirestore(uid: string): Promise<DayPlan[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'dayPlans'));
  return snap.docs.map(d => ({ ...d.data() } as DayPlan));
}

// --- Saved Week Plans ---

export async function getSavedWeekPlans(uid: string): Promise<SavedWeekPlan[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'savedWeekPlans'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedWeekPlan));
}

export async function saveWeekPlanToFirestore(uid: string, plan: Omit<SavedWeekPlan, 'id'>): Promise<string> {
  const ref = doc(collection(db, 'users', uid, 'savedWeekPlans'));
  await setDoc(ref, { ...plan, createdAt: serverTimestamp() });
  return ref.id;
}

// --- Preferences ---

export async function getPreferencesFromFirestore(uid: string): Promise<UserPreferences | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'preferences', 'main'));
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  return {
    displayName: data.displayName || '',
    mealsPerDay: data.mealsPerDay ?? 1,
    weekStartDay: data.weekStartDay || 'monday',
  };
}

export async function savePreferencesToFirestore(uid: string, prefs: UserPreferences): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'preferences', 'main'), {
    ...prefs,
    updatedAt: serverTimestamp(),
  });
}

// --- Real-time Listeners ---

export function listenToDayPlans(uid: string, callback: (plans: DayPlan[]) => void): () => void {
  const q = query(collection(db, 'users', uid, 'dayPlans'));
  const unsub = onSnapshot(q, (snap) => {
    const plans = snap.docs.map(d => ({ ...d.data() } as DayPlan));
    callback(plans);
  });
  return unsub;
}

export function listenToCustomMeals(uid: string, callback: (meals: Meal[]) => void): () => void {
  const q = query(
    collection(db, 'users', uid, 'customMeals'),
    where('isCustom', '==', 1)
  );
  const unsub = onSnapshot(q, (snap) => {
    const meals = snap.docs.map(d => {
      const data = d.data();
      return {
        id: typeof data.id === 'number' ? data.id : Number(d.id),
        ...data,
      } as Meal;
    });
    callback(meals);
  });
  return unsub;
}
