import React, { useState } from 'react';
import {
  CalendarClock,
  Zap,
  CheckCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
  Bell,
  RotateCcw,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { tr } from '../utils/translations';

interface Props {
  onOpenQuickSync: () => void;
}

export const DailyStockSyncBanner: React.FC<Props> = ({ onOpenQuickSync }) => {
  const {
    language,
    nurseryLots,
    dailySyncRecord,
    confirmAllNurseryLotsSyncedToday,
    updateDailySyncSettings,
  } = useAppContext();

  const [isCelebrationActive, setIsCelebrationActive] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const lotsUpdatedToday = nurseryLots.filter(l => l.lastUpdated === todayStr);
  const isFullySyncedToday =
    (dailySyncRecord.lastSyncDate === todayStr && dailySyncRecord.syncedLotsCount > 0) ||
    lotsUpdatedToday.length === nurseryLots.length;

  const unverifiedCount = nurseryLots.length - lotsUpdatedToday.length;

  const handle1TapConfirmAll = () => {
    confirmAllNurseryLotsSyncedToday();
    setIsCelebrationActive(true);
    setTimeout(() => {
      setIsCelebrationActive(false);
    }, 2800);
  };

  const todayFormatted = new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div id="daily-stock-sync-banner-container" className="space-y-2">
      {isFullySyncedToday ? (
        /* Reassurance banner when stock is fully synced today */
        <div
          id="daily-stock-sync-completed-banner"
          className="relative rounded-2xl bg-gradient-to-r from-emerald-900/10 via-emerald-800/15 to-emerald-900/10 border border-emerald-300/80 p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white tracking-wider">
                  {tr(language, 'Inventaire du jour certifié', 'المخزون مؤكد لليوم', 'Certified daily inventory')}
                </span>
                <span className="text-xs font-bold text-emerald-950 capitalize">
                  {todayFormatted}
                </span>
              </div>
              <p className="text-xs text-emerald-900/90 mt-0.5">
                {tr(
                  language,
                  `Tous vos lots (${nurseryLots.length} lots) sont certifiés à jour pour aujourd'hui. Vos disponibilités sont valorisées auprès des acheteurs.`,
                  `تمت مزامنة جميع الأصناف (${nurseryLots.length} دفعة). المشتل يظهر في أعلى نتائج البحث.`,
                  `All your lots (${nurseryLots.length} lots) are certified up to date for today. Your stock is prominently featured to buyers.`
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={onOpenQuickSync}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-300 shadow-2xs transition cursor-pointer"
              title={tr(language, 'Ouvrir Quick Sync pour ajuster un lot suite à une vente', 'فتح المزامنة السريعة لتعديل دفعة بعد عملية بيع', 'Open Quick Sync to adjust a lot after a sale')}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>{tr(language, 'Ajuster un lot', 'تعديل دفعة', 'Adjust a lot')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Actionable reminder banner when inventory needs daily verification */
        <div
          id="daily-stock-sync-reminder-banner"
          className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-600/10 to-amber-500/15 border-2 border-amber-500/50 p-4 sm:p-5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            {/* Left: Icon & Explanations */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <CalendarClock className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 shadow-xs">
                    {tr(language, "Rappel Quotidien d'Inventaire", 'تذكير المخزون اليومي', 'Daily Inventory Reminder')}
                  </span>
                  <span className="text-xs font-bold text-amber-950 capitalize">
                    {todayFormatted}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-900 bg-amber-200/70 px-2 py-0.2 rounded-md">
                    {unverifiedCount} {tr(language, 'lot(s) en attente', 'دفعة في الانتظار', 'pending lot(s)')}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-stone-950">
                  {tr(
                    language,
                    "Avez-vous synchronisé vos stocks de plants aujourd'hui ?",
                    'هل قمت بتحديث كميات الشتلات المتاحة في مشتلك اليوم؟',
                    'Have you synced your plant stocks today?'
                  )}
                </h3>

                <p className="text-xs text-stone-700 max-w-2xl leading-relaxed">
                  {tr(
                    language,
                    'Actualisez vos disponibilités en un seul tap : confirmez les quantités inchangées ou ajustez vos sorties de serre en quelques secondes.',
                    'تحديث المخزون بنقرة واحدة يعزز تصنيف مشتلك ويحمي من حجوزات الشتلات غير المتوفرة.',
                    'Update availability in 1 tap: confirm unchanged quantities or adjust nursery counts in seconds.'
                  )}
                </p>
              </div>
            </div>

            {/* Right: Direct 1-Tap Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 self-start lg:self-center">
              {/* 1-Tap Mark All As Unchanged */}
              <button
                type="button"
                id="btn-quick-confirm-all-today"
                onClick={handle1TapConfirmAll}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-xs shadow-md transition cursor-pointer"
                title={tr(language, "Valider en 1 clic que les stocks d'aujourd'hui sont identiques à ceux d'hier", 'تأكيد بنقرة واحدة أن مخزون اليوم مطابق للأمس', 'Certify in 1-click today stocks are identical to yesterday')}
              >
                {isCelebrationActive ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200 animate-bounce" />
                    <span>{tr(language, '✓ Certifié pour aujourd\'hui !', '✓ تم التأكيد لليوم !', '✓ Certified for today!')}</span>
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-200" />
                    <span>{tr(language, '1-Tap : Tout certifier inchangé', 'تأكيد دون تغيير (1 نقرة)', '1-Tap: Certify all unchanged')}</span>
                  </>
                )}
              </button>

              {/* Quick Sync Modal Trigger */}
              <button
                type="button"
                id="btn-open-quick-sync-modal"
                onClick={onOpenQuickSync}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-black text-xs shadow-md transition cursor-pointer"
                title={tr(language, 'Ajuster rapidement les stocks lot par lot avec boutons +/-', 'تعديل الكميات بسرعة دفعة بدفعة بأزرار +/-', 'Quickly adjust stocks lot-by-lot with +/- buttons')}
              >
                <Zap className="w-4 h-4 text-stone-950 fill-stone-950" />
                <span>{tr(language, '⚡ Quick Sync (+/-)', 'مزامنة سريعة (+/-)', '⚡ Quick Sync (+/-)')}</span>
              </button>

              {/* Reminder Settings Toggle */}
              <button
                type="button"
                onClick={() => setShowSettingsPopover(prev => !prev)}
                className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-amber-300 shadow-2xs transition cursor-pointer"
                title="Régler l'heure et l'activation du rappel automatique"
              >
                <Sliders className="w-4 h-4 text-stone-700" />
              </button>
            </div>
          </div>

          {/* Expanded Reminder Preference Settings */}
          {showSettingsPopover && (
            <div className="mt-3 pt-3 border-t border-amber-300/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-800 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span className="font-bold">{tr(language, 'Notification quotidienne de rappel :', 'إشعار التذكير اليومي :', 'Daily reminder notification:')}</span>
                <label className="relative inline-flex items-center cursor-pointer ml-1">
                  <input
                    type="checkbox"
                    checked={dailySyncRecord.reminderEnabled}
                    onChange={e => updateDailySyncSettings({ reminderEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span>{tr(language, 'Heure du rappel journalier :', 'وقت التذكير اليومي :', 'Daily reminder time:')}</span>
                <input
                  type="time"
                  value={dailySyncRecord.reminderHour || '17:00'}
                  onChange={e => updateDailySyncSettings({ reminderHour: e.target.value })}
                  className="px-2 py-1 bg-white rounded-lg border border-stone-300 font-mono text-xs text-stone-900 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowSettingsPopover(false)}
                  className="text-[11px] font-bold text-stone-600 hover:text-stone-900 underline ml-2 cursor-pointer"
                >
                  {tr(language, 'Fermer', 'إغلاق', 'Close')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
