/**
 * transactionNormalizer.ts
 * 
 * Fonction utilitaire de calcul et de normalisation des transactions d'achat.
 * Harmonise les prix unitaires, superficies, rendements et quantités
 * entre les données brutes des annonces (vergers sur pied, pépinières, bourse maraîchère)
 * et la feuille d'achat sous séquestre bancaire.
 */

import { FinancialBreakdown, FinanceService, roundFinancial, formatMAD } from '../services/FinanceService';

export type EscrowItemType = 'nursery_lot' | 'produce' | 'farm_standing';

export interface NormalizeTransactionOptions {
  itemType?: EscrowItemType | string;
  item: any;
  requestedQuantity?: number | string | null;
  isProCertified?: boolean;
  customCommissionRate?: number;
}

export interface PresetQuantityOption {
  label: string;
  value: number;
}

export interface NormalizedPurchaseTransaction {
  itemType: EscrowItemType;
  itemId: string;
  title: string;
  sellerName: string;
  sellerPhone: string;
  
  // Unités et labels normalisés
  unit: string;
  unitLabel: string;
  isSurface: boolean;

  // Tarification normalisée
  unitPriceMAD: number;
  formattedUnitPrice: string;

  // Disponibilité & Quantité
  availableQuantity: number;
  formattedAvailableQuantity: string;
  selectedQuantity: number;
  formattedSelectedQuantity: string;
  stepIncrement: number;

  // Spécificités agronomiques (Vergers / Récoltes sur pied)
  surfaceHectares?: number;
  estimatedYieldPerHaTonnes?: number;
  estimatedTotalYieldTonnes?: number;
  estimatedYieldForQuantityTonnes?: number;

  // Décomposition financière stricte
  financials: FinancialBreakdown;

  // Validation cohérente
  validation: {
    isOverMax: boolean;
    isZeroOrNegative: boolean;
    isValid: boolean;
    errorMessage?: string;
  };

  // Raccourcis de quantité prêts pour interface mobile
  presetQuantities: PresetQuantityOption[];
}

/**
 * Normalise l'ensemble des données d'une transaction avant affichage ou enregistrement.
 */
