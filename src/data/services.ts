import type { LucideIcon } from 'lucide-react';
import { Dumbbell, HeartPulse, Users, UserRound, ClipboardList, Network } from 'lucide-react';

export type Service = {
  name: string;
  text: string;
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    name: 'Musculação',
    text: 'Equipamentos modernos e espaço para treinar com foco.',
    icon: Dumbbell,
  },
  {
    name: 'Cardio',
    text: 'Estrutura para condicionamento e resistência.',
    icon: HeartPulse,
  },
  {
    name: 'Aulas coletivas',
    text: 'Spinning, Jump, Fit Dance, Pilates de Solo e muito mais para treinar em grupo.',
    icon: Users,
  },
  {
    name: 'Personal trainer',
    text: 'Acompanhamento individual com profissionais qualificados.',
    icon: UserRound,
  },
  {
    name: 'Avaliação física',
    text: 'Entenda seu ponto de partida e acompanhe sua evolução.',
    icon: ClipboardList,
  },
  {
    name: 'Acesso à rede',
    text: 'Planos com acesso a todas as unidades da Nice One.',
    icon: Network,
  },
];
