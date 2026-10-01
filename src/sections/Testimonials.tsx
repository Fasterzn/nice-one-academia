import { Star } from 'lucide-react';
import { testimonials, testimonialsLabel } from '../data/testimonials';
import { googleRating } from '../data/site';
import { useReveal } from '../utils/useReveal';
import './Testimonials.css';

function Quote({ text, index }: { text: string; index: number }) {
  const { ref, visible } = useReveal<HTMLLIElement>();

  return (
    <li
      ref={ref}
      className={`testimonials__item ${visible ? 'testimonials__item--in' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <blockquote>{text}</blockquote>
    </li>
  );
}

export function Testimonials() {
  return (
    <section className="section testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="testimonials__head">
          <p className="kicker" id="testimonials-title">
            {testimonialsLabel}
          </p>
          <p className="testimonials__rating">
            <Star size={18} aria-hidden="true" />
            <strong>{googleRating.score}</strong>
            <span>· {googleRating.count} avaliações</span>
          </p>
        </div>

        <ul className="testimonials__list">
          {testimonials.map((text, index) => (
            <Quote key={text} text={text} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
