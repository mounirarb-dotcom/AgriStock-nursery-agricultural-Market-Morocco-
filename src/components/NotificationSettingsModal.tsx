import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  Bell,
  BellRing,
  BellOff,
  TrendingDown,
  Sprout,
  Check,
  CheckCheck,
  Trash2,
  Plus,
  Sliders,
  X,
  ExternalLink,
  ShieldCheck,
  Tag,
  MapPin,
  Calendar,
  Zap,
  RotateCcw,
  Info,
  ChevronRight,
  Sparkles,
  Smartphone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import {
  getBrowserNotificationStatus,
  requestBrowserNotificationPermission,
} from '../utils/notificationUtils';

const PRESET_PRODUCE = [
  { name: 'Tomates Rondes Lisses', category: 'Légume' as const, variety: 'Torry F1', region: 'Souss-Massa (Agadir, Taroudant, Chtouka)', targetPrice: 4.8 },
  { name: 'Clémentines Nadorcott', category: 'Fruit' as const, variety: 'Afourer / Nadorcott', region: 'Berkane / Oriental', targetPrice: 6.2 },
  { name: 'Avocats Hass', category: 'Fruit' as const, variety: 'Hass Calibre 16-18', region: 'Rabat - Salé - Kénitra (Gharb)', targetPrice: 22.0 },
  { name: 'Pommes de terre Spunta', category: 'Légume' as const, variety: 'Spunta / Nicola', region: 'Fès - Meknès (Saïss)', targetPrice: 3.5 },
  { name: 'Oignons Rouges', category: 'Légume' as const, variety: 'Oignon rouge du Tadla', region: 'Béni Mellal - Khénifra', targetPrice: 2.8 },
  { name: 'Pastèques de Zagora', category: 'Fruit' as const, variety: 'Pastèque Crimson', region: 'Drâa - Tafilalet (Zagora)', targetPrice: 2.5 },
  { name: 'Myrtilles Export', category: 'Fruit' as const, variety: 'Ventura / Star', region: 'Tanger - Tétouan - Al Hoceïma (Loukkos)', targetPrice: 45.0 },
  { name: 'Poivrons Carrés', category: 'Légume' as const, variety: 'California Wonder Rouge', region: 'Souss-Massa (Chtouka)', targetPrice: 5.5 },
];

const PRESET_NURSERY = [
  { species: 'Olivier (Olea europaea)', variety: 'Picholine Marocaine', minQty: 500, region: 'Marrakech - Safi (Haouz, El Kelaâ)' },
  { species: 'Olivier (Olea europaea)', variety: 'Arbequina (Haute Densité)', minQty: 1000, region: 'Fès - Meknès' },
  { species: 'Clémentinier (Citrus clementina)', variety: 'Nadorcott / Afourer', minQty: 500, region: 'Souss-Massa (Taroudant)' },
  { species: 'Citronnier 4 Saisons', variety: 'Eureka / Quatre Saisons', minQty: 250, region: 'Souss-Massa (Agadir)' },
  { species: 'Avocatier Greffé', variety: 'Hass sur porte-greffe Dusa', minQty: 300, region: 'Rabat - Salé - Kénitra (Gharb)' },
  { species: 'Palmier Dattier in vitro', variety: 'Mejhoul (Medjool) Certifié', minQty: 100, region: 'Drâa - Tafilalet (Errachidia)' },
  { species: 'Plants Maraîchers', variety: 'Tomate Ronde Greffée Maxifort', minQty: 2000, region: 'Souss-Massa (Chtouka)' },
  { species: 'Amandier Greffé', variety: 'Ferragnès / Guara Autofertile', minQty: 400, region: 'Oriental / Saïss' },
];

const MOROCCAN_REGIONS = [
  'Toutes régions',
  'Souss-Massa (Agadir, Taroudant, Chtouka)',
  'Marrakech - Safi (Haouz, El Kelaâ)',
  'Fès - Meknès (Saïss)',
  'Rabat - Salé - Kénitra (Gharb)',
  'Berkane / Oriental',
  'Tanger - Tétouan - Al Hoceïma (Loukkos)',
  'Béni Mellal - Khénifra (Tadla)',
  'Drâa - Tafilalet',
];

