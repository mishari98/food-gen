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
} from 'firebase/firestore';
import { db } from './config';
import type {
  Meal,
  HouseholdDayPlan,
  HouseholdDayPlanWithMeals,
  Household,
  HouseholdMember,
  JoinRequest,
  HouseholdInvite,
  UserPreferences,
  ActivityLogEntry,
  InviteCodeRecord,
  MealSuggestion,
} from '../types/meal';

// Enable offline persistence
try {
  enableIndexedDbPersistence(db);
} catch (e) {
  console.warn('Firestore persistence already enabled or failed:', e);
}

// ── Reference Meals ──

export async function getReferenceMeals(): Promise<Meal[]> {
  const snap = await getDocs(collection(db, 'referenceMeals'));
  return snap.docs.map(d => {
    const data = d.data();
    // Use the id field from data if it exists, otherwise try to parse the doc ID
    const id = typeof data.id === 'number' ? data.id : typeof data.id === 'string' ? parseInt(data.id, 10) : Number(d.id);
    return { id, ...data } as Meal;
  });
}

// ── Custom Meals (per-user) ──

export async function getCustomMeals(uid: string): Promise<Meal[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'customMeals'));
  return snap.docs.map(d => {
    const data = d.data();
    const id = typeof data.id === 'number' ? data.id : Number(d.id);
    return { id, ...data } as Meal;
  });
}

export async function saveCustomMeal(uid: string, meal: Meal): Promise<string> {
  const ref = doc(collection(db, 'users', uid, 'customMeals'));
  await setDoc(ref, { ...meal, isCustom: 1, deleted: false });
  return ref.id;
}

export async function deleteCustomMeal(uid: string, mealId: string): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'customMeals', mealId), { deleted: true }, { merge: true });
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

// ── Households ──

