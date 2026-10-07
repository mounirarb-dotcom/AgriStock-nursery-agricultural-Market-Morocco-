import React, { useState, useEffect } from 'react';
import { sanitizeSearchQuery } from '../utils/securityUtils';
import { useApp } from '../context/AppContext';
import { useTranslation, tr } from '../utils/translations';
import { ProduceListing, MoroccanRegion, ProduceCategory } from '../types';
import { isItemOwnedByUser } from '../utils/ownershipUtils';
import { MOROCCAN_REGIONS } from '../data/mockData';
import { ContactSellerModal } from './ContactSellerModal';
import { ProduceListingFormModal } from './ProduceListingFormModal';
import { FarmStandingMarket } from './FarmStandingMarket';
import { StarRating } from './StarRating';
import { BatchQRCodeModal, BatchItemData } from './BatchQRCodeModal';
import { ProduceSupplyClusterMap } from './ProduceSupplyClusterMap';
import { VoiceSearchButton } from './VoiceSearchButton';
import {
  Store,
  Trees,
  Search,
  Plus,
  Filter,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Package,
  Calendar,
  Sparkles,
  Award,
  Trash2,
  ShoppingCart,
  Tractor,
  Zap,
  Truck,
  CreditCard,
  Star,
  Lock,
  PackageSearch,
  RotateCcw,
  QrCode,
  FileText,
  Download,
  Weight,
  Activity,
  Eye,
  SlidersHorizontal,
  Check,
  X,
  Handshake,
  Bell,
  FileSpreadsheet,
  Camera,
  Scan,
  Compass,
  Tag,
} from 'lucide-react';
import { SmartImage } from './SmartImage';

interface ProduceMarketplaceProps {
  initialMode?: 'harvested' | 'standing';
}

