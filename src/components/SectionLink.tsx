import { useNavigate } from 'react-router-dom';
import type { MouseEvent, ReactNode } from 'react';

/**
 * Link para uma seção da home (#unidades, #aulas…).
 *
 * Por que não é um <a href="#..."> simples: quando o site roda como arquivo
 * único, o roteador é por hash — e aí "#unidades" seria lido como a rota
 * "/unidades" e cairia no 404. Aqui o clique rola até a seção por JS e o href
 * continua no HTML para acessibilidade e para quem abre em nova aba.
 */
type Props = {
  /** Id da seção, sem "#". */
  to: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
  'aria-current'?: 'true' | undefined;
};

export function SectionLink({ to, children, className, onNavigate, ...resto }: Props) {
  const navegar = useNavigate();

  const aoClicar = (evento: MouseEvent<HTMLAnchorElement>) => {
    // Deixa passar clique com ctrl/cmd, botão do meio e afins.
    if (evento.defaultPrevented || evento.metaKey || evento.ctrlKey || evento.shiftKey) return;

    const alvo = document.getElementById(to);
    if (!alvo) {
      // Não está na home: vai para a home e a rolagem acontece lá.
      evento.preventDefault();
      navegar('/', { state: { secao: to } });
      onNavigate?.();
      return;
    }

    // Só rola. Mexer na hash aqui desincronizaria o roteador no arquivo único.
    evento.preventDefault();
    alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onNavigate?.();
  };

  return (
    <a href={`#${to}`} className={className} onClick={aoClicar} {...resto}>
      {children}
    </a>
  );
}
