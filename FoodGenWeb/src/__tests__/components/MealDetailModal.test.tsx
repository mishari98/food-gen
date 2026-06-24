import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MealDetailModal from '../../components/MealDetailModal';
import type { Meal } from '../../types/meal';

const mockMeal: Meal = {
  id: 1,
  name: 'Chicken Adobo',
  suggestedFor: ['lunch', 'dinner'],
  cuisine: 'Filipino',
  dietaryTags: ['gluten-free'],
  prepTimeMinutes: 40,
  difficulty: 'easy',
  emoji: '🍗',
  photoPath: null,
  youtubeLink: 'https://youtube.com/watch?v=test',
  ingredients: [
    { name: 'Chicken thighs', quantity: '500g' },
    { name: 'Soy sauce', quantity: '1/4 cup' },
  ],
  steps: ['Marinate chicken', 'Simmer for 30 min', 'Serve'],
  calories: 480,
  isFavorite: 0,
  isCustom: 0,
};

const mockCustomMeal: Meal = {
  ...mockMeal,
  name: 'My Custom Dish',
  isCustom: 1,
  youtubeLink: null,
  calories: null,
  dietaryTags: [],
};

describe('MealDetailModal', () => {
  it('returns null when not visible', () => {
    const { container } = render(<MealDetailModal visible={false} meal={mockMeal} onClose={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when meal is null', () => {
    const { container } = render(<MealDetailModal visible={true} meal={null} onClose={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders meal name and emoji', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    expect(screen.getByText('Chicken Adobo')).toBeInTheDocument();
    expect(screen.getByText('🍗')).toBeInTheDocument();
  });

  it('renders suggestedFor slots', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    expect(screen.getByText(/lunch/)).toBeInTheDocument();
    expect(screen.getByText(/dinner/)).toBeInTheDocument();
  });

  it('renders ingredient list', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    expect(screen.getByText('Chicken thighs')).toBeInTheDocument();
    expect(screen.getByText('500g')).toBeInTheDocument();
    expect(screen.getByText('Soy sauce')).toBeInTheDocument();
  });

  it('renders steps list', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    expect(screen.getByText('Marinate chicken')).toBeInTheDocument();
    expect(screen.getByText('Simmer for 30 min')).toBeInTheDocument();
    expect(screen.getByText('Serve')).toBeInTheDocument();
  });

  it('renders dietary tags when present', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    expect(screen.getByText(/gluten-free/)).toBeInTheDocument();
  });

  it('does not render dietary tags section when empty', () => {
    render(<MealDetailModal visible={true} meal={mockCustomMeal} onClose={() => {}} />);
    expect(screen.queryByText('🌿')).not.toBeInTheDocument();
  });

  it('shows YouTube link when present', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    const link = screen.getByText(/Watch Recipe/);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://youtube.com/watch?v=test');
  });

  it('hides YouTube link when null', () => {
    render(<MealDetailModal visible={true} meal={mockCustomMeal} onClose={() => {}} />);
    expect(screen.queryByText(/Watch Recipe/)).not.toBeInTheDocument();
  });

  it('shows calories when present', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    expect(screen.getByText(/~480 cal/)).toBeInTheDocument();
  });

  it('does not show calories when null', () => {
    render(<MealDetailModal visible={true} meal={mockCustomMeal} onClose={() => {}} />);
    expect(screen.queryByText(/cal/)).not.toBeInTheDocument();
  });

  it('closes on overlay click', () => {
    const onClose = vi.fn();
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={onClose} />);
    fireEvent.click(screen.getByText('Chicken Adobo').closest('.modal-overlay')!);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on close button click', () => {
    const onClose = vi.fn();
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={onClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows custom badge for custom meals', () => {
    render(<MealDetailModal visible={true} meal={mockCustomMeal} onClose={() => {}} />);
    expect(screen.getByText(/👤 You/)).toBeInTheDocument();
  });

  it('does not show custom badge for reference meals', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    expect(screen.queryByText('👤 You')).not.toBeInTheDocument();
  });

  it('renders difficulty badge', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    expect(screen.getByText('🔥 Easy')).toBeInTheDocument();
  });

  it('shows prep time', () => {
    render(<MealDetailModal visible={true} meal={mockMeal} onClose={() => {}} />);
    expect(screen.getByText(/40 min/)).toBeInTheDocument();
  });
});