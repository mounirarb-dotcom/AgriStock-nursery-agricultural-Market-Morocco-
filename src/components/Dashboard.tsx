import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Layers,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Scale,
  Building2,
  Zap,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';

// --- TYPES DE DONNÉES DU DASHBOARD ---
export type SectorFilter = 'ALL' | 'PRODUCE' | 'LIVESTOCK';
export type Timeframe = '7D' | '1M' | '3M' | '1Y';

export interface CommodityTrendDataPoint {
  date: string;
  tomate: number;
  pommeDeTerre: number;
  clementine: number;
  oignon: number;
  ovinSardi: number;
  bovinTadla: number;
  caprinAtlas: number;
  volumeTonnes: number;
  volumeBetes: number;
}

export interface RegionalDispersionPoint {
  region: string;
  shortName: string;
  produceAvgMAD: number; // MAD / kg
  livestockAvgMAD: number; // MAD / tête ou /10kg
  transactionCount: number;
}

export interface MarketDealLog {
  id: string;
  time: string;
  commodity: string;
  category: 'produce' | 'livestock';
  marketName: string;
  region: string;
  priceMAD: number;
  unit: string;
  variation: number;
  verified: boolean;
}

// --- MOCK INITIAL DATA ---
const INITIAL_HISTORICAL_DATA: CommodityTrendDataPoint[] = [
  { date: 'J-6', tomate: 5.2, pommeDeTerre: 3.4, clementine: 6.8, oignon: 3.1, ovinSardi: 3100, bovinTadla: 16500, caprinAtlas: 1750, volumeTonnes: 140, volumeBetes: 320 },
  { date: 'J-5', tomate: 5.5, pommeDeTerre: 3.5, clementine: 7.1, oignon: 3.3, ovinSardi: 3150, bovinTadla: 16600, caprinAtlas: 1780, volumeTonnes: 165, volumeBetes: 290 },
  { date: 'J-4', tomate: 5.8, pommeDeTerre: 3.6, clementine: 7.0, oignon: 3.2, ovinSardi: 3200, bovinTadla: 16750, caprinAtlas: 1800, volumeTonnes: 155, volumeBetes: 340 },
  { date: 'J-3', tomate: 6.1, pommeDeTerre: 3.5, clementine: 7.3, oignon: 3.0, ovinSardi: 3250, bovinTadla: 16800, caprinAtlas: 1820, volumeTonnes: 190, volumeBetes: 410 },
  { date: 'J-2', tomate: 5.9, pommeDeTerre: 3.7, clementine: 7.2, oignon: 3.4, ovinSardi: 3300, bovinTadla: 17000, caprinAtlas: 1810, volumeTonnes: 180, volumeBetes: 380 },
  { date: 'Hier', tomate: 6.2, pommeDeTerre: 3.6, clementine: 7.4, oignon: 3.5, ovinSardi: 3350, bovinTadla: 17100, caprinAtlas: 1830, volumeTonnes: 210, volumeBetes: 450 },
  { date: 'Aujourd\'hui', tomate: 6.4, pommeDeTerre: 3.8, clementine: 7.5, oignon: 3.6, ovinSardi: 3400, bovinTadla: 17200, caprinAtlas: 1850, volumeTonnes: 245, volumeBetes: 510 },
];

const INITIAL_REGIONAL_DISPERSION: RegionalDispersionPoint[] = [
  { region: 'Souss-Massa (Agadir, Chtouka)', shortName: 'Souss', produceAvgMAD: 6.4, livestockAvgMAD: 1850, transactionCount: 142 },
  { region: 'Casablanca - Settat & Doukkala', shortName: 'Casa-Settat', produceAvgMAD: 4.8, livestockAvgMAD: 3400, transactionCount: 188 },
  { region: 'Fès - Meknès (Saïss)', shortName: 'Fès-Meknès', produceAvgMAD: 4.2, livestockAvgMAD: 2900, transactionCount: 95 },
  { region: 'L\'Oriental (Berkane, Oujda)', shortName: 'Oriental', produceAvgMAD: 7.1, livestockAvgMAD: 3100, transactionCount: 78 },
  { region: 'Béni Mellal - Khénifra (Tadla)', shortName: 'Tadla', produceAvgMAD: 4.5, livestockAvgMAD: 17200, transactionCount: 110 },
  { region: 'Marrakech - Safi (Haouz)', shortName: 'Marrakech', produceAvgMAD: 5.9, livestockAvgMAD: 2200, transactionCount: 124 },
];

