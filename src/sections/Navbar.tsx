import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { navLinks, site } from '../data/site';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { SectionLink } from '../components/SectionLink';
import { useUnitPicker } from '../components/unit-picker-context';
import { useAuth } from '../auth/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { useScrollSpy } from '../utils/useScrollSpy';
import './Navbar.css';

const sectionIds = navLinks.map((link) => link.href.slice(1));

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useScrollSpy(sectionIds);
  const { open } = useUnitPicker();
  const { session, profile } = useAuth();

  const iniciais = (profile?.full_name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      {/* Faixa de topo com telefone e horário, como nas redes grandes */}
      <div className="nav__top">
        <div className="container nav__top-inner">
          <span>{site.cityState} · 5 unidades</span>
          <a href={site.phoneHref} className="nav__top-phone">
            {site.phone}
          </a>
        </div>
      </div>

      <div className="nav__inner container">
        <Link to="/" className="nav__logo">
          <Logo />
        </Link>

        <nav className="nav__links" aria-label="Navegação principal">
          {navLinks.map((link) => {
            const id = link.href.slice(1);
            return (
              <SectionLink
                key={link.href}
                to={id}
                className={`nav__link ${active === id ? 'nav__link--active' : ''}`}
                aria-current={active === id ? 'true' : undefined}
              >
                {link.label}
              </SectionLink>
            );
          })}
        </nav>

        <div className="nav__cta">
          {/* Sem Supabase configurado não há login possível: melhor não
              oferecer a porta do que levar o aluno a uma tela que trava. */}
          {isSupabaseConfigured && (
            <Link
              className="nav__aluno"
              to={session ? '/area-do-aluno' : '/entrar'}
              aria-label={session ? 'Abrir a área do aluno' : 'Entrar na área do aluno'}
            >
              {session && iniciais ? (
                <span className="nav__avatar" aria-hidden="true">
                  {iniciais}
                </span>
              ) : (
                <User size={16} aria-hidden="true" />
              )}
              <span className="nav__aluno-label">Área do aluno</span>
            </Link>
          )}

          <Button onClick={() => open('Olá! Quero começar a treinar na Nice One.')} withChevron>
            Matricule-se
          </Button>
        </div>

        <button
          type="button"
          className="nav__burger"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((valor) => !valor)}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      <div
        id="menu-mobile"
        className={`nav__menu ${menuOpen ? 'nav__menu--open' : ''}`}
        hidden={!menuOpen}
      >
        <nav className="nav__menu-links" aria-label="Navegação mobile">
          {navLinks.map((link) => (
            <SectionLink
              key={link.href}
              to={link.href.slice(1)}
              onNavigate={() => setMenuOpen(false)}
            >
              {link.label}
            </SectionLink>
          ))}
        </nav>

        <div className="nav__menu-actions">
          {isSupabaseConfigured && (
            <Link
              className="nav__aluno nav__aluno--menu"
              to={session ? '/area-do-aluno' : '/entrar'}
              onClick={() => setMenuOpen(false)}
            >
              {session && iniciais ? (
                <span className="nav__avatar" aria-hidden="true">
                  {iniciais}
                </span>
              ) : (
                <User size={16} aria-hidden="true" />
              )}
              <span className="nav__aluno-label">Área do aluno</span>
            </Link>
          )}

          <Button
            size="lg"
            withChevron
            onClick={() => {
              setMenuOpen(false);
              open('Olá! Quero começar a treinar na Nice One.');
            }}
          >
            Matricule-se
          </Button>
        </div>
      </div>
    </header>
  );
}
