import { ProduceListing, FarmStandingListing } from '../types';

export const marketService = {
  filterListings(
    listings: ProduceListing[],
    query: string,
    category?: string,
    region?: string
  ): ProduceListing[] {
    const q = query.trim().toLowerCase();

    return listings.filter((item) => {
      if (category && category !== 'ALL' && item.category !== category) return false;
      if (region && region !== 'ALL' && item.region !== region) return false;
      if (!q) return true;

      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const varietyMatch = (item.variety || '').toLowerCase().includes(q);
      const regionMatch = (item.region || '').toLowerCase().includes(q);

      return titleMatch || varietyMatch || regionMatch;
    });
  },

  calculateBenchmarkComparison(
    priceMAD: number,
    benchmarkMAD: number
  ): { diffMAD: number; diffPercent: number; isAdvantageous: boolean } {
    if (!benchmarkMAD || benchmarkMAD <= 0) {
      return { diffMAD: 0, diffPercent: 0, isAdvantageous: false };
    }
    const diffMAD = priceMAD - benchmarkMAD;
    const diffPercent = Math.round((diffMAD / benchmarkMAD) * 100);
    const isAdvantageous = diffMAD < 0;

    return { diffMAD, diffPercent, isAdvantageous };
  },

  reserveStock(
    currentAvailable: number,
    requestedQuantity: number
  ): { success: boolean; newAvailable: number; reservedQuantity: number; error?: string } {
    if (requestedQuantity <= 0) {
      return { success: false, newAvailable: currentAvailable, reservedQuantity: 0, error: 'Quantité invalide' };
    }
    if (requestedQuantity > currentAvailable) {
      return { success: false, newAvailable: currentAvailable, reservedQuantity: 0, error: 'Stock disponible insuffisant' };
    }

    return {
      success: true,
      newAvailable: currentAvailable - requestedQuantity,
      reservedQuantity: requestedQuantity,
    };
  },
};
