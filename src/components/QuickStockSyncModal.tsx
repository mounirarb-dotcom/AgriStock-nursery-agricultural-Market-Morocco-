import React, { useState, useMemo } from 'react';
import {
  X,
  Zap,
  Check,
  CheckCheck,
  Search,
  Plus,
  Minus,
  Sparkles,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Trees,
  Sprout,
  Flower2,
  CheckCircle2,
} from 'lucide-react';
import { NurseryLot } from '../types';
import { useAppContext } from '../context/AppContext';
import { tr } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickStockSyncModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    language,
    nurseryLots,
    batchUpdateNurseryLotsStock,
    confirmAllNurseryLotsSyncedToday,
    dailySyncRecord,
    updateDailySyncSettings,
    getLotThreshold,
  } = useAppContext();

  // Local draft of stock levels for rapid 1-tap adjustments
  const [draftStocks, setDraftStocks] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    nurseryLots.forEach(l => {
      init[l.id] = l.quantityAvailable;
    });
    return init;
  });

  const [confirmedLotIds, setConfirmedLotIds] = useState<Set<string>>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const set = new Set<string>();
    nurseryLots.forEach(l => {
      if (l.lastUpdated === todayStr) {
        set.add(l.id);
      }
    });
    return set;
  });

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'ALL' | 'ARBORICULTURE' | 'MARAICHAGE' | 'ORNEMENTALE'>('ALL');
  const [unverifiedOnly, setUnverifiedOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Sync draft stocks if lots change
  React.useEffect(() => {
    if (isOpen) {
      const todayStr = new Date().toISOString().split('T')[0];
      const nextDraft: Record<string, number> = {};
      const nextConfirmed = new Set<string>();
      nurseryLots.forEach(l => {
        nextDraft[l.id] = l.quantityAvailable;
        if (l.lastUpdated === todayStr) {
          nextConfirmed.add(l.id);
        }
      });
      setDraftStocks(nextDraft);
      setConfirmedLotIds(nextConfirmed);
      setFeedbackSaved(false);
    }
  }, [isOpen, nurseryLots]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleAdjust = (lotId: string, delta: number) => {
    setDraftStocks(prev => {
      const current = prev[lotId] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [lotId]: next };
    });
    setConfirmedLotIds(prev => new Set(prev).add(lotId));
  };

  const handleSetExact = (lotId: string, value: number) => {
    setDraftStocks(prev => ({
      ...prev,
      [lotId]: Math.max(0, value),
    }));
    setConfirmedLotIds(prev => new Set(prev).add(lotId));
  };

  const handleMarkLotVerified = (lotId: string) => {
    setConfirmedLotIds(prev => new Set(prev).add(lotId));
  };

  const handleMarkAllUnchanged = () => {
    confirmAllNurseryLotsSyncedToday();
    const allIds = new Set(nurseryLots.map(l => l.id));
    setConfirmedLotIds(allIds);
    setFeedbackSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleSaveAll = () => {
    const updates = nurseryLots.map(l => ({
      id: l.id,
      quantityAvailable: draftStocks[l.id] !== undefined ? draftStocks[l.id] : l.quantityAvailable,
    }));
    batchUpdateNurseryLotsStock(updates);
    setFeedbackSaved(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  // Filter lots
  const filtered = nurseryLots.filter(lot => {
    if (!lot) return false;
    const term = search.trim().toLowerCase();
    if (term) {
      const matchesSearch =
        Boolean(lot.variety?.toLowerCase().includes(term)) ||
        Boolean(lot.species?.toLowerCase().includes(term)) ||
        Boolean(lot.category?.toLowerCase().includes(term)) ||
        Boolean(lot.batchNumber?.toLowerCase().includes(term));
      if (!matchesSearch) return false;
    }

    if (departmentFilter === 'ARBORICULTURE') {
      const isArbo = Boolean(lot.category?.includes('Arbres') || lot.category?.includes('Fruit') || lot.category?.includes('Porte-greffes') || lot.category?.includes('Arganier'));
      if (!isArbo) return false;
    } else if (departmentFilter === 'MARAICHAGE') {
      const isMar = Boolean(lot.category?.includes('Maraîch') || lot.category?.includes('Légume'));
      if (!isMar) return false;
    } else if (departmentFilter === 'ORNEMENTALE') {
      const isOrn = Boolean(lot.category?.includes('Ornement') || lot.ornamentalDetails !== undefined || lot.category?.includes('Espaces Verts'));
      if (!isOrn) return false;
    }

    if (unverifiedOnly && confirmedLotIds.has(lot.id)) {
      return false;
    }

    return true;
  });

  // Calculate modified count
  const modifiedLotsCount = nurseryLots.filter(l => draftStocks[l.id] !== l.quantityAvailable).length;
  const verifiedLotsCount = confirmedLotIds.size;
  const totalLots = nurseryLots.length;
  const totalAvailableDraft = nurseryLots.reduce((acc, l) => {
    const qty = draftStocks[l.id] !== undefined ? draftStocks[l.id] : l.quantityAvailable;
    return acc + qty;
  }, 0);

  return (
    <div
      id="quick-stock-sync-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="quick-stock-sync-modal"
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0d281a] via-[#113524] to-[#091b12] text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-bold border border-emerald-400/30">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  {tr(language, 'Actualisation Express Quotidienne', 'تحديث سريع يومي', 'Daily Express Sync')}
                </span>
                <span className="text-xs text-stone-300 font-medium capitalize flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  {todayFormatted}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {tr(language, 'Quick Sync : Inventaire Journalier', 'مزامنة مخزون المشتل في ثوانٍ', 'Quick Sync: Daily Inventory')}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed">
                {tr(
                  language,
                  'Ajustez ou confirmez vos stocks de plants disponibles en 1 tap. Un inventaire certifié du jour renforce la visibilité de vos lots.',
                  'قم بتأكيد كميات الشتلات المتاحة بنقرة واحدة لضمان ثقة المشترين وتفادي الحجوزات الزائدة.',
                  'Adjust or confirm your available plant stock in 1 tap. Daily certified inventory boosts your lots visibility.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer shrink-0"
              title={tr(language, 'Fermer', 'إغلاق', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar inside Header */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-emerald-800/60 text-xs">
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2 sm:p-2.5 border border-white/10">
              <div className="text-[10px] text-stone-300 uppercase font-semibold">{tr(language, 'Lots Vérifiés', 'الدفعات المؤكدة', 'Verified Lots')}</div>
              <div className="text-base sm:text-lg font-black text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <span>{verifiedLotsCount} / {totalLots}</span>
                {verifiedLotsCount === totalLots && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2 sm:p-2.5 border border-white/10">
              <div className="text-[10px] text-stone-300 uppercase font-semibold">{tr(language, 'Modifications Session', 'تعديلات الجلسة', 'Session Changes')}</div>
              <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
                {modifiedLotsCount > 0 ? `+${modifiedLotsCount} ${tr(language, 'lot(s)', 'دفعة', 'lot(s)')}` : tr(language, '0 lot modifié', '0 دفعة معدلة', '0 lots modified')}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2 sm:p-2.5 border border-white/10">
              <div className="text-[10px] text-stone-300 uppercase font-semibold">{tr(language, 'Plants Disponibles', 'الشتلات المتوفرة', 'Available Plants')}</div>
              <div className="text-base sm:text-lg font-black text-white mt-0.5">
                {(totalAvailableDraft || 0).toLocaleString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Instant Actions Toolbar */}
        <div className="bg-stone-50 border-b border-stone-200 p-3 sm:p-4 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={tr(language, 'Rechercher par variété, espèce ou N° lot...', 'بحث بالصنف، النوع أو رقم الدفعة...', 'Search by variety, species or lot number...')}
                className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-stone-300 text-xs text-stone-800 placeholder-stone-400 focus:outline-emerald-600"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 1-Tap Mark All Unchanged Master Action */}
            <button
              type="button"
              onClick={handleMarkAllUnchanged}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs shadow-sm transition cursor-pointer shrink-0"
              title={tr(language, "Valider tous les stocks actuels sans modification pour aujourd'hui", 'تأكيد كل الكميات الحالية دون تغيير لهذا اليوم', 'Certify all current stocks unchanged today')}
            >
              <CheckCheck className="w-4 h-4 text-emerald-200" />
              <span>{tr(language, '1-Tap : Tout certifier inchangé', 'تأكيد كل الأصناف دون تغيير اليوم', '1-Tap: Certify all unchanged')}</span>
            </button>
          </div>

          {/* Department Pills & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDepartmentFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  departmentFilter === 'ALL'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Tous ({nurseryLots.length})
              </button>

              <button
                type="button"
                onClick={() => setDepartmentFilter('ARBORICULTURE')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  departmentFilter === 'ARBORICULTURE'
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <Trees className="w-3 h-3" />
                Arboriculture
              </button>

              <button
                type="button"
                onClick={() => setDepartmentFilter('MARAICHAGE')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  departmentFilter === 'MARAICHAGE'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <Sprout className="w-3 h-3" />
                Maraîchage
              </button>

              <button
                type="button"
                onClick={() => setDepartmentFilter('ORNEMENTALE')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  departmentFilter === 'ORNEMENTALE'
                    ? 'bg-teal-800 text-white shadow-2xs'
                    : 'bg-white text-teal-800 border border-teal-200 hover:bg-teal-50'
                }`}
              >
                <Flower2 className="w-3 h-3" />
                Ornementale
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={unverifiedOnly}
                  onChange={e => setUnverifiedOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>Non vérifiés aujourd'hui ({nurseryLots.filter(l => !confirmedLotIds.has(l.id)).length})</span>
              </label>

              <button
                type="button"
                onClick={() => setShowSettings(prev => !prev)}
                className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 font-bold px-2 py-1 rounded-lg hover:bg-stone-200 transition"
                title="Préférences du rappel journalier"
              >
                <Sliders className="w-3 h-3" />
                <span>Rappel auto</span>
              </button>
            </div>
          </div>

          {/* Collapsible Reminder Settings */}
          {showSettings && (
            <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Rappels automatiques quotidiens
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dailySyncRecord.reminderEnabled}
                    onChange={e => updateDailySyncSettings({ reminderEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-600">
                <span>Heure suggérée du rappel (fin de journée ou matin) :</span>
                <input
                  type="time"
                  value={dailySyncRecord.reminderHour || '17:00'}
                  onChange={e => updateDailySyncSettings({ reminderHour: e.target.value })}
                  className="px-2 py-1 rounded border border-stone-300 text-stone-800 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Lots List with Touch-Friendly 1-Tap Controls */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/50" />
              <p className="text-sm font-bold text-stone-600">Aucun lot ne correspond à ces critères.</p>
              <p className="text-xs text-stone-400">Tous les lots sélectionnés sont déjà synchronisés !</p>
            </div>
          ) : (
            filtered.map(lot => {
              const currentVal = draftStocks[lot.id] !== undefined ? draftStocks[lot.id] : lot.quantityAvailable;
              const isModified = currentVal !== lot.quantityAvailable;
              const isVerifiedToday = confirmedLotIds.has(lot.id);
              const thresh = getLotThreshold(lot);
              const isLow = currentVal <= thresh;

              return (
                <div
                  key={lot.id}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                    isModified
                      ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                      : isVerifiedToday
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Lot Info */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {lot.batchNumber}
                        </span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {lot.category} {lot.greenhouseLocation && `• ${lot.greenhouseLocation}`}
                        </span>

                        {isVerifiedToday ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Vérifié aujourd'hui
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Dernière modif : {lot.lastUpdated || 'Antérieure'}
                          </span>
                        )}

                        {isLow && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            Stock bas
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-stone-900 truncate">
                        {lot.variety}
                        <span className="text-xs font-normal text-stone-500 ml-1.5">({lot.species})</span>
                      </h4>
                    </div>

                    {/* Right: Touch-Friendly 1-Tap Stock Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                      {/* Quick -50 / -10 buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAdjust(lot.id, -50)}
                          disabled={currentVal <= 0}
                          className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 font-mono text-[11px] font-bold border border-stone-200 transition cursor-pointer active:scale-95"
                          title="Déduire 50 plants"
                        >
                          -50
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjust(lot.id, -10)}
                          disabled={currentVal <= 0}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 font-bold border border-stone-200 transition cursor-pointer active:scale-95"
                          title="Déduire 10 plants"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Stock Quantity Display / Direct Input */}
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="0"
                          value={currentVal}
                          onChange={e => handleSetExact(lot.id, parseInt(e.target.value) || 0)}
                          className="w-20 sm:w-24 text-center font-mono font-black text-sm sm:text-base py-1 px-1 rounded-xl border border-stone-300 focus:outline-emerald-600 bg-white shadow-2xs"
                        />
                        <span className="text-[10px] text-stone-400 font-medium">plants</span>
                      </div>

                      {/* Quick +10 / +50 buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAdjust(lot.id, 10)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold border border-stone-200 transition cursor-pointer active:scale-95"
                          title="Ajouter 10 plants"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjust(lot.id, 50)}
                          className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-[11px] font-bold border border-stone-200 transition cursor-pointer active:scale-95"
                          title="Ajouter 50 plants"
                        >
                          +50
                        </button>
                      </div>

                      {/* 1-Tap Lot Confirmation Button */}
                      <button
                        type="button"
                        onClick={() => handleMarkLotVerified(lot.id)}
                        className={`ml-1.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95 ${
                          isVerifiedToday
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
                        }`}
                        title="Valider ce stock pour aujourd'hui"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Valider</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600">
            {modifiedLotsCount > 0 ? (
              <span className="font-bold text-amber-900">
                {tr(
                  language,
                  `⚠️ ${modifiedLotsCount} lot(s) ajusté(s) dans cette session prêts à être enregistrés.`,
                  `⚠️ تم تعديل ${modifiedLotsCount} دفعة في هذه الجلسة جاهزة للحفظ.`,
                  `⚠️ ${modifiedLotsCount} lot(s) adjusted in this session ready to save.`
                )}
              </span>
            ) : (
              <span className="text-emerald-800 font-medium">
                {tr(language, "✓ Prêt à enregistrer l'inventaire journalier.", '✓ جاهز لحفظ المخزون اليومي.', '✓ Ready to save daily inventory.')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs border border-stone-300 transition cursor-pointer"
            >
              {tr(language, 'Annuler', 'إلغاء', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md transition cursor-pointer"
            >
              {feedbackSaved ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-200 animate-bounce" />
                  <span>{tr(language, 'Enregistré avec succès !', 'تم الحفظ بنجاح !', 'Saved successfully!')}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                  <span>{tr(language, 'Enregistrer & Synchroniser', 'حفظ ومزامنة', 'Save & Synchronize')} ({verifiedLotsCount}/{totalLots})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
