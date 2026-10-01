import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout, StatusMessage } from '../../components/AuthLayout';
import { Button } from '../../components/Button';
import { PasswordInput } from '../../components/PasswordInput';
import { iniciarEsperaDeReenvio } from '../../lib/resendCooldown';
import { enviarCodigoDeLogin, entrarComSenha, reenviarCodigo } from '../../auth/api';
import { precisaConfirmarEmail, traduzirErro } from '../../lib/authErrors';
import { emailSchema, errosPorCampo, loginSenhaSchema } from '../../lib/validators';
import { rotaDeRetornoSegura } from '../../lib/routes';
import { isSupabaseConfigured } from '../../lib/supabase';
import { IndisponivelAviso } from './Indisponivel';

type Aba = 'codigo' | 'senha';

export default function Login() {
  const navegar = useNavigate();
  const local = useLocation();
  const destino = rotaDeRetornoSegura((local.state as { from?: string } | null)?.from);

  const [aba, setAba] = useState<Aba>('codigo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [aviso, setAviso] = useState('');
  const [precisaConfirmar, setPrecisaConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!isSupabaseConfigured) return <IndisponivelAviso />;

  const limpar = () => {
    setErroGeral('');
    setAviso('');
    setErros({});
    setPrecisaConfirmar(false);
  };

  const entrarPorCodigo = async (evento: FormEvent) => {
    evento.preventDefault();
    if (enviando) return;
    limpar();

    const valido = emailSchema.safeParse(email);
    if (!valido.success) {
      setErros({ email: 'E-mail inválido.' });
      return;
    }

    setEnviando(true);
    try {
      await enviarCodigoDeLogin(valido.data);
    } catch (erro) {
      // Erro de limite precisa aparecer; os demais não revelam se o e-mail existe.
      const mensagem = traduzirErro(erro);
      if ((erro as { status?: number })?.status === 429) {
        setErroGeral(mensagem);
        setEnviando(false);
        return;
      }
    }

    // Mensagem sempre neutra, exista ou não a conta.
    iniciarEsperaDeReenvio(`email:${valido.data}`);
    setEnviando(false);
    navegar('/verificar', { state: { email: valido.data, fluxo: 'email', from: destino } });
  };

  const entrarPorSenha = async (evento: FormEvent) => {
    evento.preventDefault();
    if (enviando) return;
    limpar();

    const valido = loginSenhaSchema.safeParse({ email, password });
    if (!valido.success) {
      setErros(errosPorCampo(valido.error));
      return;
    }

    setEnviando(true);
    try {
      await entrarComSenha(valido.data.email, valido.data.password);
      // O redirecionamento é feito pela GuestRoute quando a sessão chega.
      navegar(destino ?? '/area-do-aluno', { replace: true });
    } catch (erro) {
      if (precisaConfirmarEmail(erro)) {
        setPrecisaConfirmar(true);
        setErroGeral('Confirme seu e-mail para entrar.');
      } else {
        setErroGeral(traduzirErro(erro));
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      title="Área do aluno"
      subtitle="Entre com um código enviado por e-mail ou com sua senha."
      footer={
        <>
          <p>
            Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
          </p>
          <p>
            <Link to="/esqueci-senha">Esqueci minha senha</Link>
          </p>
        </>
      }
    >
      <div className="auth__tabs" role="tablist" aria-label="Forma de entrar">
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'codigo'}
          className={`auth__tab ${aba === 'codigo' ? 'auth__tab--on' : ''}`}
          onClick={() => {
            setAba('codigo');
            limpar();
          }}
        >
          Código por e-mail
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'senha'}
          className={`auth__tab ${aba === 'senha' ? 'auth__tab--on' : ''}`}
          onClick={() => {
            setAba('senha');
            limpar();
          }}
        >
          Senha
        </button>
      </div>

      <form
        className="auth__form"
        onSubmit={aba === 'codigo' ? entrarPorCodigo : entrarPorSenha}
        noValidate
      >
        {erroGeral && <StatusMessage type="error">{erroGeral}</StatusMessage>}
        {aviso && <StatusMessage type="success">{aviso}</StatusMessage>}

        <div className="field">
          <label className="field__label" htmlFor="login-email">
            E-mail
          </label>
          <input
            id="login-email"
            className="field__input"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            autoComplete="email"
            aria-invalid={erros.email ? true : undefined}
            aria-describedby={erros.email ? 'login-email-erro' : undefined}
            disabled={enviando}
          />
          {erros.email && (
            <p className="field__error" id="login-email-erro">
              {erros.email}
            </p>
          )}
        </div>

        {aba === 'senha' && (
          <PasswordInput
            id="login-senha"
            label="Senha"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            error={erros.password}
            disabled={enviando}
          />
        )}

        <Button type="submit" size="lg" loading={enviando} className="auth__submit">
          {aba === 'codigo' ? 'Enviar código' : 'Entrar'}
        </Button>

        {precisaConfirmar && (
          <button
            type="button"
            className="auth__link-button"
            onClick={async () => {
              const valido = emailSchema.safeParse(email);
              if (!valido.success) return;
              try {
                await reenviarCodigo('signup', valido.data);
                iniciarEsperaDeReenvio(`signup:${valido.data}`);
                navegar('/verificar', { state: { email: valido.data, fluxo: 'signup' } });
              } catch (erro) {
                setErroGeral(traduzirErro(erro));
              }
            }}
          >
            Reenviar código de confirmação
          </button>
        )}
      </form>
    </AuthLayout>
  );
}
