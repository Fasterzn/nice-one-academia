import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OtpInput } from './OtpInput';

function Campo({ onComplete }: { onComplete?: (valor: string) => void }) {
  const [valor, setValor] = useState('');
  return (
    <>
      <OtpInput value={valor} onChange={setValor} onComplete={onComplete} />
      <output data-testid="valor">{valor}</output>
    </>
  );
}

describe('OtpInput', () => {
  it('aceita só dígitos', async () => {
    const usuario = userEvent.setup();
    render(<Campo />);
    const caixas = screen.getAllByRole('textbox');

    await usuario.click(caixas[0] as HTMLElement);
    await usuario.keyboard('a');
    expect(screen.getByTestId('valor')).toHaveTextContent('');

    await usuario.keyboard('7');
    expect(screen.getByTestId('valor')).toHaveTextContent('7');
  });

  it('move o foco sozinho ao digitar', async () => {
    const usuario = userEvent.setup();
    render(<Campo />);
    const caixas = screen.getAllByRole('textbox');

    await usuario.click(caixas[0] as HTMLElement);
    await usuario.keyboard('1');
    expect(caixas[1]).toHaveFocus();

    await usuario.keyboard('2');
    expect(caixas[2]).toHaveFocus();
  });

  it('aceita colar o código inteiro', async () => {
    const usuario = userEvent.setup();
    const aoCompletar = vi.fn();
    render(<Campo onComplete={aoCompletar} />);
    const caixas = screen.getAllByRole('textbox');

    await usuario.click(caixas[0] as HTMLElement);
    await usuario.paste('123456');

    expect(screen.getByTestId('valor')).toHaveTextContent('123456');
    expect(aoCompletar).toHaveBeenCalledWith('123456');
  });

  it('limpa o que não for dígito ao colar', async () => {
    const usuario = userEvent.setup();
    render(<Campo />);
    const caixas = screen.getAllByRole('textbox');

    await usuario.click(caixas[0] as HTMLElement);
    await usuario.paste('12-34 56');

    expect(screen.getByTestId('valor')).toHaveTextContent('123456');
  });

  it('envia sozinho ao completar 6 dígitos digitados', async () => {
    const usuario = userEvent.setup();
    const aoCompletar = vi.fn();
    render(<Campo onComplete={aoCompletar} />);
    const caixas = screen.getAllByRole('textbox');

    await usuario.click(caixas[0] as HTMLElement);
    await usuario.keyboard('123456');

    expect(aoCompletar).toHaveBeenCalledTimes(1);
    expect(aoCompletar).toHaveBeenCalledWith('123456');
  });

  it('apaga com backspace e volta o foco', async () => {
    const usuario = userEvent.setup();
    render(<Campo />);
    const caixas = screen.getAllByRole('textbox');

    await usuario.click(caixas[0] as HTMLElement);
    await usuario.keyboard('12');
    await usuario.keyboard('{Backspace}');
    expect(screen.getByTestId('valor')).toHaveTextContent('1');
  });
});
