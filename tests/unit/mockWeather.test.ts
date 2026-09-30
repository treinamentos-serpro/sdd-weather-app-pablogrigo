import { describe, expect, it } from 'vitest';
import { mockWeatherData } from '../../src/mocks/weather';

describe('mockWeatherData', () => {
  it('provides current conditions and five consecutive local forecast days', () => {
    expect(mockWeatherData.city.name).toBe('Recife');
    expect(mockWeatherData.timezone).toBe('America/Recife');
    expect(mockWeatherData.current.temperatureC).toBe(28);
    expect(mockWeatherData.current.observedAt).toBe('2026-09-30T15:00:00Z');
    expect(mockWeatherData.current.localTime).toBe('2026-09-30T12:00');
    expect(mockWeatherData.forecast.map((day) => day.date)).toEqual([
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
  });
});
