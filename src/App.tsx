import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const weather = useWeather();
  const [unit, setUnit] = useState<Unit>('celsius');
  const isLoading = weather.status === 'loading';
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (weather.status === 'success') mainContentRef.current?.focus();
  }, [weather.status]);

  function handleNewSearch() {
    weather.reset();
    searchInputRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-night-900 font-sans text-white">
      <header className="border-b border-white/10 bg-night-800/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <h1 className="mr-auto text-2xl font-semibold">
            Tempo<span className="text-sun">.</span>
          </h1>
          <div className="order-3 w-full sm:order-none sm:ml-auto sm:w-auto sm:flex-1 sm:max-w-md">
            <SearchBar onSearch={weather.search} disabled={isLoading} inputRef={searchInputRef} />
          </div>
          <UnitToggle unit={unit} onChange={setUnit} />
        </div>
      </header>

      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        aria-label="Resultado da consulta"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
      >
        {weather.status === 'idle' && (
          <EmptyState
            title="Encontre sua cidade"
            hint="Busque uma cidade para consultar o tempo."
          />
        )}
        {isLoading && <LoadingState phase={weather.phase} />}
        {weather.status === 'empty' && <EmptyState />}
        {weather.status === 'error' && (
          <ErrorState
            message={weather.error ?? 'Não foi possível concluir a consulta'}
            onRetry={weather.retry}
            onNewSearch={handleNewSearch}
          />
        )}
        {weather.status === 'success' && weather.data && (
          <div className="space-y-8">
            <CurrentWeather city={weather.data.city} current={weather.data.current} unit={unit} />
            <ForecastList
              forecast={weather.data.forecast}
              city={weather.data.city}
              timezone={weather.data.timezone}
              unit={unit}
            />
            <p className="text-sm text-white/70">Fonte: {weather.data.source}</p>
          </div>
        )}
      </main>
    </div>
  );
}
