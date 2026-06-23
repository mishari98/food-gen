import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  Meal,
  HouseholdDayPlan,
  HouseholdDayPlanWithMeals,
  Household,
  HouseholdMember,
  JoinRequest,
  HouseholdInvite,
  HouseholdRole,
  ActivityLogEntry,
} from '../types/meal';
import { signup, login, logout, onAuthChange, getCurrentAuthUser } from '../firebase/auth';
import {
  getReferenceMeals,
  getCustomMeals,
  getHousehold,
  createHousehold,
  getHouseholdMembers,
  getJoinRequests,
  createJoinRequest,
  respondToJoinRequest,
  getInvitesForEmail,
  createInvite,
  respondToInvite,
  getHouseholdPlan,
  saveHouseholdPlan,
  updateMealStatus,
  getWeekPlans,
  listenToPlans,
  listenToMembers,
  listenToInvites,
  listenToActivityLog,
  getUserProfile,
  updateUserProfile,
  generateNewInviteCode,
} from '../firebase/firestore';
import { generateDayPlan, generateWeekPlan, regenerateDay, addMealToDay, removeMealFromDay } from '../services/mealPlanGenerator';
import { logActivity } from '../services/activityLogger';
import { getWeekNumber, formatDateString } from '../utils/dateHelpers';

// ── Context Types ──

interface User {
  uid: string;
  displayName: string;
  email: string;
}

