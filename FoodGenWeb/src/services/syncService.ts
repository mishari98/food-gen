import { db as firestoreDb } from '../firebase/config';
import { db as indexedDb } from '../database/db';
import {
  doc,
  setDoc,
  getDocs,
  collection,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import type { DayPlan } from '../types/meal';

let unsubscribeDayPlans: (() => void) | null = null;

export async function pushDayPlan(plan: DayPlan, uid: string): Promise<void> {
  try {
    await setDoc(
      doc(firestoreDb, 'users', uid, 'dayPlans', plan.date),
      {
        date: plan.date,
        weekOfYear: plan.weekOfYear,
        year: plan.year,
        breakfastId: plan.breakfastId,
        lunchId: plan.lunchId,
        dinnerId: plan.dinnerId,
        snackId: plan.snackId,
        isGenerated: plan.isGenerated,
        updatedAt: serverTimestamp(),
      }
    );
  } catch (e) {
    console.warn('Firebase sync warning (pushDayPlan):', e);
  }
}

export async function pushPreferences(
  uid: string,
  prefs: { displayName: string; mealsPerDay: number; weekStartDay: string }
): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, 'users', uid, 'preferences', 'main'), {
      ...prefs,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firebase sync warning (pushPreferences):', e);
  }
}

export async function pullAllDayPlans(uid: string): Promise<DayPlan[]> {
  try {
    const snapshot = await getDocs(
      collection(firestoreDb, 'users', uid, 'dayPlans')
    );
    const plans: DayPlan[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      plans.push({
        date: data.date,
        weekOfYear: data.weekOfYear,
        year: data.year,
        breakfastId: data.breakfastId ?? null,
        lunchId: data.lunchId ?? null,
        dinnerId: data.dinnerId ?? null,
        snackId: data.snackId ?? null,
        isGenerated: data.isGenerated ?? 1,
      });
    });
    return plans;
  } catch (e) {
    console.warn('Firebase sync warning (pullAllDayPlans):', e);
    return [];
  }
}

export function listenToDayPlans(
  uid: string,
  onUpdate: (plan: DayPlan) => void
): () => void {
  // Clean up any existing listener
  if (unsubscribeDayPlans) {
    unsubscribeDayPlans();
  }

  try {
    unsubscribeDayPlans = onSnapshot(
      collection(firestoreDb, 'users', uid, 'dayPlans'),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data() as DocumentData;
            const plan: DayPlan = {
              date: data.date,
              weekOfYear: data.weekOfYear,
              year: data.year,
              breakfastId: data.breakfastId ?? null,
              lunchId: data.lunchId ?? null,
              dinnerId: data.dinnerId ?? null,
              snackId: data.snackId ?? null,
              isGenerated: data.isGenerated ?? 1,
            };
            onUpdate(plan);
          }
        });
      },
      (error) => {
        console.warn('Firebase sync listener error:', error);
      }
    );
  } catch (e) {
    console.warn('Firebase sync warning (listenToDayPlans):', e);
    unsubscribeDayPlans = null;
  }

  return () => {
    if (unsubscribeDayPlans) {
      unsubscribeDayPlans();
      unsubscribeDayPlans = null;
    }
  };
}

export async function upsertDayPlanToIndexedDB(plan: DayPlan): Promise<void> {
  try {
    // Delete existing plan for that date first
    await indexedDb.dayPlans.where('date').equals(plan.date).delete();
    // Insert the new one (without id since Firestore doesn't have it)
    await indexedDb.dayPlans.add(plan as any);
  } catch (e) {
    console.warn('IndexedDB upsert warning:', e);
  }
}

export async function setUserOnline(uid: string, isOnline: boolean): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, 'users', uid, 'status', 'online'), {
      online: isOnline,
      lastSeen: serverTimestamp(),
    });
  } catch (e) {
    // Silently fail - this is non-critical
  }
}