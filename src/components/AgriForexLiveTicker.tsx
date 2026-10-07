import React from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const AgriForexLiveTicker: React.FC = () => {
  const { wholesalePrices, setActiveTab, language } = useApp();

  // Highlighted ticker commodities
  const tickerItems = wholesalePrices.slice(0, 10);

  return (
    <div className="w-full bg-[#07130d] text-stone-200 border-t border-b border-[#143021] text-xs select-none shadow-inner overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center h-10">
        {/* Live Badge inspired by AgriForex / Bourse */}
        <button
          id="btn-agriforex-ticker-tag"
          type="button"
          onClick={() => setActiveTab('wholesale')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-bold shrink-0 hover:bg-emerald-900 transition-colors cursor-pointer group"
          title="Consulter la Bourse des Prix AgriForex"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-black tracking-wider uppercase">
            {tr(language, 'Bourse AgriForex', 'بورصة الأسعار', 'AgriForex Market')}
          </span>
          <Activity className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
        </button>

        {/* Scrolling Ticker Strip */}
        <div className="flex-1 overflow-x-auto no-scrollbar mx-2 sm:mx-3 py-1">
          <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap min-w-max">
            {tickerItems.map(item => {
              const isUp = item.trend === 'up';
              const isDown = item.trend === 'down';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab('wholesale')}
                  className="inline-flex items-center gap-2 hover:bg-emerald-950/60 px-2 py-0.5 rounded transition text-left cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold text-stone-300 group-hover:text-emerald-300 transition-colors">
                    {item.commodity}
                  </span>
                  <span className="text-[11px] font-bold text-white font-mono">
                    {item.averagePriceMAD.toFixed(item.averagePriceMAD >= 10 ? 1 : 2)} <span className="text-[9px] text-stone-400 font-sans">{item.unit.split('/')[1] ? `MAD/${item.unit.split('/')[1]}` : 'MAD'}</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isUp
                        ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800/40'
                        : isDown
                        ? 'text-rose-400 bg-rose-950/80 border border-rose-800/40'
                        : 'text-stone-400 bg-stone-900 border border-stone-800'
                    }`}
                  >
                    {isUp && <TrendingUp className="w-2.5 h-2.5" />}
                    {isDown && <TrendingDown className="w-2.5 h-2.5" />}
                    {!isUp && !isDown && <Minus className="w-2.5 h-2.5" />}
                    <span>{item.variationPercent > 0 ? `+${item.variationPercent}%` : `${item.variationPercent}%`}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick CTA to Full Bourse */}
        <button
          id="btn-ticker-view-all"
          type="button"
          onClick={() => setActiveTab('wholesale')}
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-[#0e2118] hover:bg-[#153426] border border-emerald-900/60 shrink-0 transition"
        >
          <span>{tr(language, 'Toute la cote', 'عرض كل الأسعار', 'All Quotes')}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
