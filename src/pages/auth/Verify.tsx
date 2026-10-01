import { useCallback, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout, StatusMessage } from '../../components/AuthLayout';
import { Button } from '../../components/Button';
import { OtpInput } from '../../components/OtpInput';
import { ResendButton } from '../../components/ResendButton';
import { iniciarEsperaDeReenvio } from '../../lib/resendCooldown';
import { reenviarCodigo, verificarCodigo, type FluxoCodigo } from '../../auth/api';
import { traduzirErro } from '../../lib/authErrors';
import { codigoSchema, emailSchema, mascararEmail } from '../../lib/validators';
import { isSupabaseConfigured } from '../../lib/supabase';
import { IndisponivelAviso } from './Indisponivel';

type EstadoDaNavegacao = { email?: string; fluxo?: FluxoCodigo } | null;

const TITULOS: Record<string, { titulo: string; texto: string }> = {
  signup: {
    titulo: 'Confirme sua conta',
    texto: 'Enviamos um código de 6 dígitos para',
  },
  email: {
    titulo: 'Digite o código',
    texto: 'Se existir uma conta com este e-mail, enviamos um código de 6 dígitos para',
  },
};

export default function Verify() {
  const navegar = useNavigate();
  const local = useLocation();
  const estado = local.state as EstadoDaNavegacao;

  const fluxo: FluxoCodigo = estado?.fluxo === 'email' ? 'email' : 'signup';
  const [email, setEmail] = useState(estado?.email ?? '');
  // Quem recarregou a página ou abriu direto precisa informar o e-mail aqui.
  const [pedindoEmail, setPedindoEmail] = useState(!estado?.email);

  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const confirmar = useCallback(
    async (valor: string) => {
      if (enviando) return;
      const codigoValido = codigoSchema.safeParse(valor);
      if (!codigoValido.success) {
        setErro('O código tem 6 dígitos.');
        return;
      }

      setErro('');
      setEnviando(true);
      try {
        await verificarCodigo(email, valor, fluxo);
        navegar('/area-do-aluno', {
          replace: true,
          state:
            fluxo === 'signup'
              ? { mensagem: 'Conta confirmada. Bem-vindo à Nice One!' }
              : undefined,
        });
      } catch (erroSupabase) {
        setErro(traduzirErro(erroSupabase));
        setCodigo('');
      } finally {
        setEnviando(false);
      }
    },
    [email, fluxo, navegar, enviando],
  );

  if (!isSupabaseConfigured) return <IndisponivelAviso />;

  const confirmarEmail = (evento: FormEvent) => {
    evento.preventDefault();
    const valido = emailSchema.safeParse(email);
    if (!valido.success) {
      setErro('E-mail inválido.');
      return;
    }
    setEmail(valido.data);
    setErro('');
    setPedindoEmail(false);
  };

  const textos = TITULOS[fluxo] ?? TITULOS.signup;

  if (pedindoEmail) {
    return (
      <AuthLayout
        title="Digite o código"
        subtitle="Informe o e-mail para o qual enviamos o código."
      >
        <form className="auth__form" onSubmit={confirmarEmail} noValidate>
          {erro && <StatusMessage type="error">{erro}</StatusMessage>}
          <div className="field">
            <label className="field__label" htmlFor="email-codigo">
              E-mail
            </label>
            <input
              id="email-codigo"
              className="field__input"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              autoComplete="email"
            />
          </div>
          <Button type="submit" size="lg" className="auth__submit">
            Continuar
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={textos?.titulo ?? 'Digite o código'}
      subtitle={
        <>
          {textos?.texto} <strong>{mascararEmail(email)}</strong>.{' '}
          <button
            type="button"
            className="auth__link-button"
            onClick={() => {
              setPedindoEmail(true);
              setCodigo('');
              setErro('');
            }}
          >
            Trocar e-mail
          </button>
        </>
      }
      footer={
        <p>
          <Link to="/entrar">Voltar para entrar</Link>
        </p>
      }
    >
      <form
        className="auth__form"
        onSubmit={(evento) => {
          evento.preventDefault();
          void confirmar(codigo);
        }}
        noValidate
      >
        {erro && <StatusMessage type="error">{erro}</StatusMessage>}
        {aviso && !erro && <StatusMessage type="success">{aviso}</StatusMessage>}

        <OtpInput
          value={codigo}
          onChange={(valor) => {
            setCodigo(valor);
            if (erro) setErro('');
          }}
          onComplete={(valor) => void confirmar(valor)}
          disabled={enviando}
          invalid={Boolean(erro)}
        />

        <Button type="submit" size="lg" loading={enviando} className="auth__submit">
          {enviando ? 'Verificando…' : 'Confirmar'}
        </Button>

        <ResendButton
          key={`${fluxo}:${email}`}
          scope={`${fluxo}:${email}`}
          disabled={enviando}
          onResend={async () => {
            setErro('');
            setAviso('');
            try {
              await reenviarCodigo(fluxo, email);
              iniciarEsperaDeReenvio(`${fluxo}:${email}`);
              setAviso('Código reenviado. Confira seu e-mail.');
            } catch (erroSupabase) {
              setErro(traduzirErro(erroSupabase));
            }
          }}
        />
      </form>
    </AuthLayout>
  );
}
