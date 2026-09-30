import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %d °C to %d °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('preserves Celsius and converts to Fahrenheit by unit', () => {
    expect(convertTemperature(20.5, 'celsius')).toBe(20.5);
    expect(convertTemperature(20.5, 'fahrenheit')).toBe(68.9);
  });

  it('rounds half values away from zero and formats the unit symbol', () => {
    expect(formatTemperature(20.5, 'celsius')).toBe('21 °C');
    expect(formatTemperature(-20.5, 'celsius')).toBe('-21 °C');
    expect(formatTemperature(20.5, 'fahrenheit')).toBe('69 °F');
  });

  it('uses a safe fallback for non-finite temperatures', () => {
    expect(formatTemperature(Number.NaN, 'celsius')).toBe('Indisponível');
    expect(formatTemperature(Number.POSITIVE_INFINITY, 'fahrenheit')).toBe('Indisponível');
  });

  it('returns the symbol for the selected unit', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
