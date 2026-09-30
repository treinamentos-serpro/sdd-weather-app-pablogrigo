import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

afterEach(cleanup);

describe('estados da consulta', () => {
  it('anuncia o carregamento conforme a fase', () => {
    const { rerender } = render(<LoadingState phase="search" />);
    expect(within(screen.getByRole('status')).getByText('Buscando cidades…')).toBeTruthy();

    rerender(<LoadingState phase="weather" />);
    expect(within(screen.getByRole('status')).getByText('Carregando o clima…')).toBeTruthy();
  });

  it('anuncia a busca sem resultados com titulo e dica', () => {
    render(<EmptyState />);
    const status = screen.getByRole('status');
    expect(within(status).getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeTruthy();
    expect(within(status).getByText('Tente buscar por outro nome de cidade.')).toBeTruthy();
    expect(screen.queryByRole('listitem')).toBeNull();
  });

  it('mostra a mensagem de erro e aciona apenas a recuperacao escolhida', async () => {
    const onRetry = vi.fn();
    const onNewSearch = vi.fn();
    const user = userEvent.setup();
    render(
      <ErrorState
        message="A consulta demorou mais que o esperado"
        onRetry={onRetry}
        onNewSearch={onNewSearch}
      />,
    );

    const alert = screen.getByRole('alert');
    expect(
      within(alert).getByRole('heading', { name: 'Não foi possível concluir a consulta' }),
    ).toBeTruthy();
    expect(within(alert).getByText('A consulta demorou mais que o esperado')).toBeTruthy();
    await user.tab();
    expect(document.activeElement).toBe(
      within(alert).getByRole('button', { name: 'Tentar novamente' }),
    );
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onNewSearch).not.toHaveBeenCalled();

    await user.click(within(alert).getByRole('button', { name: 'Nova busca' }));
    expect(onNewSearch).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('permite somente tentar novamente quando nao ha callback de nova busca', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState message="Erro de rede" onRetry={onRetry} />);

    expect(screen.queryByRole('button', { name: 'Nova busca' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
