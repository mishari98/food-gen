import { auth } from './config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile, UserPreferences } from '../types/meal';

/**
 * Sign up a new user with email/password
 * Creates Firebase Auth user + Firestore profile + preferences
 */
export async function signup(
  displayName: string,
  email: string,
  password: string
): Promise<User> {
  // Create Firebase Auth user
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  // Create user profile in Firestore (omit undefined fields)
  const profile = {
    uid: user.uid,
    displayName,
    email: user.email || email,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  // Create user preferences in Firestore
  const preferences: UserPreferences = {
    displayName,
    onboardingComplete: true,
    seedDataLoaded: false,
    updatedAt: serverTimestamp() as any,
  };

  // Save both to Firestore
  await setDoc(doc(db, 'users', user.uid, 'profile', 'main'), profile);
  await setDoc(doc(db, 'users', user.uid, 'preferences', 'main'), preferences);

  return user;
}

/**
 * Log in existing user with email/password
 */
export async function login(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Log out current user
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Get current user (one-time read)
 */
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Listen for auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}