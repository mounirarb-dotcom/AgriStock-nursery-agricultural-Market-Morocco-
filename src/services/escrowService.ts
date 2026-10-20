import { EscrowTransaction, EscrowTransactionStatus } from '../types';

export const ESCROW_COMMISSION_RATE = 0.05; // 5%

export interface EscrowCalculation {
  subtotalMAD: number;
  commissionMAD: number;
  totalWithEscrowMAD: number;
  carrierFeeMAD: number;
}

export const escrowService = {
  calculateEscrow(amountMAD: number, carrierFeeMAD: number = 0): EscrowCalculation {
    const subtotalMAD = Math.max(0, amountMAD);
    const commissionMAD = Math.round(subtotalMAD * ESCROW_COMMISSION_RATE);
    const totalWithEscrowMAD = subtotalMAD + commissionMAD + carrierFeeMAD;

    return {
      subtotalMAD,
      commissionMAD,
      totalWithEscrowMAD,
      carrierFeeMAD,
    };
  },

  canTransitionStatus(current: EscrowTransactionStatus, next: EscrowTransactionStatus): boolean {
    const validTransitions: Record<EscrowTransactionStatus, EscrowTransactionStatus[]> = {
      funds_held: ['in_transit', 'disputed'],
      in_transit: ['delivered', 'disputed'],
      delivered: ['released', 'disputed'],
      released: [],
      disputed: ['released'],
    };

    return validTransitions[current]?.includes(next) ?? false;
  },

  getInspectionCode(txId: string): string {
    // Code de validation D3 à 6 chiffres
    let hash = 0;
    for (let i = 0; i < txId.length; i++) {
      hash = (hash << 5) - hash + txId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 900000 + 100000).toString();
  },
};
