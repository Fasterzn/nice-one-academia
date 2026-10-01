import { useEffect, useRef, useState } from 'react';

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Marca o elemento como visível na primeira vez que ele entra na tela.
 * Com prefers-reduced-motion, já nasce visível.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  // Já nasce visível quando não há animação a fazer ou suporte a observar.
  const [visible, setVisible] = useState(
    () => reduceMotion() || typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}

export { reduceMotion };
