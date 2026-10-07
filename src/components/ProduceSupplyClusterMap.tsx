import React, { useState, useMemo } from 'react';
import { ProduceListing, MoroccanRegion, ProduceCategory } from '../types';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  MapPin,
  Truck,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Scale,
  Compass,
  ArrowRight,
  TrendingDown,
  Navigation,
  Eye,
  Filter,
  CheckCircle2,
  RefreshCw,
  Info,
  Maximize2,
  X,
  Phone,
  MessageCircle,
  Clock,
  Store,
} from 'lucide-react';

export interface BuyerDestinationHub {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  city: string;
  lat: number;
  lon: number;
  svgX: number;
  svgY: number;
}

export const BUYER_DESTINATION_HUBS: BuyerDestinationHub[] = [
  {
    id: 'casablanca',
    name: 'Casablanca (Marché de Gros Sidi Othmane & Port)',
    nameAr: 'الدار البيضاء (سوق الجملة سيدي عثمان والميناء)',
    nameEn: 'Casablanca (Sidi Othmane Wholesale Market & Port)',
    city: 'Casablanca',
    lat: 33.5731,
    lon: -7.5898,
    svgX: 350,
    svgY: 185,
  },
  {
    id: 'tanger_med',
    name: 'Tanger Med / Tanger (Hub Export & Détroit)',
    nameAr: 'طنجة المتوسط / طنجة (ميناء التصدير الدولي)',
    nameEn: 'Tanger Med / Tangier (Export Hub & Strait)',
    city: 'Tanger',
    lat: 35.7595,
    lon: -5.834,
    svgX: 435,
    svgY: 55,
  },
  {
    id: 'rabat',
    name: 'Rabat - Salé (Consommation & Plateforme GMS)',
    nameAr: 'الرباط - سلا (العاصمة والمراكز اللوجستية)',
    nameEn: 'Rabat - Salé (Capital Distribution Hub)',
    city: 'Rabat',
    lat: 34.0209,
    lon: -6.8416,
    svgX: 385,
    svgY: 155,
  },
  {
    id: 'marrakech',
    name: 'Marrakech (Marché de Gros & Plateforme Haouz)',
    nameAr: 'مراكش (سوق الجملة وسلاسل الفنادق والتموين)',
    nameEn: 'Marrakech (Haouz Wholesale & Hospitality)',
    city: 'Marrakech',
    lat: 31.6295,
    lon: -7.9811,
    svgX: 330,
    svgY: 285,
  },
  {
    id: 'agadir',
    name: 'Agadir / Inezgane (Premier Marché de Gros Primeurs)',
    nameAr: 'أكادير / إنزكان (سوق الجملة الأول للخضر والفواكه)',
    nameEn: 'Agadir / Inezgane (National Fresh Produce Hub)',
    city: 'Agadir',
    lat: 30.3622,
    lon: -9.5392,
    svgX: 255,
    svgY: 375,
  },
  {
    id: 'fes',
    name: 'Fès - Meknès (Marché Central Saïss)',
    nameAr: 'فاس - مكناس (سوق الجملة المركزي سايس)',
    nameEn: 'Fez - Meknes (Central Saiss Market)',
    city: 'Fès',
    lat: 34.0181,
    lon: -5.0078,
    svgX: 490,
    svgY: 160,
  },
  {
    id: 'oujda',
    name: 'Oujda / Berkane (Pôle Logistique Oriental)',
    nameAr: 'وجدة / بركان (القطب الفلاحي للشرق)',
    nameEn: 'Oujda / Berkane (Oriental Agro-Pole)',
    city: 'Oujda',
    lat: 34.6867,
    lon: -1.9114,
    svgX: 675,
    svgY: 125,
  },
];

interface RegionGeoMeta {
  region: MoroccanRegion;
  label: string;
  labelAr: string;
  hubCity: string;
  lat: number;
  lon: number;
  svgX: number;
  svgY: number;
  specialtyTag: string;
  specialtyTagAr: string;
  dominantIcon: string;
  soilType: string;
  irrigationType: string;
  roadDistanceMatrixKm: Record<string, number>; // Distance to buyer hubs in km
}

