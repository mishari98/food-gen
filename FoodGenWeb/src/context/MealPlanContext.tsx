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
} from '../types/meal';
import { signup, login, logout, onAuthChange } from '../firebase/auth';
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
  getUserProfile,
  updateUserProfile,
  generateNewInviteCode,
} from '../firebase/firestore';
import { generateDayPlan, generateWeekPlan, regenerateDay, addMealToDay, removeMealFromDay } from '../services/mealPlanGenerator';
import { getWeekNumber, formatDateString } from '../utils/dateHelpers';

// ── Context Types ──

interface User {
  uid: string;
  displayName: string;
  email: string;
}

interface MealPlanContextType {
  // Auth
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Household
  household: Household | null;
  householdRole: HouseholdRole | null;
  householdMembers: HouseholdMember[];
  pendingJoinRequests: JoinRequest[];
  pendingInvites: HouseholdInvite[];
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

  // Plans
  dayPlan: HouseholdDayPlanWithMeals | null;
  weekPlans: HouseholdDayPlanWithMeals[];
  allMeals: Meal[];
  customMeals: Meal[];
  selectedDate: string;
  selectedWeek: number;
  isLoading: boolean;
  error: string | null;

  // Plan actions
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
  // ── Auth State ──
  const [user, setUser] = useState<User | null>(null);

  // ── Household State ──
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdRole, setHouseholdRole] = useState<HouseholdRole | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [pendingJoinRequests, setPendingJoinRequests] = useState<JoinRequest[]>([]);
  const [pendingInvites, setPendingInvites] = useState<HouseholdInvite[]>([]);

  // ── Plans State ──
  const [dayPlan, setDayPlan] = useState<HouseholdDayPlanWithMeals | null>(null);
  const [weekPlans, setWeekPlans] = useState<HouseholdDayPlanWithMeals[]>([]);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [customMeals, setCustomMeals] = useState<Meal[]>([]);

  // ── UI State ──
  const [selectedDate, setSelectedDate] = useState(formatDateString(new Date()));
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Refs for listeners ──
  const householdIdRef = useRef<string | null>(null);

  // ── Helper: Enrich plan with meal data ──
  const enrichPlan = useCallback((plan: HouseholdDayPlan): HouseholdDayPlanWithMeals => {
    const mealsWithData = plan.meals.map(entry => {
      const meal = allMeals.find(m => m.id === entry.mealId);
      return { ...entry, meal };
    });
    return { ...plan, meals: mealsWithData };
  }, [allMeals]);

  // ── Initialize Auth ──
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          displayName: profile?.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
        });
      } else {
        setUser(null);
        setHousehold(null);
        setHouseholdRole(null);
        setHouseholdMembers([]);
        setDayPlan(null);
        setWeekPlans([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Load household data when user changes ──
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

        // Load custom meals
        const custom = await getCustomMeals(user.uid);
        setCustomMeals(custom);

        // Load reference meals (once)
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

  // ── Load household and set up listeners ──
  const loadHousehold = useCallback(async (householdId: string, role: HouseholdRole) => {
    try {
      const householdData = await getHousehold(householdId);
      if (householdData) {
        setHousehold(householdData);
        setHouseholdRole(role);

        // Load members
        const members = await getHouseholdMembers(householdId);
        setHouseholdMembers(members);

        // Set up real-time listeners
        const unsubPlans = listenToPlans(householdId, (plans) => {
          const enriched = plans.map(p => enrichPlan(p));
          setWeekPlans(enriched);

          // Update current day plan if it's in the list
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

        // Load pending join requests (admin only)
        if (role === 'admin') {
          const requests = await getJoinRequests(householdId);
          setPendingJoinRequests(requests);
        }

        // Load pending invites for current user
        if (user?.email) {
          const userInvites = await getInvitesForEmail(user.email);
          setPendingInvites(prev => [...prev, ...userInvites]);
        }

        return () => {
          unsubPlans();
          unsubMembers();
          unsubInvites();
        };
      }
    } catch (e) {
      console.error('Error loading household:', e);
      setError('Failed to load household');
    }
  }, [enrichPlan, user?.email, selectedDate]);

  // ── Auth Actions ──
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      await login(email, password);
    } catch (e: any) {
      setError(e.message || 'Login failed');
      throw e;
    }
  }, []);

  const handleSignup = useCallback(async (displayName: string, email: string, password: string) => {
    try {
      setError(null);
      await signup(displayName, email, password);
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

  // ── Household Actions ──
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
      const householdId = await createHousehold({
        ...data,
        createdBy: user.uid,
      });

      // Update user profile with household
      await updateUserProfile(user.uid, {
        householdId,
        householdRole: 'admin',
      });

      // Reload household
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
      // Find household by invite code
      const householdData = await getHouseholdByInviteCode(inviteCode);
      if (!householdData) {
        throw new Error('Invalid invite code');
      }

      // Create join request
      await createJoinRequest(
        householdData.id,
        user.uid,
        user.displayName,
        user.email,
        role
      );

      // Update user profile
      await updateUserProfile(user.uid, {
        householdId: householdData.id,
        householdRole: role,
      });

      // Reload household
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
      // Find invite to get household ID
      const invite = pendingInvites.find(i => i.inviteId === inviteId);
      if (!invite) return;

      await respondToInvite(invite.householdId || '', inviteId, true);

      // Update user profile
      await updateUserProfile(user.uid, {
        householdId: invite.householdId,
        householdRole: invite.role,
      });

      // Reload household
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
      // Remove member
      await removeMemberFromHousehold(household.id, user.uid);

      // Update user profile
      await updateUserProfile(user.uid, {
        householdId: null,
        householdRole: null,
      });

      // Clear state
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

  // ── Plan Actions ──
  const handleGenerateDayPlan = useCallback(async (date: string, mealCount: number) => {
    if (!household?.id || !user) return;

    try {
      setError(null);
      const mealPool = [...allMeals, ...customMeals];
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

        // Refresh current day plan
        const updated = await getHouseholdPlan(household.id, date);
        if (updated) {
          setDayPlan(enrichPlan(updated));
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate day plan');
    }
  }, [household, user, allMeals, customMeals, enrichPlan]);

  const handleGenerateWeekPlan = useCallback(async (weekOfYear: number, year: number, mealCount: number) => {
    if (!household?.id || !user) return;

    try {
      setError(null);
      const mealPool = [...allMeals, ...customMeals];
      const plans = generateWeekPlan(mealPool, mealCount);

      // Save all plans
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

      // Refresh week plans
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

        // Refresh
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

      // Refresh day plan
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

        // Refresh
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

        // Refresh
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

  // ── Context Value ──
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

// ── Helper Functions ──

function useRef<T>(initialValue: T) {
  return { current: initialValue };
}

async function getHouseholdByInviteCode(inviteCode: string): Promise<{ id: string; inviteCode: string } | null> {
  // This is a simplified version - in production, you'd query Firestore
  // For now, we'll get all households and filter (not efficient but works)
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