export async function getHousehold(householdId: string): Promise<Household | null> {
  const snap = await getDoc(doc(db, 'households', householdId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as Household;
}

export async function createHousehold(data: {
  name: string;
  address: Household['address'];
  maxMembers: number;
  weekStartDay: 'monday' | 'sunday';
  description?: string;
  timezone?: string;
  createdBy: string;
}): Promise<string> {
  const inviteCode = generateInviteCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const householdRef = doc(collection(db, 'households'));
  const householdData: Omit<Household, 'id'> = {
    name: data.name,
    address: data.address,
    inviteCode,
    codeExpiresAt: expiresAt.toISOString(),
    maxMembers: data.maxMembers,
    weekStartDay: data.weekStartDay,
    description: data.description,
    timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdBy: data.createdBy,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  await setDoc(householdRef, householdData);

  // Add creator as admin member
  const memberRef = doc(collection(db, 'households', householdRef.id, 'members'), data.createdBy);
  await setDoc(memberRef, {
    uid: data.createdBy,
    displayName: '', // Will be populated from user profile
    email: '', // Will be populated from user profile
    role: 'admin',
    joinedAt: now.toISOString(),
  });

  return householdRef.id;
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const snap = await getDocs(collection(db, 'households', householdId, 'members'));
  return snap.docs.map(d => ({ ...d.data() } as HouseholdMember));
}

export async function addMember(
  householdId: string,
  uid: string,
  role: 'admin' | 'editor' | 'viewer'
): Promise<void> {
  const memberRef = doc(collection(db, 'households', householdId, 'members'), uid);
  await setDoc(memberRef, {
    uid,
    displayName: '',
    email: '',
    role,
    joinedAt: new Date().toISOString(),
  });
}

export async function updateMemberRole(
  householdId: string,
  uid: string,
  role: 'admin' | 'editor' | 'viewer'
): Promise<void> {
  await setDoc(
    doc(db, 'households', householdId, 'members', uid),
    { role },
    { merge: true }
  );
}

export async function removeMember(householdId: string, uid: string): Promise<void> {
  await setDoc(
    doc(db, 'households', householdId, 'members', uid),
    { removed: true, removedAt: new Date().toISOString() },
    { merge: true }
  );
}

export function listenToMembers(householdId: string, callback: (members: HouseholdMember[]) => void): () => void {
  const q = query(collection(db, 'households', householdId, 'members'));
  const unsub = onSnapshot(q, (snap) => {
    const members = snap.docs.map(d => ({ ...d.data() } as HouseholdMember));
    callback(members);
  });
  return unsub;
}

// ── Join Requests ──

export async function getJoinRequests(householdId: string): Promise<JoinRequest[]> {
  const snap = await getDocs(collection(db, 'households', householdId, 'joinRequests'));
  return snap.docs.map(d => ({ ...d.data() } as JoinRequest));
}

export async function createJoinRequest(
  householdId: string,
  uid: string,
  displayName: string,
  email: string,
  requestedRole: 'editor' | 'viewer'
): Promise<void> {
  const requestRef = doc(collection(db, 'households', householdId, 'joinRequests'), uid);
  await setDoc(requestRef, {
    uid,
    displayName,
    email,
    status: 'pending',
    requestedRole,
    requestedAt: new Date().toISOString(),
  });
}

export async function respondToJoinRequest(
  householdId: string,
  uid: string,
  accept: boolean
): Promise<void> {
  const requestRef = doc(db, 'households', householdId, 'joinRequests', uid);
  await setDoc(
    requestRef,
    {
      status: accept ? 'accepted' : 'rejected',
      respondedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  if (accept) {
    // Add user as member (role will be set by caller)
    await addMember(householdId, uid, 'viewer');
  }
}

// ── Invites ──

export async function getInvitesForEmail(email: string): Promise<HouseholdInvite[]> {
  const q = query(
    collection(db, 'households'),
    where('invitedEmail', '==', email),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ inviteId: d.id, ...d.data() } as HouseholdInvite));
}

export async function createInvite(
  householdId: string,
  email: string,
  role: 'editor' | 'viewer',
  invitedBy: string,
  invitedByName: string
): Promise<string> {
  const inviteRef = doc(collection(db, 'households', householdId, 'invites'));
  await setDoc(inviteRef, {
    invitedEmail: email,
    invitedBy,
    invitedByName,
    role,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return inviteRef.id;
}

export async function respondToInvite(
  householdId: string,
  inviteId: string,
  accept: boolean
): Promise<void> {
  const inviteRef = doc(db, 'households', householdId, 'invites', inviteId);
  await setDoc(
    inviteRef,
    {
      status: accept ? 'accepted' : 'rejected',
      respondedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  if (accept) {
    // Get invite data to find invited user
    const snap = await getDoc(inviteRef);
    const data = snap.data() as HouseholdInvite;
    if (data.invitedUid) {
      await addMember(householdId, data.invitedUid, data.role);
    }
  }
}

export function listenToInvites(householdId: string, callback: (invites: HouseholdInvite[]) => void): () => void {
  const q = query(collection(db, 'households', householdId, 'invites'));
  const unsub = onSnapshot(q, (snap) => {
    const invites = snap.docs.map(d => ({ inviteId: d.id, ...d.data() } as HouseholdInvite));
    callback(invites);
  });
  return unsub;
}

// ── Plans ──

export async function getHouseholdPlan(
  householdId: string,
  date: string
): Promise<HouseholdDayPlan | null> {
  const snap = await getDoc(doc(db, 'households', householdId, 'plans', date));
  if (!snap.exists()) return null;
  return { ...snap.data() } as HouseholdDayPlan;
}

export async function saveHouseholdPlan(
  householdId: string,
  date: string,
  plan: Omit<HouseholdDayPlan, 'date'>
): Promise<void> {
  await setDoc(doc(db, 'households', householdId, 'plans', date), {
    ...plan,
    date,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateMealStatus(
  householdId: string,
  date: string,
  mealIndex: number,
  status: HouseholdDayPlan['meals'][0]['status']
): Promise<void> {
  const planRef = doc(db, 'households', householdId, 'plans', date);
  const snap = await getDoc(planRef);
  if (!snap.exists()) return;

  const plan = snap.data() as HouseholdDayPlan;
  const updatedMeals = [...plan.meals];
  if (updatedMeals[mealIndex]) {
    updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], status };
  }

  await setDoc(planRef, {
    meals: updatedMeals,
    updatedAt: new Date().toISOString(),
  });
}

export async function getWeekPlans(
  householdId: string,
  weekOfYear: number,
  year: number
): Promise<HouseholdDayPlan[]> {
  const q = query(
    collection(db, 'households', householdId, 'plans'),
    where('weekOfYear', '==', weekOfYear),
    where('year', '==', year)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data() } as HouseholdDayPlan));
}

export function listenToPlans(
  householdId: string,
  callback: (plans: HouseholdDayPlan[]) => void
): () => void {
  const q = query(collection(db, 'households', householdId, 'plans'));
  const unsub = onSnapshot(q, (snap) => {
    const plans = snap.docs.map(d => ({ ...d.data() } as HouseholdDayPlan));
    callback(plans);
  });
  return unsub;
}

// ── Invite Codes ──

export async function generateNewInviteCode(householdId: string, generatedBy: string): Promise<string> {
  const newCode = generateInviteCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Mark old codes as inactive
  const oldCodesSnap = await getDocs(collection(db, 'households', householdId, 'inviteCodes'));
  for (const codeDoc of oldCodesSnap.docs) {
    await setDoc(codeDoc.ref, { isActive: false }, { merge: true });
  }

  // Add new code
  const codeRef = doc(collection(db, 'households', householdId, 'inviteCodes'));
  await setDoc(codeRef, {
    code: newCode,
    generatedBy,
    generatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
    usedCount: 0,
  });

  // Update household with new invite code
  await setDoc(
    doc(db, 'households', householdId),
    {
      inviteCode: newCode,
      codeExpiresAt: expiresAt.toISOString(),
      updatedAt: now.toISOString(),
    },
    { merge: true }
  );

  return newCode;
}

export function listenToInviteCodeHistory(householdId: string, callback: (codes: (InviteCodeRecord & { codeId: string })[], activeCode: string | null) => void): () => void {
  const q = query(collection(db, 'households', householdId, 'inviteCodes'), orderBy('generatedAt', 'desc'));
  const unsub = onSnapshot(q, (snap) => {
    const codes = snap.docs.map(d => ({ codeId: d.id, ...d.data() } as InviteCodeRecord & { codeId: string }));
    const active = codes.find(c => c.isActive)?.code || null;
    callback(codes, active);
  });
  return unsub;
}

// ── Activity Log ──

export async function createActivityLog(
  householdId: string,
  logEntry: Omit<ActivityLogEntry, 'createdAt'>
): Promise<void> {
  const logRef = doc(collection(db, 'households', householdId, 'activityLog'));
  await setDoc(logRef, {
    ...logEntry,
    createdAt: new Date().toISOString(),
  });
}

export function listenToActivityLog(
  householdId: string,
  callback: (logs: ActivityLogEntry[]) => void
): () => void {
  const q = query(
    collection(db, 'households', householdId, 'activityLog'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const unsub = onSnapshot(q, (snap) => {
    const logs = snap.docs.map(d => ({ ...d.data() } as ActivityLogEntry));
    callback(logs);
  });
  return unsub;
}

// ── User Profile & Preferences ──

export async function getUserProfile(uid: string): Promise<DocumentData | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'main'));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function updateUserProfile(uid: string, data: Partial<DocumentData>): Promise<void> {
  // Strip undefined values — Firestore rejects them
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  ) as Record<string, any>;
  
  await setDoc(
    doc(db, 'users', uid, 'profile', 'main'),
    { ...cleanData, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function getUserPreferences(uid: string): Promise<UserPreferences | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'preferences', 'main'));
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  return {
    displayName: data.displayName || '',
    onboardingComplete: data.onboardingComplete ?? false,
    seedDataLoaded: data.seedDataLoaded ?? false,
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export async function updateUserPreferences(uid: string, prefs: Partial<UserPreferences>): Promise<void> {
  await setDoc(
    doc(db, 'users', uid, 'preferences', 'main'),
    { ...prefs, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

// ── Meal Suggestions ──

export async function createMealSuggestion(
  householdId: string,
  suggestion: Omit<MealSuggestion, 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = doc(collection(db, 'households', householdId, 'suggestions'));
  const now = new Date().toISOString();
  await setDoc(ref, {
    ...suggestion,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateSuggestionStatus(
  householdId: string,
  suggestionId: string,
  status: 'approved' | 'rejected',
  respondedBy: string
): Promise<void> {
  await setDoc(
    doc(db, 'households', householdId, 'suggestions', suggestionId),
    {
      status,
      respondedBy,
      respondedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export function listenToMealSuggestions(
  householdId: string,
  callback: (suggestions: (MealSuggestion & { suggestionId: string })[]) => void
): () => void {
  const q = query(
    collection(db, 'households', householdId, 'suggestions'),
    where('status', '==', 'pending')
  );
  const unsub = onSnapshot(q, (snap) => {
    const suggestions = snap.docs.map(d => ({
      suggestionId: d.id,
      ...d.data(),
    } as MealSuggestion & { suggestionId: string }));
    callback(suggestions);
  });
  return unsub;
}

// ── Helper Functions ──

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}