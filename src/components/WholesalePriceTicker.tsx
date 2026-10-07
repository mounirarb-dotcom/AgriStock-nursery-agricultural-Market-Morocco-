import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation, tr } from '../utils/translations';
import { WholesaleMarketPrice } from '../types';
import { VoiceSearchButton } from './VoiceSearchButton';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Building2,
  Calendar,
  DollarSign,
  Info,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Activity,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';

export const WholesalePriceTicker: React.FC = () => {
  const { language, wholesalePrices, setActiveTab, globalVoiceSearchQuery, setGlobalVoiceSearchQuery } = useApp();
  const t = useTranslation(language);

  const [filterMarket, setFilterMarket] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchCommodity, setSearchCommodity] = useState('');

  // Synchronisation avec la recherche vocale globale
  React.useEffect(() => {
    if (globalVoiceSearchQuery) {
      setSearchCommodity(globalVoiceSearchQuery);
      setGlobalVoiceSearchQuery('');
    }
  }, [globalVoiceSearchQuery, setGlobalVoiceSearchQuery]);

  // AgriForex Transaction Simulator state
  const [simSelectedCommodityId, setSimSelectedCommodityId] = useState<string>(
    wholesalePrices[0]?.id || ''
  );
  const [simQuantity, setSimQuantity] = useState<number>(25);
  const [simCustomPrice, setSimCustomPrice] = useState<number | null>(null);

  const filteredPrices = wholesalePrices.filter(p => {
    const term = (searchCommodity || '').trim().toLowerCase();
    const matchesSearch =
      !term ||
      Boolean(p.commodity?.toLowerCase().includes(term)) ||
      Boolean(p.commodityAr?.includes(term));
    const matchesMarket = filterMarket === 'ALL' || p.marketName.includes(filterMarket);
    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;

    return matchesSearch && matchesMarket && matchesCategory;
  });

  const markets = Array.from(new Set(wholesalePrices.map(p => p.marketName)));

  // Selected commodity for simulation
  const activeSimCommodity = useMemo(() => {
    return wholesalePrices.find(p => p.id === simSelectedCommodityId) || wholesalePrices[0];
  }, [simSelectedCommodityId, wholesalePrices]);

  const effectivePrice = simCustomPrice !== null ? simCustomPrice : activeSimCommodity?.averagePriceMAD || 0;
  // If unit has tonnes/kg, adjust
  const isPerKg = activeSimCommodity?.unit.includes('/ kg');
  const isPerTete = activeSimCommodity?.unit.includes('/ tête') || activeSimCommodity?.category === 'Élevage & Viande';
  const grossEstimatedMAD = isPerKg ? simQuantity * 1000 * effectivePrice : simQuantity * effectivePrice;
  const estimatedEscrowFee = grossEstimatedMAD * 0.015; // 1.5% frais séquestre AgriForex
  const netEstimatedMAD = grossEstimatedMAD - estimatedEscrowFee;

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Top Banner inspired by AgriForex */}
      <div className="bg-gradient-to-r from-[#07150e] via-[#0d2719] to-[#07150e] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-3 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr(language, 'AgriForex : Bourse des Prix, Cotations & Mercuriales du Maroc', 'بورصة أسعار الفلاحة والمواشي في المغرب', 'AgriForex: Commodity Prices & Quotes in Morocco')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {tr(language, 'Cotations en Direct & Mercuriales Agricoles (Forex)', 'بورصة الأسعار اليومية للمنتوجات الفلاحية والمواشي', 'Live Agricultural Market Quotes & Indices (Forex)')}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
            {tr(
              language,
              "Baromètre en temps réel des cours des fruits, légumes, bétail sur pied (ovins Sardi, bovins), huile d'olive et fourrages relevés sur les carreaux de gros et souks marocains (Inezgane, Casablanca Médiouna, Settat, Meknès, Berkane, Tadla).",
              'متابعة حية لأسعار الخضر، الفواكه، الماشية (الصردي والأبقار)، زيت الزيتون والأعلاف عبر أسواق الجملة والأسواق الأسبوعية بالمغرب.',
              'Real-time index of fruit, vegetable, standing livestock (Sardi sheep, cattle), olive oil, and fodder prices recorded across Moroccan wholesale markets and regional souks.'
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-900/50 border border-emerald-700/50 text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {tr(language, 'Prix moyens pondérés quotidiens', 'متوسط الأسعار اليومية المرجحة', 'Daily weighted average prices')}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-900/50 border border-emerald-700/50 text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {tr(language, 'Arbitrage régional des prix', 'مقارنة وفروق الأسعار الجهوية', 'Regional price arbitrage')}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-900/50 border border-emerald-700/50 text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {tr(language, 'Filières Agri & Élevage réunies', 'شعب الفلاحة وتربية الماشية', 'Crops & Livestock sectors')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        {/* Category Pills (AgriForex Sectors) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'ALL', label: tr(language, 'Toutes les filières', 'جميع الأسعار', 'All sectors') },
            { id: 'Légume', label: tr(language, '🥦 Légumes', '🥦 الخضر', '🥦 Vegetables') },
            { id: 'Fruit', label: tr(language, '🍎 Fruits', '🍎 الفواكه', '🍎 Fruits') },
            { id: 'Élevage & Viande', label: tr(language, '🐑 Élevage & Bétail', '🐑 الماشية واللحوم', '🐑 Livestock & Meat') },
            { id: 'Céréales & Huile', label: tr(language, '🫒 Huile & Céréales', '🫒 زيت الزيتون والحبوب', '🫒 Oil & Cereals') },
            { id: 'Fourrage & Aliments', label: tr(language, '🌾 Fourrages & Aliments', '🌾 الأعلاف والكلأ', '🌾 Fodder & Feed') },
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1 border-t border-stone-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={tr(
                language,
                "Rechercher une denrée (Tomate, Ovin Sardi, Huile d'olive, Clémentine...)...",
                'ابحث عن منتوج (طماطم، صردي، زيت زيتون، يوسفي...)...',
                'Search commodity (Tomato, Sardi sheep, Olive oil, Clementine...)...'
              )}
              value={searchCommodity}
              onChange={e => setSearchCommodity(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-xs focus:outline-emerald-600"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchCommodity && (
                <button
                  type="button"
                  onClick={() => setSearchCommodity('')}
                  className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                  title={tr(language, 'Effacer', 'مسح', 'Clear')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <VoiceSearchButton
                language={language}
                onSearchResult={(query, details) => {
                  setSearchCommodity(query);
                  if (details?.category && details.category !== 'ALL') {
                    setFilterCategory(details.category);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterMarket}
              onChange={e => setFilterMarket(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-semibold text-xs focus:outline-emerald-600"
            >
              <option value="ALL">{tr(language, 'Tous les marchés & souks', 'جميع الأسواق والأسواق الأسبوعية', 'All wholesale markets & souks')}</option>
              {markets.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Commodity Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPrices.map(item => {
          const isUp = item.trend === 'up';
          const isDown = item.trend === 'down';

          return (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-black text-stone-900 leading-snug">
                      {item.commodity}
                    </h3>
                    <span className="text-xs font-bold text-stone-500 font-serif">
                      {item.commodityAr}
                    </span>
                  </div>

                  {/* Trend pill */}
                  <div
                    className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
                      isUp
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isDown
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-stone-50 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {isUp && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />}
                    {isDown && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
                    {!isUp && !isDown && <Minus className="w-3.5 h-3.5 text-stone-400" />}
                    <span>{item.variationPercent > 0 ? `+${item.variationPercent}%` : `${item.variationPercent}%`}</span>
                  </div>
                </div>

                {/* Market badge */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-100">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="truncate font-medium">{item.marketName}</span>
                </div>

                {/* Average Price Box */}
                <div className="mt-3.5 text-center py-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    {tr(language, 'Cours Moyen Boursier', 'متوسط سعر البورصة', 'Average Market Price')}
                  </span>
                  <p className="text-2xl font-black text-emerald-950 mt-0.5">
                    {item.averagePriceMAD.toFixed(item.averagePriceMAD >= 10 ? 1 : 2)}{' '}
                    <span className="text-xs font-bold text-emerald-700">{item.unit}</span>
                  </p>
                </div>

                {/* Min / Max Range */}
                <div className="mt-3 flex items-center justify-between text-xs px-2 py-1.5 bg-stone-50 rounded-lg">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-medium">{tr(language, 'Fourchette Min', 'السعر الأدنى', 'Min Price')}</span>
                    <span className="font-bold text-stone-700">{item.minPriceMAD.toFixed(1)} DH</span>
                  </div>
                  <div className="h-4 w-px bg-stone-200" />
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block uppercase font-medium">{tr(language, 'Fourchette Max', 'السعر الأقصى', 'Max Price')}</span>
                    <span className="font-bold text-stone-700">{item.maxPriceMAD.toFixed(1)} DH</span>
                  </div>
                </div>

                {/* Regional Quotes if available */}
                {item.regionalQuotes && item.regionalQuotes.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-stone-100 space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      {tr(language, 'Comparaison Régionale :', 'المقارنة الجهوية :', 'Regional Comparison:')}
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {item.regionalQuotes.map((q, idx) => (
                        <div key={idx} className="bg-stone-50 p-1.5 rounded flex items-center justify-between border border-stone-100">
                          <span className="truncate text-stone-600 font-medium">{q.market.split('(')[0]}</span>
                          <span className="font-bold text-stone-900">{q.avgPriceMAD} DH</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer action */}
              <div className="mt-4 pt-2.5 border-t border-stone-100 text-[11px] flex items-center justify-between">
                <span className="text-[10px] text-stone-400">{item.lastUpdated}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSimSelectedCommodityId(item.id);
                    if (document.getElementById('agriforex-simulator-section')) {
                      document.getElementById('agriforex-simulator-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Calculator className="w-3 h-3" />
                  <span>{tr(language, 'Simuler', 'محاكاة', 'Simulate')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AgriForex Interactive Simulation & Arbitrage Calculator */}
      <div id="agriforex-simulator-section" className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {tr(language, 'Calculateur de Transaction Boursière & Rentabilité AgriForex', 'حاسبة الصفقات البورصية ومردودية AgriForex', 'AgriForex Transaction & Profitability Calculator')}
              </h2>
              <p className="text-xs text-stone-500">
                {tr(
                  language,
                  "Estimez le montant de votre récolte ou lot d'élevage selon les cours officiels du jour et les frais de séquestre garantis.",
                  'تقدير قيمة المحصول أو قطيع الماشية وفق أسعار اليوم ورسوم الضمان البنكي المؤمن.',
                  'Estimate your harvest or livestock batch value based on official daily quotes and escrow fees.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Commodity selector */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {tr(language, 'Produit / Denrée Agricole', 'المنتوج / الغلة الزراعية', 'Commodity / Crop')}
            </label>
            <select
              value={simSelectedCommodityId}
              onChange={e => {
                setSimSelectedCommodityId(e.target.value);
                setSimCustomPrice(null);
              }}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800 font-semibold"
            >
              {wholesalePrices.map(p => (
                <option key={p.id} value={p.id}>
                  {p.commodity} ({p.category}) - {p.averagePriceMAD} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Volume / Quantity input */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {tr(language, 'Quantité', 'الكمية', 'Quantity')} ({activeSimCommodity?.unit.includes('/ kg') ? tr(language, 'Tonnes', 'بالأطنان', 'Tons') : activeSimCommodity?.unit.replace('MAD / ', '')})
            </label>
            <input
              type="number"
              min="1"
              value={simQuantity}
              onChange={e => setSimQuantity(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 font-bold"
            />
          </div>

          {/* Target / Estimated Price */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {tr(language, 'Prix unitaire retenu', 'سعر الوحدة المعتمد', 'Unit Price')} ({activeSimCommodity?.unit})
            </label>
            <input
              type="number"
              step="0.1"
              value={effectivePrice}
              onChange={e => setSimCustomPrice(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 font-bold"
            />
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 p-4 sm:p-5 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              {tr(language, 'Valeur Brute Estimée de la Transaction', 'القيمة التقديرية الإجمالية للصفقة', 'Estimated Gross Transaction Value')}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              {(grossEstimatedMAD || 0).toLocaleString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR', { maximumFractionDigits: 0 })} <span className="text-sm font-bold text-emerald-300">MAD</span>
            </p>
            <p className="text-[11px] text-stone-300 mt-1">
              {tr(
                language,
                `Sur la base de ${simQuantity} ${activeSimCommodity?.unit.includes('/ kg') ? 'Tonnes' : activeSimCommodity?.unit.replace('MAD / ', '')} à ${effectivePrice} ${activeSimCommodity?.unit}.`,
                `على أساس ${simQuantity} ${activeSimCommodity?.unit.includes('/ kg') ? 'طن' : activeSimCommodity?.unit.replace('MAD / ', '')} بسعر ${effectivePrice} ${activeSimCommodity?.unit}.`,
                `Based on ${simQuantity} ${activeSimCommodity?.unit.includes('/ kg') ? 'Tons' : activeSimCommodity?.unit.replace('MAD / ', '')} at ${effectivePrice} ${activeSimCommodity?.unit}.`
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right sm:text-right">
              <span className="text-[10px] text-stone-400 block">{tr(language, 'Frais Séquestre AgriForex (1.5%)', 'رسوم الضمان والتأمين (1.5%)', 'AgriForex Escrow Fee (1.5%)')}</span>
              <span className="text-xs font-bold text-emerald-400">-{estimatedEscrowFee.toFixed(0)} MAD</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('market')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>{tr(language, 'Publier sur la Bourse', 'نشر في البورصة', 'Publish to Market')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            {tr(
              language,
              'À propos des cours AgriForex au Maroc (Inezgane, Casablanca, Meknès, Settat, Tadla...)',
              'حول أسعار بورصة الفلاحة بالمغرب (إنزكان، الدار البيضاء، مكناس، سطات، تادلة...)',
              'About AgriForex Market Quotes in Morocco (Inezgane, Casablanca, Meknes, Settat, Tadla...)'
            )}
          </p>
          <p className="text-emerald-800 text-[11px] leading-relaxed">
            {tr(
              language,
              "Les cours affichés sont actualisés quotidiennement auprès des marchés de gros, des mercuriales régionales et des souks aux bestiaux majeurs. Pour les transactions sous séquestre AgriForex, les paiements restent bloqués jusqu'à validation de la qualité et du pesage conforme.",
              'الأسعار المعروضة يتم تحيينها يوميا من أسواق الجملة والأسواق الأسبوعية الكبرى للمواشي بالمملكة. بالنسبة للمعاملات المؤمنة، يتم حجز المدفوعات حتى التأكد من جودة المنتوج والوزن المطابق.',
              'Displayed quotes are updated daily from wholesale markets, regional price bulletins, and major livestock markets. For transactions secured via AgriForex escrow, payments are safely held until quality and weight verification.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

