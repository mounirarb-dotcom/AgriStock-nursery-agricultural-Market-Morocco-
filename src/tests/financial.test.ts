import { describe, it, expect } from 'vitest';
import { FinanceService, formatMAD, roundFinancial } from '../services/FinanceService';

describe('FinanceService Business Logic', () => {
  it('correctly calculates subtotal, escrow fee, and buyer total for standard sellers', () => {
    // 100 units at 50 MAD = 5,000 MAD subtotal
    const breakdown = FinanceService.calculateEscrowBreakdown({
      quantity: 100,
      unitPriceMAD: 50,
      isProCertified: false,
    });

    expect(breakdown.subtotalAmountMAD).toBe(5000);
    // Escrow rate = 1.5% -> 5000 * 0.015 = 75 MAD
    expect(breakdown.escrowGuaranteeFeeMAD).toBe(75);
    // Total paid by buyer = 5000 + 75 = 5075 MAD
    expect(breakdown.totalPaidByBuyerMAD).toBe(5075);
    // Standard commission = 5% -> 5000 * 0.05 = 250 MAD
    expect(breakdown.platformCommissionMAD).toBe(250);
    // Net seller payout = 5000 - 250 = 4750 MAD
    expect(breakdown.sellerPayoutAmountMAD).toBe(4750);
  });

  it('applies reduced commission rate for PRO certified sellers', () => {
    // 200 units at 100 MAD = 20,000 MAD
    const breakdown = FinanceService.calculateEscrowBreakdown({
      quantity: 200,
      unitPriceMAD: 100,
      isProCertified: true,
    });

    expect(breakdown.subtotalAmountMAD).toBe(20000);
    // Pro commission rate = 3.5% -> 20000 * 0.035 = 700 MAD
    expect(breakdown.commissionRate).toBe(0.035);
    expect(breakdown.platformCommissionMAD).toBe(700);
    expect(breakdown.sellerPayoutAmountMAD).toBe(19300);
  });

  it('safely handles zero and negative quantities or prices', () => {
    const zeroBreakdown = FinanceService.calculateEscrowBreakdown({
      quantity: -10,
      unitPriceMAD: -25,
    });

    expect(zeroBreakdown.quantity).toBe(0);
    expect(zeroBreakdown.unitPriceMAD).toBe(0);
    expect(zeroBreakdown.subtotalAmountMAD).toBe(0);
    expect(zeroBreakdown.totalPaidByBuyerMAD).toBe(0);
  });

  it('formats MAD currency accurately', () => {
    const formatted = formatMAD(1500);
    expect(formatted).toContain('1');
    expect(formatted).toContain('500');
    expect(formatted).toContain('MAD');
  });

  it('properly rounds financial amounts to two decimal places', () => {
    expect(roundFinancial(123.456)).toBe(123.46);
    expect(roundFinancial(123.454)).toBe(123.45);
  });
});
