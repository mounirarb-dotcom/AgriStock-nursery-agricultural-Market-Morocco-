import React from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  Heart,
  Store,
  Zap,
  Handshake,
  MapPin,
  ShieldCheck,
  Package,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { classifyNurseryLot, NURSERY_RUBRIQUES } from '../utils/nurseryUtils';

export const FavoritesView: React.FC = () => {
  const {
    language,
    favoriteIds,
    toggleFavorite,
    produceListings,
    nurseryLots,
    farmStandingListings,
    setActiveTab,
    openSimpleOrder,
    openOfferDiscussion,
  } = useApp();

  // Rassembler tous les articles favoris
  const favoriteProduce = (produceListings || []).filter((item) =>
    favoriteIds.includes(item.id)
  );
  const favoriteStanding = (farmStandingListings || []).filter((item) =>
    favoriteIds.includes(item.id)
  );
  const favoriteNursery = (nurseryLots || []).filter((lot) =>
    favoriteIds.includes(lot.id)
  );

  const totalFavorites =
    favoriteProduce.length + favoriteStanding.length + favoriteNursery.length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Header Favoris */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200 mb-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            <span>ESPACE ACHETEUR • COUPS DE CŒUR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {tr(language, 'Mes Favoris', 'قائمة المفضلة لدي', 'My Favorites')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(
              language,
              'Vos offres enregistrées pour un achat rapide et direct avec garantie de séquestre CMI.',
              'عروضك المحفوظة للطلب السريع والمباشر مع ضمان الحساب البنكي المؤمن.',
              'Your saved listings for quick and direct ordering with escrow guarantee.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('market')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <Store className="w-4 h-4" />
          <span>{tr(language, 'Explorer le Marché', 'استكشاف السوق', 'Explore Market')}</span>
        </button>
      </div>

      {/* Liste des favoris ou état vide */}
      {totalFavorites === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-10 sm:p-14 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8 fill-rose-100" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {tr(language, 'Aucun favori pour le moment', 'لا توجد عناصر في المفضلة حالياً', 'No favorites yet')}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {tr(
                language,
                'Cliquez sur le cœur ❤️ sur n’importe quelle offre pour la retrouver ici et la commander facilement.',
                'انقر على علامة القلب ❤️ في أي عرض لحفظه هنا والطلب بضغطة زر واحدة.',
                'Click the heart ❤️ on any offer to save it here and order with ease.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer"
          >
            <span>{tr(language, 'Voir les offres disponibles', 'تصفح العروض المتوفرة', 'View available offers')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Récoltes / Primeurs en favori */}
          {favoriteProduce.map((item) => (
            <div
              key={`fav-produce-${item.id}`}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                    {item.category === 'Élevage & Bétail' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black">
                        🐑 2. Production Animale
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-white text-[10px] font-bold">
                        🥕 1. Fruits & Légumes
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-stone-900/80 text-white text-[10px] font-medium backdrop-blur-xs">
                      {item.region.split('(')[0].trim()}
                    </span>
                  </div>

                  {/* Bouton retirer favori */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs transition cursor-pointer"
                    title="Retirer des favoris"
                  >
                    <Heart className="w-4 h-4 fill-rose-600" />
                  </button>

                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-stone-900/90 text-emerald-300 text-xs font-black backdrop-blur-xs">
                      {(item.pricePerUnitMAD ?? 0).toLocaleString()} MAD / {item.unit}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="font-bold text-sm text-stone-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-stone-500">
                    {item.variety} — <span className="font-semibold text-emerald-800">{item.sellerName}</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1.5 border-t border-stone-100">
                    <span>
                      Dispo : <strong>{item.quantityAvailable} {item.unit}</strong>
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>ONSSA</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions directes */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openSimpleOrder(item)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>{tr(language, 'Commander', 'طلب فوري', 'Order Now')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openOfferDiscussion(item.id, 'produce', item)}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Handshake className="w-3.5 h-3.5 text-amber-700" />
                  <span>{tr(language, 'Négocier', 'تفاوض', 'Chat')}</span>
                </button>
              </div>
            </div>
          ))}

          {/* 2. Vergers sur pied en favori */}
          {favoriteStanding.map((item) => (
            <div
              key={`fav-standing-${item.id}`}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 text-[10px] font-bold">
                      🌳 1. Fruits (Verger sur pied)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                      {item.surfaceHectares} Ha
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs transition cursor-pointer"
                    title="Retirer des favoris"
                  >
                    <Heart className="w-4 h-4 fill-rose-600" />
                  </button>

                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-stone-900/90 text-emerald-300 text-xs font-black backdrop-blur-xs">
                      {(item.pricePerHectareMAD ?? 0).toLocaleString()} MAD / Ha
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="font-bold text-sm text-stone-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-stone-500">
                    {item.variety} — <span className="font-semibold text-emerald-800">{item.sellerName}</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1.5 border-t border-stone-100">
                    <span>{item.region}</span>
                    <span className="font-bold text-amber-800">{item.cropCategory}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openSimpleOrder({ ...item, unit: 'Ha', pricePerUnitMAD: item.pricePerHectareMAD, quantityAvailable: item.surfaceHectares })}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>{tr(language, 'Réserver Verger', 'حجز البستان', 'Reserve')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openOfferDiscussion(item.id, 'farm_standing', item)}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Handshake className="w-3.5 h-3.5 text-amber-700" />
                  <span>{tr(language, 'Négocier', 'تفاوض', 'Chat')}</span>
                </button>
              </div>
            </div>
          ))}

          {/* 3. Pépinières en favori */}
          {favoriteNursery.map((lot) => {
            const subRubrique = classifyNurseryLot(lot);
            const subInfo = NURSERY_RUBRIQUES.find((r) => r.id === subRubrique);
            const effectivePrice = lot.unitPriceMAD ?? (lot as any).priceMAD ?? 0;

            return (
              <div
                key={`fav-nursery-${lot.id}`}
                className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={
                        lot.imageUrl ||
                        'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={lot.species}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-teal-800 text-white text-[10px] font-bold">
                        🌱 3. Pépinière
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                        {subInfo?.labelFr || lot.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(lot.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs transition cursor-pointer"
                      title="Retirer des favoris"
                    >
                      <Heart className="w-4 h-4 fill-rose-600" />
                    </button>

                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2.5 py-1 rounded-xl bg-stone-900/90 text-emerald-300 text-xs font-black backdrop-blur-xs">
                        {effectivePrice.toLocaleString()} MAD / plant
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="font-bold text-sm text-stone-900 line-clamp-1">{lot.species}</h3>
                    <p className="text-xs text-stone-500">
                      {lot.variety} — Lot : <span className="font-mono font-bold text-stone-700">{lot.batchNumber}</span>
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1.5 border-t border-stone-100">
                      <span>
                        Dispo : <strong>{(lot.quantityAvailable ?? 0).toLocaleString()} plants</strong>
                      </span>
                      <span className="text-emerald-700 font-bold">Passeport ONSSA</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openSimpleOrder({ ...lot, title: `${lot.species} (${lot.variety})`, unit: 'plants', pricePerUnitMAD: effectivePrice })}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>{tr(language, 'Commander Lot', 'طلب الشتلات', 'Order Plants')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openOfferDiscussion(lot.id, 'nursery', lot)}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Handshake className="w-3.5 h-3.5 text-amber-700" />
                    <span>{tr(language, 'Négocier', 'تفاوض', 'Chat')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
