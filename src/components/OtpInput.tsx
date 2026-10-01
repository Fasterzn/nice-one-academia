import { useEffect, useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import './OtpInput.css';

type Props = {
  value: string;
  onChange: (valor: string) => void;
  /** Chamado assim que os 6 dígitos são preenchidos. */
  onComplete?: (valor: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  label?: string;
};

const TAMANHO = 6;

/**
 * Seis caixas de um dígito. Aceita colar o código inteiro, só aceita dígitos,
 * move o foco sozinho e envia quando completa.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  invalid = false,
  describedBy,
  label = 'Código de 6 dígitos',
}: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const jaCompletou = useRef(false);

  const digitos = value.padEnd(TAMANHO, ' ').slice(0, TAMANHO).split('');

  useEffect(() => {
    if (value.length === TAMANHO && !jaCompletou.current) {
      jaCompletou.current = true;
      onComplete?.(value);
    }
    if (value.length < TAMANHO) jaCompletou.current = false;
  }, [value, onComplete]);

  const escrever = (indice: number, evento: ChangeEvent<HTMLInputElement>) => {
    const somenteDigitos = evento.target.value.replace(/\D/g, '');
    if (!somenteDigitos) return;

    const atual = value.split('');
    // Digitar num campo do meio com o código inteiro colado também funciona.
    for (let i = 0; i < somenteDigitos.length && indice + i < TAMANHO; i += 1) {
      atual[indice + i] = somenteDigitos[i] as string;
    }
    const novo = atual.join('').slice(0, TAMANHO);
    onChange(novo);

    const proximo = Math.min(indice + somenteDigitos.length, TAMANHO - 1);
    refs.current[proximo]?.focus();
  };

  const teclar = (indice: number, evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === 'Backspace') {
      evento.preventDefault();
      const atual = value.split('');
      if (atual[indice]) {
        atual[indice] = '';
        onChange(atual.join('').trimEnd());
      } else if (indice > 0) {
        atual[indice - 1] = '';
        onChange(atual.join('').trimEnd());
        refs.current[indice - 1]?.focus();
      }
      return;
    }
    if (evento.key === 'ArrowLeft' && indice > 0) {
      evento.preventDefault();
      refs.current[indice - 1]?.focus();
    }
    if (evento.key === 'ArrowRight' && indice < TAMANHO - 1) {
      evento.preventDefault();
      refs.current[indice + 1]?.focus();
    }
  };

  const colar = (evento: ClipboardEvent<HTMLInputElement>) => {
    evento.preventDefault();
    const texto = evento.clipboardData.getData('text').replace(/\D/g, '').slice(0, TAMANHO);
    if (!texto) return;
    onChange(texto);
    refs.current[Math.min(texto.length, TAMANHO - 1)]?.focus();
  };

  return (
    <div
      className={`otp ${invalid ? 'otp--invalid' : ''}`}
      role="group"
      aria-label={label}
      aria-describedby={describedBy}
    >
      {Array.from({ length: TAMANHO }, (_, indice) => (
        <input
          key={indice}
          ref={(node) => {
            refs.current[indice] = node;
          }}
          className="otp__box"
          type="text"
          inputMode="numeric"
          autoComplete={indice === 0 ? 'one-time-code' : 'off'}
          maxLength={TAMANHO}
          value={digitos[indice]?.trim() ?? ''}
          onChange={(evento) => escrever(indice, evento)}
          onKeyDown={(evento) => teclar(indice, evento)}
          onPaste={colar}
          onFocus={(evento) => evento.target.select()}
          disabled={disabled}
          aria-label={`Dígito ${indice + 1} de ${TAMANHO}`}
          aria-invalid={invalid || undefined}
        />
      ))}
    </div>
  );
}
