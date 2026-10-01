import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, MapPin, CalendarDays, ShieldCheck } from 'lucide-react';
import { AlunoLayout } from './AlunoLayout';
import { StatusMessage } from '../../components/AuthLayout';
import { Button } from '../../components/Button';
import { useAuth } from '../../auth/useAuth';
import { units, unitLocation } from '../../data/units';
import { whatsappLink } from '../../utils/whatsapp';
import { mapsLink } from '../../utils/maps';
import { openingHours, openingHoursNote } from '../../data/site';

export default function Dashboard() {
  const { profile, user, loading } = useAuth();
  const local = useLocation();
  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );

  // A mensagem de boas-vindas não deve voltar ao recarregar.
  useEffect(() => {
    if (mensagem) window.history.replaceState({}, '');
  }, [mensagem]);

  const primeiroNome = (profile?.full_name ?? '').split(' ')[0] || 'aluno';
  const unidade = units.find((item) => item.id === profile?.preferred_unit) ?? null;

  return (
    <AlunoLayout
      title={loading && !profile ? 'Carregando…' : `Olá, ${primeiroNome}`}
      aside={
        <>
          <div className="card">
            <h2 className="card__title">Horário da rede</h2>
            <ul className="contact__hours">
              {openingHours.map((item) => (
                <li key={item.days}>
                  <span>{item.days}</span>
                  <strong>{item.hours}</strong>
                </li>
              ))}
            </ul>
            <p className="card__text">{openingHoursNote}</p>
          </div>

          <div className="card">
            <h2 className="card__title">Sua conta</h2>
            <p className="card__text">{user?.email}</p>
            <div className="card__row">
              <Button as="a" href="/area-do-aluno/seguranca" variant="outline" external={false}>
                Segurança
              </Button>
            </div>
          </div>
        </>
      }
    >
      {mensagem && (
        <StatusMessage type="success">
          {mensagem}
          <button
            type="button"
            className="auth__link-button"
            onClick={() => setMensagem(null)}
            style={{ marginLeft: '0.5rem' }}
          >
            Ok
          </button>
        </StatusMessage>
      )}

      <div className="card">
        <h2 className="card__title">Sua unidade</h2>
        {unidade ? (
          <>
            <p className="card__text">
              {unidade.name} — {unitLocation(unidade)}
            </p>
            <div className="card__row">
              <a
                className="units__wpp"
                href={whatsappLink(
                  unidade,
                  `Olá! Sou aluno da Nice One ${unidade.name} e preciso de ajuda.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} aria-hidden="true" />
                WhatsApp da unidade
                <span className="visually-hidden"> (abre em nova aba)</span>
              </a>
              {mapsLink(unidade) && (
                <a
                  className="units__map"
                  href={mapsLink(unidade) as string}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={15} aria-hidden="true" />
                  Ver no mapa
                  <span className="visually-hidden"> (abre em nova aba)</span>
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="card__text">
              Você ainda não escolheu uma unidade preferida. Escolher ajuda a gente a falar com você
              pelo WhatsApp certo.
            </p>
            <div className="card__row">
              <Link className="units__wpp" to="/area-do-aluno/perfil">
                Escolher unidade
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2 className="card__title">Atalhos</h2>
        <div className="card__row">
          <Link className="units__map" to="/" state={{ secao: 'aulas' }}>
            <CalendarDays size={15} aria-hidden="true" />
            Grade de aulas
          </Link>
          <Link className="units__map" to="/area-do-aluno/perfil">
            Editar perfil
          </Link>
          <Link className="units__map" to="/area-do-aluno/seguranca">
            <ShieldCheck size={15} aria-hidden="true" />
            Ativar 2 etapas
          </Link>
        </div>
      </div>

      {profile?.goal && (
        <div className="card">
          <h2 className="card__title">Seu objetivo</h2>
          <p className="card__text">{profile.goal}</p>
        </div>
      )}
    </AlunoLayout>
  );
}
