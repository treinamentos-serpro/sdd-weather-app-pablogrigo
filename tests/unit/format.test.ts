import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('format', () => {
  it('labels the first two forecast days relative to today', () => {
    expect(getDayLabel('2026-09-30', 0)).toBe('Hoje');
    expect(getDayLabel('2026-10-01', 1)).toBe('Amanhã');
  });

  it('uses the weekday for later days and formats the short date', () => {
    expect(getDayLabel('2026-10-02', 2)).toBe('Sex');
    expect(getShortDate('2026-10-02')).toBe('02/10/2026');
  });
});
