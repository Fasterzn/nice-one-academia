import { communityPhotos } from '../data/social';
import { Photo } from '../components/Photo';
import { useReveal } from '../utils/useReveal';
import './Community.css';

function Tile({ src, alt, index }: { src: string; alt: string; index: number }) {
  const { ref, visible } = useReveal<HTMLLIElement>();

  return (
    <li
      ref={ref}
      className={`community__tile ${visible ? 'community__tile--in' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <Photo src={src} alt={alt} width={408} height={510} sizes="(min-width: 768px) 30vw, 60vw" />
    </li>
  );
}

export function Community() {
  return (
    <section className="section community" id="comunidade" aria-labelledby="community-title">
      <div className="container">
        <h2 className="community__title" id="community-title">
          #Somos<span className="hl">Nice</span>
        </h2>

        <ul className="community__grid">
          {communityPhotos.map((photo, index) => (
            <Tile key={photo.src} src={photo.src} alt={photo.alt} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
