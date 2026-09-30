import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São José',
  country: 'Brasil',
  countryCode: 'BR',
  admin1: 'Pernambuco',
  latitude: -8.05,
  longitude: -34.88,
};

const dailyTimes = ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('weatherService', () => {
  it('does not request geocoding for an empty name', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('  ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the city name and maps geocoding results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 7,
            name: "L'Haÿ-les-Roses",
            latitude: 48.78,
            longitude: 2.34,
            country: 'França',
            country_code: 'FR',
            admin1: 'Île-de-France',
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const cities = await searchCities("L'Haÿ-les-Roses");
    const requestedUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestedUrl).toContain(`name=${encodeURIComponent("L'Haÿ-les-Roses")}`);
    expect(requestedUrl).toContain('count=5&language=pt&format=json');
    expect(cities).toEqual([
      {
        id: 7,
        name: "L'Haÿ-les-Roses",
        latitude: 48.78,
        longitude: 2.34,
        country: 'França',
        countryCode: 'FR',
        admin1: 'Île-de-France',
      },
    ]);
  });

  it('returns an empty list when geocoding omits results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Recife')).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps current conditions and five daily entries using forecast parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Recife',
        utc_offset_seconds: -10_800,
        current: {
          time: '2026-09-30T12:00',
          temperature_2m: 24.3,
          weather_code: 2,
          relative_humidity_2m: 75,
          wind_speed_10m: 14.2,
          precipitation: 0.1,
          surface_pressure: 1012.7,
        },
        daily: {
          time: dailyTimes,
          weather_code: [2, 3],
          temperature_2m_min: [22],
          temperature_2m_max: [29],
          precipitation_probability_max: [96, 81],
          precipitation_sum: [4.9, 5.2],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);
    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.searchParams.get('latitude')).toBe('-8.05');
    expect(requestedUrl.searchParams.get('longitude')).toBe('-34.88');
    expect(requestedUrl.searchParams.get('current')).toBe(
      'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure',
    );
    expect(requestedUrl.searchParams.get('daily')).toBe(
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum',
    );
    expect(requestedUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestedUrl.searchParams.get('timezone')).toBe('auto');
    expect(requestedUrl.searchParams.get('temperature_unit')).toBe('celsius');
    expect(result.city).toBe(city);
    expect(result.current).toEqual({
      temperatureC: 24.3,
      weatherCode: 2,
      humidityPercent: 75,
      windSpeedKmh: 14.2,
      precipitationMm: 0.1,
      pressureHpa: 1012.7,
      localTime: '2026-09-30T12:00',
      observedAt: '2026-09-30T15:00:00.000Z',
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toEqual({
      date: dailyTimes[0],
      weatherCode: 2,
      minimumC: 22,
      maximumC: 29,
      precipitationProbabilityPercent: 96,
      precipitationSumMm: 4.9,
    });
    expect(result.forecast[2]).toEqual({
      date: dailyTimes[2],
      weatherCode: null,
      minimumC: null,
      maximumC: null,
      precipitationProbabilityPercent: null,
      precipitationSumMm: null,
    });
  });

  it('throws a service error for incomplete forecast responses and HTTP failures', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => null })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(searchCities('Recife')).rejects.toMatchObject({
      name: 'WeatherServiceError',
    });
  });

  it('converts network failures and aborts to service errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await expect(searchCities('Recife')).rejects.toThrow('Falha de rede.');

    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );
    const pendingRequest = searchCities('Recife');
    const timeoutExpectation = expect(pendingRequest).rejects.toThrow(
      'A consulta demorou mais que o esperado',
    );
    await vi.advanceTimersByTimeAsync(8_000);
    await timeoutExpectation;
  });

  it('applies the timeout while reading a stalled response body', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) =>
        Promise.resolve({
          ok: true,
          json: () =>
            new Promise((_, reject) => {
              init.signal?.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              );
            }),
        }),
      ),
    );

    const pendingRequest = searchCities('Recife');
    const timeoutExpectation = expect(pendingRequest).rejects.toThrow(
      'A consulta demorou mais que o esperado',
    );
    await vi.advanceTimersByTimeAsync(8_000);
    await timeoutExpectation;
  });

  it('reports a network error when the response body is interrupted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new TypeError('offline');
        },
      }),
    );

    await expect(searchCities('Recife')).rejects.toThrow('Falha de rede.');
  });

  it('preserves current conditions and provides five dates when daily data is absent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: 'America/Recife',
          current: { time: '2026-09-30T12:00', temperature_2m: 24 },
        }),
      }),
    );

    const result = await getWeather(city);

    expect(result.current.temperatureC).toBe(24);
    expect(result.forecast.map(({ date }) => date)).toEqual(dailyTimes);
    expect(
      result.forecast.every(({ maximumC, minimumC }) => maximumC === null && minimumC === null),
    ).toBe(true);
  });

  it('preserves available current data and marks missing daily fields as null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: 'America/Recife',
          current: { temperature_2m: 0 },
          daily: { time: dailyTimes, temperature_2m_min: [null], temperature_2m_max: [10] },
        }),
      }),
    );

    const result = await getWeather(city);
    expect(result.current).toMatchObject({
      temperatureC: 0,
      weatherCode: null,
      humidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      pressureHpa: null,
    });
    expect(result.forecast[0]).toMatchObject({ minimumC: null, maximumC: 10, weatherCode: null });
    expect(result.forecast).toHaveLength(5);
  });

  it('normalizes absent current conditions and does not expose forecast dates without a timezone', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ daily: { time: dailyTimes } }),
      }),
    );

    const result = await getWeather(city);

    expect(result.current).toMatchObject({
      temperatureC: null,
      weatherCode: null,
      localTime: null,
      observedAt: null,
    });
    expect(result.timezone).toBeNull();
    expect(result.forecast).toEqual([]);
  });
});
