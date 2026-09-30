import { useEffect, useState } from 'react';
import { mockWeatherData } from '../mocks/weather';
import type { WeatherUiState } from '../types/weather';

const initialState: WeatherUiState = {
  status: 'idle',
  phase: 'search',
  query: '',
  cityResults: [],
  selectedCity: null,
  weather: null,
  unit: 'celsius',
  errorMessage: null,
};

export function useMockWeather() {
  const [state, setState] = useState<WeatherUiState>(initialState);

  useEffect(() => {
    if (state.status !== 'loading') return;

    const timer = window.setTimeout(() => {
      if (state.phase === 'search') {
        const matches = mockWeatherData.city.name
          .toLocaleLowerCase('pt-BR')
          .includes(state.query.toLocaleLowerCase('pt-BR'));
        setState((previous) => ({
          ...previous,
          status: matches ? 'loading' : 'empty',
          phase: matches ? 'weather' : 'search',
          cityResults: matches ? [mockWeatherData.city] : [],
          selectedCity: matches ? mockWeatherData.city : null,
        }));
      } else {
        setState((previous) => ({
          ...previous,
          status: 'success',
          weather: mockWeatherData,
        }));
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [state.status, state.phase, state.query]);

  function search(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    setState((previous) => ({
      ...previous,
      status: 'loading',
      phase: 'search',
      query: trimmed,
      cityResults: [],
      selectedCity: null,
      weather: null,
      errorMessage: null,
    }));
  }

  function retry() {
    setState((previous) => ({
      ...previous,
      status: 'loading',
      weather: null,
      errorMessage: null,
    }));
  }

  function newSearch() {
    setState((previous) => ({ ...initialState, unit: previous.unit }));
  }

  function setUnit(unit: WeatherUiState['unit']) {
    setState((previous) => ({ ...previous, unit }));
  }

  return { state, search, retry, newSearch, setUnit };
}
