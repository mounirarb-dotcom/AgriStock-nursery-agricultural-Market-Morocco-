import React, { useState, useMemo } from 'react';
import {
  X,
  Bell,
  BellRing,
  AlertTriangle,
  Check,
  RotateCcw,
  Search,
  Sliders,
  Sparkles,
  Info,
  ShieldAlert,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  getBrowserNotificationStatus,
  requestBrowserNotificationPermission,
  sendTestBrowserNotification,
} from '../utils/notificationUtils';

interface Props {
  onClose: () => void;
}

export const LowStockSettingsModal: React.FC<Props> = ({ onClose }) => {
  const {
    language,
    nurseryLots,
    lowStockConfig,
    updateDefaultLowStockThreshold,
    updateVarietyLowStockThreshold,
    removeVarietyLowStockThreshold,
    toggleBrowserNotifications,
    getLotThreshold,
  } = useAppContext();

  const [defaultThreshold, setDefaultThreshold] = useState<number>(
    lowStockConfig.defaultThreshold
  );
  const [varietyThresholds, setVarietyThresholds] = useState<Record<string, number>>({
    ...lowStockConfig.varietyThresholds,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(getBrowserNotificationStatus());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Group nursery lots by unique variety to manage per-variety thresholds
  const uniqueVarieties = useMemo(() => {
    const map = new Map<string, { variety: string; species: string; category: string; totalAvailable: number }>();
    nurseryLots.forEach(lot => {
      const existing = map.get(lot.variety);
      if (existing) {
        existing.totalAvailable += lot.quantityAvailable;
      } else {
        map.set(lot.variety, {
          variety: lot.variety,
          species: lot.species,
          category: lot.category,
          totalAvailable: lot.quantityAvailable,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.variety.localeCompare(b.variety));
  }, [nurseryLots]);

  const filteredVarieties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return uniqueVarieties;
    return uniqueVarieties.filter(
      v =>
        v.variety.toLowerCase().includes(term) ||
        v.species.toLowerCase().includes(term) ||
        v.category.toLowerCase().includes(term)
    );
  }, [uniqueVarieties, searchTerm]);

  // Handle request permission
  const handleEnableNotifications = async () => {
    const perm = await requestBrowserNotificationPermission();
    setNotificationStatus(getBrowserNotificationStatus());
    if (perm === 'granted') {
      await toggleBrowserNotifications(true);
    } else {
      await toggleBrowserNotifications(false);
    }
  };

  const handleTestNotification = () => {
    const sent = sendTestBrowserNotification();
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 4000);
  };

  const handleSaveAll = () => {
    updateDefaultLowStockThreshold(defaultThreshold);
    // Update each variety threshold
    Object.entries(varietyThresholds).forEach(([variety, thresh]) => {
      const num = Number(thresh);
      if (num > 0) {
        updateVarietyLowStockThreshold(variety, num);
      }
    });
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetRecommended = () => {
    const recommended: Record<string, number> = {
      'Picholine Marocaine': 800,
      'Nadorcott / Afourer': 1000,
      'Tomate Ronde Greffée sur Maxifort': 5000,
      'Poivron Carré Rouge & Jaune F1 (California type)': 4000,
      'Palmier Dattier (Phoenix dactylifera)': 1500,
      'Mejhoul (Medjool) Certifié': 1500,
      'Washingtonia Robusta de Californie & Maroc': 200,
      'Bougainvillier Violet Pourpre & Rose Fuchsia': 300,
      'Laurier-rose d\'Alger & Blanc Pur (Haie rustique)': 500,
      'Paspalum SeaIsle 2000 (Tolérant Salinité & Chaleur)': 2000,
    };
    setDefaultThreshold(500);
    setVarietyThresholds(recommended);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {tr(language, 'Configuration des Alertes Stock Bas', 'إعدادات تنبيهات نقص المخزون', 'Low Stock Alert Settings')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {tr(language, 'Pépinière', 'المشتل', 'Nursery')}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                {tr(
                  language,
                  'Définissez le seuil minimal global ou par variété, et activez les notifications du navigateur.',
                  'حدد عتبات المخزون الأدنى لكل صنف وفعّل إشعارات المتصفح الفورية.',
                  'Set global or per-variety minimum thresholds and enable browser notifications.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label={tr(language, 'Fermer', 'إغلاق', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-stone-800">
          
          {/* 1. Canal Notifications Push / Navigateur */}
          <div className="rounded-2xl border border-stone-200 p-4 sm:p-5 bg-stone-50/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  lowStockConfig.browserNotificationsEnabled && notificationStatus.permission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-stone-900">
                      {tr(language, 'Notifications Push du Navigateur', 'إشعارات المتصفح الفورية', 'Browser Push Notifications')}
                    </h4>
                    {notificationStatus.permission === 'granted' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Check className="w-3 h-3 text-emerald-700" />
                        {tr(language, 'Autorisées', 'مفعلة ومسموح بها', 'Allowed')}
                      </span>
                    ) : notificationStatus.permission === 'denied' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                        <ShieldAlert className="w-3 h-3 text-rose-700" />
                        {tr(language, 'Bloquées par le navigateur', 'محظورة من المتصفح', 'Blocked by browser')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                        {tr(language, 'Non configurées', 'غير مهيأة', 'Not configured')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {tr(
                      language,
                      "Recevez une notification sur votre écran dès qu'une variété descend sous son seuil configuré lors d'une vente, commande ou ajustement.",
                      'تلق إشعاراً على شاشتك بمجرد انخفاض أي صنف عن حده الأدنى عند البيع أو التعديل.',
                      'Receive a notification on your screen as soon as a variety falls below its configured threshold during a sale, order, or adjustment.'
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Notifications */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {notificationStatus.permission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{tr(language, 'Autoriser les notifications', 'السماح بالإشعارات', 'Allow notifications')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleBrowserNotifications(!lowStockConfig.browserNotificationsEnabled)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                      lowStockConfig.browserNotificationsEnabled
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>{lowStockConfig.browserNotificationsEnabled ? tr(language, 'Activées ✓', 'مفعلة ✓', 'Enabled ✓') : tr(language, 'Désactivées', 'معطلة', 'Disabled')}</span>
                  </button>
                )}

                {notificationStatus.permission === 'granted' && (
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-semibold transition cursor-pointer"
                    title={tr(language, 'Envoyer une notification test', 'إرسال إشعار تجريبي', 'Send test notification')}
                  >
                    <Send className="w-3.5 h-3.5 text-stone-500" />
                    <span>{tr(language, 'Tester', 'تجربة', 'Test')}</span>
                  </button>
                )}
              </div>
            </div>

            {testNotificationSent && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tr(language, 'Notification de test émise avec succès vers votre navigateur.', 'تم إرسال إشعار التجربة بنجاح إلى متصفحك.', 'Test notification successfully sent to your browser.')}</span>
              </div>
            )}
          </div>

          {/* 2. Seuil Global par Défaut */}
          <div className="rounded-2xl border border-stone-200 p-4 sm:p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  {tr(language, "Seuil d'Alerte Global par Défaut", 'عتبة التنبيه العامة الافتراضية', 'Default Global Alert Threshold')}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  {tr(language, "S'applique à tous les lots qui n'ont pas de seuil personnalisé.", 'ينطبق على جميع الدفعات التي ليس لها حد خاص.', 'Applies to all lots without a custom threshold.')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100000"
                  step="50"
                  value={defaultThreshold}
                  onChange={e => setDefaultThreshold(Math.max(1, Number(e.target.value) || 1))}
                  className="w-28 text-center py-2 px-2.5 rounded-xl border-2 border-amber-400 focus:outline-emerald-600 font-black text-stone-900 text-base"
                />
                <span className="text-xs font-bold text-stone-500">{tr(language, 'plants', 'شتلة', 'plants')}</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-stone-100 text-xs">
              <span className="text-stone-400 font-medium">{tr(language, 'Préréglages rapides :', 'إعدادات سريعة :', 'Quick presets:')}</span>
              {[100, 250, 500, 1000, 2500].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDefaultThreshold(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    defaultThreshold === val
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {(val ?? 0).toLocaleString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')} {tr(language, 'plants', 'شتلة', 'plants')}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Seuils Spécifiques par Variété */}
          <div className="rounded-2xl border border-stone-200 p-4 sm:p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  {tr(
                    language,
                    `Seuils Spécifiques par Variété (${uniqueVarieties.length} variétés)`,
                    `عتبات خاصة بالأصناف (${uniqueVarieties.length} أصناف)`,
                    `Variety-Specific Thresholds (${uniqueVarieties.length} varieties)`
                  )}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  {tr(
                    language,
                    'Ajustez les seuils selon le cycle cultural (ex: 5 000 plants en maraîchage, 50 en palmiers spécimens).',
                    'اضبط العتبات حسب طبيعة الزراعة (مثال: 5000 شتلة خضار، 50 نخلة).',
                    'Adjust thresholds based on crop cycle (e.g., 5,000 for vegetables, 50 for specimen palms).'
                  )}
                </p>
              </div>

              {/* Search Bar for Varieties */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={tr(language, 'Filtrer les variétés...', 'تصفية الأصناف...', 'Filter varieties...')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Varieties List Table */}
            <div className="rounded-xl border border-stone-200 overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-bold text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">{tr(language, 'Variété / Espèce', 'الصنف / النوع', 'Variety / Species')}</th>
                    <th className="py-2.5 px-3">{tr(language, 'Stock Actuel', 'المخزون الحالي', 'Current Stock')}</th>
                    <th className="py-2.5 px-3">{tr(language, 'État', 'الحالة', 'Status')}</th>
                    <th className="py-2.5 px-3 text-right">{tr(language, "Seuil d'alerte", 'عتبة التنبيه', 'Alert threshold')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredVarieties.map(item => {
                    const currentThreshold = varietyThresholds[item.variety] ?? defaultThreshold;
                    const isCustom = varietyThresholds[item.variety] !== undefined;
                    const isLow = item.totalAvailable <= currentThreshold;

                    return (
                      <tr key={item.variety} className={`hover:bg-stone-50 transition ${
                        isLow ? 'bg-amber-50/50' : ''
                      }`}>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-stone-900 block truncate max-w-xs">
                            {item.variety}
                          </span>
                          <span className="text-[10px] text-stone-500 block truncate max-w-xs">
                            {item.species}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-stone-800">
                          {(item.totalAvailable ?? 0).toLocaleString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')} {tr(language, 'plants', 'شتلة', 'plants')}
                        </td>
                        <td className="py-2.5 px-3">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              {tr(language, 'Stock Bas', 'مخزون منخفض', 'Low Stock')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                              {tr(language, 'Suffisant', 'كافٍ', 'Sufficient')}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100000"
                              step="50"
                              value={currentThreshold}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setVarietyThresholds(prev => ({
                                  ...prev,
                                  [item.variety]: Math.max(0, val),
                                }));
                              }}
                              className={`w-24 text-right py-1 px-2 rounded-lg border text-xs font-bold ${
                                isCustom
                                  ? 'border-amber-400 bg-amber-50/30 text-amber-950 font-black'
                                  : 'border-stone-300 text-stone-700'
                              }`}
                            />
                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => {
                                  setVarietyThresholds(prev => {
                                    const next = { ...prev };
                                    delete next[item.variety];
                                    return next;
                                  });
                                  removeVarietyLowStockThreshold(item.variety);
                                }}
                                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                                title={tr(language, 'Réinitialiser au seuil global', 'إعادة التعيين للعتبة العامة', 'Reset to global threshold')}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Helper Tips */}
            <div className="flex items-start gap-2 text-[11px] text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>{tr(language, 'Conseil Pro :', 'نصيحة مهنية :', 'Pro Tip:')}</strong>{' '}
                {tr(
                  language,
                  'Vous pouvez également définir un seuil spécifique pour un lot particulier lors de sa création ou modification dans la fiche lot.',
                  'يمكنك أيضاً تحديد عتبة خاصة بدفعة معينة أثناء إنشائها أو تعديلها في بطاقة الدفعة.',
                  'You can also set a specific threshold for an individual lot during creation or editing in the lot sheet.'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetRecommended}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold underline transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{tr(language, 'Valeurs recommandées', 'القيم الموصى بها', 'Recommended values')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-700 hover:bg-stone-200 text-xs font-bold transition cursor-pointer"
            >
              {tr(language, 'Annuler', 'إلغاء', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saveSuccess ? tr(language, 'Enregistré !', 'تم الحفظ !', 'Saved!') : tr(language, 'Enregistrer & Appliquer', 'حفظ وتطبيق', 'Save & Apply')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
