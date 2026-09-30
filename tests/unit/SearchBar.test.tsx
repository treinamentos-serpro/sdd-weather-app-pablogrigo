import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

afterEach(cleanup);

describe('SearchBar', () => {
  it.each([
    { value: '', message: 'Informe o nome de uma cidade.' },
    { value: '   ', message: 'Informe o nome de uma cidade.' },
    { value: '!!!', message: 'Digite o nome da cidade usando letras ou números.' },
  ])('orienta a pessoa para uma busca inválida ($value)', async ({ value, message }) => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    const button = screen.getByRole('button', { name: 'Buscar' });
    expect(screen.getByRole('search')).toBeTruthy();
    expect(button.hasAttribute('disabled')).toBe(false);
    if (value) await user.type(input, value);
    await user.click(button);
    expect(screen.getByRole('status')).toHaveTextContent(message);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('envia o nome sem espacos externos por botao e Enter', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.type(input, '  Recife  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Recife');

    await user.type(input, '{Enter}');
    expect(onSearch).toHaveBeenCalledTimes(2);
    expect(onSearch).toHaveBeenLastCalledWith('Recife');
  });

  it('preserva acentos e pontuação em nomes válidos', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São José');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São José');
  });

  it('bloqueia o campo e a submissao quando disabled', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Recife');

    rerender(<SearchBar onSearch={onSearch} disabled />);
    expect(screen.getByRole('searchbox', { name: 'Buscar cidade' }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(screen.getByRole('button', { name: 'Buscar' }).hasAttribute('disabled')).toBe(true);
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).not.toHaveBeenCalled();
  });
});
