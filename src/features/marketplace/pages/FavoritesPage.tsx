import React from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { SmartImage } from '../../../components/SmartImage';
import { Heart, MapPin, ArrowRight, Trash2, ShoppingCart, Store, Lock } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const {
    language,
    favoriteIds,
    produceListings,
    nurseryLots,
    toggleFavorite,
    setActiveTab,
    openOfferDetail,
    openEscrowPayment,
  } = useApp();

  // Trouver tous les lots favoris (produits ou pépinière)
  const favoriteProduce = produceListings.filter((p) => favoriteIds.includes(p.id));
  const favoriteNursery = nurseryLots.filter((n) => favoriteIds.includes(n.id));
  const allFavorites = [...favoriteProduce, ...favoriteNursery];

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 text-xs font-bold border border-red-200 mb-1.5">
            <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600" />
            <span>LISTE DE SUIVI & FAVORIS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {tr(language, 'Mes Lots Favoris', 'عروضي المفضلة', 'My Favorite Listings')} ({favoriteIds.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(
              language,
              'Retrouvez facilement les annonces enregistrées et suivez les variations de prix ou de disponibilité.',
              'العروض والمنتجات التي قمت بحفظها للرجوع إليها ومتابعة أسعارها.',
              'Quickly access saved offers and track price or availability changes.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('marketplace')}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Store className="w-4 h-4" />
          <span>{tr(language, 'Explorer le Marché', 'تصفح السوق', 'Explore Marketplace')}</span>
        </button>
      </div>

      {/* Liste des favoris ou Empty State */}
      {allFavorites.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white border border-stone-200 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-lg text-stone-800">
              {tr(language, 'Aucun favori enregistré', 'لا توجد عروض محفوظة', 'No favorites saved')}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {tr(
                language,
                'Cliquez sur l’icône cœur sur les cartes de produits du marché pour les retrouver ici en un clic.',
                'اضغط على رمز القلب في بطاقات العروض لحفظها والرجوع إليها لاحقاً.',
                'Click the heart icon on any product in the marketplace to save it here for fast access.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('marketplace')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            {tr(language, 'Découvrir les annonces', 'استكشاف العروض', 'Discover Listings')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allFavorites.map((item: any) => {
            const isNursery = 'species' in item;
            const title = item.title || `${item.species || ''} ${item.variety || ''}`.trim() || 'Lot';
            const price = item.pricePerUnitMAD ?? item.unitPriceMAD ?? 0;
            const unit = item.unit || 'Kg';
            const quantity = item.quantityAvailable ?? item.surfaceHectares ?? 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
                    <SmartImage
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80'}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-red-600 hover:bg-white shadow-xs transition"
                      title="Retirer des favoris"
                    >
                      <Heart className="w-4 h-4 fill-red-600" />
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-bold">
                      {isNursery ? 'Pépinière' : item.category || 'Production'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-black text-sm text-stone-900 line-clamp-1">{title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{item.locationCity || item.city || item.region}</span>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between border-t border-stone-100">
                      <div>
                        <span className="text-base font-black text-emerald-800">
                          {price.toLocaleString('fr-FR')} MAD
                        </span>
                        <span className="text-[10px] text-stone-500"> / {unit}</span>
                      </div>
                      <span className="text-xs font-semibold text-stone-600">
                        {quantity.toLocaleString('fr-FR')} {unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border-t border-stone-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      openOfferDetail(item);
                      setActiveTab('listing_detail');
                    }}
                    className="py-1.5 px-2 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1 transition"
                  >
                    <span>Détails</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEscrowPayment(isNursery ? 'nursery_lot' : 'produce', item)}
                    className="py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Commander</span>
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
