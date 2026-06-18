import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { DayPlanWithMeals } from '../types/meal';
import { getMealsPerDay, isSeedDataLoaded, setSeedDataLoaded, getWeekStartDay, setWeekStartDay, getDisplayName, setMealsPerDay as setMealsPerDayLocal } from '../services/preferenceManager';
import { generateTodayPlan, generateWeeklyPlan, regenerateDay as regenerateDayService } from '../services/mealPlanGenerator';
import { getWeekPlans, getDayPlan } from '../database/planRepository';
import { getMealCount } from '../database/mealRepository';
import { getWeekNumber, formatDateString } from '../utils/dateHelpers';
import { seedDatabase } from '../services/seedDataLoader';
import { getCurrentUser, onAuthChange } from '../firebase/auth';
import { pushDayPlan, listenToDayPlans, upsertDayPlanToIndexedDB } from '../services/syncService';

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

  const loadPreferences = useCallback(async () => {
    const mpd = await getMealsPerDay();
    const wsd = await getWeekStartDay();
    setMealsPerDayState(mpd);
    setWeekStartDayState(wsd);
  }, []);

  const enrichWithMeals = async (plan: DayPlanWithMeals): Promise<DayPlanWithMeals> => {
    const { getMealById } = await import('../database/mealRepository');
    const [breakfast, lunch, dinner, snack] = await Promise.all([
      plan.breakfastId ? getMealById(plan.breakfastId) : undefined,
      plan.lunchId ? getMealById(plan.lunchId) : undefined,
      plan.dinnerId ? getMealById(plan.dinnerId) : undefined,
      plan.snackId ? getMealById(plan.snackId) : undefined,
    ]);
    return { ...plan, breakfast, lunch, dinner, snack };
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const displayName = await getDisplayName();
          setUser({ uid: currentUser.uid, displayName });
          
          const unsubscribe = onAuthChange((firebaseUser) => {
            if (firebaseUser) {
              getDisplayName().then(dn => {
                setUser({ uid: firebaseUser.uid, displayName: dn });
              });
              
              listenToDayPlans(firebaseUser.uid, async (plan) => {
                await upsertDayPlanToIndexedDB(plan);
                const today = new Date();
                const week = await getWeekPlans(getWeekNumber(today), today.getFullYear());
                setWeekPlans(week);
                const current = await getDayPlan(selectedDate);
                if (current) {
                  const withMeals = await enrichWithMeals(current);
                  setDayPlan(withMeals);
                }
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

  const loadPlanForDate = useCallback(async (dateStr: string) => {
    try {
      const plan = await getDayPlan(dateStr);
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
  }, []);

  const generateDayPlan = useCallback(async (dateStr: string) => {
    try {
      await generateTodayPlan();
      await loadPlanForDate(dateStr);
      
      if (user?.uid) {
        const plan = await getDayPlan(dateStr);
        if (plan) {
          await pushDayPlan(plan, user.uid);
        }
      }
    } catch (e) {
      console.error('Error generating day plan:', e);
    }
  }, [user, loadPlanForDate]);

  const generateWeekPlan = useCallback(async (weekOfYear: number, year: number) => {
    try {
      await generateWeeklyPlan();
      const week = await getWeekPlans(weekOfYear, year);
      setWeekPlans(week);
      
      if (user?.uid) {
        for (const plan of week) {
          await pushDayPlan(plan, user.uid);
        }
      }
    } catch (e) {
      console.error('Error generating week plan:', e);
    }
  }, [user]);

  const regenerateDay = useCallback(async (dateStr: string) => {
    try {
      await regenerateDayService(dateStr);
      await loadPlanForDate(dateStr);
      
      if (user?.uid) {
        const plan = await getDayPlan(dateStr);
        if (plan) {
          await pushDayPlan(plan, user.uid);
        }
      }
    } catch (e) {
      console.error('Error regenerating day:', e);
    }
  }, [user, loadPlanForDate]);

  const refreshWeek = useCallback(async () => {
    const today = new Date();
    const week = await getWeekPlans(getWeekNumber(today), today.getFullYear());
    setWeekPlans(week);
  }, []);

  const handleSetMealsPerDay = useCallback(async (count: number) => {
    await setMealsPerDayLocal(count);
    setMealsPerDayState(count);
    await generateDayPlan(selectedDate);
  }, [selectedDate, generateDayPlan]);

  const handleSetWeekStartDay = useCallback(async (day: 'monday' | 'sunday') => {
    await setWeekStartDay(day);
    setWeekStartDayState(day);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await loadPreferences();
        
        const loaded = await isSeedDataLoaded();
        if (!loaded) {
          const count = await getMealCount();
          if (count === 0) {
            await seedDatabase();
          }
          await setSeedDataLoaded();
        }

        const today = new Date();
        const todayStr = formatDateString(today);
        setSelectedDate(todayStr);
        
        const existingPlan = await getDayPlan(todayStr);
        if (existingPlan) {
          const withMeals = await enrichWithMeals(existingPlan);
          setDayPlan(withMeals);
        }

        const week = await getWeekPlans(getWeekNumber(today), today.getFullYear());
        setWeekPlans(week);

        const allPastPlans = await getWeekPlans(getWeekNumber(new Date('2000-01-01')), 2000);
        const pastPlans = allPastPlans.filter(p => p.date < todayStr);
        const enriched = await Promise.all(pastPlans.map((p: DayPlanWithMeals) => enrichWithMeals(p)));
        setHistoryPlans(enriched);
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [loadPreferences]);

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