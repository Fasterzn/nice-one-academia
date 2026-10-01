import { asset } from '../lib/asset';
export const social = {
  instagram: { handle: '@niceoneoficial', url: 'https://www.instagram.com/niceoneoficial/' },
  facebook: { handle: 'Nice One - Academia', url: 'https://www.facebook.com/niceoneoficial/' },
  youtube: { handle: '@niceoneacademia', url: 'https://www.youtube.com/@niceoneacademia' },
  linktree: { url: 'https://linktr.ee/academianiceone' },
} as const;

/** Fotos reais das unidades usadas na grade da seção de redes. */
export const instagramTiles = [
  { src: asset('images/instagram/post-1.webp'), alt: 'Estação de cabos na Nice One Unidade 1' },
  { src: asset('images/instagram/post-2.webp'), alt: 'Área de bikes e logo Nice One na parede da Unidade 1' },
  { src: asset('images/instagram/post-3.webp'), alt: 'Área de treino funcional da Nice One Unidade 2' },
  { src: asset('images/instagram/post-4.webp'), alt: 'Sala de musculação da Nice One Unidade 2' },
  { src: asset('images/instagram/post-5.webp'), alt: 'Área de treino da Nice One Unidade 5' },
  { src: asset('images/instagram/post-6.webp'), alt: 'Equipamentos de cardio da Nice One Unidade 4' },
];

/** Mosaico da seção comunidade. */
export const communityPhotos = [
  { src: asset('images/comunidade/comunidade-1.webp'), alt: 'Aulão ao ar livre da Nice One no fim da tarde' },
  { src: asset('images/comunidade/comunidade-2.webp'), alt: 'Recepção da Nice One com o painel de 20 anos' },
  { src: asset('images/comunidade/comunidade-3.webp'), alt: 'Rack de halteres da Nice One Unidade 5' },
  { src: asset('images/comunidade/comunidade-4.webp'), alt: 'Sala de peso livre da Nice One Unidade 2' },
  { src: asset('images/comunidade/comunidade-5.webp'), alt: 'Esteiras da Nice One Unidade 1 em frente às janelas' },
  { src: asset('images/comunidade/comunidade-6.webp'), alt: 'Elípticos da Nice One Unidade 5' },
];