export const NotificationSettingsModal: React.FC = () => {
  const {
    language,
    isNotificationSettingsModalOpen,
    setIsNotificationSettingsModalOpen,
    activeNotificationSettingsTab,
    setActiveNotificationSettingsTab,
    notificationSettings,
    updateNotificationSettings,
    addPriceDropWatch,
    removePriceDropWatch,
    togglePriceDropWatch,
    addNurseryInterestWatch,
    removeNurseryInterestWatch,
    toggleNurseryInterestWatch,
    triggerSimulatedNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotificationHistory,
    unreadNotificationsCount,
    setActiveTab,
  } = useApp();

  // Local form state for new produce alert
  const [showAddProduceForm, setShowAddProduceForm] = useState(false);
  const [newProduceName, setNewProduceName] = useState('');
  const [newProduceCategory, setNewProduceCategory] = useState<'Fruit' | 'Légume'>('Légume');
  const [newProduceVariety, setNewProduceVariety] = useState('');
  const [newProduceTargetPrice, setNewProduceTargetPrice] = useState<string>('');
  const [newProduceDropPercent, setNewProduceDropPercent] = useState<number>(10);
  const [newProduceRegion, setNewProduceRegion] = useState<string>('Toutes régions');

  // Local form state for new nursery interest
  const [showAddNurseryForm, setShowAddNurseryForm] = useState(false);
  const [newNurserySpecies, setNewNurserySpecies] = useState('');
  const [newNurseryVariety, setNewNurseryVariety] = useState('');
  const [newNurseryOnssaOnly, setNewNurseryOnssaOnly] = useState(true);
  const [newNurseryMinQty, setNewNurseryMinQty] = useState<number>(500);
  const [newNurseryRegion, setNewNurseryRegion] = useState<string>('Toutes régions');

  // Browser notification status
  const [browserPermStatus, setBrowserPermStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>(() => {
    return getBrowserNotificationStatus().permission;
  });
  const [browserPermRequested, setBrowserPermRequested] = useState(false);

  if (!isNotificationSettingsModalOpen) return null;

  const handleRequestBrowserPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserPermStatus(perm);
    setBrowserPermRequested(true);
    if (perm === 'granted') {
      updateNotificationSettings({ browserPushEnabled: true });
    }
  };

  const handleAddProduceWatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduceName.trim()) return;

    addPriceDropWatch({
      produceName: newProduceName.trim(),
      category: newProduceCategory,
      variety: newProduceVariety.trim() || undefined,
      maxTargetPrice: newProduceTargetPrice ? parseFloat(newProduceTargetPrice) : undefined,
      minDropPercent: newProduceDropPercent,
      region: newProduceRegion === 'Toutes régions' ? undefined : newProduceRegion,
      enabled: true,
    });

    setNewProduceName('');
    setNewProduceVariety('');
    setNewProduceTargetPrice('');
    setShowAddProduceForm(false);
  };

  const handleAddNurseryWatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNurserySpecies.trim()) return;

    addNurseryInterestWatch({
      speciesOrCategory: newNurserySpecies.trim(),
      variety: newNurseryVariety.trim() || undefined,
      onssaOnly: newNurseryOnssaOnly,
      minQuantity: newNurseryMinQty,
      region: newNurseryRegion === 'Toutes régions' ? undefined : newNurseryRegion,
      enabled: true,
    });

    setNewNurserySpecies('');
    setNewNurseryVariety('');
    setShowAddNurseryForm(false);
  };

  const activePriceWatchesCount = notificationSettings.priceDropWatches.filter((w) => w.enabled).length;
  const activeNurseryWatchesCount = notificationSettings.nurseryInterestWatches.filter((w) => w.enabled).length;

  return (
    <div
      id="notification-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsNotificationSettingsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0c2217] via-[#133022] to-[#1a402d] text-white p-5 sm:p-6 border-b border-[#214d37] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
                <BellRing className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-800/80 text-emerald-200 border border-emerald-500/40">
                    {tr(language, 'Centre d\'Alertes B2B', 'مركز التنبيهات B2B', 'B2B Alert Center')}
                  </span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-bounce">
                      {unreadNotificationsCount} {tr(language, 'nouvelle(s)', 'جديد', 'new')}
                    </span>
                  )}
                </div>
                <h2 id="notif-modal-title" className="text-xl sm:text-2xl font-black text-white mt-1">
                  {tr(
                    language,
                    'Veille & Alertes Marché Personnalisées',
                    'إعدادات التنبيهات ومتابعة الأسعار',
                    'Custom Market Alerts & Inventory Watch'
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-0.5">
                  {tr(
                    language,
                    'Soyez averti en temps réel des baisses de prix sur les récoltes et des arrivages de plants correspondant à vos critères.',
                    'تلقى إشعارات فورية عند انخفاض أسعار الخضر والفواكه أو وصول دفعات شتلات جديدة توافق اهتماماتك.',
                    'Get instant alerts for produce price drops and newly listed nursery lots matching your interests.'
                  )}
                </p>
              </div>
            </div>

            <button
              id="btn-close-notification-modal"
              type="button"
              onClick={() => setIsNotificationSettingsModalOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
              title={tr(language, 'Fermer', 'إغلاق', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-stone-400 block">{tr(language, 'Alertes Récoltes Actives', 'تنبيهات المحاصيل النشطة', 'Active Produce Alerts')}</span>
              <span className="font-bold text-emerald-300 text-sm">{activePriceWatchesCount} {tr(language, 'surveillances', 'مراقبة', 'watches')}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-stone-400 block">{tr(language, 'Intérêts Pépinière', 'اهتمامات المشاتل', 'Nursery Interests')}</span>
              <span className="font-bold text-emerald-300 text-sm">{activeNurseryWatchesCount} {tr(language, 'variétés', 'أصناف', 'varieties')}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-stone-400 block">{tr(language, 'Canal Web Push', 'الإشعارات بالمتصفح', 'Web Push Status')}</span>
              <span className={`font-bold text-sm ${browserPermStatus === 'granted' && notificationSettings.browserPushEnabled ? 'text-emerald-300' : 'text-amber-300'}`}>
                {browserPermStatus === 'granted' && notificationSettings.browserPushEnabled ? tr(language, 'Actif ✓', 'مفعل ✓', 'Active ✓') : tr(language, 'Désactivé', 'غير مفعل', 'Disabled')}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-stone-400 block">{tr(language, 'Notifications Reçues', 'الإشعارات المستلمة', 'Received Alerts')}</span>
              <span className="font-bold text-white text-sm">{notificationSettings.notificationHistory.length} {tr(language, 'historiques', 'تنبيه', 'events')}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 sm:px-6 overflow-x-auto shrink-0 gap-2">
          <button
            id="tab-btn-price-drops"
            type="button"
            onClick={() => setActiveNotificationSettingsTab('price_drops')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeNotificationSettingsTab === 'price_drops'
                ? 'border-emerald-700 text-emerald-900 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <TrendingDown className={`w-4 h-4 ${activeNotificationSettingsTab === 'price_drops' ? 'text-emerald-600' : 'text-stone-400'}`} />
            <span>{tr(language, 'Baisses de Prix Récoltes', 'تخفيضات أسعار المحاصيل', 'Produce Price Drops')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              {notificationSettings.priceDropWatches.length}
            </span>
          </button>

          <button
            id="tab-btn-nursery-lots"
            type="button"
            onClick={() => setActiveNotificationSettingsTab('nursery_lots')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeNotificationSettingsTab === 'nursery_lots'
                ? 'border-emerald-700 text-emerald-900 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <Sprout className={`w-4 h-4 ${activeNotificationSettingsTab === 'nursery_lots' ? 'text-emerald-600' : 'text-stone-400'}`} />
            <span>{tr(language, 'Arrivages Pépinières', 'دفعات المشاتل الجديدة', 'Nursery Inventory')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              {notificationSettings.nurseryInterestWatches.length}
            </span>
          </button>

          <button
            id="tab-btn-channels"
            type="button"
            onClick={() => setActiveNotificationSettingsTab('channels')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeNotificationSettingsTab === 'channels'
                ? 'border-emerald-700 text-emerald-900 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <Sliders className={`w-4 h-4 ${activeNotificationSettingsTab === 'channels' ? 'text-emerald-600' : 'text-stone-400'}`} />
            <span>{tr(language, 'Canaux & Modes', 'قنوات التنبيه', 'Channels & Delivery')}</span>
          </button>

          <button
            id="tab-btn-history"
            type="button"
            onClick={() => setActiveNotificationSettingsTab('history')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeNotificationSettingsTab === 'history'
                ? 'border-emerald-700 text-emerald-900 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <Bell className={`w-4 h-4 ${activeNotificationSettingsTab === 'history' ? 'text-emerald-600' : 'text-stone-400'}`} />
            <span>{tr(language, 'Historique & Tests', 'سجل التنبيهات والتجربة', 'History & Tests')}</span>
            {unreadNotificationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: PRODUCE PRICE DROPS */}
          {activeNotificationSettingsTab === 'price_drops' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Master Toggle & Global Threshold */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notificationSettings.priceDropAlertsEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'}`}>
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900">
                      {tr(language, 'Alertes Générales sur les Baisses de Prix', 'التنبيهات العامة لانخفاض الأسعار', 'General Price Drop Alerts')}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {tr(language, 'Déclenche une notification lorsqu\'une récolte surveillée subit une baisse de prix avantageuse.', 'تفعيل الإشعار عند انخفاض سعر أي محصول مراقب في السوق.', 'Triggers alerts whenever a watched harvest listing drops in price.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold ${notificationSettings.priceDropAlertsEnabled ? 'text-emerald-800' : 'text-stone-400'}`}>
                    {notificationSettings.priceDropAlertsEnabled ? tr(language, 'Activé', 'مفعل', 'Enabled') : tr(language, 'Désactivé', 'معطل', 'Disabled')}
                  </span>
                  <button
                    id="toggle-master-price-drops"
                    type="button"
                    onClick={() => updateNotificationSettings({ priceDropAlertsEnabled: !notificationSettings.priceDropAlertsEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      notificationSettings.priceDropAlertsEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        notificationSettings.priceDropAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Global Minimum Percentage Threshold */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      {tr(language, 'Seuil Global de Baisse Requise', 'النسبة المئوية الدنيا للتخفيض', 'Minimum Price Drop Threshold')}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {tr(language, 'Alerter uniquement si le prix baisse d\'au moins ce pourcentage par rapport au prix précédent ou marché :', 'تنبيهي فقط إذا انخفض السعر بهذه النسبة على الأقل :', 'Only alert if the price drop is equal or greater than:')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                    {[5, 10, 15, 20, 25].map((pct) => (
                      <button
                        key={pct}
                        id={`btn-drop-thresh-${pct}`}
                        type="button"
                        onClick={() => updateNotificationSettings({ globalMinPriceDropPercent: pct })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          notificationSettings.globalMinPriceDropPercent === pct
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                        }`}
                      >
                        -{pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar: Add Price Alert */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <span>{tr(language, 'Vos Récoltes & Produits Surveillés', 'محاصيلك المراقبة', 'Your Monitored Produce')}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {notificationSettings.priceDropWatches.length}
                  </span>
                </h4>

                <button
                  id="btn-open-add-produce-watch"
                  type="button"
                  onClick={() => setShowAddProduceForm(!showAddProduceForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddProduceForm ? tr(language, 'Annuler', 'إلغاء', 'Cancel') : tr(language, '+ Ajouter une alerte produit', '+ إضافة تنبيه منتوج', '+ Add Produce Alert')}</span>
                </button>
              </div>

              {/* Add Produce Alert Form */}
              {showAddProduceForm && (
                <form
                  id="form-add-produce-watch"
                  onSubmit={handleAddProduceWatchSubmit}
                  className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 animate-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      {tr(language, 'Configurer une nouvelle surveillance de prix', 'ضبط تنبيه جديد لمنتوج', 'Configure New Price Watch')}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {tr(language, 'Suggestions rapides ci-dessous ou saisie libre', 'اقتراحات سريعة أو كتابة حرة', 'Quick suggestions or custom input')}
                    </span>
                  </div>

                  {/* Preset Suggestions */}
                  <div>
                    <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                      {tr(language, 'Produits marocains fréquents (cliquez pour pré-remplir) :', 'منتجات شائعة بالمغرب (انقر لملء فوري) :', 'Popular Moroccan crops (click to autofill):')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_PRODUCE.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setNewProduceName(preset.name);
                            setNewProduceCategory(preset.category);
                            setNewProduceVariety(preset.variety);
                            setNewProduceRegion(preset.region);
                            setNewProduceTargetPrice(preset.targetPrice.toString());
                          }}
                          className="px-2 py-1 rounded-lg text-xs bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium transition cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {tr(language, 'Nom du produit / Culture *', 'اسم المنتوج أو المحصول *', 'Crop Name *')}
                      </label>
                      <input
                        id="input-new-produce-name"
                        type="text"
                        required
                        value={newProduceName}
                        onChange={(e) => setNewProduceName(e.target.value)}
                        placeholder="Ex: Tomates cerises allongées, Avocats..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {tr(language, 'Variété spécifique (optionnel)', 'الصنف (اختياري)', 'Variety (optional)')}
                      </label>
                      <input
                        id="input-new-produce-variety"
                        type="text"
                        value={newProduceVariety}
                        onChange={(e) => setNewProduceVariety(e.target.value)}
                        placeholder="Ex: Torry F1, Hass, Nadorcott..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {tr(language, 'Prix cible max (MAD/kg)', 'السعر المستهدف الأقصى (درهم/كلغ)', 'Target Max Price (MAD/kg)')}
                      </label>
                      <input
                        id="input-new-produce-price"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={newProduceTargetPrice}
                        onChange={(e) => setNewProduceTargetPrice(e.target.value)}
                        placeholder="Ex: 5.50"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {tr(language, 'Baisse minimale déclenchante', 'النسبة الدنيا للتنبيه', 'Min drop trigger')}
                      </label>
                      <select
                        id="select-new-produce-drop"
                        value={newProduceDropPercent}
                        onChange={(e) => setNewProduceDropPercent(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        <option value={5}>-5% de baisse</option>
                        <option value={10}>-10% de baisse</option>
                        <option value={15}>-15% de baisse</option>
                        <option value={20}>-20% de baisse</option>
                        <option value={25}>-25% de baisse</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {tr(language, 'Région de provenance', 'الجهة المرغوبة', 'Origin Region')}
                      </label>
                      <select
                        id="select-new-produce-region"
                        value={newProduceRegion}
                        onChange={(e) => setNewProduceRegion(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        {MOROCCAN_REGIONS.map((reg) => (
                          <option key={reg} value={reg}>
                            {reg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProduceForm(false)}
                      className="px-3 py-2 rounded-xl bg-white text-stone-600 hover:bg-stone-100 text-xs font-bold border border-stone-200 transition cursor-pointer"
                    >
                      {tr(language, 'Annuler', 'إلغاء', 'Cancel')}
                    </button>
                    <button
                      id="btn-submit-add-produce-watch"
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                    >
                      {tr(language, 'Enregistrer cette Alerte Prix', 'حفظ التنبيه', 'Save Price Watch')}
                    </button>
                  </div>
                </form>
              )}

              {/* Price Watch List */}
              {notificationSettings.priceDropWatches.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <TrendingDown className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-700">
                    {tr(language, 'Aucune alerte de prix configurée.', 'لا توجد تنبيهات أسعار مفعلة حالياً.', 'No price alerts configured yet.')}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {tr(language, 'Ajoutez des cultures pour être notifié dès qu\'une bonne affaire se présente.', 'أضف محاصيلك المفضلة للتوصل بتخفيضات الأسعار أولاً بأول.', 'Add crops to get alerted as soon as discounts appear on the marketplace.')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddProduceForm(true)}
                    className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-2xs hover:bg-emerald-800 transition cursor-pointer"
                  >
                    + {tr(language, 'Créer ma première alerte', 'إنشاء أول تنبيه', 'Create first alert')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {notificationSettings.priceDropWatches.map((watch) => (
                    <div
                      key={watch.id}
                      id={`watch-card-${watch.id}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        watch.enabled
                          ? 'bg-white border-emerald-200/80 shadow-2xs'
                          : 'bg-stone-50/60 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-sm font-bold text-stone-900 truncate">
                              {watch.produceName}
                            </h5>
                            {watch.variety && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 truncate">
                                {watch.variety}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <TrendingDown className="w-3 h-3" />
                              ≥ -{watch.minDropPercent}%
                            </span>

                            {watch.maxTargetPrice && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                ≤ {watch.maxTargetPrice.toFixed(2)} MAD/kg
                              </span>
                            )}

                            {watch.region && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[160px]">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{watch.region.split('(')[0]}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            id={`toggle-watch-${watch.id}`}
                            type="button"
                            onClick={() => togglePriceDropWatch(watch.id)}
                            className={`p-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                              watch.enabled
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                            }`}
                            title={watch.enabled ? 'Désactiver cette alerte' : 'Activer cette alerte'}
                          >
                            {watch.enabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            id={`delete-watch-${watch.id}`}
                            type="button"
                            onClick={() => removePriceDropWatch(watch.id)}
                            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                            title="Supprimer cette alerte"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NEW NURSERY LOTS */}
          {activeNotificationSettingsTab === 'nursery_lots' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Master Toggle & ONSSA Requirement */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notificationSettings.nurseryAlertsEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'}`}>
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900">
                      {tr(language, 'Alertes Arrivages Pépinières & Nouveaux Stocks', 'تنبيهات دفعات المشاتل الجديدة', 'New Nursery Inventory Alerts')}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {tr(language, 'Recevez une notification instantanée dès qu\'un pépiniériste agréé publie un nouveau lot d\'arbres ou de plants correspondant à vos intérêts.', 'تلقى إشعاراً فورياً عند نشر حصة جديدة من الشتلات أو الأشجار المثمرة التي تهمك.', 'Instant notification when certified nurseries list new lots matching your plant interests.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold ${notificationSettings.nurseryAlertsEnabled ? 'text-emerald-800' : 'text-stone-400'}`}>
                    {notificationSettings.nurseryAlertsEnabled ? tr(language, 'Activé', 'مفعل', 'Enabled') : tr(language, 'Désactivé', 'معطل', 'Disabled')}
                  </span>
                  <button
                    id="toggle-master-nursery-alerts"
                    type="button"
                    onClick={() => updateNotificationSettings({ nurseryAlertsEnabled: !notificationSettings.nurseryAlertsEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      notificationSettings.nurseryAlertsEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        notificationSettings.nurseryAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Bar: Add Nursery Interest */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <span>{tr(language, 'Vos Espèces & Variétés Surveillées', 'الأصناف النباتية المراقبة', 'Your Monitored Plant Interests')}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {notificationSettings.nurseryInterestWatches.length}
                  </span>
                </h4>

                <button
                  id="btn-open-add-nursery-watch"
                  type="button"
                  onClick={() => setShowAddNurseryForm(!showAddNurseryForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddNurseryForm ? tr(language, 'Annuler', 'إلغاء', 'Cancel') : tr(language, '+ Ajouter un intérêt pépinière', '+ إضافة صنف مراقب', '+ Add Plant Interest')}</span>
                </button>
              </div>

              {/* Add Nursery Interest Form */}
              {showAddNurseryForm && (
                <form
                  id="form-add-nursery-watch"
                  onSubmit={handleAddNurseryWatchSubmit}
                  className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 animate-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-emerald-600" />
                      {tr(language, 'Ajouter une espèce ou variété de pépinière', 'إضافة صنف مشتل للمتابعة', 'Add Nursery Species or Variety')}
                    </span>
                  </div>

                  {/* Preset Suggestions */}
                  <div>
                    <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                      {tr(language, 'Variétés arboricoles & maraîchères courantes (cliquez pour pré-remplir) :', 'أصناف فلاحية شائعة بالمغرب (انقر للضبط السريع) :', 'Common varieties (click to autofill):')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_NURSERY.map((preset) => (
                        <button
                          key={`${preset.species}-${preset.variety}`}
                          type="button"
                          onClick={() => {
                            setNewNurserySpecies(preset.species);
                            setNewNurseryVariety(preset.variety);
                            setNewNurseryMinQty(preset.minQty);
                            setNewNurseryRegion(preset.region);
                          }}
                          className="px-2 py-1 rounded-lg text-xs bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium transition cursor-pointer"
                        >
                          {preset.variety}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {tr(language, 'Espèce / Type de plant *', 'النوع أو الفصيلة *', 'Species / Category *')}
                      </label>
                      <input
                        id="input-new-nursery-species"
                        type="text"
                        required
                        value={newNurserySpecies}
                        onChange={(e) => setNewNurserySpecies(e.target.value)}
                        placeholder="Ex: Olivier, Clémentinier, Avocatier, Maraîchage..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {tr(language, 'Variété recherchée (optionnel)', 'الصنف المرغوب (اختياري)', 'Variety (optional)')}
                      </label>
                      <input
                        id="input-new-nursery-variety"
                        type="text"
                        value={newNurseryVariety}
                        onChange={(e) => setNewNurseryVariety(e.target.value)}
                        placeholder="Ex: Picholine Marocaine, Mejhoul, Hass..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {tr(language, 'Quantité minimale du lot', 'الكمية الدنيا للحصة', 'Min Lot Quantity')}
                      </label>
                      <select
                        id="select-new-nursery-qty"
                        value={newNurseryMinQty}
                        onChange={(e) => setNewNurseryMinQty(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        <option value={100}>≥ 100 plants</option>
                        <option value={250}>≥ 250 plants</option>
                        <option value={500}>≥ 500 plants</option>
                        <option value={1000}>≥ 1 000 plants</option>
                        <option value={2500}>≥ 2 500 plants</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {tr(language, 'Région de la pépinière', 'جهة المشتل', 'Nursery Region')}
                      </label>
                      <select
                        id="select-new-nursery-region"
                        value={newNurseryRegion}
                        onChange={(e) => setNewNurseryRegion(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        {MOROCCAN_REGIONS.map((reg) => (
                          <option key={reg} value={reg}>
                            {reg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="check-new-nursery-onssa"
                          type="checkbox"
                          checked={newNurseryOnssaOnly}
                          onChange={(e) => setNewNurseryOnssaOnly(e.target.checked)}
                          className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-stone-300"
                        />
                        <span className="text-xs font-bold text-stone-700">
                          {tr(language, 'Certifié ONSSA uniquement', 'معتمد أونسا حصراً', 'ONSSA Certified only')}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddNurseryForm(false)}
                      className="px-3 py-2 rounded-xl bg-white text-stone-600 hover:bg-stone-100 text-xs font-bold border border-stone-200 transition cursor-pointer"
                    >
                      {tr(language, 'Annuler', 'إلغاء', 'Cancel')}
                    </button>
                    <button
                      id="btn-submit-add-nursery-watch"
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                    >
                      {tr(language, 'Enregistrer cette Surveillance Pépinière', 'حفظ المراقبة', 'Save Plant Interest')}
                    </button>
                  </div>
                </form>
              )}

              {/* Nursery Interests List */}
              {notificationSettings.nurseryInterestWatches.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <Sprout className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-700">
                    {tr(language, 'Aucun intérêt pépinière configuré.', 'لا توجد أصناف مشاتل مراقبة حالياً.', 'No nursery plant interests configured yet.')}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {tr(language, 'Ajoutez vos variétés arboricoles ou maraîchères pour recevoir les annonces d\'arrivages certifiés.', 'أضف الأصناف التي تبحث عنها لتتوصل بإشعارات عند وصول شتلات جديدة.', 'Add tree or vegetable varieties to be notified as soon as new stock is registered.')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddNurseryForm(true)}
                    className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-2xs hover:bg-emerald-800 transition cursor-pointer"
                  >
                    + {tr(language, 'Ajouter un intérêt pépinière', 'إضافة أول صنف', 'Add first plant interest')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {notificationSettings.nurseryInterestWatches.map((watch) => (
                    <div
                      key={watch.id}
                      id={`nursery-watch-card-${watch.id}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        watch.enabled
                          ? 'bg-white border-emerald-200/80 shadow-2xs'
                          : 'bg-stone-50/60 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-sm font-bold text-stone-900 truncate">
                              {watch.speciesOrCategory}
                            </h5>
                            {watch.variety && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 truncate">
                                {watch.variety}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {watch.onssaOnly && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                ONSSA Certifié
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              ≥ {(watch.minQuantity || 0).toLocaleString('fr-FR')} plants
                            </span>

                            {watch.region && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700 truncate max-w-[150px]">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-stone-500" />
                                <span className="truncate">{watch.region.split('(')[0]}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            id={`toggle-nursery-watch-${watch.id}`}
                            type="button"
                            onClick={() => toggleNurseryInterestWatch(watch.id)}
                            className={`p-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                              watch.enabled
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                            }`}
                            title={watch.enabled ? 'Désactiver' : 'Activer'}
                          >
                            {watch.enabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            id={`delete-nursery-watch-${watch.id}`}
                            type="button"
                            onClick={() => removeNurseryInterestWatch(watch.id)}
                            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHANNELS & SETTINGS */}
          {activeNotificationSettingsTab === 'channels' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Browser Web Push Channel */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900">
                          {tr(language, 'Notifications Push Navigateur (Desktop & Mobile)', 'إشعارات المتصفح الفورية', 'Browser Web Push Notifications')}
                        </h4>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            browserPermStatus === 'granted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : browserPermStatus === 'denied'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {browserPermStatus === 'granted'
                            ? tr(language, 'Autorisé ✓', 'مسموح به ✓', 'Granted ✓')
                            : browserPermStatus === 'denied'
                            ? tr(language, 'Refusé / Bloqué', 'محظور', 'Blocked')
                            : tr(language, 'Non demandé', 'في الانتظار', 'Pending')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        {tr(
                          language,
                          'Recevez les alertes en temps réel même lorsque l\'onglet AgriStock n\'est pas au premier plan.',
                          'تصلك التنبيهات الفورية حتى عند إغلاق أو تصغير الصفحة.',
                          'Receive real-time alerts even when the AgriStock tab is minimized or in background.'
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    id="toggle-channel-browser-push"
                    type="button"
                    onClick={() => {
                      if (browserPermStatus !== 'granted') {
                        handleRequestBrowserPermission();
                      } else {
                        updateNotificationSettings({ browserPushEnabled: !notificationSettings.browserPushEnabled });
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      notificationSettings.browserPushEnabled && browserPermStatus === 'granted' ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        notificationSettings.browserPushEnabled && browserPermStatus === 'granted' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {browserPermStatus !== 'granted' && (
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-600">
                      {tr(language, 'La permission du navigateur n\'est pas encore accordée.', 'إذن المتصفح غير مفعل بعد.', 'Browser permission is not yet granted.')}
                    </span>
                    <button
                      id="btn-request-browser-perm"
                      type="button"
                      onClick={handleRequestBrowserPermission}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      {tr(language, 'Activer les notifications du navigateur', 'تفعيل إذن المتصفح', 'Enable Browser Notifications')}
                    </button>
                  </div>
                )}
              </div>

              {/* In-App Interactive Toast Banners */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      {tr(language, 'Bannières Toast In-App Intégrées', 'إشعارات داخل التطبيق (Toasts)', 'In-App Toast Banners')}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      {tr(
                        language,
                        'Affiche un bandeau dynamique et cliquable en bas de l\'écran avec accès direct à l\'offre lors d\'une baisse de prix.',
                        'عرض شريط تنبيهي أسفل الشاشة مع زر النقر المباشر للدخول إلى العرض المخفض.',
                        'Displays animated clickable toast alerts with one-tap link to the listing.'
                      )}
                    </p>
                  </div>
                </div>

                <button
                  id="toggle-channel-in-app"
                  type="button"
                  onClick={() => updateNotificationSettings({ inAppToastEnabled: !notificationSettings.inAppToastEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    notificationSettings.inAppToastEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notificationSettings.inAppToastEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* WhatsApp Pro Channel */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">
                        {tr(language, 'Alertes WhatsApp & SMS B2B', 'رسائل واتساب و SMS الفلاحية', 'WhatsApp & SMS B2B Alerts')}
                      </h4>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                        PRO
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {tr(
                        language,
                        'Recevez un message WhatsApp prioritaire pour les opportunités majeures (-15% ou plus) et les lots rares certifiés.',
                        'استلام رسائل واتساب عند وجود صفقات كبرى وتخفيضات تفوق 15%.',
                        'Receive high-priority WhatsApp messages for major price drops and rare certified saplings.'
                      )}
                    </p>
                  </div>
                </div>

                <button
                  id="toggle-channel-whatsapp"
                  type="button"
                  onClick={() => updateNotificationSettings({ whatsappAlertsEnabled: !notificationSettings.whatsappAlertsEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    notificationSettings.whatsappAlertsEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notificationSettings.whatsappAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Email Digest Channel */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      {tr(language, 'Récapitulatif Matinal par Email', 'ملخص الصباح عبر البريد الإلكتروني', 'Morning Email Digest')}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      {tr(
                        language,
                        'Recevez chaque matin à 08h00 le résumé des cotations en baisse et les nouveaux lots pépinières du Royaume.',
                        'ملخص يومي في الساعة 8 صباحاً بالأسعار المنخفضة وشتلات المشاتل الجديدة.',
                        'Receive a daily 8:00 AM summary of market price drops and new nursery stock in Morocco.'
                      )}
                    </p>
                  </div>
                </div>

                <button
                  id="toggle-channel-email"
                  type="button"
                  onClick={() => updateNotificationSettings({ emailAlertsEnabled: !notificationSettings.emailAlertsEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    notificationSettings.emailAlertsEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notificationSettings.emailAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY & INTERACTIVE TESTING */}
          {activeNotificationSettingsTab === 'history' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Interactive Simulation & Test Suite */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-[#0e2118] text-white space-y-3 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    {tr(language, 'Banc d\'Essai & Simulations Immédiates', 'تجربة التنبيهات الفورية', 'Interactive Alert Simulation Test')}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {tr(language, 'Testez le déclenchement en 1 tap', 'جرب الإشعار بنقرة واحدة', 'Test in 1 tap')}
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  {tr(
                    language,
                    'Cliquez sur l\'un des boutons ci-dessous pour simuler un événement et vérifier l\'apparition immédiate de l\'alerte sur votre écran et navigateur :',
                    'انقر على أحد الأزرار لتجربة ظهور الإشعار الفوري على شاشتك ومتصفحك :',
                    'Click one of the buttons below to trigger a live simulation and verify the alert flow:'
                  )}
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    id="btn-simulate-price-drop"
                    type="button"
                    onClick={() => triggerSimulatedNotification('price_drop')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95 transition cursor-pointer"
                  >
                    <TrendingDown className="w-4 h-4 text-emerald-200" />
                    <span>{tr(language, '⚡ Simuler Baisse de Prix (Tomates)', '⚡ تجربة انخفاض سعر الطماطم', '⚡ Simulate Price Drop (Tomatoes)')}</span>
                  </button>

                  <button
                    id="btn-simulate-nursery-arrival"
                    type="button"
                    onClick={() => triggerSimulatedNotification('new_nursery_lot')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md active:scale-95 transition cursor-pointer"
                  >
                    <Sprout className="w-4 h-4 text-blue-200" />
                    <span>{tr(language, '🌱 Simuler Arrivage Pépinière (Oliviers)', '🌱 تجربة وصول شتلات الزيتون', '🌱 Simulate Nursery Lot (Olive Trees)')}</span>
                  </button>
                </div>
              </div>

              {/* Feed Header */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <span>{tr(language, 'Flux Chronologique des Alertes Déclenchées', 'سجل التنبيهات المستلمة', 'Triggered Alerts Feed')}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {notificationSettings.notificationHistory.length}
                  </span>
                </h4>

                {notificationSettings.notificationHistory.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-mark-all-read"
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer"
                    >
                      {tr(language, 'Tout marquer comme lu', 'تحديد الكل كمقروء', 'Mark all read')}
                    </button>
                    <span className="text-stone-300">•</span>
                    <button
                      id="btn-clear-history"
                      type="button"
                      onClick={clearNotificationHistory}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      {tr(language, 'Vider l\'historique', 'مسح السجل', 'Clear history')}
                    </button>
                  </div>
                )}
              </div>

              {/* History List */}
              {notificationSettings.notificationHistory.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <BellOff className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-700">
                    {tr(language, 'Aucune notification dans l\'historique.', 'لا توجد تنبيهات في السجل حالياً.', 'No notifications in history yet.')}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {tr(language, 'Utilisez les boutons de test ci-dessus pour simuler une alerte.', 'استخدم أزرار التجربة أعلاه لمعاينة الإشعارات.', 'Use the test buttons above to simulate alerts.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notificationSettings.notificationHistory.map((notif) => (
                    <div
                      key={notif.id}
                      id={`notif-item-${notif.id}`}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        !notif.read
                          ? 'bg-emerald-50/40 border-emerald-300/80 shadow-2xs'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              notif.type === 'price_drop'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {notif.type === 'price_drop' ? (
                              <TrendingDown className="w-5 h-5" />
                            ) : (
                              <Sprout className="w-5 h-5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                                {notif.title}
                              </h5>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                              )}
                            </div>

                            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>

                            <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                              <span>{notif.timestamp}</span>
                              {notif.metadata?.region && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-stone-600">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {notif.metadata.region}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            id={`btn-view-notif-${notif.id}`}
                            type="button"
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              setIsNotificationSettingsModalOpen(false);
                              if (notif.targetTab === 'market') setActiveTab('market');
                              else if (notif.targetTab === 'nursery') setActiveTab('nursery');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>{tr(language, 'Voir l\'offre', 'عرض', 'View')}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          {!notif.read && (
                            <button
                              id={`btn-read-notif-${notif.id}`}
                              type="button"
                              onClick={() => markNotificationAsRead(notif.id)}
                              className="p-1.5 rounded-xl text-stone-400 hover:text-emerald-800 hover:bg-stone-100 transition cursor-pointer"
                              title="Marquer comme lu"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {tr(
                language,
                'Vos préférences d\'alertes sont automatiquement sauvegardées et actives en continu.',
                'يتم حفظ إعدادات وتفضيلات التنبيهات تلقائياً وتعمل باستمرار.',
                'Your alert preferences are automatically saved and continuously active.'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="btn-footer-close-notification-modal"
              type="button"
              onClick={() => setIsNotificationSettingsModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              {tr(language, 'Terminé / Appliquer', 'تم وتطبيق', 'Done / Apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
