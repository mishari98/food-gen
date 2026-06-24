import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DayRow from '../../components/DayRow';
import type { HouseholdDayPlanWithMeals, Meal } from '../../types/meal';

const mockMeal1: Meal = {
  id: 1, name: 'Tapsilog', suggestedFor: ['breakfast'], cuisine: 'Filipino',
  dietaryTags: [], prepTimeMinutes: 20, difficulty: 'easy', emoji: '🍳',
  photoPath: null, youtubeLink: null, ingredients: [], steps: [],
  calories: 550, isFavorite: 0, isCustom: 0,
};
const mockMeal2: Meal = {
  id: 2, name: 'Adobo', suggestedFor: ['lunch'], cuisine: 'Filipino',
  dietaryTags: [], prepTimeMinutes: 40, difficulty: 'easy', emoji: '🍗',
  photoPath: null, youtubeLink: null, ingredients: [], steps: [],
  calories: 480, isFavorite: 0, isCustom: 0,
};
const mockMeal3: Meal = {
  id: 3, name: 'Sinigang', suggestedFor: ['dinner'], cuisine: 'Filipino',
  dietaryTags: [], prepTimeMinutes: 60, difficulty: 'medium', emoji: '🥘',
  photoPath: null, youtubeLink: null, ingredients: [], steps: [],
  calories: 320, isFavorite: 0, isCustom: 0,
};

const basePlan: HouseholdDayPlanWithMeals = {
  date: '2026-06-24',
  weekOfYear: 26,
  year: 2026,
  meals: [
    { mealId: 1, status: 'planned', meal: mockMeal1 },
    { mealId: 2, status: 'planned', meal: mockMeal2 },
  ],
  createdBy: 'user1',
  lastModifiedBy: 'user1',
  isGenerated: 1,
  createdAt: '2026-06-24T00:00:00Z',
  updatedAt: '2026-06-24T00:00:00Z',
};

describe('DayRow', () => {
  it('renders day name and date', () => {
    render(
      <DayRow
        dayPlan={basePlan}
        canEdit={false}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Jun 24')).toBeInTheDocument();
  });

  it('shows meal preview emojis (collapsed)', () => {
    render(
      <DayRow
        dayPlan={basePlan}
        canEdit={false}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    expect(screen.getByText('🍳')).toBeInTheDocument();
    expect(screen.getByText('🍗')).toBeInTheDocument();
  });

  it('shows "No meals" when empty collapsed', () => {
    const emptyPlan = { ...basePlan, meals: [] };
    render(
      <DayRow
        dayPlan={emptyPlan}
        canEdit={false}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    expect(screen.getByText('No meals')).toBeInTheDocument();
  });

  it('expands on header click', () => {
    render(
      <DayRow
        dayPlan={basePlan}
        canEdit={false}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Wed').closest('.day-row-header')!);
    expect(screen.getByText('Tapsilog')).toBeInTheDocument();
    expect(screen.getByText('Adobo')).toBeInTheDocument();
  });

  it('shows meals when expanded', () => {
    render(
      <DayRow
        dayPlan={basePlan}
        canEdit={false}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Wed').closest('.day-row-header')!);
    expect(screen.getByText('Tapsilog')).toBeInTheDocument();
    expect(screen.getByText('Adobo')).toBeInTheDocument();
  });

  it('shows regenerate button when canEdit is true', () => {
    render(
      <DayRow
        dayPlan={basePlan}
        canEdit={true}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    expect(screen.getByTitle('Regenerate this day')).toBeInTheDocument();
  });

  it('hides regenerate button when canEdit is false', () => {
    render(
      <DayRow
        dayPlan={basePlan}
        canEdit={false}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    expect(screen.queryByTitle('Regenerate this day')).not.toBeInTheDocument();
  });

  it('calls onRegenerateDay when confirm', () => {
    const onRegenerateDay = vi.fn();
    (window.confirm as any).mockReturnValue(true);
    render(
      <DayRow
        dayPlan={basePlan}
        canEdit={true}
        onMealClick={() => {}}
        onRegenerateDay={onRegenerateDay}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    fireEvent.click(screen.getByTitle('Regenerate this day'));
    expect(onRegenerateDay).toHaveBeenCalledWith('2026-06-24');
  });

  it('calls onAddMeal on add button click when expanded', () => {
    const onAddMeal = vi.fn();
    render(
      <DayRow
        dayPlan={basePlan}
        canEdit={true}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={onAddMeal}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Wed').closest('.day-row-header')!);
    fireEvent.click(screen.getByText(/Add Meal/));
    expect(onAddMeal).toHaveBeenCalledWith('2026-06-24');
  });

  it('shows empty message when no meals expanded', () => {
    const emptyPlan = { ...basePlan, meals: [] };
    render(
      <DayRow
        dayPlan={emptyPlan}
        canEdit={false}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    fireEvent.click(screen.getByText('No meals').closest('.day-row-header')!);
    expect(screen.getByText('No meals planned for this day')).toBeInTheDocument();
  });

  it('shows "+N" when more than 3 meals collapsed', () => {
    const manyMealsPlan = {
      ...basePlan,
      meals: [
        { mealId: 1, status: 'planned' as const, meal: mockMeal1 },
        { mealId: 2, status: 'planned' as const, meal: mockMeal2 },
        { mealId: 3, status: 'planned' as const, meal: mockMeal3 },
        { mealId: 1, status: 'planned' as const, meal: mockMeal1 },
      ],
    };
    render(
      <DayRow
        dayPlan={manyMealsPlan}
        canEdit={false}
        onMealClick={() => {}}
        onRegenerateDay={() => {}}
        onAddMeal={() => {}}
        onRemoveMeal={() => {}}
        onStatusChange={() => {}}
      />
    );
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});