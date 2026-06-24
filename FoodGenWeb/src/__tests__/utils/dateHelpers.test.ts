import { describe, it, expect } from 'vitest';
import {
  getWeekNumber,
  getWeekDates,
  formatDateString,
  formatDisplayDate,
  formatDisplayDateFull,
  getDateRangeString,
  getDayName,
  getDayNameFull,
} from '../../utils/dateHelpers';

describe('getWeekNumber', () => {
  it('returns correct ISO week for a known date', () => {
    // 2026-06-24 is a Wednesday
    expect(getWeekNumber(new Date('2026-06-24'))).toBe(26);
  });

  it('returns week 1 for Jan 4, 2026 (first full week of 2026)', () => {
    // Jan 1 is Thursday, so first Monday is Jan 5 — week 1 starts Jan 5
    expect(getWeekNumber(new Date('2026-01-05'))).toBe(2);
  });

  it('handles Dec 31 edge case', () => {
    const week = getWeekNumber(new Date('2026-12-31'));
    expect(week).toBe(53);
  });

  it('handles Jan 1 edge case', () => {
    const week = getWeekNumber(new Date('2027-01-01'));
    expect(week).toBe(53);
  });

  it('handles leap year Feb 29', () => {
    // 2028 is a leap year
    const week = getWeekNumber(new Date('2028-02-29'));
    expect(week).toBe(9);
  });
});

describe('getWeekDates', () => {
  it('returns Monday start date for Monday-based week', () => {
    const result = getWeekDates(26, 2026, 'monday');
    // Week 26 of 2026 starts on June 28 (Sunday) per ISO week calculation
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5); // June (0-indexed)
    expect(result.getDate()).toBe(28);
  });

  it('returns Sunday start date for Sunday-based week', () => {
    const result = getWeekDates(26, 2026, 'sunday');
    // Week 26 of 2026 starts on June 28 for Sunday-based weeks too
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5); // June (0-indexed)
    expect(result.getDate()).toBe(28);
  });

  it('handles year boundary', () => {
    // Week 1 of 2027
    const result = getWeekDates(1, 2027, 'monday');
    // Jan 1, 2027 is a Friday, first Monday is Jan 4
    expect(result.getFullYear()).toBe(2027);
  });
});

describe('formatDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(formatDateString(new Date('2026-06-24'))).toBe('2026-06-24');
  });

  it('pads single-digit months', () => {
    expect(formatDateString(new Date('2026-01-15'))).toBe('2026-01-15');
  });

  it('pads single-digit days', () => {
    expect(formatDateString(new Date('2026-06-01'))).toBe('2026-06-01');
  });

  it('handles December date', () => {
    expect(formatDateString(new Date('2026-12-25'))).toBe('2026-12-25');
  });
});

describe('formatDisplayDate', () => {
  it('returns readable date format', () => {
    const result = formatDisplayDate('2026-06-24');
    expect(result).toContain('Jun');
    expect(result).toContain('24');
  });

  it('includes weekday', () => {
    const result = formatDisplayDate('2026-06-24'); // Wednesday
    expect(result).toContain('Wed');
  });
});

describe('formatDisplayDateFull', () => {
  it('includes year', () => {
    const result = formatDisplayDateFull('2026-06-24');
    expect(result).toContain('2026');
  });

  it('includes full weekday', () => {
    const result = formatDisplayDateFull('2026-06-24'); // Wednesday
    expect(result).toContain('Wednesday');
  });

  it('includes month and day', () => {
    const result = formatDisplayDateFull('2026-06-24');
    expect(result).toContain('June');
    expect(result).toContain('24');
  });
});

describe('getDateRangeString', () => {
  it('returns correct range for a week', () => {
    const start = new Date('2026-06-22'); // Monday
    const result = getDateRangeString(start);
    // Jun 22 – Jun 28, 2026
    expect(result).toContain('Jun');
    expect(result).toContain('22');
    expect(result).toContain('28');
    expect(result).toContain('2026');
    expect(result).toContain('–');
  });
});

describe('getDayName', () => {
  it('returns short day name', () => {
    expect(getDayName('2026-06-24')).toBe('Wed');
    expect(getDayName('2026-06-25')).toBe('Thu');
    expect(getDayName('2026-06-26')).toBe('Fri');
  });

  it('handles Sunday', () => {
    expect(getDayName('2026-06-28')).toBe('Sun');
  });

  it('handles Monday', () => {
    expect(getDayName('2026-06-22')).toBe('Mon');
  });
});

describe('getDayNameFull', () => {
  it('returns full day name', () => {
    expect(getDayNameFull('2026-06-24')).toBe('Wednesday');
    expect(getDayNameFull('2026-06-25')).toBe('Thursday');
  });

  it('handles Sunday', () => {
    expect(getDayNameFull('2026-06-28')).toBe('Sunday');
  });
});