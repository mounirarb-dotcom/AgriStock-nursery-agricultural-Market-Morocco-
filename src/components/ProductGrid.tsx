import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { ProductCard } from './ProductCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Sprout,
  Apple,
  Salad,
  Tractor,
  Layers,
  MapPin,
  X,
  PackageOpen,
} from 'lucide-react';
import { ProduceListing, NurseryLot, FarmStandingListing } from '../types';

export interface ProductGridProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  initialCategory?: string;
  showFilters?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  subtitle,
  limit,
  initialCategory = 'ALL',
  showFilters = true,
}) => {
  const {
    language,
    produceListings,
    nurseryLots,
    farmStandingListings,
    setActiveTab,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'volume'>('recent');

  // Catégories interactives (boutons fonctionnels)
  const categoryFilters = [
    { id: 'ALL', label: tr(language, 'Tous les produits', 'جميع العروض', 'All Products'), icon: <Layers className="w-4 h-4" /> },
    { id: 'FRUIT', label: tr(language, 'Fruits & Agrumes', 'فواكه وحوامض', 'Fruits & Citrus'), icon: <Apple className="w-4 h-4" /> },
    { id: 'VEG', label: tr(language, 'Légumes & Maraîchage', 'خضر ومحاصيل', 'Vegetables'), icon: <Salad className="w-4 h-4" /> },
    { id: 'NURSERY', label: tr(language, 'Plants de Pépinière', 'شتائل المشاتل', 'Nursery Plants'), icon: <Sprout className="w-4 h-4" /> },
    { id: 'LIVESTOCK', label: tr(language, 'Élevage & Bétail', 'مواشي وأنعام', 'Livestock'), icon: <Tractor className="w-4 h-4" /> },
  ];

  // Régions marocaines représentées
  const regions = useMemo(() => {
    const set = new Set<string>();
    produceListings.forEach((p) => p.region && set.add(p.region));
    nurseryLots.forEach((n) => n.region && set.add(n.region));
    return Array.from(set);
  }, [produceListings, nurseryLots]);

  // Fusion et filtrage
  const filteredProducts = useMemo(() => {
    let combined: (ProduceListing | (NurseryLot & { type: 'nursery' }))[] = [];

    // Ajouter les annonces de récoltes
    if (activeCategory === 'ALL' || activeCategory === 'FRUIT' || activeCategory === 'VEG' || activeCategory === 'LIVESTOCK') {
      const filteredProduce = produceListings
        .filter((item) => item.status === 'Disponible')
        .filter((item) => {
          if (activeCategory === 'FRUIT') return item.category === 'Fruit';
          if (activeCategory === 'VEG') return item.category === 'Légume';
          if (activeCategory === 'LIVESTOCK') return item.category === 'Élevage & Bétail';
          return true;
        });
      combined.push(...filteredProduce);
    }

    // Ajouter les lots de pépinières
    if (activeCategory === 'ALL' || activeCategory === 'NURSERY') {
      const nurseryItems = nurseryLots.map((lot) => ({ ...lot, type: 'nursery' as const }));
      combined.push(...nurseryItems);
    }

    // Filtrage par région
    if (selectedRegion !== 'ALL') {
      combined = combined.filter((item) => item.region === selectedRegion);
    }

    // Filtrage par texte de recherche
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      combined = combined.filter((item) => {
        if ('species' in item) {
          return (
            item.species.toLowerCase().includes(q) ||
            item.variety.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            (item.sellerName && item.sellerName.toLowerCase().includes(q))
          );
        } else {
          return (
            item.title.toLowerCase().includes(q) ||
            item.variety.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            (item.sellerName && item.sellerName.toLowerCase().includes(q)) ||
            (item.locationCity && item.locationCity.toLowerCase().includes(q))
          );
        }
      });
    }

    // Tri
    combined.sort((a, b) => {
      const priceA = 'species' in a ? a.unitPriceMAD : a.pricePerUnitMAD;
      const priceB = 'species' in b ? b.unitPriceMAD : b.pricePerUnitMAD;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'volume') return b.quantityAvailable - a.quantityAvailable;
      // 'recent' fallback
      return 0;
    });

    if (limit && limit > 0) {
      return combined.slice(0, limit);
    }
    return combined;
  }, [
    activeCategory,
    produceListings,
    nurseryLots,
    selectedRegion,
    searchTerm,
    sortBy,
    limit,
  ]);

  return (
    <section className="space-y-6" aria-labelledby="product-grid-heading">
      {/* En-tête de section optionnel */}
      {(title || subtitle) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-stone-200">
          <div>
            {title && (
              <h2
                id="product-grid-heading"
                className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>
              {filteredProducts.length}{' '}
              {tr(language, 'offres disponibles', 'عرض متوفر', 'available offers')}
            </span>
          </div>
        </div>
      )}

      {/* Barre de contrôles et filtres */}
      {showFilters && (
        <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs">
          {/* Ligne 1 : Segmented control des catégories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categoryFilters.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-300' : 'text-stone-500'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Ligne 2 : Recherche & Sélecteurs de tri et région */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-stone-100 text-xs">
            {/* Champ de recherche */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={tr(
                  language,
                  'Rechercher variété, calibre, coopérative...',
                  'بحث بالصنف، الكاليبر، التعاونية...',
                  'Search variety, size, cooperative...'
                )}
                className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white text-xs placeholder-stone-400 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtre Région */}
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                aria-label={tr(language, 'Filtrer par région', 'تصفية حسب المنطقة', 'Filter by region')}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-emerald-600 text-xs cursor-pointer truncate"
              >
                <option value="ALL">
                  📍 {tr(language, 'Toutes les régions du Maroc', 'كل جهات المغرب', 'All Moroccan regions')}
                </option>
                {regions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg.split('(')[0].trim()}
                  </option>
                ))}
              </select>
            </div>

            {/* Tri par critère */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label={tr(language, 'Trier par critère', 'ترتيب العروض', 'Sort by')}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-emerald-600 text-xs cursor-pointer truncate"
              >
                <option value="recent">⏱ {tr(language, 'Nouveautés récentes', 'الأحدث نشراً', 'Most recent')}</option>
                <option value="price_asc">💰 {tr(language, 'Prix croissant (MAD)', 'السعر تصاعدي', 'Price: low to high')}</option>
                <option value="price_desc">💎 {tr(language, 'Prix décroissant (MAD)', 'السعر تنازلي', 'Price: high to low')}</option>
                <option value="volume">📦 {tr(language, 'Volume disponible', 'حجم المخزون', 'Highest quantity')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grille responsive des cartes produits */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} item={product} />
          ))}
        </div>
      ) : (
        /* État vide si aucune offre trouvée */
        <div className="text-center p-8 sm:p-12 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center">
            <PackageOpen className="w-7 h-7 text-stone-400" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">
            {tr(
              language,
              'Aucune offre ne correspond à vos filtres actuels',
              'لا يوجد عرض يطابق معايير البحث الحالية',
              'No offers match your current filters'
            )}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {tr(
              language,
              'Modifiez vos termes de recherche ou réinitialisez la région pour découvrir d’autres lots certifiés.',
              'يرجى تغيير كلمات البحث أو إعادة ضبط المنطقة لاكتشاف دفعات أخرى.',
              'Try adjusting your search terms or resetting the region to view other certified listings.'
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('ALL');
              setSearchTerm('');
              setSelectedRegion('ALL');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs transition cursor-pointer"
          >
            {tr(language, 'Réinitialiser les filtres', 'إعادة ضبط التصفية', 'Reset filters')}
          </button>
        </div>
      )}
    </section>
  );
};