export const ProduceMarketplace: React.FC<ProduceMarketplaceProps> = ({ initialMode = 'harvested' }) => {
  const {
    language,
    activeTab,
    setActiveTab,
    produceListings,
    addProduceListing,
    updateListingStatus,
    deleteProduceListing,
    userProfile,
    googleUser,
    setIsIdentificationModalOpen,
    openEscrowPayment,
    openBoostModal,
    openLogisticsModal,
    setIsProModalOpen,
    setIsEscrowListModalOpen,
    platformPaymentProtected,
    maskUserPhone,
    openOfferDiscussion,
    openRatingModal,
    produceCategoryFilter,
    setProduceCategoryFilter,
    produceIntentFilter,
    setProduceIntentFilter,
    openExportManifestModal,
    generateManifestFromListing,
    openNotificationSettings,
    addPriceDropWatch,
    openExcelStockModal,
    openFieldQRScannerModal,
    globalVoiceSearchQuery,
    setGlobalVoiceSearchQuery,
    openOfferDetail,
  } = useApp();
  const t = useTranslation(language);

  const [marketMode, setMarketMode] = useState<'harvested' | 'standing'>(
    initialMode === 'standing' || activeTab === 'farm_standing' ? 'standing' : 'harvested'
  );

  useEffect(() => {
    if (activeTab === 'farm_standing') {
      setMarketMode('standing');
    }
  }, [activeTab]);

  const [searchTerm, setSearchTerm] = useState('');

  // Synchronisation avec la recherche vocale globale
  useEffect(() => {
    if (globalVoiceSearchQuery) {
      setSearchTerm(globalVoiceSearchQuery);
      setGlobalVoiceSearchQuery('');
    }
  }, [globalVoiceSearchQuery, setGlobalVoiceSearchQuery]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    produceCategoryFilter || 'ALL'
  );
  const [selectedIntent, setSelectedIntent] = useState<'ALL' | 'sell' | 'buy'>(
    produceIntentFilter || 'ALL'
  );

  useEffect(() => {
    if (produceCategoryFilter) {
      setSelectedCategory(produceCategoryFilter);
    }
  }, [produceCategoryFilter]);

  useEffect(() => {
    if (produceIntentFilter) {
      setSelectedIntent(produceIntentFilter);
    }
  }, [produceIntentFilter]);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [showSupplyMap, setShowSupplyMap] = useState<boolean>(true);
  const [selectedCertification, setSelectedCertification] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<
    | 'recent'
    | 'price_asc'
    | 'price_desc'
    | 'weight_desc'
    | 'weight_asc'
    | 'age_desc'
    | 'age_asc'
    | 'head_desc'
  >('recent');

  // --- FILTRES SPÉCIFIQUES PRODUCTION ANIMALE (ÉLEVAGE & BÉTAIL) ---
  const [selectedLivestockSubCategory, setSelectedLivestockSubCategory] = useState<
    'ALL' | 'bovins' | 'ovins' | 'caprins'
  >('ALL');
  const [selectedLivestockBreed, setSelectedLivestockBreed] = useState<string>('ALL');
  const [selectedLivestockAgeRange, setSelectedLivestockAgeRange] = useState<
    'ALL' | 'under_6m' | '6_to_12m' | '12_to_24m' | 'over_24m'
  >('ALL');
  const [selectedLivestockWeightRange, setSelectedLivestockWeightRange] = useState<
    'ALL' | 'under_35kg' | '35_to_55kg' | '55_to_80kg' | 'over_80kg'
  >('ALL');
  const [selectedLivestockPurpose, setSelectedLivestockPurpose] = useState<string>('ALL');
  const [filterLivestockCertifiedOnly, setFilterLivestockCertifiedOnly] = useState<boolean>(false);
  const [previewCheptelModal, setPreviewCheptelModal] = useState<{
    imageUrl: string;
    title: string;
    breed?: string;
    headCount?: number;
    weight?: number;
    healthCert?: string;
  } | null>(null);

  const [contactModalListing, setContactModalListing] = useState<ProduceListing | null>(null);
  const [isPostingListing, setIsPostingListing] = useState(false);
  const [qrModalBatch, setQrModalBatch] = useState<BatchItemData | null>(null);

  // Filter listings
  const filteredListings = produceListings
    .filter(item => {
      const term = (searchTerm || '').trim().toLowerCase();
      const matchesSearch =
        !term ||
        Boolean(item.title?.toLowerCase().includes(term)) ||
        Boolean(item.variety?.toLowerCase().includes(term)) ||
        Boolean(item.locationCity?.toLowerCase().includes(term)) ||
        Boolean(item.sellerName?.toLowerCase().includes(term)) ||
        Boolean(item.livestockBreed?.toLowerCase().includes(term));

      // Exclure formellement et définitivement toute offre de machines agricoles
      const isMachinery =
        item.category === 'Machinisme & Équipements' ||
        (item.category as any) === 'Machinisme & Tracteurs' ||
        Boolean(item.title?.toLowerCase().includes('tracteur')) ||
        Boolean(item.title?.toLowerCase().includes('machine')) ||
        Boolean(item.title?.toLowerCase().includes('machinisme')) ||
        Boolean(item.title?.toLowerCase().includes('moissonneuse')) ||
        Boolean((item as any).machineryYear);
      if (isMachinery) {
        return false;
      }

      const matchesCategory =
        selectedCategory === 'ALL' ||
        (selectedCategory === 'Fruit'
          ? item.category === 'Fruit' || item.category === 'Légume'
          : item.category === selectedCategory);
      const matchesRegion =
        selectedRegion === 'ALL' ||
        item.region === selectedRegion ||
        (Boolean(item.region) && Boolean(selectedRegion) && (
          item.region.toLowerCase().includes(selectedRegion.toLowerCase().split('(')[0].trim()) ||
          selectedRegion.toLowerCase().includes(item.region.toLowerCase().split('(')[0].trim())
        ));
      const matchesCert =
        selectedCertification === 'ALL' ||
        item.certifications.some(c => c.includes(selectedCertification));
      // Règle plateforme : on garde vendre seulement (pas d'appels d'offres ni demandes d'achat)
      if (item.listingIntent === 'buy' || item.title?.toUpperCase().includes("APPEL D'OFFRES") || item.title?.toUpperCase().includes("DEMANDE D'ACHAT")) {
        return false;
      }
      const matchesIntent = (item.listingIntent || 'sell') === 'sell';

      // FILTRAGE SPÉCIFIQUE ÉLEVAGE / PRODUCTION ANIMALE
      const isLivestockItem =
        item.category === 'Élevage & Bétail' || Boolean(item.livestockSubCategory);

      // Sous-catégorie animale (Bovins, Ovins, Caprins)
      let matchesLivestockSubCategory = true;
      if (selectedLivestockSubCategory !== 'ALL') {
        if (!isLivestockItem) {
          matchesLivestockSubCategory = false;
        } else {
          matchesLivestockSubCategory =
            item.livestockSubCategory === selectedLivestockSubCategory ||
            (selectedLivestockSubCategory === 'ovins' &&
              (item.title?.toLowerCase().includes('sardi') ||
                item.title?.toLowerCase().includes('timahdite') ||
                item.title?.toLowerCase().includes('agneau') ||
                item.title?.toLowerCase().includes('bélier') ||
                item.title?.toLowerCase().includes('ovin') ||
                item.variety?.toLowerCase().includes('mouton'))) ||
            (selectedLivestockSubCategory === 'bovins' &&
              (item.title?.toLowerCase().includes('vache') ||
                item.title?.toLowerCase().includes('génisse') ||
                item.title?.toLowerCase().includes('veau') ||
                item.title?.toLowerCase().includes('taillon') ||
                item.title?.toLowerCase().includes('bovin') ||
                item.variety?.toLowerCase().includes('holstein') ||
                item.variety?.toLowerCase().includes('montbéliarde'))) ||
            (selectedLivestockSubCategory === 'caprins' &&
              (item.title?.toLowerCase().includes('chèvre') ||
                item.title?.toLowerCase().includes('bouc') ||
                item.title?.toLowerCase().includes('chevreau') ||
                item.title?.toLowerCase().includes('caprin') ||
                item.variety?.toLowerCase().includes('alpine')));
        }
      }

      // Race (Breed)
      let matchesLivestockBreed = true;
      if (selectedLivestockBreed !== 'ALL') {
        if (!isLivestockItem) {
          matchesLivestockBreed = false;
        } else {
          const breedTarget = selectedLivestockBreed.toLowerCase();
          matchesLivestockBreed =
            Boolean(item.livestockBreed?.toLowerCase().includes(breedTarget)) ||
            Boolean(item.variety?.toLowerCase().includes(breedTarget)) ||
            Boolean(item.title?.toLowerCase().includes(breedTarget));
        }
      }

      // Tranche d'Âge
      let matchesLivestockAge = true;
      if (selectedLivestockAgeRange !== 'ALL') {
        if (!isLivestockItem) {
          matchesLivestockAge = false;
        } else {
          const ageMonths = item.livestockAgeMonths ?? 0;
          if (selectedLivestockAgeRange === 'under_6m') matchesLivestockAge = ageMonths > 0 && ageMonths <= 6;
          else if (selectedLivestockAgeRange === '6_to_12m') matchesLivestockAge = ageMonths > 6 && ageMonths <= 12;
          else if (selectedLivestockAgeRange === '12_to_24m') matchesLivestockAge = ageMonths > 12 && ageMonths <= 24;
          else if (selectedLivestockAgeRange === 'over_24m') matchesLivestockAge = ageMonths > 24;
        }
      }

      // Tranche de Poids Moyen
      let matchesLivestockWeight = true;
      if (selectedLivestockWeightRange !== 'ALL') {
        if (!isLivestockItem) {
          matchesLivestockWeight = false;
        } else {
          const weight = item.livestockAverageWeightKg ?? 0;
          if (selectedLivestockWeightRange === 'under_35kg') matchesLivestockWeight = weight > 0 && weight <= 35;
          else if (selectedLivestockWeightRange === '35_to_55kg') matchesLivestockWeight = weight > 35 && weight <= 55;
          else if (selectedLivestockWeightRange === '55_to_80kg') matchesLivestockWeight = weight > 55 && weight <= 80;
          else if (selectedLivestockWeightRange === 'over_80kg') matchesLivestockWeight = weight > 80;
        }
      }

      // Vocation
      let matchesLivestockPurpose = true;
      if (selectedLivestockPurpose !== 'ALL') {
        if (!isLivestockItem) {
          matchesLivestockPurpose = false;
        } else {
          matchesLivestockPurpose = item.livestockPurpose === selectedLivestockPurpose;
        }
      }

      // Certificat Sanitaire / Boucle SNIT
      let matchesLivestockCertified = true;
      if (filterLivestockCertifiedOnly) {
        if (!isLivestockItem) {
          matchesLivestockCertified = false;
        } else {
          matchesLivestockCertified = Boolean(
            item.livestockHealthCertificate ||
              item.certifications?.includes('ONSSA Homologué') ||
              item.certifications?.includes('Vaccination Certifiée') ||
              item.livestockVaccinationStatus
          );
        }
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesRegion &&
        matchesCert &&
        matchesIntent &&
        matchesLivestockSubCategory &&
        matchesLivestockBreed &&
        matchesLivestockAge &&
        matchesLivestockWeight &&
        matchesLivestockPurpose &&
        matchesLivestockCertified
      );
    })
    .sort((a, b) => {
      // Priorité 1: Annonces boostées / sponsorisées en tête des résultats
      const boostScore = (item: ProduceListing) => {
        if (item.boostLevel === 'mega_14d') return 4;
        if (item.boostLevel === 'intensive_7d') return 3;
        if (item.boostLevel === 'flash_3d') return 2;
        if (item.isFeatured) return 1;
        return 0;
      };
      const scoreDiff = boostScore(b) - boostScore(a);
      if (scoreDiff !== 0) return scoreDiff;

      if (sortBy === 'price_asc') return a.pricePerUnitMAD - b.pricePerUnitMAD;
      if (sortBy === 'price_desc') return b.pricePerUnitMAD - a.pricePerUnitMAD;
      if (sortBy === 'weight_desc') return (b.livestockAverageWeightKg ?? 0) - (a.livestockAverageWeightKg ?? 0);
      if (sortBy === 'weight_asc') return (a.livestockAverageWeightKg ?? 0) - (b.livestockAverageWeightKg ?? 0);
      if (sortBy === 'age_desc') return (b.livestockAgeMonths ?? 0) - (a.livestockAgeMonths ?? 0);
      if (sortBy === 'age_asc') return (a.livestockAgeMonths ?? 0) - (b.livestockAgeMonths ?? 0);
      if (sortBy === 'head_desc') {
        const headsA = a.livestockHeadCount ?? (a.unit === 'Têtes / Bêtes' ? a.quantityAvailable : 0);
        const headsB = b.livestockHeadCount ?? (b.unit === 'Têtes / Bêtes' ? b.quantityAvailable : 0);
        return headsB - headsA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Top View Selector: Lots Récoltés vs Vente production sur terrain prix/ ha */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-stone-100 p-1 rounded-xl">
          <button
            id="btn-subtab-harvested"
            onClick={() => {
              setMarketMode('harvested');
              if (activeTab === 'farm_standing') setActiveTab('market');
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              marketMode === 'harvested'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/30'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Lots Récoltés (Au Kg / Tonne)</span>
          </button>

          <button
            id="btn-subtab-standing"
            onClick={() => setMarketMode('standing')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              marketMode === 'standing'
                ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-500/30'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            <Trees className="w-4 h-4" />
            <span>Vente production sur terrain prix/ ha</span>
          </button>
        </div>

        <div className="text-[11px] text-stone-500 hidden md:flex items-center gap-2 pr-3">
          {marketMode === 'harvested' ? (
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Fruits & légumes triés, emballés & certifiés ONSSA
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-emerald-600" />
              Vergers d'agrumes, oliveraies, parcelles de pastèques sur pied
            </span>
          )}
        </div>
      </div>

      {marketMode === 'standing' ? (
        <FarmStandingMarket onSwitchToHarvested={() => setMarketMode('harvested')} />
      ) : (
        <>
          {/* Hero Header */}
          <div className="bg-gradient-to-br from-[#1b261b] via-[#122319] to-[#0b1610] text-white p-6 sm:p-8 rounded-3xl shadow-md border border-[#234330] relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-3">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                {tr(language, 'Plateforme Agricole Directe Producteurs au Maroc', 'منصة فلاحية مباشرة بين المنتجين بالمغرب', 'Direct Agricultural Platform for Producers in Morocco')}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {tr(language, 'Achat / Vente Fruits et Légumes', 'بورصة بيع وشراء الخضر والفواكه', 'Buy / Sell Fruits and Vegetables')}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-stone-200/90 leading-relaxed">
                {tr(
                  language,
                  'Plateforme de mise en relation directe entre producteurs, coopératives agricoles, grossistes et exportateurs. Prix sortie de ferme en Dirham (MAD) avec agréments ONSSA et traçabilité des terroirs marocains.',
                  'منصة للتواصل المباشر بين المنتجين، التعاونيات الفلاحية، تجار الجملة والمصدرين. أسعار الخروج من الضيعة بالدرهم المغربي مع اعتمادات أونسا وتتبع الأصناف المغربية.',
                  'Direct connection platform between producers, agricultural cooperatives, wholesalers and exporters. Farm-gate prices in Dirhams (MAD) with ONSSA approvals and Moroccan terroir traceability.'
                )}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {userProfile.role !== 'buyer' ? (
                  <button
                    id="btn-post-listing-hero"
                    onClick={() => setIsPostingListing(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addListingBtn}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('buyer_space')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/40 text-emerald-200 text-xs font-semibold shadow-inner cursor-pointer transition"
                    title={tr(language, 'Ouvrir la fenêtre Marché Acheteur avec toutes les rubriques (1. Fruits & Légumes, 2. Production Animale, 3. Pépinières a, b, c)', 'فتح نافذة سوق المشتري بجميع الأقسام', 'Open Buyer Market window with all rubrics')}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{tr(language, 'Fenêtre Marché Acheteur (Rubriques 1, 2, 3)', 'نافذة سوق المشتري (الأقسام 1، 2، 3)', 'Buyer Market Window (Rubrics 1, 2, 3)')}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-800 text-[10px] font-bold text-emerald-200">➔</span>
                  </button>
                )}
                {userProfile.role !== 'buyer' && (
                  <button
                    id="btn-excel-produce-bulk"
                    onClick={() => openExcelStockModal(marketMode === 'standing' ? 'farm_standing' : 'produce')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 border border-emerald-500/40 cursor-pointer"
                    title={tr(language, 'Exporter un modèle Excel ou insérer des dizaines de récoltes/lots en un clic', 'استيراد وتصدير قواعد البيانات عبر إكسيل', 'Export Excel template or bulk import produce listings')}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                    <span>📊 Excel & Import en Lot</span>
                  </button>
                )}
                <button
                  id="btn-goto-farm-standing"
                  onClick={() => setMarketMode('standing')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition active:scale-95 border border-emerald-500/40 cursor-pointer"
                >
                  <Trees className="w-4 h-4 text-emerald-300" />
                  {tr(language, 'Vente production sur terrain prix/ ha', 'بيع المحصول على أصله (بالهكتار)', 'Standing crop sales price / ha')}
                </button>
                <button
                  id="btn-open-price-alerts-hero"
                  onClick={() => openNotificationSettings('price_drops')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-amber-300 font-bold text-xs shadow-md transition active:scale-95 border border-amber-500/40 cursor-pointer"
                  title={tr(language, 'Activer des alertes en cas de baisse de prix sur les récoltes', 'تفعيل تنبيهات انخفاض أسعار الخضر والفواكه', 'Set alerts for produce price drops')}
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  {tr(language, 'Alertes Baisses de Prix', 'تنبيهات انخفاض الأسعار', 'Price Drop Alerts')}
                </button>
              </div>
            </div>
          </div>

      {/* Role Context Bar */}
      <div
        className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-xs ${
          userProfile.role === 'seller'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              userProfile.role === 'seller'
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {userProfile.role === 'seller' ? (
              <Tractor className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="font-bold">
              {userProfile.role === 'seller'
                ? tr(language, 'Mode Vendeur / Producteur actif :', 'أنت في وضع البائع / الفلاح :', 'Active Seller / Producer Mode:')
                : tr(language, 'Mode Acheteur / Négociant actif :', 'أنت في وضع المشتري / التاجر :', 'Active Buyer / Trader Mode:')}
            </span>{' '}
            <span className="text-stone-700">
              {userProfile.role === 'seller'
                ? tr(
                    language,
                    'Publiez vos récoltes directement aux acheteurs. Vos coordonnées sont automatiquement associées.',
                    'انشر غلتك ومحاصيلك مباشرة إلى المشترين بالمغرب مع تعبئة أوتوماتيكية لبياناتك.',
                    'Publish your harvests directly to buyers. Your contact info is linked automatically.'
                  )
                : tr(
                    language,
                    'Consultez les offres partagées par les producteurs et vendeurs, comparez les prix réels et commandez sous séquestre bancaire garanti.',
                    'تصفح العروض المنشورة من طرف الفلاحين والمنتجين، قارن الأسعار واطلب مع الضمان البنكي.',
                    'Browse offers shared by producers and sellers, compare prices and order under guaranteed escrow.'
                  )}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsIdentificationModalOpen(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 border ${
            userProfile.role === 'seller'
              ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700/50'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700/50'
          }`}
        >
          {tr(language, 'Modifier mon profil', 'تغيير صفتي (مشتري / بائع)', 'Edit Profile (Buyer / Seller)')}
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholderMarket}
              value={searchTerm}
              onChange={e => setSearchTerm(sanitizeSearchQuery(e.target.value))}
              className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-stone-300 focus:outline-amber-600 text-xs text-stone-800 placeholder-stone-400"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                  title="Effacer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <VoiceSearchButton
                language={language}
                onSearchResult={(query, details) => {
                  setSearchTerm(query);
                  if (details?.category && details.category !== 'ALL') {
                    setSelectedCategory(details.category);
                  }
                  if (details?.region && details.region !== 'ALL') {
                    setSelectedRegion(details.region as MoroccanRegion);
                  }
                }}
              />
            </div>
          </div>

          <button
            id="btn-export-manifests"
            onClick={() => openExportManifestModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm transition"
            title={tr(language, "Gestionnaire & Générateur de Manifestes d'Expédition / Export (A4 PDF officiel • Douane BADR • EACCE Foodex • ONSSA)", "إدارة وإنشاء وثائق الشحن والتصدير (PDF رسمي • جمارك بدر • فوودكس • أونسا)", "Shipping & Export Manifests Manager (Official PDF • Customs BADR • Foodex • ONSSA)")}
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>{tr(language, 'Manifestes Export (PDF)', 'بيانات التصدير (PDF)', 'Export Manifests (PDF)')}</span>
          </button>

          <button
            type="button"
            onClick={() => openFieldQRScannerModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            title={tr(language, 'Scanner ou vérifier le QR code d’un lot de récolte ou primeurs', 'مسح الرمز الشريطي QR لأي شحنة خضر أو فواكه', 'Scan or verify produce QR code')}
          >
            <Scan className="w-4 h-4 text-emerald-300" />
            <span>{tr(language, 'Scanner QR Terrain', 'مسح QR الميداني', 'Scan Field QR')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSupplyMap(!showSupplyMap)}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer ${
              showSupplyMap
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
            title={tr(language, 'Afficher la carte interactive des bassins de production et sources', 'عرض خريطة مصادر المحاصيل والمسافات', 'Toggle supply clusters map')}
          >
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>{showSupplyMap ? tr(language, 'Masquer la Carte', 'إخفاء الخريطة', 'Hide Map') : tr(language, 'Carte des Gisements', 'خريطة المصادر', 'Supply Map')}</span>
          </button>

          {userProfile.role !== 'buyer' && (
            <button
              id="btn-post-listing"
              onClick={() => setIsPostingListing(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.addListingBtn}
            </button>
          )}
        </div>

        {/* Quick Search Trending Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 text-[11px]">
          <span className="text-stone-400 font-medium shrink-0">
            {tr(language, 'Suggestions :', 'أكثر بحثاً :', 'Suggestions :')}
          </span>
          {[
            { label: '🍅 Tomates', query: 'Tomate' },
            { label: '🍊 Clémentines', query: 'Clémentine' },
            { label: '🐑 Moutons Sardi', query: 'Sardi' },
            { label: '🥑 Avocats', query: 'Avocat' },
            { label: '🥔 Pommes de terre', query: 'Pomme de terre' },
            { label: '🌿 Luzerne', query: 'Luzerne' },
            { label: '🌱 Olivier & Plants', query: 'Olivier' },
          ].map(tag => (
            <button
              key={tag.query}
              type="button"
              onClick={() => setSearchTerm(tag.query)}
              className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                searchTerm.toLowerCase() === tag.query.toLowerCase()
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {tag.label}
            </button>
          ))}
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-1.5 py-0.5 text-stone-400 hover:text-stone-700 text-[10px] font-bold shrink-0 ml-1 cursor-pointer"
            >
              ✕ {tr(language, 'Effacer', 'مسح', 'Clear')}
            </button>
          )}
        </div>

        {/* Category Tabs & Filters */}
        <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Category Chips (AgriForex Sectors) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: tr(language, 'Toutes les filières', 'كل المنتوجات', 'All Sectors') },
                { id: 'Fruit', label: tr(language, '🍎 1. Fruits & Légumes', '🍎 1. الفواكه والخضر', '🍎 1. Fruits & Vegetables') },
                { id: 'Élevage & Bétail', label: tr(language, '🐑 2. Production Animale', '🐑 2. الإنتاج الحيواني', '🐑 2. Livestock & Animals') },
                { id: 'Fourrage & Intrants', label: tr(language, '🌾 Fourrage & Intrants', '🌾 الأعلاف والكلأ', '🌾 Fodder & Inputs') },
                { id: 'pepinieres_rubrique', label: tr(language, '🌱 3. Les Pépinières (a, b, c)', '🌱 3. المشاتل الفلاحية', '🌱 3. Nurseries (a, b, c)') },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === 'pepinieres_rubrique') {
                      setActiveTab('nursery');
                    } else {
                      setSelectedCategory(cat.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Region & Certification selects */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 text-xs"
              >
                <option value="ALL">{tr(language, 'Toutes les régions Maroc', 'كل جهات المغرب', 'All Morocco Regions')}</option>
                {MOROCCAN_REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select
                value={selectedCertification}
                onChange={e => setSelectedCertification(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 text-xs"
              >
                <option value="ALL">{tr(language, 'Toutes certifications', 'جميع الشواهد', 'All Certifications')}</option>
                <option value="Vérifié AgriForex">{tr(language, 'Vérifié AgriForex', 'موثق AgriForex', 'AgriForex Verified')}</option>
                <option value="ONSSA">{tr(language, 'ONSSA Homologué', 'معتمد من أونسا', 'ONSSA Certified')}</option>
                <option value="Vaccination">{tr(language, 'Vaccination Certifiée', 'تلقيح بيطري معتمد', 'Certified Vaccination')}</option>
                <option value="GlobalG.A.P">GlobalG.A.P</option>
                <option value="Bio Maroc">Bio Maroc</option>
                <option value="IGP">IGP Maroc</option>
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 text-xs font-medium"
              >
                <option value="recent">{tr(language, 'Plus récentes', 'الأحدث أولاً', 'Most Recent')}</option>
                <option value="price_asc">{tr(language, 'Prix croissant (MAD)', 'السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
                <option value="price_desc">{tr(language, 'Prix décroissant (MAD)', 'السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
                <option value="weight_desc">{tr(language, '⚖️ Poids moyen : lourd d\'abord', 'الوزن المتوسط: الأثقل أولاً', '⚖️ Avg Weight: Heavy first')}</option>
                <option value="weight_asc">{tr(language, '⚖️ Poids moyen : léger d\'abord', 'الوزن المتوسط: الأخف أولاً', '⚖️ Avg Weight: Light first')}</option>
                <option value="age_asc">{tr(language, '⏳ Âge : plus jeune d\'abord', 'العمر: الأصغر سناً أولاً', '⏳ Age: Youngest first')}</option>
                <option value="age_desc">{tr(language, '⏳ Âge : plus âgé d\'abord', 'العمر: الأكبر سناً أولاً', '⏳ Age: Oldest first')}</option>
                <option value="head_desc">{tr(language, '🐑 Nbr de têtes : grands lots', 'عدد الرؤوس: الحصص الكبيرة', '🐑 Head count: Large batches')}</option>
              </select>
            </div>
          </div>

          {/* SECTION DÉDIÉE : FILTRES AVANCÉS PRODUCTION ANIMALE (BOVINS, OVINS, CAPRINS) */}
          {(selectedCategory === 'Élevage & Bétail' || selectedLivestockSubCategory !== 'ALL' || selectedLivestockBreed !== 'ALL') && (
            <div className="mt-3 pt-3 border-t border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-emerald-50/40 to-amber-50/90 p-3.5 rounded-xl border space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    🐑
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>{tr(language, 'Rubrique Production Animale & Cheptel Marocain', 'فضاء الإنتاج الحيواني والمواشي بالمغرب', 'Moroccan Livestock & Animal Production')}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-200/80 text-amber-900 font-semibold">
                        {tr(language, 'Bovins • Ovins • Caprins', 'أبقار • أغنام • ماعز', 'Cattle • Sheep • Goats')}
                      </span>
                    </h4>
                    <p className="text-[10px] text-stone-600">
                      {tr(
                        language,
                        'Filtrez par race marocaine, tranche d\'âge, poids moyen vif (kg) et traçabilité ONSSA / SNIT.',
                        'تصفية دقيقة حسب السلالة، العمر، الوزن الحي، ووثائق الترقيم والشهادات البيطرية.',
                        'Filter by Moroccan breed, age bracket, live weight, and ONSSA / SNIT traceability.'
                      )}
                    </p>
                  </div>
                </div>

                {(selectedLivestockSubCategory !== 'ALL' ||
                  selectedLivestockBreed !== 'ALL' ||
                  selectedLivestockAgeRange !== 'ALL' ||
                  selectedLivestockWeightRange !== 'ALL' ||
                  selectedLivestockPurpose !== 'ALL' ||
                  filterLivestockCertifiedOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLivestockSubCategory('ALL');
                      setSelectedLivestockBreed('ALL');
                      setSelectedLivestockAgeRange('ALL');
                      setSelectedLivestockWeightRange('ALL');
                      setSelectedLivestockPurpose('ALL');
                      setFilterLivestockCertifiedOnly(false);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
                  >
                    <X className="w-3 h-3 text-red-500" />
                    <span>{tr(language, 'Réinitialiser filtres bétail', 'إلغاء تصفية المواشي', 'Reset livestock filters')}</span>
                  </button>
                )}
              </div>

              {/* Sous-catégories animales */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 shrink-0">
                  {tr(language, 'Espèce :', 'النوع :', 'Species :')}
                </span>
                {[
                  { id: 'ALL', label: tr(language, '🌟 Tout le cheptel', '🌟 جميع المواشي', '🌟 All livestock') },
                  { id: 'bovins', label: tr(language, '🐄 Bovins (Vaches, Veaux, Taillons)', '🐄 الأبقار (عجول، أبقار، بكيرات)', '🐄 Bovines / Cattle') },
                  { id: 'ovins', label: tr(language, '🐑 Ovins (Moutons, Agneaux Sardi)', '🐑 الأغنام (صردي، تمحضيت، خرفان)', '🐑 Sheep / Lambs') },
                  { id: 'caprins', label: tr(language, '🐐 Caprins (Chèvres, Boucs, Chevreaux)', '🐐 الماعز (ألبين، درعة، تيوس)', '🐐 Goats / Caprines') },
                ].map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory('Élevage & Bétail');
                      setSelectedLivestockSubCategory(sub.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedLivestockSubCategory === sub.id
                        ? 'bg-amber-700 text-white shadow-xs ring-1 ring-amber-800'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Barre de filtres avancés multi-critères : Race, Âge, Poids Moyen, Vocation, Certificat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1 text-xs">
                {/* 1. Race */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                    {tr(language, 'Race / Souche', 'السلالة', 'Breed')}
                  </label>
                  <select
                    value={selectedLivestockBreed}
                    onChange={e => setSelectedLivestockBreed(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-medium focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="ALL">{tr(language, 'Toutes les races', 'جميع السلالات', 'All Breeds')}</option>
                    <optgroup label={tr(language, 'Ovins (Moutons)', 'الأغنام', 'Sheep')}>
                      <option value="Sardi">Sardi (الصردي)</option>
                      <option value="Timahdite">Timahdite (تمحضيت - البركي)</option>
                      <option value="Beni Guil">Beni Guil (بني غيل - الدغمة)</option>
                      <option value="D'man">D'man (الدمان)</option>
                      <option value="Boujaâd">Boujaâd (بوجعد)</option>
                    </optgroup>
                    <optgroup label={tr(language, 'Bovins (Bovins)', 'الأبقار', 'Cattle')}>
                      <option value="Holstein">Prim'Holstein (هولشتاين هولندية)</option>
                      <option value="Montbéliarde">Montbéliarde (مونبيليارد)</option>
                      <option value="Charolaise">Charolaise (شاروليز)</option>
                      <option value="Blanc Bleu">Blanc Bleu Belge (أزرق بلجيكي)</option>
                      <option value="Brune de l'Atlas">Brune de l'Atlas (أطلسية محلية)</option>
                    </optgroup>
                    <optgroup label={tr(language, 'Caprins (Chèvres)', 'الماعز', 'Goats')}>
                      <option value="Alpine">Chèvre Alpine (ألبين فرنسية)</option>
                      <option value="Draâ">Chèvre de Draâ (الدرعية)</option>
                      <option value="Murciana">Murciana (مورسيانا الإسبانية)</option>
                      <option value="Noire de l'Atlas">Noire de l'Atlas (سوداء الأطلس)</option>
                    </optgroup>
                  </select>
                </div>

                {/* 2. Âge */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                    {tr(language, 'Tranche d\'Âge', 'العمر / السن', 'Age Bracket')}
                  </label>
                  <select
                    value={selectedLivestockAgeRange}
                    onChange={e => setSelectedLivestockAgeRange(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-medium focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="ALL">{tr(language, 'Tous les âges', 'جميع الأعمار', 'All Ages')}</option>
                    <option value="under_6m">{tr(language, '< 6 mois (Jeunes agneaux / veaux)', 'أقل من 6 أشهر (صغار)', '< 6 months (Young)')}</option>
                    <option value="6_to_12m">{tr(language, '6 à 12 mois (Croissance)', 'من 6 إلى 12 شهراً', '6 to 12 months')}</option>
                    <option value="12_to_24m">{tr(language, '12 à 24 mois (Prêt à l\'abattage / reproduction)', 'من 12 إلى 24 شهراً', '12 to 24 months')}</option>
                    <option value="over_24m">{tr(language, '> 24 mois (Adultes & Laitières)', 'أكثر من سنتين (بالغة)', '> 24 months (Adults)')}</option>
                  </select>
                </div>

                {/* 3. Poids Moyen */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                    {tr(language, 'Poids Moyen Vif (kg)', 'الوزن المتوسط (كلغ)', 'Avg Live Weight')}
                  </label>
                  <select
                    value={selectedLivestockWeightRange}
                    onChange={e => setSelectedLivestockWeightRange(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-medium focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="ALL">{tr(language, 'Tous les poids', 'جميع الأوزان', 'All Weights')}</option>
                    <option value="under_35kg">{tr(language, '< 35 kg (Agneaux / Chevreaux)', 'أقل من 35 كلغ (خرفان وجداء)', '< 35 kg')}</option>
                    <option value="35_to_55kg">{tr(language, '35 à 55 kg (Béliers moyens)', 'من 35 إلى 55 كلغ', '35 to 55 kg')}</option>
                    <option value="55_to_80kg">{tr(language, '55 à 80 kg (Grands béliers & caprins)', 'من 55 إلى 80 كلغ (فحول)', '55 to 80 kg')}</option>
                    <option value="over_80kg">{tr(language, '> 80 kg (Veaux & Gros bovins)', 'أكثر من 80 كلغ (أبقار وعجول)', '> 80 kg (Cattle)')}</option>
                  </select>
                </div>

                {/* 4. Vocation */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                    {tr(language, 'Vocation', 'الهدف / الاستعمال', 'Purpose')}
                  </label>
                  <select
                    value={selectedLivestockPurpose}
                    onChange={e => setSelectedLivestockPurpose(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-medium focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="ALL">{tr(language, 'Toutes vocations', 'جميع الاستعمالات', 'All Purposes')}</option>
                    <option value="Engraissement / Boucherie">{tr(language, 'Engraissement / Boucherie', 'تسمين / جزارة', 'Fattening / Meat')}</option>
                    <option value="Élevage / Reproduction">{tr(language, 'Élevage / Reproduction (Géniteurs)', 'تربية وتناسل (فحول)', 'Breeding')}</option>
                    <option value="Laitier">{tr(language, 'Production Laitière', 'إنتاج الحليب', 'Dairy')}</option>
                    <option value="Aïd Al-Adha">{tr(language, 'Aïd Al-Adha (Kessiba)', 'أضحية العيد', 'Eid Al-Adha')}</option>
                    <option value="Génisses pleines">{tr(language, 'Génisses pleines (Gestantes)', 'بكيرات حوامل', 'Pregnant Heifers')}</option>
                  </select>
                </div>

                {/* 5. Traçabilité & Certificat Vétérinaire */}
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-300 cursor-pointer hover:bg-stone-50 transition">
                    <input
                      type="checkbox"
                      checked={filterLivestockCertifiedOnly}
                      onChange={e => setFilterLivestockCertifiedOnly(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-stone-800 block">
                        {tr(language, 'ONSSA / SNIT Certifié', 'ترقيم SNIT / أونسا', 'ONSSA / SNIT Certified')}
                      </span>
                      <span className="text-[9px] text-stone-500">
                        {tr(language, 'Bouclé & carnet sanitaire', 'مرقم مع شهادة صحية', 'Tagged & health card')}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Produce Supply Cluster Map */}
      {showSupplyMap && (
        <ProduceSupplyClusterMap
          selectedRegionFilter={selectedRegion as any}
          onSelectRegionFilter={(reg) => {
            setSelectedRegion(reg);
            const listingsContainer = document.getElementById('marketplace-listings-container');
            if (listingsContainer) {
              listingsContainer.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onContactSeller={(item) => setContactModalListing(item)}
          onOpenBatchQRModal={(item) =>
            setQrModalBatch({
              type: 'produce',
              id: item.id,
              batchNumber: item.batchNumber || `LOT-PRD-${(item.id || 'ITEM').toUpperCase()}`,
              title: item.title,
              variety: item.variety,
              speciesOrCategory: item.category,
              region: item.region,
              quantityAvailable: item.quantityAvailable,
              unit: item.unit,
              unitPriceMAD: item.pricePerUnitMAD,
              location: `${item.locationCity} (${item.region.split('(')[0].trim()})`,
              healthOrCertifications: item.certifications || [],
              phytosanitaryPassport: item.phytosanitaryPassport || 'ONSSA-ST-AGR-2025',
              onssaStatus: item.certifications?.includes('ONSSA Homologué') ? 'ONSSA Homologué' : 'Standard',
              stageOrCalibre: item.calibre,
              harvestOrSeedingDate: item.harvestDate,
              sellerName: item.sellerName,
              sellerPhone: item.phone,
              notes: item.description,
            })
          }
        />
      )}

      {/* Active Listings Header & Regional Filter Status */}
      <div id="marketplace-listings-container" className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-stone-900 text-sm">
            {tr(language, 'Lots Référencés Disponibles', 'عروض المحاصيل المتوفرة', 'Available Produce Lots')}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold border border-stone-200">
            {filteredListings.length} {filteredListings.length > 1 ? tr(language, 'lots', 'حصص', 'lots') : tr(language, 'lot', 'حصة', 'lot')}
          </span>

          {selectedRegion !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-300 shadow-2xs animate-in fade-in">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{selectedRegion.split('(')[0]}</span>
              <button
                type="button"
                onClick={() => setSelectedRegion('ALL')}
                className="hover:text-emerald-950 p-0.5 cursor-pointer ml-1"
                title="Afficher toutes les régions"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 font-medium border border-amber-200">
              <span>&quot;{searchTerm}&quot;</span>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="hover:text-amber-950 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!showSupplyMap && (
            <button
              type="button"
              onClick={() => setShowSupplyMap(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr(language, 'Afficher la Carte des Gisements', 'عرض خريطة المصادر', 'Show Supply Map')}</span>
            </button>
          )}

          {(selectedCategory !== 'ALL' || selectedRegion !== 'ALL' || selectedCertification !== 'ALL' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedRegion('ALL');
                setSelectedCertification('ALL');
                setSearchTerm('');
              }}
              className="text-stone-500 hover:text-stone-900 font-semibold underline cursor-pointer"
            >
              {tr(language, 'Effacer les filtres', 'إلغاء التصفية', 'Clear all filters')}
            </button>
          )}
        </div>
      </div>
      {filteredListings.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-xs">
          <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">Aucune annonce trouvée</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Aucun produit ne correspond à vos critères de recherche dans cette région.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedRegion('ALL');
              setSelectedCertification('ALL');
              setSearchTerm('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Marketplace Listings Cards */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map(listing => (
            <div
              key={listing.id}
              id={`card-produce-${listing.id}`}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/40 hover:-translate-y-1.5 active:-translate-y-0.5 active:shadow-md transition-all duration-200 ease-out flex flex-col justify-between overflow-hidden group will-change-transform"
            >
              <div>
                {/* Image & Badges */}
                <div
                  className="relative h-44 w-full overflow-hidden bg-stone-100 cursor-pointer"
                  onClick={() => openOfferDetail(listing)}
                  title={tr(language, 'Cliquer pour voir la fiche détaillée', 'انقر لمعاينة التفاصيل', 'Click to view full detail')}
                >
                  <SmartImage
                    src={listing.imageUrl}
                    alt={listing.title}
                    category={listing.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Category & Monetization Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-900/80 text-stone-200 backdrop-blur-xs shadow-xs">
                        {listing.category}
                      </span>

                      {listing.verifiedAgriForex && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs border border-emerald-400/40">
                          <ShieldCheck className="w-3 h-3" /> {tr(language, 'Vérifié AgriForex', 'موثق AgriForex', 'AgriForex Verified')}
                        </span>
                      )}

                      {listing.isFeatured && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600 text-white flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3" /> {tr(language, 'Recommandé', 'مميز', 'Featured')}
                        </span>
                      )}
                    </div>

                    {/* Boost Badge & Pro Badge */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {listing.boostLevel && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs animate-pulse">
                          <Zap className="w-3 h-3 fill-white" />
                          {listing.boostLevel === 'flash_3d'
                            ? tr(language, 'En Tête (Flash 3j)', 'في الصدارة (3 أيام)', 'Top (Flash 3d)')
                            : listing.boostLevel === 'intensive_7d'
                            ? tr(language, 'En Vedette (7j)', 'مميز (7 أيام)', 'Featured (7d)')
                            : tr(language, 'Méga Récolte', 'محصول فائق', 'Mega Harvest')}
                        </span>
                      )}
                      {(listing.sellerIsPro || userProfile.isProCertified) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-stone-950 shadow-xs border border-amber-300">
                          <Award className="w-3 h-3 text-stone-950" />
                          {tr(language, 'Producteur PRO', 'منتج محترف PRO', 'PRO Producer')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Availability Badge & Price Watch Alert Trigger */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {listing.listingIntent !== 'buy' && (
                      <button
                        id={`btn-watch-price-drop-${listing.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addPriceDropWatch({
                            produceName: listing.title,
                            category: listing.category,
                            region: listing.region,
                            currentPriceMAD: listing.pricePerUnitMAD,
                            targetPriceMAD: Number((listing.pricePerUnitMAD * 0.9).toFixed(1)),
                            unit: listing.unit,
                            enabled: true,
                          });
                          openNotificationSettings('price_drops');
                        }}
                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-stone-900/85 hover:bg-amber-600 active:bg-amber-700 text-stone-200 hover:text-white backdrop-blur-xs transition-all duration-150 active:scale-95 border border-stone-700/60 cursor-pointer shadow-xs flex items-center justify-center"
                        title={tr(
                          language,
                          "Créer une alerte personnalisée en cas de baisse de prix sur ce lot",
                          "إنشاء تنبيه مخصص عند انخفاض سعر هذه الحصة",
                          "Create price drop alert for this batch"
                        )}
                        aria-label="Alerte Baisse de Prix"
                      >
                        <Bell className="w-4 h-4 text-amber-400" />
                      </button>
                    )}
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        listing.listingIntent === 'buy'
                          ? 'bg-blue-900/90 text-blue-200 border border-blue-500/30'
                          : listing.status === 'Disponible'
                          ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/30'
                          : 'bg-stone-900/80 text-stone-300'
                      }`}
                    >
                      {listing.listingIntent === 'buy' ? tr(language, 'En cours', 'نشط', 'Active') : listing.status}
                    </span>
                  </div>

                  {/* Multiple photos or custom photo badge */}
                  {((listing.additionalImages && listing.additionalImages.length > 0) ||
                    listing.isCustomPhoto ||
                    (listing.imageUrl && listing.imageUrl.startsWith('data:'))) && (
                    <div className="absolute bottom-12 right-3 flex items-center gap-1 z-10 pointer-events-none">
                      {(listing.isCustomPhoto || (listing.imageUrl && listing.imageUrl.startsWith('data:'))) && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-800/90 text-white border border-emerald-500/40 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                          <Camera className="w-2.5 h-2.5 text-emerald-300" />
                          <span>{tr(language, 'Photo réelle', 'صورة حقيقية', 'Real photo')}</span>
                        </span>
                      )}
                      {listing.additionalImages && listing.additionalImages.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/75 text-white border border-white/20 backdrop-blur-xs shadow-xs">
                          +{listing.additionalImages.length + 1} 📷
                        </span>
                      )}
                    </div>
                  )}

                  {/* Title & Variety */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-semibold text-amber-300 block uppercase tracking-wider">
                      {listing.variety}
                    </span>
                    <h3 className="text-base font-black tracking-tight leading-tight drop-shadow-xs">
                      {listing.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Price & Quantity Banner */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      listing.listingIntent === 'buy'
                        ? 'bg-blue-50/70 border-blue-200/60'
                        : 'bg-amber-50/70 border-amber-200/60'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">
                        {listing.listingIntent === 'buy' ? tr(language, 'Budget Cible Achat', 'الميزانية المستهدفة', 'Target Purchase Budget') : tr(language, 'Prix unitaire', 'السعر للوحدة', 'Unit Price')}
                      </span>
                      <p className="text-lg font-black text-stone-900 leading-tight">
                        {(listing.pricePerUnitMAD ?? 0).toLocaleString('fr-FR')}{' '}
                        <span className="text-xs font-semibold text-stone-600">
                          MAD / {listing.unit === 'Tonnes' ? tr(language, 'Tonne', 'طن', 'Tonne') : listing.unit}
                        </span>
                      </p>
                      {listing.unit === 'Tonnes' && (
                        <span className="text-[11px] font-bold text-emerald-800 block">
                          ({tr(language, 'soit', 'أي', 'i.e.')} {((listing.pricePerUnitMAD ?? 0) / 1000).toFixed(2)} MAD / kg)
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold block ${
                          listing.listingIntent === 'buy' ? 'text-blue-800' : 'text-amber-800'
                        }`}
                      >
                        {listing.priceType}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">
                        {listing.listingIntent === 'buy' ? tr(language, 'Volume Recherché', 'الكمية المطلوبة', 'Requested Volume') : tr(language, 'Volume Disponible', 'الكمية المتوفرة', 'Available Volume')}
                      </span>
                      <p
                        className={`text-base font-black ${
                          listing.listingIntent === 'buy' ? 'text-blue-800' : 'text-emerald-800'
                        }`}
                      >
                        {listing.quantityAvailable} {listing.unit}
                      </p>
                      <span className="text-[10px] text-stone-500 block">
                        Min: {listing.minOrderQuantity} {listing.unit}
                      </span>
                    </div>
                  </div>

                  {/* Specifications : Adaptées pour Élevage & Bétail vs Produits Récoltés */}
                  {listing.category === 'Élevage & Bétail' || listing.livestockSubCategory ? (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-amber-200/60">
                        <span className="font-bold text-amber-950 flex items-center gap-1">
                          {listing.livestockSubCategory === 'bovins' ? '🐄 Bovin' : listing.livestockSubCategory === 'caprins' ? '🐐 Caprin' : '🐑 Ovin'}
                          <span className="font-semibold text-amber-800">
                            • {listing.livestockBreed || listing.variety}
                          </span>
                        </span>
                        <span className="px-2 py-0.5 rounded font-black text-amber-900 bg-amber-200/80 text-[10px]">
                          {listing.livestockHeadCount || listing.quantityAvailable} {tr(language, 'têtes', 'رأس', 'heads')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
                        <div className="flex items-center gap-1.5">
                          <Weight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span className="truncate">
                            <strong className="text-stone-900 font-bold">
                              {listing.livestockAverageWeightKg ? `${listing.livestockAverageWeightKg} kg` : 'Poids non spé.'}
                            </strong>{' '}
                            {tr(language, 'vif moyen', 'حي متوسط', 'avg live')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span className="truncate">
                            <strong className="text-stone-900 font-bold">
                              {listing.livestockAgeMonths ? `${listing.livestockAgeMonths} mois` : listing.calibre}
                            </strong>{' '}
                            {tr(language, 'âge', 'العمر', 'age')}
                          </span>
                        </div>
                      </div>

                      {/* Sanitaire & Vocation */}
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] pt-1 text-stone-600 border-t border-amber-100">
                        <span className="flex items-center gap-1 text-emerald-800 font-semibold truncate">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {listing.livestockHealthCertificate || 'SNIT ONSSA Conforme'}
                        </span>
                        {listing.livestockPurpose && (
                          <span className="text-amber-900 font-bold bg-amber-100/80 px-1.5 py-0.5 rounded">
                            {listing.livestockPurpose}
                          </span>
                        )}
                      </div>

                      {/* Cheptel Photo Preview Button */}
                      {(listing.cheptelPhotoUrl || listing.imageUrl) && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewCheptelModal({
                              imageUrl: listing.cheptelPhotoUrl || listing.imageUrl,
                              title: listing.title,
                              breed: listing.livestockBreed || listing.variety,
                              headCount: listing.livestockHeadCount || listing.quantityAvailable,
                              weight: listing.livestockAverageWeightKg,
                              healthCert: listing.livestockHealthCertificate,
                            })
                          }
                          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-amber-100 active:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-300 shadow-2xs transition-all duration-150 active:scale-[0.98] cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>{tr(language, '📷 Voir photo du cheptel & certificat', '📷 معاينة صورة القطيع والشهادة', '📷 View herd photo & cert')}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Specifications standard */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                        <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="truncate font-medium">{listing.locationCity} ({listing.region.split('(')[0]})</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <Package className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="truncate font-medium">{listing.packaging}</span>
                        </div>
                      </div>

                      {/* Calibre & Description */}
                      <div className="text-xs text-stone-600">
                        <span className="font-semibold text-stone-800">{tr(language, 'Calibre : ', 'العيار / القياس : ', 'Grade / Calibre: ')}</span>
                        <span>{listing.calibre}</span>
                        {listing.description && (
                          <p className="mt-1 text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                            {listing.description}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Lot / Batch Number & QR Quick Access */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100/90 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 shrink-0">
                        {tr(language, 'N° Lot :', 'رقم الحصة :', 'Batch No:')}
                      </span>
                      <span className="font-mono font-bold text-emerald-950 truncate">
                        {listing.batchNumber || `LOT-PRD-${(listing.id || 'ITEM').toUpperCase()}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setQrModalBatch({
                            type: 'produce',
                            id: listing.id,
                            batchNumber: listing.batchNumber || `LOT-PRD-${(listing.id || 'ITEM').toUpperCase()}`,
                            title: listing.title,
                            variety: listing.variety,
                            speciesOrCategory: listing.category,
                            region: listing.region,
                            quantityAvailable: listing.quantityAvailable,
                            unit: listing.unit,
                            unitPriceMAD: listing.pricePerUnitMAD,
                            location: `${listing.locationCity} (${listing.region.split('(')[0]})`,
                            healthOrCertifications: listing.certifications || [],
                            phytosanitaryPassport: listing.phytosanitaryPassport || 'ONSSA-ST-AGR-2025',
                            onssaStatus: listing.certifications?.includes('ONSSA Homologué') ? 'ONSSA Homologué' : 'Standard',
                            stageOrCalibre: listing.calibre,
                            harvestOrSeedingDate: listing.harvestDate,
                            sellerName: listing.sellerName,
                            notes: listing.description,
                          })
                        }
                        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-white hover:bg-emerald-100 active:bg-emerald-200 text-emerald-900 font-bold border border-emerald-300 shadow-2xs transition-all duration-150 active:scale-95 cursor-pointer text-xs shrink-0"
                        title={tr(language, 'Générer le QR code pour étiquette et inventaire du lot', 'إنشاء رمز الاستجابة السريعة للملصق والمخزون', 'Generate QR code for batch label and inventory')}
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{tr(language, 'QR Lot', 'رمز الحصة', 'Batch QR')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => generateManifestFromListing(listing)}
                        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-emerald-100/70 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-950 font-bold border border-emerald-300 shadow-2xs transition-all duration-150 active:scale-95 cursor-pointer text-xs shrink-0"
                        title={tr(language, "Générer automatiquement le Manifeste d'Expédition / Export standardisé (A4 PDF officiel) pour ce lot", "إنشاء بيان الشحن والتصدير الرسمي (PDF) تلقائياً لهذه الحصة", "Generate official Export/Shipping Manifest (PDF) for this batch")}
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{tr(language, 'Manifeste (PDF)', 'بيان (PDF)', 'Manifest (PDF)')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Certifications Badges */}
                  {listing.certifications && listing.certifications.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {listing.certifications.map(c => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Seller Info & Star Rating line */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => openRatingModal(listing.sellerName, listing.title, listing.id)}
                      className="flex items-center gap-2 text-left hover:bg-stone-50 p-2 -ml-2 rounded-xl transition-all duration-150 cursor-pointer group/rate min-h-[44px]"
                      title={tr(language, 'Cliquez pour voir les avis et la réputation du producteur', 'انقر لمعاينة التقييمات والسمعة', 'Click to view producer ratings and reputation')}
                    >
                      <span className="font-bold text-stone-800 group-hover/rate:text-emerald-800">
                        {listing.sellerName}
                      </span>
                      <StarRating
                        rating={listing.rating || 4.8}
                        reviewsCount={listing.reviewsCount || 10}
                        size="sm"
                      />
                    </button>
                    <span className="text-[10px] font-semibold text-stone-400">{listing.sellerType}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Adapté selon profil Vendeur vs Acheteur */}
              <div className="p-3 sm:p-3.5 bg-stone-50 border-t border-stone-200 space-y-2.5">
                {/* Primary Direct Modal Actions: Quick Buy & Negotiate or Owner Badge */}
                {isItemOwnedByUser(listing, userProfile, googleUser) ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 w-full">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[11px] font-extrabold">{tr(language, 'Votre annonce (Vendeur)', 'إعلانك الخاص (البائع)', 'Your listing (Seller)')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('seller_space')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-lg transition shadow-xs cursor-pointer"
                    >
                      {tr(language, 'Gérer mon offre', 'إدارة الإعلان', 'Manage')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-quick-buy-${listing.id}`}
                      type="button"
                      onClick={() =>
                        openEscrowPayment(
                          'produce',
                          listing,
                          Math.max(1, Math.min(5, listing.quantityAvailable))
                        )
                      }
                      className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-white text-xs font-black shadow-xs hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 ring-1 ring-emerald-700/50"
                      title={tr(language, "Achat Rapide : Ouvre immédiatement le modal de paiement sécurisé sous séquestre sans recharger la page", "شراء سريع: يفتح نافذة الدفع المضمون فوراً دون مغادرة الصفحة", "Quick Buy: Directly opens the escrow payment modal without leaving the page")}
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                      <span className="tracking-wide">
                        {tr(language, 'Achat Rapide', 'شراء سريع', 'Quick Buy')}
                      </span>
                    </button>

                    {/* Negotiate Icon Button (Direct modal flow trigger) */}
                    <button
                      id={`btn-negotiate-icon-${listing.id}`}
                      type="button"
                      onClick={() => openOfferDiscussion(listing.id, 'produce', listing)}
                      className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center gap-1.5 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer shrink-0"
                      title={tr(
                        language,
                        "Négocier : Ouvre directement le modal de négociation et d'offre sans rechargement de page",
                        "تفاوض: فتح نافذة التفاوض وتقديم عرض سعر مباشرة بدون مغادرة الصفحة",
                        "Negotiate: Directly opens the negotiation and counter-offer modal without page reload"
                      )}
                      aria-label={tr(language, 'Négocier', 'تفاوض', 'Negotiate')}
                    >
                      <Handshake className="w-4 h-4 text-amber-800 shrink-0" />
                      <span className="text-xs font-bold">{tr(language, 'Négocier', 'تفاوض', 'Negotiate')}</span>
                    </button>
                  </div>
                )}

                {/* Secondary Actions: Booster (pour vendeurs) / Voir Détail (pour acheteurs) & Logistique */}
                <div className="grid grid-cols-2 gap-2">
                  {userProfile.role !== 'buyer' ? (
                    <button
                      id={`btn-boost-produce-${listing.id}`}
                      type="button"
                      onClick={() =>
                        openBoostModal(
                          'produce',
                          listing.id,
                          listing.title,
                          listing.boostLevel
                        )
                      }
                      className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-amber-50 active:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold shadow-2xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                      title={tr(language, "Booster l'annonce (ex: 50 MAD pour 3 jours en tête)", "ترقية الإعلان (50 درهم لـ 3 أيام في الصدارة)", "Boost listing (e.g., 50 MAD for 3 days at top)")}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span className="truncate">{tr(language, 'Booster (50 MAD)', 'ترقية (50 درهم)', 'Boost (50 MAD)')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openOfferDetail(listing)}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-bold shadow-2xs transition-all duration-150 active:scale-[0.98] cursor-pointer"
                      title={tr(language, 'Consulter la fiche complète du lot', 'معاينة بطاقة العرض الكاملة', 'View full listing details')}
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{tr(language, 'Détail', 'معاينة', 'Details')}</span>
                    </button>
                  )}

                  <button
                    id={`btn-transport-produce-${listing.id}`}
                    type="button"
                    onClick={() =>
                      openLogisticsModal({
                        originCity: listing.locationCity || 'Agadir',
                        cargoType: 'fresh_produce',
                        volumeTonnes: listing.unit === 'Tonnes' ? Math.min(25, listing.quantityAvailable) : 5,
                        itemTitle: `${listing.title} (${listing.variety})`,
                      })
                    }
                    className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold shadow-2xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                    title={tr(language, "Réserver un camion frigo ou semi-remorque certifié", "حجز شاحنة تبريد أو نقل بضائع معتمد", "Book refrigerated truck or certified freight")}
                  >
                    <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{tr(language, 'Fret Frigo', 'نقل مبرد', 'Reefer Freight')}</span>
                  </button>
                </div>

                {/* Communication & Protection status row */}
                <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
                  {platformPaymentProtected ? (
                    <>
                      <button
                        id={`btn-rate-produce-${listing.id}`}
                        type="button"
                        onClick={() => openRatingModal(listing.sellerName, listing.title, listing.id)}
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 text-amber-800 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                        title={tr(language, "Noter ce vendeur pour fidéliser les meilleurs producteurs", "تقييم البائع", "Rate producer")}
                      >
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                        <span>{tr(language, 'Avis Producteur', 'تقييم المنتج', 'Reviews')}</span>
                      </button>

                      {/* Protection active badge */}
                      <span
                        title={tr(language, "Paiement plateforme actif : Les coordonnées directes sont protégées pour bloquer les fonds sous séquestre et vous prémunir des impayés et produits non conformes", "الدفع الآمن مفعل لحماية الطرفين وضمان الأموال حتى التأكد من المنتوج", "Platform escrow active: Direct coordinates protected to ensure secure transaction")}
                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center cursor-help shrink-0"
                      >
                        <Lock className="w-4 h-4 text-amber-600" />
                      </span>
                    </>
                  ) : (
                    <>
                      <button
                        id={`btn-contact-${listing.id}`}
                        type="button"
                        onClick={() => setContactModalListing(listing)}
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white text-xs font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 fill-white shrink-0" />
                        <span>WhatsApp Direct</span>
                      </button>

                      <a
                        href={`tel:${listing.phone}`}
                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-stone-300 hover:bg-white text-stone-700 hover:text-stone-900 flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer shrink-0"
                        title={`${tr(language, 'Appeler', 'اتصال بـ', 'Call')} ${listing.sellerName}`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(tr(language, `Supprimer l'annonce "${listing.title}" ?`, `هل تريد حذف الإعلان "${listing.title}"؟`, `Delete listing "${listing.title}"?`))) {
                        deleteProduceListing(listing.id);
                      }
                    }}
                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer shrink-0"
                    title={tr(language, "Supprimer l'annonce", "حذف الإعلان", "Delete listing")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 my-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
            <PackageSearch className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              {tr(language, 'Aucune annonce trouvée pour ces critères', 'لم يتم العثور على أي عرض أو طلب يطابق بحثك', 'No listings found matching these criteria')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              {tr(
                language,
                "Essayez d'élargir votre recherche, de changer de filière ou de basculer entre Vente et Achat.",
                'حاول تغيير الكلمات الدلالية أو الفئة أو التبديل بين عروض البيع والشراء.',
                'Try broadening your search, selecting another sector, or toggling between Buy and Sell.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedIntent('ALL');
                setSelectedRegion('ALL');
                setSelectedCertification('ALL');
                setProduceCategoryFilter('ALL');
                setProduceIntentFilter('ALL');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{tr(language, 'Réinitialiser tous les filtres', 'إعادة ضبط جميع الفلاتر', 'Reset all filters')}</span>
            </button>
            {userProfile.role !== 'buyer' ? (
              <button
                type="button"
                onClick={() => setIsPostingListing(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{tr(language, 'Publier une annonce', 'نشر إعلان جديد', 'Post a new listing')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedIntent('ALL');
                  setSelectedRegion('ALL');
                  setSelectedCertification('ALL');
                  setProduceCategoryFilter('ALL');
                  setProduceIntentFilter('ALL');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>{tr(language, 'Voir toutes les offres producteurs', 'عرض كافة عروض المنتجين', 'View all producer offers')}</span>
              </button>
            )}
          </div>
        </div>
      )}
      </>
      )}

      {/* Modals */}
      {contactModalListing && (
        <ContactSellerModal
          listing={contactModalListing}
          onClose={() => setContactModalListing(null)}
        />
      )}

      {isPostingListing && (
        <ProduceListingFormModal
          onClose={() => setIsPostingListing(false)}
          onSave={newListing => {
            addProduceListing(newListing);
            setIsPostingListing(false);
          }}
        />
      )}

      {/* Modal QR Code Traçabilité & Inventaire Produit */}
      {qrModalBatch && (
        <BatchQRCodeModal
          isOpen={Boolean(qrModalBatch)}
          onClose={() => setQrModalBatch(null)}
          batchData={qrModalBatch}
        />
      )}

      {/* Modal Aperçu Cheptel & Certificat Sanitaire */}
      {previewCheptelModal && (
        <div
          id="modal-cheptel-photo-preview"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewCheptelModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-stone-900 overflow-hidden">
              <img
                src={previewCheptelModal.imageUrl}
                alt={previewCheptelModal.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPreviewCheptelModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-xl text-white">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  {previewCheptelModal.breed}
                </span>
                <h4 className="text-base font-black">{previewCheptelModal.title}</h4>
              </div>
            </div>

            <div className="p-4 space-y-3 bg-white">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Taille du lot</span>
                  <span className="text-sm font-black text-amber-950">
                    {previewCheptelModal.headCount ?? 'Lot entier'} têtes
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Poids moyen</span>
                  <span className="text-sm font-black text-amber-950">
                    {previewCheptelModal.weight ? `${previewCheptelModal.weight} kg` : 'Non précisé'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/80">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Contrôle ONSSA</span>
                  <span className="text-xs font-black text-emerald-950 truncate block">
                    {previewCheptelModal.healthCert || 'Vérifié SNIT'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-xs text-stone-500">
                  Photographie authentifiée prise sur site d'élevage au Maroc.
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewCheptelModal(null)}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
