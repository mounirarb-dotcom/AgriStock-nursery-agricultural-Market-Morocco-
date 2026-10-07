import React, { useEffect } from 'react';
import { TrendingDown, Sprout, X, Eye, BellRing, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';

export const MarketplaceNotificationToast: React.FC = () => {
  const {
    language,
    latestMarketplaceToast,
    dismissMarketplaceToast,
    setActiveTab,
    openNotificationSettings,
  } = useApp();

  useEffect(() => {
    if (latestMarketplaceToast) {
      const timer = setTimeout(() => {
        dismissMarketplaceToast();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [latestMarketplaceToast, dismissMarketplaceToast]);

  if (!latestMarketplaceToast) return null;

  const isPriceDrop = latestMarketplaceToast.type === 'price_drop';

  const handleActionClick = () => {
    if (latestMarketplaceToast.targetTab === 'market') {
      setActiveTab('market');
    } else if (latestMarketplaceToast.targetTab === 'nursery') {
      setActiveTab('nursery');
    }
    dismissMarketplaceToast();
  };

  return (
    <div
      id="marketplace-notification-toast"
      className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-4 z-50 sm:max-w-md w-auto animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
      role="alert"
    >
      <div
        className={`p-4 rounded-3xl shadow-2xl border backdrop-blur-md transition-all ${
          isPriceDrop
            ? 'bg-stone-900/95 border-emerald-500/80 text-white'
            : 'bg-stone-900/95 border-blue-500/80 text-white'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
              isPriceDrop
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 animate-pulse'
                : 'bg-blue-500/20 text-blue-400 border border-blue-400/40 animate-pulse'
            }`}
          >
            {isPriceDrop ? <TrendingDown className="w-5 h-5" /> : <Sprout className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full ${
                    isPriceDrop
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {isPriceDrop
                    ? tr(language, 'Alerte Baisse de Prix', 'تنبيه انخفاض السعر', 'Price Drop Alert')
                    : tr(language, 'Arrivage Pépinière', 'دفعة مشتل جديدة', 'Nursery Arrival')}
                </span>
              </div>
              <span className="text-[10px] text-stone-400">{latestMarketplaceToast.timestamp}</span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
              {latestMarketplaceToast.title}
            </h4>

            <p className="text-[11px] text-stone-300 mt-1 line-clamp-2 leading-relaxed">
              {latestMarketplaceToast.message}
            </p>

            {/* CTAs */}
            <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between gap-2">
              <button
                id="btn-toast-view-listing"
                type="button"
                onClick={handleActionClick}
                className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {isPriceDrop
                    ? tr(language, 'Voir sur le Marché', 'عرض في البورصة', 'View on Market')
                    : tr(language, 'Consulter en Pépinière', 'معاينة بالمشتل', 'View in Nursery')}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="btn-toast-open-settings"
                  type="button"
                  onClick={() => {
                    dismissMarketplaceToast();
                    openNotificationSettings(isPriceDrop ? 'price_drops' : 'nursery_lots');
                  }}
                  className="text-[10px] text-stone-400 hover:text-stone-200 underline cursor-pointer"
                >
                  {tr(language, 'Gérer alertes', 'إدارة التنبيهات', 'Manage alerts')}
                </button>

                <button
                  id="btn-toast-dismiss"
                  type="button"
                  onClick={dismissMarketplaceToast}
                  className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
