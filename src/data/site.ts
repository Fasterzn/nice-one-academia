/**
 * Dados institucionais da Nice One Academia.
 * Números sociais mudam com o tempo — por isso guardam a data de referência.
 */

export const site = {
  name: 'Nice One Academia',
  shortName: 'Nice One',
  city: 'Sertãozinho',
  state: 'SP',
  cityState: 'Sertãozinho - SP',
  foundedYear: 2006,
  yearsLabel: '20 anos',
  unitsCount: 5,
  slogan: 'Invista na saúde para não gastar na doença!',
  hashtag: '#SomosNice',
  phone: '(16) 3524-2224',
  phoneHref: 'tel:+551635242224',
  url: 'https://niceone.com.br/',
  linktree: 'https://linktr.ee/academianiceone',
} as const;

/** Data de apuração dos números exibidos na seção de estatísticas. */
export const statsAsOf = '2026-09';

export type Stat = {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  /** Casas decimais ao animar a contagem. */
  decimals?: number;
};

export const stats: Stat[] = [
  { value: 20, suffix: '', label: 'anos de história' },
  { value: 5, suffix: '', label: 'unidades em Sertãozinho' },
  { value: 17.9, suffix: ' mil', label: 'seguidores no Instagram', decimals: 1 },
  { value: 198, suffix: ' mil', label: 'inscritos no YouTube' },
];

/** Números do canal, exibidos na seção de redes. */
export const youtubeStats = [
  { value: '198 mil', label: 'inscritos' },
  { value: '160', label: 'vídeos' },
  { value: '15.250.384', label: 'visualizações' },
];

export const googleRating = {
  score: '4,5',
  count: 168,
} as const;

export type OpeningHour = { days: string; hours: string };

/** Horário geral da rede. Pode variar por unidade. */
export const openingHours: OpeningHour[] = [
  { days: 'Segunda a quinta', hours: '05h às 22h' },
  { days: 'Sexta', hours: '05h às 21h' },
  { days: 'Sábado e domingo', hours: '08h às 13h' },
];

export const openingHoursNote =
  'Horários podem variar por unidade e em feriados. Confirme pelo WhatsApp da unidade.';

export const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Unidades', href: '#unidades' },
  { label: 'Aulas', href: '#aulas' },
  { label: 'Planos', href: '#planos' },
  { label: 'Contato', href: '#contato' },
] as const;

/** Modalidades exibidas na faixa marquee. */
export const marqueeItems = [
  'Musculação',
  'Spinning',
  'Jump',
  'Fit Dance',
  'Pilates de Solo',
  'Funcional',
  'Avaliação física',
];