const INITIAL_RECENT_DEALS: MarketDealLog[] = [
  { id: 'deal-01', time: '10:42', commodity: 'Tomates Rondes Primeurs', category: 'produce', marketName: 'Marché de Gros d\'Inezgane', region: 'Souss-Massa', priceMAD: 6.4, unit: 'MAD / kg', variation: 3.2, verified: true },
  { id: 'deal-02', time: '10:38', commodity: 'Béliers Sardi Extra', category: 'livestock', marketName: 'Souk Hebdomadaire de Settat', region: 'Casablanca-Settat', priceMAD: 3400, unit: 'MAD / tête', variation: 1.5, verified: true },
  { id: 'deal-03', time: '10:31', commodity: 'Pommes de Terre Spunta', category: 'produce', marketName: 'Marché de Gros de Casablanca', region: 'Casablanca-Settat', priceMAD: 3.8, unit: 'MAD / kg', variation: -0.8, verified: true },
  { id: 'deal-04', time: '10:25', commodity: 'Taurillons Croisés Tadla', category: 'livestock', marketName: 'Souk de Fkih Ben Salah', region: 'Béni Mellal - Khénifra', priceMAD: 17200, unit: 'MAD / bête', variation: 2.1, verified: true },
  { id: 'deal-05', time: '10:14', commodity: 'Clémentines Nadorcott', category: 'produce', marketName: 'Marché de Berkane', region: 'L\'Oriental', priceMAD: 7.5, unit: 'MAD / kg', variation: 1.9, verified: true },
  { id: 'deal-06', time: '09:58', commodity: 'Chèvres Noires de l\'Atlas', category: 'livestock', marketName: 'Souk du Haouz (Tahannaout)', region: 'Marrakech - Safi', priceMAD: 1850, unit: 'MAD / tête', variation: 0.5, verified: true },
];

