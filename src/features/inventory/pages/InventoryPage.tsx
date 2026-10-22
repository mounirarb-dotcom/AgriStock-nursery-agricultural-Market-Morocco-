import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { SmartImage } from '../../../components/SmartImage';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit3,
  Trash2,
  FileSpreadsheet,
  QrCode,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { ProduceListing } from '../../../types';

export const InventoryPage: React.FC = () => {
  const {
    language,
    produceListings,
    deleteProduceListing,
    updateListingStatus,
    openExcelStockModal,
    openFieldQRScannerModal,
    setActiveTab,
    openOfferDetail,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Disponible' | 'Réservé' | 'Vendu'>('ALL');

  const filtered = produceListings.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.variety.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const lowStockCount = produceListings.filter((p) => p.quantityAvailable < 5).length;

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Header & Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>GESTION DE STOCK BORD CHAMP</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {tr(language, 'Inventaire & Lots Agricoles', 'المخزون والسلع الزراعية', 'Inventory & Agricultural Lots')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(
              language,
              'Suivez vos volumes disponibles, ajustez les prix de gros et exportez vos fiches de stock.',
              'تتبع الكميات المتوفرة، تعديل أسعار الجملة وتصدير بيانات المخزون.',
              'Track available volumes, adjust wholesale pricing, and export stock reports.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openExcelStockModal('produce')}
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
            onClick={() => setActiveTab('inventory_form')}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{tr(language, 'Ajouter une annonce', 'إضافة منتج', 'Add Product')}</span>
          </button>
        </div>
      </div>

      {/* Alerte stock faible */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{lowStockCount} lot(s)</strong> {tr(language, 'en stock faible ou bientôt épuisé.', 'بكمية منخفضة أو وشيكة النفاد.', 'low in stock.')}
            </span>
          </div>
          <span className="text-[11px] font-bold underline cursor-pointer" onClick={() => setStatusFilter('Disponible')}>
            Voir
          </span>
        </div>
      )}

      {/* Barre d’outils / filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tr(language, 'Filtrer par produit, variété, région...', 'بحث في المخزون...', 'Search stock...')}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:border-emerald-500 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {(['ALL', 'Disponible', 'Réservé', 'Vendu'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st === 'ALL' ? 'Tous' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des cartes de stock */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <Package className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-stone-500 text-xs">
            {tr(language, 'Aucun lot ne correspond à ces critères.', 'لا توجد نتائج مطابقة.', 'No matching inventory items.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
                  <SmartImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      item.status === 'Disponible'
                        ? 'bg-emerald-600 text-white'
                        : item.status === 'Réservé'
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-500 text-white'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-black text-sm text-stone-900 line-clamp-1">{item.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{item.locationCity || item.region}</span>
                  </div>

                  <div className="pt-2 flex items-baseline justify-between border-t border-stone-100">
                    <div>
                      <span className="text-base font-black text-emerald-800">
                        {item.pricePerUnitMAD.toLocaleString('fr-FR')} MAD
                      </span>
                      <span className="text-[10px] text-stone-500"> / {item.unit}</span>
                    </div>
                    <span className={`text-xs font-bold ${item.quantityAvailable < 5 ? 'text-amber-700' : 'text-stone-700'}`}>
                      {item.quantityAvailable.toLocaleString('fr-FR')} {item.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openOfferDetail(item);
                    setActiveTab('inventory_item');
                  }}
                  className="py-1.5 px-3 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1 transition"
                >
                  <span>Fiche Lot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const next = item.status === 'Disponible' ? 'Réservé' : 'Disponible';
                      updateListingStatus(item.id, next);
                    }}
                    className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 transition"
                    title="Basculer Disponibilité"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Supprimer le lot « ${item.title} » ?`)) {
                        deleteProduceListing(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
