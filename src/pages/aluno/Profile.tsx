import { useRef, useState, type FormEvent } from 'react';
import { AlunoLayout } from './AlunoLayout';
import { StatusMessage } from '../../components/AuthLayout';
import { Button } from '../../components/Button';
import { useAuth } from '../../auth/useAuth';
import { salvarPerfil } from '../../auth/api';
import { traduzirErro } from '../../lib/authErrors';
import { errosPorCampo, formatarTelefone, perfilSchema } from '../../lib/validators';
import { focarPrimeiroErro } from '../../lib/routes';
import { units } from '../../data/units';
import type { Profile as PerfilDoAluno } from '../../types/database.types';

export default function Profile() {
  const { profile, loading } = useAuth();

  return (
    <AlunoLayout title="Seu perfil">
      {loading && !profile ? (
        <div className="card">
          <p className="card__text">Carregando seus dados…</p>
        </div>
      ) : profile ? (
        // A key remonta o formulário quando o perfil muda: os campos nascem
        // preenchidos, sem efeito de sincronização.
        <Formulario key={profile.id} perfil={profile} />
      ) : (
        <div className="card">
          <p className="card__text">
            Não conseguimos carregar seu perfil agora. Atualize a página em instantes.
          </p>
        </div>
      )}
    </AlunoLayout>
  );
}

function Formulario({ perfil }: { perfil: PerfilDoAluno }) {
  const { setProfile } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const [fullName, setFullName] = useState(perfil.full_name);
  const [phone, setPhone] = useState(perfil.phone ? formatarTelefone(perfil.phone) : '');
  const [preferredUnit, setPreferredUnit] = useState(
    perfil.preferred_unit ? String(perfil.preferred_unit) : '',
  );
  const [goal, setGoal] = useState(perfil.goal ?? '');
  const [marketingOptIn, setMarketingOptIn] = useState(perfil.marketing_opt_in);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (salvando) return;

    setErroGeral('');
    setSucesso('');

    const valido = perfilSchema.safeParse({
      fullName,
      phone,
      preferredUnit,
      goal,
      marketingOptIn,
    });
    if (!valido.success) {
      setErros(errosPorCampo(valido.error));
      focarPrimeiroErro(formRef.current);
      return;
    }

    setErros({});
    setSalvando(true);
    try {
      const atualizado = await salvarPerfil(perfil.id, {
        full_name: valido.data.fullName,
        phone: valido.data.phone || null,
        preferred_unit: valido.data.preferredUnit,
        goal: valido.data.goal,
        marketing_opt_in: valido.data.marketingOptIn,
      });
      setProfile(atualizado);
      setSucesso('Perfil salvo.');
    } catch (erro) {
      setErroGeral(traduzirErro(erro));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form className="card" onSubmit={enviar} noValidate ref={formRef}>
      {erroGeral && <StatusMessage type="error">{erroGeral}</StatusMessage>}
      {sucesso && <StatusMessage type="success">{sucesso}</StatusMessage>}

      <div className="field">
        <label className="field__label" htmlFor="perfil-nome">
          Nome completo
        </label>
        <input
          id="perfil-nome"
          className="field__input"
          value={fullName}
          onChange={(evento) => setFullName(evento.target.value)}
          autoComplete="name"
          disabled={salvando}
          aria-invalid={erros.fullName ? true : undefined}
          aria-describedby={erros.fullName ? 'perfil-nome-erro' : undefined}
        />
        {erros.fullName && (
          <p className="field__error" id="perfil-nome-erro">
            {erros.fullName}
          </p>
        )}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="perfil-telefone">
          Telefone <span className="field__optional">(opcional)</span>
        </label>
        <input
          id="perfil-telefone"
          className="field__input"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(evento) => setPhone(formatarTelefone(evento.target.value))}
          autoComplete="tel"
          disabled={salvando}
          aria-invalid={erros.phone ? true : undefined}
          aria-describedby={erros.phone ? 'perfil-telefone-erro' : undefined}
        />
        {erros.phone && (
          <p className="field__error" id="perfil-telefone-erro">
            {erros.phone}
          </p>
        )}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="perfil-unidade">
          Unidade preferida
        </label>
        <select
          id="perfil-unidade"
          value={preferredUnit}
          onChange={(evento) => setPreferredUnit(evento.target.value)}
          disabled={salvando}
        >
          <option value="">Sem preferência</option>
          {units.map((unidade) => (
            <option key={unidade.id} value={unidade.id}>
              {unidade.name}
              {unidade.neighborhood ? ` — ${unidade.neighborhood}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="perfil-objetivo">
          Seu objetivo <span className="field__optional">(opcional)</span>
        </label>
        <textarea
          id="perfil-objetivo"
          value={goal}
          onChange={(evento) => setGoal(evento.target.value)}
          maxLength={300}
          disabled={salvando}
          aria-describedby="perfil-objetivo-dica"
        />
        <p className="field__hint" id="perfil-objetivo-dica">
          {goal.length}/300 caracteres.
        </p>
        {erros.goal && <p className="field__error">{erros.goal}</p>}
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(evento) => setMarketingOptIn(evento.target.checked)}
          disabled={salvando}
        />
        <span>Quero receber novidades e promoções da Nice One.</span>
      </label>

      <Button type="submit" loading={salvando}>
        Salvar alterações
      </Button>
    </form>
  );
}
