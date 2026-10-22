import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { SmartImage } from '../../../components/SmartImage';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Truck,
  CheckCircle2,
  Lock,
  Star,
  Layers,
  Award,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const ListingDetailPage: React.FC = () => {
  const {
    language,
    selectedOfferForDetail,
    produceListings,
    nurseryLots,
    setActiveTab,
    openEscrowPayment,
    openLogisticsModal,
    openOfferDiscussion,
    openRatingModal,
    favoriteIds,
    toggleFavorite,
  } = useApp();

  // Item actuel ou repli si aucun sélectionné
  const item = selectedOfferForDetail || produceListings[0] || (nurseryLots[0] as any);

  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <p className="text-stone-500 text-sm">
          {tr(language, 'Aucune annonce sélectionnée.', 'لم يتم تحديد أي إعلان.', 'No listing selected.')}
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('marketplace')}
          className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
        >
          {tr(language, 'Retourner au marché', 'العودة للسوق', 'Back to Marketplace')}
        </button>
      </div>
    );
  }

  const isNursery = 'species' in item || 'onssaStatus' in item;
  const isFavorite = favoriteIds.includes(item.id);

  const photos: string[] = [
    item.imageUrl,
    ...(item.additionalImages || []),
  ].filter(Boolean);

  const title = item.title || `${item.species || ''} ${item.variety || ''}`.trim() || 'Lot Agricole';
  const price = item.pricePerUnitMAD ?? item.unitPriceMAD ?? 0;
  const unit = item.unit || 'Kg';
  const quantity = item.quantityAvailable ?? item.surfaceHectares ?? 0;
  const seller = item.sellerName || item.nurseryName || 'Producteur Agricole Partenaire';
  const region = item.region || 'Souss-Massa';
  const locationCity = item.locationCity || item.city || region;

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Bouton retour */}
      <button
        type="button"
        onClick={() => setActiveTab('marketplace')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour au catalogue', 'العودة للكاتالوج', 'Back to Catalog')}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Gauche : Galerie Photos (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
            <SmartImage
              src={photos[selectedPhotoIdx] || photos[0] || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=1200&q=80'}
              alt={title}
              className="w-full h-full object-cover"
            />
            {item.isFeatured && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                ⭐ En Vedette
              </span>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedPhotoIdx === idx ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-stone-200 opacity-70'
                  }`}
                >
                  <SmartImage src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Fiche Technique */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-stone-900">
              {tr(language, 'Description & Informations Produit', 'تفاصيل ومواصفات العرض', 'Product Description')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {item.description || tr(language, 'Produit agricole récolté dans les meilleures conditions de fraîcheur et de calibrage.', 'محصول فلاحي متميز خاضع لمعايير الجودة والتصنيف.', 'High-quality agricultural product harvested in optimal conditions.')}
            </p>

            {/* Fiche technique */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-stone-100 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] text-stone-400 block font-semibold">Variété</span>
                <span className="font-bold text-stone-800">{item.variety || 'Standard'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] text-stone-400 block font-semibold">Calibre</span>
                <span className="font-bold text-stone-800">{item.calibre || item.plantCalibre || 'Conforme marché'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] text-stone-400 block font-semibold">Conditionnement</span>
                <span className="font-bold text-stone-800">{item.packaging || 'Caisses IFCO / Vrac'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Prix, Vendeur & Actions CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {isNursery ? 'Plants Pépinière Certifiés' : item.category || 'Production Agricole'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                {title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{locationCity} ({region})</span>
              </div>
            </div>

            {/* Prix & Quantité */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">Prix unitaire</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-800">
                    {price.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs font-bold text-stone-600">MAD / {unit}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-500 block">Disponible</span>
                <span className="text-base font-bold text-stone-900">
                  {quantity.toLocaleString('fr-FR')} {unit}
                </span>
              </div>
            </div>

            {/* Fiche Vendeur */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-stone-400">Vendeur vérifié</span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <span>{seller}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold">4.9 / 5</span>
                    <span className="text-stone-400">(Avis vérifiés sous séquestre)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pile d'actions CTA */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => openEscrowPayment(isNursery ? 'nursery_lot' : 'produce', item)}
                className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-200" />
                <span>{tr(language, 'Commander avec Séquestre Garanti', 'طلب الشراء مع الضمان البنكي', 'Order with Escrow Guarantee')}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openOfferDiscussion(item.id, isNursery ? 'nursery' : 'produce', item)}
                  className="min-h-[42px] px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>{tr(language, 'Négocier l\'offre', 'تفاوض مباشر', 'Negotiate')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openLogisticsModal()}
                  className="min-h-[42px] px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>{tr(language, 'Fret & Transport', 'طلب نقل مبرد', 'Book Freight')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleFavorite(item.id)}
                className={`w-full py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isFavorite
                    ? 'border-red-200 bg-red-50 text-red-700 font-bold'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>{isFavorite ? '❤️ Ajouté aux Favoris' : '🤍 Enregistrer dans mes Favoris'}</span>
              </button>
            </div>

            {/* Réassurance & Sécurité */}
            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-[11px] text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Paiement Garanti Séquestre CMI</span>
              </div>
              <p className="text-emerald-800/90 leading-tight">
                Les fonds ne sont reversés au vendeur qu'après vérification conforme de la marchandise à destination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
