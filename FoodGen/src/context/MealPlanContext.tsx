import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { DayPlanWithMeals } from '../types/meal';
import { getMealsPerDay, getShowLabels, setMealsPerDay, setShowLabels, isSeedDataLoaded, setSeedDataLoaded } from '../services/preferenceManager';
import { generateTodayPlan, generateWeeklyPlan } from '../services/mealPlanGenerator';
import { getWeekPlans, getDayPlan } from '../database/planRepository';
import { getMealCount } from '../database/mealRepository';
import { getWeekNumber, formatDateString } from '../utils/dateHelpers';
import { seedDatabase } from '../services/seedDataLoader';

interface MealPlanContextType {
  todayPlan: DayPlanWithMeals | null;
  weekPlans: DayPlanWithMeals[];
  mealsPerDay: number;
  showLabels: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setMealsPerDay: (count: number) => Promise<void>;
  setShowLabels: (show: boolean) => Promise<void>;
  refreshToday: () => Promise<void>;
  refreshWeek: () => Promise<void>;
  generateWeek: () => Promise<void>;
  regenerateDay: (date: string) => Promise<void>;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export function MealPlanProvider({ children }: { children: ReactNode }) {
  const [todayPlan, setTodayPlan] = useState<DayPlanWithMeals | null>(null);
  const [weekPlans, setWeekPlans] = useState<DayPlanWithMeals[]>([]);
  const [mealsPerDayState, setMealsPerDayState] = useState(1);
  const [showLabelsState, setShowLabelsState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = useCallback(async () => {
    try {
      // Check if seed data needs to be loaded
      const loaded = await isSeedDataLoaded();
      if (!loaded) {
        const count = await getMealCount();
        if (count === 0) {
          await seedDatabase();
        }
        await setSeedDataLoaded();
      }

      // Load preferences
      const mpd = await getMealsPerDay();
      const sl = await getShowLabels();
      setMealsPerDayState(mpd);
      setShowLabelsState(sl);

      // Load today's plan
      const today = new Date();
      const todayStr = formatDateString(today);
      const existingPlan = await getDayPlan(todayStr);
      if (existingPlan) {
        const week = await getWeekPlans(getWeekNumber(today), today.getFullYear());
        const todayPlanWithMeals = week.find(w => w.date === todayStr) || null;
        setTodayPlan(todayPlanWithMeals);
        setWeekPlans(week);
      } else {
        // Auto-generate today's meals on first launch
        await generateTodayPlan();
        const week = await getWeekPlans(getWeekNumber(today), today.getFullYear());
        const todayPlanWithMeals = week.find(w => w.date === todayStr) || null;
        setTodayPlan(todayPlanWithMeals);
        setWeekPlans(week);
      }

      setIsInitialized(true);
    } catch (e) {
      console.error('Initialization error:', e);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSetMealsPerDay = useCallback(async (count: number) => {
    await setMealsPerDay(count);
    setMealsPerDayState(count);
    // Regenerate after changing meals per day
    const today = new Date();
    const todayStr = formatDateString(today);
    await generateTodayPlan();
    const week = await getWeekPlans(getWeekNumber(today), today.getFullYear());
    const todayPlanWithMeals = week.find(w => w.date === todayStr) || null;
    setTodayPlan(todayPlanWithMeals);
    setWeekPlans(week);
  }, []);

  const handleSetShowLabels = useCallback(async (show: boolean) => {
    await setShowLabels(show);
    setShowLabelsState(show);
  }, []);

  const refreshToday = useCallback(async () => {
    await generateTodayPlan();
    const today = new Date();
    const todayStr = formatDateString(today);
    const week = await getWeekPlans(getWeekNumber(today), today.getFullYear());
    const todayPlanWithMeals = week.find(w => w.date === todayStr) || null;
    setTodayPlan(todayPlanWithMeals);
    setWeekPlans(week);
  }, []);

  const refreshWeek = useCallback(async () => {
    const today = new Date();
    const week = await getWeekPlans(getWeekNumber(today), today.getFullYear());
    setWeekPlans(week);
  }, []);

  const generateWeek = useCallback(async () => {
    await generateWeeklyPlan();
    await refreshWeek();
    // Also update today
    const todayStr = formatDateString(new Date());
    const week = await getWeekPlans(getWeekNumber(new Date()), new Date().getFullYear());
    const todayPlanWithMeals = week.find(w => w.date === todayStr) || null;
    setTodayPlan(todayPlanWithMeals);
    setWeekPlans(week);
  }, [refreshWeek]);

  const handleRegenerateDay = useCallback(async (date: string) => {
    const { regenerateDay: regenDay } = await import('../services/mealPlanGenerator');
    await regenDay(date);
    await refreshWeek();
  }, [refreshWeek]);

  return (
    <MealPlanContext.Provider
      value={{
        todayPlan,
        weekPlans,
        mealsPerDay: mealsPerDayState,
        showLabels: showLabelsState,
        isLoading,
        isInitialized,
        setMealsPerDay: handleSetMealsPerDay,
        setShowLabels: handleSetShowLabels,
        refreshToday,
        refreshWeek,
        generateWeek,
        regenerateDay: handleRegenerateDay,
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
}