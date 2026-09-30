import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, getWeather: vi.fn(), searchCities: vi.fn() };
});

afterEach(() => vi.resetAllMocks());

describe('useWeather', () => {
  it('loads the first city returned by search and exposes the weather', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search(' Recife '));

    expect(searchCities).toHaveBeenCalledWith('Recife');
    expect(getWeather).toHaveBeenCalledWith(mockWeatherData.city);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe(mockWeatherData);
    expect(result.current.cities).toEqual([mockWeatherData.city]);
    expect(result.current.query).toBe('Recife');
  });

  it('sets empty without requesting weather when the search has no matches', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Atlantis'));

    expect(result.current.status).toBe('empty');
    expect(getWeather).not.toHaveBeenCalled();
  });

  it.each(['', '   ', '!!!'])('does not request cities for invalid query %j', async (query) => {
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search(query));

    expect(result.current.status).toBe('idle');
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('retries the failed weather request for the selected city', async () => {
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(mockWeatherData.city));
    expect(result.current.status).toBe('error');
    expect(result.current.data).toBeNull();

    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('keeps the latest city when an older weather request resolves afterward', async () => {
    const cityA = { ...mockWeatherData.city, name: 'Cidade A' };
    const cityB = { ...mockWeatherData.city, name: 'Cidade B' };
    let resolveA!: (data: WeatherData) => void;
    let resolveB!: (data: WeatherData) => void;
    const responseA = new Promise<WeatherData>((resolve) => {
      resolveA = resolve;
    });
    const responseB = new Promise<WeatherData>((resolve) => {
      resolveB = resolve;
    });
    vi.mocked(getWeather).mockImplementation((city) =>
      city.name === cityA.name ? responseA : responseB,
    );
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.selectCity(cityA);
    });
    act(() => {
      void result.current.selectCity(cityB);
    });
    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeNull();

    await act(async () => {
      resolveB({ ...mockWeatherData, city: cityB });
      await responseB;
    });
    expect(result.current.data?.city.name).toBe('Cidade B');

    await act(async () => {
      resolveA({ ...mockWeatherData, city: cityA });
      await responseA;
    });
    expect(result.current.status).toBe('success');
    expect(result.current.data?.city.name).toBe('Cidade B');
  });
});
