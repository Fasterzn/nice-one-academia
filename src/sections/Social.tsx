import { InstagramIcon, YoutubeIcon } from '../components/BrandIcons';
import { social, instagramTiles } from '../data/social';
import { youtubeStats } from '../data/site';
import { Photo } from '../components/Photo';
import { Button } from '../components/Button';
import { Reveal } from '../components/Reveal';
import './Social.css';

export function Social() {
  return (
    <section className="section section--surface social" aria-labelledby="social-title">
      <div className="container social__inner">
        <Reveal className="social__block">
          <p className="kicker">Instagram</p>
          <h2 id="social-title">
            Acompanhe o <span className="hl">dia a dia.</span>
          </h2>

          <ul className="social__grid">
            {instagramTiles.map((tile) => (
              <li key={tile.src}>
                <Photo
                  src={tile.src}
                  alt={tile.alt}
                  width={382}
                  height={382}
                  sizes="(min-width: 768px) 15vw, 30vw"
                />
              </li>
            ))}
          </ul>

          <Button as="a" href={social.instagram.url} variant="outline" withChevron>
            Seguir {social.instagram.handle}
          </Button>
        </Reveal>

        <Reveal className="social__block social__block--yt" delay={80}>
          <p className="kicker">YouTube</p>
          <h2>
            Conteúdo para você <span className="hl">evoluir.</span>
          </h2>

          <ul className="social__stats">
            {youtubeStats.map((stat) => (
              <li key={stat.label}>
                <span className="social__stat-value">{stat.value}</span>
                <span className="social__stat-label">{stat.label}</span>
              </li>
            ))}
          </ul>

          <div className="social__yt-actions">
            <Button as="a" href={social.youtube.url} withChevron>
              Ver no YouTube
            </Button>
            <a className="social__handle" href={social.youtube.url} target="_blank" rel="noopener noreferrer">
              <YoutubeIcon size={16} />
              {social.youtube.handle}
            </a>
          </div>
        </Reveal>
      </div>

      <div className="container">
        <p className="social__links">
          <a href={social.instagram.url} target="_blank" rel="noopener noreferrer">
            <InstagramIcon size={16} />
            Instagram
            <span className="visually-hidden"> da Nice One (abre em nova aba)</span>
          </a>
          <a href={social.facebook.url} target="_blank" rel="noopener noreferrer">
            Facebook
            <span className="visually-hidden"> da Nice One (abre em nova aba)</span>
          </a>
          <a href={social.linktree.url} target="_blank" rel="noopener noreferrer">
            Linktree
            <span className="visually-hidden"> da Nice One (abre em nova aba)</span>
          </a>
        </p>
      </div>
    </section>
  );
}
