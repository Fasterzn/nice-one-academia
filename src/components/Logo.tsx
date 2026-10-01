import './Logo.css';

/**
 * Marca da Nice One: quadrado com o degradê verde e "NICE ONE!" em branco.
 *
 * TODO: trocar pelo arquivo oficial quando a Nice One enviar o SVG/PNG em alta.
 * Para isso basta salvar em public/images/logo-nice-one.svg e usar <img>.
 */
type Props = {
  /** sm = navbar · md = rodapé e telas de login · lg = destaque */
  size?: 'sm' | 'md' | 'lg';
  /** Em fundo escuro o texto ao lado da marca fica branco. */
  onDark?: boolean;
  /** Só o selo, sem o texto ao lado. */
  markOnly?: boolean;
};

export function Logo({ size = 'sm', onDark = false, markOnly = false }: Props) {
  return (
    <span className={`logo logo--${size} ${onDark ? 'logo--on-dark' : ''}`}>
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="presentation" focusable="false">
          <defs>
            <linearGradient id="niceone-verde" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2FA84F" />
              <stop offset="100%" stopColor="#7DC242" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="22" fill="url(#niceone-verde)" />
          <text
            x="50"
            y="44"
            textAnchor="middle"
            fill="#fff"
            fontFamily="Anton, Impact, sans-serif"
            fontSize="30"
            letterSpacing="0.5"
          >
            NICE
          </text>
          <text
            x="50"
            y="78"
            textAnchor="middle"
            fill="#fff"
            fontFamily="Anton, Impact, sans-serif"
            fontSize="30"
            letterSpacing="0.5"
          >
            ONE!
          </text>
        </svg>
      </span>

      {!markOnly && (
        <span className="logo__text">
          <span className="logo__word">
            Nice <span className="logo__accent">One</span>
          </span>
          <span className="logo__sub">Academia</span>
        </span>
      )}
    </span>
  );
}
