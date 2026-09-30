import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  limit,
} from 'firebase/firestore';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC0heootIW6A4L324dNq_w_AWoXtoDimVU',
  authDomain: 'foodgen-85dbb.firebaseapp.com',
  projectId: 'foodgen-85dbb',
  storageBucket: 'foodgen-85dbb.firebasestorage.app',
  messagingSenderId: '703155908420',
  appId: '1:703155908420:web:c557aa9c0b08c803143111',
};

const SEEDED_SENDER = 'e2e-seeder@test.foodgen.app';
const SEEDED_PASSWORD = 'TestPass123!';

/**
 * Seeds the local Firebase emulator's `referenceMeals` collection from
 * `src/data/meals.json`. The app reads reference meals from this collection to
 * power the "Generate Meals" flow; without seed data the generate tests have an
 * empty meal pool and silently produce no meals.
 *
 * Runs only against the local emulator (non-CI). Idempotent: skipped if any
 * reference meals already exist.
 */
async function seedEmulatorReferenceMeals(): Promise<void> {
  if (process.env.CI) return; // CI seeds its own data via a different path

  const app = initializeApp(FIREBASE_CONFIG, 'e2e-seeder');
  const auth = getAuth(app);
  const db = getFirestore(app);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);

  try {
    // Authenticate so Firestore writes (rules: `request.auth != null`) succeed.
    try {
      await createUserWithEmailAndPassword(auth, SEEDED_SENDER, SEEDED_PASSWORD);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code !== 'auth/email-already-in-use') throw e;
      await signInWithEmailAndPassword(auth, SEEDED_SENDER, SEEDED_PASSWORD);
    }

    const existing = await getDocs(query(collection(db, 'referenceMeals'), limit(1)));
    if (!existing.empty) {
      console.log('[Global Setup] referenceMeals already seeded — skipping');
      return;
    }

    const candidates = [
      path.resolve(process.cwd(), 'src', 'data', 'meals.json'),
      path.resolve(process.cwd(), 'FoodGenWeb', 'src', 'data', 'meals.json'),
    ];
    const mealsPath = candidates.find(p => {
      try { return fs.existsSync(p); } catch { return false; }
    });
    if (!mealsPath) {
      console.warn('[Global Setup] meals.json not found — skipping reference meal seeding');
      return;
    }
    const meals = JSON.parse(fs.readFileSync(mealsPath, 'utf-8')) as Record<string, unknown>[];
    console.log(`[Global Setup] Seeding ${meals.length} reference meals to emulator...`);

    let count = 0;
    for (let i = 0; i < meals.length; i++) {
      const meal = { ...meals[i], id: i + 1, isCustom: 0, isFavorite: 0 };
      await setDoc(doc(db, 'referenceMeals', String(i + 1)), meal);
      count++;
    }
    console.log(`[Global Setup] Seeded ${count} reference meals ✓`);
  } catch (e) {
    console.warn('[Global Setup] Reference-meal seeding failed (generate tests may fail):', (e as Error).message);
  } finally {
    try { await auth.signOut(); } catch { /* already signed out */ }
    try { await app.delete(); } catch { /* teardown is best-effort */ }
  }
}

/**
 * Global setup runs once before all test suites.
 * Responsibilities:
 * 1. Verify the target environment is reachable
 * 2. Seed test data (via Firebase Admin SDK or API calls)
 * 3. Set environment variables for test accounts
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;

  if (!baseURL) {
    throw new Error('baseURL is not configured in playwright.config.ts');
  }

  console.log(`[Global Setup] Target environment: ${baseURL}`);

  // Verify the app is reachable
  try {
    const response = await fetch(baseURL);
    if (!response.ok) {
      throw new Error(`App returned status ${response.status}`);
    }
    console.log('[Global Setup] App is reachable ✓');
  } catch (error) {
    console.warn(
      '[Global Setup] App is not reachable. Ensure dev server is running:',
      (error as Error).message,
    );
    console.warn('[Global Setup] Tests will fail if the app is not running.');
  }

  // Seed the local emulator's reference meals so generate-flow tests have data
  await seedEmulatorReferenceMeals();

  // In CI, seed test data via Firebase Admin SDK or REST API
  if (process.env.CI) {
    console.log('[Global Setup] CI mode: seeding test data...');
    // TODO: Implement Firebase Admin SDK seeding for CI
    // This would create test users, households, and meal data
  }

  console.log('[Global Setup] Complete.');
}

export default globalSetup;