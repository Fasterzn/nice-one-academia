import { useEffect, useRef, useState } from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
import { units, unitLocation, unitImageAlt, type Unit } from '../data/units';
import { whatsappLink } from '../utils/whatsapp';
import { mapsLink } from '../utils/maps';
import { SectionTitle } from '../components/SectionTitle';
import { Photo } from '../components/Photo';
import { useReveal } from '../utils/useReveal';
import './Units.css';

function UnitCard({ unit, index }: { unit: Unit; index: number }) {
  const { ref, visible } = useReveal<HTMLLIElement>();
  const maps = mapsLink(unit);

  return (
    <li
      ref={ref}
      className={`units__card ${visible ? 'units__card--in' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="units__photo">
        <Photo
          src={unit.image}
          alt={unitImageAlt(unit)}
          width={420}
          height={315}
          fallbackLabel={unit.name}
          sizes="(min-width: 1024px) 33vw, 86vw"
        />
        <span className="units__index" aria-hidden="true">
          {String(unit.id).padStart(2, '0')}
        </span>

        {unit.is24h && <span className="units__badge">24 horas</span>}
      </div>

      <div className="units__body">
        <h3 className="units__name">{unit.name}</h3>
        <p className="units__place">
          <MapPin size={15} aria-hidden="true" />
          <span>
            {unitLocation(unit)}
            <span className="units__city">{unit.city}</span>
          </span>
        </p>

        <div className="units__actions">
          {/* O complemento fica em texto oculto para que o nome acessível
              contenha o rótulo visível (evita divergência de label). */}
          <a
            className="units__wpp"
            href={whatsappLink(unit)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={16} aria-hidden="true" />
            WhatsApp
            <span className="visually-hidden"> da Nice One {unit.name} (abre em nova aba)</span>
          </a>

          {maps && (
            <a className="units__map" href={maps} target="_blank" rel="noopener noreferrer">
              Ver no mapa
              <span className="visually-hidden"> da Nice One {unit.name} (abre em nova aba)</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export function Units() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  // Indicadores do carrossel mobile acompanham o scroll do trilho.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const card = track.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + 16;
      setActive(Math.round(track.scrollLeft / step));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  };

  return (
    <section className="section section--surface units" id="unidades">
      <div className="container">
        <SectionTitle kicker="Unidades">
          Encontre a Nice One mais <span className="hl">perto de você.</span>
        </SectionTitle>

        <ul className="units__track" ref={trackRef}>
          {units.map((unit, index) => (
            <UnitCard key={unit.id} unit={unit} index={index} />
          ))}
        </ul>

        <div className="units__dots" role="tablist" aria-label="Navegar entre as unidades">
          {units.map((unit, index) => (
            <button
              key={unit.id}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Ver ${unit.name}`}
              className={`units__dot ${active === index ? 'units__dot--on' : ''}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
