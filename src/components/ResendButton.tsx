import { useCallback, useEffect, useState } from 'react';
import { ESPERA_SEGUNDOS, iniciarEsperaDeReenvio, lerFimDaEspera } from '../lib/resendCooldown';

type Props = {
  /** Identifica a contagem (ex.: "signup:email@dominio"). Use também como key. */
  scope: string;
  onResend: () => Promise<void>;
  disabled?: boolean;
};

export function ResendButton({ scope, onResend, disabled = false }: Props) {
  // O fim da espera é lido uma vez; quando o escopo muda, o componente é
  // remontado pela key no chamador.
  const [fim, setFim] = useState(() => lerFimDaEspera(scope));
  const [agora, setAgora] = useState(() => Date.now());
  const [enviando, setEnviando] = useState(false);

  const restante = fim > agora ? Math.max(0, Math.ceil((fim - agora) / 1000)) : 0;

  useEffect(() => {
    if (restante <= 0) return;
    const id = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [restante]);

  const reenviar = useCallback(async () => {
    if (restante > 0 || enviando) return;
    setEnviando(true);
    try {
      await onResend();
      iniciarEsperaDeReenvio(scope);
      setFim(Date.now() + ESPERA_SEGUNDOS * 1000);
      setAgora(Date.now());
    } finally {
      setEnviando(false);
    }
  }, [restante, enviando, onResend, scope]);

  return (
    <button
      type="button"
      className="auth__link-button"
      onClick={reenviar}
      disabled={disabled || enviando || restante > 0}
    >
      {restante > 0 ? `Reenviar código em ${restante}s` : 'Reenviar código'}
    </button>
  );
}
