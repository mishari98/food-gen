import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MealCard from '../../components/MealCard';
import type { Meal } from '../../types/meal';

const mockMeal: Meal = {
  id: 1,
  name: 'Tapsilog',
  suggestedFor: ['breakfast', 'lunch'],
  cuisine: 'Filipino',
  dietaryTags: [],
  prepTimeMinutes: 20,
  difficulty: 'easy',
  emoji: '🍳',
  photoPath: null,
  youtubeLink: null,
  ingredients: [{ name: 'Beef tapa', quantity: '200g' }],
  steps: ['Cook'],
  calories: 550,
  isFavorite: 0,
  isCustom: 0,
};

const mockCustomMeal: Meal = { ...mockMeal, name: 'My Dish', isCustom: 1 };

describe('MealCard', () => {
  it('renders meal name and emoji', () => {
    render(<MealCard meal={mockMeal} />);
    expect(screen.getByText('Tapsilog')).toBeInTheDocument();
    expect(screen.getByText('🍳')).toBeInTheDocument();
  });

  it('shows difficulty badge', () => {
    render(<MealCard meal={mockMeal} />);
    expect(screen.getByText('🔥 Easy')).toBeInTheDocument();
  });

  it('shows prep time', () => {
    render(<MealCard meal={mockMeal} />);
    expect(screen.getByText(/20 min/)).toBeInTheDocument();
  });

  it('shows status badge when status provided', () => {
    render(<MealCard meal={mockMeal} status="planned" />);
    expect(screen.getByText(/Planned/)).toBeInTheDocument();
  });

  it('calls onStatusClick when status clicked', () => {
    const onStatusClick = vi.fn();
    render(<MealCard meal={mockMeal} status="planned" onStatusClick={onStatusClick} />);
    fireEvent.click(screen.getByText(/Planned/));
    expect(onStatusClick).toHaveBeenCalledOnce();
  });

  it('shows remove button when showRemove is true', () => {
    const onRemove = vi.fn();
    render(<MealCard meal={mockMeal} showRemove={true} onRemove={onRemove} />);
    const removeBtn = screen.getByText('✕');
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('hides remove button when showRemove is false', () => {
    render(<MealCard meal={mockMeal} showRemove={false} />);
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  it('hides remove button by default', () => {
    render(<MealCard meal={mockMeal} />);
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  it('shows suggest swap button when showSuggestSwap is true', () => {
    const onSuggestSwap = vi.fn();
    render(<MealCard meal={mockMeal} showSuggestSwap={true} onSuggestSwap={onSuggestSwap} />);
    const swapBtn = screen.getByTitle('Suggest a swap');
    expect(swapBtn).toBeInTheDocument();
    fireEvent.click(swapBtn);
    expect(onSuggestSwap).toHaveBeenCalledOnce();
  });

  it('shows custom badge for custom meals', () => {
    render(<MealCard meal={mockCustomMeal} />);
    expect(screen.getByText(/You/)).toBeInTheDocument();
  });

  it('does not show custom badge for reference meals', () => {
    render(<MealCard meal={mockMeal} />);
    expect(screen.queryByText(/You/)).not.toBeInTheDocument();
  });

  it('shows empty state when meal is null', () => {
    render(<MealCard meal={undefined} />);
    expect(screen.getByText('No meal assigned')).toBeInTheDocument();
  });

  it('calls onClick when card clicked', () => {
    const onClick = vi.fn();
    render(<MealCard meal={mockMeal} onClick={onClick} />);
    fireEvent.click(screen.getByText('Tapsilog').closest('.meal-card-content')!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('remove button click does not trigger card click', () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(<MealCard meal={mockMeal} onClick={onClick} onRemove={onRemove} showRemove={true} />);
    fireEvent.click(screen.getByText('✕'));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows label when provided', () => {
    render(<MealCard meal={mockMeal} label="breakfast" />);
    expect(screen.getByText('breakfast')).toBeInTheDocument();
  });

  it('renders in_progress status as Cooking', () => {
    render(<MealCard meal={mockMeal} status="in_progress" />);
    expect(screen.getByText(/Cooking/)).toBeInTheDocument();
  });

  it('renders completed status as Done', () => {
    render(<MealCard meal={mockMeal} status="completed" />);
    expect(screen.getByText(/Done/)).toBeInTheDocument();
  });

  it('renders skipped status', () => {
    render(<MealCard meal={mockMeal} status="skipped" />);
    expect(screen.getByText(/Skipped/)).toBeInTheDocument();
  });
});