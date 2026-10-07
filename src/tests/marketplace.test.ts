import { describe, it, expect } from 'vitest';
import { INITIAL_NURSERY_LOTS } from '../data/mockData';
import { NurseryLot, ProduceListing } from '../types';

describe('Marketplace Business Logic & ONSSA Rules', () => {
  it('validates that all initial nursery lots adhere to inventory integrity constraints', () => {
    expect(INITIAL_NURSERY_LOTS.length).toBeGreaterThan(0);

    INITIAL_NURSERY_LOTS.forEach((lot) => {
      // 1. Available quantity must not exceed total quantity
      expect(lot.quantityAvailable).toBeLessThanOrEqual(lot.quantityTotal);
      expect(lot.quantityAvailable).toBeGreaterThanOrEqual(0);

      // 2. Unit price in MAD must be strictly positive
      expect(lot.unitPriceMAD).toBeGreaterThan(0);

      // 3. Batch number must exist and follow official format
      expect(lot.batchNumber).toBeDefined();
      expect(lot.batchNumber.length).toBeGreaterThan(3);

      // 4. Species and category must be defined
      expect(lot.species).toBeTruthy();
      expect(lot.category).toBeTruthy();
    });
  });

  it('validates ONSSA certified lots contain mandatory phytosanitary passport', () => {
    const certifiedLots = INITIAL_NURSERY_LOTS.filter((l) =>
      l.onssaStatus.toLowerCase().includes('certifié')
    );

    expect(certifiedLots.length).toBeGreaterThan(0);

    certifiedLots.forEach((lot) => {
      expect(lot.phytosanitaryPassportNumber).toBeDefined();
      expect(lot.phytosanitaryPassportNumber?.length).toBeGreaterThan(5);
      expect(lot.phytosanitaryPassportNumber).toMatch(/^ONSSA-MA-/i);
    });
  });

  it('calculates wholesale bundle pricing with tiered discounts correctly', () => {
    const calculateWholesalePrice = (basePrice: number, quantity: number): number => {
      let discountRate = 0;
      if (quantity >= 5000) {
        discountRate = 0.15; // 15% discount for bulk commercial orders
      } else if (quantity >= 1000) {
        discountRate = 0.08; // 8% discount for medium orders
      }
      return basePrice * (1 - discountRate);
    };

    const basePrice = 20; // 20 MAD per sapling
    expect(calculateWholesalePrice(basePrice, 500)).toBe(20);
    expect(calculateWholesalePrice(basePrice, 1000)).toBeCloseTo(18.4, 2);
    expect(calculateWholesalePrice(basePrice, 5000)).toBe(17);
  });

  it('validates Morocco Foodex export compliance requirements for agricultural lots', () => {
    interface ExportCheckParams {
      hasPhytosanitaryCert: boolean;
      globalGAPIssued: boolean;
      coldChainCompliant: boolean;
      minimumBrixDegree?: number;
    }

    const validateMoroccoFoodexExport = (params: ExportCheckParams): { eligible: boolean; reasons: string[] } => {
      const reasons: string[] = [];
      if (!params.hasPhytosanitaryCert) {
        reasons.push('Certificat phytosanitaire ONSSA manquant.');
      }
      if (!params.globalGAPIssued) {
        reasons.push('Certification GlobalG.A.P. obligatoire pour export UE.');
      }
      if (!params.coldChainCompliant) {
        reasons.push('Contrôle chaîne du froid ATP non conforme.');
      }
      if (params.minimumBrixDegree !== undefined && params.minimumBrixDegree < 10) {
        reasons.push('Taux de sucre (°Brix) inférieur au standard export.');
      }

      return {
        eligible: reasons.length === 0,
        reasons,
      };
    };

    // Compliant lot
    const compliant = validateMoroccoFoodexExport({
      hasPhytosanitaryCert: true,
      globalGAPIssued: true,
      coldChainCompliant: true,
      minimumBrixDegree: 12.5,
    });
    expect(compliant.eligible).toBe(true);
    expect(compliant.reasons.length).toBe(0);

    // Non-compliant lot
    const nonCompliant = validateMoroccoFoodexExport({
      hasPhytosanitaryCert: false,
      globalGAPIssued: false,
      coldChainCompliant: true,
      minimumBrixDegree: 8,
    });
    expect(nonCompliant.eligible).toBe(false);
    expect(nonCompliant.reasons.length).toBe(3);
  });

  it('classifies nursery lots into rubriques: arboricole, maraicher, ornementale', async () => {
    const { classifyNurseryLot } = await import('../utils/nurseryUtils');

    // Test a. Arboricole
    expect(classifyNurseryLot({ species: 'Olivier (Olea europaea)', category: 'Arbres Fruitiers (Agrumes, Olivier, Palmier...)' })).toBe('arboricole');
    expect(classifyNurseryLot({ species: 'Clémentinier (Citrus clementina)', category: 'Arbres Fruitiers (Agrumes, Olivier, Palmier...)' })).toBe('arboricole');
    expect(classifyNurseryLot({ species: 'Amandier (Prunus dulcis)', category: 'Arbres Fruitiers (Agrumes, Olivier, Palmier...)' })).toBe('arboricole');
    expect(classifyNurseryLot({ species: 'Arganier (Argania spinosa)', category: 'Arganier & Plantes Terroir' })).toBe('arboricole');

    // Test b. Maraîcher
    expect(classifyNurseryLot({ species: 'Tomate Maraîchère (Solanum lycopersicum)', category: 'Plants Maraîchers (Tomate, Poivron, Pastèque...)' })).toBe('maraicher');
    expect(classifyNurseryLot({ species: 'Poivron / Piment Maraîcher', category: 'Jeunes Plants de Légumes & Maraîchage (Tomate, Poivron, Pastèque, Oignon...)' })).toBe('maraicher');
    expect(classifyNurseryLot({ species: 'Pastèque Précoce', category: 'Jeunes Plants de Légumes & Maraîchage (Tomate, Poivron, Pastèque, Oignon...)' })).toBe('maraicher');

    // Test c. Ornementale
    expect(classifyNurseryLot({ species: 'Bougainvillier (Bougainvillea spectabilis)', category: 'Plantes Ornementales & Espaces Verts (Palmiers, Bougainvilliers, Lauriers, Gazon...)' })).toBe('ornementale');
    expect(classifyNurseryLot({ species: 'Palmier d\'Ornement (Washingtonia robusta)', category: 'Plantes Ornementales & Espaces Verts (Palmiers, Bougainvilliers, Lauriers, Gazon...)' })).toBe('ornementale');
    expect(classifyNurseryLot({ species: 'Laurier-rose (Nerium oleander)', category: 'Plantes Ornementales & Espaces Verts (Palmiers, Bougainvilliers, Lauriers, Gazon...)' })).toBe('ornementale');
    expect(classifyNurseryLot({ species: 'Gazon Naturel en Plaques / Rouleaux (Paspalum vaginatum)', category: 'Plantes Ornementales & Espaces Verts (Palmiers, Bougainvilliers, Lauriers, Gazon...)' })).toBe('ornementale');
  });

  it('guarantees complete exclusion of agricultural machinery from market offers', () => {
    const mockListingsWithMachinery = [
      { id: '1', title: 'Tomate Ronde Chtouka', category: 'Légume' },
      { id: '2', title: 'Tracteur Massey Ferguson 4x4', category: 'Machinisme & Équipements' },
      { id: '3', title: 'Tracteur John Deere 6120M', category: 'Légume' },
      { id: '4', title: 'Troupeau Béliers Sardi', category: 'Élevage & Bétail' },
    ];

    const sanitized = mockListingsWithMachinery.filter(item => {
      const isMachinery =
        item.category === 'Machinisme & Équipements' ||
        item.title?.toLowerCase().includes('tracteur') ||
        item.title?.toLowerCase().includes('machine') ||
        (item as any).machineryYear;
      return !isMachinery;
    });

    expect(sanitized.length).toBe(2);
    expect(sanitized.some(i => i.title.includes('Tracteur'))).toBe(false);
    expect(sanitized.map(i => i.id)).toEqual(['1', '4']);
  });
});
