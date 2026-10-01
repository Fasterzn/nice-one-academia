import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { AlunoLayout } from './AlunoLayout';
import { StatusMessage } from '../../components/AuthLayout';
import { Button } from '../../components/Button';
import { PasswordInput } from '../../components/PasswordInput';
import { OtpInput } from '../../components/OtpInput';
import { useAuth } from '../../auth/useAuth';
import {
  confirmarSenhaAtual,
  confirmarTotp,
  excluirConta,
  iniciarTotp,
  listarFatores,
  removerTotp,
  sair,
  trocarEmail,
  trocarSenha,
  verificarCodigo,
  type FatorTotp,
  type NovoFator,
} from '../../auth/api';
import { traduzirErro } from '../../lib/authErrors';
import { codigoSchema, emailSchema, errosPorCampo, novaSenhaSchema } from '../../lib/validators';

export default function Security() {
  const { user, aal, refresh, profile } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const exigir2fa = (local.state as { exigir2fa?: boolean } | null)?.exigir2fa ?? false;

  // ----- senha ---------------------------------------------------------- //
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNova, setConfirmarNova] = useState('');
  const [errosSenha, setErrosSenha] = useState<Record<string, string>>({});
  const [erroSenha, setErroSenha] = useState('');
  const [okSenha, setOkSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // ----- e-mail --------------------------------------------------------- //
  const [novoEmail, setNovoEmail] = useState('');
  const [codigoEmail, setCodigoEmail] = useState('');
  const [etapaEmail, setEtapaEmail] = useState<'form' | 'codigo'>('form');
  const [erroEmail, setErroEmail] = useState('');
  const [okEmail, setOkEmail] = useState('');
  const [salvandoEmail, setSalvandoEmail] = useState(false);

  // ----- 2FA ------------------------------------------------------------ //
  const [fatores, setFatores] = useState<FatorTotp[]>([]);
  const [novoFator, setNovoFator] = useState<NovoFator | null>(null);
  const [codigo2fa, setCodigo2fa] = useState('');
  const [erro2fa, setErro2fa] = useState('');
  const [ok2fa, setOk2fa] = useState('');
  const [ocupado2fa, setOcupado2fa] = useState(false);

  // ----- exclusão ------------------------------------------------------- //
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState('');
  const [erroExclusao, setErroExclusao] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  const totpAtivo = fatores.some((fator) => fator.status === 'verified');

  const carregarFatores = useCallback(async () => {
    try {
      const lista = await listarFatores();
      setFatores(lista);
    } catch {
      setFatores([]);
    }
  }, []);

  useEffect(() => {
    let ativo = true;
    listarFatores()
      .then((lista) => {
        if (ativo) setFatores(lista);
      })
      .catch(() => {
        if (ativo) setFatores([]);
      });
    return () => {
      ativo = false;
    };
  }, []);

  // ---------------------------------------------------------------- senha --
  const enviarSenha = async (evento: FormEvent) => {
    evento.preventDefault();
    if (salvandoSenha || !user?.email) return;
    setErroSenha('');
    setOkSenha('');

    const valido = novaSenhaSchema.safeParse({
      password: novaSenha,
      confirmPassword: confirmarNova,
    });
    if (!valido.success) {
      setErrosSenha(errosPorCampo(valido.error));
      return;
    }
    if (!senhaAtual) {
      setErrosSenha({ current: 'Informe sua senha atual.' });
      return;
    }

    setErrosSenha({});
    setSalvandoSenha(true);
    try {
      // Reautentica antes de trocar.
      await confirmarSenhaAtual(user.email, senhaAtual);
      await trocarSenha(valido.data.password);
      setOkSenha('Senha alterada.');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNova('');
    } catch (erro) {
      setErroSenha(traduzirErro(erro));
    } finally {
      setSalvandoSenha(false);
    }
  };

  // --------------------------------------------------------------- e-mail --
  const pedirTrocaDeEmail = async (evento: FormEvent) => {
    evento.preventDefault();
    if (salvandoEmail) return;
    setErroEmail('');
    setOkEmail('');

    const valido = emailSchema.safeParse(novoEmail);
    if (!valido.success) {
      setErroEmail('E-mail inválido.');
      return;
    }

    setSalvandoEmail(true);
    try {
      await trocarEmail(valido.data);
      setNovoEmail(valido.data);
      setEtapaEmail('codigo');
      setOkEmail('Enviamos um código para o novo e-mail.');
    } catch (erro) {
      setErroEmail(traduzirErro(erro));
    } finally {
      setSalvandoEmail(false);
    }
  };

  const confirmarTrocaDeEmail = async (valor: string) => {
    if (salvandoEmail) return;
    if (!codigoSchema.safeParse(valor).success) {
      setErroEmail('O código tem 6 dígitos.');
      return;
    }
    setErroEmail('');
    setSalvandoEmail(true);
    try {
      await verificarCodigo(novoEmail, valor, 'email_change');
      setOkEmail('E-mail atualizado.');
      setEtapaEmail('form');
      setCodigoEmail('');
      setNovoEmail('');
      await refresh();
    } catch (erro) {
      setErroEmail(traduzirErro(erro));
      setCodigoEmail('');
    } finally {
      setSalvandoEmail(false);
    }
  };

  // ------------------------------------------------------------------ 2FA --
  const comecarTotp = async () => {
    setErro2fa('');
    setOk2fa('');
    setOcupado2fa(true);
    try {
      setNovoFator(await iniciarTotp());
    } catch (erro) {
      setErro2fa(traduzirErro(erro));
    } finally {
      setOcupado2fa(false);
    }
  };

  const confirmar2fa = async (valor: string) => {
    if (!novoFator || ocupado2fa) return;
    if (!codigoSchema.safeParse(valor).success) {
      setErro2fa('O código tem 6 dígitos.');
      return;
    }
    setErro2fa('');
    setOcupado2fa(true);
    try {
      await confirmarTotp(novoFator.factorId, valor);
      setNovoFator(null);
      setCodigo2fa('');
      setOk2fa('Verificação em duas etapas ativada.');
      await carregarFatores();
      await refresh();
    } catch (erro) {
      setErro2fa(traduzirErro(erro));
      setCodigo2fa('');
    } finally {
      setOcupado2fa(false);
    }
  };

  const desativar2fa = async () => {
    setErro2fa('');
    setOk2fa('');
    if (aal.currentLevel !== 'aal2') {
      setErro2fa('Para desativar, entre novamente confirmando o código do aplicativo.');
      return;
    }
    setOcupado2fa(true);
    try {
      for (const fator of fatores) {
        await removerTotp(fator.id);
      }
      setOk2fa('Verificação em duas etapas desativada.');
      await carregarFatores();
      await refresh();
    } catch (erro) {
      setErro2fa(traduzirErro(erro));
    } finally {
      setOcupado2fa(false);
    }
  };

  // ------------------------------------------------------------- exclusão --
  const excluir = async () => {
    if (confirmacaoExclusao !== 'EXCLUIR' || excluindo) return;
    setErroExclusao('');
    setExcluindo(true);
    try {
      await excluirConta();
      await sair().catch(() => undefined);
      navegar('/', { replace: true });
    } catch (erro) {
      setErroExclusao(traduzirErro(erro));
      setExcluindo(false);
    }
  };

  return (
    <AlunoLayout title="Segurança">
      {exigir2fa && !totpAtivo && (
        <StatusMessage type="error">
          Contas de administrador precisam da verificação em duas etapas ativa. Ative abaixo para
          acessar o painel.
        </StatusMessage>
      )}

      {/* ----------------------------------------------------------- 2FA -- */}
      <section className="card">
        <h2 className="card__title">Verificação em duas etapas</h2>
        <span className={`card__badge ${totpAtivo ? 'card__badge--on' : 'card__badge--off'}`}>
          {totpAtivo ? <ShieldCheck size={13} aria-hidden="true" /> : <ShieldAlert size={13} aria-hidden="true" />}
          {totpAtivo ? 'Ativa' : 'Desativada'}
        </span>
        <p className="card__text">
          Use um aplicativo autenticador (Google Authenticator, Authy, 1Password) para pedir um
          código extra ao entrar.
        </p>

        {erro2fa && <StatusMessage type="error">{erro2fa}</StatusMessage>}
        {ok2fa && <StatusMessage type="success">{ok2fa}</StatusMessage>}

        {!totpAtivo && !novoFator && (
          <div className="card__row">
            <Button onClick={comecarTotp} loading={ocupado2fa}>
              Ativar verificação
            </Button>
          </div>
        )}

        {novoFator && (
          <>
            <p className="card__text">
              1. Leia o QR code no seu aplicativo autenticador. 2. Digite o código de 6 dígitos que
              ele mostrar.
            </p>
            {/* O SVG vem do próprio Supabase — único uso de innerHTML no app. */}
            <div
              className="aluno__qr"
              role="img"
              aria-label="QR code para o aplicativo autenticador"
              dangerouslySetInnerHTML={{ __html: novoFator.qrSvg }}
            />
            <div className="field">
              <span className="field__label">Ou digite este código no aplicativo</span>
              <code className="aluno__secret">{novoFator.secret}</code>
            </div>
            <OtpInput
              value={codigo2fa}
              onChange={setCodigo2fa}
              onComplete={(valor) => void confirmar2fa(valor)}
              disabled={ocupado2fa}
              invalid={Boolean(erro2fa)}
              label="Código do aplicativo autenticador"
            />
            <div className="card__row">
              <Button onClick={() => void confirmar2fa(codigo2fa)} loading={ocupado2fa}>
                Confirmar e ativar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNovoFator(null);
                  setCodigo2fa('');
                  setErro2fa('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </>
        )}

        {totpAtivo && (
          <div className="card__row">
            <Button variant="outline" onClick={desativar2fa} loading={ocupado2fa}>
              Desativar verificação
            </Button>
          </div>
        )}
      </section>

      {/* --------------------------------------------------------- senha -- */}
      <section className="card">
        <h2 className="card__title">Trocar senha</h2>
        <form className="auth__form" onSubmit={enviarSenha} noValidate>
          {erroSenha && <StatusMessage type="error">{erroSenha}</StatusMessage>}
          {okSenha && <StatusMessage type="success">{okSenha}</StatusMessage>}

          <PasswordInput
            id="senha-atual"
            label="Senha atual"
            value={senhaAtual}
            onChange={setSenhaAtual}
            autoComplete="current-password"
            error={errosSenha.current}
            disabled={salvandoSenha}
          />
          <PasswordInput
            id="senha-nova"
            label="Nova senha"
            value={novaSenha}
            onChange={setNovaSenha}
            autoComplete="new-password"
            error={errosSenha.password}
            disabled={salvandoSenha}
            showStrength
            hint="Mínimo de 8 caracteres, com letras e números."
          />
          <PasswordInput
            id="senha-nova-confirmar"
            label="Confirmar nova senha"
            value={confirmarNova}
            onChange={setConfirmarNova}
            autoComplete="new-password"
            error={errosSenha.confirmPassword}
            disabled={salvandoSenha}
          />
          <Button type="submit" loading={salvandoSenha}>
            Salvar nova senha
          </Button>
        </form>
      </section>

      {/* -------------------------------------------------------- e-mail -- */}
      <section className="card">
        <h2 className="card__title">Trocar e-mail</h2>
        <p className="card__text">
          E-mail atual: <strong>{user?.email}</strong>. Enviamos um código para o novo endereço.
          Por segurança, o e-mail atual também pode receber um pedido de confirmação — nesse caso, a
          troca só vale depois de confirmar nos dois.
        </p>

        {erroEmail && <StatusMessage type="error">{erroEmail}</StatusMessage>}
        {okEmail && <StatusMessage type="success">{okEmail}</StatusMessage>}

        {etapaEmail === 'form' ? (
          <form className="auth__form" onSubmit={pedirTrocaDeEmail} noValidate>
            <div className="field">
              <label className="field__label" htmlFor="novo-email">
                Novo e-mail
              </label>
              <input
                id="novo-email"
                className="field__input"
                type="email"
                value={novoEmail}
                onChange={(evento) => setNovoEmail(evento.target.value)}
                autoComplete="email"
                disabled={salvandoEmail}
              />
            </div>
            <Button type="submit" loading={salvandoEmail}>
              Enviar código
            </Button>
          </form>
        ) : (
          <div className="auth__form">
            <OtpInput
              value={codigoEmail}
              onChange={setCodigoEmail}
              onComplete={(valor) => void confirmarTrocaDeEmail(valor)}
              disabled={salvandoEmail}
              invalid={Boolean(erroEmail)}
            />
            <div className="card__row">
              <Button onClick={() => void confirmarTrocaDeEmail(codigoEmail)} loading={salvandoEmail}>
                Confirmar troca
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEtapaEmail('form');
                  setCodigoEmail('');
                  setErroEmail('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- sessões -- */}
      <section className="card">
        <h2 className="card__title">Sessões</h2>
        <p className="card__text">
          Se você entrou em um computador compartilhado, encerre o acesso em todos os aparelhos.
        </p>
        <div className="card__row">
          <Button
            variant="outline"
            onClick={async () => {
              await sair('global').catch(() => undefined);
              navegar('/', { replace: true });
            }}
          >
            Sair de todos os dispositivos
          </Button>
        </div>
      </section>

      {/* ------------------------------------------------------- exclusão -- */}
      <section className="card card--danger">
        <h2 className="card__title">Excluir conta</h2>
        <p className="card__text">
          A exclusão é <strong>irreversível</strong>. Seus dados de cadastro são apagados e você
          perde o acesso à Área do Aluno. Sua matrícula na academia não é cancelada por aqui — fale
          com a unidade.
        </p>

        {erroExclusao && <StatusMessage type="error">{erroExclusao}</StatusMessage>}

        <div className="field">
          <label className="field__label" htmlFor="confirmar-exclusao">
            Digite EXCLUIR para confirmar
          </label>
          <input
            id="confirmar-exclusao"
            className="field__input"
            value={confirmacaoExclusao}
            onChange={(evento) => setConfirmacaoExclusao(evento.target.value.toUpperCase())}
            autoComplete="off"
            disabled={excluindo}
          />
        </div>

        <div className="card__row">
          <Button
            variant="outline"
            onClick={excluir}
            disabled={confirmacaoExclusao !== 'EXCLUIR'}
            loading={excluindo}
          >
            Excluir minha conta
          </Button>
        </div>

        {profile?.role === 'admin' && (
          <p className="card__text">
            Contas de administrador devem ser removidas pelo painel do Supabase.
          </p>
        )}
      </section>
    </AlunoLayout>
  );
}
