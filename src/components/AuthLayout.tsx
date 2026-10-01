import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import './AuthLayout.css';

type Props = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Título da aba e noindex. */
  documentTitle?: string;
};

/** Marca as telas privadas como noindex enquanto estiverem montadas. */
function useNoIndex(documentTitle?: string) {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    const anterior = document.title;
    if (documentTitle) document.title = `${documentTitle} | Nice One Academia`;

    return () => {
      meta.remove();
      document.title = anterior;
    };
  }, [documentTitle]);
}

export function AuthLayout({ title, subtitle, children, footer, documentTitle }: Props) {
  useNoIndex(documentTitle ?? title);

  return (
    <div className="auth">
      <div className="auth__panel">
        <Link to="/" className="auth__logo" aria-label="Nice One Academia — voltar ao site">
          <Logo />
        </Link>

        <header className="auth__head">
          <h1 className="auth__title">{title}</h1>
          {subtitle && <p className="auth__subtitle">{subtitle}</p>}
        </header>

        {children}

        {footer && <div className="auth__footer">{footer}</div>}
      </div>
    </div>
  );
}

/** Carregando — usado pelas guardas enquanto a sessão não foi lida. */
export function AuthLoading() {
  return (
    <div className="auth auth--loading" role="status" aria-live="polite">
      <span className="auth__spinner" aria-hidden="true" />
      <span className="visually-hidden">Carregando…</span>
    </div>
  );
}

/** Mensagem de status acessível, usada em todas as telas. */
export function StatusMessage({
  type,
  children,
  id,
}: {
  type: 'error' | 'success' | 'info';
  children: ReactNode;
  id?: string;
}) {
  return (
    <p className={`auth__status auth__status--${type}`} id={id} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
