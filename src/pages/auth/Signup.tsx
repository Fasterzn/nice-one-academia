import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, StatusMessage } from '../../components/AuthLayout';
import { Button } from '../../components/Button';
import { PasswordInput } from '../../components/PasswordInput';
import { iniciarEsperaDeReenvio } from '../../lib/resendCooldown';
import { cadastrar } from '../../auth/api';
import { traduzirErro } from '../../lib/authErrors';
import { cadastroSchema, errosPorCampo, formatarTelefone } from '../../lib/validators';
import { focarPrimeiroErro } from '../../lib/routes';
import { units } from '../../data/units';
import { isSupabaseConfigured } from '../../lib/supabase';
import { IndisponivelAviso } from './Indisponivel';

export default function Signup() {
  const navegar = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredUnit, setPreferredUnit] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isSupabaseConfigured) return <IndisponivelAviso />;

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (enviando) return;

    setErroGeral('');
    const resultado = cadastroSchema.safeParse({
      fullName,
      email,
      phone,
      preferredUnit,
      password,
      confirmPassword,
      acceptTerms,
      marketingOptIn,
    });

    if (!resultado.success) {
      setErros(errosPorCampo(resultado.error));
      focarPrimeiroErro(formRef.current);
      return;
    }

    setErros({});
    setEnviando(true);
    try {
      await cadastrar({
        fullName: resultado.data.fullName,
        email: resultado.data.email,
        phone: resultado.data.phone,
        preferredUnit: resultado.data.preferredUnit,
        password: resultado.data.password,
        marketingOptIn: resultado.data.marketingOptIn,
      });

      iniciarEsperaDeReenvio(`signup:${resultado.data.email}`);
      // O e-mail vai no estado da navegação, nunca na URL.
      navegar('/verificar', {
        replace: true,
        state: { email: resultado.data.email, fluxo: 'signup' },
      });
    } catch (erro) {
      setErroGeral(traduzirErro(erro));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Leva menos de um minuto. Você recebe um código de 6 dígitos por e-mail para confirmar."
      footer={
        <p>
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
      }
    >
      <form className="auth__form" onSubmit={enviar} noValidate ref={formRef}>
        {erroGeral && <StatusMessage type="error">{erroGeral}</StatusMessage>}

        <div className="field">
          <label className="field__label" htmlFor="nome">
            Nome completo
          </label>
          <input
            id="nome"
            className="field__input"
            value={fullName}
            onChange={(evento) => setFullName(evento.target.value)}
            autoComplete="name"
            aria-invalid={erros.fullName ? true : undefined}
            aria-describedby={erros.fullName ? 'nome-erro' : undefined}
            disabled={enviando}
          />
          {erros.fullName && (
            <p className="field__error" id="nome-erro">
              {erros.fullName}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            className="field__input"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            autoComplete="email"
            aria-invalid={erros.email ? true : undefined}
            aria-describedby={erros.email ? 'email-erro' : undefined}
            disabled={enviando}
          />
          {erros.email && (
            <p className="field__error" id="email-erro">
              {erros.email}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="telefone">
            Telefone <span className="field__optional">(opcional)</span>
          </label>
          <input
            id="telefone"
            className="field__input"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(evento) => setPhone(formatarTelefone(evento.target.value))}
            autoComplete="tel"
            placeholder="(16) 99999-9999"
            aria-invalid={erros.phone ? true : undefined}
            aria-describedby={erros.phone ? 'telefone-erro' : undefined}
            disabled={enviando}
          />
          {erros.phone && (
            <p className="field__error" id="telefone-erro">
              {erros.phone}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="unidade">
            Unidade preferida <span className="field__optional">(opcional)</span>
          </label>
          <select
            id="unidade"
            value={preferredUnit}
            onChange={(evento) => setPreferredUnit(evento.target.value)}
            disabled={enviando}
          >
            <option value="">Escolher depois</option>
            {units.map((unidade) => (
              <option key={unidade.id} value={unidade.id}>
                {unidade.name}
                {unidade.neighborhood ? ` — ${unidade.neighborhood}` : ''}
              </option>
            ))}
          </select>
        </div>

        <PasswordInput
          id="senha"
          label="Senha"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={erros.password}
          disabled={enviando}
          showStrength
          hint="Mínimo de 8 caracteres, com letras e números."
        />

        <PasswordInput
          id="confirmar-senha"
          label="Confirmar senha"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          error={erros.confirmPassword}
          disabled={enviando}
        />

        <div className="field">
          <label className="check">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(evento) => setAcceptTerms(evento.target.checked)}
              disabled={enviando}
              aria-invalid={erros.acceptTerms ? true : undefined}
              aria-describedby={erros.acceptTerms ? 'termos-erro' : undefined}
            />
            <span>
              Li e aceito os <Link to="/termos">Termos de Uso</Link> e a{' '}
              <Link to="/privacidade">Política de Privacidade</Link>.
            </span>
          </label>
          {erros.acceptTerms && (
            <p className="field__error" id="termos-erro">
              {erros.acceptTerms}
            </p>
          )}

          <label className="check">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(evento) => setMarketingOptIn(evento.target.checked)}
              disabled={enviando}
            />
            <span>Quero receber novidades e promoções da Nice One.</span>
          </label>
        </div>

        <Button type="submit" size="lg" loading={enviando} className="auth__submit">
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