export const REGION_GEO_REGISTRY: Record<MoroccanRegion, RegionGeoMeta> = {
  'Souss-Massa (Agadir, Taroudant, Chtouka)': {
    region: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
    label: 'Souss-Massa (Chtouka • Agadir • Taroudant)',
    labelAr: 'سوس ماسة (شتوكة آيت باها • أكادير • تارودانت)',
    hubCity: 'Inezgane / Biougra',
    lat: 30.4278,
    lon: -9.5981,
    svgX: 255,
    svgY: 375,
    specialtyTag: 'Tomates primeurs sous serres, Agrumes & Pépinières',
    specialtyTagAr: 'طماطم مبكرة تحت البيوت المغطاة، حوامض وأركان',
    dominantIcon: '🍅',
    soilType: 'Sols sablo-limoneux de plaine',
    irrigationType: 'Goutte-à-goutte & Dessalement Chtouka',
    roadDistanceMatrixKm: {
      casablanca: 460,
      tanger_med: 820,
      rabat: 540,
      marrakech: 230,
      agadir: 20,
      fes: 690,
      oujda: 980,
    },
  },
  'L\'Oriental (Berkane, Oujda, Nador)': {
    region: 'L\'Oriental (Berkane, Oujda, Nador)',
    label: 'L\'Oriental (Berkane • Moulouya • Nador)',
    labelAr: 'الجهة الشرقية (بركان • ملوية • وجدة)',
    hubCity: 'Berkane / Plaine de la Moulouya',
    lat: 34.92,
    lon: -2.32,
    svgX: 675,
    svgY: 125,
    specialtyTag: 'Clémentines Nadorcott & Afourer, Agrumes & Vergers',
    specialtyTagAr: 'كلمنتين بركان ذو المؤشر الجغرافي، حوامض وزيتون',
    dominantIcon: '🍊',
    soilType: 'Alluvions riches de la Moulouya',
    irrigationType: 'Barrage Mohammed V & Réseau Moulouya',
    roadDistanceMatrixKm: {
      casablanca: 580,
      tanger_med: 390,
      rabat: 500,
      marrakech: 810,
      agadir: 1040,
      fes: 280,
      oujda: 60,
    },
  },
  'Gharb - Chrarda (Kénitra, Sidi Slimane)': {
    region: 'Gharb - Chrarda (Kénitra, Sidi Slimane)',
    label: 'Gharb - Chrarda (Kénitra • Sidi Slimane)',
    labelAr: 'الغرب - شراردة (القنيطرة • سيدي سليمان)',
    hubCity: 'Kénitra / Sidi Slimane',
    lat: 34.261,
    lon: -6.58,
    svgX: 410,
    svgY: 135,
    specialtyTag: 'Avocats Hass, Agrumes, Céréales & Maraîchage',
    specialtyTagAr: 'أفوكادو هاس، حوامض، فراولة وزراعات مسقية',
    dominantIcon: '🥑',
    soilType: 'Sols Tirs argilo-limoneux fertiles',
    irrigationType: 'Bassin du fleuve Sebou (Al Wahda)',
    roadDistanceMatrixKm: {
      casablanca: 135,
      tanger_med: 230,
      rabat: 45,
      marrakech: 375,
      agadir: 600,
      fes: 165,
      oujda: 445,
    },
  },
  'Fès - Meknès (Saïss, El Hajeb, Sefrou)': {
    region: 'Fès - Meknès (Saïss, El Hajeb, Sefrou)',
    label: 'Fès - Meknès (Plaine du Saïss • El Hajeb)',
    labelAr: 'فاس - مكناس (سهل سايس • الحاجب • صفرو)',
    hubCity: 'Meknès / Saïss',
    lat: 33.89,
    lon: -5.54,
    svgX: 490,
    svgY: 165,
    specialtyTag: 'Oignons, Pommes de terre, Rosacées fruitières & Vignes',
    specialtyTagAr: 'بصل سايس، بطاطس، تفاحيات وزيتون مكناس',
    dominantIcon: '🧅',
    soilType: 'Plateau du Saïss limono-argileux',
    irrigationType: 'Nappe du Saïss & Puits modernes',
    roadDistanceMatrixKm: {
      casablanca: 290,
      tanger_med: 310,
      rabat: 200,
      marrakech: 495,
      agadir: 720,
      fes: 55,
      oujda: 320,
    },
  },
  'Marrakech - Safi (Haouz, El Kelaâ)': {
    region: 'Marrakech - Safi (Haouz, El Kelaâ)',
    label: 'Marrakech - Safi (Plaine du Haouz • El Kelaâ)',
    labelAr: 'مراكش - آسفي (سهل الحوز • قلعة السراغنة)',
    hubCity: 'Marrakech / Tamansourt',
    lat: 31.6295,
    lon: -7.9811,
    svgX: 330,
    svgY: 285,
    specialtyTag: 'Oliviers, Huile d\'olive, Bétail Sardi & Melons',
    specialtyTagAr: 'أشجار الزيتون، أغنام الصردي الأصيلة وبطيخ',
    dominantIcon: '🫒',
    soilType: 'Sols calcaires et caillouteux d\'Atlas',
    irrigationType: 'Canal de Rocade & Nappe du Haouz',
    roadDistanceMatrixKm: {
      casablanca: 240,
      tanger_med: 580,
      rabat: 320,
      marrakech: 15,
      agadir: 230,
      fes: 495,
      oujda: 780,
    },
  },
  'Béni Mellal - Khénifra (Tadla)': {
    region: 'Béni Mellal - Khénifra (Tadla)',
    label: 'Béni Mellal - Khénifra (Périmètre du Tadla)',
    labelAr: 'بني ملال - خنيفرة (حوض تادلة الفلاحي)',
    hubCity: 'Béni Mellal / Fkih Ben Salah',
    lat: 32.3394,
    lon: -6.3608,
    svgX: 435,
    svgY: 240,
    specialtyTag: 'Oranges Valencia-Late, Fourrages (Luzerne) & Bovins',
    specialtyTagAr: 'برتقال تادلة، فصة مجففة وإنتاج الحليب واللحوم',
    dominantIcon: '🍊',
    soilType: 'Sols d\'alluvions d\'Oum Er-Rbia',
    irrigationType: 'Barrage Bin El Ouidane & Oum Er-Rbia',
    roadDistanceMatrixKm: {
      casablanca: 210,
      tanger_med: 540,
      rabat: 270,
      marrakech: 195,
      agadir: 420,
      fes: 310,
      oujda: 590,
    },
  },
  'Drâa - Tafilalet (Zagora, Errachidia)': {
    region: 'Drâa - Tafilalet (Zagora, Errachidia)',
    label: 'Drâa - Tafilalet (Oasis du Ziz & Drâa)',
    labelAr: 'درعة - تافيلالت (واحات زاكورة وتافيلالت)',
    hubCity: 'Zagora / Erfoud / Errachidia',
    lat: 30.33,
    lon: -5.83,
    svgX: 520,
    svgY: 345,
    specialtyTag: 'Dattes Mejhoul & Boufeggous, Pastèques & Henné',
    specialtyTagAr: 'تمور المجهول وبوفقوس الممتازة، وزراعات الواحات',
    dominantIcon: '🌴',
    soilType: 'Sols alluvionnaires d\'oasis sableux',
    irrigationType: 'Barrage Hassan Addakhil & Khettaras',
    roadDistanceMatrixKm: {
      casablanca: 590,
      tanger_med: 890,
      rabat: 650,
      marrakech: 360,
      agadir: 430,
      fes: 440,
      oujda: 560,
    },
  },
  'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)': {
    region: 'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)',
    label: 'Tanger - Tétouan (Loukkos • Larache)',
    labelAr: 'طنجة - تطوان - الحسيمة (حوض اللوكوس • العرائش)',
    hubCity: 'Larache / Ksar El Kebir',
    lat: 35.19,
    lon: -6.15,
    svgX: 425,
    svgY: 85,
    specialtyTag: 'Fraisiers, Myrtilles, Avocats primeurs & Baies',
    specialtyTagAr: 'فراولة اللوكوس للتصدير، توت أزرق وأفوكادو',
    dominantIcon: '🍓',
    soilType: 'Sols sableux côtiers (R\'mel)',
    irrigationType: 'Barrage Oued El Makhazine',
    roadDistanceMatrixKm: {
      casablanca: 330,
      tanger_med: 95,
      rabat: 240,
      marrakech: 570,
      agadir: 790,
      fes: 195,
      oujda: 380,
    },
  },
  'Casablanca - Settat & Doukkala': {
    region: 'Casablanca - Settat & Doukkala',
    label: 'Casablanca - Settat & Doukkala (Berrechid • Chaouia)',
    labelAr: 'الدار البيضاء - سطات ودكالة (برشيد • الشاوية)',
    hubCity: 'Berrechid / Sidi Bennour',
    lat: 33.5731,
    lon: -7.5898,
    svgX: 350,
    svgY: 185,
    specialtyTag: 'Pomme de terre Spunta, Carottes, Maraîchage & Céréales',
    specialtyTagAr: 'بطاطس برشيد (سبونتا)، جزر، خضروات وتربية الأبقار',
    dominantIcon: '🥔',
    soilType: 'Sols Tirs profonds et R\'mel de Chaouia',
    irrigationType: 'Canal de Doukkala & Forages privés',
    roadDistanceMatrixKm: {
      casablanca: 35,
      tanger_med: 370,
      rabat: 95,
      marrakech: 210,
      agadir: 430,
      fes: 320,
      oujda: 610,
    },
  },
};