export const Dashboard: React.FC = () => {
  const { language } = useApp();

  // État interactif
  const [sector, setSector] = useState<SectorFilter>('ALL');
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const [selectedCommodityKey, setSelectedCommodityKey] = useState<string>('tomate');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [lastTickTime, setLastTickTime] = useState<string>(() => new Date().toLocaleTimeString('fr-FR'));
  const [dataPoints, setDataPoints] = useState<CommodityTrendDataPoint[]>(INITIAL_HISTORICAL_DATA);
  const [recentDeals, setRecentDeals] = useState<MarketDealLog[]>(INITIAL_RECENT_DEALS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Simulation temps réel contrôlée (polling micro-variations)
  const simulateLiveTick = useCallback(() => {
    setDataPoints((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;

      // Micro variation aléatoire de -1.5% à +1.5%
      const jitter = (val: number, maxPercent = 0.02) => {
        const delta = (Math.random() * 2 - 1) * maxPercent;
        return Number((val * (1 + delta)).toFixed(2));
      };

      const updatedLast: CommodityTrendDataPoint = {
        ...last,
        tomate: jitter(last.tomate),
        pommeDeTerre: jitter(last.pommeDeTerre),
        clementine: jitter(last.clementine),
        oignon: jitter(last.oignon),
        ovinSardi: Math.round(jitter(last.ovinSardi, 0.01)),
        bovinTadla: Math.round(jitter(last.bovinTadla, 0.008)),
        caprinAtlas: Math.round(jitter(last.caprinAtlas, 0.015)),
        volumeTonnes: Math.round(last.volumeTonnes + (Math.random() * 4 - 2)),
      };

      return [...prev.slice(0, prev.length - 1), updatedLast];
    });

    setLastTickTime(new Date().toLocaleTimeString('fr-FR'));
  }, []);

  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(simulateLiveTick, 4000);
    return () => clearInterval(interval);
  }, [isLiveActive, simulateLiveTick]);

  // Rafraîchissement manuel
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    simulateLiveTick();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Liste des matières premières configurées
  const COMMODITIES_CONFIG = useMemo(() => [
    { key: 'tomate', name: 'Tomate Ronde Primeur', category: 'PRODUCE', unit: 'MAD / kg', color: '#10b981', region: 'Souss-Massa' },
    { key: 'pommeDeTerre', name: 'Pomme de Terre Spunta', category: 'PRODUCE', unit: 'MAD / kg', color: '#eab308', region: 'Casablanca-Settat' },
    { key: 'clementine', name: 'Clémentine Nadorcott', category: 'PRODUCE', unit: 'MAD / kg', color: '#f97316', region: 'L\'Oriental' },
    { key: 'oignon', name: 'Oignon Rouge Doux', category: 'PRODUCE', unit: 'MAD / kg', color: '#a855f7', region: 'Fès-Meknès' },
    { key: 'ovinSardi', name: 'Bélier Sardi Pur Race', category: 'LIVESTOCK', unit: 'MAD / tête', color: '#0284c7', region: 'Chaouia (Settat)' },
    { key: 'bovinTadla', name: 'Taurillon d\'Engraissement', category: 'LIVESTOCK', unit: 'MAD / bête', color: '#6366f1', region: 'Tadla (Fkih Ben Salah)' },
    { key: 'caprinAtlas', name: 'Chèvre Noire de l\'Atlas', category: 'LIVESTOCK', unit: 'MAD / tête', color: '#ec4899', region: 'Marrakech (Haouz)' },
  ], []);

  // Filtrage selon le secteur sélectionné
  const filteredCommodities = useMemo(() => {
    return COMMODITIES_CONFIG.filter((c) => {
      if (sector === 'ALL') return true;
      return c.category === sector;
    });
  }, [COMMODITIES_CONFIG, sector]);

  // Produit actif sélectionné pour le zoom
  const activeCommodity = useMemo(() => {
    return COMMODITIES_CONFIG.find((c) => c.key === selectedCommodityKey) || COMMODITIES_CONFIG[0];
  }, [COMMODITIES_CONFIG, selectedCommodityKey]);

  // Statistiques dérivées
  const latestPoint = dataPoints[dataPoints.length - 1] || INITIAL_HISTORICAL_DATA[0];
  const previousPoint = dataPoints[dataPoints.length - 2] || latestPoint;

  const activeCurrentPrice = (latestPoint as any)[activeCommodity.key] || 0;
  const activePreviousPrice = (previousPoint as any)[activeCommodity.key] || activeCurrentPrice;
  const activeDiff = activeCurrentPrice - activePreviousPrice;
  const activeDiffPercent = activePreviousPrice ? ((activeDiff / activePreviousPrice) * 100).toFixed(1) : '0.0';

  // Données de répartition pour le camembert
  const pieDistributionData = useMemo(() => [
    { name: 'Maraîchage & Légumes', value: 42, color: '#10b981' },
    { name: 'Agrumes & Fruits', value: 24, color: '#f97316' },
    { name: 'Ovins (Sardi & Timahdite)', value: 18, color: '#0284c7' },
    { name: 'Bovins (Tadla & Doukkala)', value: 11, color: '#6366f1' },
    { name: 'Caprins & Autres', value: 5, color: '#ec4899' },
  ], []);

  return (
    <div className="w-full space-y-6">
      {/* 1. EN-TÊTE DU DASHBOARD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{tr(language, 'Observatoire B2B National', 'المرصد الوطني للأسعار', 'National B2B Observatory')}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold">
              <Clock className="w-3 h-3 text-stone-500" />
              <span>{tr(language, 'Dernier tick :', 'آخر تحديث:', 'Last tick:')} {lastTickTime}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>{tr(language, 'Baromètre & Tendances des Cours (Primeurs & Bétail)', 'مؤشرات وتوجهات الأسعار (خضر، فواكه ومواشي)', 'Price Trends & Market Benchmark')}</span>
            <span className="text-sm">🇲🇦</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            {tr(
              language,
              'Visualisation analytique en temps réel des cours de gros marocains : primeurs maraîchers, agrumes et cheptel vif (ovins, bovins, caprins).',
              'لوحة قيادة تفاعلية ترصد أسعار الجملة لمنتجات الفلاحة وتربية المواشي بمختلف الأسواق المغربية.',
              'Real-time visualization of Moroccan wholesale produce and livestock prices across key regional souks.'
            )}
          </p>
        </div>

        {/* Boutons d'action et live toggle */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isLiveActive
                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-white animate-ping' : 'bg-stone-400'}`} />
            <span>{isLiveActive ? 'Flux Live Actif' : 'Flux en Pause'}</span>
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer border border-stone-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{tr(language, 'Actualiser', 'تحديث', 'Refresh')}</span>
          </button>
        </div>
      </div>

      {/* 2. FILTRES & SÉLECTEUR DE CATÉGORIES */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-200 text-xs">
        {/* Toggle Secteur */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setSector('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
              sector === 'ALL' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tr(language, 'Tous les Cours', 'جميع الأسعار', 'All Markets')}
          </button>
          <button
            type="button"
            onClick={() => setSector('PRODUCE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
              sector === 'PRODUCE' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tr(language, '🥦 Fruits & Légumes', 'خضر وفواكه', 'Fruits & Vegetables')}
          </button>
          <button
            type="button"
            onClick={() => setSector('LIVESTOCK')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
              sector === 'LIVESTOCK' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tr(language, '🐑 Bétail & Élevage', 'المواشي والحيوانات', 'Livestock & Animals')}
          </button>
        </div>

        {/* Sélecteur Période */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <span className="text-stone-400 font-semibold mr-1 hidden sm:inline">Période :</span>
          {(['7D', '1M', '3M', '1Y'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                timeframe === tf
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              {tf === '7D' ? '7 Jours' : tf === '1M' ? '1 Mois' : tf === '3M' ? '3 Mois' : '1 An'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CARTES KPI CLÉS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1 : Tomate Primeur */}
        <div
          onClick={() => setSelectedCommodityKey('tomate')}
          className={`p-4 rounded-2xl border transition cursor-pointer bg-white ${
            selectedCommodityKey === 'tomate'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
              : 'border-stone-200 hover:border-stone-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
            <span>Tomates Rondes</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Souss</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-stone-900">
            {latestPoint.tomate.toFixed(2)} <span className="text-xs font-semibold text-stone-500">MAD/kg</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+3.2% (24h)</span>
          </div>
        </div>

        {/* KPI 2 : Pomme de terre */}
        <div
          onClick={() => setSelectedCommodityKey('pommeDeTerre')}
          className={`p-4 rounded-2xl border transition cursor-pointer bg-white ${
            selectedCommodityKey === 'pommeDeTerre'
              ? 'border-yellow-600 ring-2 ring-yellow-500/20 shadow-sm'
              : 'border-stone-200 hover:border-stone-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
            <span>P. de Terre Spunta</span>
            <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Chaouia</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-stone-900">
            {latestPoint.pommeDeTerre.toFixed(2)} <span className="text-xs font-semibold text-stone-500">MAD/kg</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+1.8% (24h)</span>
          </div>
        </div>

        {/* KPI 3 : Ovin Sardi */}
        <div
          onClick={() => setSelectedCommodityKey('ovinSardi')}
          className={`p-4 rounded-2xl border transition cursor-pointer bg-white ${
            selectedCommodityKey === 'ovinSardi'
              ? 'border-sky-600 ring-2 ring-sky-500/20 shadow-sm'
              : 'border-stone-200 hover:border-stone-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
            <span>Béliers Sardi</span>
            <span className="text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded">Settat</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-stone-900">
            {latestPoint.ovinSardi.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-stone-500">MAD/tête</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+1.5% (24h)</span>
          </div>
        </div>

        {/* KPI 4 : Bovin Tadla */}
        <div
          onClick={() => setSelectedCommodityKey('bovinTadla')}
          className={`p-4 rounded-2xl border transition cursor-pointer bg-white ${
            selectedCommodityKey === 'bovinTadla'
              ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
              : 'border-stone-200 hover:border-stone-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
            <span>Taurillons Tadla</span>
            <span className="text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Fkih B. Salah</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-stone-900">
            {latestPoint.bovinTadla.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-stone-500">MAD/bête</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+0.9% (24h)</span>
          </div>
        </div>
      </div>

      {/* 4. GRAPHIQUE PRINCIPAL RECHARTS : TENDANCE DU COURS ZOOMÉ & VOLUME */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeCommodity.color }}
              />
              <h3 className="text-base sm:text-lg font-black text-stone-900">
                {activeCommodity.name}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {activeCommodity.region}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Historique d'évolution des prix sur les marchés de gros et souks de référence marocains.
            </p>
          </div>

          {/* Sélecteur de matière première à afficher */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCommodityKey}
              onChange={(e) => setSelectedCommodityKey(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <optgroup label="Fruits & Légumes">
                <option value="tomate">Tomate Ronde (Souss)</option>
                <option value="pommeDeTerre">Pomme de Terre Spunta (Chaouia)</option>
                <option value="clementine">Clémentine Nadorcott (Berkane)</option>
                <option value="oignon">Oignon Rouge Doux (Saïss)</option>
              </optgroup>
              <optgroup label="Bétail & Élevage">
                <option value="ovinSardi">Béliers Sardi (Settat)</option>
                <option value="bovinTadla">Taurillons Tadla (Fkih Ben Salah)</option>
                <option value="caprinAtlas">Chèvres Noires (Haouz)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Visualisation Recharts AreaChart */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActiveCommodity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeCommodity.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={activeCommodity.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const price = payload[0].value;
                    return (
                      <div className="bg-stone-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                        <p className="font-bold text-stone-300">{label}</p>
                        <p className="font-black text-sm text-emerald-400">
                          {price} {activeCommodity.unit}
                        </p>
                        <p className="text-[10px] text-stone-400">Cotation moyenne constatée</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={activeCommodity.key}
                stroke={activeCommodity.color}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorActiveCommodity)"
                name={activeCommodity.name}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Détail métrique sous le graphique */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
          <div className="p-2 rounded-xl bg-stone-50">
            <span className="text-[11px] text-stone-500 font-semibold block">Prix Actuel</span>
            <span className="text-sm font-black text-stone-900">{activeCurrentPrice} {activeCommodity.unit}</span>
          </div>
          <div className="p-2 rounded-xl bg-stone-50">
            <span className="text-[11px] text-stone-500 font-semibold block">Tendance 24h</span>
            <span className={`text-sm font-black ${Number(activeDiffPercent) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {Number(activeDiffPercent) >= 0 ? `+${activeDiffPercent}%` : `${activeDiffPercent}%`}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-stone-50">
            <span className="text-[11px] text-stone-500 font-semibold block">Marché Pilote</span>
            <span className="text-sm font-black text-stone-900">{activeCommodity.region}</span>
          </div>
        </div>
      </div>

      {/* 5. DEUXIÈME LIGNE ANALYTIQUE : DISPERSION RÉGIONALE (BAR CHART) + RÉPARTITION (PIE CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique Barres : Dispersion des Prix par Région */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Dispersion Régionale des Prix (Primeurs Maraîchers MAD/kg)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Comparatif des cours moyens départ marché de gros par bassin agricole.
              </p>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INITIAL_REGIONAL_DISPERSION} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} unit=" MAD" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as RegionalDispersionPoint;
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold text-stone-300">{data.region}</p>
                          <p className="font-black text-emerald-400">Cours moyen : {data.produceAvgMAD} MAD/kg</p>
                          <p className="text-stone-400">Transactions enregistrées : {data.transactionCount}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="produceAvgMAD" fill="#10b981" radius={[8, 8, 0, 0]} name="Prix Moyen (MAD/kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique Circulaire : Répartition des flux de transactions */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Volume des Échanges par Filière</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Part de marché des volumes transactés sur la plateforme.
            </p>
          </div>

          <div className="w-full h-52 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-stone-900 text-white p-2.5 rounded-xl shadow-md text-xs">
                          <p className="font-bold">{data.name}</p>
                          <p className="text-emerald-400 font-bold">{data.value}% du volume national</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Légende du camembert */}
          <div className="space-y-1.5 text-xs border-t border-stone-100 pt-3">
            {pieDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-stone-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-semibold">{item.name}</span>
                </span>
                <span className="font-bold text-stone-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. DERNIÈRES TRANSACTIONS & COTATIONS CONSTATÉES */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
          <div>
            <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-700" />
              <span>Carnet des Dernières Cotations Constatées en Direct</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Données collectées auprès des marchés de gros, souks hebdomadaires et déclarations certifiées AgriForex.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-bold">
                <th className="pb-2.5">Heure</th>
                <th className="pb-2.5">Filière / Matière</th>
                <th className="pb-2.5">Marché / Souk</th>
                <th className="pb-2.5">Région</th>
                <th className="pb-2.5 text-right">Cours Constaté</th>
                <th className="pb-2.5 text-right">Var. 24h</th>
                <th className="pb-2.5 text-center">Certification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-stone-50/80 transition">
                  <td className="py-2.5 font-bold text-stone-500">{deal.time}</td>
                  <td className="py-2.5 font-bold text-stone-900 flex items-center gap-1.5">
                    <span className="text-xs">
                      {deal.category === 'produce' ? '🥦' : '🐑'}
                    </span>
                    <span>{deal.commodity}</span>
                  </td>
                  <td className="py-2.5 text-stone-600 font-medium">{deal.marketName}</td>
                  <td className="py-2.5 text-stone-500">{deal.region}</td>
                  <td className="py-2.5 text-right font-black text-stone-900">
                    {deal.priceMAD.toLocaleString('fr-FR')} {deal.unit}
                  </td>
                  <td className="py-2.5 text-right font-bold">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${
                        deal.variation >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {deal.variation >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {deal.variation >= 0 ? `+${deal.variation}%` : `${deal.variation}%`}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>AgriForex</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
