import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import type { City, CurrentWeather as CurrentWeatherData } from '../../src/types/weather';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const city: City = {
  name: 'Recife',
  admin1: 'Pernambuco',
  country: 'Brasil',
  latitude: -8.0543,
  longitude: -34.8813,
};

const current: CurrentWeatherData = {
  temperatureC: 20.5,
  weatherCode: 2,
  observedAt: null,
  localTime: null,
  humidityPercent: 80,
  windSpeedKmh: 14,
  precipitationMm: 0,
  pressureHpa: 1012,
};

describe('CurrentWeather', () => {
  it('exibe cidade, temperatura na unidade atual, condicao e metricas', () => {
    const { rerender } = render(<CurrentWeather city={city} current={current} unit="celsius" />);
    const panel = screen.getByRole('region', { name: 'Clima atual' });

    expect(within(panel).getByRole('heading', { name: 'Recife' })).toBeTruthy();
    expect(within(panel).getByText('Pernambuco, Brasil')).toBeTruthy();
    expect(within(panel).getByText('21 °C')).toBeTruthy();
    expect(within(panel).getByRole('img', { name: 'Parcialmente nublado' })).toBeTruthy();
    expect(within(panel).getByText('Parcialmente nublado')).toBeTruthy();
    expect(within(panel).getByText('80 %')).toBeTruthy();
    expect(within(panel).getByText('14 km/h')).toBeTruthy();
    expect(within(panel).getByText('0 mm')).toBeTruthy();
    expect(within(panel).getByText('1012 hPa')).toBeTruthy();

    rerender(<CurrentWeather city={city} current={current} unit="fahrenheit" />);
    expect(within(panel).getByText('69 °F')).toBeTruthy();
  });

  it('indica ausencia de condicoes e metricas sem inventar valores', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          temperatureC: null,
          weatherCode: null,
          observedAt: null,
          localTime: null,
        }}
        unit="celsius"
      />,
    );

    const panel = screen.getByRole('region', { name: 'Clima atual' });
    expect(within(panel).getByText('Condições atuais indisponíveis')).toBeTruthy();
    expect(within(panel).getByText('Condição indisponível')).toBeTruthy();
    expect(within(panel).getByText('Horário de atualização não informado')).toBeTruthy();
    expect(within(panel).getByText('Atualidade não verificada')).toBeTruthy();
    expect(within(panel).getAllByText('Indisponível')).toHaveLength(4);
  });

  it('mantém a condição disponível quando a temperatura está ausente', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          temperatureC: null,
          weatherCode: 2,
          observedAt: null,
          localTime: null,
        }}
        unit="celsius"
      />,
    );

    const panel = screen.getByRole('region', { name: 'Clima atual' });
    expect(within(panel).getByRole('img', { name: 'Parcialmente nublado' })).toBeTruthy();
    expect(within(panel).getByText('Indisponível', { selector: 'p' })).toBeTruthy();
    expect(within(panel).queryByText('Condições atuais indisponíveis')).toBeNull();
  });

  it.each([
    { minutesAgo: 60, isOutdated: false },
    { minutesAgo: 61, isOutdated: true },
  ])('aplica o limite de idade de $minutesAgo minutos', ({ minutesAgo, isOutdated }) => {
    vi.useFakeTimers();
    const now = new Date('2026-09-30T16:00:00.000Z');
    vi.setSystemTime(now);
    const observedAt = new Date(now.getTime() - minutesAgo * 60_000).toISOString();

    render(
      <CurrentWeather
        city={city}
        current={{ ...current, observedAt, localTime: '2026-09-30T12:00' }}
        unit="celsius"
      />,
    );

    const panel = screen.getByRole('region', { name: 'Clima atual' });
    expect(within(panel).getByText('Horário de atualização: 12:00')).toBeTruthy();
    expect(within(panel).queryByText('Desatualizado') !== null).toBe(isOutdated);
  });
});
