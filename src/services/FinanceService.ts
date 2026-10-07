/**
 * FinanceService.ts
 * 
 * Service financier centralisé pour AgriStock Maroc.
 * Gère de manière unique et cohérente l'ensemble des calculs :
 * - Marchandise (Sous-total) : quantité × prix unitaire
 * - Frais séquestre & ONSSA : 1,5 % (Protection bancaire CMI / Stripe & vérification conformité)
 * - Commission AgriStock : 5,0 % (standard) ou 3,5 % (vendeur PRO / coopérative agréée)
 * - Total payé par l'acheteur : Marchandise + Frais séquestre
 * - Net vendeur : Marchandise - Commission AgriStock
 * - Commission transport / logistique : 8,0 %
 */

export const ESCROW_GUARANTEE_RATE = 0.015; // 1.5% Frais séquestre & vérification ONSSA
export const DEFAULT_COMMISSION_RATE = 0.05; // 5.0% Commission standard
export const PRO_COMMISSION_RATE = 0.035; // 3.5% Commission profil Pro Certifié
export const LOGISTICS_COMMISSION_RATE = 0.08; // 8.0% Apporteur d'affaires fret

export interface FinancialCalculationInput {
  quantity: number;
  unitPriceMAD: number;
  isProCertified?: boolean;
  customCommissionRate?: number;
}

export interface FinancialBreakdown {
  quantity: number;
  unitPriceMAD: number;
  subtotalAmountMAD: number;       // Marchandise (ex: 1 000 MAD)
  escrowRate: number;              // 0.015 (1,5 %)
  escrowGuaranteeFeeMAD: number;   // Frais séquestre & ONSSA (ex: 15 MAD)
  commissionRate: number;          // 0.05 (5 %) ou 0.035 (3,5 %)
  platformCommissionMAD: number;  // Commission AgriStock (ex: 50 MAD)
  totalPaidByBuyerMAD: number;    // Total payé par l'acheteur (ex: 1 015 MAD)
  sellerPayoutAmountMAD: number;  // Net vendeur (ex: 950 MAD)
}

export interface LogisticsFinancialBreakdown {
  estimatedPriceMAD: number;
  commissionRate: number;
  platformCommissionMAD: number;
  carrierPayoutMAD: number;
}

/**
 * Arrondi financier standard à 2 décimales ou entier si rond
 */
export function roundFinancial(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Formate un montant en Dirhams marocains (MAD)
 */
export function formatMAD(amount: number): string {
  const isInt = Number.isInteger(amount);
  return (
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: isInt ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MAD'
  );
}

export class FinanceService {
  public static readonly ESCROW_GUARANTEE_RATE = ESCROW_GUARANTEE_RATE;
  public static readonly DEFAULT_COMMISSION_RATE = DEFAULT_COMMISSION_RATE;
  public static readonly PRO_COMMISSION_RATE = PRO_COMMISSION_RATE;
  public static readonly LOGISTICS_COMMISSION_RATE = LOGISTICS_COMMISSION_RATE;

  /**
   * Obtient le taux de commission applicable au vendeur
   */
  public static getCommissionRate(isProCertified = false, customRate?: number): number {
    if (typeof customRate === 'number') return customRate;
    return isProCertified ? PRO_COMMISSION_RATE : DEFAULT_COMMISSION_RATE;
  }

  /**
   * Calcul complet d'une transaction séquestre
   * Formule standardisée :
   * - Marchandise = Qté × Prix unitaire
   * - Frais séquestre = Marchandise × 1.5%
   * - Commission AgriStock = Marchandise × Taux (5% ou 3.5%)
   * - Total payé par l'acheteur = Marchandise + Frais séquestre
   * - Net vendeur = Marchandise - Commission AgriStock
   */
  public static calculateEscrowBreakdown({
    quantity,
    unitPriceMAD,
    isProCertified = false,
    customCommissionRate,
  }: FinancialCalculationInput): FinancialBreakdown {
    const safeQty = Math.max(0, Number(quantity) || 0);
    const safePrice = Math.max(0, Number(unitPriceMAD) || 0);

    // 1. Marchandise
    const subtotalAmountMAD = roundFinancial(safeQty * safePrice);

    // 2. Taux de commission
    const commissionRate = this.getCommissionRate(isProCertified, customCommissionRate);

    // 3. Frais séquestre & ONSSA (1.5% exact, sans plancher artificiel créant des incohérences)
    const escrowRate = ESCROW_GUARANTEE_RATE;
    const escrowGuaranteeFeeMAD = roundFinancial(subtotalAmountMAD * escrowRate);

    // 4. Commission AgriStock
    const platformCommissionMAD = roundFinancial(subtotalAmountMAD * commissionRate);

    // 5. Total payé par l'acheteur
    const totalPaidByBuyerMAD = roundFinancial(subtotalAmountMAD + escrowGuaranteeFeeMAD);

    // 6. Net reversé au vendeur
    const sellerPayoutAmountMAD = roundFinancial(subtotalAmountMAD - platformCommissionMAD);

    return {
      quantity: safeQty,
      unitPriceMAD: safePrice,
      subtotalAmountMAD,
      escrowRate,
      escrowGuaranteeFeeMAD,
      commissionRate,
      platformCommissionMAD,
      totalPaidByBuyerMAD,
      sellerPayoutAmountMAD,
    };
  }

  /**
   * Calcul des flux financiers du transport / logistique
   */
  public static calculateLogisticsBreakdown(estimatedPriceMAD: number): LogisticsFinancialBreakdown {
    const safePrice = Math.max(0, Number(estimatedPriceMAD) || 0);
    const platformCommissionMAD = roundFinancial(safePrice * LOGISTICS_COMMISSION_RATE);
    const carrierPayoutMAD = roundFinancial(safePrice - platformCommissionMAD);

    return {
      estimatedPriceMAD: safePrice,
      commissionRate: LOGISTICS_COMMISSION_RATE,
      platformCommissionMAD,
      carrierPayoutMAD,
    };
  }

  public static formatMAD(amount: number): string {
    return formatMAD(amount);
  }

  public static roundFinancial(amount: number): number {
    return roundFinancial(amount);
  }
}

// Export par commodité pour déstructuration directe
export const calculateFinancialBreakdown = (input: FinancialCalculationInput) =>
  FinanceService.calculateEscrowBreakdown(input);

export default FinanceService;
