import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthLayout, StatusMessage } from '../../components/AuthLayout';
import { Loading } from '../../components/Loading';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/Button';
import { OtpInput } from '../../components/OtpInput';
import { PasswordInput } from '../../components/PasswordInput';
import { ResendButton } from '../../components/ResendButton';
import { iniciarEsperaDeReenvio } from '../../lib/resendCooldown';
import {
  confirmarTotp,
  listarFatores,
  pedirRedefinicaoDeSenha,
  reenviarCodigo,
  sair,
  trocarSenha,
  verificarCodigo,
} from '../../auth/api';
import { precisaSegundoFator, traduzirErro } from '../../lib/authErrors';
import {
  codigoSchema,
  emailSchema,
  errosPorCampo,
  mascararEmail,
  novaSenhaSchema,
} from '../../lib/validators';
import { isSupabaseConfigured } from '../../lib/supabase';
import { IndisponivelAviso } from './Indisponivel';

type Etapa = 'email' | 'codigo' | '2fa' | 'senha';

export default function ForgotPassword() {
  const navegar = useNavigate();
  const { session, initialized } = useAuth();
  const [etapa, setEtapa] = useState<Etapa>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [codigo2fa, setCodigo2fa] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  // Se o aluno abandonar o fluxo depois de validar o código, a sessão de
  // recuperação é encerrada — ninguém fica "logado sem ter escolhido senha".
  const concluido = useRef(false);
  const etapaRef = useRef<Etapa>('email');

  // A ref é atualizada fora da renderização.
  useEffect(() => {
    etapaRef.current = etapa;
  }, [etapa]);

  useEffect(() => {
    return () => {
      const emAberto = etapaRef.current === 'senha' || etapaRef.current === '2fa';
      if (emAberto && !concluido.current) {
        void sair().catch(() => undefined);
      }
    };
  }, []);

  if (!isSupabaseConfigured) return <IndisponivelAviso />;
  if (!initialized) return <Loading />;

  // Já logado e ainda no começo do fluxo: a troca de senha é na área de
  // segurança. Depois que o fluxo começa, a sessão de recuperação é esperada
  // e esta tela nunca redireciona.
  if (session && etapa === 'email') {
    return <Navigate to="/area-do-aluno/seguranca" replace />;
  }

  const pedirCodigo = async (evento: FormEvent) => {
    evento.preventDefault();
    if (enviando) return;
    setErro('');

    const valido = emailSchema.safeParse(email);
    if (!valido.success) {
      setErro('E-mail inválido.');
      return;
    }

    setEnviando(true);
    try {
      await pedirRedefinicaoDeSenha(valido.data);
    } catch (erroSupabase) {
      if ((erroSupabase as { status?: number })?.status === 429) {
        setErro(traduzirErro(erroSupabase));
        setEnviando(false);
        return;
      }
    }

    // Mensagem neutra: não revela se a conta existe.
    setEmail(valido.data);
    iniciarEsperaDeReenvio(`recovery:${valido.data}`);
    setAviso('Se existir uma conta com este e-mail, enviamos um código de 6 dígitos.');
    setEtapa('codigo');
    setEnviando(false);
  };

  const validarCodigo = async (valor: string) => {
    if (enviando) return;
    const valido = codigoSchema.safeParse(valor);
    if (!valido.success) {
      setErro('O código tem 6 dígitos.');
      return;
    }

    setErro('');
    setAviso('');
    setEnviando(true);
    try {
      await verificarCodigo(email, valor, 'recovery');
      // Com 2FA ativo, trocar a senha exige o segundo fator antes.
      const fatores = await listarFatores().catch(() => []);
      const temTotp = fatores.some((fator) => fator.status === 'verified');
      setEtapa(temTotp ? '2fa' : 'senha');
    } catch (erroSupabase) {
      setErro(traduzirErro(erroSupabase));
      setCodigo('');
    } finally {
      setEnviando(false);
    }
  };

  const validar2fa = async (evento: FormEvent) => {
    evento.preventDefault();
    if (enviando) return;
    setErro('');
    setEnviando(true);
    try {
      const fatores = await listarFatores();
      const fator = fatores.find((item) => item.status === 'verified');
      if (!fator) {
        setEtapa('senha');
        return;
      }
      await confirmarTotp(fator.id, codigo2fa);
      setEtapa('senha');
    } catch (erroSupabase) {
      setErro(traduzirErro(erroSupabase));
      setCodigo2fa('');
    } finally {
      setEnviando(false);
    }
  };

  const salvarSenha = async (evento: FormEvent) => {
    evento.preventDefault();
    if (enviando) return;
    setErro('');

    const valido = novaSenhaSchema.safeParse({ password, confirmPassword });
    if (!valido.success) {
      setErros(errosPorCampo(valido.error));
      return;
    }

    setErros({});
    setEnviando(true);
    try {
      await trocarSenha(valido.data.password);
      concluido.current = true;
      navegar('/area-do-aluno', { replace: true, state: { mensagem: 'Senha alterada.' } });
    } catch (erroSupabase) {
      if (precisaSegundoFator(erroSupabase)) {
        setEtapa('2fa');
        setErro('Confirme o código do seu aplicativo autenticador para continuar.');
      } else {
        setErro(traduzirErro(erroSupabase));
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      title="Esqueci minha senha"
      subtitle={
        etapa === 'email'
          ? 'Informe seu e-mail e enviamos um código de 6 dígitos.'
          : etapa === 'codigo'
            ? `Digite o código enviado para ${mascararEmail(email)}.`
            : etapa === '2fa'
              ? 'Digite o código do seu aplicativo autenticador.'
              : 'Escolha sua nova senha.'
      }
      footer={
        <p>
          <Link to="/entrar">Voltar para entrar</Link>
        </p>
      }
    >
      {etapa === 'email' && (
        <form className="auth__form" onSubmit={pedirCodigo} noValidate>
          {erro && <StatusMessage type="error">{erro}</StatusMessage>}
          <div className="field">
            <label className="field__label" htmlFor="recuperar-email">
              E-mail
            </label>
            <input
              id="recuperar-email"
              className="field__input"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              autoComplete="email"
              disabled={enviando}
            />
          </div>
          <Button type="submit" size="lg" loading={enviando} className="auth__submit">
            Enviar código
          </Button>
        </form>
      )}

      {etapa === 'codigo' && (
        <form
          className="auth__form"
          onSubmit={(evento) => {
            evento.preventDefault();
            void validarCodigo(codigo);
          }}
          noValidate
        >
          {erro && <StatusMessage type="error">{erro}</StatusMessage>}
          {aviso && !erro && <StatusMessage type="info">{aviso}</StatusMessage>}

          <OtpInput
            value={codigo}
            onChange={(valor) => {
              setCodigo(valor);
              if (erro) setErro('');
            }}
            onComplete={(valor) => void validarCodigo(valor)}
            disabled={enviando}
            invalid={Boolean(erro)}
          />

          <Button type="submit" size="lg" loading={enviando} className="auth__submit">
            Confirmar código
          </Button>

          <ResendButton
            key={`recovery:${email}`}
            scope={`recovery:${email}`}
            disabled={enviando}
            onResend={async () => {
              setErro('');
              try {
                await reenviarCodigo('recovery', email);
                iniciarEsperaDeReenvio(`recovery:${email}`);
                setAviso('Código reenviado. Confira seu e-mail.');
              } catch (erroSupabase) {
                setErro(traduzirErro(erroSupabase));
              }
            }}
          />
        </form>
      )}

      {etapa === '2fa' && (
        <form className="auth__form" onSubmit={validar2fa} noValidate>
          {erro && <StatusMessage type="error">{erro}</StatusMessage>}
          <OtpInput
            value={codigo2fa}
            onChange={setCodigo2fa}
            disabled={enviando}
            invalid={Boolean(erro)}
            label="Código do aplicativo autenticador"
          />
          <Button type="submit" size="lg" loading={enviando} className="auth__submit">
            Confirmar
          </Button>
        </form>
      )}

      {etapa === 'senha' && (
        <form className="auth__form" onSubmit={salvarSenha} noValidate>
          {erro && <StatusMessage type="error">{erro}</StatusMessage>}
          <PasswordInput
            id="nova-senha"
            label="Nova senha"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            error={erros.password}
            disabled={enviando}
            showStrength
            hint="Mínimo de 8 caracteres, com letras e números."
          />
          <PasswordInput
            id="nova-senha-confirmar"
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            error={erros.confirmPassword}
            disabled={enviando}
          />
          <Button type="submit" size="lg" loading={enviando} className="auth__submit">
            Salvar nova senha
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
