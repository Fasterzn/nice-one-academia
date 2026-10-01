import { marqueeItems } from '../data/site';
import './Marquee.css';

/** Faixa fina verde com as modalidades. Decorativa — escondida de leitores de tela. */
export function Marquee() {
  const sequence = [...marqueeItems, ...marqueeItems];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div className="marquee__group" key={copy}>
            {sequence.map((item, index) => (
              <span className="marquee__item" key={`${copy}-${index}`}>
                {item}
                <span className="marquee__dot">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
