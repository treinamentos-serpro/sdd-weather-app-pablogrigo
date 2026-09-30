import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';

afterEach(cleanup);

describe('UnitToggle', () => {
  it('exibe Celsius ativo e atualiza aria-pressed quando a unidade muda', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeTruthy();
    const celsius = screen.getByRole('button', { name: 'Celsius (°C)' });
    const fahrenheit = screen.getByRole('button', { name: 'Fahrenheit (°F)' });
    expect(celsius.getAttribute('aria-pressed')).toBe('true');
    expect(fahrenheit.getAttribute('aria-pressed')).toBe('false');

    await user.click(fahrenheit);
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    expect(celsius.getAttribute('aria-pressed')).toBe('false');
    expect(fahrenheit.getAttribute('aria-pressed')).toBe('true');
  });

  it('permite navegar com Tab e ativar opcoes com Enter e Espaco', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    const celsius = screen.getByRole('button', { name: 'Celsius (°C)' });
    const fahrenheit = screen.getByRole('button', { name: 'Fahrenheit (°F)' });
    await user.tab();
    expect(document.activeElement).toBe(celsius);
    await user.tab();
    expect(document.activeElement).toBe(fahrenheit);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('fahrenheit');

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(celsius);
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith('celsius');
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
