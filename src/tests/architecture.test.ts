import { describe, it, expect } from 'vitest';
import { escrowService, ESCROW_COMMISSION_RATE } from '../services/escrowService';
import { marketService } from '../services/marketService';
import { toastService } from '../services/toastService';
import { validateSchema, UserProfileSchema, NurseryLotSchema } from '../schemas';

describe('Architecture & Business Services Tests', () => {
  describe('EscrowService', () => {
    it('calculates 5% commission correctly for orders', () => {
      const result = escrowService.calculateEscrow(10000, 500);
      expect(result.subtotalMAD).toBe(10000);
      expect(result.commissionMAD).toBe(500); // 5% of 10000
      expect(result.totalWithEscrowMAD).toBe(11000); // 10000 + 500 + 500
      expect(result.carrierFeeMAD).toBe(500);
    });

    it('enforces valid status transitions in escrow lifecycle', () => {
      expect(escrowService.canTransitionStatus('funds_held', 'in_transit')).toBe(true);
      expect(escrowService.canTransitionStatus('funds_held', 'delivered')).toBe(false); // must pass in_transit
      expect(escrowService.canTransitionStatus('delivered', 'released')).toBe(true);
      expect(escrowService.canTransitionStatus('released', 'disputed')).toBe(false);
    });

    it('generates consistent 6-digit inspection code', () => {
      const code1 = escrowService.getInspectionCode('escrow-test-123');
      const code2 = escrowService.getInspectionCode('escrow-test-123');
      expect(code1).toBe(code2);
      expect(code1.length).toBe(6);
    });
  });

  describe('MarketService', () => {
    it('calculates benchmark differences and identifies advantageous prices', () => {
      const cheap = marketService.calculateBenchmarkComparison(8, 10);
      expect(cheap.diffMAD).toBe(-2);
      expect(cheap.diffPercent).toBe(-20);
      expect(cheap.isAdvantageous).toBe(true);

      const expensive = marketService.calculateBenchmarkComparison(12, 10);
      expect(expensive.diffMAD).toBe(2);
      expect(expensive.diffPercent).toBe(20);
      expect(expensive.isAdvantageous).toBe(false);
    });

    it('manages stock reservation safely without negative stock', () => {
      const success = marketService.reserveStock(100, 30);
      expect(success.success).toBe(true);
      expect(success.newAvailable).toBe(70);

      const overflow = marketService.reserveStock(50, 100);
      expect(overflow.success).toBe(false);
      expect(overflow.newAvailable).toBe(50);
    });
  });

  describe('Zod Schema Validation', () => {
    it('validates a valid Moroccan user profile', () => {
      const validProfile = {
        id: 'usr-42',
        role: 'seller',
        displayName: 'Mohamed Alami',
        phone: '0661234567',
        region: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
        hasCompletedIdentification: true,
      };

      const result = validateSchema(UserProfileSchema, validProfile);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid profile with short name or bad role', () => {
      const invalidProfile = {
        id: 'usr-42',
        role: 'invalid_role',
        displayName: 'M',
        phone: '123',
        region: 'Region Inconnue',
      };

      const result = validateSchema(UserProfileSchema, invalidProfile);
      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('ToastService', () => {
    it('notifies subscribers upon dispatching messages', () => {
      let receivedMsg = '';
      const unsubscribe = toastService.subscribe((toast) => {
        receivedMsg = toast.message;
      });

      toastService.success('Mise à jour réussie');
      expect(receivedMsg).toBe('Mise à jour réussie');

      unsubscribe();
    });
  });
});
