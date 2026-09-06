import { describe, it, expect } from 'vitest';
import { timeMinutes } from './CalendarTimeline';

describe('calendar time ordering', () => {
  it('handles stored and display times consistently', () => {
    expect(timeMinutes('3:30 PM')).toBe(timeMinutes('15:30:00'));
    expect(timeMinutes('12:00 AM')).toBe(0);
    expect(timeMinutes('12:00 PM')).toBe(720);
  });
  it('places events without a time last', () => {
    expect(timeMinutes(null)).toBe(Infinity);
    expect(timeMinutes('Time TBC')).toBe(Infinity);
  });
});