export function normalizePurchaseTransactionData({
  itemType: rawItemType,
  item,
  requestedQuantity,
  isProCertified = false,
  customCommissionRate,
}: NormalizeTransactionOptions): NormalizedPurchaseTransaction {
  const safeItem = item || {};

  // 1. Détection du type d'article
  let itemType: EscrowItemType = 'produce';
  if (
    rawItemType === 'farm_standing' ||
    rawItemType === 'standing_crop' ||
    typeof safeItem.surfaceHectares === 'number' ||
    typeof safeItem.pricePerHectareMAD === 'number'
  ) {
    itemType = 'farm_standing';
  } else if (
    rawItemType === 'nursery_lot' ||
    rawItemType === 'nursery' ||
    safeItem.species ||
    safeItem.variety && safeItem.nurseryName
  ) {
    itemType = 'nursery_lot';
  }

  const isSurface = itemType === 'farm_standing';

  // 2. Unités normalisées
  let unit = 'kg';
  let unitLabel = 'kg';

  if (isSurface) {
    unit = 'Hectares';
    unitLabel = 'ha';
  } else if (itemType === 'nursery_lot') {
    unit = safeItem.unit || 'Plants';
    unitLabel = unit.toLowerCase();
  } else {
    unit = safeItem.unit || 'Tonnes';
    unitLabel = unit === 'Tonnes' ? 'T' : unit.toLowerCase();
  }

  // 3. Normalisation stricte du prix unitaire en Dirhams (MAD)
  // Pour une récolte sur pied, le prix au forfait par hectare (ex: 32 000 MAD/ha) est prioritaire
  let unitPriceMAD = 0;
  if (isSurface) {
    const rawHaPrice = safeItem.pricePerHectareMAD ?? safeItem.pricePerUnitMAD ?? safeItem.pricePerUnit;
    unitPriceMAD = Math.max(0, Number(rawHaPrice) || 0);
  } else {
    const rawPrice =
      safeItem.pricePerUnitMAD ??
      safeItem.unitPriceMAD ??
      safeItem.pricePerUnit ??
      safeItem.priceMAD ??
      safeItem.estimatedTonnagePrice;
    unitPriceMAD = Math.max(0, Number(rawPrice) || 0);
  }
  unitPriceMAD = roundFinancial(unitPriceMAD);

  // 4. Normalisation de la quantité / superficie maximale disponible
  let availableQuantity = 1;
  if (isSurface) {
    const rawSurface = safeItem.surfaceHectares ?? safeItem.surface ?? safeItem.quantityAvailable;
    availableQuantity = Math.max(0.1, Number(rawSurface) || 1);
  } else {
    const rawQty = safeItem.quantityAvailable ?? safeItem.quantity ?? safeItem.estimatedTonnage;
    availableQuantity = Math.max(1, Number(rawQty) || 1);
  }
  // Arrondi à 1 décimale pour les hectares, entier pour les autres
  availableQuantity = isSurface
    ? Math.round(availableQuantity * 10) / 10
    : Math.round(availableQuantity);

  // 5. Calcul de la quantité sélectionnée
  let parsedRequestedQty: number | null = null;
  if (requestedQuantity !== undefined && requestedQuantity !== null && requestedQuantity !== '') {
    const n = Number(requestedQuantity);
    if (!isNaN(n)) {
      parsedRequestedQty = n;
    }
  }

  // Par défaut : toute la parcelle pour un verger (ou 1 si non spécifié), sinon max ou 1
  let selectedQuantity: number;
  if (parsedRequestedQty !== null) {
    selectedQuantity = parsedRequestedQty;
  } else {
    selectedQuantity = isSurface ? availableQuantity : Math.min(10, availableQuantity);
  }

  // 6. Agronomie et rendements estimés
  const surfaceHectares = isSurface ? availableQuantity : undefined;
  const estimatedYieldPerHaTonnes = safeItem.estimatedYieldPerHaTonnes
    ? Number(safeItem.estimatedYieldPerHaTonnes)
    : undefined;
  const estimatedTotalYieldTonnes = safeItem.estimatedTotalYieldTonnes
    ? Number(safeItem.estimatedTotalYieldTonnes)
    : estimatedYieldPerHaTonnes && surfaceHectares
    ? Math.round(surfaceHectares * estimatedYieldPerHaTonnes)
    : undefined;
  const estimatedYieldForQuantityTonnes =
    estimatedYieldPerHaTonnes && selectedQuantity > 0
      ? Math.round(selectedQuantity * estimatedYieldPerHaTonnes * 10) / 10
      : undefined;

  // 7. Décomposition financière unifiée (FinanceService)
  const safeFinancialQty = Math.max(0, selectedQuantity);
  const financials = FinanceService.calculateEscrowBreakdown({
    quantity: safeFinancialQty,
    unitPriceMAD,
    isProCertified,
    customCommissionRate,
  });

  // 8. Validation de cohérence
  const isOverMax = selectedQuantity > availableQuantity;
  const isZeroOrNegative = selectedQuantity <= 0;
  const isValid = !isOverMax && !isZeroOrNegative;

  let errorMessage: string | undefined;
  if (isOverMax) {
    errorMessage = isSurface
      ? `La superficie demandée (${selectedQuantity} Ha) dépasse les ${availableQuantity} Ha disponibles sur cette parcelle.`
      : `La quantité demandée dépasse le stock maximal disponible (${(availableQuantity || 0).toLocaleString('fr-FR')} ${unit}).`;
  } else if (isZeroOrNegative) {
    errorMessage = isSurface
      ? `Veuillez spécifier une superficie supérieure à 0 Ha.`
      : `Veuillez spécifier une quantité supérieure à 0.`;
  }

  // 9. Options prédéfinies (Preset buttons pour mobile)
  const presetQuantities: PresetQuantityOption[] = [];
  if (isSurface) {
    presetQuantities.push({ label: `Tout (${availableQuantity} Ha)`, value: availableQuantity });
    if (availableQuantity > 2) {
      const half = Math.round((availableQuantity / 2) * 10) / 10;
      presetQuantities.push({ label: `50% (${half} Ha)`, value: half });
    }
    if (availableQuantity > 1) {
      presetQuantities.push({ label: '1 Ha', value: 1 });
    }
  } else {
    presetQuantities.push({ label: `Tout (${(availableQuantity || 0).toLocaleString('fr-FR')} ${unitLabel})`, value: availableQuantity });
    if (availableQuantity >= 100) {
      presetQuantities.push({ label: `50% (${(Math.round(availableQuantity / 2) || 0).toLocaleString('fr-FR')})`, value: Math.round(availableQuantity / 2) });
    }
    presetQuantities.push({ label: `Min (1 ${unitLabel})`, value: 1 });
  }

  return {
    itemType,
    itemId: String(safeItem.id || ''),
    title: safeItem.title || safeItem.name || safeItem.cropType || 'Lot Agricole',
    sellerName: safeItem.sellerName || safeItem.nurseryName || safeItem.producerName || safeItem.farmName || 'Producteur Agricole',
    sellerPhone: safeItem.sellerPhone || safeItem.phone || safeItem.whatsapp || '+212 6 00 00 00 00',

    unit,
    unitLabel,
    isSurface,

    unitPriceMAD,
    formattedUnitPrice: `${formatMAD(unitPriceMAD)} / ${unitLabel}`,

    availableQuantity,
    formattedAvailableQuantity: `${(availableQuantity || 0).toLocaleString('fr-FR')} ${isSurface ? 'Ha' : unit}`,
    selectedQuantity,
    formattedSelectedQuantity: `${(selectedQuantity || 0).toLocaleString('fr-FR')} ${isSurface ? 'Ha' : unit}`,
    stepIncrement: isSurface ? 0.5 : 1,

    surfaceHectares,
    estimatedYieldPerHaTonnes,
    estimatedTotalYieldTonnes,
    estimatedYieldForQuantityTonnes,

    financials,

    validation: {
      isOverMax,
      isZeroOrNegative,
      isValid,
      errorMessage,
    },

    presetQuantities,
  };
}
