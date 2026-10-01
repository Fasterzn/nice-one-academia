import type { ReactNode } from 'react';
import './SectionTitle.css';

type Props = {
  kicker?: string;
  children: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
};

export function SectionTitle({ kicker, children, lead, align = 'left', id }: Props) {
  return (
    <header className={`section-title section-title--${align}`}>
      {kicker && <p className="kicker">{kicker}</p>}
      <h2 id={id}>{children}</h2>
      {lead && <p className="lead section-title__lead">{lead}</p>}
    </header>
  );
}
