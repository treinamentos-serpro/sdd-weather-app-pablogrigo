import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    name: 'Recife',
    country: 'Brasil',
    countryCode: 'BR',
    admin1: 'Pernambuco',
    latitude: -8.0543,
    longitude: -34.8813,
  },
  current: {
    temperatureC: 28,
    weatherCode: 2,
    observedAt: '2026-09-30T15:00:00Z',
    localTime: '2026-09-30T12:00',
    humidityPercent: 78,
    windSpeedKmh: 16,
    precipitationMm: 0,
    pressureHpa: 1013,
  },
  forecast: [
    {
      date: '2026-09-30',
      weatherCode: 2,
      minimumC: 24,
      maximumC: 30,
      precipitationProbabilityPercent: 10,
    },
    {
      date: '2026-10-01',
      weatherCode: 3,
      minimumC: 23,
      maximumC: 29,
      precipitationProbabilityPercent: 25,
    },
    {
      date: '2026-10-02',
      weatherCode: 61,
      minimumC: 24,
      maximumC: 28,
      precipitationProbabilityPercent: 80,
    },
    {
      date: '2026-10-03',
      weatherCode: 1,
      minimumC: 23,
      maximumC: 31,
      precipitationProbabilityPercent: 15,
    },
    {
      date: '2026-10-04',
      weatherCode: 0,
      minimumC: 24,
      maximumC: 32,
      precipitationProbabilityPercent: 0,
    },
  ],
  timezone: 'America/Recife',
  source: 'Open-Meteo',
};
