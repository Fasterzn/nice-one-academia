import type { Unit } from '../data/units';

/**
 * Link de busca no Google Maps.
 * Retorna null quando o endereço não está confirmado — o botão não é renderizado.
 */
export function mapsLink(unit: Unit): string | null {
  if (!unit.street) return null;
  const parts = [unit.street, unit.neighborhood, 'Sertãozinho - SP'].filter(Boolean);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
}
