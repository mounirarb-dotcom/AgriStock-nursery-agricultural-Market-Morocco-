import { NurseryLot } from '../types';

export interface GrowthDataPoint {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "15 Jan"
  heightCm: number;
  collarDiameterMm: number;
  vigorScore: number; // 0 to 100%
  stockAvailable: number;
  stockReserved: number;
  cumulativeSales: number;
  weeklyOfftake: number; // units sold during that week
  inventoryValueMAD: number;
  eventNote?: string;
}

export interface LotTimeSeries {
  lotId: string;
  variety: string;
  species: string;
  category: string;
  color: string;
  points: GrowthDataPoint[];
}

export type TrendMetricKey = 'height' | 'stock' | 'sales' | 'diameter' | 'value';

export interface TrendMetricConfig {
  key: TrendMetricKey;
  label: string;
  unit: string;
  description: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

export const TREND_METRICS: Record<TrendMetricKey, TrendMetricConfig> = {
  height: {
    key: 'height',
    label: 'Croissance en Hauteur',
    unit: 'cm',
    description: 'Progression de la tige aérienne mesurée depuis le collet',
    color: '#059669', // emerald-600
    gradientFrom: '#10b981',
    gradientTo: '#047857',
  },
  stock: {
    key: 'stock',
    label: 'Disponibilité en Stock',
    unit: 'plants',
    description: 'Volume de plants sains actuellement disponibles à la commande',
    color: '#0284c7', // sky-600
    gradientFrom: '#38bdf8',
    gradientTo: '#0369a1',
  },
  sales: {
    key: 'sales',
    label: 'Déstockage & Ventes',
    unit: 'expédiés',
    description: 'Volume cumulé de plants livrés et sortis des serres',
    color: '#d97706', // amber-600
    gradientFrom: '#f59e0b',
    gradientTo: '#b45309',
  },
  diameter: {
    key: 'diameter',
    label: 'Diamètre au Collet',
    unit: 'mm',
    description: 'Épaisseur de la tige au niveau du substrat (robustesse)',
    color: '#7c3aed', // violet-600
    gradientFrom: '#a78bfa',
    gradientTo: '#6d28d9',
  },
  value: {
    key: 'value',
    label: 'Valorisation du Stock',
    unit: 'MAD',
    description: 'Valeur marchande globale du lot basée sur le tarif unitaire',
    color: '#0d9488', // teal-600
    gradientFrom: '#2dd4bf',
    gradientTo: '#0f766e',
  },
};

export const COLOR_PALETTE = [
  '#059669', // Emerald
  '#0284c7', // Sky blue
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#ea580c', // Orange
  '#4f46e5', // Indigo
];

/**
 * Generates realistic historical growth and stock trajectory for a given NurseryLot
 * based on its seeding/graft date, stage, current quantity, and price.
 */
export function generateLotGrowthTimeSeries(lot: NurseryLot, daysCount = 90, colorIdx = 0): LotTimeSeries {
  const points: GrowthDataPoint[] = [];
  const now = new Date();
  const stepDays = daysCount > 180 ? 7 : daysCount > 60 ? 3 : 1;
  const numSteps = Math.floor(daysCount / stepDays);

  // Target current metrics based on lot properties
  let baseTargetHeight = 45; // cm
  let baseTargetDiameter = 8.5; // mm
  let monthlyGrowthRate = 4.2; // cm/month

  // Parse height from ornamental or stage if available
  if (lot.ornamentalDetails?.plantHeight) {
    const match = lot.ornamentalDetails.plantHeight.match(/(\d+)/);
    if (match) baseTargetHeight = parseInt(match[1], 10);
  } else if (lot.stage.includes('Arbre adulte')) {
    baseTargetHeight = 180;
    baseTargetDiameter = 28;
    monthlyGrowthRate = 2.5;
  } else if (lot.stage.includes('Prêt')) {
    baseTargetHeight = 75;
    baseTargetDiameter = 12;
    monthlyGrowthRate = 4.5;
  } else if (lot.stage.includes('Élevage')) {
    baseTargetHeight = 45;
    baseTargetDiameter = 7.5;
    monthlyGrowthRate = 5.2;
  } else if (lot.stage.includes('Greffé')) {
    baseTargetHeight = 25;
    baseTargetDiameter = 5.0;
    monthlyGrowthRate = 6.0;
  } else if (lot.stage.includes('Repiquage')) {
    baseTargetHeight = 15;
    baseTargetDiameter = 3.5;
    monthlyGrowthRate = 7.0;
  } else {
    baseTargetHeight = 8;
    baseTargetDiameter = 2.0;
    monthlyGrowthRate = 8.0;
  }

  // Adjust for species
  if (lot.category.includes('Maraîch')) {
    baseTargetHeight = Math.min(baseTargetHeight, 25);
    baseTargetDiameter = 4;
    monthlyGrowthRate = 12;
  } else if (lot.species.includes('Palmier')) {
    baseTargetHeight = 120;
    baseTargetDiameter = 35;
    monthlyGrowthRate = 2;
  }

  const currentAvailable = lot.quantityAvailable;
  const currentReserved = lot.quantityReserved;
  const initialStock = Math.round(lot.quantityTotal * 1.15); // initial stock before recent sales
  const totalSoldSoFar = Math.max(0, initialStock - (currentAvailable + currentReserved));

  // Determine starting point daysCount ago
  for (let i = numSteps; i >= 0; i--) {
    const daysAgo = i * stepDays;
    const ptDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const progress = (numSteps - i) / numSteps; // 0 at start, 1 at today

    // S-curve logistic or smooth growth for height
    const growthBackFactor = Math.max(0.15, 1 - (daysAgo / 30) * (monthlyGrowthRate / baseTargetHeight));
    const rawHeight = baseTargetHeight * growthBackFactor;
    // Add realistic biological micro-fluctuation (+/- 1.5%)
    const heightVariance = (Math.sin(i * 1.3 + colorIdx) * 0.02) * baseTargetHeight;
    const heightCm = Math.max(2, Math.round((rawHeight + heightVariance) * 10) / 10);

    // Diameter correlation
    const diameterMm = Math.max(1, Math.round((baseTargetDiameter * Math.sqrt(growthBackFactor) + (Math.cos(i) * 0.1)) * 10) / 10);

    // Vigor score: normally 92-99% with slight drops during heatwaves or replanting
    const vigorScore = Math.min(100, Math.max(82, Math.round(95 + Math.sin(i * 0.7) * 3.5)));

    // Stock progression: stock starts high and gradually depletes with offtakes/sales
    // occasional restocks if seeded/transplanted
    const stockSoldFraction = Math.pow(progress, 1.2);
    const cumulativeSales = Math.round(totalSoldSoFar * stockSoldFraction);
    const stockAvailable = Math.max(currentAvailable, Math.round(initialStock - cumulativeSales - (currentReserved * progress)));
    const stockReserved = Math.round(currentReserved * Math.min(1, progress * 1.2));
    const weeklyOfftake = Math.round((totalSoldSoFar / (daysCount / 7)) * (0.7 + Math.sin(i * 0.9 + colorIdx) * 0.5));
    const inventoryValueMAD = Math.round(stockAvailable * lot.unitPriceMAD);

    let eventNote: string | undefined;
    if (i === Math.floor(numSteps * 0.75)) {
      eventNote = 'Fertigation NPK & Contrôle Phyto';
    } else if (i === Math.floor(numSteps * 0.4)) {
      eventNote = 'Taille de formation & Espacement serres';
    } else if (i === 0) {
      eventNote = 'Inventaire certifié ce jour';
    }

    const formattedDate = ptDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });

