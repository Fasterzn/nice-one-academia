import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout, StatusMessage } from '../../components/AuthLayout';
import { Button } from '../../components/Button';
import { OtpInput } from '../../components/OtpInput';
import { confirmarTotp, listarFatores, sair } from '../../auth/api';
import { traduzirErro } from '../../lib/authErrors';
import { rotaDeRetornoSegura } from '../../lib/routes';
import { useAuth } from '../../auth/useAuth';

/** Segundo passo do login para quem tem app autenticador ativo. */
export default function MfaChallenge() {
  const navegar = useNavigate();
  const local = useLocation();
  const { session, aal, initialized, refresh } = useAuth();

  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const destino = rotaDeRetornoSegura((local.state as { from?: string } | null)?.from);

  // Já está em AAL2 (ou não há sessão): esta tela não tem mais função.
  useEffect(() => {
    if (!initialized) return;
    if (!session) {
      navegar('/entrar', { replace: true });
      return;
    }
    if (aal.currentLevel === 'aal2' || aal.nextLevel !== 'aal2') {
      navegar(destino ?? '/area-do-aluno', { replace: true });
    }
  }, [initialized, session, aal, navegar, destino]);

  const confirmar = async (valor: string) => {
    if (enviando) return;
    setErro('');
    setEnviando(true);
    try {
      const fatores = await listarFatores();
      const fator = fatores.find((item) => item.status === 'verified');
      if (!fator) {
        setErro('Nenhum aplicativo autenticador ativo nesta conta.');
        return;
      }
      await confirmarTotp(fator.id, valor);
      await refresh();
      navegar(destino ?? '/area-do-aluno', { replace: true });
    } catch (erroSupabase) {
      setErro(traduzirErro(erroSupabase));
      setCodigo('');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      title="Verificação em duas etapas"
      subtitle="Digite o código de 6 dígitos do seu aplicativo autenticador."
      documentTitle="Verificação em duas etapas"
    >
      <form
        className="auth__form"
        onSubmit={(evento: FormEvent) => {
          evento.preventDefault();
          void confirmar(codigo);
        }}
        noValidate
      >
        {erro && <StatusMessage type="error">{erro}</StatusMessage>}

        <OtpInput
          value={codigo}
          onChange={(valor) => {
            setCodigo(valor);
            if (erro) setErro('');
          }}
          onComplete={(valor) => void confirmar(valor)}
          disabled={enviando}
          invalid={Boolean(erro)}
          label="Código do aplicativo autenticador"
        />

        <Button type="submit" size="lg" loading={enviando} className="auth__submit">
          {enviando ? 'Verificando…' : 'Confirmar'}
        </Button>

        <button
          type="button"
          className="auth__link-button"
          onClick={async () => {
            await sair().catch(() => undefined);
            navegar('/entrar', { replace: true });
          }}
        >
          Entrar com outra conta
        </button>
      </form>
    </AuthLayout>
  );
}
