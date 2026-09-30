import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 8_000;

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isAbortError(error: unknown): boolean {
  return isRecord(error) && error.name === 'AbortError';
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new WeatherServiceError('Não foi possível concluir a consulta.');

    try {
      return await response.json();
    } catch (error) {
      if (isAbortError(error)) throw error;
      if (error instanceof TypeError) throw new WeatherServiceError('Falha de rede.');
      throw new WeatherServiceError('A resposta da Open-Meteo é inválida.');
    }
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (isAbortError(error)) {
      throw new WeatherServiceError('A consulta demorou mais que o esperado');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeout);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isLocalDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  );
}

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function getLocalDate(timezone: string, localTime: string | null): string {
  if (localTime && isLocalDate(localTime.slice(0, 10))) return localTime.slice(0, 10);

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
  const response = await fetchJson(url);
  if (!isRecord(response)) throw new WeatherServiceError('A resposta da Open-Meteo é inválida.');
  if (response.results === undefined) return [];
  if (!Array.isArray(response.results)) {
    throw new WeatherServiceError('A resposta da Open-Meteo é inválida.');
  }

  return response.results.slice(0, 5).flatMap((item): City[] => {
    if (!isRecord(item) || typeof item.name !== 'string') return [];
    const latitude = nullableNumber(item.latitude);
    const longitude = nullableNumber(item.longitude);
    if (latitude === null || longitude === null) return [];

    return [
      {
        ...(typeof item.id === 'number' ? { id: item.id } : {}),
        name: item.name,
        ...(optionalString(item.country) ? { country: optionalString(item.country) } : {}),
        ...(optionalString(item.country_code)
          ? { countryCode: optionalString(item.country_code) }
          : {}),
        ...(optionalString(item.admin1) ? { admin1: optionalString(item.admin1) } : {}),
        ...(optionalString(item.admin2) ? { admin2: optionalString(item.admin2) } : {}),
        latitude,
        longitude,
      },
    ];
  });
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
  });
  const response = await fetchJson(`${FORECAST_URL}?${params.toString()}`);
  if (!isRecord(response)) {
    throw new WeatherServiceError('A resposta da Open-Meteo está incompleta.');
  }

  const dailyResponse = isRecord(response.daily) ? response.daily : {};
  const currentResponse = isRecord(response.current) ? response.current : {};
  const timezone = optionalString(response.timezone) ?? null;
  const localTime = optionalString(currentResponse.time) ?? null;
  const offsetSeconds = nullableNumber(response.utc_offset_seconds);
  const localTimestamp = localTime ? Date.parse(`${localTime}Z`) : Number.NaN;
  const current: CurrentWeather = {
    temperatureC: nullableNumber(currentResponse.temperature_2m),
    weatherCode: nullableNumber(currentResponse.weather_code),
    humidityPercent: nullableNumber(currentResponse.relative_humidity_2m),
    windSpeedKmh: nullableNumber(currentResponse.wind_speed_10m),
    precipitationMm: nullableNumber(currentResponse.precipitation),
    pressureHpa: nullableNumber(currentResponse.surface_pressure),
    observedAt:
      Number.isFinite(localTimestamp) && offsetSeconds !== null
        ? new Date(localTimestamp - offsetSeconds * 1000).toISOString()
        : null,
    localTime,
  };

  const dailyTimes = Array.isArray(dailyResponse.time)
    ? dailyResponse.time.filter(isLocalDate).slice(0, 5)
    : [];
  const dailyWeatherCodes = Array.isArray(dailyResponse.weather_code)
    ? dailyResponse.weather_code
    : [];
  const dailyMinimums = Array.isArray(dailyResponse.temperature_2m_min)
    ? dailyResponse.temperature_2m_min
    : [];
  const dailyMaximums = Array.isArray(dailyResponse.temperature_2m_max)
    ? dailyResponse.temperature_2m_max
    : [];
  const dailyPrecipitationProbabilities = Array.isArray(dailyResponse.precipitation_probability_max)
    ? dailyResponse.precipitation_probability_max
    : [];
  const dailyPrecipitationSums = Array.isArray(dailyResponse.precipitation_sum)
    ? dailyResponse.precipitation_sum
    : [];
  const forecast: ForecastDay[] =
    timezone === null
      ? []
      : Array.from({ length: 5 }, (_, index) => ({
          date: addDays(dailyTimes[0] ?? getLocalDate(timezone, localTime), index),
          weatherCode: nullableNumber(dailyWeatherCodes[index]),
          minimumC: nullableNumber(dailyMinimums[index]),
          maximumC: nullableNumber(dailyMaximums[index]),
          precipitationProbabilityPercent: nullableNumber(dailyPrecipitationProbabilities[index]),
          precipitationSumMm: nullableNumber(dailyPrecipitationSums[index]),
        }));

  return {
    city,
    current,
    forecast,
    timezone,
    source: 'Open-Meteo',
  };
}
