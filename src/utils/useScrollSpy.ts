import { useEffect, useState } from 'react';

/**
 * Devolve o id da seção visível no momento, para sublinhar o link ativo.
 * Considera visível a seção mais próxima do topo abaixo da navbar.
 */
export function useScrollSpy(ids: string[], offset = 120): string {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    const onScroll = () => {
      let current = ids[0] ?? '';
      for (const id of ids) {
        const node = document.getElementById(id);
        if (!node) continue;
        if (node.getBoundingClientRect().top - offset <= 0) current = id;
      }
      // Ao chegar no fim da página, marca a última seção.
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
        current = ids[ids.length - 1] ?? current;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids, offset]);

  return active;
}
