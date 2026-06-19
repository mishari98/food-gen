import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { DayPlanWithMeals, Meal } from '../types/meal';
import { getMealsPerDay, getWeekStartDay, setMealsPerDay, setWeekStartDay, isSeedDataLoaded, setSeedDataLoaded, getDisplayName, setDisplayName } from '../services/preferenceManager';
import { generateTodayPlan, generateWeeklyPlan, regenerateDay as regenerateDayService } from '../services/mealPlanGenerator';
import { getWeekNumber, formatDateString } from '../utils/dateHelpers';
import { seedDatabase } from '../services/seedDataLoader';
import { getCurrentUser, onAuthChange } from '../firebase/auth';
import {
  getDayPlanFromFirestore,
  saveDayPlanToFirestore,
  getWeekPlansFromFirestore,
  getAllDayPlansFromFirestore,
  getMealsFromFirestore,
  saveCustomMeal,
  getPreferencesFromFirestore,
  savePreferencesToFirestore,
  listenToDayPlans,
  listenToCustomMeals,
} from '../firebase/firestore';

interface MealPlanContextType {
  user: { uid: string; displayName: string } | null;
  isOnline: boolean;
  selectedDate: string;
  selectedWeek: number;
  weekStartDay: 'monday' | 'sunday';
  dayPlan: DayPlanWithMeals | null;
  weekPlans: DayPlanWithMeals[];
  historyPlans: DayPlanWithMeals[];
  mealsPerDay: number;
  isLoading: boolean;
  setMealsPerDay: (count: number) => Promise<void>;
  setWeekStartDay: (day: 'monday' | 'sunday') => Promise<void>;
  setSelectedDate: (date: string) => void;
  setSelectedWeek: (week: number) => void;
  generateDayPlan: (date: string) => Promise<void>;
  generateWeekPlan: (weekOfYear: number, year: number) => Promise<void>;
  regenerateDay: (date: string) => Promise<void>;
  loadPlanForDate: (date: string) => Promise<void>;
  refreshWeek: () => Promise<void>;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export function MealPlanProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ uid: string; displayName: string } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [weekStartDay, setWeekStartDayState] = useState<'monday' | 'sunday'>('monday');
  const [dayPlan, setDayPlan] = useState<DayPlanWithMeals | null>(null);
  const [weekPlans, setWeekPlans] = useState<DayPlanWithMeals[]>([]);
  const [historyPlans, setHistoryPlans] = useState<DayPlanWithMeals[]>([]);
  const [mealsPerDay, setMealsPerDayState] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [mealsLoaded, setMealsLoaded] = useState(false);

  const loadPreferences = useCallback(async () => {
    const mpd = await getMealsPerDay();
    const wsd = await getWeekStartDay();
    setMealsPerDayState(mpd);
    setWeekStartDayState(wsd);
  }, []);

  const enrichWithMeals = useCallback(async (plan: DayPlanWithMeals): Promise<DayPlanWithMeals> => {
    const findMeal = (id: number | null) => allMeals.find(m => m.id === id);
    const [breakfast, lunch, dinner, snack] = [
      plan.breakfastId ? findMeal(plan.breakfastId) : undefined,
      plan.lunchId ? findMeal(plan.lunchId) : undefined,
      plan.dinnerId ? findMeal(plan.dinnerId) : undefined,
      plan.snackId ? findMeal(plan.snackId) : undefined,
    ];
    return { ...plan, breakfast, lunch, dinner, snack };
  }, [allMeals]);

  // Use refs to avoid infinite loops with listeners
  const enrichWithMealsRef = useRef(enrichWithMeals);
  enrichWithMealsRef.current = enrichWithMeals;
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;

  // Initialize Firebase auth and sync
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const displayName = await getDisplayName();
          setUser({ uid: currentUser.uid, displayName });
          
          // Load preferences from Firestore
          const prefs = await getPreferencesFromFirestore(currentUser.uid);
          if (prefs) {
            await setDisplayName(prefs.displayName);
            await setMealsPerDay(prefs.mealsPerDay);
            await setWeekStartDay(prefs.weekStartDay);
            setMealsPerDayState(prefs.mealsPerDay);
            setWeekStartDayState(prefs.weekStartDay);
            setUser({ uid: currentUser.uid, displayName: prefs.displayName });
          }
          
          // Listen for auth changes
          const unsubscribe = onAuthChange((firebaseUser) => {
            if (firebaseUser) {
              getDisplayName().then(dn => {
                setUser({ uid: firebaseUser.uid, displayName: dn });
              });
            } else {
              setUser(null);
            }
          });
          
          return unsubscribe;
        }
      } catch (e) {
        console.warn('Firebase auth init failed:', e);
      }
      return () => {};
    };

    const cleanup = initAuth();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []);

  // Separate effect for Firestore listeners - only depends on user.uid
  useEffect(() => {
    if (!user?.uid) return;

    // Load meals once
    getMealsFromFirestore(user.uid).then(initialMeals => {
      console.log('[MealPlanContext] Initial meals load, count:', initialMeals.length);
      if (initialMeals.length > 0) {
        setAllMeals(initialMeals);
        setMealsLoaded(true);
      }
    });

    // Listen for custom meal changes
    const unsubMeals = listenToCustomMeals(user.uid, (meals) => {
      console.log('[MealPlanContext] Custom meals listener fired, count:', meals.length);
      setAllMeals(meals);
      setMealsLoaded(meals.length > 0);
    });

    // Listen for day plan changes
    const unsubPlans = listenToDayPlans(user.uid, async (plans) => {
      const today = new Date();
      const week = await getWeekPlansFromFirestore(user.uid, getWeekNumber(today), today.getFullYear());
      const enrichedWeek = await Promise.all(week.map(p => enrichWithMealsRef.current(p)));
      setWeekPlans(enrichedWeek);
      
      const current = await getDayPlanFromFirestore(user.uid, selectedDateRef.current);
      if (current) {
        const withMeals = await enrichWithMealsRef.current(current);
        setDayPlan(withMeals);
      }
    });

    return () => {
      unsubMeals();
      unsubPlans();
    };
  }, [user?.uid]); // Only re-run when user changes

  const loadPlanForDate = useCallback(async (dateStr: string) => {
    if (!user?.uid) {
      setDayPlan(null);
      return;
    }
    try {
      const plan = await getDayPlanFromFirestore(user.uid, dateStr);
      if (plan) {
        const withMeals = await enrichWithMeals(plan);
        setDayPlan(withMeals);
      } else {
        setDayPlan(null);
      }
    } catch (e) {
      console.error('Error loading plan for date:', e);
      setDayPlan(null);
    }
  }, [user, enrichWithMeals]);

  const generateDayPlan = useCallback(async (dateStr: string) => {
    try {
      console.log('[MealPlanContext] generateDayPlan called, mealsLoaded:', mealsLoaded, 'allMeals count:', allMeals.length);
      if (!mealsLoaded || allMeals.length === 0) {
        alert('Meals are still loading. Please wait a moment and try again.');
        return;
      }
      const plan = await generateTodayPlan(allMeals);
      console.log('[MealPlanContext] Generated plan:', plan);
      if (plan && user?.uid) {
        await saveDayPlanToFirestore(user.uid, plan);
        console.log('[MealPlanContext] Plan saved to Firestore');
        await loadPlanForDate(dateStr);
      }
    } catch (e) {
      console.error('Error generating day plan:', e);
    }
  }, [user, loadPlanForDate, allMeals, mealsLoaded]);

  const generateWeekPlan = useCallback(async (weekOfYear: number, year: number) => {
    try {
      if (!mealsLoaded || allMeals.length === 0) {
        alert('Meals are still loading. Please wait a moment and try again.');
        return;
      }
      const plans = await generateWeeklyPlan(allMeals);
      if (plans.length > 0 && user?.uid) {
        for (const plan of plans) {
          await saveDayPlanToFirestore(user.uid, plan);
        }
        const week = await getWeekPlansFromFirestore(user.uid, weekOfYear, year);
        const enriched = await Promise.all(week.map(p => enrichWithMeals(p)));
        setWeekPlans(enriched);
      }
    } catch (e) {
      console.error('Error generating week plan:', e);
    }
  }, [user, allMeals, mealsLoaded, enrichWithMeals]);

  const regenerateDay = useCallback(async (dateStr: string) => {
    try {
      console.log('[MealPlanContext] regenerateDay called, mealsLoaded:', mealsLoaded, 'allMeals count:', allMeals.length);
      if (!mealsLoaded || allMeals.length === 0) {
        alert('Meals are still loading. Please wait a moment and try again.');
        return;
      }
      const plan = await regenerateDayService(dateStr, allMeals);
      console.log('[MealPlanContext] Regenerated plan:', plan);
      if (plan && user?.uid) {
        await saveDayPlanToFirestore(user.uid, plan);
        console.log('[MealPlanContext] Plan saved to Firestore');
        await loadPlanForDate(dateStr);
      }
    } catch (e) {
      console.error('Error regenerating day:', e);
    }
  }, [user, loadPlanForDate, allMeals, mealsLoaded]);

  const refreshWeek = useCallback(async () => {
    if (!user?.uid) return;
    const today = new Date();
    const week = await getWeekPlansFromFirestore(user.uid, getWeekNumber(today), today.getFullYear());
    const enriched = await Promise.all(week.map(p => enrichWithMeals(p)));
    setWeekPlans(enriched);
  }, [user, enrichWithMeals]);

  const handleSetMealsPerDay = useCallback(async (count: number) => {
    await setMealsPerDay(count);
    setMealsPerDayState(count);
    if (user?.uid) {
      await savePreferencesToFirestore(user.uid, {
        displayName: await getDisplayName(),
        mealsPerDay: count,
        weekStartDay: await getWeekStartDay(),
      });
    }
    await generateDayPlan(selectedDate);
  }, [selectedDate, generateDayPlan, user]);

  const handleSetWeekStartDay = useCallback(async (day: 'monday' | 'sunday') => {
    await setWeekStartDay(day);
    setWeekStartDayState(day);
    if (user?.uid) {
      await savePreferencesToFirestore(user.uid, {
        displayName: await getDisplayName(),
        mealsPerDay: await getMealsPerDay(),
        weekStartDay: day,
      });
    }
  }, [user]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        await loadPreferences();
        
        // Seed data if needed
        const loaded = await isSeedDataLoaded();
        if (!loaded && user?.uid) {
          await seedDatabase(user.uid);
          await setSeedDataLoaded();
        }

        const today = new Date();
        const todayStr = formatDateString(today);
        setSelectedDate(todayStr);
        
        // Load current day plan from Firestore
        if (user?.uid) {
          const existingPlan = await getDayPlanFromFirestore(user.uid, todayStr);
          if (existingPlan) {
            const withMeals = await enrichWithMeals(existingPlan);
            setDayPlan(withMeals);
          }
          
          // Load current week
          const week = await getWeekPlansFromFirestore(user.uid, getWeekNumber(today), today.getFullYear());
          const enrichedWeek = await Promise.all(week.map(p => enrichWithMeals(p)));
          setWeekPlans(enrichedWeek);
          
          // Load history (all past dates)
          const allPlans = await getAllDayPlansFromFirestore(user.uid);
          const pastPlans = allPlans.filter(p => p.date < todayStr);
          const enrichedHistory = await Promise.all(pastPlans.map(p => enrichWithMeals(p)));
          setHistoryPlans(enrichedHistory);
        }
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [loadPreferences, user, enrichWithMeals]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value: MealPlanContextType = {
    user,
    isOnline,
    selectedDate,
    selectedWeek,
    weekStartDay,
    dayPlan,
    weekPlans,
    historyPlans,
    mealsPerDay,
    isLoading,
    setMealsPerDay: handleSetMealsPerDay,
    setWeekStartDay: handleSetWeekStartDay,
    setSelectedDate,
    setSelectedWeek,
    generateDayPlan,
    generateWeekPlan,
    regenerateDay,
    loadPlanForDate,
    refreshWeek,
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