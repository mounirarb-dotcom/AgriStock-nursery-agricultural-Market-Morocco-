import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation, tr } from '../utils/translations';
import { FarmStandingListing, MoroccanRegion } from '../types';
import { isItemOwnedByUser } from '../utils/ownershipUtils';
import { MOROCCAN_REGIONS } from '../data/mockData';
import {
  Trees,
  Search,
  Plus,
  Filter,
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Layers,
  Droplets,
  Coins,
  Scale,
  Sparkles,
  CheckCircle2,
  Trash2,
  X,
  Share2,
  ShoppingCart,
  Tractor,
  Store,
  ShieldCheck,
  Zap,
  Truck,
  Award,
  Lock,
  Star,
  Handshake,
} from 'lucide-react';
import { StarRating } from './StarRating';

const CROP_CATEGORIES: FarmStandingListing['cropCategory'][] = [
  'Agrumes (Clémentines, Oranges...)',
  'Olivier (Huile & Table)',
  'Maraîchage Plein Champ (Pastèque, Melon, Pomme de terre...)',
  'Rosacées (Pommiers, Pêchers, Abricotiers)',
  'Céréales & Légumineuses',
  'Autre culture',
];

interface FarmStandingMarketProps {
  onSwitchToHarvested?: () => void;
}

