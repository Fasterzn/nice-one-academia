import type { ReactNode } from 'react';
import './Button.css';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Chevron que desliza no hover — usado nos CTAs principais. */
  withChevron?: boolean;
};

type ButtonProps = CommonProps & {
  as?: 'button';
  onClick?: () => void;
  type?: 'button' | 'submit';
  /** Desativa e mostra spinner — impede envio duplicado. */
  loading?: boolean;
  disabled?: boolean;
};

type LinkProps = CommonProps & {
  as: 'a';
  href: string;
  external?: boolean;
  ariaLabel?: string;
};

function classes({ variant = 'primary', size = 'md', className }: CommonProps) {
  return ['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ');
}

export function Button(props: ButtonProps | LinkProps) {
  const { children, withChevron } = props;
  const loading = props.as === 'a' ? false : (props.loading ?? false);

  const content = (
    <>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      <span className="btn__label">{children}</span>
      {withChevron && !loading && (
        <span className="btn__chevron" aria-hidden="true">
          »
        </span>
      )}
    </>
  );

  if (props.as === 'a') {
    const external = props.external ?? props.href.startsWith('http');
    return (
      <a
        className={classes(props)}
        href={props.href}
        aria-label={props.ariaLabel}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={classes(props)}
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}
