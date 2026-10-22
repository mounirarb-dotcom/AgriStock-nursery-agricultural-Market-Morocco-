import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { SmartImage } from '../../../components/SmartImage';
import {
  ArrowLeft,
  Package,
  MapPin,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const InventoryItemPage: React.FC = () => {
  const {
    language,
    selectedOfferForDetail,
    produceListings,
    updateProduceListing,
    deleteProduceListing,
    setActiveTab,
  } = useApp();

  const item = selectedOfferForDetail || produceListings[0];

  const [quantity, setQuantity] = useState(item?.quantityAvailable || 10);
  const [priceMAD, setPriceMAD] = useState(item?.pricePerUnitMAD || 5);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <p className="text-stone-500 text-sm">
          {tr(language, 'Aucun lot sélectionné.', 'لم يتم تحديد أي محصول.', 'No item selected.')}
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
        >
          {tr(language, 'Retour à l’inventaire', 'العودة للمخزون', 'Back to Inventory')}
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduceListing(item.id, {
      quantityAvailable: Number(quantity),
      pricePerUnitMAD: Number(priceMAD),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('inventory')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour à l’inventaire', 'العودة للمخزون', 'Back to Inventory')}</span>
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
              <SmartImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {item.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">{item.title}</h1>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{item.locationCity || item.region}</span>
              </div>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 self-start">
            Statut : {item.status}
          </span>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{tr(language, 'Modifications enregistrées avec succès.', 'تم حفظ التعديلات بنجاح.', 'Changes saved successfully.')}</span>
          </div>
        )}

        {/* Formulaire d’ajustement rapide */}
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
            Ajustement rapide du stock et du prix
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Quantité disponible ({item.unit})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-bold focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Prix unitaire (MAD / {item.unit})
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={priceMAD}
                onChange={(e) => setPriceMAD(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-emerald-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Supprimer définitivement ce lot ?`)) {
                  deleteProduceListing(item.id);
                  setActiveTab('inventory');
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer le lot</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
