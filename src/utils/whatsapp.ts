import type { Unit } from '../data/units';

/** Mensagem padrão quando o CTA não define um contexto específico. */
export function defaultMessage(unit: Unit): string {
  return `Olá! Vim pelo site e quero saber mais sobre a Nice One ${unit.name}.`;
}

/** Link wa.me da unidade com a mensagem já codificada. */
export function whatsappLink(unit: Unit, message?: string): string {
  const text = message ?? defaultMessage(unit);
  return `https://wa.me/${unit.whatsapp}?text=${encodeURIComponent(text)}`;
}
