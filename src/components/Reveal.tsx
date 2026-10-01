import type { CSSProperties, ReactNode } from 'react';
import { useReveal } from '../utils/useReveal';
import './Reveal.css';

type Props = {
  children: ReactNode;
  /** Atraso em cascata, em ms. */
  delay?: number;
  className?: string;
};

/** Aparece uma única vez ao entrar na tela. Em listas, use o hook useReveal direto no item. */
export function Reveal({ children, delay = 0, className }: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={['reveal', visible && 'reveal--in', className].filter(Boolean).join(' ')}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
