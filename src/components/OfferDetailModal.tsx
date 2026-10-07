import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { SmartImage } from './SmartImage';
import {
  X,
  MapPin,
  ShieldCheck,
  Star,
  Phone,
  Clock,
  Package,
  MessageSquare,
  Zap,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sprout,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

export const OfferDetailModal: React.FC = () => {
  const {
    language,
    isOfferDetailModalOpen,
    selectedOfferForDetail,
    closeOfferDetail,
    openSimpleOrder,
    openOfferDiscussion,
    isFavorite,
    toggleFavorite,
  } = useApp();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOfferDetailModalOpen || !selectedOfferForDetail) return null;

  const item = selectedOfferForDetail;
  const isNursery = Boolean(item.species);
  const isStanding = Boolean(item.surfaceHectares);

  const title =
    item.title ||
    item.name ||
    (isNursery ? `${item.species} - ${item.variety}` : 'Produit Agricole');
  const variety = item.variety || (isNursery ? item.species : 'Variété certifiée');
  const region = item.region || 'Maroc';
  const locationCity = item.locationCity || item.location || region.split('(')[0].trim();

  // Price calculations
  const unitPrice =
    item.pricePerUnitMAD ??
    item.pricePerUnit ??
    item.unitPriceMAD ??
    item.priceMAD ??
    item.pricePerHectareMAD ??
    0;
  const unit = item.unit || (isNursery ? 'plant' : isStanding ? 'hectare' : 'kg');
  const quantity = item.quantityAvailable || item.surfaceHectares || 1;
  const minOrder = item.minOrderQuantity || (isNursery ? '100 plants' : '1 Tonne');

  // Images gallery
  const images: string[] = [];
  if (item.imageUrl) images.push(item.imageUrl);
  if (item.images && Array.isArray(item.images)) {
    item.images.forEach((img: string) => {
      if (img && !images.includes(img)) images.push(img);
    });
  }
  if (item.additionalImages && Array.isArray(item.additionalImages)) {
    item.additionalImages.forEach((img: string) => {
      if (img && !images.includes(img)) images.push(img);
    });
  }
  if (images.length === 0) {
    images.push(
      isNursery
        ? 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80'
    );
  }

  // Seller info
  const sellerName = item.sellerName || item.producerName || 'Domaine Agricole Certifié';
  const sellerPhone = item.sellerPhone || item.phone || '+212 612 345 678';
  const rating = item.rating || 4.8;
  const reviewsCount = item.reviewsCount || 142;
  const badge = item.qualityGrade || item.calibre || (isNursery ? 'ONSSA Certifié Bleu' : 'Qualité Extra ✓');
  const hasFav = isFavorite(item.id);

  const handleOrderClick = () => {
    closeOfferDetail();
    openSimpleOrder(item);
  };

  const handleChatClick = () => {
    closeOfferDetail();
    if (isNursery) {
      openOfferDiscussion(item.id, 'nursery', item);
    } else {
      openOfferDiscussion(item.id, 'produce', item);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeOfferDetail}
              className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-700 transition cursor-pointer"
              title="Retour"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-black text-sm text-stone-900 truncate max-w-[280px] sm:max-w-sm">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleFavorite(item.id)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                hasFav
                  ? 'bg-rose-50 text-rose-600'
                  : 'hover:bg-stone-200 text-stone-500'
              }`}
              title={hasFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart className={`w-4 h-4 ${hasFav ? 'fill-rose-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={closeOfferDetail}
              className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Gallery Carousel */}
          <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-stone-900">
            <SmartImage
              src={images[currentImageIndex]}
              alt={title}
              className="w-full h-full object-cover"
            />

            {/* Badges on image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-stone-900/85 backdrop-blur-xs text-white text-xs font-bold shadow-xs">
                {badge}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-xs text-white text-xs font-bold shadow-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Séquestre CMI</span>
              </span>
            </div>

            {/* Arrow Navigation */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Title & Key details */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <Sprout className="w-3.5 h-3.5" />
              <span>{variety}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-2">
              <span className="flex items-center gap-1 font-semibold">
                <Package className="w-3.5 h-3.5 text-stone-400" />
                <span>{quantity} {unit} disponibles</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>{locationCity} ({region.split('(')[0].trim()})</span>
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">
                🌾 Départ champ / pépinière
              </span>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 leading-relaxed">
              <p>{item.description}</p>
            </div>
          )}

          {/* PRIX BLOCK */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              {tr(language, 'Prix Garanti', 'السعر المضمون', 'Guaranteed Price')}
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-stone-900">
                  {unitPrice.toLocaleString('fr-FR')} MAD
                </span>
                <span className="text-xs font-bold text-stone-500 ml-1">/ {unit}</span>
              </div>
              <span className="text-xs font-semibold text-stone-600">
                Commande min : <strong>{minOrder}</strong>
              </span>
            </div>
          </div>

          {/* VENDEUR BLOCK */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {sellerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-stone-900">{sellerName}</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Vérifié</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-stone-900">{rating}</span>
                    <span>({reviewsCount} avis)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/60 grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-semibold">{sellerPhone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Réponse en &lt; 1h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Sticky Footer */}
        <div className="p-4 border-t border-stone-200 bg-white grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleChatClick}
            className="py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs sm:text-sm border border-amber-300 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{tr(language, 'Discuter', 'محادثة', 'Chat')}</span>
          </button>

          <button
            type="button"
            onClick={handleOrderClick}
            className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{tr(language, 'Commander', 'طلب فوري', 'Order Now')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
