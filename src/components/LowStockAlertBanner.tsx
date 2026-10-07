import React, { useState } from 'react';
import {
  AlertTriangle,
  Sliders,
  ChevronRight,
  Eye,
  X,
  BellRing,
  PackageX,
  RotateCcw,
} from 'lucide-react';
import { NurseryLot } from '../types';
import { useAppContext } from '../context/AppContext';
import { tr } from '../utils/translations';

interface Props {
  lowStockLots: NurseryLot[];
  isFilteredToLowStock: boolean;
  onToggleLowStockFilter: () => void;
  onOpenSettings: () => void;
}

export const LowStockAlertBanner: React.FC<Props> = ({
  lowStockLots,
  isFilteredToLowStock,
  onToggleLowStockFilter,
  onOpenSettings,
}) => {
  const { language, getLotThreshold, lowStockConfig } = useAppContext();
  const [isDismissed, setIsDismissed] = useState(false);

  if (lowStockLots.length === 0 || isDismissed) {
    return null;
  }

  // Count distinct varieties with low stock
  const distinctVarieties = Array.from(new Set(lowStockLots.map(l => l.variety)));

  return (
    <div
      id="nursery-low-stock-alert-banner"
      className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-500/40 p-4 sm:p-5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
    >
      {/* Decorative background pulse indicator */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Icon & Titles */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 shadow-xs">
                {tr(language, 'Alerte Seuil Critique', 'تنبيه أمان المخزون', 'Critical Low Stock Alert')}
              </span>
              <span className="text-xs font-bold text-amber-900">
                {lowStockLots.length}{' '}
                {lowStockLots.length > 1
                  ? tr(language, 'lots sous le seuil', 'دفعات تحت الحد الأدنى', 'lots below threshold')
                  : tr(language, 'lot sous le seuil', 'دفعة تحت الحد الأدنى', 'lot below threshold')}{' '}
                ({distinctVarieties.length} {distinctVarieties.length > 1 ? tr(language, 'variétés', 'أصناف', 'varieties') : tr(language, 'variété', 'صنف', 'variety')})
              </span>
              {lowStockConfig.browserNotificationsEnabled && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <BellRing className="w-3 h-3 text-emerald-600" />
                  {tr(language, 'Push actif', 'الإشعارات مفعلة', 'Push active')}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
              {tr(
                language,
                'Stock de pépinière bas : action de réapprovisionnement requise',
                'مخزون شتلات منخفض يحتاج إلى إعادة التموين',
                'Low nursery stock: replenishment required'
              )}
            </h3>

            {/* Quick badges of low-stock varieties */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {lowStockLots.slice(0, 4).map(lot => {
                const threshold = getLotThreshold(lot);
                return (
                  <span
                    key={lot.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/90 text-stone-900 border border-amber-300 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">{lot.variety}</span>
                    <span className="font-mono text-rose-700 font-black">
                      {lot.quantityAvailable.toLocaleString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')} / {threshold.toLocaleString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')}
                    </span>
                  </span>
                );
              })}
              {lowStockLots.length > 4 && (
                <span className="text-[11px] font-semibold text-amber-900 px-1.5 py-0.5 rounded bg-amber-100/80">
                  +{lowStockLots.length - 4} {tr(language, 'autres...', 'أخرى...', 'more...')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
          <button
            type="button"
            id="btn-filter-low-stock"
            onClick={onToggleLowStockFilter}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              isFilteredToLowStock
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-white hover:bg-stone-50 text-stone-900 border border-amber-300'
            }`}
          >
            {isFilteredToLowStock ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{tr(language, 'Afficher tout le stock', 'عرض كل المخزون', 'Show all stock')}</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>{tr(language, `Voir les ${lowStockLots.length} lots en alerte`, `عرض ${lowStockLots.length} دفعات منبهة`, `View ${lowStockLots.length} alerted lots`)}</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-config-low-stock-modal"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            title={tr(language, 'Ajuster les seuils par variété et les notifications push', 'ضبط الحدود الدنيا والإشعارات', 'Adjust variety thresholds and push notifications')}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>{tr(language, 'Seuils & Alertes', 'الحدود والتنبيهات', 'Thresholds & Alerts')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-black/5 transition cursor-pointer"
            title="Masquer cette alerte pour l'instant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
