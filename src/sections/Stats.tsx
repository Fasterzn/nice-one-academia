import { useEffect, useRef, useState } from 'react';
import { stats, type Stat } from '../data/site';
import { useReveal, reduceMotion } from '../utils/useReveal';
import './Stats.css';

const DURATION = 1200;

function formatValue(value: number, stat: Stat) {
  const decimals = stat.decimals ?? 0;
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Counter({ stat }: { stat: Stat }) {
  const { ref, visible } = useReveal<HTMLLIElement>();
  const [value, setValue] = useState(() => (reduceMotion() ? stat.value : 0));
  const started = useRef(false);

  useEffect(() => {
    // Com reduced-motion o valor final já é o estado inicial.
    if (!visible || started.current || reduceMotion()) return;
    started.current = true;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      // easeOutExpo — acelera e desacelera junto com o resto do site
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(stat.value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, stat.value]);

  return (
    <li className={`stats__item ${visible ? 'stats__item--in' : ''}`} ref={ref}>
      <span className="stats__value">
        {formatValue(value, stat)}
        <span className="stats__suffix">{stat.suffix}</span>
      </span>
      <span className="stats__label">{stat.label}</span>
    </li>
  );
}

export function Stats() {
  return (
    <section className="section stats" aria-label="Nice One em números">
      <div className="container">
        <ul className="stats__list">
          {stats.map((stat) => (
            <Counter key={stat.label} stat={stat} />
          ))}
        </ul>
      </div>
    </section>
  );
}
