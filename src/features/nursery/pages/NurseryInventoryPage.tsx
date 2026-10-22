import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { SmartImage } from '../../../components/SmartImage';
import {
  Sprout,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  QrCode,
  FileSpreadsheet,
  MapPin,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export const NurseryInventoryPage: React.FC = () => {
  const {
    language,
    nurseryLots,
    openExcelStockModal,
    openFieldQRScannerModal,
    setActiveTab,
    openOfferDetail,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [onssaOnly, setOnssaOnly] = useState(false);

  const filteredLots = nurseryLots.filter((lot) => {
    if (onssaOnly && !lot.onssaStatus.includes('ONSSA')) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        lot.variety.toLowerCase().includes(q) ||
        lot.species.toLowerCase().includes(q) ||
        (lot.rootstock && lot.rootstock.toLowerCase().includes(q)) ||
        (lot.batchNumber && lot.batchNumber.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 mb-1.5">
            <Sprout className="w-3.5 h-3.5 text-teal-600" />
            <span>GESTION DES PLANTS & SERRES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {tr(language, 'Inventaire Pépinière & Lots de Plants', 'مخزون الشتائل والمشاتل', 'Nursery Stock & Sapling Batches')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(
              language,
              'Catalogue complet des plants certifiés ONSSA, porte-greffes, dates de greffage et passeports sanitaires.',
              'دليل الشتائل المعتمدة من أونسا، الأصول الوراثية وتواريخ التطعيم وجوازات السلامة الصحية.',
              'Complete catalogue of ONSSA-certified saplings, rootstocks, and phytosanitary tracking.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openExcelStockModal('nursery')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => openFieldQRScannerModal()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <QrCode className="w-4 h-4 text-teal-600" />
            <span>Scan QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nursery_lot_form')}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{tr(language, 'Ajouter un lot de plants', 'إضافة دفعة شتائل', 'Add Sapling Batch')}</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tr(language, 'Rechercher variété, porte-greffe, lot...', 'بحث في الشتائل...', 'Search saplings...')}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:border-teal-500 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          type="button"
          onClick={() => setOnssaOnly(!onssaOnly)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            onssaOnly
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{tr(language, 'ONSSA Certifié Uniquement', 'معتمد من أونسا فقط', 'ONSSA Certified Only')}</span>
        </button>
      </div>

      {/* Liste des lots de pépinière */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLots.map((lot) => (
          <div
            key={lot.id}
            className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
                <SmartImage
                  src={lot.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80'}
                  alt={lot.variety}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-teal-600 text-white text-[10px] font-bold">
                  {lot.stage || (lot as any).growthStage}
                </span>
                {lot.batchNumber && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-mono">
                    #{lot.batchNumber}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    {lot.species}
                  </span>
                  {lot.onssaStatus.includes('ONSSA') && (
                    <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      ONSSA
                    </span>
                  )}
                </div>

                <h3 className="font-black text-sm text-stone-900 line-clamp-1">{lot.variety}</h3>

                {lot.rootstock && (
                  <div className="text-xs text-stone-500">
                    Porte-greffe : <strong className="text-stone-700">{lot.rootstock}</strong>
                  </div>
                )}

                <div className="pt-2 flex items-baseline justify-between border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-base font-black text-teal-900">
                      {lot.unitPriceMAD.toLocaleString('fr-FR')} MAD
                    </span>
                    <span className="text-[10px] text-stone-500"> / plant</span>
                  </div>
                  <span className="font-bold text-stone-700">
                    {lot.quantityAvailable.toLocaleString('fr-FR')} plants
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-medium">
                {lot.treatments?.length || 0} traitement(s) enregistré(s)
              </span>

              <button
                type="button"
                onClick={() => {
                  openOfferDetail(lot);
                  setActiveTab('nursery_lot_detail');
                }}
                className="py-1.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
              >
                <span>Fiche Lot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
