import { ChevronDown, MapPin, Clock, Star } from 'lucide-react';
import { Button } from '../components/Button';
import { SectionLink } from '../components/SectionLink';
import { useUnitPicker } from '../components/unit-picker-context';
import { googleRating } from '../data/site';
import { asset } from '../lib/asset';
import './Hero.css';

export function Hero() {
  const { open } = useUnitPicker();

  return (
    <section className="hero" id="inicio">
      <div className="hero__media">
        <picture>
          <source media="(min-width: 768px)" srcSet={asset('images/hero.webp')} />
          <img
            src={asset('images/hero-mobile.webp')}
            alt="Salão de musculação da Nice One Academia em Sertãozinho"
            width={1350}
            height={759}
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__inner container">
        <p className="hero__kicker">
          <span className="hero__kicker-dot" aria-hidden="true" />
          20 anos em Sertãozinho · 5 unidades
        </p>

        <h1 className="hero__title">
          Treine perto
          <br />
          de casa
        </h1>

        <p className="hero__subtitle">Com quem cuida de você desde 2006.</p>

        <p className="hero__lead">
          Musculação, aulas coletivas, avaliação física e professores presentes. Escolha sua unidade
          e comece hoje.
        </p>

        <div className="hero__actions">
          <Button size="lg" withChevron onClick={() => open('Olá! Quero treinar na Nice One.')}>
            Quero treinar
          </Button>
          <SectionLink to="unidades" className="btn btn--outline btn--lg">
            <span className="btn__label">Ver unidades</span>
          </SectionLink>
        </div>

        <ul className="hero__facts">
          <li>
            <Star size={16} aria-hidden="true" />
            <strong>{googleRating.score}</strong> no Google
          </li>
          <li>
            <MapPin size={16} aria-hidden="true" />5 unidades na cidade
          </li>
          <li>
            <Clock size={16} aria-hidden="true" />
            Unidade 4 aberta 24h
          </li>
        </ul>
      </div>

      <SectionLink to="sobre" className="hero__scroll" aria-label="Rolar para a próxima seção">
        <ChevronDown size={22} aria-hidden="true" />
      </SectionLink>
    </section>
  );
}