interface ClusterMetric {
  region: MoroccanRegion;
  geoMeta: RegionGeoMeta;
  activeListingsCount: number;
  totalVolumeTonnes: number;
  totalLivestockHeads: number;
  sampleProduceTitles: string[];
  dominantCategory: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  distanceKmToSelectedHub: number;
  transitDurationHours: number;
  listings: ProduceListing[];
}

interface Props {
  onSelectRegionFilter?: (region: MoroccanRegion | 'ALL') => void;
  selectedRegionFilter?: MoroccanRegion | 'ALL';
  onContactSeller?: (listing: ProduceListing) => void;
  onOpenBatchQRModal?: (listing: ProduceListing) => void;
}

export const ProduceSupplyClusterMap: React.FC<Props> = ({
  onSelectRegionFilter,
  selectedRegionFilter = 'ALL',
  onContactSeller,
  onOpenBatchQRModal,
}) => {
  const { language, produceListings, openEscrowPayment } = useApp();

  const [selectedBuyerHubId, setSelectedBuyerHubId] = useState<string>('casablanca');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | ProduceCategory>('ALL');
  const [selectedRegionCluster, setSelectedRegionCluster] = useState<MoroccanRegion | null>(
    selectedRegionFilter !== 'ALL' ? selectedRegionFilter : 'Souss-Massa (Agadir, Taroudant, Chtouka)'
  );
  const [mapMetricDisplay, setMapMetricDisplay] = useState<'volume' | 'distance' | 'price'>('volume');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Active buyer destination hub
  const activeBuyerHub = useMemo(() => {
    return (
      BUYER_DESTINATION_HUBS.find((h) => h.id === selectedBuyerHubId) || BUYER_DESTINATION_HUBS[0]
    );
  }, [selectedBuyerHubId]);

  // Compute cluster metrics for each region
  const clusterMetrics = useMemo<Map<MoroccanRegion, ClusterMetric>>(() => {
    const metricsMap = new Map<MoroccanRegion, ClusterMetric>();

    // Initialize all regions
    (Object.keys(REGION_GEO_REGISTRY) as MoroccanRegion[]).forEach((regionKey) => {
      const geo = REGION_GEO_REGISTRY[regionKey];
      const distKm = geo.roadDistanceMatrixKm[selectedBuyerHubId] || 150;
      // Average 65 km/h for heavy agricultural freight truck
      const durationH = Math.max(0.5, Math.round((distKm / 65) * 10) / 10);

      // Filter listings belonging to this region
      const regionalListings = produceListings.filter((l) => {
        if (l.region !== regionKey) return false;
        if (activeCategoryFilter !== 'ALL' && l.category !== activeCategoryFilter) return false;
        return true;
      });

      let totalTonnes = 0;
      let totalHeads = 0;
      const prices: number[] = [];

      regionalListings.forEach((item) => {
        if (item.unit === 'Tonnes') {
          totalTonnes += item.quantityAvailable || 0;
          if (item.pricePerUnitMAD) prices.push(item.pricePerUnitMAD / 1000); // normalized to MAD/kg
        } else if (item.unit === 'Têtes / Bêtes') {
          totalHeads += item.quantityAvailable || 0;
          if (item.pricePerUnitMAD) prices.push(item.pricePerUnitMAD);
        } else {
          totalTonnes += (item.quantityAvailable || 0) * 0.05; // rough estimate
        }
      });

      const uniqueTitles: string[] = Array.from(
        new Set<string>(regionalListings.map((l) => (l.variety || l.title) as string))
      ).slice(0, 3);
      const minP = prices.length ? Math.min(...prices) : 0;
      const maxP = prices.length ? Math.max(...prices) : 0;
      const avgP = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

      metricsMap.set(regionKey, {
        region: regionKey,
        geoMeta: geo,
        activeListingsCount: regionalListings.length,
        totalVolumeTonnes: Math.round(totalTonnes),
        totalLivestockHeads: totalHeads,
        sampleProduceTitles: uniqueTitles,
        dominantCategory: regionalListings[0]?.category || 'Légume',
        minPrice: minP,
        maxPrice: maxP,
        avgPrice: avgP,
        distanceKmToSelectedHub: distKm,
        transitDurationHours: durationH,
        listings: regionalListings,
      });
    });

    return metricsMap;
  }, [produceListings, activeCategoryFilter, selectedBuyerHubId]);

  // Sorted clusters from nearest to farthest from selected buyer hub
  const sortedClusters = useMemo<ClusterMetric[]>(() => {
    return Array.from(clusterMetrics.values()).sort(
      (a: ClusterMetric, b: ClusterMetric) => a.distanceKmToSelectedHub - b.distanceKmToSelectedHub
    );
  }, [clusterMetrics]);

  // Selected cluster data
  const activeCluster = useMemo<ClusterMetric | undefined>(() => {
    if (!selectedRegionCluster) return sortedClusters[0];
    return clusterMetrics.get(selectedRegionCluster) || sortedClusters[0];
  }, [selectedRegionCluster, clusterMetrics, sortedClusters]);

  const handleClusterClick = (region: MoroccanRegion) => {
    setSelectedRegionCluster(region);
  };

  const handleApplyFilter = (region: MoroccanRegion) => {
    if (onSelectRegionFilter) {
      onSelectRegionFilter(region);
    }
  };

  return (
    <div
      id="agristock-produce-supply-cluster-map"
      className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden transition-all duration-300 mb-6"
    >
      {/* Top Header & Navigation Banner */}
      <div className="bg-gradient-to-r from-[#061a10] via-[#0d2a1b] to-[#143d26] text-white p-4 sm:p-5 relative border-b border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <Compass className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-stone-950">
                  {tr(language, 'Bassin de Production & Proximité', 'أحواض الإنتاج والمسافات', 'Production Basins & Proximity')}
                </span>
                <span className="text-[11px] font-mono text-emerald-300 font-semibold hidden sm:inline">
                  Morocco AgriGIS Live
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {tr(
                  language,
                  'Carte Interactive des Gisements & Sources Maraîchères',
                  'خريطة مصادر المحاصيل والتموين الفلاحي بالمغرب',
                  'Interactive Moroccan Produce Supply Clusters Map'
                )}
              </h2>
              <p className="text-xs text-emerald-100/70">
                {tr(
                  language,
                  'Identifiez en temps réel les gisements agricoles les plus proches de votre destination, estimez les trajets et réservez directement.',
                  'حدد أحواض الإنتاج الأقرب لمدينتك أو سوق الجملة، احسب مسافات النقل واحجز فوراً.',
                  'Identify the closest produce supply basins to your market hub, calculate haulage distances and secure lots.'
                )}
              </p>
            </div>
          </div>

          {/* Quick Hub Selector (Destination Buyer) */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="bg-stone-900/80 backdrop-blur-xs border border-emerald-500/40 rounded-2xl p-2 px-3 flex items-center gap-2 text-xs">
              <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block leading-tight">
                  {tr(language, 'Votre Destination / Marché :', 'وجهة الشحن / مدينتك :', 'Your Destination Hub :')}
                </span>
                <select
                  value={selectedBuyerHubId}
                  onChange={(e) => setSelectedBuyerHubId(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-hidden cursor-pointer"
                >
                  {BUYER_DESTINATION_HUBS.map((hub) => (
                    <option key={hub.id} value={hub.id} className="bg-stone-900 text-white">
                      📍 {hub.city} — {hub.name.split('(')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
              title={isExpanded ? 'Réduire la carte' : 'Agrandir la carte'}
            >
              {isExpanded ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Filter bar: Category & Metric toggle */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider hidden sm:inline mr-1">
                Filière :
              </span>
              {[
                { id: 'ALL', label: 'Toutes les cultures' },
                { id: 'Légume', label: '🍅 Légumes' },
                { id: 'Fruit', label: '🍊 Fruits' },
                { id: 'Dattes', label: '🌴 Dattes' },
                { id: 'Élevage & Bétail', label: '🐑 Bétail' },
                { id: 'Fourrage & Aliments', label: '🌿 Fourrage' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    activeCategoryFilter === cat.id
                      ? 'bg-emerald-400 text-stone-950 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Metric pill toggle */}
            <div className="flex items-center gap-1 bg-stone-900/60 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setMapMetricDisplay('volume')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  mapMetricDisplay === 'volume'
                    ? 'bg-emerald-500 text-stone-950 font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                ⚖️ {tr(language, 'Volumes (T)', 'الكميات (طن)', 'Volumes (T)')}
              </button>
              <button
                type="button"
                onClick={() => setMapMetricDisplay('distance')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  mapMetricDisplay === 'distance'
                    ? 'bg-emerald-500 text-stone-950 font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                🚚 {tr(language, 'Distance (km)', 'المسافة (كلغ)', 'Distance (km)')}
              </button>
              <button
                type="button"
                onClick={() => setMapMetricDisplay('price')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  mapMetricDisplay === 'price'
                    ? 'bg-emerald-500 text-stone-950 font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                💰 {tr(language, 'Prix MAD', 'السعر', 'Price')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Map & Details Area */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-stone-100">
          {/* Left / Center: Interactive SVG Map of Morocco */}
          <div className="lg:col-span-8 p-3 sm:p-5 relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#f0f4f1] via-[#e8efe9] to-[#dce8de]">
            {/* Map Legend Overlay */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-2.5 px-3 rounded-2xl border border-stone-200/80 shadow-xs text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-800 text-[11px]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                <span>Gisements actifs ({produceListings.length} lots référencés)</span>
              </div>
              <div className="text-[10px] text-stone-500 flex items-center gap-2">
                <span>📍 Destination : <strong>{activeBuyerHub.city}</strong></span>
              </div>
            </div>

            {/* SVG Visual Canvas */}
            <div className="w-full flex items-center justify-center py-2">
              <svg
                viewBox="0 0 840 560"
                className="w-full max-h-[500px] select-none filter drop-shadow-sm"
                aria-label="Carte des bassins de production agricole du Maroc"
              >
                <defs>
                  {/* Ocean Gradient */}
                  <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d6e8fa" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#bed8f0" stopOpacity="0.5" />
                  </linearGradient>

                  {/* Land Gradient */}
                  <linearGradient id="moroccoLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#eaf4ea" />
                    <stop offset="50%" stopColor="#d8ead9" />
                    <stop offset="100%" stopColor="#cde2ce" />
                  </linearGradient>

                  {/* Agricultural River Pattern */}
                  <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>

                  {/* Glow filter for active cluster */}
                  <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#059669" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Ocean Background Canvas */}
                <rect width="840" height="560" fill="url(#oceanGradient)" rx="24" />

                {/* Stylized Moroccan Coastline & National Boundary */}
                <g id="morocco-landmass">
                  {/* Mediterranean & Atlantic stylized outline of Morocco */}
                  <path
                    d="M 435,50 
                       C 480,55 580,75 690,110 
                       C 730,125 760,165 730,210 
                       C 700,260 670,300 630,340 
                       C 580,390 530,420 460,440 
                       C 380,460 300,470 230,490 
                       C 180,510 140,540 100,550 
                       L 70,550 
                       C 80,480 120,400 170,330 
                       C 210,280 250,230 280,180 
                       C 320,130 360,90 400,65 
                       Z"
                    fill="url(#moroccoLandGradient)"
                    stroke="#a3c4a6"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  {/* Atlas Mountain Spine (Shaded relief contour) */}
                  <path
                    d="M 280,240 
                       Q 380,230 460,200 
                       Q 540,180 620,160 
                       Q 530,230 430,270 
                       Z"
                    fill="#c8dec9"
                    opacity="0.75"
                  />
                  <path
                    d="M 250,330 
                       Q 330,300 410,270 
                       Q 480,260 540,240 
                       Q 460,310 380,330 
                       Z"
                    fill="#b5d1b7"
                    opacity="0.8"
                  />

                  {/* Key Rivers / Irrigated Valleys */}
                  {/* Oued Sebou (Gharb) */}
                  <path
                    d="M 480,160 Q 440,150 400,135 Q 380,135 365,140"
                    fill="none"
                    stroke="url(#riverGradient)"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                    opacity="0.7"
                  />
                  {/* Oued Oum Er-Rbia (Tadla & Doukkala) */}
                  <path
                    d="M 460,220 Q 420,225 380,210 Q 340,205 315,220"
                    fill="none"
                    stroke="url(#riverGradient)"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                    opacity="0.7"
                  />
                  {/* Oued Souss */}
                  <path
                    d="M 330,355 Q 290,365 245,375"
                    fill="none"
                    stroke="url(#riverGradient)"
                    strokeWidth="2.5"
                    strokeDasharray="3 2"
                    opacity="0.7"
                  />
                  {/* Oued Moulouya (Berkane) */}
                  <path
                    d="M 580,220 Q 620,180 660,130"
                    fill="none"
                    stroke="url(#riverGradient)"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                    opacity="0.7"
                  />
                </g>

                {/* Major Motorways / Corridors Logistiques */}
                <g id="logistics-corridors" opacity="0.65">
                  {/* Autoroute Tanger - Rabat - Casablanca - Marrakech - Agadir */}
                  <path
                    d="M 435,60 L 385,155 L 350,185 L 330,285 L 255,375"
                    fill="none"
                    stroke="#047857"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  {/* Autoroute Rabat - Meknès - Fès - Oujda */}
                  <path
                    d="M 385,155 L 490,160 L 675,125"
                    fill="none"
                    stroke="#047857"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  {/* Autoroute Berrechid - Béni Mellal */}
                  <path
                    d="M 350,185 L 435,240"
                    fill="none"
                    stroke="#047857"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                </g>

                {/* Buyer Destination Hub Marker */}
                <g id="buyer-destination-hub" transform={`translate(${activeBuyerHub.svgX}, ${activeBuyerHub.svgY})`}>
                  <circle r="18" fill="#0284c7" opacity="0.25" className="animate-ping" />
                  <circle r="11" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
                  <circle r="4" fill="#ffffff" />
                  {/* Label */}
                  <rect x="14" y="-12" width="95" height="22" rx="6" fill="#0f172a" opacity="0.9" />
                  <text x="20" y="3" fill="#ffffff" fontSize="10" fontWeight="bold">
                    📍 {activeBuyerHub.city} (Vous)
                  </text>
                </g>

                {/* Regional Supply Clusters */}
                {(Array.from(clusterMetrics.values()) as ClusterMetric[]).map((cluster: ClusterMetric) => {
                  const isSelected = selectedRegionCluster === cluster.region;
                  const hasListings = cluster.activeListingsCount > 0;
                  const x = cluster.geoMeta.svgX;
                  const y = cluster.geoMeta.svgY;

                  // Radius scaled with available volume
                  const baseRadius = hasListings
                    ? Math.min(28, Math.max(16, 14 + Math.log10(cluster.totalVolumeTonnes + 1) * 6))
                    : 12;

                  return (
                    <g
                      key={cluster.region}
                      id={`cluster-node-${cluster.region.replace(/\s+/g, '-')}`}
                      transform={`translate(${x}, ${y})`}
                      onClick={() => handleClusterClick(cluster.region)}
                      className="cursor-pointer group"
                    >
                      {/* Interactive Pulser */}
                      {hasListings && (
                        <circle
                          r={baseRadius + 6}
                          fill={isSelected ? '#059669' : '#10b981'}
                          opacity={isSelected ? 0.35 : 0.15}
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={baseRadius}
                        fill={isSelected ? '#064e3b' : hasListings ? '#065f46' : '#9ca3af'}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? '3' : '2'}
                        filter={isSelected ? 'url(#emeraldGlow)' : undefined}
                        className="transition-all duration-200 group-hover:scale-110"
                      />

                      {/* Produce Icon */}
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fontSize={baseRadius > 18 ? '14' : '11'}
                        className="select-none pointer-events-none"
                      >
                        {cluster.geoMeta.dominantIcon}
                      </text>

                      {/* Metric Badge Pill under node */}
                      <g transform={`translate(0, ${baseRadius + 12})`}>
                        <rect
                          x="-38"
                          y="-9"
                          width="76"
                          height="18"
                          rx="9"
                          fill={isSelected ? '#064e3b' : '#ffffff'}
                          stroke={isSelected ? '#34d399' : '#d1d5db'}
                          strokeWidth="1.5"
                          className="shadow-xs"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill={isSelected ? '#ffffff' : '#111827'}
                          fontSize="9.5"
                          fontWeight="bold"
                          className="select-none"
                        >
                          {mapMetricDisplay === 'volume'
                            ? `${cluster.totalVolumeTonnes} T`
                            : mapMetricDisplay === 'distance'
                            ? `${cluster.distanceKmToSelectedHub} km`
                            : `${cluster.avgPrice > 0 ? cluster.avgPrice.toFixed(1) : '-'} MAD`}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Distance & Nearest Source Bar */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs mt-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-extrabold text-[10px] uppercase">
                  {tr(language, 'Bassin le plus proche :', 'الأقرب مسافة لوجهتك :', 'Nearest Basin :')}
                </span>
                <span className="font-black text-stone-900">
                  {sortedClusters[0]?.geoMeta.hubCity} ({sortedClusters[0]?.distanceKmToSelectedHub} km • ~{sortedClusters[0]?.transitDurationHours}h)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-500">
                  {tr(language, 'Volume dispo total :', 'مجموع الحصص الجاهزة :', 'Total Volume :')}{' '}
                  <strong className="text-emerald-800">
                    {((Array.from(clusterMetrics.values()) as ClusterMetric[])
                      .reduce((acc: number, c: ClusterMetric) => acc + (c.totalVolumeTonnes || 0), 0) || 0)
                      .toLocaleString()}{' '}
                    Tonnes
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Active Region Dossier & Selected Source Details */}
          <div className="lg:col-span-4 bg-white border-t lg:border-t-0 lg:border-l border-stone-200 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            {activeCluster ? (
              <div className="space-y-4">
                {/* Region Header Badge */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {activeCluster.geoMeta.hubCity}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      {activeCluster.distanceKmToSelectedHub} km
                    </span>
                  </div>

                  <h3 className="text-base font-black text-stone-900 mt-1">
                    {activeCluster.geoMeta.label.split('(')[0]}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {activeCluster.geoMeta.specialtyTag}
                  </p>
                </div>

                {/* Distance & Transit Card from selected hub */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-stone-50 to-emerald-50 border border-emerald-200/90 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Trajet vers {activeBuyerHub.city} :</span>
                    <span className="font-black text-emerald-950">
                      {activeCluster.distanceKmToSelectedHub} km via Autoroute
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Délai de transit frigo estimé :
                    </span>
                    <span className="font-bold text-stone-800">
                      ~ {activeCluster.transitDurationHours} heures de route
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-stone-500">
                    <span>Irrigation : <strong>{activeCluster.geoMeta.irrigationType}</strong></span>
                    <span className="text-emerald-700 font-semibold">Agrément ONSSA ✓</span>
                  </div>
                </div>

                {/* Stock & Volume KPIs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                      Disponibilité
                    </span>
                    <span className="font-black text-sm text-emerald-800">
                      {(activeCluster.totalVolumeTonnes || 0).toLocaleString('fr-FR')} Tonnes
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {activeCluster.activeListingsCount} {activeCluster.activeListingsCount > 1 ? 'lots en vente' : 'lot en vente'}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                      Prix indicatif
                    </span>
                    <span className="font-black text-sm text-stone-900">
                      {activeCluster.avgPrice > 0 ? `${activeCluster.avgPrice.toFixed(2)} MAD/kg` : 'Cotation'}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Départ ferme / station
                    </span>
                  </div>
                </div>

                {/* Sample Produce available in this cluster */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Lots disponibles dans ce bassin :
                  </span>

                  {activeCluster.listings.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {activeCluster.listings.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl border border-stone-200 bg-white hover:border-emerald-300 transition shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <h4 className="font-bold text-stone-900 truncate max-w-[170px]">
                              {item.title}
                            </h4>
                            <span className="font-mono font-black text-emerald-800">
                              {item.pricePerUnitMAD} MAD
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-stone-500">
                            <span>{item.quantityAvailable} {item.unit}</span>
                            <span className="text-emerald-700 font-semibold">{item.sellerName}</span>
                          </div>

                          <div className="pt-1 flex items-center justify-between gap-1 text-[10px]">
                            {onOpenBatchQRModal && (
                              <button
                                type="button"
                                onClick={() => onOpenBatchQRModal(item)}
                                className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition cursor-pointer"
                              >
                                QR Lot
                              </button>
                            )}

                            {onContactSeller && (
                              <button
                                type="button"
                                onClick={() => onContactSeller(item)}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer"
                              >
                                Contacter
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                      Aucun lot actif ne correspond au filtre de filière actuel dans ce bassin.
                    </div>
                  )}
                </div>

                {/* Primary CTA: Filter Marketplace to this region */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleApplyFilter(activeCluster.region)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <span>{tr(language, 'Filtrer la Bourse sur cette région', 'عرض عروض هذه المنطقة', 'Filter Marketplace to this region')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-stone-400">
                Sélectionnez un bassin sur la carte pour afficher sa fiche logistique.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
