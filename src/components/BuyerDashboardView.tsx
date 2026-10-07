import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  ShoppingCart,
  ShieldCheck,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Search,
  Plus,
  ArrowRight,
  Store,
  Sprout,
  DollarSign,
  UserCheck,
  Building2,
  MapPin,
  Phone,
  RefreshCw,
  Tractor,
  Scale,
  Star,
  Layers,
  Zap,
  Handshake,
  Trees,
  RotateCcw,
} from 'lucide-react';
import { OfferDiscussionThread } from '../types';
import { isItemOwnedByUser } from '../utils/ownershipUtils';
import {
  classifyNurseryLot,
  NURSERY_RUBRIQUES,
  NurserySubRubrique,
} from '../utils/nurseryUtils';

export type BuyerMarketRubrique =
  | 'ALL'
  | 'fruits_legumes'
  | 'production_animale'
  | 'pepinieres'
  | 'harvest'
  | 'standing'
  | 'nursery'
  | 'livestock';

export const BuyerDashboardView: React.FC = () => {
  const {
    language,
    userProfile,
    googleUser,
    setUserRole,
    switchActiveRole,
    setIsIdentificationModalOpen,
    escrowTransactions,
    releaseEscrowFunds,
    openLitigation,
    discussions,
    totalUnreadDiscussionsCount,
    transportBookings,
    produceListings,
    nurseryLots,
    farmStandingListings,
    openEscrowPayment,
    setActiveTab,
    openOfferDiscussion,
    openLogisticsModal,
    setIsEscrowListModalOpen,
    wholesalePrices,
    reviews,
    openRatingModal,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'producer_offers' | 'orders' | 'discussions' | 'logistics' | 'price_comparison' | 'reviews'>('producer_offers');
  const [offerCategoryFilter, setOfferCategoryFilter] = useState<BuyerMarketRubrique>('ALL');
  const [nurserySubFilter, setNurserySubFilter] = useState<'ALL' | NurserySubRubrique>('ALL');
  const [offerSearchTerm, setOfferSearchTerm] = useState<string>('');
  const [selectedProductForComparison, setSelectedProductForComparison] = useState<string>('Tomate');

  // Filtrer les commandes séquestres de l'acheteur
  const buyerEscrowList = escrowTransactions; // Dans notre architecture locale, on affiche la liste active

  // Discussions actives
  const discussionsList = Object.values(discussions || {}) as OfferDiscussionThread[];

  // Total engagé sous séquestre
  const totalEscrowAmount = buyerEscrowList.reduce((sum, tx) => sum + (tx.totalPaidByBuyerMAD || 0), 0);
  const activeOrdersCount = buyerEscrowList.filter(tx => tx.status !== 'released' && tx.status !== 'disputed').length;

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* HEADER TABLEAU DE BORD ACHETEUR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b2416] via-[#123623] to-[#1c4d33] p-6 sm:p-8 text-white shadow-xl border border-emerald-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                {tr(language, 'Tableau de bord Acheteur & Négociant', 'لوحة تحكم المشتري والتاجر', 'Buyer & Trader Dashboard')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold">
                🛡️ {tr(language, 'Paiements Séquestre Protégés CMI/Stripe', 'دفع آمن ومضمون', 'Escrow Protected')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{userProfile.displayName || tr(language, 'Espace Acheteur', 'فضاء المشتري', 'Buyer Space')}</span>
              {userProfile.companyName && (
                <span className="text-sm sm:text-base font-normal text-emerald-300/80">
                  — {userProfile.companyName}
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              {tr(
                language,
                'Gérez vos approvisionnements agricoles, suivez vos commandes sous séquestre garanti, négociez directement avec les producteurs et organisez le transport logistique.',
                'إدارة مشترياتك الفلاحية، تتبع طلبياتك مع الحساب البنكي الضامن، التفاوض المباشر مع الفلاحين وحجز شاحنات النقل.',
                'Manage your agricultural supplies, track escrow-guaranteed orders, negotiate with producers, and organize freight logistics.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200/80 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {userProfile.region}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {userProfile.phone || '+212 600 000 000'}
              </span>
            </div>
          </div>

          {/* Quick Profile Actions & Multi-Role Switcher */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('market')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-xs shadow-md transition cursor-pointer"
            >
              <Store className="w-4 h-4 text-stone-950" />
              <span>{tr(language, 'Acheter des Récoltes & Produits', 'تصفح وشراء المحاصيل المعروضة', 'Browse & Buy Available Offers')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsIdentificationModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer backdrop-blur-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{tr(language, 'Modifier mon profil', 'تعديل بيانات الحساب', 'Edit Profile')}</span>
            </button>

            {/* Sélecteur rapide des autres espaces métiers */}
            <div className="p-2 rounded-2xl bg-stone-900/60 border border-white/15 space-y-1.5 backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-300/80 block px-1 tracking-wider">
                {tr(language, 'Changer d\'espace métier :', 'التبديل إلى فضاء آخر :', 'Switch Workspace :')}
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserRole('seller');
                    setActiveTab('seller_space');
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-stone-950 font-bold text-[11px] transition text-center cursor-pointer"
                  title="Vendeur / Producteur"
                >
                  🌾 Vendeur
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserRole('nursery');
                    setActiveTab('nursery_space');
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-stone-950 font-bold text-[11px] transition text-center cursor-pointer"
                  title="Pépiniériste Agréé"
                >
                  🌱 Pépinière
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserRole('carrier');
                    setActiveTab('carrier_space');
                  }}
                  className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-200 hover:text-stone-950 font-bold text-[11px] transition text-center cursor-pointer"
                  title="Transporteur Agréé"
                >
                  🚛 Fret
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRICS ACHETEUR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Commandes sous séquestre */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Commandes Séquestre', 'الطلبيات المضمونة', 'Escrow Orders')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{buyerEscrowList.length}</div>
          <p className="text-[11px] text-stone-500">
            {activeOrdersCount}{' '}
            {tr(language, 'en cours de livraison / inspection', 'قيد التسليم / المعاينة', 'in delivery / inspection')}
          </p>
        </div>

        {/* Metric 2: Montant total sécurisé */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Montant Protégé', 'المبلغ المؤمن', 'Protected Funds')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {(totalEscrowAmount || 0).toLocaleString()} <span className="text-xs font-bold text-stone-500">MAD</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {tr(language, 'Garanti jusqu\'à conformité', 'مضمون حتى التأكد من الجودة', 'Guaranteed until verified')}
          </p>
        </div>

        {/* Metric 3: Négociations en cours */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Négociations Actives', 'المفاوضات المباشرة', 'Active Chats')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{discussionsList.length}</div>
          <p className="text-[11px] text-stone-500">
            {totalUnreadDiscussionsCount > 0 ? (
              <span className="text-amber-600 font-bold">
                {totalUnreadDiscussionsCount} {tr(language, 'nouveaux messages', 'رسائل جديدة', 'new messages')}
              </span>
            ) : (
              tr(language, 'Offres & prix directs', 'عروض وأسعار مباشرة', 'Direct price offers')
            )}
          </p>
        </div>

        {/* Metric 4: Fret & Camions réservés */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-teal-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Fret Logistique', 'الشحن والنقل', 'Logistics Freight')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{transportBookings.length}</div>
          <p className="text-[11px] text-stone-500">
            {tr(language, 'Camions frigo & plateaux', 'شاحنات تبريد ونقل', 'Reefer & flatbed trucks')}
          </p>
        </div>
      </div>

      {/* NAVIGATION INTERNE DU TABLEAU DE BORD ACHETEUR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-stone-200/70 border border-stone-300/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('producer_offers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'producer_offers'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>{tr(language, 'Marché Acheteur (Annonces par Rubrique)', 'سوق المشتري (الإعلانات حسب الأقسام)', 'Buyer Market (Listings by Rubric)')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {(produceListings?.filter(p => p.category !== 'Machinisme & Équipements' && !p.title?.toLowerCase().includes('tracteur'))?.length || 0) + (farmStandingListings?.length || 0) + (nurseryLots?.length || 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{tr(language, 'Mes Commandes Séquestre', 'طلبياتي المضمونة', 'My Escrow Orders')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {buyerEscrowList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('discussions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'discussions'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{tr(language, 'Négociations en cours', 'المفاوضات الجارية', 'Negotiations')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {discussionsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logistics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'logistics'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{tr(language, 'Fret & Livraisons', 'الشحن والتسليم', 'Freight & Deliveries')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {transportBookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('price_comparison')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'price_comparison'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{tr(language, 'Comparateur de Prix', 'مقارنة الأسعار', 'Price Comparison')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('reviews')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'reviews'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>{tr(language, 'Évaluations & Avis', 'التقييمات والآراء', 'Reviews & Ratings')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {reviews.length}
            </span>
          </button>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 pr-1">
          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>{tr(language, 'Acheter des Récoltes', 'شراء المحاصيل', 'Buy Produce')}</span>
          </button>
        </div>
      </div>

      {/* CONTENU SELON LE SOUS-ONGLET */}
      {/* 0. SOUS-ONGLET : OFFRES DISPONIBLES PARTAGÉES PAR LES PRODUCTEURS ET VENDEURS */}
      {activeSubTab === 'producer_offers' && (
        <div className="space-y-5">
          {/* Bannière de règle de rôle Acheteur */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 shadow-md space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  {tr(
                    language,
                    'Marché Acheteur : Toutes les Annonces par Rubrique',
                    'سوق المشتري : جميع الإعلانات مصنفة حسب الأقسام',
                    'Buyer Market : All Listings by Rubric'
                  )}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('market')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{tr(language, 'Ouvrir le Marché Général', 'فتح السوق العام', 'Open General Market')}</span>
              </button>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed max-w-3xl">
              {tr(
                language,
                'Consultez toutes les annonces officielles d’approvisionnement par rubrique : 1. Fruits & Légumes, 2. Production Animale, et 3. Les Pépinières (a. arboricole, b. maraîcher, c. ornementale). Les offres de machines agricoles sont strictement retirées.',
                'تصفح كافة الإعلانات الرسمية للتزود حسب الأقسام: 1. الخضر والفواكه، 2. الإنتاج الحيواني، و 3. المشاتل (أ. أشجار مثمرة، ب. خضروات، ج. زينة). عروض الآلات الفلاحية محذوفة نهائياً.',
                'Browse all official supply listings by rubric: 1. Fruits & Vegetables, 2. Livestock & Animals, and 3. The Nurseries (a. fruit trees, b. vegetables, c. ornamental). Farm machinery offers are strictly removed.'
              )}
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {tr(
                  language,
                  'Règle Plateforme : L\'espace acheteur ne possède pas d\'option de publication d\'offres de production. Vous consultez exclusivement les offres réelles.',
                  'قانون المنصة: فضاء المشتري لا يحتوي على نشر عروض إنتاج. دورك مخصص للاطلاع والشراء المباشر.',
                  'Platform Rule: The buyer space does not contain production publishing options. Your role is dedicated to browsing and ordering.'
                )}
              </span>
            </div>
          </div>

          {/* Barre de Recherche et Filtres par Catégorie */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={tr(
                    language,
                    'Rechercher une récolte, variété, région ou producteur...',
                    'ابحث عن محصول، صنف، منطقة أو فلاح...',
                    'Search crops, varieties, regions or producers...'
                  )}
                  value={offerSearchTerm}
                  onChange={(e) => setOfferSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {offerSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setOfferSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Rubriques officielles Marché Acheteur */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  {tr(language, 'Rubriques Marché Acheteur :', 'أقسام سوق المشتري :', 'Buyer Market Rubrics :')}
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  {tr(language, 'Garanti sans machines agricoles • Récoltes, Bétail & Pépinières', 'خالي من الآلات الفلاحية • محاصيل، مواشي ومشاتل', 'Guaranteed no farm machinery • Produce, Livestock & Nurseries')}
                </span>
              </div>

              {/* Barre des 3 rubriques principales */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setOfferCategoryFilter('ALL');
                    setNurserySubFilter('ALL');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    offerCategoryFilter === 'ALL'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span>🌐 {tr(language, 'Toutes les rubriques', 'جميع الأقسام', 'All Rubrics')}</span>
                  <span className="opacity-80 font-mono text-[11px]">
                    ({(produceListings?.filter(p => p.category !== 'Machinisme & Équipements' && !p.title?.toLowerCase().includes('tracteur'))?.length || 0) + (farmStandingListings?.length || 0) + (nurseryLots?.length || 0)})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOfferCategoryFilter('fruits_legumes');
                    setNurserySubFilter('ALL');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    offerCategoryFilter === 'fruits_legumes' || offerCategoryFilter === 'harvest' || offerCategoryFilter === 'standing'
                      ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600/50'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/60'
                  }`}
                >
                  <span>🥕 {tr(language, '1. Fruits & Légumes', '1. خضر وفواكه', '1. Fruits & Vegetables')}</span>
                  <span className="opacity-90 font-mono text-[11px]">
                    ({(produceListings?.filter(p => (p.category === 'Fruit' || p.category === 'Légume' || p.category === 'Fourrage & Intrants') && !p.title?.toLowerCase().includes('tracteur'))?.length || 0) + (farmStandingListings?.length || 0)})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOfferCategoryFilter('production_animale');
                    setNurserySubFilter('ALL');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    offerCategoryFilter === 'production_animale' || offerCategoryFilter === 'livestock'
                      ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-500/50'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/60'
                  }`}
                >
                  <span>🐑 {tr(language, '2. Production Animale', '2. الإنتاج الحيواني', '2. Livestock & Animals')}</span>
                  <span className="opacity-90 font-mono text-[11px]">
                    ({produceListings?.filter(p => p.category === 'Élevage & Bétail')?.length || 0})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOfferCategoryFilter('pepinieres');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    offerCategoryFilter === 'pepinieres' || offerCategoryFilter === 'nursery'
                      ? 'bg-teal-800 text-white shadow-xs ring-2 ring-teal-600/50'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-200/60'
                  }`}
                >
                  <span>🌱 {tr(language, '3. Les Pépinières', '3. المشاتل الفلاحية', '3. The Nurseries')}</span>
                  <span className="opacity-90 font-mono text-[11px]">
                    ({nurseryLots?.length || 0})
                  </span>
                </button>
              </div>

              {/* Sous-rubriques pour les Pépinières : a arboricole, b maraicher, c ornementale */}
              <div className={`p-2.5 rounded-2xl transition border ${
                offerCategoryFilter === 'pepinieres' || offerCategoryFilter === 'nursery'
                  ? 'bg-teal-950 text-white border-teal-500/40 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <Trees className="w-4 h-4 text-emerald-400" />
                      <span>{tr(language, 'Sous-rubriques Pépinières :', 'فروع المشاتل :', 'Nursery Sub-rubrics :')}</span>
                    </span>
                    <span className="text-[11px] opacity-75 hidden sm:inline">
                      ({tr(language, 'a. arboricole, b. maraîcher, c. ornementale', 'أ. أشجار مثمرة، ب. خضروات، ج. زينة', 'a. fruit trees, b. vegetables, c. ornamental')})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setOfferCategoryFilter('pepinieres');
                        setNurserySubFilter('ALL');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap text-[11px] ${
                        (offerCategoryFilter === 'pepinieres' || offerCategoryFilter === 'nursery') && nurserySubFilter === 'ALL'
                          ? 'bg-emerald-400 text-stone-950 font-black shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-current'
                      }`}
                    >
                      🌱 {tr(language, 'Toutes pépinières', 'كل المشاتل', 'All Nurseries')} ({nurseryLots?.length || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOfferCategoryFilter('pepinieres');
                        setNurserySubFilter('arboricole');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap text-[11px] ${
                        (offerCategoryFilter === 'pepinieres' || offerCategoryFilter === 'nursery') && nurserySubFilter === 'arboricole'
                          ? 'bg-emerald-400 text-stone-950 font-black shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-current'
                      }`}
                      title="Arbres fruitiers, agrumes, oliviers, amandiers, arganiers"
                    >
                      🌳 {tr(language, 'a. Arboricole', 'أ. أشجار مثمرة', 'a. Fruit Trees')} ({nurseryLots?.filter(l => classifyNurseryLot(l) === 'arboricole').length || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOfferCategoryFilter('pepinieres');
                        setNurserySubFilter('maraicher');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap text-[11px] ${
                        (offerCategoryFilter === 'pepinieres' || offerCategoryFilter === 'nursery') && nurserySubFilter === 'maraicher'
                          ? 'bg-emerald-400 text-stone-950 font-black shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-current'
                      }`}
                      title="Plants maraîchers, tomate, poivron, pastèque, oignon"
                    >
                      🍅 {tr(language, 'b. Maraîcher', 'ب. خضروات', 'b. Vegetables')} ({nurseryLots?.filter(l => classifyNurseryLot(l) === 'maraicher').length || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOfferCategoryFilter('pepinieres');
                        setNurserySubFilter('ornementale');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap text-[11px] ${
                        (offerCategoryFilter === 'pepinieres' || offerCategoryFilter === 'nursery') && nurserySubFilter === 'ornementale'
                          ? 'bg-emerald-400 text-stone-950 font-black shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-current'
                      }`}
                      title="Plantes ornementales, palmiers, bougainvilliers, lauriers, gazon"
                    >
                      🌺 {tr(language, 'c. Ornementale', 'ج. نباتات الزينة', 'c. Ornamental')} ({nurseryLots?.filter(l => classifyNurseryLot(l) === 'ornementale').length || 0})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grille des offres partagées par les producteurs */}
          {(() => {
            const q = offerSearchTerm.trim().toLowerCase();

            // 1. Filtrer les récoltes (Offres de vente des producteurs uniquement)
            const filteredProduce = (produceListings || []).filter(item => {
              // Règle stricte : on garde vendre seulement
              if (item.listingIntent === 'buy') return false;
              if (item.title?.toUpperCase().includes("APPEL D'OFFRES") || item.title?.toUpperCase().includes("DEMANDE D'ACHAT")) return false;
              // Règle stricte : un annonceur ne peut jamais acheter ses propres produits
              if (isItemOwnedByUser(item, userProfile, googleUser)) return false;

              // Règle stricte et formelle : suppression définitive des machines agricoles
              const isMachinery =
                item.category === 'Machinisme & Équipements' ||
                (item.category as any) === 'Machinisme & Tracteurs' ||
                Boolean(item.title?.toLowerCase().includes('tracteur')) ||
                Boolean(item.title?.toLowerCase().includes('machine')) ||
                Boolean(item.title?.toLowerCase().includes('machinisme')) ||
                Boolean(item.title?.toLowerCase().includes('moissonneuse')) ||
                Boolean((item as any).machineryYear);
              if (isMachinery) return false;

              // Filtrage par rubrique marché acheteur
              if (offerCategoryFilter === 'pepinieres' || offerCategoryFilter === 'nursery' || offerCategoryFilter === 'standing') {
                return false;
              }
              if ((offerCategoryFilter === 'fruits_legumes' || offerCategoryFilter === 'harvest') && item.category === 'Élevage & Bétail') {
                return false;
              }
              if ((offerCategoryFilter === 'production_animale' || offerCategoryFilter === 'livestock') && item.category !== 'Élevage & Bétail') {
                return false;
              }

              if (q) {
                const match =
                  item.title.toLowerCase().includes(q) ||
                  item.variety.toLowerCase().includes(q) ||
                  item.region.toLowerCase().includes(q) ||
                  item.sellerName.toLowerCase().includes(q) ||
                  (item.locationCity && item.locationCity.toLowerCase().includes(q));
                if (!match) return false;
              }
              return true;
            });

            // 2. Filtrer les vergers sur pied (Rattachés à la rubrique 1. Fruits & Légumes)
            const includeStanding =
              offerCategoryFilter === 'ALL' ||
              offerCategoryFilter === 'fruits_legumes' ||
              offerCategoryFilter === 'harvest' ||
              offerCategoryFilter === 'standing';

            const filteredStanding = includeStanding
              ? (farmStandingListings || []).filter(item => {
                  if (isItemOwnedByUser(item, userProfile, googleUser)) return false;
                  if (q) {
                    const match =
                      item.title.toLowerCase().includes(q) ||
                      item.variety.toLowerCase().includes(q) ||
                      item.region.toLowerCase().includes(q) ||
                      item.sellerName.toLowerCase().includes(q);
                    if (!match) return false;
                  }
                  return true;
                })
              : [];

            // 3. Filtrer les plants pépinières (Rubrique 3 : Les Pépinières a, b, c)
            const includeNursery =
              offerCategoryFilter === 'ALL' ||
              offerCategoryFilter === 'pepinieres' ||
              offerCategoryFilter === 'nursery';

            const filteredNursery = includeNursery
              ? (nurseryLots || []).filter(lot => {
                  if (isItemOwnedByUser(lot, userProfile, googleUser)) return false;

                  // Filtrage par sous-rubrique pépinière (a. arboricole, b. maraîcher, c. ornementale)
                  const subRubrique = classifyNurseryLot(lot);
                  if (nurserySubFilter !== 'ALL' && subRubrique !== nurserySubFilter) {
                    return false;
                  }

                  if (q) {
                    const match =
                      lot.species.toLowerCase().includes(q) ||
                      lot.variety.toLowerCase().includes(q) ||
                      lot.region.toLowerCase().includes(q) ||
                      lot.batchNumber.toLowerCase().includes(q) ||
                      subRubrique.toLowerCase().includes(q);
                    if (!match) return false;
                  }
                  return true;
                })
              : [];

            const totalResults = filteredProduce.length + filteredStanding.length + filteredNursery.length;

            if (totalResults === 0) {
              return (
                <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 my-4 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                    <Store className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    {tr(language, 'Aucune offre trouvée pour cette rubrique', 'لا توجد أي عروض تطابق هذا القسم', 'No offers found for this rubric')}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {tr(
                      language,
                      'Modifiez vos mots clés ou sélectionnez une autre rubrique pour voir toutes les annonces disponibles.',
                      'قم بتغيير كلمات البحث أو اختر قسماً آخر للاطلاع على كافة الإعلانات المتوفرة.',
                      'Change your search keywords or select another rubric to view all available offers.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOfferSearchTerm('');
                      setOfferCategoryFilter('ALL');
                      setNurserySubFilter('ALL');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{tr(language, 'Afficher toutes les rubriques', 'عرض جميع الأقسام', 'Show all rubrics')}</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Cartes Récoltes & Fruits/Légumes */}
                {filteredProduce.map(listing => (
                  <div
                    key={`produce-${listing.id}`}
                    className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Photo et Badges */}
                      <div className="relative h-40 w-full overflow-hidden bg-stone-100">
                        <img
                          src={listing.imageUrl || 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80'}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {listing.category === 'Élevage & Bétail' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black shadow-xs">
                              🐑 2. Production Animale
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-800/90 text-white text-[10px] font-bold backdrop-blur-xs">
                              🥕 1. Fruits & Légumes
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                            {listing.region.split('(')[0].trim()}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2.5 py-1 rounded-xl bg-stone-900/90 text-emerald-300 text-xs font-black backdrop-blur-xs border border-emerald-500/30">
                            {(listing.pricePerUnitMAD ?? 0).toLocaleString()} MAD / {listing.unit}
                          </span>
                        </div>
                      </div>

                      {/* Corps de l'offre */}
                      <div className="p-3.5 space-y-2">
                        <div>
                          <h3 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1">
                            {listing.title}
                          </h3>
                          <p className="text-xs text-stone-500">
                            {listing.variety} — <span className="font-semibold text-emerald-800">{listing.sellerName}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1 border-t border-stone-100">
                          <span>
                            {tr(language, 'Disponible :', 'المتوفر :', 'Stock :')}{' '}
                            <strong className="text-stone-900">{listing.quantityAvailable} {listing.unit}</strong>
                          </span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ONSSA</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Acheteur : Achat Séquestre & Négociation */}
                    <div className="p-3 bg-stone-50 border-t border-stone-100 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEscrowPayment('produce', listing, Math.max(1, Math.min(5, listing.quantityAvailable)))}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                          <span>{tr(language, 'Achat Séquestre', 'شراء مضمون', 'Escrow Buy')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openOfferDiscussion(listing.id, 'produce', listing)}
                          className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Handshake className="w-3.5 h-3.5 text-amber-800" />
                          <span>{tr(language, 'Négocier', 'تفاوض', 'Chat')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openLogisticsModal({
                            originCity: listing.locationCity || 'Agadir',
                            cargoType: 'fresh_produce',
                            volumeTonnes: listing.unit === 'Tonnes' ? Math.min(25, listing.quantityAvailable) : 5,
                            itemTitle: listing.title,
                          })}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition cursor-pointer"
                          title="Fret & Camion Frigo"
                        >
                          <Truck className="w-3.5 h-3.5 text-blue-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Cartes Vergers sur Pied */}
                {filteredStanding.map(item => (
                  <div
                    key={`standing-${item.id}`}
                    className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <div className="relative h-40 w-full overflow-hidden bg-stone-100">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 text-[10px] font-bold">
                            🌳 1. Fruits (Verger sur pied)
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                            {item.surfaceHectares} Ha
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2.5 py-1 rounded-xl bg-stone-900/90 text-emerald-300 text-xs font-black backdrop-blur-xs border border-emerald-500/30">
                            {(item.pricePerHectareMAD ?? 0).toLocaleString()} MAD / Ha
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2">
                        <div>
                          <h3 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1">{item.title}</h3>
                          <p className="text-xs text-stone-500">
                            {item.variety} — <span className="font-semibold text-emerald-800">{item.sellerName}</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1 border-t border-stone-100">
                          <span>{item.region}</span>
                          <span className="font-bold text-amber-700">{item.cropCategory}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 border-t border-stone-100 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEscrowPayment('farm_standing', item, 1)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                          <span>{tr(language, 'Réserver Verger', 'حجز البستان', 'Reserve Orchard')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openOfferDiscussion(item.id, 'farm_standing', item)}
                          className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Handshake className="w-3.5 h-3.5 text-amber-800" />
                          <span>{tr(language, 'Négocier', 'تفاوض', 'Chat')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Cartes Plants de Pépinière */}
                {filteredNursery.map(lot => {
                  const subRubrique = classifyNurseryLot(lot);
                  const subInfo = NURSERY_RUBRIQUES.find(r => r.id === subRubrique);
                  const effectivePrice = lot.unitPriceMAD ?? (lot as any).priceMAD ?? 0;

                  return (
                    <div
                      key={`nursery-${lot.id}`}
                      className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        <div className="relative h-40 w-full overflow-hidden bg-stone-100">
                          <img
                            src={lot.imageUrl || 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80'}
                            alt={lot.species}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-teal-800 text-white text-[10px] font-bold">
                              🌱 3. Pépinière
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                              {subInfo?.labelFr || lot.category}
                            </span>
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <span className="px-2.5 py-1 rounded-xl bg-stone-900/90 text-emerald-300 text-xs font-black backdrop-blur-xs border border-emerald-500/30">
                              {effectivePrice.toLocaleString()} MAD / plant
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 space-y-2">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800 mb-0.5">
                              <span>{subInfo?.icon || '🌱'}</span>
                              <span>{subInfo?.badge}</span>
                            </div>
                            <h3 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1">{lot.species}</h3>
                            <p className="text-xs text-stone-500">
                              {lot.variety} — Lot : <span className="font-mono font-bold text-stone-700">{lot.batchNumber}</span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1 border-t border-stone-100">
                            <span>
                              {tr(language, 'Dispo :', 'المتوفر :', 'Stock :')}{' '}
                              <strong className="text-stone-900">{(lot.quantityAvailable ?? 0).toLocaleString()} plants</strong>
                            </span>
                            <span className="text-emerald-700 font-bold">Passeport ONSSA</span>
                          </div>
                        </div>
                      </div>

                    <div className="p-3 bg-stone-50 border-t border-stone-100 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEscrowPayment('nursery_lot', lot, Math.min(100, lot.quantityAvailable))}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                          <span>{tr(language, 'Commander Lot', 'طلب الشتلات', 'Order Plants')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openOfferDiscussion(lot.id, 'nursery', lot)}
                          className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Handshake className="w-3.5 h-3.5 text-amber-800" />
                          <span>{tr(language, 'Négocier', 'تفاوض', 'Chat')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 1. SOUS-ONGLET : COMMANDES SÉQUESTRE */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{tr(language, 'Suivi des Commandes Séquestre Garanti', 'تتبع الطلبيات تحت الحساب الضامن', 'Escrow Orders Tracking')}</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsEscrowListModalOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <span>{tr(language, 'Voir le registre séquestre complet', 'معاينة السجل الكامل', 'View Full Escrow Register')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {buyerEscrowList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-800">
                {tr(language, 'Aucune commande sous séquestre active', 'لا توجد أي طلبيات جارية حالياً', 'No active escrow orders')}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {tr(
                  language,
                  'Lorsque vous achetez des lots de pépinières ou des récoltes avec paiement séquestre, vos fonds restent bloqués en toute sécurité jusqu\'à vérification de la livraison.',
                  'عند شراء شتلات المشتل أو المحاصيل بالدفع المضمون، تظل أموالك مؤمنة بالبنك حتى استلام البضاعة ومطابقتها.',
                  'When purchasing nursery plants or produce via escrow, funds remain securely held until verified delivery.'
                )}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('market')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition"
                >
                  {tr(language, 'Explorer le Marché Récoltes', 'تصفح سوق المحاصيل', 'Explore Produce Market')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('nursery')}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs transition"
                >
                  {tr(language, 'Explorer les Pépinières', 'تصفح المشاتل', 'Explore Nurseries')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buyerEscrowList.map(tx => (
                <div
                  key={tx.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {tx.referenceNumber}
                          </span>
                          <span className="text-[11px] text-stone-400">{tx.paymentDate}</span>
                        </div>
                        <h3 className="font-black text-sm text-stone-900 mt-1">{tx.itemTitle}</h3>
                      </div>

                      {/* Statut Badge */}
                      <span
                        className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full shrink-0 ${
                          tx.status === 'released'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : tx.status === 'in_transit'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : tx.status === 'delivered'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300 animate-pulse'
                            : tx.status === 'disputed'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {tx.status === 'released'
                          ? '✓ Terminé (Fonds Versés)'
                          : tx.status === 'in_transit'
                          ? '🚚 En Transit'
                          : tx.status === 'delivered'
                          ? '📦 Livré (À Valider)'
                          : tx.status === 'disputed'
                          ? '⚠️ Litige Ouvert'
                          : '🔒 Fonds Bloqués'}
                      </span>
                    </div>

                    {/* Données financières */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-stone-50 text-xs border border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">Quantité</span>
                        <span className="font-bold text-stone-800">
                          {tx.quantity} {tx.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">Prix Unit.</span>
                        <span className="font-bold text-stone-800">{tx.unitPriceMAD} MAD</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 block font-bold">Total Séquestre</span>
                        <span className="font-black text-emerald-800">{(tx.totalPaidByBuyerMAD ?? 0).toLocaleString()} MAD</span>
                      </div>
                    </div>

                    {/* Info Vendeur & Destination */}
                    <div className="text-xs text-stone-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Producteur / Vendeur :</span>
                        <span className="font-bold text-stone-800">{tx.sellerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Destination :</span>
                        <span className="font-semibold text-stone-700">
                          {tx.destinationCity || tx.deliveryAddress}
                        </span>
                      </div>
                      {tx.trackingCarrier && (
                        <div className="flex items-center justify-between text-teal-800 font-semibold">
                          <span>Transporteur :</span>
                          <span>{tx.trackingCarrier}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions de l'Acheteur */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
                    {tx.status !== 'released' && tx.status !== 'disputed' && (
                      <>
                        <button
                          type="button"
                          onClick={() => releaseEscrowFunds(tx.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>{tr(language, 'Confirmer & Libérer les fonds', 'تأكيد التسليم وصرف المبلغ', 'Confirm & Release')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt('Indiquez le motif de non-conformité ou réclamation pour litige :');
                            if (reason) openLitigation(tx.id, reason);
                          }}
                          className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                          title="Ouvrir un litige si le produit n'est pas conforme"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        openLogisticsModal({
                          destinationCity: tx.destinationCity,
                          cargoType: 'fresh_produce',
                          itemTitle: tx.itemTitle,
                        })
                      }
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 inline mr-1" />
                      <span>{tr(language, 'Transport', 'النقل', 'Transport')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'discussions' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <span>{tr(language, 'Négociations et Échanges Directs', 'المفاوضات المباشرة مع الفلاحين', 'Direct Negotiations with Producers')}</span>
          </h2>

          {discussionsList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-800">
                {tr(language, 'Aucune négociation en cours', 'لا توجد محادثات نشطة', 'No ongoing negotiations')}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {tr(
                  language,
                  'Sur chaque lot de pépinière ou annonce du marché, cliquez sur « Discuter & Négocier » pour échanger avec le producteur.',
                  'في أي عرض بالسوق، انقر على «محادثة وتفاوض» لمناقشة الكميات والأسعار.',
                  'On any market listing, click "Chat & Negotiate" to discuss volumes and pricing directly with producers.'
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discussionsList.map(thread => (
                <div key={thread.offerId} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">{thread.offerTitle}</h3>
                      <p className="text-xs text-stone-500">
                        {thread.messages.length} {tr(language, 'messages échangés', 'رسائل متبادلة', 'messages exchanged')}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {thread.offerType}
                    </span>
                  </div>

                  {thread.messages.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-stone-50 text-xs text-stone-700 border border-stone-100">
                      <span className="font-bold text-stone-900 mr-1.5">
                        {thread.messages[thread.messages.length - 1].senderName} :
                      </span>
                      <span className="line-clamp-2">
                        {thread.messages[thread.messages.length - 1].content}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => openOfferDiscussion(thread.offerId, thread.offerType, { title: thread.offerTitle })}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    {tr(language, 'Ouvrir la négociation', 'متابعة النقاش', 'Open Negotiation')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'logistics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-600" />
              <span>{tr(language, 'Réservations Logistique & Transporteurs', 'حجوزات النقل واللوجستيك', 'Logistics & Truck Bookings')}</span>
            </h2>
            <button
              type="button"
              onClick={() => openLogisticsModal()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>{tr(language, 'Réserver un Camion', 'حجز شاحنة جديدة', 'Book a Truck')}</span>
            </button>
          </div>

          {transportBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-800">
                {tr(language, 'Aucune réservation de transport enregistrée', 'لا توجد حجوزات نقل حالية', 'No truck bookings yet')}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {tr(
                  language,
                  'Réservez un transporteur agréé (camion frigorifique, plateau ou bâché) pour acheminer vos commandes depuis les vergers et pépinières jusqu\'à vos dépôts.',
                  'احجز شاحنة تبريد معتمدة لنقل طلباتك من الضيعة إلى مستودعاتك في أفضل الظروف.',
                  'Book a certified carrier (reefer, flatbed) to transport your orders safely to your warehouse.'
                )}
              </p>
              <button
                type="button"
                onClick={() => openLogisticsModal()}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition"
              >
                + {tr(language, 'Trouver un transporteur disponible', 'البحث عن شاحنة متوفرة', 'Find Available Truck')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transportBookings.map(b => (
                <div key={b.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                        {b.bookingRef}
                      </span>
                      <h3 className="font-bold text-sm text-stone-900 mt-1">
                        {b.originCity} → {b.destinationCity}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold">Cargaison</span>
                      <span className="font-bold text-stone-800">{b.cargoType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold">Volume estimé</span>
                      <span className="font-bold text-stone-800">{b.volumeTonnes} Tonnes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENU SOUS-ONGLET COMPARATEUR DE PRIX */}
      {activeSubTab === 'price_comparison' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-700" />
                  <span>{tr(language, 'Baromètre des Prix : Offres Directes vs Marchés de Gros', 'مقارنة أسعار الضيعات مع أسواق الجملة بالمغرب', 'Price Comparison: Farm Offers vs Wholesale Markets')}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  {tr(language, 'Comparez les prix unitaires départ ferme avec les cotations officielles des halles de gros pour optimiser vos marges.', 'قارن الأسعار المباشرة من الفلاح مع بورصة أسواق الجملة الرسمية لتحقيق أفضل هامش ربح.', 'Compare farm-gate prices with wholesale market rates to secure the best margins.')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('wholesale')}
                className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto cursor-pointer"
              >
                <span>{tr(language, 'Voir toutes les mercuriales', 'عرض كافة الأسعار الرسمية', 'View All Quotes')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tableau comparatif interactif */}
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">{tr(language, 'Produit & Variété', 'المنتوج والصنف', 'Product')}</th>
                    <th className="p-3 text-right">{tr(language, 'Prix Moyen AgriStock', 'متوسط السعر بالضيعة', 'AgriStock Avg')}</th>
                    <th className="p-3 text-right">{tr(language, 'Gros Casablanca', 'جملة الدار البيضاء', 'Wholesale Casa')}</th>
                    <th className="p-3 text-right">{tr(language, 'Gros Inezgane / Souss', 'جملة إنزكان', 'Wholesale Inezgane')}</th>
                    <th className="p-3 text-right">{tr(language, 'Économie / Opportunité', 'نسبة التوفير', 'Savings')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {wholesalePrices.slice(0, 8).map(wp => {
                    const farmPriceEstimate = Number((wp.priceMin * 0.78).toFixed(2));
                    const savingsPct = Math.round(((wp.priceAverage - farmPriceEstimate) / wp.priceAverage) * 100);
                    return (
                      <tr key={wp.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-3">
                          <span className="font-bold text-stone-900 block">{wp.productName}</span>
                          <span className="text-[10px] text-stone-500">{wp.variety} ({wp.unit})</span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">
                          {farmPriceEstimate} MAD/{wp.unit}
                        </td>
                        <td className="p-3 text-right font-mono text-stone-700">
                          {wp.priceAverage} MAD/{wp.unit}
                        </td>
                        <td className="p-3 text-right font-mono text-stone-700">
                          {wp.priceMin} MAD/{wp.unit}
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full font-bold font-mono text-[11px] bg-emerald-100 text-emerald-800">
                            ~ {savingsPct > 0 ? `-${savingsPct}%` : 'Équilibré'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU SOUS-ONGLET ÉVALUATIONS & AVIS */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <span>{tr(language, 'Évaluations et Retours d\'Expérience Vérifiés', 'تقييمات وآراء المشترين المعتمدة', 'Verified Buyer Reviews')}</span>
              </h3>
              <p className="text-xs text-stone-500">
                {tr(language, 'Consultez les notes des vendeurs, pépiniéristes et transporteurs après livraison.', 'اطلع على تقييمات الموردين والناقلين بعد تسليم البضاعة.', 'Reviews left after confirmed deliveries.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => openRatingModal('Coopérative Maraîchère Chtouka', 'Tomate Ronde Calibre 1')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer self-start sm:self-auto shadow-xs active:scale-95"
            >
              ⭐ {tr(language, 'Laisser une Évaluation', 'إضافة تقييم جديد', 'Leave a Review')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(r => (
              <div key={r.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{r.sellerName}</h4>
                    <p className="text-[11px] text-stone-500">
                      Avis laissé par : <span className="font-semibold text-stone-800">{r.buyerName}</span> le {r.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{r.rating}/5</span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  "{r.comment}"
                </p>

                {r.verifiedPurchase && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{tr(language, 'Achat vérifié sous séquestre AgriStock', 'شراء مؤكد بالدفع المضمون', 'Verified AgriStock Escrow Purchase')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RACCOURCIS D'APPROVISIONNEMENT RAPIDE */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          {tr(language, 'Accès Direct aux Marchés d\'Approvisionnement', 'روابط سريعة للتزود من الضيعات', 'Quick Supply Market Access')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="p-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition cursor-pointer group"
          >
            <Store className="w-5 h-5 text-emerald-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-stone-900 block">
              {tr(language, 'Récoltes & Bétail', 'الخضر والمواشي', 'Produce & Livestock')}
            </span>
            <span className="text-[10px] text-stone-500">
              {tr(language, 'Sortie de champ', 'من الضيعة', 'Farm-gate')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nursery')}
            className="p-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition cursor-pointer group"
          >
            <Sprout className="w-5 h-5 text-emerald-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-stone-900 block">
              {tr(language, 'Pépinières Certifiées', 'شتلات المشاتل', 'Nursery Plants')}
            </span>
            <span className="text-[10px] text-stone-500">
              {tr(language, 'Traçabilité ONSSA', 'معتمدة أونسا', 'ONSSA Certified')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('farm_standing')}
            className="p-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition cursor-pointer group"
          >
            <Tractor className="w-5 h-5 text-amber-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-stone-900 block">
              {tr(language, 'Récoltes sur Pied', 'المحصول على أصله', 'Standing Crops')}
            </span>
            <span className="text-[10px] text-stone-500">
              {tr(language, 'Prix au hectare', 'بالهكتار', 'Per hectare')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wholesale')}
            className="p-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition cursor-pointer group"
          >
            <TrendingUp className="w-5 h-5 text-blue-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-stone-900 block">
              {tr(language, 'Cours & Cotations', 'بورصة الأسعار', 'Wholesale Quotes')}
            </span>
            <span className="text-[10px] text-stone-500">
              {tr(language, 'Marchés de gros', 'أسواق الجملة', 'Wholesale markets')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
