import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import {
  Bell,
  CheckCircle2,
  TrendingDown,
  Sprout,
  ShieldCheck,
  Clock,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    language,
    notificationSettings,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotificationHistory,
    setActiveTab,
  } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'price_drop' | 'new_nursery_lot' | 'order' | 'system'>('ALL');

  const history = notificationSettings.notificationHistory || [];

  const filtered = history.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'price_drop') return n.type === 'price_drop';
    if (filterType === 'new_nursery_lot') return n.type === 'new_nursery_lot';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>CENTRE DE NOTIFICATIONS & ALERTES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {tr(language, 'Notifications & Veille Marché', 'مركز التنبيهات والإشعارات', 'Notifications & Market Alerts')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(
              language,
              'Suivez les baisses de prix, les nouveaux arrivages de plants certifiés et les mises à jour de commandes.',
              'تتبع انخفاض الأسعار، وصول شحنات الشتائل الجديدة وتحديثات الطلبيات.',
              'Track price drops, new nursery arrivals, and order updates.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tout marquer lu</span>
              </button>

              <button
                type="button"
                onClick={clearNotificationHistory}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filtres par type */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {(['ALL', 'price_drop', 'new_nursery_lot'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              filterType === t
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            {t === 'ALL'
              ? 'Toutes les alertes'
              : t === 'price_drop'
              ? '📉 Baisses de prix'
              : '🌱 Nouveaux plants pépinière'}
          </button>
        ))}
      </div>

      {/* Liste ou état vide */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <Bell className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-stone-500 text-xs">
            {tr(language, 'Aucune notification enregistrée.', 'لا توجد تنبيهات جديدة.', 'No notifications found.')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                if (item.targetTab) setActiveTab(item.targetTab as any);
              }}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                item.read
                  ? 'bg-white border-stone-200 opacity-80'
                  : 'bg-emerald-50/40 border-emerald-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
                  {item.type === 'price_drop' ? (
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Sprout className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">{item.title}</h4>
                  <p className="text-xs text-stone-600 mt-0.5">{item.message}</p>
                  <span className="text-[10px] text-stone-400 mt-1 block">{item.timestamp}</span>
                </div>
              </div>

              {!item.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
