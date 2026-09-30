import type { Unit } from '../types/weather';

export function convertTemperature(temperatureC: number, unit: Unit): number {
  return unit === 'fahrenheit' ? temperatureC * (9 / 5) + 32 : temperatureC;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(temperatureC: number, unit: Unit): string {
  if (!Number.isFinite(temperatureC)) return 'Indisponível';
  const value = convertTemperature(temperatureC, unit);
  const rounded = Math.sign(value) * Math.round(Math.abs(value));
  return `${rounded} ${unitLabel(unit)}`;
}
