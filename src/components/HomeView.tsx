import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { MoroccanRegion, ProduceListing, NurseryLot } from '../types';
import { SmartImage } from './SmartImage';
import { VoiceSearchButton } from './VoiceSearchButton';
import {
  Search,
  Sprout,
  Carrot,
  Trees,
  Truck,
  ShoppingCart,
  MapPin,
  Sun,
  Flame,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Heart,
  Zap,
  Handshake,
  Eye,
  Package,
  MessageSquare,
} from 'lucide-react';

const REGIONS_LIST: MoroccanRegion[] = [
  'Casablanca - Settat & Doukkala',
  'Souss-Massa (Agadir, Taroudant, Chtouka)',
  'L\'Oriental (Berkane, Oujda, Nador)',
  'Gharb - Chrarda (Kénitra, Sidi Slimane)',
  'Fès - Meknès (Saïss, El Hajeb, Sefrou)',
  'Marrakech - Safi (Haouz, El Kelaâ)',
  'Béni Mellal - Khénifra (Tadla)',
  'Drâa - Tafilalet (Zagora, Errachidia)',
  'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)',
];

export const HomeView: React.FC = () => {
  const {
    language,
    setActiveTab,
    produceListings,
    nurseryLots,
    farmStandingListings,
    openOfferDiscussion,
    openEscrowPayment,
    openSimpleOrder,
    openOfferDetail,
    favoriteIds,
    escrowTransactions,
    isFavorite,
    toggleFavorite,
    setIsRoleOnboardingOpen,
    userProfile,
    navigateToProduceCategory,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<MoroccanRegion>(
    userProfile.region || 'Casablanca - Settat & Doukkala'
  );
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [activeAlertDismissed, setActiveAlertDismissed] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('market');
    }
  };

  // 3-5 offres récentes triées
  const recentOffers = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      variety: string;
      region: string;
      priceText: string;
      unit: string;
      quantityText: string;
      image: string;
      badge: string;
      type: 'produce' | 'nursery';
      rawItem: any;
    }> = [];

    // 2 primeurs
    produceListings.slice(0, 2).forEach((p) => {
      const priceVal = p.pricePerUnitMAD || p.pricePerUnit || 0;
      list.push({
        id: p.id,
        title: p.title || p.name || 'Produit Maraîcher',
        variety: p.variety,
        region: p.region,
        priceText: `${priceVal.toLocaleString('fr-FR')} MAD`,
        unit: p.unit === 'Tonnes' ? '/kg' : `/${p.unit}`,
        quantityText: `${p.quantityAvailable || 50} ${p.unit || 'Tonnes'}`,
        image: p.images?.[0] || p.imageUrl || 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
        badge: p.qualityGrade || 'Qualité Extra',
        type: 'produce',
        rawItem: p,
      });
    });

    // 2 pépinières
    nurseryLots.slice(0, 2).forEach((n) => {
      const priceVal = n.unitPriceMAD || n.pricePerUnit || 0;
      list.push({
        id: n.id,
        title: n.species,
        variety: n.variety,
        region: n.region,
        priceText: `${priceVal.toLocaleString('fr-FR')} MAD`,
        unit: '/plant',
        quantityText: `${(n.quantityAvailable || 2500).toLocaleString('fr-FR')} plants`,
        image: n.images?.[0] || n.imageUrl || '/src/assets/images/nursery_olive_saplings_1789031030975.jpg',
        badge: n.certificationCategory === 'blue_label' ? 'ONSSA Certifié Bleu' : 'ONSSA Agréé',
        type: 'nursery',
        rawItem: n,
      });
    });

    return list.slice(0, 4);
  }, [produceListings, nurseryLots]);

  // Favoris de l'acheteur (Écran 1A)
  const favoriteOffers = React.useMemo(() => {
    const allItems: Array<{
      id: string;
      title: string;
      variety: string;
      region: string;
      priceText: string;
      quantityText: string;
      image: string;
      badge: string;
      type: 'produce' | 'nursery';
      rawItem: any;
    }> = [
      ...produceListings.map((p) => ({
        id: p.id,
        title: p.title || p.name,
        variety: p.variety,
        region: p.region,
        priceText: `${(p.pricePerUnitMAD || p.pricePerUnit || 0).toLocaleString('fr-FR')} MAD/kg`,
        quantityText: `${p.quantityAvailable || 10} ${p.unit || 'T'}`,
        image: p.images?.[0] || p.imageUrl,
        badge: p.qualityGrade || 'Qualité Extra',
        type: 'produce' as const,
        rawItem: p,
      })),
      ...nurseryLots.map((n) => ({
        id: n.id,
        title: `${n.species} - ${n.variety}`,
        variety: n.variety,
        region: n.region,
        priceText: `${(n.unitPriceMAD || n.pricePerUnit || 0).toLocaleString('fr-FR')} MAD/plant`,
        quantityText: `${(n.quantityAvailable || 2500).toLocaleString('fr-FR')} plants`,
        image: n.images?.[0] || n.imageUrl,
        badge: 'ONSSA Certifié',
        type: 'nursery' as const,
        rawItem: n,
      })),
    ];

    const userFavs = allItems.filter((i) => favoriteIds.includes(i.id));
    if (userFavs.length > 0) return userFavs.slice(0, 3);
    // Suggestion de 2 favoris par défaut si aucun encore coché
    return allItems.slice(0, 2);
  }, [produceListings, nurseryLots, favoriteIds]);

  // Commandes en cours de l'acheteur (Écran 1A)
  const activeOrders = React.useMemo(() => {
    const active = escrowTransactions.filter(
      (tx) => tx.status === 'funds_held' || tx.status === 'in_transit' || tx.status === 'delivered'
    );
    if (active.length > 0) return active.slice(0, 2);
    // Affichage des dernières commandes
    return escrowTransactions.slice(0, 2);
  }, [escrowTransactions]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16 md:pb-8">
      {/* 0. Profil actif & Sélecteur rapide de rôle (Niveau 1) */}
      <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-200">
            {tr(language, 'Votre profil actif :', 'صفتك النشطة :', 'Active profile :')}
          </span>
          <span className="font-bold text-white px-2 py-0.5 rounded-lg bg-white/10">
            {userProfile.role === 'seller' ? '🌾 Vendeur / Producteur' :
             userProfile.role === 'nursery' ? '🌱 Pépiniériste' :
             userProfile.role === 'carrier' ? '🚛 Transporteur' :
             userProfile.role === 'admin' ? '⚙️ Administrateur' : '🛒 Acheteur'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsRoleOnboardingOpen(true)}
          className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
        >
          <span>⇄</span>
          <span>{tr(language, 'Changer de profil', 'تغيير الصفة', 'Switch profile')}</span>
        </button>
      </div>

      {/* 1. EN-TÊTE ÉPURÉ : App Brand + Localisation + Météo Compacte */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
            AG
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-1.5">
              <span>AGRIStock Maroc</span>
              <span className="text-xs">🇲🇦</span>
            </h1>
            <p className="text-[11px] text-stone-500">
              {tr(language, 'Bourse B2B & Pépinières Certifiées', 'بورصة المعاملات الفلاحية والمشاتل', 'Agricultural B2B Exchange')}
            </p>
          </div>
        </div>

        {/* Localisation & Météo intégrée */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Sélecteur de région */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRegionPicker(!showRegionPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span className="max-w-[140px] truncate">{selectedRegion.split('(')[0].trim()}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showRegionPicker && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-30 space-y-1">
                <div className="text-[10px] font-bold text-stone-400 px-2 py-1 uppercase">
                  Choisir votre région
                </div>
                {REGIONS_LIST.map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(reg);
                      setShowRegionPicker(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                      selectedRegion === reg
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Météo agronomique concise */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>27°C</span>
            <span className="text-amber-400">|</span>
            <span className="text-[11px] font-normal text-amber-800">ET₀ 4,2 mm/j</span>
          </div>
        </div>
      </div>

      {/* 2. RECHERCHE CENTRALE : Que recherchez-vous ? */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center bg-white rounded-2xl border-2 border-emerald-600/40 focus-within:border-emerald-600 shadow-sm p-1.5 transition">
          <div className="pl-3 pr-2 text-emerald-700">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tr(
              language,
              'Que recherchez-vous ? (Plants, tomates, oliviers, récoltes, transport...)',
              'عما تبحث ؟ (شتائل، طماطم، زيتون، محاصيل، شحن مبرد...)',
              'What are you looking for? (Seedlings, tomatoes, olives, freight...)'
            )}
            className="w-full py-2 px-1 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden"
          />

          <div className="flex items-center gap-1.5 pr-1">
            <VoiceSearchButton
              language={language}
              onSearchResult={(q) => {
                setSearchQuery(q);
                setActiveTab('market');
              }}
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              {tr(language, 'Trouver', 'بحث', 'Search')}
            </button>
          </div>
        </div>
      </form>

      {/* 3. LES 5 GRANDES CATÉGORIES */}
      <section className="space-y-3" aria-labelledby="heading-categories">
        <div className="flex items-center justify-between px-1">
          <h2 id="heading-categories" className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {tr(language, 'Catégories', 'الأقسام', 'Categories')}
          </h2>
          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{tr(language, 'Tout voir', 'عرض الكل', 'View all')}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {/* 1. Pépinières */}
          <button
            type="button"
            onClick={() => setActiveTab('nursery')}
            className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-stone-200/90 hover:border-emerald-500 transition-all text-left space-y-2 cursor-pointer group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800">
                {tr(language, 'Pépinières', 'المشاتل', 'Nurseries')}
              </div>
              <div className="text-[10px] text-stone-500">
                Plants ONSSA
              </div>
            </div>
          </button>

          {/* 2. Fruits & Légumes */}
          <button
            type="button"
            onClick={() => {
              navigateToProduceCategory('Fruit');
              setActiveTab('market');
            }}
            className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-stone-200/90 hover:border-emerald-500 transition-all text-left space-y-2 cursor-pointer group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Carrot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800">
                {tr(language, 'Fruits & Légumes', 'خضر وفواكه', 'Fruits & Veg')}
              </div>
              <div className="text-[10px] text-stone-500">
                Récoltes & gros
              </div>
            </div>
          </button>

          {/* 3. Vergers sur pied */}
          <button
            type="button"
            onClick={() => setActiveTab('farm_standing')}
            className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-stone-200/90 hover:border-emerald-500 transition-all text-left space-y-2 cursor-pointer group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800">
                {tr(language, 'Sur Pied', 'على رؤوس أشجارها', 'Standing Crops')}
              </div>
              <div className="text-[10px] text-stone-500">
                Vergers & parcelles
              </div>
            </div>
          </button>

          {/* 4. Transport */}
          <button
            type="button"
            onClick={() => setActiveTab('carrier_space')}
            className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-stone-200/90 hover:border-emerald-500 transition-all text-left space-y-2 cursor-pointer group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800">
                {tr(language, 'Transport', 'الشحن المبرد', 'Transport')}
              </div>
              <div className="text-[10px] text-stone-500">
                Fret frigorifique
              </div>
            </div>
          </button>

          {/* 5. Élevage & Bétail */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('market');
              navigateToProduceCategory('Élevage & Bétail');
            }}
            className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-stone-200/90 hover:border-emerald-500 transition-all text-left space-y-2 cursor-pointer group shadow-2xs col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform text-xl">
              🐑
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800">
                {tr(language, 'Élevage & Bétail', 'مواشي وأغنام', 'Livestock')}
              </div>
              <div className="text-[10px] text-stone-500">
                {tr(language, 'Béliers Sardi & bovins', 'صردي وعجول التسمين', 'Sardi rams & cattle')}
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 4. OFFRES RÉCENTES (3-5 annonces maximum) */}
      <section className="space-y-3" aria-labelledby="heading-recent-offers">
        <div className="flex items-center justify-between px-1">
          <h2 id="heading-recent-offers" className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{tr(language, 'Offres récentes', 'أحدث العروض الحية', 'Recent Offers')}</span>
          </h2>
          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{tr(language, 'Voir tout le marché', 'تصفح كل السوق', 'View all market')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentOffers.map((item) => {
            const hasFavorite = isFavorite(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                    {item.badge}
                  </span>

                  {/* Bouton favori */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer shadow-xs ${
                      hasFavorite
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/40 hover:bg-black/60 text-white'
                    }`}
                    title={hasFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasFavorite ? 'fill-white' : ''}`} />
                  </button>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{item.region.split('(')[0].trim()}</span>
                    </p>
                  </div>

                  <div className="text-[11px] font-semibold text-stone-600">
                    📦 {item.quantityText}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
                    <div>
                      <span className="text-sm font-black text-emerald-800">{item.priceText}</span>
                      <span className="text-[10px] text-stone-500">{item.unit}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openOfferDetail(item.rawItem)}
                        className="px-2 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                        title={tr(language, 'Voir le détail', 'معاينة العرض', 'View detail')}
                      >
                        <Eye className="w-3 h-3 text-emerald-700" />
                        <span>{tr(language, 'Voir', 'معاينة', 'View')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openSimpleOrder(item.rawItem)}
                        className="px-2 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-black transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Commander sous séquestre direct"
                      >
                        <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                        <span>{tr(language, 'Commander', 'طلب', 'Order')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === 'produce') {
                            openOfferDiscussion(item.rawItem.id, 'produce', item.rawItem);
                          } else {
                            openOfferDiscussion(item.rawItem.id, 'nursery', item.rawItem);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] transition cursor-pointer"
                        title="Négocier"
                      >
                        <Handshake className="w-3 h-3 text-amber-700" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MES FAVORIS (Wireframe 1A) */}
      <section className="space-y-3" aria-labelledby="heading-favorites">
        <div className="flex items-center justify-between px-1">
          <h2 id="heading-favorites" className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>{tr(language, 'Mes Favoris', 'قائمة المفضلة', 'My Favorites')} ({favoriteOffers.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{tr(language, 'Voir tout', 'عرض الكل', 'View all')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {favoriteOffers.map((fav) => (
            <div
              key={fav.id}
              className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <SmartImage src={fav.image} alt={fav.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">{fav.title}</h3>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    <strong className="text-emerald-800 font-black">{fav.priceText}</strong> • {fav.quantityText} • {fav.region.split('(')[0].trim()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => openOfferDetail(fav.rawItem)}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{tr(language, 'Voir', 'معاينة', 'View')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (fav.type === 'produce') {
                      openOfferDiscussion(fav.rawItem.id, 'produce', fav.rawItem);
                    } else {
                      openOfferDiscussion(fav.rawItem.id, 'nursery', fav.rawItem);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{tr(language, 'Discuter', 'محادثة', 'Chat')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openSimpleOrder(fav.rawItem)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{tr(language, 'Commander', 'طلب', 'Order')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. MES COMMANDES EN COURS (Wireframe 1A) */}
      <section className="space-y-3" aria-labelledby="heading-orders">
        <div className="flex items-center justify-between px-1">
          <h2 id="heading-orders" className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>{tr(language, 'Mes Commandes', 'طلبياتي الجارية', 'My Orders')} ({activeOrders.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{tr(language, 'Historique complet', 'كل الطلبيات', 'All orders')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {activeOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                    {ord.referenceNumber || `#ESC-2026-MA-${ord.id.slice(-4).toUpperCase()}`}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>
                      {ord.status === 'in_transit'
                        ? tr(language, 'En transit', 'في الطريق', 'In transit')
                        : tr(language, 'Fonds consignés', 'أموال محجوزة', 'Funds held')}
                    </span>
                  </span>
                </div>

                <div className="text-xs font-bold text-stone-800">
                  {ord.itemTitle} : {ord.quantity} {ord.unit} —{' '}
                  <span className="text-emerald-800 font-black">
                    {((ord.totalPaidByBuyerMAD ?? (ord as any).totalAmount ?? 0)).toLocaleString('fr-FR')} MAD
                  </span>
                </div>

                <div className="text-[11px] text-stone-500">
                  📅 {tr(language, 'Livraison estimée :', 'موعد التسليم المتوقع :', 'Est. delivery :')}{' '}
                  {ord.estimatedDeliveryDate ? new Date(ord.estimatedDeliveryDate).toLocaleDateString('fr-FR') : 'Sous 48h'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="self-end sm:self-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>{tr(language, 'Suivre', 'تتبع', 'Track')}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. ALERTES (Uniquement si alerte importante) */}
      {!activeAlertDismissed && (
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {tr(language, 'Alerte Vigilance Météo & Irrigation', 'تنبيه يقظة مناخية والري', 'Weather & Irrigation Advisory')}
              </span>
              <span className="text-[11px] text-amber-800 leading-relaxed block mt-0.5">
                {tr(
                  language,
                  'Hausse des températures prévue sur les bassins du Souss et du Saïss. Recommandation d’irrigation nocturne.',
                  'ارتفاع درجات الحرارة متوقع في سوس والسايس. يوصى ببرمجة الري ليلاً لتفادي التبخر.',
                  'High temperatures forecasted in Souss and Saïss. Nighttime irrigation recommended.'
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveAlertDismissed(true)}
            className="text-stone-400 hover:text-stone-600 text-[11px] font-bold cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
