import { describe, it, expect } from 'vitest';
import { NurseryLot } from '../types';
import {
  getLotStockStatus,
  calculateBulkPriceUpdate,
  calculateBulkStatusUpdate,
  applyBulkUpdatesToLot,
} from '../utils/nurseryUtils';

const mockLot1: NurseryLot = {
  id: 'lot-test-01',
  batchNumber: 'LOT-2026-OLV-001',
  species: 'Olivier (Olea europaea)',
  variety: 'Picholine Marocaine',
  category: 'Arbres Fruitiers (Agrumes, Olivier, Palmier...)',
  propagationMethod: 'Greffage',
  stage: 'Prêt à la plantation (Commercialisable)',
  quantityTotal: 2500,
  quantityAvailable: 2500,
  quantityReserved: 0,
  unitPriceMAD: 20.0,
  containerType: 'Conteneur 3L',
  greenhouseLocation: 'Serre 1',
  seedingOrGraftDate: '2024-03-01',
  estimatedReadyDate: '2025-10-01',
  onssaStatus: 'ONSSA Certifié (Catégorie Bleue)',
  phytosanitaryPassportNumber: 'ONSSA-MA-2026-PP-1001',
  healthStatus: 'Excellent',
  region: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
  treatments: [],
  lastUpdated: '2026-01-01',
};

const mockLot2: NurseryLot = {
  ...mockLot1,
  id: 'lot-test-02',
  batchNumber: 'LOT-2026-CIT-002',
  species: 'Clémentinier (Citrus clementina)',
  variety: 'Nadorcott / Afourer',
  unitPriceMAD: 35.0,
  quantityTotal: 1000,
  quantityAvailable: 0,
  quantityReserved: 1000,
  status: 'Reserved',
};

const mockLot3: NurseryLot = {
  ...mockLot1,
  id: 'lot-test-03',
  batchNumber: 'LOT-2026-ORN-003',
  species: 'Palmier Washingtonia',
  variety: 'Washingtonia robusta',
  unitPriceMAD: 120.0,
  quantityTotal: 200,
  quantityAvailable: 0,
  quantityReserved: 0,
  status: 'Sold',
};

describe('Nursery Bulk Editing Business Logic & Calculations', () => {
  it('correctly detects and resolves lot stock status', () => {
    // Explicit status
    expect(getLotStockStatus(mockLot1)).toBe('In Stock');
    expect(getLotStockStatus(mockLot2)).toBe('Reserved');
    expect(getLotStockStatus(mockLot3)).toBe('Sold');

    // Inferred when status property is absent
    const lotWithoutStatus = { ...mockLot1, status: undefined };
    expect(getLotStockStatus(lotWithoutStatus)).toBe('In Stock');

    const lotSoldWithoutStatus = { ...mockLot1, status: undefined, quantityAvailable: 0, quantityReserved: 0 };
    expect(getLotStockStatus(lotSoldWithoutStatus)).toBe('Sold');

    const lotReservedWithoutStatus = { ...mockLot1, status: undefined, quantityAvailable: 0, quantityReserved: 500 };
    expect(getLotStockStatus(lotReservedWithoutStatus)).toBe('Reserved');
  });

  it('calculates fixed price updates correctly across multiple lots', () => {
    const updatedPrice = calculateBulkPriceUpdate(mockLot1.unitPriceMAD, 'fixed', 28.5);
    expect(updatedPrice).toBe(28.5);

    // Negative or zero fixed prices are clamped to minimum safe value
    const zeroPrice = calculateBulkPriceUpdate(mockLot1.unitPriceMAD, 'fixed', 0);
    expect(zeroPrice).toBeGreaterThan(0);
  });

  it('calculates percentage price adjustments (markups and discounts)', () => {
    // 10% increase on 20 MAD -> 22 MAD
    const pricePlus10 = calculateBulkPriceUpdate(20.0, 'percentage', 10);
    expect(pricePlus10).toBe(22.0);

    // 15% discount on 20 MAD -> 17 MAD
    const priceMinus15 = calculateBulkPriceUpdate(20.0, 'percentage', -15);
    expect(priceMinus15).toBe(17.0);

    // Decimal rounding precision
    const priceWithDecimals = calculateBulkPriceUpdate(33.33, 'percentage', 5);
    expect(priceWithDecimals).toBe(35.0);
  });

  it('updates lot stock status to "Reserved" and adjusts inventory quantities', () => {
    const updates = calculateBulkStatusUpdate(mockLot1, 'Reserved');
    expect(updates.status).toBe('Reserved');
    expect(updates.quantityAvailable).toBe(0);
    expect(updates.quantityReserved).toBe(mockLot1.quantityTotal);
  });

  it('updates lot stock status to "Sold" and zeros available inventory', () => {
    const updates = calculateBulkStatusUpdate(mockLot1, 'Sold');
    expect(updates.status).toBe('Sold');
    expect(updates.quantityAvailable).toBe(0);
  });

  it('restores stock availability when lot status is changed back to "In Stock"', () => {
    // Lot was previously sold with 0 available
    const updates = calculateBulkStatusUpdate(mockLot3, 'In Stock');
    expect(updates.status).toBe('In Stock');
    expect(updates.quantityAvailable).toBe(mockLot3.quantityTotal);
  });

  it('simultaneously updates price and status on multiple lots with applyBulkUpdatesToLot', () => {
    const lots = [mockLot1, mockLot2, mockLot3];

    // Bulk operation: Set price to 45 MAD and status to 'In Stock'
    const bulkResults = lots.map((lot) =>
      applyBulkUpdatesToLot(lot, {
        priceOption: 'fixed',
        fixedPriceMAD: 45.0,
        statusOption: 'update',
        newStatus: 'In Stock',
      })
    );

    expect(bulkResults.length).toBe(3);
    bulkResults.forEach((lot) => {
      expect(lot.unitPriceMAD).toBe(45.0);
      expect(lot.status).toBe('In Stock');
      expect(lot.quantityAvailable).toBeGreaterThan(0);
      expect(lot.lastUpdated).toBe(new Date().toISOString().split('T')[0]);
    });
  });

  it('allows updating price only while keeping individual statuses untouched', () => {
    const updated = applyBulkUpdatesToLot(mockLot2, {
      priceOption: 'percentage',
      percentageAdjustment: 20, // +20% on 35 MAD = 42 MAD
      statusOption: 'keep',
    });

    expect(updated.unitPriceMAD).toBe(42.0);
    expect(updated.status).toBe('Reserved'); // Kept intact
  });

  it('allows updating status only while keeping individual prices untouched', () => {
    const updated = applyBulkUpdatesToLot(mockLot1, {
      priceOption: 'keep',
      statusOption: 'update',
      newStatus: 'Sold',
    });

    expect(updated.unitPriceMAD).toBe(20.0); // Kept intact
    expect(updated.status).toBe('Sold');
    expect(updated.quantityAvailable).toBe(0);
  });
});
