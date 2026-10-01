import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './PasswordInput.css';

type Props = {
  id?: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  autoComplete: 'current-password' | 'new-password';
  error?: string;
  disabled?: boolean;
  /** Mostra a barra de força — só faz sentido ao criar senha. */
  showStrength?: boolean;
  hint?: string;
};

/** Força simples: comprimento + variedade de caracteres. */
function forcaDaSenha(senha: string): { nivel: 0 | 1 | 2 | 3; rotulo: string } {
  if (senha.length < 8) return { nivel: 0, rotulo: 'Muito curta' };
  let pontos = 0;
  if (/[a-zà-ÿ]/.test(senha) && /[A-ZÀ-Ý]/.test(senha)) pontos += 1;
  if (/\d/.test(senha)) pontos += 1;
  if (/[^\w\s]/.test(senha)) pontos += 1;
  if (senha.length >= 12) pontos += 1;

  if (pontos <= 1) return { nivel: 1, rotulo: 'Fraca' };
  if (pontos === 2) return { nivel: 2, rotulo: 'Boa' };
  return { nivel: 3, rotulo: 'Forte' };
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  disabled = false,
  showStrength = false,
  hint,
}: Props) {
  const gerado = useId();
  const campoId = id ?? gerado;
  const erroId = `${campoId}-erro`;
  const dicaId = `${campoId}-dica`;
  const [visivel, setVisivel] = useState(false);

  const forca = showStrength && value ? forcaDaSenha(value) : null;

  const descritores = [error ? erroId : null, hint ? dicaId : null].filter(Boolean).join(' ');

  return (
    <div className="field">
      <label className="field__label" htmlFor={campoId}>
        {label}
      </label>

      <div className="password">
        <input
          id={campoId}
          className="field__input password__input"
          type={visivel ? 'text' : 'password'}
          value={value}
          onChange={(evento) => onChange(evento.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={descritores || undefined}
        />
        <button
          type="button"
          className="password__toggle"
          onClick={() => setVisivel((atual) => !atual)}
          aria-pressed={visivel}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          disabled={disabled}
        >
          {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>

      {forca && (
        <div className="password__strength">
          <span className={`password__bar password__bar--${forca.nivel}`} aria-hidden="true" />
          <span className="password__strength-label">{forca.rotulo}</span>
        </div>
      )}

      {hint && !error && (
        <p className="field__hint" id={dicaId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={erroId}>
          {error}
        </p>
      )}
    </div>
  );
}
