export type Unit = {
  id: number;
  name: string;
  street: string | null;
  neighborhood: string | null;
  city: 'Sertãozinho - SP';
  cep: string | null;
  /** Só dígitos, com 55. */
  whatsapp: string;
  whatsappDisplay: string;
  image: string | null;
  /** Confirmado pela Nice One em 28/09/2026: só a Unidade 4 é 24h. */
  is24h: boolean | null;
  hasClassSchedule: boolean;
};

export const units: Unit[] = [
  {
    id: 1,
    name: 'Unidade 1',
    street: 'Av. Afonso Trigo, 1440',
    neighborhood: 'Jardim 5 de Dezembro',
    city: 'Sertãozinho - SP',
    cep: '14160-100',
    whatsapp: '551635242224',
    whatsappDisplay: '(16) 3524-2224',
    image: '/images/unidades/unidade-1.webp',
    is24h: false,
    hasClassSchedule: false,
  },
  {
    id: 2,
    name: 'Unidade 2',
    // TODO: confirmar com a Nice One — número da rua
    street: 'R. Maria Aparecida Andrade',
    neighborhood: 'Jardim Tropical',
    city: 'Sertãozinho - SP',
    cep: null, // TODO: confirmar com a Nice One
    whatsapp: '5516991366650',
    whatsappDisplay: '(16) 99136-6650',
    image: '/images/unidades/unidade-2.webp',
    is24h: false,
    hasClassSchedule: false,
  },
  {
    id: 3,
    name: 'Unidade 3',
    street: 'Av. Eduardo Toniello, 770',
    neighborhood: 'Jardim Grande Aliança',
    city: 'Sertãozinho - SP',
    cep: '14161-310',
    whatsapp: '5516991863181',
    whatsappDisplay: '(16) 99186-3181',
    image: '/images/unidades/unidade-3.webp',
    is24h: false,
    hasClassSchedule: true,
  },
  {
    id: 4,
    name: 'Unidade 4',
    street: 'Av. Antônio Paschoal, 2271',
    neighborhood: 'Centro',
    city: 'Sertãozinho - SP',
    cep: '14169-025',
    whatsapp: '5516993051120',
    whatsappDisplay: '(16) 99305-1120',
    image: '/images/unidades/unidade-4.webp',
    is24h: true,
    hasClassSchedule: false,
  },
  {
    id: 5,
    name: 'Unidade 5',
    street: 'Av. Aparecido Savegnago, 555',
    neighborhood: 'Jardim Campo Alegre',
    city: 'Sertãozinho - SP',
    cep: '14178-100',
    whatsapp: '5516994114903',
    whatsappDisplay: '(16) 99411-4903',
    image: '/images/unidades/unidade-5.webp',
    is24h: false,
    hasClassSchedule: true,
  },
];

/** Texto curto de localização; "Consulte a unidade" quando não confirmado. */
export function unitLocation(unit: Unit): string {
  if (!unit.street) return 'Endereço em breve';
  return unit.neighborhood ? `${unit.street} — ${unit.neighborhood}` : unit.street;
}

/** Descrição de imagem real para o atributo alt. */
export function unitImageAlt(unit: Unit): string {
  return unit.street
    ? `Nice One ${unit.name}, na ${unit.street}, em Sertãozinho`
    : `Nice One ${unit.name}, em Sertãozinho`;
}
