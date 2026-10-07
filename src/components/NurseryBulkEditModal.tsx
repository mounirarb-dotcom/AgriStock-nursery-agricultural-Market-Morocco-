import React, { useState, useMemo } from 'react';
import { NurseryLot, NurseryStockStatus, AppLanguage } from '../types';
import {
  BulkUpdateOptions,
  getLotStockStatus,
  calculateBulkPriceUpdate,
} from '../utils/nurseryUtils';
import { tr } from '../utils/translations';
import {
  X,
  Sliders,
  DollarSign,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Tag,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedLots: NurseryLot[];
  onApply: (options: BulkUpdateOptions) => void;
  language: AppLanguage;
}

export const NurseryBulkEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedLots,
  onApply,
  language,
}) => {
  if (!isOpen) return null;

  // Price update state
  const [priceOption, setPriceOption] = useState<'keep' | 'fixed' | 'percentage'>('keep');
  const [fixedPriceInput, setFixedPriceInput] = useState<string>('25');
  const [percentInput, setPercentInput] = useState<string>('10');

  // Status update state
  const [statusOption, setStatusOption] = useState<'keep' | 'update'>('keep');
  const [selectedStatus, setSelectedStatus] = useState<NurseryStockStatus>('In Stock');

  const [formError, setFormError] = useState<string | null>(null);

  // Quick preset buttons for fixed price
  const fixedPricePresets = [15, 20, 25, 30, 45, 60, 100];
  // Quick preset buttons for percentage adjustments
  const percentPresets = [-20, -10, -5, 5, 10, 15, 20];

  // Validate form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (priceOption === 'keep' && statusOption === 'keep') {
      setFormError(
        tr(
          language,
          'Veuillez activer au moins une modification (Prix ou Statut).',
          'يرجى تحديد تعديل واحد على الأقل (السعر أو الحالة).',
          'Please select at least one field to update (Price or Status).'
        )
      );
      return;
    }

    let parsedFixedPrice: number | undefined = undefined;
    if (priceOption === 'fixed') {
      const val = parseFloat(fixedPriceInput);
      if (isNaN(val) || val <= 0) {
        setFormError(
          tr(
            language,
            'Veuillez saisir un prix unitaire fixe valide supérieur à 0 MAD.',
            'يرجى إدخال سعر فردي صحيح أكبر من 0 درهم.',
            'Please enter a valid fixed unit price greater than 0 MAD.'
          )
        );
        return;
      }
      parsedFixedPrice = val;
    }

    let parsedPercent: number | undefined = undefined;
    if (priceOption === 'percentage') {
      const val = parseFloat(percentInput);
      if (isNaN(val)) {
        setFormError(
          tr(
            language,
            'Veuillez saisir un pourcentage valide.',
            'يرجى إدخال نسبة مئوية صالحة.',
            'Please enter a valid percentage.'
          )
        );
        return;
      }
      parsedPercent = val;
    }

    onApply({
      priceOption,
      fixedPriceMAD: parsedFixedPrice,
      percentageAdjustment: parsedPercent,
      statusOption,
      newStatus: statusOption === 'update' ? selectedStatus : undefined,
    });
  };

  // Preview computations
  const previewItems = useMemo(() => {
    return selectedLots.slice(0, 5).map((lot) => {
      const currentStatus = getLotStockStatus(lot);
      const newPrice =
        priceOption === 'keep'
          ? lot.unitPriceMAD
          : calculateBulkPriceUpdate(
              lot.unitPriceMAD,
              priceOption,
              priceOption === 'fixed'
                ? parseFloat(fixedPriceInput) || lot.unitPriceMAD
                : parseFloat(percentInput) || 0
            );

      const nextStatus = statusOption === 'update' ? selectedStatus : currentStatus;

      return {
        lot,
        currentPrice: lot.unitPriceMAD,
        newPrice,
        currentStatus,
        nextStatus,
      };
    });
  }, [selectedLots, priceOption, fixedPriceInput, percentInput, statusOption, selectedStatus]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-edit-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-400/30">
              <Sliders className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="bulk-edit-modal-title" className="text-base sm:text-lg font-black tracking-tight">
                  {tr(
                    language,
                    'Édition en Lot des Plants',
                    'تعديل جماعي لدفعات النباتات',
                    'Bulk Edit Nursery Lots'
                  )}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-stone-950">
                  {selectedLots.length}{' '}
                  {selectedLots.length > 1
                    ? tr(language, 'lots', 'دفعات', 'lots')
                    : tr(language, 'lot', 'دفعة', 'lot')}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                {tr(
                  language,
                  'Modifiez le prix unitaire et le statut de stock simultanément pour tous les lots sélectionnés.',
                  'تحديث السعر الفردي وحالة المخزون في نفس الوقت لجميع الدفعات المحددة.',
                  'Simultaneously update unit price and stock status for all selected items.'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Selected lots summary badge pills */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                {tr(
                  language,
                  'Lots sélectionnés pour la mise à jour :',
                  'الدفعات المختارة للتعديل :',
                  'Selected lots for bulk update:'
                )}
              </span>
              <span className="text-[11px] text-stone-500 font-semibold">
                {selectedLots.length} {tr(language, 'au total', 'إجمالي', 'total')}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {selectedLots.map((lot) => {
                const status = getLotStockStatus(lot);
                return (
                  <span
                    key={lot.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-stone-200 shadow-2xs text-stone-800"
                  >
                    <span className="font-mono text-stone-500">{lot.batchNumber}</span>
                    <span className="font-bold text-stone-900">{lot.variety}</span>
                    <span className="text-emerald-800 font-bold">({lot.unitPriceMAD} MAD)</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        status === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'Reserved'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {status === 'In Stock' ? 'En Stock' : status === 'Reserved' ? 'Réservé' : 'Vendu'}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {formError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* SECTION 1: PRICE UPDATE */}
          <div className="rounded-2xl border border-stone-200 p-4 space-y-4 bg-white shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">
                    {tr(
                      language,
                      '1. Mise à jour du Prix Unitaire (MAD)',
                      '1. تحديث السعر الفردي (درهم)',
                      '1. Unit Price Update (MAD)'
                    )}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {tr(
                      language,
                      'Conservez les prix actuels, fixez un tarif unique ou appliquez une remise/hausse en %.',
                      'احتفظ بالأسعار الحالية، حدد سعراً موحداً أو طبق تخفيضاً/زيادة بنسبة مئوية.',
                      'Keep existing prices, set a uniform price, or apply a percentage discount/raise.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Option Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  priceOption === 'keep'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="priceOption"
                  value="keep"
                  checked={priceOption === 'keep'}
                  onChange={() => setPriceOption('keep')}
                  className="accent-emerald-700 w-4 h-4"
                />
                <span>{tr(language, 'Conserver prix actuel', 'الاحتفاظ بالسعر الحالي', 'Keep current price')}</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  priceOption === 'fixed'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="priceOption"
                  value="fixed"
                  checked={priceOption === 'fixed'}
                  onChange={() => setPriceOption('fixed')}
                  className="accent-emerald-700 w-4 h-4"
                />
                <span>{tr(language, 'Nouveau prix fixe', 'سعر محدد جديد', 'New fixed price')}</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  priceOption === 'percentage'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="priceOption"
                  value="percentage"
                  checked={priceOption === 'percentage'}
                  onChange={() => setPriceOption('percentage')}
                  className="accent-emerald-700 w-4 h-4"
                />
                <span>{tr(language, 'Ajustement en %', 'تعديل بنسبة %', 'Percentage adjustment')}</span>
              </label>
            </div>

            {/* Fixed price input panel */}
            {priceOption === 'fixed' && (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                <label className="text-xs font-bold text-stone-800 block">
                  {tr(
                    language,
                    'Définir le nouveau prix unitaire pour tous les lots :',
                    'تحديد السعر الفردي الجديد لجميع الدفعات :',
                    'Set uniform unit price for all lots:'
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={fixedPriceInput}
                      onChange={(e) => setFixedPriceInput(e.target.value)}
                      placeholder="25.00"
                      className="w-full pl-3 pr-16 py-2 rounded-xl border border-stone-300 focus:outline-emerald-600 font-black text-sm bg-white"
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-stone-500">
                      MAD / plant
                    </span>
                  </div>
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-semibold text-stone-500 mr-1">
                    {tr(language, 'Tarifs rapides :', 'أسعار سريعة :', 'Quick rates:')}
                  </span>
                  {fixedPricePresets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFixedPriceInput(val.toString())}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        fixedPriceInput === val.toString()
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                      }`}
                    >
                      {val} MAD
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Percentage input panel */}
            {priceOption === 'percentage' && (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                <label className="text-xs font-bold text-stone-800 block">
                  {tr(
                    language,
                    'Pourcentage d\'ajustement (ex: -10 pour une remise de 10%, +15 pour une hausse) :',
                    'نسبة التعديل (مثال: -10 لتخفيض 10%، +15 لزيادة) :',
                    'Percentage adjustment (e.g. -10 for a 10% discount, +15 for increase):'
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="1"
                      value={percentInput}
                      onChange={(e) => setPercentInput(e.target.value)}
                      placeholder="+10"
                      className="w-full pl-3 pr-10 py-2 rounded-xl border border-stone-300 focus:outline-emerald-600 font-black text-sm bg-white"
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-stone-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Percentage Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-semibold text-stone-500 mr-1">
                    {tr(language, 'Raccourcis :', 'اختصارات :', 'Shortcuts:')}
                  </span>
                  {percentPresets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPercentInput(p.toString())}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        percentInput === p.toString()
                          ? p < 0
                            ? 'bg-rose-700 text-white border-rose-800'
                            : 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                      }`}
                    >
                      {p > 0 ? `+${p}%` : `${p}%`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: STATUS UPDATE */}
          <div className="rounded-2xl border border-stone-200 p-4 space-y-4 bg-white shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">
                    {tr(
                      language,
                      '2. Mise à jour du Statut de Stock',
                      '2. تحديث حالة المخزون',
                      '2. Stock Status Update'
                    )}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {tr(
                      language,
                      'Basculez tous les lots sélectionnés en statut En Stock, Réservé ou Vendu.',
                      'تغيير حالة جميع الدفعات المحددة إلى: في المخزون، محجوز، أو تم البيع.',
                      'Switch all selected lots to In Stock, Reserved, or Sold status simultaneously.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Option Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  statusOption === 'keep'
                    ? 'bg-stone-100 border-stone-400 font-bold text-stone-900'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="statusOption"
                  value="keep"
                  checked={statusOption === 'keep'}
                  onChange={() => setStatusOption('keep')}
                  className="accent-stone-800 w-4 h-4"
                />
                <span>
                  {tr(
                    language,
                    'Conserver les statuts actuels',
                    'الاحتفاظ بالحالات الحالية',
                    'Keep current statuses'
                  )}
                </span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  statusOption === 'update'
                    ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="statusOption"
                  value="update"
                  checked={statusOption === 'update'}
                  onChange={() => setStatusOption('update')}
                  className="accent-amber-600 w-4 h-4"
                />
                <span>
                  {tr(
                    language,
                    'Définir un nouveau statut commun',
                    'تحديد حالة مشتركة جديدة',
                    'Set new common status'
                  )}
                </span>
              </label>
            </div>

            {/* Status Choices Cards */}
            {statusOption === 'update' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* 1. In Stock */}
                <div
                  onClick={() => setSelectedStatus('In Stock')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                    selectedStatus === 'In Stock'
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
                      ● In Stock
                    </span>
                    {selectedStatus === 'In Stock' && <Check className="w-4 h-4 text-emerald-700" />}
                  </div>
                  <h4 className="text-xs font-black text-stone-900">
                    {tr(language, 'En Stock (Disponible)', 'في المخزون (متاح)', 'In Stock (Available)')}
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                    {tr(
                      language,
                      'Prêt pour commande immédiate, livraison et passeport ONSSA actif.',
                      'جاهز للطلب الفوري، الشحن، وجواز المرور ساري المفعول.',
                      'Ready for immediate orders, logistics, and ONSSA passport.'
                    )}
                  </p>
                </div>

                {/* 2. Reserved */}
                <div
                  onClick={() => setSelectedStatus('Reserved')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                    selectedStatus === 'Reserved'
                      ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                      : 'bg-white border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-stone-950 shadow-2xs">
                      ● Reserved
                    </span>
                    {selectedStatus === 'Reserved' && <Check className="w-4 h-4 text-amber-700" />}
                  </div>
                  <h4 className="text-xs font-black text-stone-900">
                    {tr(language, 'Réservé (Acompte / Bon)', 'محجوز (عربون / طلبية)', 'Reserved (On Hold)')}
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                    {tr(
                      language,
                      'Bloqué pour un acheteur ou projet agricole spécifique.',
                      'محجوز لزبون محدد أو مشروع زراعي قيد الإنجاز.',
                      'Held for a specific client or ongoing farming project.'
                    )}
                  </p>
                </div>

                {/* 3. Sold */}
                <div
                  onClick={() => setSelectedStatus('Sold')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                    selectedStatus === 'Sold'
                      ? 'bg-rose-50/80 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
                      : 'bg-white border-stone-200 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow-2xs">
                      ● Sold
                    </span>
                    {selectedStatus === 'Sold' && <Check className="w-4 h-4 text-rose-700" />}
                  </div>
                  <h4 className="text-xs font-black text-stone-900">
                    {tr(language, 'Vendu (Épuisé)', 'تم البيع (نفد)', 'Sold (Out of Stock)')}
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                    {tr(
                      language,
                      'Lot entièrement livré ou écoulé. Stock disponible ajusté à 0.',
                      'تم تسليم الدفعة بالكامل. يصبح المخزون المتاح 0.',
                      'Entire lot fulfilled. Available quantity updated to 0.'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: LIVE PREVIEW (BEFORE -> AFTER) */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                {tr(language, 'Aperçu en direct (Avant ➔ Après) :', 'معاينة فورية (قبل ➔ بعد) :', 'Live Preview (Before ➔ After):')}
              </span>
              <span className="text-[11px] text-stone-500">
                {selectedLots.length > 5
                  ? tr(
                      language,
                      `Affichage des 5 premiers lots sur ${selectedLots.length}`,
                      `عرض أول 5 دفعات من أصل ${selectedLots.length}`,
                      `Showing first 5 of ${selectedLots.length} lots`
                    )
                  : `${selectedLots.length} ${tr(language, 'lots', 'دفعات', 'lots')}`}
              </span>
            </div>

            <div className="divide-y divide-stone-200/80 bg-white rounded-xl border border-stone-200 overflow-hidden text-xs">
              {previewItems.map(({ lot, currentPrice, newPrice, currentStatus, nextStatus }) => (
                <div key={lot.id} className="p-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] text-stone-400 block">{lot.batchNumber}</span>
                    <span className="font-bold text-stone-900 block truncate">{lot.variety}</span>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    {/* Price change */}
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Prix</span>
                      <div className="flex items-center gap-1 font-bold">
                        <span className={priceOption !== 'keep' ? 'line-through text-stone-400 text-[11px]' : 'text-stone-900'}>
                          {currentPrice}
                        </span>
                        {priceOption !== 'keep' && (
                          <>
                            <ArrowRight className="w-3 h-3 text-emerald-600 inline" />
                            <span className="text-emerald-700 font-black">{newPrice} MAD</span>
                          </>
                        )}
                        {priceOption === 'keep' && <span className="text-stone-700">MAD</span>}
                      </div>
                    </div>

                    {/* Status change */}
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Statut</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            statusOption !== 'keep' ? 'line-through opacity-50' : ''
                          } ${
                            currentStatus === 'In Stock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : currentStatus === 'Reserved'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {currentStatus}
                        </span>

                        {statusOption !== 'keep' && (
                          <>
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                                nextStatus === 'In Stock'
                                  ? 'bg-emerald-600 text-white'
                                  : nextStatus === 'Reserved'
                                  ? 'bg-amber-500 text-stone-950'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {nextStatus}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs transition cursor-pointer"
            >
              {tr(language, 'Annuler', 'إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-black text-xs shadow-md transition-all active:scale-98 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {tr(
                  language,
                  `Appliquer aux ${selectedLots.length} lots`,
                  `تطبيق على ${selectedLots.length} دفعة`,
                  `Apply to ${selectedLots.length} lots`
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
