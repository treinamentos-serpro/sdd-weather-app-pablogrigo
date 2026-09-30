import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData } from '../../src/types/weather';

afterEach(cleanup);

const city: City = {
  name: 'Recife',
  country: 'Brasil',
  latitude: -8.05,
  longitude: -34.88,
};

const current: CurrentWeatherData = {
  temperatureC: 0,
  weatherCode: 0,
  observedAt: null,
  localTime: null,
};

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('temperature unit interaction', () => {
  it('shows 32 °F after switching a 0 °C current temperature', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit (°F)' }));

    expect(
      within(screen.getByRole('region', { name: 'Clima atual' })).getByText('32 °F'),
    ).toBeInTheDocument();
  });
});
