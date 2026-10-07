import React, { useEffect } from 'react';
import { AlertTriangle, X, Eye, Sliders } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const LowStockNotificationToast: React.FC = () => {
  const {
    latestLowStockAlert,
    dismissLowStockAlert,
    setIsLowStockSettingsModalOpen,
    setActiveTab,
    setNurseryDepartmentFilter,
  } = useAppContext();

  useEffect(() => {
    if (latestLowStockAlert) {
      const timer = setTimeout(() => {
        dismissLowStockAlert();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [latestLowStockAlert, dismissLowStockAlert]);

  if (!latestLowStockAlert) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="p-4 rounded-2xl shadow-2xl border border-amber-400 bg-stone-900/95 text-white flex items-start gap-3 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Alerte Stock Bas Pépinière
            </span>
            <span className="text-[10px] text-stone-400">{latestLowStockAlert.time}</span>
          </div>

          <h4 className="text-xs font-bold text-white mt-0.5 truncate">
            {latestLowStockAlert.variety}
          </h4>

          <p className="text-[11px] text-stone-300 mt-1 leading-snug">
            Le stock du lot <span className="font-mono text-amber-300 font-bold">{latestLowStockAlert.lotBatch}</span> est tombé à{' '}
            <strong className="text-rose-400">{(latestLowStockAlert.currentQty || 0).toLocaleString('fr-FR')} plants</strong> (seuil minimal : {(latestLowStockAlert.threshold || 0).toLocaleString('fr-FR')} plants).
          </p>

          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-stone-800 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('nursery');
                dismissLowStockAlert();
              }}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Voir en pépinière</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLowStockSettingsModalOpen(true);
                dismissLowStockAlert();
              }}
              className="flex items-center gap-1 text-stone-400 hover:text-stone-200"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajuster seuil</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissLowStockAlert}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