interface MealPlanContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  household: Household | null;
  householdRole: HouseholdRole | null;
  householdMembers: HouseholdMember[];
  pendingJoinRequests: JoinRequest[];
  pendingInvites: HouseholdInvite[];
  activityLog: ActivityLogEntry[];
  createHousehold: (data: {
    name: string;
    address: Household['address'];
    maxMembers: number;
    weekStartDay: 'monday' | 'sunday';
    description?: string;
  }) => Promise<void>;
  joinHousehold: (inviteCode: string, role: 'editor' | 'viewer') => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  rejectInvite: (inviteId: string) => Promise<void>;
  acceptJoinRequest: (uid: string) => Promise<void>;
  rejectJoinRequest: (uid: string) => Promise<void>;
  inviteUser: (email: string, role: 'editor' | 'viewer') => Promise<void>;
  leaveHousehold: () => Promise<void>;
  regenerateInviteCode: () => Promise<void>;

  dayPlan: HouseholdDayPlanWithMeals | null;
  weekPlans: HouseholdDayPlanWithMeals[];
  allMeals: Meal[];
  customMeals: Meal[];
  selectedDate: string;
  selectedWeek: number;
  isLoading: boolean;
  error: string | null;

  generateDayPlan: (date: string, mealCount: number) => Promise<void>;
  generateWeekPlan: (weekOfYear: number, year: number, mealCount: number) => Promise<void>;
  regenerateDay: (date: string, mealCount: number) => Promise<void>;
  updateMealStatus: (date: string, mealIndex: number, status: HouseholdDayPlan['meals'][0]['status']) => Promise<void>;
  addMealToDay: (date: string, mealId: number, label?: string) => Promise<void>;
  removeMealFromDay: (date: string, mealIndex: number) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setSelectedWeek: (week: number) => void;
  refreshPlans: () => Promise<void>;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export function MealPlanProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdRole, setHouseholdRole] = useState<HouseholdRole | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [pendingJoinRequests, setPendingJoinRequests] = useState<JoinRequest[]>([]);
  const [pendingInvites, setPendingInvites] = useState<HouseholdInvite[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [dayPlan, setDayPlan] = useState<HouseholdDayPlanWithMeals | null>(null);
  const [weekPlans, setWeekPlans] = useState<HouseholdDayPlanWithMeals[]>([]);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [customMeals, setCustomMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDateString(new Date()));
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const householdIdRef = useRef<string | null>(null);

  const enrichPlan = useCallback((plan: HouseholdDayPlan): HouseholdDayPlanWithMeals => {
    const mealsWithData = plan.meals.map(entry => {
      const meal = allMeals.find(m => m.id === entry.mealId);
      return { ...entry, meal };
    });
    return { ...plan, meals: mealsWithData };
  }, [allMeals]);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (cancelled) return;
      try {
        if (firebaseUser) {
          let profile = null;
          try {
            profile = await getUserProfile(firebaseUser.uid);
          } catch (e) {
            console.log('User profile not found yet, using Firebase auth data');
          }
          if (!cancelled) {
            setUser({
              uid: firebaseUser.uid,
              displayName: profile?.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
            });
          }
        } else {
          if (!cancelled) {
            setUser(null);
            setHousehold(null);
            setHouseholdRole(null);
            setHouseholdMembers([]);
            setDayPlan(null);
            setWeekPlans([]);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (!cancelled) {
          setUser(null);
          setHousehold(null);
          setHouseholdRole(null);
          setHouseholdMembers([]);
          setDayPlan(null);
          setWeekPlans([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    });
    const safetyTimer = setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    }, 3000);
    return () => {
      cancelled = true;
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const loadUserData = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.householdId) {
          householdIdRef.current = profile.householdId;
          await loadHousehold(profile.householdId, profile.householdRole || 'viewer');
        } else {
          householdIdRef.current = null;
        }
        const custom = await getCustomMeals(user.uid);
        setCustomMeals(custom);
        const reference = await getReferenceMeals();
        if (reference.length > 0 && allMeals.length === 0) {
          setAllMeals(reference);
        }
      } catch (e) {
        console.error('Error loading user data:', e);
        setError('Failed to load user data');
      }
    };
    loadUserData();
  }, [user?.uid]);

  const loadHousehold = useCallback(async (householdId: string, role: HouseholdRole) => {
    try {
      const householdData = await getHousehold(householdId);
      if (householdData) {
        setHousehold(householdData);
        setHouseholdRole(role);
        const members = await getHouseholdMembers(householdId);
        setHouseholdMembers(members);
        const unsubPlans = listenToPlans(householdId, (plans) => {
          const enriched = plans.map(p => enrichPlan(p));
          setWeekPlans(enriched);
          const current = enriched.find(p => p.date === selectedDate);
          if (current) {
            setDayPlan(current);
          }
        });
        const unsubMembers = listenToMembers(householdId, (members) => {
          setHouseholdMembers(members);
        });
        const unsubInvites = listenToInvites(householdId, (invites) => {
          setPendingInvites(invites);
        });
        const unsubActivityLog = listenToActivityLog(householdId, (logs) => {
          setActivityLog(logs);
        });
        if (role === 'admin') {
          const requests = await getJoinRequests(householdId);
          setPendingJoinRequests(requests);
        }
        if (user?.email) {
          const userInvites = await getInvitesForEmail(user.email);
          setPendingInvites(prev => [...prev, ...userInvites]);
        }
        return () => {
          unsubPlans();
          unsubMembers();
          unsubInvites();
          unsubActivityLog();
        };
      }
    } catch (e) {
      console.error('Error loading household:', e);
      setError('Failed to load household');
    }
  }, [enrichPlan, user?.email, selectedDate]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      await login(email, password);
      const currentUser = getCurrentAuthUser();
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid).catch(() => null);
        setUser({
          uid: currentUser.uid,
          displayName: profile?.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || '',
        });
      }
    } catch (e: any) {
      setError(e.message || 'Login failed');
      throw e;
    }
  }, []);

  const handleSignup = useCallback(async (displayName: string, email: string, password: string) => {
    try {
      setError(null);
      await signup(displayName, email, password);
      const currentUser = getCurrentAuthUser();
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName,
          email: currentUser.email || '',
        });
      }
    } catch (e: any) {
      setError(e.message || 'Sign-up failed');
      throw e;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUser(null);
      setHousehold(null);
      setHouseholdRole(null);
      setHouseholdMembers([]);
      setDayPlan(null);
      setWeekPlans([]);
    } catch (e) {
      console.error('Logout error:', e);
    }
  }, []);

  const handleCreateHousehold = useCallback(async (data: {
    name: string;
    address: Household['address'];
    maxMembers: number;
    weekStartDay: 'monday' | 'sunday';
    description?: string;
  }) => {
    if (!user?.uid) throw new Error('Must be logged in');
    try {
      setError(null);
      const householdId = await createHousehold({ ...data, createdBy: user.uid });
      await updateUserProfile(user.uid, { householdId, householdRole: 'admin' });
      await loadHousehold(householdId, 'admin');
    } catch (e: any) {
      setError(e.message || 'Failed to create household');
      throw e;
    }
  }, [user, loadHousehold]);

  const handleJoinHousehold = useCallback(async (inviteCode: string, role: 'editor' | 'viewer') => {
    if (!user?.uid) throw new Error('Must be logged in');
    try {
      setError(null);
      const householdData = await getHouseholdByInviteCode(inviteCode);
      if (!householdData) {
        throw new Error('Invalid invite code');
      }
      await createJoinRequest(householdData.id, user.uid, user.displayName, user.email, role);
      await updateUserProfile(user.uid, { householdId: householdData.id, householdRole: role });
      await loadHousehold(householdData.id, role);
    } catch (e: any) {
      setError(e.message || 'Failed to join household');
      throw e;
    }
  }, [user, loadHousehold]);

  const handleAcceptInvite = useCallback(async (inviteId: string) => {
    if (!user?.uid) return;
    try {
      setError(null);
      const invite = pendingInvites.find(i => i.inviteId === inviteId);
      if (!invite) return;
      await respondToInvite(invite.householdId || '', inviteId, true);
      await updateUserProfile(user.uid, { householdId: invite.householdId, householdRole: invite.role });
      await loadHousehold(invite.householdId || '', invite.role);
    } catch (e: any) {
      setError(e.message || 'Failed to accept invite');
    }
  }, [user, pendingInvites, loadHousehold]);

  const handleRejectInvite = useCallback(async (inviteId: string) => {
    try {
      const invite = pendingInvites.find(i => i.inviteId === inviteId);
      if (!invite) return;
      await respondToInvite(invite.householdId || '', inviteId, false);
      setPendingInvites(prev => prev.filter(i => i.inviteId !== inviteId));
    } catch (e: any) {
      setError(e.message || 'Failed to reject invite');
    }
  }, [pendingInvites]);

  const handleAcceptJoinRequest = useCallback(async (uid: string) => {
    if (!household?.id || householdRole !== 'admin') return;
    try {
      setError(null);
      await respondToJoinRequest(household.id, uid, true);
      setPendingJoinRequests(prev => prev.filter(r => r.uid !== uid));
    } catch (e: any) {
      setError(e.message || 'Failed to accept join request');
    }
  }, [household, householdRole]);

  const handleRejectJoinRequest = useCallback(async (uid: string) => {
    if (!household?.id || householdRole !== 'admin') return;
    try {
      await respondToJoinRequest(household.id, uid, false);
      setPendingJoinRequests(prev => prev.filter(r => r.uid !== uid));
    } catch (e: any) {
      setError(e.message || 'Failed to reject join request');
    }
  }, [household, householdRole]);

  const handleInviteUser = useCallback(async (email: string, role: 'editor' | 'viewer') => {
    if (!household?.id || !user || householdRole !== 'admin') return;
    try {
      setError(null);
      await createInvite(household.id, email, role, user.uid, user.displayName);
    } catch (e: any) {
      setError(e.message || 'Failed to send invite');
      throw e;
    }
  }, [household, user, householdRole]);

  const handleLeaveHousehold = useCallback(async () => {
    if (!user?.uid || !household?.id) return;
    try {
      setError(null);
      await removeMemberFromHousehold(household.id, user.uid);
      await updateUserProfile(user.uid, { householdId: null, householdRole: null });
      setHousehold(null);
      setHouseholdRole(null);
      setHouseholdMembers([]);
      setDayPlan(null);
      setWeekPlans([]);
    } catch (e: any) {
      setError(e.message || 'Failed to leave household');
    }
  }, [user, household]);

  const handleRegenerateInviteCode = useCallback(async () => {
    if (!household?.id || !user || householdRole !== 'admin') return;
    try {
      setError(null);
      const newCode = await generateNewInviteCode(household.id, user.uid);
      setHousehold(prev => prev ? { ...prev, inviteCode: newCode } : null);
    } catch (e: any) {
      setError(e.message || 'Failed to regenerate invite code');
    }
  }, [household, user, householdRole]);

  const handleGenerateDayPlan = useCallback(async (date: string, mealCount: number) => {
    if (!household?.id || !user) {
      throw new Error('You must be in a household to generate meals');
    }
    try {
      setError(null);
      const mealPool = [...allMeals, ...customMeals];
      if (mealPool.length === 0) {
        throw new Error('No meals available. The reference meals may not be loaded yet.');
      }
      const plan = generateDayPlan(mealPool, mealCount, date);
      if (plan) {
        const now = new Date().toISOString();
        await saveHouseholdPlan(household.id, date, {
          ...plan,
          createdBy: user.uid,
          lastModifiedBy: user.uid,
          isGenerated: 1,
          createdAt: now,
          updatedAt: now,
        });
        await logActivity({
          householdId: household.id,
          action: 'created',
          details: `Generated ${mealCount} meals for ${date}`,
          performedBy: user.uid,
          displayName: user.displayName,
        });
        const updated = await getHouseholdPlan(household.id, date);
        if (updated) {
          setDayPlan(enrichPlan(updated));
        }
      } else {
        throw new Error('Failed to generate plan - generator returned null');
      }
    } catch (e: any) {
      console.error('[Context] Generate day plan error:', e);
      setError(e.message || 'Failed to generate day plan');
      throw e;
    }
  }, [household, user, allMeals, customMeals, enrichPlan]);

  const handleGenerateWeekPlan = useCallback(async (weekOfYear: number, year: number, mealCount: number) => {
    if (!household?.id || !user) return;
    try {
      setError(null);
      const mealPool = [...allMeals, ...customMeals];
      const plans = generateWeekPlan(mealPool, mealCount);
      const now = new Date().toISOString();
      for (const plan of plans) {
        await saveHouseholdPlan(household.id, plan.date, {
          ...plan,
          createdBy: user.uid,
          lastModifiedBy: user.uid,
          isGenerated: 1,
          createdAt: now,
          updatedAt: now,
        });
      }
      const updated = await getWeekPlans(household.id, weekOfYear, year);
      const enriched = updated.map(p => enrichPlan(p));
      setWeekPlans(enriched);
    } catch (e: any) {
      setError(e.message || 'Failed to generate week plan');
    }
  }, [household, user, allMeals, customMeals, enrichPlan]);

  const handleRegenerateDay = useCallback(async (date: string, mealCount: number) => {
    if (!household?.id || !user) return;
    try {
      setError(null);
      const existingPlan = await getHouseholdPlan(household.id, date);
      const mealPool = [...allMeals, ...customMeals];
      const plan = regenerateDay(mealPool, mealCount, date, existingPlan?.meals || []);
      if (plan) {
        const now = new Date().toISOString();
        await saveHouseholdPlan(household.id, date, {
          ...plan,
          createdBy: user.uid,
          lastModifiedBy: user.uid,
          isGenerated: 1,
          createdAt: now,
          updatedAt: now,
        });
        await logActivity({
          householdId: household.id,
          action: 'regenerated',
          details: `Regenerated meals for ${date}`,
          performedBy: user.uid,
          displayName: user.displayName,
        });
        const updated = await getHouseholdPlan(household.id, date);
        if (updated) {
          setDayPlan(enrichPlan(updated));
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to regenerate day');
    }
  }, [household, user, allMeals, customMeals, enrichPlan]);

  const handleUpdateMealStatus = useCallback(async (
    date: string,
    mealIndex: number,
    status: HouseholdDayPlan['meals'][0]['status']
  ) => {
    if (!household?.id) return;
    try {
      setError(null);
      await updateMealStatus(household.id, date, mealIndex, status);
      const updated = await getHouseholdPlan(household.id, date);
      if (updated) {
        setDayPlan(enrichPlan(updated));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to update meal status');
    }
  }, [household, enrichPlan]);

  const handleAddMealToDay = useCallback(async (date: string, mealId: number, label?: string) => {
    if (!household?.id || !user) return;
    try {
      setError(null);
      const existingPlan = await getHouseholdPlan(household.id, date);
      const meal = allMeals.find(m => m.id === mealId) || customMeals.find(m => m.id === mealId);
      if (!meal) return;
      const updated = addMealToDay(existingPlan, meal, label);
      if (updated) {
        await saveHouseholdPlan(household.id, date, {
          ...updated,
          createdBy: user.uid,
          lastModifiedBy: user.uid,
          isGenerated: 0,
        });
        await logActivity({
          householdId: household.id,
          action: 'manual_edit',
          details: `Added meal to ${date}`,
          performedBy: user.uid,
          displayName: user.displayName,
        });
        const refreshed = await getHouseholdPlan(household.id, date);
        if (refreshed) {
          setDayPlan(enrichPlan(refreshed));
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to add meal');
    }
  }, [household, user, allMeals, customMeals, enrichPlan]);

  const handleRemoveMealFromDay = useCallback(async (date: string, mealIndex: number) => {
    if (!household?.id || !user) return;
    try {
      setError(null);
      const existingPlan = await getHouseholdPlan(household.id, date);
      const updated = removeMealFromDay(existingPlan, mealIndex);
      if (updated) {
        await saveHouseholdPlan(household.id, date, {
          ...updated,
          createdBy: user.uid,
          lastModifiedBy: user.uid,
          isGenerated: 0,
        });
        await logActivity({
          householdId: household.id,
          action: 'manual_edit',
          details: `Removed a meal from ${date}`,
          performedBy: user.uid,
          displayName: user.displayName,
        });
        const refreshed = await getHouseholdPlan(household.id, date);
        if (refreshed) {
          setDayPlan(enrichPlan(refreshed));
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to remove meal');
    }
  }, [household, user, enrichPlan]);

  const refreshPlans = useCallback(async () => {
    if (!household?.id) return;
    try {
      const today = new Date();
      const week = await getWeekPlans(household.id, getWeekNumber(today), today.getFullYear());
      const enriched = week.map(p => enrichPlan(p));
      setWeekPlans(enriched);
      const current = enriched.find(p => p.date === selectedDate);
      if (current) {
        setDayPlan(current);
      }
    } catch (e) {
      console.error('Error refreshing plans:', e);
    }
  }, [household, selectedDate, enrichPlan]);

  const value: MealPlanContextType = {
    user,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    household,
    householdRole,
    householdMembers,
    pendingJoinRequests,
    pendingInvites,
    activityLog,
    createHousehold: handleCreateHousehold,
    joinHousehold: handleJoinHousehold,
    acceptInvite: handleAcceptInvite,
    rejectInvite: handleRejectInvite,
    acceptJoinRequest: handleAcceptJoinRequest,
    rejectJoinRequest: handleRejectJoinRequest,
    inviteUser: handleInviteUser,
    leaveHousehold: handleLeaveHousehold,
    regenerateInviteCode: handleRegenerateInviteCode,
    dayPlan,
    weekPlans,
    allMeals,
    customMeals,
    selectedDate,
    selectedWeek,
    isLoading,
    error,
    generateDayPlan: handleGenerateDayPlan,
    generateWeekPlan: handleGenerateWeekPlan,
    regenerateDay: handleRegenerateDay,
    updateMealStatus: handleUpdateMealStatus,
    addMealToDay: handleAddMealToDay,
    removeMealFromDay: handleRemoveMealFromDay,
    setSelectedDate,
    setSelectedWeek,
    refreshPlans,
  };

  return <MealPlanContext.Provider value={value}>{children}</MealPlanContext.Provider>;
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
}

function useRef<T>(initialValue: T) {
  return { current: initialValue };
}

async function getHouseholdByInviteCode(inviteCode: string): Promise<{ id: string; inviteCode: string } | null> {
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('../firebase/config');
  const q = query(collection(db, 'households'), where('inviteCode', '==', inviteCode));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, inviteCode: doc.data().inviteCode };
}

async function removeMemberFromHousehold(householdId: string, uid: string): Promise<void> {
  const { doc, setDoc } = await import('firebase/firestore');
  const { db } = await import('../firebase/config');
  await setDoc(
    doc(db, 'households', householdId, 'members', uid),
    { removed: true, removedAt: new Date().toISOString() },
    { merge: true }
  );
}