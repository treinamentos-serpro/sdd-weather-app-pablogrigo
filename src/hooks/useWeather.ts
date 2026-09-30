import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'empty';
type Phase = 'search' | 'weather';
type Operation = { type: 'search'; query: string } | { type: 'weather'; city: City };

interface WeatherState {
  status: Status;
  phase: Phase;
  data: WeatherData | null;
  cities: City[];
  selectedCity: City | null;
  error: string | null;
  query: string;
}

const initialState: WeatherState = {
  status: 'idle',
  phase: 'search',
  data: null,
  cities: [],
  selectedCity: null,
  error: null,
  query: '',
};

function getErrorMessage(error: unknown): string {
  return error instanceof WeatherServiceError
    ? error.message
    : 'Não foi possível concluir a consulta.';
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>(initialState);
  const latestRequest = useRef(0);
  const lastOperation = useRef<Operation | null>(null);

  async function loadCity(city: City, cities: City[], query: string) {
    const requestId = ++latestRequest.current;
    lastOperation.current = { type: 'weather', city };
    setState({
      status: 'loading',
      phase: 'weather',
      data: null,
      cities,
      selectedCity: city,
      error: null,
      query,
    });

    try {
      const data = await getWeather(city);
      if (requestId !== latestRequest.current) return;
      setState({
        status: 'success',
        phase: 'weather',
        data,
        cities,
        selectedCity: city,
        error: null,
        query,
      });
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      setState({
        status: 'error',
        phase: 'weather',
        data: null,
        cities,
        selectedCity: city,
        error: getErrorMessage(error),
        query,
      });
    }
  }

  async function search(name: string) {
    const query = name.trim();
    if (!query || !/[\p{L}\p{N}]/u.test(query)) {
      latestRequest.current += 1;
      lastOperation.current = null;
      setState(initialState);
      return;
    }

    const requestId = ++latestRequest.current;
    lastOperation.current = { type: 'search', query };
    setState({
      status: 'loading',
      phase: 'search',
      data: null,
      cities: [],
      selectedCity: null,
      error: null,
      query,
    });

    try {
      const cities = (await searchCities(query)).slice(0, 5);
      if (requestId !== latestRequest.current) return;
      if (cities.length === 0) {
        setState({
          status: 'empty',
          phase: 'search',
          data: null,
          cities: [],
          selectedCity: null,
          error: null,
          query,
        });
        return;
      }
      setState({
        status: 'success',
        phase: 'search',
        data: null,
        cities,
        selectedCity: null,
        error: null,
        query,
      });
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      setState({
        status: 'error',
        phase: 'search',
        data: null,
        cities: [],
        selectedCity: null,
        error: getErrorMessage(error),
        query,
      });
    }
  }

  async function retry() {
    const operation = lastOperation.current;
    if (!operation) return;
    if (operation.type === 'search') {
      await search(operation.query);
    } else {
      await loadCity(operation.city, state.cities, state.query);
    }
  }

  async function selectCity(city: City) {
    await loadCity(city, state.cities, state.query);
  }

  function reset() {
    latestRequest.current += 1;
    lastOperation.current = null;
    setState(initialState);
  }

  return { ...state, search, selectCity, retry, reset };
}