export const FarmStandingMarket: React.FC<FarmStandingMarketProps> = ({ onSwitchToHarvested }) => {
  const {
    language,
    farmStandingListings,
    addFarmStandingListing,
    updateFarmStandingStatus,
    deleteFarmStandingListing,
    openComposeModal,
    userProfile,
    googleUser,
    setActiveTab,
    setIsIdentificationModalOpen,
    openEscrowPayment,
    openBoostModal,
    openLogisticsModal,
    platformPaymentProtected,
    maskUserPhone,
    openOfferDiscussion,
    openRatingModal,
  } = useApp();
  const t = useTranslation(language);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCropCategory, setSelectedCropCategory] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'surface_desc'>('recent');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state for new listing
  const [newTitle, setNewTitle] = useState('');
  const [newCropCategory, setNewCropCategory] = useState<FarmStandingListing['cropCategory']>('Agrumes (Clémentines, Oranges...)');
  const [newVariety, setNewVariety] = useState('');
  const [newRegion, setNewRegion] = useState<MoroccanRegion>('Souss-Massa (Agadir, Taroudant, Chtouka)');
  const [newLocationDetails, setNewLocationDetails] = useState('');
  const [newSurfaceHectares, setNewSurfaceHectares] = useState<number>(5);
  const [newPricePerHa, setNewPricePerHa] = useState<number>(35000);
  const [newEstimatedYieldTotal, setNewEstimatedYieldTotal] = useState<number>(180);
  const [newEstimatedYieldPerHa, setNewEstimatedYieldPerHa] = useState<number>(36);
  const [newHarvestDate, setNewHarvestDate] = useState('Novembre - Décembre 2025');
  const [newIrrigation, setNewIrrigation] = useState<FarmStandingListing['irrigationType']>('Goutte-à-goutte (Puits & Bassin)');
  const [newPicking, setNewPicking] = useState<FarmStandingListing['pickingCondition']>('Sur pied - Cueillette & transport à charge de l\'acheteur');
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState('+212');
  const [newSellerWhatsapp, setNewSellerWhatsapp] = useState('212');
  const [newSellerEmail, setNewSellerEmail] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Filtering
  const filteredListings = farmStandingListings
    .filter(item => {
      const term = (searchTerm || '').trim().toLowerCase();
      const matchesSearch =
        !term ||
        Boolean(item.title?.toLowerCase().includes(term)) ||
        Boolean(item.variety?.toLowerCase().includes(term)) ||
        Boolean(item.locationDetails?.toLowerCase().includes(term)) ||
        Boolean(item.sellerName?.toLowerCase().includes(term));

      const matchesCat = selectedCropCategory === 'ALL' || item.cropCategory === selectedCropCategory;
      const matchesReg = selectedRegion === 'ALL' || item.region === selectedRegion;

      return matchesSearch && matchesCat && matchesReg;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerHectareMAD - b.pricePerHectareMAD;
      if (sortBy === 'price_desc') return b.pricePerHectareMAD - a.pricePerHectareMAD;
      if (sortBy === 'surface_desc') return b.surfaceHectares - a.surfaceHectares;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Aggregated Stats
  const totalHectares = farmStandingListings.reduce((acc, l) => acc + l.surfaceHectares, 0);
  const averagePricePerHa = farmStandingListings.length > 0
    ? Math.round(farmStandingListings.reduce((acc, l) => acc + l.pricePerHectareMAD, 0) / farmStandingListings.length)
    : 0;
  const totalEstimatedYield = farmStandingListings.reduce((acc, l) => acc + (l.estimatedTotalYieldTonnes || 0), 0);

  const handleOpenModal = () => {
    if (!newSellerName && (userProfile.companyName || userProfile.displayName)) {
      setNewSellerName(userProfile.companyName || userProfile.displayName);
    }
    if (newSellerPhone === '+212' && userProfile.phone) {
      setNewSellerPhone(userProfile.phone);
    }
    if (newSellerWhatsapp === '212' && userProfile.whatsapp) {
      setNewSellerWhatsapp(userProfile.whatsapp);
    }
    if (userProfile.region) {
      setNewRegion(userProfile.region);
    }
    if (userProfile?.role === 'buyer') {
      alert(
        tr(
          language,
          "En tant qu'acheteur, vous ne pouvez pas publier d'offre de production. Vous pouvez consulter les vergers et parcelles disponibles et contacter directement les producteurs.",
          "كمشتري، لا يمكنك نشر عروض محاصيل فلاحية. يمكنك تصفح عروض الضيعات والتواصل المباشر مع الفلاحين.",
          "As a buyer, you cannot post production offers. You can browse available orchards and contact producers directly."
        )
      );
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVariety.trim() || newSurfaceHectares <= 0 || newPricePerHa <= 0) {
      alert('Veuillez renseigner le titre, la variété, la superficie et le prix par hectare.');
      return;
    }

    addFarmStandingListing({
      userId: userProfile?.id,
      title: newTitle.trim(),
      cropCategory: newCropCategory,
      variety: newVariety.trim(),
      region: newRegion,
      locationDetails: newLocationDetails.trim() || 'Maroc',
      surfaceHectares: Number(newSurfaceHectares),
      pricePerHectareMAD: Number(newPricePerHa),
      estimatedTotalYieldTonnes: Number(newEstimatedYieldTotal) || undefined,
      estimatedYieldPerHaTonnes: Number(newEstimatedYieldPerHa) || undefined,
      harvestReadyDate: newHarvestDate.trim() || 'À convenir',
      irrigationType: newIrrigation,
      pickingCondition: newPicking,
      sellerName: newSellerName.trim() || 'Producteur Agricole',
      sellerPhone: newSellerPhone.trim(),
      sellerWhatsapp: newSellerWhatsapp.trim() || newSellerPhone.replace(/\D/g, ''),
      sellerEmail: newSellerEmail.trim() || undefined,
      description: newDescription.trim() || 'Vente de récolte sur pied à l\'exploitation.',
      imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80',
    });

    setIsModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewVariety('');
    setNewLocationDetails('');
    setNewDescription('');
    setNewImageUrl('');
  };

  const handleShare = (listing: FarmStandingListing) => {
    const text = `Verger/Parcelle sur pied : ${listing.title} (${listing.surfaceHectares} Ha à ${listing.pricePerHectareMAD.toLocaleString()} MAD/Ha). Contact : ${listing.sellerPhone}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(listing.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-3">
            <Trees className="w-3.5 h-3.5 text-emerald-400" />
            Récoltes & Vergers sur Pied — Prix / Hectare
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Vente production sur terrain prix/ ha
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
            Marché spécialisé pour l'achat et la vente de récoltes sur pied (ضمان الغلة / بيع المحصول بالهكتار). Négociez directement avec les exploitants agricoles des vergers d'agrumes, oliveraies, parcelles de pastèques, pommes de terre et rosacées au Maroc.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {userProfile?.role !== 'buyer' ? (
              <button
                id="btn-post-farm-standing"
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + Publier une Parcelle / Verger (Prix/Ha)
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 text-xs font-semibold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{tr(language, 'Espace Acheteur : Consultation des vergers sur pied partagés par les producteurs', 'فضاء المشتري: معاينة بساتين الغلة على أصلها المنشورة من طرف الفلاحين', 'Buyer Space: Consult standing orchards shared by growers')}</span>
              </div>
            )}
            {onSwitchToHarvested && (
              <button
                id="btn-switch-to-harvested"
                onClick={onSwitchToHarvested}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 font-bold text-xs shadow-lg transition active:scale-95 border border-stone-700"
              >
                <Store className="w-4 h-4 text-amber-400" />
                🧺 Voir les Lots Récoltés (Au Kg / Tonne)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Superficie Proposée</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            {totalHectares.toLocaleString()} <span className="text-xs font-semibold text-emerald-700">Ha</span>
          </p>
          <span className="text-[11px] text-stone-400">{farmStandingListings.length} vergers & parcelles</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Prix Moyen / Hectare</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            {averagePricePerHa.toLocaleString()} <span className="text-xs font-semibold text-stone-600">MAD / ha</span>
          </p>
          <span className="text-[11px] text-stone-400">Forfait de récolte sur pied</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Production Estimée</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            {totalEstimatedYield.toLocaleString()} <span className="text-xs font-semibold text-stone-600">Tonnes</span>
          </p>
          <span className="text-[11px] text-stone-400">Estimation sur pied</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Type de Transaction</span>
            <Droplets className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-sm font-bold text-stone-900 mt-1">
            Direct Producteur
          </p>
          <span className="text-[11px] text-stone-500">Sans intermédiaire de gros</span>
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
                ? tr(language, 'Mode Vendeur / Exploitant actif :', 'أنت في وضع البائع / صاحب الضيعة :', 'Active Seller / Farm Owner Mode:')
                : tr(language, 'Mode Acheteur / Négociant de récoltes actif :', 'أنت في وضع المشتري / الضامن :', 'Active Buyer / Crop Trader Mode:')}
            </span>{' '}
            <span className="text-stone-700">
              {userProfile.role === 'seller'
                ? tr(
                    language,
                    'Publiez vos vergers et parcelles sur pied avec prix au forfait par hectare.',
                    'انشر بساتينك أو حقولك للبيع بالهكتار على رؤوس الأشجار مباشرة للمشترين.',
                    'Publish your orchards and standing crops with lump-sum prices per hectare.'
                  )
                : tr(
                    language,
                    'Parcourez les parcelles sur pied, simulez les rendements et contactez directement les exploitants.',
                    'ابحث عن الغلات الزراعية المناسبة، احسب العائد التقديري واتصل بالفلاحين لزيارة الضيعة.',
                    'Browse standing crops, simulate yields and contact growers directly to arrange farm visits.'
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
          {tr(language, 'Modifier mon profil', 'تغيير صفتي (مشتري / بائع)', 'Edit Profile (Buyer/Seller)')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par culture, variété, commune, région, exploitant..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="recent">Plus récent</option>
              <option value="price_asc">Prix/Ha croissant</option>
              <option value="price_desc">Prix/Ha décroissant</option>
              <option value="surface_desc">Superficie (Ha) max</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Cultures :
          </span>
          <button
            onClick={() => setSelectedCropCategory('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
              selectedCropCategory === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Toutes les cultures
          </button>
          {CROP_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCropCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                selectedCropCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Region Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Régions :
          </span>
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
          >
            <option value="ALL">Toutes les régions agricoles</option>
            {MOROCCAN_REGIONS.map(reg => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-stone-200 text-center space-y-3">
          <Trees className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-700">Aucune parcelle trouvée</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Aucune offre de vente sur pied ne correspond à vos filtres. Essayez de réinitialiser la recherche ou publiez une nouvelle annonce.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCropCategory('ALL');
              setSelectedRegion('ALL');
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => {
            const totalPrice = listing.surfaceHectares * listing.pricePerHectareMAD;
            const whatsappMsg = encodeURIComponent(
              `Bonjour, je vous contacte via AgriStock Maroc au sujet de votre vente sur pied : "${listing.title}" (${listing.surfaceHectares} Ha à ${listing.pricePerHectareMAD} MAD/ha). Est-ce toujours disponible pour une visite de parcelle ?`
            );

            return (
              <div
                key={listing.id}
                id={`card-farm-${listing.id}`}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1.5 active:-translate-y-0.5 active:shadow-md transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden group will-change-transform"
              >
                {/* Image and badges */}
                <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full shadow-sm ${
                        listing.status === 'Disponible'
                          ? 'bg-emerald-500 text-stone-950'
                          : listing.status === 'En négociation'
                          ? 'bg-amber-400 text-stone-950'
                          : 'bg-stone-500 text-white'
                      }`}
                    >
                      {listing.status}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900/80 text-white backdrop-blur-xs border border-white/20">
                      {listing.surfaceHectares} Ha
                    </span>
                  </div>

                  {/* Price Banner on Image Bottom */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
                        Prix à l'Hectare
                      </p>
                      <p className="text-xl font-black tracking-tight leading-none text-white">
                        {listing.pricePerHectareMAD.toLocaleString()} <span className="text-xs font-semibold">MAD / ha</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-stone-300">Total estimation</p>
                      <p className="text-sm font-black text-amber-300">
                        {totalPrice.toLocaleString()} MAD
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-emerald-700 transition">
                      {listing.title}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                      {listing.variety} • {listing.cropCategory.split(' ')[0]}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{listing.locationDetails}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate pl-4">
                      {listing.region}
                    </p>

                    <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>

                    {/* Features list */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{listing.irrigationType.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{listing.harvestReadyDate}</span>
                      </div>
                      {listing.estimatedYieldPerHaTonnes && (
                        <div className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>~{listing.estimatedYieldPerHaTonnes} T / ha</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{listing.pickingCondition.split(' - ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seller & Action Buttons */}
                  <div className="pt-3 border-t border-stone-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <button
                          type="button"
                          onClick={() => openRatingModal(listing.sellerName, listing.title, listing.id)}
                          className="font-bold text-stone-900 truncate hover:text-emerald-700 transition flex items-center gap-1.5"
                          title="Voir la réputation du producteur"
                        >
                          <span>{listing.sellerName}</span>
                          <StarRating rating={listing.rating || 4.8} reviewsCount={listing.reviewsCount || 8} size="sm" />
                        </button>
                        <p className="text-[10px] text-stone-400 font-mono">
                          {platformPaymentProtected
                            ? maskUserPhone(listing.sellerPhone)
                            : listing.sellerPhone}
                        </p>
                      </div>

                      {/* Status quick toggle */}
                      <select
                        value={listing.status}
                        onChange={e => updateFarmStandingStatus(listing.id, e.target.value as any)}
                        className="text-[10px] font-semibold bg-stone-50 border border-stone-200 rounded px-1.5 py-1 text-stone-700"
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="En négociation">En négociation</option>
                        <option value="Vendu">Vendu</option>
                      </select>
                    </div>

                    {/* Actions de monétisation et transactions */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      {/* Primary Direct Modal Actions: Quick Buy & Negotiate or Owner Badge */}
                      {isItemOwnedByUser(listing, userProfile, googleUser) ? (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 w-full">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[11px] font-extrabold">{tr(language, 'Votre parcelle sur pied', 'ضيعتك المعروضة على رؤوس أشجارها', 'Your standing harvest')}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('seller_space')}
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-lg transition shadow-xs cursor-pointer"
                          >
                            {tr(language, 'Gérer la parcelle', 'إدارة الضيعة', 'Manage')}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {userProfile.role !== 'seller' && (
                            <button
                              id={`btn-quick-buy-standing-${listing.id}`}
                              type="button"
                              onClick={() =>
                                openEscrowPayment(
                                  'farm_standing',
                                  listing,
                                  listing.surfaceHectares || 1
                                )
                              }
                              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-xs font-black transition-all text-center shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
                              title="Achat Rapide : Bloquer un acompte sécurisé sous séquestre sans recharger la page"
                            >
                              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                              <span className="tracking-wide">Achat Rapide</span>
                            </button>
                          )}

                          {/* Negotiate Icon Button */}
                          <button
                            id={`btn-negotiate-icon-standing-${listing.id}`}
                            type="button"
                            onClick={() => openOfferDiscussion(listing.id, 'farm_standing', listing)}
                            className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                            title="Négocier : Ouvre directement le modal de négociation et d'offre sans recharger la page"
                            aria-label="Négocier"
                          >
                            <Handshake className="w-4 h-4 text-amber-800 shrink-0" />
                            <span className="text-xs font-bold">Négocier</span>
                          </button>
                        </div>
                      )}

                      {/* Secondary Actions: Booster (pour vendeurs uniquement) & Fret */}
                      <div className={userProfile.role !== 'buyer' ? "grid grid-cols-2 gap-2" : "flex gap-2"}>
                        {userProfile.role !== 'buyer' && (
                          <button
                            id={`btn-boost-standing-${listing.id}`}
                            type="button"
                            onClick={() =>
                              openBoostModal(
                                'produce',
                                listing.id,
                                listing.title,
                                undefined
                              )
                            }
                            className="min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-amber-50 active:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition-all text-center shadow-2xs active:scale-95 cursor-pointer"
                            title="Booster l'annonce pour accélérer la vente du verger"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            <span className="truncate">Booster (50 MAD)</span>
                          </button>
                        )}

                        <button
                          id={`btn-transport-standing-${listing.id}`}
                          type="button"
                          onClick={() =>
                            openLogisticsModal({
                              originCity: listing.locationCity,
                              cargoType: 'bulk_truck',
                              volumeTonnes: Math.max(5, Math.round(listing.surfaceHectares * 15)),
                              itemTitle: listing.title,
                            })
                          }
                          className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-semibold transition-all text-center shadow-2xs active:scale-95 cursor-pointer"
                          title="Organiser la flotte de camions pour la récolte"
                        >
                          <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">Fret Récolte</span>
                        </button>
                      </div>
                    </div>

                    {/* Contact & Discussion CTAs */}
                    {platformPaymentProtected ? (
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
                        <button
                          id={`btn-rate-standing-${listing.id}`}
                          type="button"
                          onClick={() => openRatingModal(listing.sellerName, listing.title, listing.id)}
                          className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer"
                          title="Noter ce vendeur pour encourager la fidélité"
                        >
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                          <span>Noter le Vendeur</span>
                        </button>
                        <span
                          title="Coordonnées directes masquées pour sécuriser le paiement de la récolte"
                          className="min-h-[40px] min-w-[40px] p-2 bg-stone-100 border border-stone-200 text-stone-500 rounded-xl flex items-center justify-center cursor-help shrink-0"
                        >
                          <Lock className="w-4 h-4 text-amber-600" />
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <a
                          href={`tel:${listing.sellerPhone}`}
                          className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition text-center active:scale-95 cursor-pointer"
                        >
                          <Phone className="w-4 h-4 text-stone-700" />
                          Appel
                        </a>
                        <a
                          href={`https://wa.me/${listing.sellerWhatsapp}?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition text-center active:scale-95 cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp
                        </a>
                        <button
                          onClick={() => openOfferDiscussion(listing.id, 'farm_standing', listing)}
                          className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition text-center active:scale-95 cursor-pointer"
                          title="Ouvrir discussion interne"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Discussion
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400">
                      <button
                        onClick={() => handleShare(listing)}
                        className="min-h-[36px] flex items-center gap-1.5 hover:text-stone-700 py-1.5 px-2 -ml-1 rounded-lg hover:bg-stone-50 transition active:scale-95 cursor-pointer font-medium"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{copiedId === listing.id ? 'Copié !' : 'Partager'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Voulez-vous supprimer cette annonce ?')) {
                            deleteFarmStandingListing(listing.id);
                          }
                        }}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-rose-50 rounded-lg transition active:scale-95 cursor-pointer p-1.5"
                        title="Supprimer l'annonce"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Post New Standing Crop Listing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-stone-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Trees className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-stone-900">
                  Publier une Récolte sur Pied (Prix à l'Hectare)
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Titre de l'Annonce *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Verger Clémentines Nadorcott sur pied (8 Hectares)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Catégorie de Culture *
                  </label>
                  <select
                    value={newCropCategory}
                    onChange={e => setNewCropCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {CROP_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Variété *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Nadorcott, Picholine, Spunta, Aswan..."
                    value={newVariety}
                    onChange={e => setNewVariety(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Surface & Price per Hectare (Highlight) */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-emerald-950 mb-1">
                    Superficie de la Parcelle (Hectares) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0.1}
                      step={0.1}
                      value={newSurfaceHectares}
                      onChange={e => setNewSurfaceHectares(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm font-bold border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-800">
                      Ha
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-emerald-950 mb-1">
                    Prix au Forfait par Hectare (MAD / Ha) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={100}
                      step={100}
                      value={newPricePerHa}
                      onChange={e => setNewPricePerHa(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm font-bold border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-800">
                      MAD / Ha
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-emerald-200 text-xs font-bold text-emerald-900">
                  <span>Montant Total Estimé de la Transaction :</span>
                  <span className="text-base font-black text-emerald-700">
                    {(newSurfaceHectares * newPricePerHa).toLocaleString()} MAD
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Région Agricole *
                  </label>
                  <select
                    value={newRegion}
                    onChange={e => setNewRegion(e.target.value as MoroccanRegion)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {MOROCCAN_REGIONS.map(reg => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Localisation / Commune / Périmètre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Périmètre Moulouya, Berkane"
                    value={newLocationDetails}
                    onChange={e => setNewLocationDetails(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Rendement Est. (T/ha)
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 35"
                    value={newEstimatedYieldPerHa}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewEstimatedYieldPerHa(val);
                      setNewEstimatedYieldTotal(val * newSurfaceHectares);
                    }}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Total Estimé (Tonnes)
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 280"
                    value={newEstimatedYieldTotal}
                    onChange={e => setNewEstimatedYieldTotal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Période de Récolte
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Décembre 2025"
                    value={newHarvestDate}
                    onChange={e => setNewHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Système d'Irrigation
                  </label>
                  <select
                    value={newIrrigation}
                    onChange={e => setNewIrrigation(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Goutte-à-goutte (Puits & Bassin)">Goutte-à-goutte (Puits & Bassin)</option>
                    <option value="Gravitaire (Tour d'eau)">Gravitaire (Tour d'eau / Barrage)</option>
                    <option value="Pivot / Aspersion">Pivot / Aspersion</option>
                    <option value="Bour (Pluvial)">Bour (Pluvial)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Modalité de Récolte
                  </label>
                  <select
                    value={newPicking}
                    onChange={e => setNewPicking(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Sur pied - Cueillette & transport à charge de l'acheteur">
                      Sur pied - Cueillette à charge acheteur
                    </option>
                    <option value="Vente négociable avec ouvriers">
                      Vente négociable avec ouvriers de la ferme
                    </option>
                    <option value="Récolté départ bord champ">
                      Récolté départ bord champ
                    </option>
                  </select>
                </div>
              </div>

              {/* Seller details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom du Producteur / Domaine *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Domaine Haj Mohamed"
                    value={newSellerName}
                    onChange={e => setNewSellerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+2126..."
                    value={newSellerPhone}
                    onChange={e => setNewSellerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Numéro WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="2126..."
                    value={newSellerWhatsapp}
                    onChange={e => setNewSellerWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email (Optionnel, pour contact Gmail)
                </label>
                <input
                  type="email"
                  placeholder="contact.agricole@gmail.com"
                  value={newSellerEmail}
                  onChange={e => setNewSellerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description & Détails de la Parcelle
                </label>
                <textarea
                  rows={3}
                  placeholder="Détails de l'état sanitaire, vigueur des arbres, calibre, accès pour camions..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  URL de la Photo de la Parcelle / Verger
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-stone-950 bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm transition"
                >
                  Publier l'Offre au Prix/Ha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
