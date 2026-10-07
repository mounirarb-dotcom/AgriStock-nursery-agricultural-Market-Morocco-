import { MoroccanRegion } from '../types';

/**
 * Normalizes a region or geographic name:
 * - removes accents (é -> e)
 * - converts punctuation to spaces
 * - handles phonetic variations (souss -> sous, etc.)
 * - trims and collapses spaces
 */
export function normalizeRegionString(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/ss/g, 's')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Determines whether an item's region strictly matches a targeted filter region.
 * Guarantees that when filtering 'Souss-Massa', listings from 'Casablanca' or other regions are strictly excluded.
 */
export function isRegionMatch(itemRegion?: string, targetRegion?: string): boolean {
  if (!targetRegion || targetRegion === 'ALL') return true;
  if (!itemRegion) return false;

  // Strict identity
  if (itemRegion.trim() === targetRegion.trim()) return true;

  const nItem = normalizeRegionString(itemRegion);
  const nTarget = normalizeRegionString(targetRegion);

  if (nItem === nTarget) return true;

  // Extract the primary regional identifier (e.g. 'sous masa', 'casablanca', 'oriental', 'marrakech')
  const getPrimaryTag = (normalized: string): string => {
    if (normalized.includes('sous masa') || normalized.includes('agadir') || normalized.includes('chtouka') || normalized.includes('taroudant')) {
      return 'souss_massa';
    }
    if (normalized.includes('casablanca') || normalized.includes('settat') || normalized.includes('doukkala') || normalized.includes('berrechid') || normalized.includes('chaouia')) {
      return 'casablanca_settat';
    }
    if (normalized.includes('oriental') || normalized.includes('berkane') || normalized.includes('oujda') || normalized.includes('nador')) {
      return 'oriental';
    }
    if (normalized.includes('marrakech') || normalized.includes('safi') || normalized.includes('haouz') || normalized.includes('kelaa')) {
      return 'marrakech_safi';
    }
    if (normalized.includes('fes') || normalized.includes('meknes') || normalized.includes('saiss') || normalized.includes('sefrou') || normalized.includes('hajeb')) {
      return 'fes_meknes';
    }
    if (normalized.includes('gharb') || normalized.includes('chrarda') || normalized.includes('kenitra') || normalized.includes('slimane')) {
      return 'gharb_kenitra';
    }
    if (normalized.includes('beni mellal') || normalized.includes('khenifra') || normalized.includes('tadla')) {
      return 'beni_mellal_tadla';
    }
    if (normalized.includes('draa') || normalized.includes('tafilalet') || normalized.includes('zagora') || normalized.includes('errachidia')) {
      return 'draa_tafilalet';
    }
    if (normalized.includes('tanger') || normalized.includes('tetouan') || normalized.includes('hoceima') || normalized.includes('loukkos') || normalized.includes('larache')) {
      return 'tanger_tetouan';
    }
    return normalized.split(' ')[0] || '';
  };

  const itemTag = getPrimaryTag(nItem);
  const targetTag = getPrimaryTag(nTarget);

  if (itemTag && targetTag) {
    return itemTag === targetTag;
  }

  return nItem.includes(nTarget) || nTarget.includes(nItem);
}

/**
 * Checks if search text mentions a specific region or city
 */
export function matchesSearchTerm(
  searchQuery: string,
  fields: Array<string | undefined | null>
): boolean {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return true;

  const nQuery = normalizeRegionString(query);

  return fields.some((field) => {
    if (!field) return false;
    const lower = field.toLowerCase();
    if (lower.includes(query)) return true;
    const nField = normalizeRegionString(field);
    return nField.includes(nQuery);
  });
}
