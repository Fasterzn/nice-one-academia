import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../auth/useAuth';
import { sair } from '../../auth/api';
import './AlunoLayout.css';

const LINKS = [
  { to: '/area-do-aluno', label: 'Painel', end: true },
  { to: '/area-do-aluno/perfil', label: 'Perfil', end: false },
  { to: '/area-do-aluno/seguranca', label: 'Segurança', end: false },
];

export function AlunoLayout({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  const { profile } = useAuth();
  const navegar = useNavigate();

  // Área privada nunca é indexada.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const anterior = document.title;
    document.title = `${title} | Nice One Academia`;
    return () => {
      meta.remove();
      document.title = anterior;
    };
  }, [title]);

  const ehAdmin = profile?.role === 'admin';

  return (
    <div className="aluno">
      <header className="aluno__bar">
        <div className="container aluno__bar-inner">
          <Link to="/" className="aluno__logo" aria-label="Nice One Academia — ir para o site">
            <Logo />
          </Link>

          <nav className="aluno__nav" aria-label="Área do aluno">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `aluno__link ${isActive ? 'aluno__link--on' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            {ehAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `aluno__link ${isActive ? 'aluno__link--on' : ''}`}
              >
                Admin
              </NavLink>
            )}
          </nav>

          <button
            type="button"
            className="aluno__sair"
            onClick={async () => {
              await sair().catch(() => undefined);
              navegar('/', { replace: true });
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="aluno__sair-label">Sair</span>
          </button>
        </div>
      </header>

      <main className="container aluno__main">
        <h1 className="aluno__title">{title}</h1>
        <div className={`aluno__body ${aside ? 'aluno__grid' : ''}`}>
          <div className="aluno__content">{children}</div>
          {aside && <div className="aluno__aside">{aside}</div>}
        </div>
      </main>
    </div>
  );
}
