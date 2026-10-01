/**
 * Planos da Nice One.
 * Não existem preços confirmados — o site nunca exibe valores.
 */

export type Plan = {
  id: string;
  name: string;
  payment: string;
  features: string[];
  footnote?: string;
};

export const plansHighlight = 'Acesso a todas as unidades da Nice One.';

export const plans: Plan[] = [
  {
    id: 'cartao',
    name: 'Plano Anual',
    payment: 'Cartão de crédito',
    features: ['Em 12x', 'Utiliza o limite do cartão', 'Sem taxa de adesão', 'Sem anuidade'],
  },
  {
    id: 'recorrente',
    name: 'Plano Anual',
    payment: 'Recorrente',
    features: [
      'Em 12x',
      'Não utiliza o limite do cartão',
      'Sem taxa de adesão',
      'Sem anuidade',
    ],
    footnote: 'Juros da modalidade.',
  },
];
