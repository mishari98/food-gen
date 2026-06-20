export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getWeekDates(weekOfYear: number, year: number, weekStartDay: 'monday' | 'sunday' = 'monday'): Date {
  // Start from Jan 1 of the year
  const jan1 = new Date(year, 0, 1);
  // Find the first day of the first week
  const firstDayOfWeek = weekStartDay === 'sunday' ? 0 : 1;
  let dayOfWeek = jan1.getDay();
  if (dayOfWeek === 0) dayOfWeek = 7; // Sunday = 7 for Monday-based
  
  const offsetToFirstWeek = firstDayOfWeek === 0 
    ? (dayOfWeek === 7 ? 0 : 7 - dayOfWeek) 
    : (dayOfWeek >= firstDayOfWeek ? dayOfWeek - firstDayOfWeek : 7 - firstDayOfWeek + dayOfWeek);
  
  const firstWeekStart = new Date(year, 0, 1 + offsetToFirstWeek);
  // Add (weekOfYear - 1) weeks
  const targetDate = new Date(firstWeekStart);
  targetDate.setDate(targetDate.getDate() + (weekOfYear - 1) * 7);
  return targetDate;
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

export function formatDisplayDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

export function getDateRangeString(weekStartDate: Date): string {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getDayNameFull(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}