import { useState } from 'react';
import './Photo.css';

type Props = {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /** Texto da marca d'água quando a foto não existe. */
  fallbackLabel?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Foto com fallback elegante: se o arquivo não existir, mostra fundo da marca
 * com o logotipo em marca d'água — nunca um ícone de imagem quebrada.
 */
export function Photo({
  src,
  alt,
  width,
  height,
  fallbackLabel,
  className,
  priority = false,
  sizes,
}: Props) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div
        className={['photo photo--fallback', className].filter(Boolean).join(' ')}
        style={{ aspectRatio: `${width} / ${height}` }}
        role="img"
        aria-label={alt}
      >
        <span className="photo__mark" aria-hidden="true">
          Nice<span className="photo__mark-accent">One</span>
        </span>
        {fallbackLabel && <span className="photo__label" aria-hidden="true">{fallbackLabel}</span>}
      </div>
    );
  }

  return (
    <img
      className={['photo', className].filter(Boolean).join(' ')}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      {...(priority ? { fetchPriority: 'high' as const } : {})}
      onError={() => setFailed(true)}
    />
  );
}
