import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weather';

afterEach(cleanup);

describe('ForecastList', () => {
  it('exibe cinco datas, condição, chuva e temperaturas na unidade escolhida', () => {
    const forecast = mockWeatherData.forecast.map((day, index) => ({
      ...day,
      precipitationProbabilityPercent: index === 0 ? 0 : 65,
      precipitationSumMm: index === 0 ? 0.4 : 4.2,
    }));
    const { rerender } = render(
      <ForecastList
        forecast={forecast}
        unit="celsius"
        city={mockWeatherData.city}
        timezone={mockWeatherData.timezone}
      />,
    );

    const section = screen.getByRole('region', { name: 'Previsão de 5 dias' });
    const days = within(section).getAllByRole('listitem');
    expect(days).toHaveLength(5);
    expect(within(section).getByText('Recife')).toBeTruthy();
    expect(within(days[0]).getByText('Hoje')).toBeTruthy();
    expect(within(days[0]).getByText('30/09/2026')).toBeTruthy();
    expect(within(days[0]).getByRole('img', { name: 'Parcialmente nublado' })).toBeTruthy();
    expect(within(days[0]).getByText('30 °C')).toBeTruthy();
    expect(within(days[0]).getByText('24 °C')).toBeTruthy();
    expect(within(days[0]).getByText('Chance de chuva: 0%')).toBeTruthy();
    expect(within(days[0]).getByText('Acumulado: 0.4 mm')).toBeTruthy();
    expect(within(days[1]).getByText('Amanhã')).toBeTruthy();
    expect(within(days[2]).getByText('Sex')).toBeTruthy();
    expect(within(days[4]).getByText('04/10/2026')).toBeTruthy();
    const gridClasses = within(section).getByRole('list').classList;
    expect(gridClasses.contains('grid-cols-2')).toBe(true);
    expect(gridClasses.contains('sm:grid-cols-3')).toBe(true);
    expect(gridClasses.contains('lg:grid-cols-5')).toBe(true);

    rerender(
      <ForecastList
        forecast={forecast}
        unit="fahrenheit"
        city={mockWeatherData.city}
        timezone={mockWeatherData.timezone}
      />,
    );
    expect(within(days[0]).getByText('86 °F')).toBeTruthy();
    expect(within(days[0]).getByText('75 °F')).toBeTruthy();
  });

  it('preserva a data e indica campos ausentes sem criar valores', () => {
    render(
      <ForecastList
        forecast={[
          {
            date: '2026-09-30',
            weatherCode: null,
            minimumC: null,
            maximumC: null,
            precipitationProbabilityPercent: null,
            precipitationSumMm: null,
          },
        ]}
        unit="celsius"
      />,
    );

    const day = screen.getByRole('listitem');
    expect(within(day).getByText('30/09/2026')).toBeTruthy();
    expect(within(day).getAllByText('Indisponível')).toHaveLength(3);
    expect(within(day).getByText('Chance de chuva: Indisponível')).toBeTruthy();
    expect(within(day).getByText('Acumulado: Indisponível')).toBeTruthy();
  });

  it('informa previsao vazia e nao mostra datas quando falta fuso', () => {
    const { rerender } = render(<ForecastList forecast={[]} unit="celsius" />);
    expect(screen.getByText('Previsão indisponível')).toBeTruthy();

    rerender(<ForecastList forecast={mockWeatherData.forecast} unit="celsius" timezone={null} />);
    expect(screen.getByText('Previsão indisponível: fuso horário não informado')).toBeTruthy();
    expect(screen.queryByRole('listitem')).toBeNull();
  });
});
