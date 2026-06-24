import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMealPlan, MealPlanProvider } from '../../context/MealPlanContext';
import type { ReactNode } from 'react';

// Mock the firebase/firestore functions used by the context
vi.mock('../../firebase/firestore', () => ({
  getReferenceMeals: vi.fn(() => Promise.resolve([
    { id: 1, name: 'Adobo', cuisine: 'Filipino', dietaryTags: [], prepTimeMinutes: 40, difficulty: 'easy', emoji: '🍗', suggestedFor: ['lunch', 'dinner'], ingredients: [], steps: [], calories: 480, isFavorite: 0, isCustom: 0, photoPath: null, youtubeLink: null },
  ])),
  getCustomMeals: vi.fn(() => Promise.resolve([])),
  getHousehold: vi.fn(() => Promise.resolve(null)),
  getHouseholdMembers: vi.fn(() => Promise.resolve([])),
  getJoinRequests: vi.fn(() => Promise.resolve([])),
  getInvitesForEmail: vi.fn(() => Promise.resolve([])),
  getWeekPlans: vi.fn(() => Promise.resolve([])),
  getUserProfile: vi.fn(() => Promise.resolve(null)),
  createHousehold: vi.fn(() => Promise.resolve('new-household-id')),
  updateUserProfile: vi.fn(() => Promise.resolve()),
}));

// Mock the auth module
vi.mock('../../firebase/auth', () => ({
  onAuthChange: vi.fn((callback: any) => {
    setTimeout(() => callback(null), 0);
    return vi.fn();
  }),
  getCurrentAuthUser: vi.fn(() => null),
  signup: vi.fn(() => Promise.resolve({ uid: 'test-uid', email: 'test@test.com' })),
  login: vi.fn(() => Promise.resolve({ uid: 'test-uid', email: 'test@test.com' })),
  logout: vi.fn(() => Promise.resolve()),
}));

function renderContextHook() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MealPlanProvider>{children}</MealPlanProvider>
  );
  return renderHook(() => useMealPlan(), { wrapper });
}

describe('MealPlanContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with loading state true', async () => {
    const { result } = renderContextHook();
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    // Loading resolves after auth callback fires
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('has no user initially', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.user).toBeNull();
  });

  it('has allMeals as empty array initially', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.allMeals).toEqual([]);
  });

  it('has customMeals as empty array initially', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.customMeals).toEqual([]);
  });

  it('has dayPlan as null initially', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.dayPlan).toBeNull();
  });

  it('has weekPlans as empty array initially', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.weekPlans).toEqual([]);
  });

  it('has household as null initially', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.household).toBeNull();
  });

  it('has householdRole as null initially', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.householdRole).toBeNull();
  });

  it('has no error initially', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBeNull();
  });

  it('has selectedDate as today', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    expect(result.current.selectedDate).toBe(`${yyyy}-${mm}-${dd}`);
  });

  it('setSelectedDate updates the date', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.setSelectedDate('2026-12-25');
    });
    expect(result.current.selectedDate).toBe('2026-12-25');
  });

  it('setSelectedWeek updates the week', async () => {
    const { result } = renderContextHook();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.setSelectedWeek(42);
    });
    expect(result.current.selectedWeek).toBe(42);
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useMealPlan())).toThrow('useMealPlan must be used within a MealPlanProvider');
    spy.mockRestore();
  });
});