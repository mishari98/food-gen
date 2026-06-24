import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MealsPerDayPicker from '../../components/MealsPerDayPicker';

describe('MealsPerDayPicker', () => {
  it('renders 4 options by default', () => {
    render(<MealsPerDayPicker value={1} onChange={() => {}} />);
    expect(screen.getByText('1 Meal')).toBeInTheDocument();
    expect(screen.getByText('2 Meals')).toBeInTheDocument();
    expect(screen.getByText('3 Meals')).toBeInTheDocument();
    expect(screen.getByText('4 Meals')).toBeInTheDocument();
  });

  it('highlights selected value', () => {
    render(<MealsPerDayPicker value={2} onChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    const selected = buttons.find(b => b.textContent === '2 Meals');
    expect(selected?.className).toContain('active');
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<MealsPerDayPicker value={1} onChange={onChange} />);
    fireEvent.click(screen.getByText('3 Meals'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('uses singular "Meal" for 1', () => {
    render(<MealsPerDayPicker value={2} onChange={() => {}} />);
    expect(screen.getByText('1 Meal')).toBeInTheDocument();
  });

  it('uses plural "Meals" for >1', () => {
    render(<MealsPerDayPicker value={1} onChange={() => {}} />);
    expect(screen.getByText('2 Meals')).toBeInTheDocument();
    expect(screen.getByText('3 Meals')).toBeInTheDocument();
    expect(screen.getByText('4 Meals')).toBeInTheDocument();
  });

  it('respects max prop', () => {
    render(<MealsPerDayPicker value={1} onChange={() => {}} max={3} />);
    expect(screen.getByText('3 Meals')).toBeInTheDocument();
    expect(screen.queryByText('4 Meals')).not.toBeInTheDocument();
  });
});