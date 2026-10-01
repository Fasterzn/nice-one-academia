/**
 * Ícones das redes sociais.
 * O lucide-react removeu os ícones de marca na v1, então eles são desenhados
 * aqui no mesmo traço dos demais — sem adicionar dependência nova.
 */
type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export function InstagramIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function YoutubeIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.2v5.6l5-2.8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3h-2.5A4.5 4.5 0 0 0 9 7.5V11H6v4h3v7h4v-7h3l1-4h-4V7.5A.5.5 0 0 1 13.5 7H16z" />
    </svg>
  );
}
