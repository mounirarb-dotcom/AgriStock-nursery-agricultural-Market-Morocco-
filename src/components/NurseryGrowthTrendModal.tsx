import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Sprout,
  Trees,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  DollarSign,
  Package,
  Printer,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { NurseryLot } from '../types';
import { useAppContext } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  generateLotGrowthTimeSeries,
  aggregateNurseryTimeSeries,
  LotTimeSeries,
  TrendMetricKey,
  TREND_METRICS,
  GrowthDataPoint,
} from '../utils/growthTrendGenerator';
import { NurseryGrowthTrendChart } from './NurseryGrowthTrendChart';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLotId?: string;
}

type TimeRange = 30 | 90 | 180 | 365;

export const NurseryGrowthTrendModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialLotId,
}) => {
  const { language, nurseryLots } = useAppContext();
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  // Configuration state
  const [timeRange, setTimeRange] = useState<TimeRange>(90);
  const [activeMetric, setActiveMetric] = useState<TrendMetricKey>('height');
  const [viewMode, setViewMode] = useState<'aggregate' | 'single' | 'compare'>('aggregate');
  const [selectedLotId, setSelectedLotId] = useState<string>(() => {
    return initialLotId || (nurseryLots[0]?.id ?? '');
  });
  const [compareLotIds, setCompareLotIds] = useState<string[]>(() => {
    return nurseryLots.slice(0, 3).map(l => l.id);
  });

  const [hoveredPointInfo, setHoveredPointInfo] = useState<{
    point: GrowthDataPoint | null;
    variety: string | null;
  }>({ point: null, variety: null });

  // If initialLotId changes when opening
  React.useEffect(() => {
    if (initialLotId) {
      setSelectedLotId(initialLotId);
      setViewMode('single');
    }
  }, [initialLotId, isOpen]);

  // Compute time series for all lots
  const allLotSeries = useMemo(() => {
    return nurseryLots.map((lot, idx) => generateLotGrowthTimeSeries(lot, timeRange, idx));
  }, [nurseryLots, timeRange]);

  // Global aggregate series
  const aggregateSeries = useMemo(() => {
    return aggregateNurseryTimeSeries(allLotSeries);
  }, [allLotSeries]);

  // Determine which series list to pass to D3 chart
  const activeSeriesList: LotTimeSeries[] = useMemo(() => {
    if (viewMode === 'aggregate') {
      return [aggregateSeries];
    }
    if (viewMode === 'single') {
      const found = allLotSeries.find(s => s.lotId === selectedLotId);
      return found ? [found] : [aggregateSeries];
    }
    // Compare mode
    const selected = allLotSeries.filter(s => compareLotIds.includes(s.lotId));
    return selected.length > 0 ? selected : [aggregateSeries];
  }, [viewMode, allLotSeries, aggregateSeries, selectedLotId, compareLotIds]);

  if (!isOpen) return null;

  const currentLot = nurseryLots.find(l => l.id === selectedLotId) || nurseryLots[0];
  const metricConfig = TREND_METRICS[activeMetric];

  // Global summary KPIs computed from latest available points
  const latestAggPt = aggregateSeries.points[aggregateSeries.points.length - 1];
  const firstAggPt = aggregateSeries.points[0];

  const heightGrowthDelta = latestAggPt && firstAggPt ? latestAggPt.heightCm - firstAggPt.heightCm : 0;
  const growthRatePerMonth = Math.round((heightGrowthDelta / (timeRange / 30)) * 10) / 10;
  const totalStockCount = nurseryLots.reduce((acc, l) => acc + l.quantityAvailable, 0);
  const totalValuation = nurseryLots.reduce((acc, l) => acc + l.quantityAvailable * l.unitPriceMAD, 0);
  const avgVigor = latestAggPt ? latestAggPt.vigorScore : 96;

  // Handler to export SVG
  const handleExportSvg = () => {
    if (!chartSvgRef.current) return;
    try {
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(chartSvgRef.current);

      // Add name spaces
      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `agrimaroc-rapport-croissance-${activeMetric}-${timeRange}j.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export SVG', e);
    }
  };

  const toggleCompareLot = (id: string) => {
    setCompareLotIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 4) {
          return [...prev.slice(1), id]; // keep max 4
        }
        return [...prev, id];
      }
    });
  };

  return (
    <div
      id="nursery-growth-trend-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="nursery-growth-trend-modal"
        className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden text-stone-800"
      >
        {/* Header with Dark Green Agricultural Styling */}
        <div className="bg-gradient-to-r from-[#0c2417] via-[#103422] to-[#0a1e13] text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-bold border border-emerald-400/30">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Visualisation D3.js • Suivi Végétatif & Stock
                </span>
                <span className="text-xs text-stone-300 font-medium">
                  {nurseryLots.length} lots certifiés ONSSA
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {tr(
                  language,
                  'Rapports de Croissance & Performance des Stocks',
                  'تقارير نمو الشتلات وأداء المخزون',
                  'Growth Reports & Stock Performance'
                )}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
                {tr(
                  language,
                  "Courbes interactives D3 pour analyser la vigueur phénologique, la cinétique de pousse et la vélocité d'écoulement de votre pépinière.",
                  'رسم بياني تفاعلي بنظام D3 لتتبع تطور الطول، قطر الساق، سرعة تصريف المخزون والقيمة السوقية.',
                  'Interactive D3 curves to analyze phenological vigor, growth kinetics, and turnover velocity of your nursery.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportSvg}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white font-bold text-xs border border-white/10 transition cursor-pointer"
                title="Télécharger le graphique en SVG vectoriel HD"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SVG</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Time Range Selector & View Mode Switcher */}
          <div className="mt-4 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* View Mode Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/30 backdrop-blur-xs border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('aggregate')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'aggregate'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Vue Globale Pépinière
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'single'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Par Lot Individuel
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compare')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'compare'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Comparatif Variétés ({compareLotIds.length})
              </button>
            </div>

            {/* Time Range Buttons */}
            <div className="flex items-center gap-1">
              <span className="text-stone-400 mr-1 text-[11px] font-semibold hidden md:inline">
                Période :
              </span>
              {[
                { days: 30, label: '30 jours' },
                { days: 90, label: '90 jours' },
                { days: 180, label: '6 mois' },
                { days: 365, label: '1 an' },
              ].map(opt => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setTimeRange(opt.days as TimeRange)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    timeRange === opt.days
                      ? 'bg-white text-stone-950 shadow-xs'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Croissance Moyenne */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                <span>Croissance Moyenne</span>
                <Sprout className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1 flex items-baseline gap-1">
                <span>+{growthRatePerMonth}</span>
                <span className="text-xs font-bold text-emerald-700">cm / mois</span>
              </div>
              <div className="text-[11px] text-emerald-800/80 mt-1 flex items-center gap-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gain cumulé : +{Math.round(heightGrowthDelta)} cm</span>
              </div>
            </div>

            {/* KPI 2: Indice Vigueur */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50 border border-teal-200">
              <div className="flex items-center justify-between text-teal-800 text-[11px] font-bold uppercase tracking-wider">
                <span>Indice de Vigueur</span>
                <Sparkles className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-teal-950 mt-1 flex items-baseline gap-1">
                <span>{avgVigor}%</span>
                <span className="text-xs font-bold text-teal-700">Reprise & Vigueur</span>
              </div>
              <div className="text-[11px] text-teal-800/80 mt-1 font-medium">
                Conditions pédo-climatiques optimales
              </div>
            </div>

            {/* KPI 3: Stock Vivant */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <div className="flex items-center justify-between text-sky-800 text-[11px] font-bold uppercase tracking-wider">
                <span>Inventaire Total</span>
                <Package className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-sky-950 mt-1">
                {totalStockCount.toLocaleString('fr-FR')}
                <span className="text-xs font-bold text-sky-700 ml-1">plants</span>
              </div>
              <div className="text-[11px] text-sky-800/80 mt-1 font-medium">
                Répartis sur {nurseryLots.length} lots sous serre
              </div>
            </div>

            {/* KPI 4: Valorisation */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                <span>Valeur Marchande</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                {totalValuation.toLocaleString('fr-FR')}
                <span className="text-xs font-bold text-amber-700 ml-1">MAD</span>
              </div>
              <div className="text-[11px] text-amber-800/80 mt-1 font-medium">
                Actif vivant valorisé au tarif pépinière
              </div>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 text-xs">
            {(Object.keys(TREND_METRICS) as TrendMetricKey[]).map(key => {
              const meta = TREND_METRICS[key];
              const isSelected = activeMetric === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveMetric(key)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span>{meta.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({meta.unit})</span>
                </button>
              );
            })}
          </div>

          {/* Single Lot Selector / Comparison Selector Bar */}
          {viewMode === 'single' && (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-700">Sélectionner le lot à analyser :</span>
              </div>
              <select
                value={selectedLotId}
                onChange={e => setSelectedLotId(e.target.value)}
                className="px-3 py-2 bg-white rounded-xl border border-stone-300 font-bold text-xs text-stone-900 focus:outline-emerald-600 w-full sm:w-auto"
              >
                {nurseryLots.filter(Boolean).map(lot => (
                  <option key={lot.id} value={lot.id}>
                    {lot.variety} ({lot.species}) - {lot.batchNumber || 'N/A'} [{lot.quantityAvailable} plants]
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'compare' && (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800">
                  Cochez jusqu'à 4 variétés pour les superposer sur le tracé D3 :
                </span>
                <span className="text-[11px] text-stone-500 font-semibold">
                  {compareLotIds.length} / 4 sélectionnées
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {nurseryLots.map((lot, idx) => {
                  const isChecked = compareLotIds.includes(lot.id);
                  const series = allLotSeries.find(s => s.lotId === lot.id);
                  const color = series?.color || '#059669';

                  return (
                    <button
                      key={lot.id}
                      type="button"
                      onClick={() => toggleCompareLot(lot.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border ${
                        isChecked
                          ? 'bg-white shadow-xs text-stone-900 border-stone-400'
                          : 'bg-stone-100 text-stone-500 border-transparent hover:bg-stone-200'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: isChecked ? color : '#a8a29e' }}
                      />
                      <span>{lot.variety}</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        ({lot.quantityAvailable})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* D3 Chart Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: metricConfig.color }}
                  />
                  <span>{metricConfig.label}</span>
                  <span className="text-xs text-stone-400 font-normal">
                    — {metricConfig.description}
                  </span>
                </h3>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                {activeSeriesList.map(s => (
                  <div key={s.lotId} className="flex items-center gap-1.5 text-stone-700">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-bold text-[11px]">{s.variety}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* D3 Line Chart Component */}
            <div className="w-full bg-stone-50/50 rounded-2xl p-2 sm:p-3 border border-stone-100">
              <NurseryGrowthTrendChart
                seriesList={activeSeriesList}
                activeMetric={activeMetric}
                showComparison={viewMode === 'compare'}
                chartSvgRef={chartSvgRef}
                onHoverPoint={(point, variety) => {
                  setHoveredPointInfo({ point, variety });
                }}
              />
            </div>

            {/* Hint & Inspection summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>
                  Survolez le graphique pour explorer les valeurs exactes, la date et les événements phytosanitaires.
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-600">
                <span>Tracé généré en temps réel par D3.js</span>
              </div>
            </div>
          </div>

          {/* Agronomic Insight & Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="text-xs font-black uppercase text-stone-600 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Observations Agronomiques & Recommandations
              </h4>
              <p className="text-xs text-stone-700 leading-relaxed">
                Le cycle de croissance actuel montre une cinétique régulière avec un taux d'accroissement moyen de <strong>+{growthRatePerMonth} cm/mois</strong>. Les lots d'oliviers et d'agrumes présentent une excellente lignification du collet (diamètre moyen &gt; 8mm), assurant une reprise supérieure à 95% lors de la transplantation en plein champ.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="text-xs font-black uppercase text-stone-600 tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Indicateurs de Vente & Écoulement
              </h4>
              <p className="text-xs text-stone-700 leading-relaxed">
                La vélocité de déstockage indique une demande soutenue pour les variétés arboricoles. Le délai moyen de rotation est estimé à <strong>45 jours</strong>. L'actualisation quotidienne certifiée du stock garantit la priorité de référencement sur la place de marché AgriMaroc.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Données conformes aux standards de certification ONSSA Maroc</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportSvg}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-300 transition cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Exporter SVG</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs shadow-md transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
