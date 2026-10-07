import { NurseryLot, NurseryStockStatus } from '../types';

export interface BulkUpdateOptions {
  priceOption: 'keep' | 'fixed' | 'percentage';
  fixedPriceMAD?: number;
  percentageAdjustment?: number; // e.g. +10 for +10%, -15 for -15%
  statusOption: 'keep' | 'update';
  newStatus?: NurseryStockStatus;
}

/**
 * Returns the effective stock status of a nursery lot.
 * Respects explicit lot.status, or infers from quantities if not yet set.
 */
export function getLotStockStatus(lot: NurseryLot): NurseryStockStatus {
  if (lot.status) {
    return lot.status;
  }
  if (lot.quantityAvailable <= 0) {
    return lot.quantityReserved > 0 ? 'Reserved' : 'Sold';
  }
  return 'In Stock';
}

/**
 * Calculates updated unit price in MAD based on selected bulk update options.
 */
export function calculateBulkPriceUpdate(
  currentPrice: number,
  priceOption: 'keep' | 'fixed' | 'percentage',
  value?: number
): number {
  if (priceOption === 'keep' || value === undefined || isNaN(value)) {
    return currentPrice;
  }
  if (priceOption === 'fixed') {
    return Math.max(0.01, Math.round(value * 100) / 100);
  }
  if (priceOption === 'percentage') {
    const factor = 1 + value / 100;
    const computed = currentPrice * factor;
    return Math.max(0.1, Math.round(computed * 100) / 100);
  }
  return currentPrice;
}

/**
 * Calculates inventory quantities and status for bulk updates.
 */
export function calculateBulkStatusUpdate(
  lot: NurseryLot,
  newStatus: NurseryStockStatus
): Partial<NurseryLot> {
  const todayStr = new Date().toISOString().split('T')[0];

  switch (newStatus) {
    case 'In Stock': {
      // If lot was previously marked Sold (0 available), restore available quantity from total
      const restoredAvailable =
        lot.quantityAvailable > 0
          ? lot.quantityAvailable
          : lot.quantityTotal > 0
          ? lot.quantityTotal
          : 500;
      return {
        status: 'In Stock',
        quantityAvailable: restoredAvailable,
        lastUpdated: todayStr,
      };
    }
    case 'Reserved': {
      const reservedQty =
        lot.quantityTotal > 0
          ? lot.quantityTotal
          : (lot.quantityAvailable || 0) + (lot.quantityReserved || 0);
      return {
        status: 'Reserved',
        quantityAvailable: 0,
        quantityReserved: reservedQty,
        lastUpdated: todayStr,
      };
    }
    case 'Sold': {
      return {
        status: 'Sold',
        quantityAvailable: 0,
        lastUpdated: todayStr,
      };
    }
    default:
      return { status: newStatus, lastUpdated: todayStr };
  }
}

/**
 * Pure function that applies bulk updates to a single lot and returns a new NurseryLot object.
 */
export function applyBulkUpdatesToLot(
  lot: NurseryLot,
  options: BulkUpdateOptions
): NurseryLot {
  const updatedPrice =
    options.priceOption === 'keep'
      ? lot.unitPriceMAD
      : calculateBulkPriceUpdate(
          lot.unitPriceMAD,
          options.priceOption,
          options.priceOption === 'fixed'
            ? options.fixedPriceMAD
            : options.percentageAdjustment
        );

  const statusUpdates =
    options.statusOption === 'update' && options.newStatus
      ? calculateBulkStatusUpdate(lot, options.newStatus)
      : {};

  return {
    ...lot,
    unitPriceMAD: updatedPrice,
    ...statusUpdates,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

export type NurserySubRubrique = 'arboricole' | 'maraicher' | 'ornementale';

/**
 * Classifies a nursery lot into one of the 3 canonical nursery rubriques:
 * a. Arboricole (Arbres fruitiers, oliviers, agrumes, amandiers, arganier...)
 * b. Maraîcher (Plants maraîchers, tomate, poivron, pastèque, oignon...)
 * c. Ornementale (Plantes ornementales, palmiers, bougainvilliers, lauriers, gazon...)
 */
export function classifyNurseryLot(lot: {
  category?: string;
  species?: string;
  variety?: string;
  ornamentalDetails?: any;
}): NurserySubRubrique {
  const cat = (lot.category || '').toLowerCase();
  const spec = (lot.species || '').toLowerCase();
  const varStr = (lot.variety || '').toLowerCase();
  const combined = `${cat} ${spec} ${varStr}`;

  // 1. Ornementale (priorité si attributs ornementaux ou mots-clés paysagers/ornementaux)
  if (
    lot.ornamentalDetails ||
    cat.includes('ornement') ||
    combined.includes('ornement') ||
    combined.includes('bougainvill') ||
    combined.includes('laurier') ||
    combined.includes('gazon') ||
    combined.includes('cycas') ||
    combined.includes('yucca') ||
    combined.includes('espaces vert') ||
    combined.includes('cactée') ||
    combined.includes('succulente') ||
    combined.includes('agave') ||
    combined.includes('rosier') ||
    combined.includes('jasmin') ||
    combined.includes('ficus') ||
    combined.includes('haie') ||
    combined.includes('washingtonia')
  ) {
    return 'ornementale';
  }

  // 2. Maraîcher (plants de légumes, maraîchage, tomate, poivron, pastèque, oignon...)
  if (
    cat.includes('maraîch') ||
    cat.includes('maraich') ||
    cat.includes('légume') ||
    cat.includes('legume') ||
    combined.includes('maraîch') ||
    combined.includes('maraich') ||
    combined.includes('tomate') ||
    combined.includes('poivron') ||
    combined.includes('piment') ||
    combined.includes('pastèque') ||
    combined.includes('pasteque') ||
    combined.includes('melon') ||
    combined.includes('oignon') ||
    combined.includes('aubergine') ||
    combined.includes('courgette') ||
    combined.includes('concombre') ||
    combined.includes('salade') ||
    combined.includes('laitue') ||
    combined.includes('chou')
  ) {
    return 'maraicher';
  }

  // 3. Arboricole (arbres fruitiers, agrumes, oliviers, amandiers, arganiers, etc.)
  return 'arboricole';
}

export const NURSERY_RUBRIQUES: {
  id: NurserySubRubrique;
  key: 'a' | 'b' | 'c';
  labelFr: string;
  labelAr: string;
  labelEn: string;
  badge: string;
  icon: string;
}[] = [
  {
    id: 'arboricole',
    key: 'a',
    labelFr: 'a. Arboricole',
    labelAr: 'أ. أشجار مثمرة',
    labelEn: 'a. Fruit Trees / Arboriculture',
    badge: 'Arbres Fruitiers, Agrumes, Oliviers',
    icon: '🌳',
  },
  {
    id: 'maraicher',
    key: 'b',
    labelFr: 'b. Maraîcher',
    labelAr: 'ب. شتلات الخضروات',
    labelEn: 'b. Vegetable / Market Gardening',
    badge: 'Plants Maraîchers & Légumes',
    icon: '🍅',
  },
  {
    id: 'ornementale',
    key: 'c',
    labelFr: 'c. Ornementale',
    labelAr: 'ج. نباتات الزينة',
    labelEn: 'c. Ornamental & Green Spaces',
    badge: 'Plantes Ornementales, Palmiers, Gazon',
    icon: '🌺',
  },
];

