import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weather';
import * as weatherService from '../../src/services/weatherService';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('App com Open-Meteo', () => {
  it('busca a cidade, mostra clima e converte unidade sem recarregar', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([mockWeatherData.city]);
    vi.spyOn(weatherService, 'getWeather').mockResolvedValue(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Encontre sua cidade' })).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Recife');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    const current = await screen.findByRole('region', { name: 'Clima atual' });
    expect(within(current).getByText('28 °C')).toBeInTheDocument();
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('main', { name: 'Resultado da consulta' })).toHaveFocus();
    expect(screen.getByRole('region', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.getByText('Fonte: Open-Meteo')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fahrenheit (°F)' }));
    expect(within(current).getByText('82 °F')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('marca a busca como ocupada enquanto aguarda a consulta meteorológica', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([mockWeatherData.city]);
    let resolveWeather!: (data: typeof mockWeatherData) => void;
    vi.spyOn(weatherService, 'getWeather').mockReturnValue(
      new Promise((resolve) => {
        resolveWeather = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Recife');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(weatherService.getWeather).toHaveBeenCalled());
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'true');

    await act(async () => resolveWeather(mockWeatherData));
    await screen.findByRole('region', { name: 'Clima atual' });
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'false');
  });

  it('remove os dados anteriores em uma nova busca sem correspondencia e permite buscar de novo', async () => {
    vi.spyOn(weatherService, 'searchCities')
      .mockResolvedValueOnce([mockWeatherData.city])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockWeatherData.city]);
    vi.spyOn(weatherService, 'getWeather').mockResolvedValue(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.type(search, 'Recife');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('region', { name: 'Clima atual' });

    await user.clear(search);
    await user.type(search, 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.queryByRole('region', { name: 'Clima atual' })).not.toBeInTheDocument();
    await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' });

    await user.clear(search);
    await user.type(search, 'Recife');
    await user.keyboard('{Enter}');
    await screen.findByRole('region', { name: 'Clima atual' });
  });

  it('oferece retry e nova busca no estado de erro', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([mockWeatherData.city]);
    vi.spyOn(weatherService, 'getWeather')
      .mockRejectedValueOnce(new Error('Falha de rede.'))
      .mockResolvedValueOnce(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);

    const search = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.type(search, 'Recife');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('region', { name: 'Clima atual' })).toBeInTheDocument();
  });
});