    points.push({
      date: ptDate,
      dateStr: ptDate.toISOString().split('T')[0],
      formattedDate,
      heightCm,
      collarDiameterMm: diameterMm,
      vigorScore,
      stockAvailable: i === 0 ? currentAvailable : stockAvailable,
      stockReserved: i === 0 ? currentReserved : stockReserved,
      cumulativeSales,
      weeklyOfftake: Math.max(0, weeklyOfftake),
      inventoryValueMAD: i === 0 ? currentAvailable * lot.unitPriceMAD : inventoryValueMAD,
      eventNote,
    });
  }

  const color = COLOR_PALETTE[colorIdx % COLOR_PALETTE.length];

  return {
    lotId: lot.id,
    variety: lot.variety,
    species: lot.species,
    category: lot.category,
    color,
    points,
  };
}

/**
 * Aggregates multiple lot time series into a global nursery summary trend
 */
export function aggregateNurseryTimeSeries(allSeries: LotTimeSeries[]): LotTimeSeries {
  if (allSeries.length === 0) {
    return {
      lotId: 'all',
      variety: 'Tous les Lots (Moyenne)',
      species: 'Ensemble Pépinière',
      category: 'Global',
      color: '#059669',
      points: [],
    };
  }

  const first = allSeries[0];
  const aggregatedPoints: GrowthDataPoint[] = [];

  for (let i = 0; i < first.points.length; i++) {
    const refPt = first.points[i];
    let totalHeight = 0;
    let totalDiameter = 0;
    let totalVigor = 0;
    let totalStockAvailable = 0;
    let totalStockReserved = 0;
    let totalCumulativeSales = 0;
    let totalWeeklyOfftake = 0;
    let totalInventoryValue = 0;

    allSeries.forEach(s => {
      const pt = s.points[i] || s.points[s.points.length - 1];
      totalHeight += pt.heightCm;
      totalDiameter += pt.collarDiameterMm;
      totalVigor += pt.vigorScore;
      totalStockAvailable += pt.stockAvailable;
      totalStockReserved += pt.stockReserved;
      totalCumulativeSales += pt.cumulativeSales;
      totalWeeklyOfftake += pt.weeklyOfftake;
      totalInventoryValue += pt.inventoryValueMAD;
    });

    const count = allSeries.length;
    aggregatedPoints.push({
      date: refPt.date,
      dateStr: refPt.dateStr,
      formattedDate: refPt.formattedDate,
      heightCm: Math.round((totalHeight / count) * 10) / 10,
      collarDiameterMm: Math.round((totalDiameter / count) * 10) / 10,
      vigorScore: Math.round(totalVigor / count),
      stockAvailable: totalStockAvailable,
      stockReserved: totalStockReserved,
      cumulativeSales: totalCumulativeSales,
      weeklyOfftake: totalWeeklyOfftake,
      inventoryValueMAD: totalInventoryValue,
      eventNote: refPt.eventNote,
    });
  }

  return {
    lotId: 'all',
    variety: 'Moyenne Globale Pépinière',
    species: `${allSeries.length} variétés surveillées`,
    category: 'Vue Consolidée',
    color: '#059669',
    points: aggregatedPoints,
  };
}
