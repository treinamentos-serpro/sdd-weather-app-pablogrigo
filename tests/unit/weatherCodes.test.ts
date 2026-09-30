import { describe, expect, it } from 'vitest';
import { getWeatherInfo } from '../../src/lib/weatherCodes';

describe('getWeatherInfo', () => {
  it('returns the Portuguese label and icon for a known code', () => {
    expect(getWeatherInfo(0)).toEqual({ label: 'Céu limpo', icon: '☀️' });
  });

  it('returns an accessible fallback for an unknown code', () => {
    expect(getWeatherInfo(999)).toEqual({ label: 'Condição desconhecida', icon: '🌡️' });
  });
});
