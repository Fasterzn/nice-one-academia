import { Link2 } from 'lucide-react';
import { InstagramIcon, YoutubeIcon, FacebookIcon } from '../components/BrandIcons';
import { site, navLinks } from '../data/site';
import { social } from '../data/social';
import { units, unitLocation } from '../data/units';
import { Logo } from '../components/Logo';
import { SectionLink } from '../components/SectionLink';
import './Footer.css';

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo size="md" onDark />
          <p className="footer__slogan">{site.slogan}</p>
          <div className="footer__social">
            <a href={social.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Nice One (abre em nova aba)">
              <InstagramIcon size={18} />
            </a>
            <a href={social.youtube.url} target="_blank" rel="noopener noreferrer" aria-label="YouTube da Nice One (abre em nova aba)">
              <YoutubeIcon size={18} />
            </a>
            <a href={social.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook da Nice One (abre em nova aba)">
              <FacebookIcon size={18} />
            </a>
            <a href={social.linktree.url} target="_blank" rel="noopener noreferrer" aria-label="Linktree da Nice One (abre em nova aba)">
              <Link2 size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <nav className="footer__nav" aria-label="Navegação do rodapé">
          <h2 className="footer__title">Navegação</h2>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <SectionLink to={link.href.slice(1)}>{link.label}</SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__units">
          <h2 className="footer__title">Unidades</h2>
          <ul>
            {units.map((unit) => (
              <li key={unit.id}>
                <strong>{unit.name}</strong>
                <span>{unitLocation(unit)}</span>
                <span className="footer__unit-phone">{unit.whatsappDisplay}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>
          © {year} {site.name}. Todos os direitos reservados.
        </p>
        <p className="footer__city">
          {site.cityState} · {site.hashtag}
        </p>
      </div>
    </footer>
  );
}
