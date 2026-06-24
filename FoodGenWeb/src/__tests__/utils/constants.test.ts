import { describe, it, expect } from 'vitest';
import {
  getSlotsForMealsPerDay,
  getSlotEmoji,
  MEAL_SLOTS,
} from '../../utils/constants';

describe('MEAL_SLOTS', () => {
  it('has 4 meal slots', () => {
    expect(MEAL_SLOTS).toHaveLength(4);
  });

  it('includes breakfast, lunch, dinner, snack', () => {
    const names = MEAL_SLOTS.map(s => s.name);
    expect(names).toContain('breakfast');
    expect(names).toContain('lunch');
    expect(names).toContain('dinner');
    expect(names).toContain('snack');
  });

  it('each slot has id, name, emoji', () => {
    MEAL_SLOTS.forEach(slot => {
      expect(slot).toHaveProperty('id');
      expect(slot).toHaveProperty('name');
      expect(slot).toHaveProperty('emoji');
    });
  });
});

describe('getSlotsForMealsPerDay', () => {
  it('returns ["dinner"] for 1 meal', () => {
    expect(getSlotsForMealsPerDay(1)).toEqual(['dinner']);
  });

  it('returns ["lunch", "dinner"] for 2 meals', () => {
    expect(getSlotsForMealsPerDay(2)).toEqual(['lunch', 'dinner']);
  });

  it('returns ["breakfast", "lunch", "dinner"] for 3 meals', () => {
    expect(getSlotsForMealsPerDay(3)).toEqual(['breakfast', 'lunch', 'dinner']);
  });

  it('returns ["dinner"] as fallback for 4 meals', () => {
    expect(getSlotsForMealsPerDay(4)).toEqual(['dinner']);
  });

  it('returns ["dinner"] as fallback for 0 meals', () => {
    expect(getSlotsForMealsPerDay(0)).toEqual(['dinner']);
  });

  it('returns ["dinner"] as fallback for negative', () => {
    expect(getSlotsForMealsPerDay(-1)).toEqual(['dinner']);
  });

  it('returns ["dinner"] as fallback for values > 3', () => {
    expect(getSlotsForMealsPerDay(10)).toEqual(['dinner']);
  });
});

describe('getSlotEmoji', () => {
  it('returns sunrise emoji for breakfast', () => {
    expect(getSlotEmoji('breakfast')).toBe('🌅');
  });

  it('returns sun emoji for lunch', () => {
    expect(getSlotEmoji('lunch')).toBe('☀️');
  });

  it('returns moon emoji for dinner', () => {
    expect(getSlotEmoji('dinner')).toBe('🌙');
  });

  it('returns fallback for unknown slot', () => {
    expect(getSlotEmoji('brunch' as any)).toBe('🍽️');
  });

  it('returns fallback for empty string', () => {
    expect(getSlotEmoji('' as any)).toBe('🍽️');
  });
});