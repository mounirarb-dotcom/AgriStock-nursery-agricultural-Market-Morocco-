import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  TrendingUp,
  Package,
  PackageOpen,
  Sprout,
  Store,
  Plus,
  ShieldCheck,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  User,
  Tractor,
  ShoppingCart,
  MessageSquare,
  Truck,
  Zap,
  Globe,
  Award,
  AlertTriangle,
  FileText,
  UserCheck,
  ArrowUpRight,
  Sparkles,
  Lock,
  ArrowRight,
  Filter,
  Check,
  Info,
  FileSpreadsheet,
  Search,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  Minus,
  Trees,
  Salad,
  Apple,
  X,
  AlertCircle,
  Camera,
  QrCode,
} from 'lucide-react';
import { BatchQRCodeModal } from './BatchQRCodeModal';
import { ProduceListingFormModal } from './ProduceListingFormModal';
import { NurseryLotFormModal } from './NurseryLotFormModal';
import { PhotoUploadCapture } from './PhotoUploadCapture';
import { SmartImage } from './SmartImage';
import { RoleAccessRestrictedNotice } from './RoleAccessRestrictedNotice';
import { ProduceListing, NurseryLot, FarmStandingListing, ProduceCategory } from '../types';

interface SellerDashboardViewProps {
  onScrollToInventory?: () => void;
  onOpenNewNurseryLot?: () => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  onScrollToInventory,
  onOpenNewNurseryLot,
}) => {
  const {
    language,
    userProfile,
    googleUser,
    canManageSeller,
    setUserRole,
    setIsIdentificationModalOpen,
    nurseryLots,
    addNurseryLot,
    updateNurseryLot,
    deleteNurseryLot,
    adjustStockQuantity,
    produceListings,
    addProduceListing,
    updateProduceListing,
    updateListingStatus,
    deleteProduceListing,
    farmStandingListings,
    addFarmStandingListing,
    updateFarmStandingListing,
    updateFarmStandingStatus,
    deleteFarmStandingListing,
    escrowTransactions,
    discussions,
    totalUnreadDiscussionsCount,
    setActiveTab,
    setIsEscrowListModalOpen,
    setIsDiscussionsListModalOpen,
    openLogisticsModal,
    openBoostModal,
    openExportManifestModal,
    setIsProModalOpen,
    openUserManual,
    lowStockLots,
    setIsLowStockSettingsModalOpen,
    setIsQuickSyncModalOpen,
    openExcelStockModal,
  } = useApp();

  if (!canManageSeller) {
    return (
      <RoleAccessRestrictedNotice
        requiredRole="seller"
        title={tr(
          language,
          'Espace Producteur & Vendeur Réservé',
          'فضاء خاص بالمنتجين والفلاحين البائعين',
          'Authorized Seller & Producer Workspace'
        )}
        description={tr(
          language,
          "Cet espace (mise en vente des récoltes, gestion des stocks bord champ, gestion des offres de gros) est réservé aux agriculteurs producteurs et coopératives vendeurs.",
          "هذا الفضاء مخصص للفلاحين والتعاونيات المنتجة لعرض المحاصيل وإدارة عروض البيع.",
          "This space is dedicated to agricultural producers and cooperative sellers to manage lots and wholesale offers."
        )}
      />
    );
  }

  const [showFirstTimeGuide, setShowFirstTimeGuide] = useState(() => {
    return localStorage.getItem('agrimaroc_seller_guide_dismissed') !== 'true';
  });
  const [isAddOfferMenuOpen, setIsAddOfferMenuOpen] = useState(false);
  const [isProduceModalOpen, setIsProduceModalOpen] = useState(false);
  const [isNurseryModalOpen, setIsNurseryModalOpen] = useState(false);
  const [stockCategoryForModal, setStockCategoryForModal] = useState<ProduceCategory>('Légume');

  // Dedicated Stock space states
  const [activeStockTab, setActiveStockTab] = useState<'all' | 'harvest' | 'standing' | 'nursery' | 'livestock'>('all');
  const [stockSearchTerm, setStockSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'Disponible' | 'Réservé' | 'Vendu'>('ALL');
  const [stockActionNotice, setStockActionNotice] = useState<string | null>(null);
  const [inlineEditingQtyId, setInlineEditingQtyId] = useState<string | null>(null);
  const [inlineEditingQtyVal, setInlineEditingQtyVal] = useState<string>('');

  // Quick photo capture / update target state
  const [photoEditTarget, setPhotoEditTarget] = useState<{
    type: 'produce' | 'nursery';
    id: string;
    title: string;
    category?: string;
    imageUrl: string;
    additionalImages?: string[];
  } | null>(null);
  const [selectedItemForQR, setSelectedItemForQR] = useState<ProduceListing | null>(null);

  const showNotice = (msg: string) => {
    setStockActionNotice(msg);
    setTimeout(() => setStockActionNotice(null), 3000);
  };

  const handleSaveStockPhotos = (newMainUrl: string, newAdditionalUrls: string[]) => {
    if (!photoEditTarget) return;
    if (photoEditTarget.type === 'produce') {
      updateProduceListing(photoEditTarget.id, {
        imageUrl: newMainUrl,
        additionalImages: newAdditionalUrls,
        isCustomPhoto: true,
      });
      showNotice(
        tr(
          language,
          'Photos du stock mises à jour avec succès !',
          'تم تحديث صور المخزون بنجاح!',
          'Stock photos updated successfully!'
        )
      );
    } else {
      updateNurseryLot(photoEditTarget.id, {
        imageUrl: newMainUrl,
        additionalImages: newAdditionalUrls,
        isCustomPhoto: true,
      });
      showNotice(
        tr(
          language,
          'Photos du lot de pépinière mises à jour avec succès !',
          'تم تحديث صور دفعة المشتل بنجاح!',
          'Nursery lot photos updated successfully!'
        )
      );
    }
    setPhotoEditTarget(null);
  };

  const handleAdjustProduceQty = (listing: ProduceListing, delta: number) => {
    const current = Number(listing.quantityAvailable) || 0;
    const nextVal = Math.max(0, current + delta);
    updateProduceListing(listing.id, {
      quantityAvailable: nextVal,
      status: nextVal === 0 ? 'Vendu' : listing.status === 'Vendu' ? 'Disponible' : listing.status,
    });
    showNotice(
      tr(
        language,
        `Stock mis à jour : ${listing.title} (${nextVal} ${listing.unit})`,
        `تم تحديث المخزون : ${listing.title} (${nextVal} ${listing.unit})`,
        `Stock updated: ${listing.title} (${nextVal} ${listing.unit})`
      )
    );
  };

  const handleSaveCustomProduceQty = (listing: ProduceListing) => {
    const val = parseFloat(inlineEditingQtyVal);
    if (!isNaN(val) && val >= 0) {
      updateProduceListing(listing.id, {
        quantityAvailable: val,
        status: val === 0 ? 'Vendu' : listing.status === 'Vendu' ? 'Disponible' : listing.status,
      });
      showNotice(
        tr(
          language,
          `Stock défini à ${val} ${listing.unit}`,
          `تم تحديد الكمية في ${val} ${listing.unit}`,
          `Stock set to ${val} ${listing.unit}`
        )
      );
    }
    setInlineEditingQtyId(null);
  };

  const handleAdjustNurseryQty = (lot: NurseryLot, delta: number) => {
    const current = Number(lot.quantityAvailable) || 0;
    const nextVal = Math.max(0, current + delta);
    updateNurseryLot(lot.id, { quantityAvailable: nextVal });
    showNotice(
      tr(
        language,
        `Stock de plants mis à jour : ${lot.variety} (${nextVal} plants)`,
        `تم تحديث شتلات ${lot.variety} إلى ${nextVal} شتلة`,
        `Plants stock updated: ${lot.variety} (${nextVal} plants)`
      )
    );
  };

  const handleDeleteProduce = (id: string, title: string) => {
    if (
      window.confirm(
        tr(
          language,
          `Êtes-vous sûr de vouloir supprimer l'offre "${title}" de vos stocks ?`,
          `هل أنت متأكد من حذف العرض "${title}" من مخزونك؟`,
          `Are you sure you want to delete "${title}" from your stock?`
        )
      )
    ) {
      deleteProduceListing(id);
      showNotice(tr(language, 'Offre supprimée du stock.', 'تم حذف العرض من المخزون.', 'Offer deleted from stock.'));
    }
  };

  const handleDeleteNursery = (id: string, title: string) => {
    if (
      window.confirm(
        tr(
          language,
          `Supprimer le lot de pépinière "${title}" ?`,
          `حذف دفعة الشتلات هذه؟`,
          `Delete this nursery lot?`
        )
      )
    ) {
      deleteNurseryLot(id);
      showNotice(tr(language, 'Lot de pépinière supprimé.', 'تم حذف الدفعة.', 'Nursery lot deleted.'));
    }
  };

  const handleDeleteStanding = (id: string, title: string) => {
    if (
      window.confirm(
        tr(
          language,
          `Supprimer l'offre de verger sur pied "${title}" ?`,
          `حذف عرض الحقل على رؤوس الأشجار؟`,
          `Delete this standing crop listing?`
        )
      )
    ) {
      deleteFarmStandingListing(id);
      showNotice(tr(language, 'Offre verger supprimée.', 'تم حذف العرض.', 'Standing crop deleted.'));
    }
  };

  const dismissFirstTimeGuide = () => {
    setShowFirstTimeGuide(false);
    localStorage.setItem('agrimaroc_seller_guide_dismissed', 'true');
  };

  // -------------------------------------------------------------
  // DÉTECTION ET VÉRIFICATION DE L'UTILISATEUR IDENTIFIÉ
  // -------------------------------------------------------------
  const isUserIdentified = useMemo(() => {
    return Boolean(
      userProfile.hasCompletedIdentification ||
      Boolean(googleUser?.uid) ||
      (userProfile.email && userProfile.email.trim().length > 0) ||
      (userProfile.phone && userProfile.phone.trim().length >= 9 && !userProfile.phone.endsWith('00000000')) ||
      (userProfile.companyName && userProfile.companyName.trim().length > 3)
    );
  }, [
    userProfile.hasCompletedIdentification,
    googleUser?.uid,
    userProfile.email,
    userProfile.phone,
    userProfile.companyName,
  ]);

  // -------------------------------------------------------------
  // FILTRAGE STRICT DES STOCKS DE L'UTILISATEUR IDENTIFIÉ
  // -------------------------------------------------------------
  const isItemOwnedByCurrentUser = useCallback(
    (item: {
      id?: string;
      userId?: string;
      sellerName?: string;
      sellerPhone?: string;
      sellerEmail?: string;
      phone?: string;
    }): boolean => {
      // 1. L'utilisateur DOIT être identifié pour afficher ses stocks personnels
      if (!isUserIdentified) {
        return false;
      }

      const activeUserId = userProfile.id || googleUser?.uid;
      const currentUserEmail = (userProfile.email || googleUser?.email || '').trim().toLowerCase();

      // 2. Si un userId est explicitement présent sur l'item
      // RÈGLE STRICTE : Si l'item a un propriétaire déclaré, il DOIT correspondre à l'utilisateur courant.
      if (item.userId) {
        return (
          item.userId === activeUserId ||
          item.userId === userProfile.id ||
          (Boolean(googleUser?.uid) && item.userId === googleUser?.uid)
        );
      }

      // 3. Les lots d'exemple du catalogue initial ne peuvent pas appartenir à l'utilisateur courant
      // (sauf s'ils ont son userId explicite ci-dessus)
      const sampleItemIds = new Set([
        'prod-01', 'prod-02', 'prod-03', 'prod-04', 'prod-05', 'prod-06', 'prod-07',
        'prod-08', 'prod-08b', 'prod-08c', 'prod-08d', 'prod-08e',
        'prod-11', 'prod-12', 'prod-13', 'prod-14',
        'lot-olv-01', 'lot-cit-02', 'lot-plm-03', 'lot-avc-04', 'lot-amd-06', 'lot-arg-05', 'lot-mar-06',
        'lot-orn-01', 'lot-orn-02', 'lot-orn-03', 'lot-orn-04', 'lot-orn-05', 'lot-orn-06',
        'lot-orn-07', 'lot-leg-01', 'lot-leg-02', 'lot-leg-03',
        'fsl-01', 'fsl-02', 'fsl-03', 'fsl-04', 'fsl-05'
      ]);
      if (item.id && sampleItemIds.has(item.id)) {
        return false;
      }

      // 4. Si l'item n'a pas de userId (cas d'éléments personnalisés ou importés sans userId) :
      // Vérifications STRICTES uniquement, JAMAIS de correspondances floues partielles :

      // a. Correspondance par Email STRICT
      if (currentUserEmail && item.sellerEmail) {
        if (currentUserEmail === item.sellerEmail.trim().toLowerCase()) {
          return true;
        }
      }

      // b. Correspondance par Téléphone STRICT (uniquement avec un numéro réel et non le placeholder par défaut)
      const userPhoneDigits = (userProfile.phone || '').replace(/\D/g, '');
      const itemPhoneDigits = (item.sellerPhone || item.phone || '').replace(/\D/g, '');
      const isPlaceholderPhone = !userPhoneDigits || userPhoneDigits === '212600000000' || userPhoneDigits.endsWith('00000000');
      if (!isPlaceholderPhone && userPhoneDigits.length >= 9 && itemPhoneDigits.length >= 9) {
        if (
          userPhoneDigits === itemPhoneDigits ||
          userPhoneDigits.endsWith(itemPhoneDigits.slice(-9)) ||
          itemPhoneDigits.endsWith(userPhoneDigits.slice(-9))
        ) {
          return true;
        }
      }

      // c. Correspondance par Nom ou Raison Sociale STRICT (égalité exacte uniquement, sans sous-chaînes partielles)
      const genericNames = [
        'exploitant agricole',
        'producteur maraîcher',
        'acheteur partenaire',
        'pépinière agréée',
        'agristock maroc siège',
        'agrimaroc',
        'agristock',
        'utilisateur',
      ];

      const userIdentities = [
        userProfile.companyName,
        userProfile.displayName,
        userProfile.sellerDetails?.farmName,
      ]
        .map((s) => (s || '').trim().toLowerCase())
        .filter((s) => s.length >= 4 && !genericNames.includes(s));

      const itemSeller = (item.sellerName || '').trim().toLowerCase();

      if (itemSeller && userIdentities.length > 0) {
        // Égalité EXACTE uniquement
        if (userIdentities.includes(itemSeller)) {
          return true;
        }
      }

      return false;
    },
    [
      isUserIdentified,
      userProfile.id,
      userProfile.displayName,
      userProfile.companyName,
      userProfile.phone,
      userProfile.email,
      userProfile.sellerDetails?.farmName,
      googleUser?.uid,
      googleUser?.email,
    ]
  );

  // Filtrage des stocks réservés à l'utilisateur vendeur identifié
  const myProduceListings = useMemo(
    () => produceListings.filter(isItemOwnedByCurrentUser),
    [produceListings, isItemOwnedByCurrentUser]
  );
  const myNurseryLots = useMemo(
    () => nurseryLots.filter(isItemOwnedByCurrentUser),
    [nurseryLots, isItemOwnedByCurrentUser]
  );
  const myFarmStandingListings = useMemo(
    () => farmStandingListings.filter(isItemOwnedByCurrentUser),
    [farmStandingListings, isItemOwnedByCurrentUser]
  );

  // Separated stock lists
  const harvestListings = useMemo(
    () => myProduceListings.filter((p) => p.category !== 'Élevage & Bétail'),
    [myProduceListings]
  );
  const livestockListings = useMemo(
    () => myProduceListings.filter((p) => p.category === 'Élevage & Bétail'),
    [myProduceListings]
  );
  const standingListings = myFarmStandingListings;
  const nurseryItems = myNurseryLots;

  // -------------------------------------------------------------
  // 1. CALCULS STATISTIQUES "MON ACTIVITÉ" (STOCKS PERSONNELS)
  // -------------------------------------------------------------
  // Active Listings count
  const activeNurseryCount = myNurseryLots.length;
  const activeHarvestedCount = myProduceListings.filter(
    (item) => item.status === 'Disponible' || item.status === 'Réservé'
  ).length;
  const activeStandingCount = myFarmStandingListings.filter(
    (item) => item.status === 'Disponible' || item.status === 'En négociation'
  ).length;
  const totalActiveListings = activeNurseryCount + activeHarvestedCount + activeStandingCount;

  // Available plants & volumes de l'utilisateur
  const availablePlantsCount = myNurseryLots.reduce(
    (acc, lot) => acc + (lot.quantityAvailable || 0),
    0
  );
  const availableTonnes = myProduceListings
    .filter((p) => p.unit === 'Tonnes' && p.status === 'Disponible')
    .reduce((acc, p) => acc + (p.quantityAvailable || 0), 0);

  // Commandes (Escrow & direct)
  const ordersInProgress = escrowTransactions.filter(
    (t) => t.status === 'funds_held' || t.status === 'in_transit' || t.status === 'delivered'
  );
  const ordersCompleted = escrowTransactions.filter((t) => t.status === 'released');
  // Dynamic or realistic fallback counts if user is exploring sample data
  const countInProgress = ordersInProgress.length;
  const countCompleted = ordersCompleted.length;

  // Ventes Chiffre d'Affaires (MAD)
  const realCompletedSalesMAD = ordersCompleted.reduce(
    (acc, t) => acc + (t.sellerPayoutAmountMAD || t.subtotalAmountMAD || 0),
    0
  );
  const estimatedStockValueMAD =
    myProduceListings.reduce(
      (sum, h) => sum + (h.quantityAvailable || 0) * (h.pricePerUnitMAD || 0),
      0
    ) +
    myNurseryLots.reduce(
      (sum, n) => sum + (n.quantityAvailable || 0) * (n.unitPriceMAD || 0),
      0
    );
  const displaySalesMAD = realCompletedSalesMAD;

  // Demandes Reçues (Discussions / Négociations)
  const totalDiscussionsCount = Object.keys(discussions).length;
  const displayNewInquiries =
    totalUnreadDiscussionsCount > 0
      ? totalUnreadDiscussionsCount
      : totalDiscussionsCount;

  const isSeller = userProfile.role === 'seller';

  // Listes filtrées pour l'affichage selon onglet et recherche
  const filteredUserProduce = useMemo(() => {
    if (activeStockTab !== 'all' && activeStockTab !== 'harvest' && activeStockTab !== 'livestock') {
      return [];
    }
    return myProduceListings.filter((item) => {
      if (activeStockTab === 'harvest' && item.category === 'Élevage & Bétail') return false;
      if (activeStockTab === 'livestock' && item.category !== 'Élevage & Bétail') return false;
      if (stockStatusFilter !== 'ALL' && item.status !== stockStatusFilter) return false;
      if (stockSearchTerm) {
        const q = stockSearchTerm.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.variety.toLowerCase().includes(q) ||
          (item.batchNumber && item.batchNumber.toLowerCase().includes(q)) ||
          (item.locationCity && item.locationCity.toLowerCase().includes(q)) ||
          item.region.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [myProduceListings, activeStockTab, stockStatusFilter, stockSearchTerm]);

  const filteredUserNursery = useMemo(() => {
    if (activeStockTab !== 'all' && activeStockTab !== 'nursery') {
      return [];
    }
    return myNurseryLots.filter((lot) => {
      if (stockSearchTerm) {
        const q = stockSearchTerm.toLowerCase();
        const match =
          lot.species.toLowerCase().includes(q) ||
          lot.variety.toLowerCase().includes(q) ||
          (lot.batchNumber && lot.batchNumber.toLowerCase().includes(q)) ||
          (lot.rootstock && lot.rootstock.toLowerCase().includes(q)) ||
          lot.region.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [myNurseryLots, activeStockTab, stockSearchTerm]);

  const filteredUserStanding = useMemo(() => {
    if (activeStockTab !== 'all' && activeStockTab !== 'standing') {
      return [];
    }
    return myFarmStandingListings.filter((item) => {
      if (stockStatusFilter !== 'ALL' && item.status !== stockStatusFilter) return false;
      if (stockSearchTerm) {
        const q = stockSearchTerm.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.variety.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [myFarmStandingListings, activeStockTab, stockStatusFilter, stockSearchTerm]);

  const totalUserFilteredCount =
    filteredUserProduce.length + filteredUserNursery.length + filteredUserStanding.length;

  const scrollToStocks = () => {
    const el = document.getElementById('seller-stocks-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onScrollToInventory) {
      onScrollToInventory();
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* HEADER TABLEAU DE BORD VENDEUR & GUIDAGE PREMIÈRE VISITE   */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-[#0c2619] via-[#103322] to-[#07190f] text-white p-5 sm:p-7 rounded-3xl shadow-md border border-[#1b4e35] relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {tr(language, 'Espace Vendeur & Exploitant', 'فضاء البائع والمنتج الفلاحي', 'Seller & Grower Hub')}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                <ShieldCheck className="w-3 h-3" />
                {tr(language, 'Transactions Séquestre CMI', 'معاملات بنكية مؤمنة', 'Secured Escrow Trade')}
              </span>
              {userProfile.region && (
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-300">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {userProfile.region.split('(')[0].trim()}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {tr(
                language,
                'Tableau de Bord Vendeur',
                'لوحة تحكم البائع والمنتج',
                'Seller Activity Dashboard'
              )}
            </h1>

            <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed">
              {tr(
                language,
                'Pilotez vos stocks de pépinières, vos récoltes de fruits et légumes, vos commandes sécurisées et vos expéditions au Maroc.',
                'تتبع مخزون مشتلك، ومحاصيلك من الخضر والفواكه، والطلبيات المؤمنة، وشحنات النقل في المغرب.',
                'Manage your nursery inventories, harvested produce, secure orders and agricultural logistics across Morocco.'
              )}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* Add Offer Dropdown */}
            <div className="relative">
              <button
                id="btn-seller-add-offer-top"
                type="button"
                onClick={() => setIsAddOfferMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-stone-950" />
                <span>{tr(language, 'Ajouter une offre', 'إضافة عرض جديد', 'Add New Offer')}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isAddOfferMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsAddOfferMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsNurseryModalOpen(true);
                      setIsAddOfferMenuOpen(false);
                    }}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-stone-800 text-left transition group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-stone-950 transition">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white">
                        {tr(language, 'Lot de Pépinière', 'دفعة مشتل / شتلات', 'Nursery Stock Lot')}
                      </span>
                      <span className="block text-[10px] text-stone-400">
                        {tr(
                          language,
                          'Plants maraîchers, arbres fruitiers, ornemental',
                          'أشجار، شتلات خضار، نباتات زينة',
                          'Fruit trees, vegetable plants, ornamental'
                        )}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStockCategoryForModal('Légume');
                      setIsProduceModalOpen(true);
                      setIsAddOfferMenuOpen(false);
                    }}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-stone-800 text-left transition group mt-1 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950 transition">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white">
                        {tr(
                          language,
                          'Annonce Récolte / Fruits & Légumes',
                          'محصول فلاحي / خضر وفواكه',
                          'Harvest Produce Listing'
                        )}
                      </span>
                      <span className="block text-[10px] text-stone-400">
                        {tr(
                          language,
                          'Lots récoltés (tonnes) ou vente sur pied (ha)',
                          'محاصيل مجمعة أو بيع على رؤوس أشجارها',
                          'Harvested tonnage or standing crop per hectare'
                        )}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStockCategoryForModal('Élevage & Bétail');
                      setIsProduceModalOpen(true);
                      setIsAddOfferMenuOpen(false);
                    }}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-stone-800 text-left transition group mt-1 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-stone-950 transition">
                      <Tractor className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white">
                        {tr(language, 'Élevage & Bétail', 'تربية المواشي والأنعام', 'Livestock & Cattle')}
                      </span>
                      <span className="block text-[10px] text-stone-400">
                        {tr(language, 'Ovins, Bovins, Caprins certifiés', 'أغنام، أبقار وماعز معتمدة', 'Certified cattle & sheep')}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => openExcelStockModal('produce')}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-stone-800 text-left transition group mt-1 cursor-pointer border-t border-stone-800/80"
                  >
                    <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-stone-950 transition">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white">
                        {tr(language, 'Bases Excel & Import Lots', 'استيراد جماعي عبر إكسيل', 'Excel Stock & Bulk Import')}
                      </span>
                      <span className="block text-[10px] text-teal-300">
                        {tr(
                          language,
                          'Fichier .xlsx prérempli ou import de récoltes en masse',
                          'تحميل قالب إكسيل أو استيراد جماعي',
                          '.xlsx template or bulk harvest import'
                        )}
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Excel Import/Export Button */}
            <button
              id="btn-seller-excel-bulk"
              type="button"
              onClick={() => openExcelStockModal('produce')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-500/40 transition cursor-pointer"
              title={tr(language, 'Bases de données Excel Stock & Import en masse', 'قواعد بيانات المخزون إكسيل والاستيراد الجماعي', 'Excel Stock Databases & Bulk Import')}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Excel Stock</span>
            </button>

            {/* Quick Profile & Role Switch */}
            <button
              id="btn-seller-profile"
              type="button"
              onClick={() => setIsIdentificationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-bold border border-white/15 transition cursor-pointer"
              title={tr(language, 'Mon profil exploitation', 'ملف المستغل الفلاحي', 'My farm profile')}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>{userProfile.displayName || tr(language, 'Profil', 'الملف', 'Profile')}</span>
            </button>

            {/* Sélecteur rapide des autres espaces métiers */}
            <div className="flex items-center gap-1 p-1 bg-stone-900/60 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={() => {
                  setUserRole('buyer');
                  setActiveTab('buyer_space');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-stone-950 font-bold text-xs transition cursor-pointer"
                title="Espace Acheteur"
              >
                🛒 Acheteur
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserRole('nursery');
                  setActiveTab('nursery_space');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-stone-950 font-bold text-xs transition cursor-pointer"
                title="Espace Pépiniériste"
              >
                🌱 Pépinière
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserRole('carrier');
                  setActiveTab('carrier_space');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-200 hover:text-stone-950 font-bold text-xs transition cursor-pointer"
                title="Espace Transporteur"
              >
                🚛 Fret
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ENCADRÉ « NOUVEAU VENDEUR ? QUE DOIS-JE FAIRE MAINTENANT ? » */}
        {/* ========================================================= */}
        {showFirstTimeGuide && (
          <div className="mt-5 pt-4 border-t border-white/10 relative">
            <button
              type="button"
              onClick={dismissFirstTimeGuide}
              className="absolute top-4 right-0 text-stone-400 hover:text-white p-1 text-xs cursor-pointer"
              title={tr(language, 'Masquer ce guide', 'إخفاء هذا الدليل', 'Hide guide')}
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-xs sm:text-sm font-bold text-amber-300">
                {tr(
                  language,
                  '👋 Première fois sur AgriStock Maroc ? Voici vos 3 étapes clés :',
                  '👋 لأول مرة على منصة AgriStock؟ إليك الخطوات الثلاث للبدء :',
                  '👋 First time as a seller? Here are your 3 key starting steps:'
                )}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-stone-200">
              <div className="bg-black/30 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-white block">
                    {tr(language, 'Publiez votre offre', 'انشر أول عرض', 'Publish your first offer')}
                  </strong>
                  <span className="text-[11px] text-stone-300">
                    {tr(
                      language,
                      'Renseignez vos plants ou tonnes récoltées avec prix et région.',
                      'سجل شتلاتك أو أطنان محاصيلك مع تحديد السعر والمنطقة.',
                      'List your seedlings or harvested produce with price and region.'
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-white block">
                    {tr(language, 'Recevez des demandes en direct', 'استقبل طلبات المشترين', 'Receive direct buyer inquiries')}
                  </strong>
                  <span className="text-[11px] text-stone-300">
                    {tr(
                      language,
                      'Discutez en direct avec pépiniéristes, grossistes et acheteurs.',
                      'تواصل فوراً وتفاوض مع التجار والمشترين المعتمدين.',
                      'Chat and negotiate directly with accredited buyers and wholesalers.'
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-white block">
                    {tr(language, 'Encaissez en Séquestre Garanti', 'اقبض أموالك بأمان', 'Get paid via Secured Escrow')}
                  </strong>
                  <span className="text-[11px] text-stone-300">
                    {tr(
                      language,
                      'Le paiement de l\'acheteur est bloqué avant départ du camion.',
                      'يتم حجز ثمن الشحنة في الحساب البنكي الوسيط قبل خروج الشاحنة.',
                      'Buyer funds are securely locked in escrow before the truck departs.'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 🟢 NIVEAU 1 : MON ACTIVITÉ (HIÉRARCHIE CLAIRE & SYNTHÈSE)   */}
      {/* ========================================================= */}
      <section className="space-y-3" aria-labelledby="heading-mon-activite">
        <div className="flex items-center justify-between pb-1 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <h2
              id="heading-mon-activite"
              className="text-lg sm:text-xl font-black text-stone-900 tracking-tight flex items-center gap-2"
            >
              <span>{tr(language, 'Mon activité', 'نشاطي التجاري', 'My Activity')}</span>
            </h2>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {tr(language, 'Mise à jour en direct', 'محدث آنياً', 'Live real-time status')}
          </span>
        </div>

        {/* 4 Cards Bento : Stocks, Commandes, Ventes, Demandes Reçues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARTE 1 : STOCKS */}
          <div
            id="card-seller-activity-stocks"
            onClick={scrollToStocks}
            className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  {tr(language, 'Stocks', 'المخزون والعروض', 'Stocks & Lots')}
                </span>
                <div className="mt-2">
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    {totalActiveListings}{' '}
                    <span className="text-sm font-bold text-stone-500">
                      {tr(language, 'annonces actives', 'إعلان نشط', 'active listings')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>
                      {availablePlantsCount.toLocaleString()}{' '}
                      {tr(language, 'plants disponibles', 'شتلة متوفرة', 'plants available')}
                    </span>
                  </div>
                  {availableTonnes > 0 && (
                    <div className="text-[11px] font-medium text-stone-500 mt-0.5">
                      + {availableTonnes} {tr(language, 'tonnes récoltées', 'طن محاصيل', 'tons harvested')}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 group-hover:text-emerald-700 font-bold">
              <span>{tr(language, 'Consulter mes stocks', 'عرض تفاصيل المخزون', 'View inventory')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* CARTE 2 : COMMANDES */}
          <div
            id="card-seller-activity-orders"
            onClick={() => setIsEscrowListModalOpen(true)}
            className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                  {tr(language, 'Commandes', 'الطلبيات والمعاملات', 'Orders & Escrow')}
                </span>
                <div className="mt-2">
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    {countInProgress}{' '}
                    <span className="text-sm font-bold text-amber-600">
                      {tr(language, 'en cours', 'قيد التنفيذ', 'in progress')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-stone-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {countCompleted}{' '}
                      {tr(language, 'terminées', 'مكتملة ومسلمة', 'completed')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 group-hover:text-amber-700 font-bold">
              <span>{tr(language, 'Suivre les livraisons', 'متابعة الشحن والتسليم', 'Track shipments')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* CARTE 3 : VENTES */}
          <div
            id="card-seller-activity-sales"
            onClick={() => setIsEscrowListModalOpen(true)}
            className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-sky-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-sky-600" />
                  {tr(language, 'Ventes', 'المبيعات المحققة', 'Sales & Revenue')}
                </span>
                <div className="mt-2">
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 flex items-baseline gap-1">
                    <span>{displaySalesMAD.toLocaleString()}</span>
                    <span className="text-xs font-black text-stone-500">MAD</span>
                  </div>
                  <div className="text-xs font-semibold text-sky-700 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    <span>
                      {tr(language, 'Règlement 100% garanti', 'أداء مضمون 100%', '100% Guaranteed payment')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 group-hover:text-sky-700 font-bold">
              <span>{tr(language, 'Historique des paiements', 'سجل المدفوعات', 'Payment history')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* CARTE 4 : DEMANDES REÇUES */}
          <div
            id="card-seller-activity-inquiries"
            onClick={() => setIsDiscussionsListModalOpen(true)}
            className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-purple-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  {tr(language, 'Demandes reçues', 'الطلبات والرسائل', 'Inquiries Received')}
                </span>
                <div className="mt-2">
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 flex items-baseline gap-2">
                    <span>{displayNewInquiries}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {tr(language, 'nouvelles', 'جديدة', 'new')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-stone-500 mt-1">
                    {tr(
                      language,
                      'Négociations & offres d\'achat',
                      'مفاوضات وعروض شراء مباشرة',
                      'Negotiations & purchase offers'
                    )}
                  </div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 group-hover:text-purple-700 font-bold">
              <span>{tr(language, 'Ouvrir les discussions', 'فتح المحادثات', 'Open discussions')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 🟢 NIVEAU 2 : MES OUTILS (ERGONOMIE & ACCÈS DIRECT)         */}
      {/* ========================================================= */}
      <section className="space-y-3" aria-labelledby="heading-mes-outils">
        <div className="flex items-center justify-between pb-1 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <h2
              id="heading-mes-outils"
              className="text-lg sm:text-xl font-black text-stone-900 tracking-tight"
            >
              {tr(language, 'Mes outils', 'أدواتي اليومية', 'My Tools')}
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {tr(language, 'Actions quotidiennes du vendeur', 'العمليات اليومية للبائع', 'Daily seller operations')}
          </span>
        </div>

        {/* 5 Outils Essentiels : Stocks, Nouvelle offre, Messages, Transport, Paiements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* OUTIL 1 : GÉRER MES STOCKS */}
          <button
            id="tool-manage-stocks"
            type="button"
            onClick={scrollToStocks}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/40 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between group active:scale-[0.98] cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-700 group-hover:text-white transition">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-900">
                {tr(language, 'Gérer mes stocks', 'إدارة المخزون', 'Manage Stocks')}
              </h3>
              <p className="text-[11px] text-stone-500 leading-snug">
                {tr(
                  language,
                  'Inventaire, fiches lots, passeports et quantités',
                  'الجرد، تعديل الكميات، جواز الصحة النباتية',
                  'Inventory, batch sheets, passports & counts'
                )}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
              <span>{tr(language, 'Accéder', 'دخول', 'Access')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* OUTIL 2 : AJOUTER UNE NOUVELLE OFFRE */}
          <button
            id="tool-add-offer"
            type="button"
            onClick={() => setIsAddOfferMenuOpen(true)}
            className="p-4 rounded-2xl bg-emerald-800 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md transition text-left flex flex-col justify-between group active:scale-[0.98] cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">
                {tr(language, 'Ajouter une offre', 'إضافة عرض جديد', 'Add New Offer')}
              </h3>
              <p className="text-[11px] text-emerald-100/80 leading-snug">
                {tr(
                  language,
                  'Publier un lot de pépinière ou une récolte maraîchère',
                  'نشر شتلات جديدة أو محاصيل خضر وفواكه',
                  'Publish nursery plants or harvested crops'
                )}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-700/60 flex items-center justify-between text-[11px] font-bold text-emerald-200">
              <span>{tr(language, 'Créer', 'إنشاء', 'Create')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* OUTIL 3 : MESSAGES */}
          <button
            id="tool-open-messages"
            type="button"
            onClick={() => setIsDiscussionsListModalOpen(true)}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-purple-500 hover:bg-purple-50/40 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between group active:scale-[0.98] cursor-pointer relative"
          >
            {totalUnreadDiscussionsCount > 0 && (
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[10px] shadow-xs">
                {totalUnreadDiscussionsCount}
              </span>
            )}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-700 group-hover:text-white transition">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-purple-900">
                {tr(language, 'Messages', 'الرسائل والمحادثات', 'Messages')}
              </h3>
              <p className="text-[11px] text-stone-500 leading-snug">
                {tr(
                  language,
                  'Discussions et négociations avec les acheteurs',
                  'التواصل المباشر والمفاوضات مع الزبناء',
                  'Direct chats and negotiations with buyers'
                )}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-purple-700">
              <span>{tr(language, 'Ouvrir', 'فتح', 'Open')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* OUTIL 4 : TRANSPORT */}
          <button
            id="tool-open-transport"
            type="button"
            onClick={() => openLogisticsModal()}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-500 hover:bg-amber-50/40 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between group active:scale-[0.98] cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-amber-900">
                {tr(language, 'Transport', 'الشحن والنقل', 'Logistics & Transport')}
              </h3>
              <p className="text-[11px] text-stone-500 leading-snug">
                {tr(
                  language,
                  'Fret agricole, camions frigo TIR et plateaux',
                  'حساب تكلفة الشاحنات المبردة والنقل الفلاحي',
                  'Freight calculator, refrigerated TIR trucks'
                )}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
              <span>{tr(language, 'Calculer', 'حساب', 'Calculate')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* OUTIL 5 : PAIEMENTS */}
          <button
            id="tool-open-payments"
            type="button"
            onClick={() => setIsEscrowListModalOpen(true)}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-sky-500 hover:bg-sky-50/40 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between group active:scale-[0.98] cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-sky-600 group-hover:text-white transition">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-sky-900">
                {tr(language, 'Paiements', 'الأداء والتحويلات', 'Payments')}
              </h3>
              <p className="text-[11px] text-stone-500 leading-snug">
                {tr(
                  language,
                  'Suivi des encaissements et déblocages séquestre',
                  'متابعة الحوالات البنكية والإفراج عن الأموال',
                  'Escrow releases, bank payouts and receipts'
                )}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-sky-700">
              <span>{tr(language, 'Consulter', 'معاينة', 'Check')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 📦 NIVEAU 2.5 : ESPACE STOCKS & OFFRES PUBLIÉES            */}
      {/* ========================================================= */}
      <section id="seller-stocks-section" className="space-y-4 pt-4 border-t border-stone-200" aria-labelledby="heading-seller-stocks">
        {/* En-tête de section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              <Package className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="heading-seller-stocks" className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                  {tr(language, 'Mon Espace Stocks & Offres Publiées', 'فضاء مخزوني وعروضي المنشورة', 'My Stock Inventory & Published Offers')}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {harvestListings.length + livestockListings.length + standingListings.length + nurseryItems.length} {tr(language, 'lots personnels', 'دفعات خاصة', 'personal lots')}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {isUserIdentified && (userProfile.companyName || userProfile.displayName)
                  ? tr(
                      language,
                      `Affichage exclusif des stocks de : ${userProfile.companyName || userProfile.displayName} (les stocks des autres producteurs sont masqués)`,
                      `عرض حصري لمخزون : ${userProfile.companyName || userProfile.displayName} (عروض المنتجين الآخرين محجوبة)`,
                      `Exclusive view of stocks for : ${userProfile.companyName || userProfile.displayName} (other producers' stock hidden)`
                    )
                  : tr(
                      language,
                      'Affichage exclusif des stocks de l’utilisateur identifié (les offres des autres producteurs restent sur le marché public)',
                      'عرض حصري لمخزون المستخدم المعرف به فقط (عروض المنتجين الآخرين معروضة في السوق العام)',
                      'Exclusive view of identified user stocks only (other producers remain in the public marketplace)'
                    )}
              </p>
            </div>
          </div>

          {/* Boutons d'ajout rapide */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-stock-add-harvest"
              type="button"
              onClick={() => {
                setStockCategoryForModal('Légume');
                setIsProduceModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{tr(language, '+ Récolte / Fruits & Légumes', '+ محصول / خضر وفواكه', '+ Harvest Crop')}</span>
            </button>

            <button
              id="btn-stock-add-livestock"
              type="button"
              onClick={() => {
                setStockCategoryForModal('Élevage & Bétail');
                setIsProduceModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Tractor className="w-4 h-4" />
              <span>{tr(language, '+ Élevage & Bétail', '+ مواشي وأنعام', '+ Livestock')}</span>
            </button>

            <button
              id="btn-stock-add-nursery"
              type="button"
              onClick={() => setIsNurseryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-300 font-bold text-xs border border-emerald-600/40 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>{tr(language, '+ Lot Pépinière', '+ دفعة مشتل', '+ Nursery Lot')}</span>
            </button>

            <button
              id="btn-stock-excel"
              type="button"
              onClick={() => openExcelStockModal('produce')}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs border border-stone-300 shadow-xs transition cursor-pointer"
              title="Importer ou exporter votre base Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>

        {/* Alerte si utilisateur non identifié */}
        {!isUserIdentified && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                  {tr(
                    language,
                    'Identification requise : Seuls les stocks de l’utilisateur identifié s’affichent ici',
                    'التعريف بالحساب مطلوب: يظهر هنا فقط مخزون المستخدم المعرف به',
                    'Identification required: Only identified user stocks are displayed here'
                  )}
                </h4>
                <p className="text-[11px] sm:text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                  {tr(
                    language,
                    'Pour garantir la confidentialité commerciale et la traçabilité des transactions, les stocks des autres producteurs sont masqués dans cet espace privé. Identifiez votre exploitation ou connectez-vous pour visualiser et administrer vos propres récoltes et plants.',
                    'حفاظاً على سرية المعاملات التجارية بين المنتجين، يتم حجب عروض المنتجين الآخرين في هذا الفضاء الخاص. يرجى التعريف بمستغلتك لإدارة محاصيلك الشخصية.',
                    'To ensure commercial confidentiality and transaction traceability, other growers’ listings are hidden in this private workspace. Identify your farm or sign in to manage your own crops and lots.'
                  )}
                </p>
              </div>
            </div>
            <button
              id="btn-seller-stocks-identify-banner"
              type="button"
              onClick={() => setIsIdentificationModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 self-start sm:self-center active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>{tr(language, 'M’identifier comme exploitant', 'التعريف بمستغلتي', 'Identify my farm')}</span>
            </button>
          </div>
        )}

        {/* Photo Creation Highlight Banner */}
        <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-emerald-950">
                📸 {tr(language, 'Prise de vue & insertion de photos intégrées', 'التقاط وإدراج الصور متوفر مباشرة عند إنشاء وتحديث المخزون', 'Photo capture & gallery insertion enabled')}
              </span>
              <span className="block text-[11px] text-stone-600">
                {tr(
                  language,
                  'Photographiez en direct avec votre smartphone ou insérez vos photos de parcelles, cagettes ou étiquettes ONSSA.',
                  'التقط صوراً حية بكاميرا هاتفك أو أدرج صوراً من المعرض لإبراز جودة منتوجك.',
                  'Take live smartphone camera photos or insert gallery photos of your crops, crates or ONSSA labels.'
                )}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
              ✓ {tr(language, 'Appareil photo direct', 'كاميرا مباشرة', 'Direct Camera')}
            </span>
            <span className="text-[10px] font-bold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-300 shadow-2xs">
              ✓ {tr(language, 'Galerie locale', 'معرض الصور', 'Local Gallery')}
            </span>
          </div>
        </div>

        {/* Floating action notification */}
        {stockActionNotice && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{stockActionNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setStockActionNotice(null)}
              className="p-1 text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Synthèse visuelle des stocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              {tr(language, 'Récoltes Maraîchères', 'محاصيل الخضر والفواكه', 'Harvest Produce')}
            </span>
            <div className="text-xl font-black text-stone-900">
              {harvestListings.length}{' '}
              <span className="text-xs font-bold text-stone-500">
                ({availableTonnes} T)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              {tr(language, 'Plants de Pépinière', 'شتائل المشاتل', 'Nursery Plants')}
            </span>
            <div className="text-xl font-black text-emerald-800">
              {nurseryItems.length}{' '}
              <span className="text-xs font-bold text-emerald-600">
                ({availablePlantsCount.toLocaleString()} plants)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              {tr(language, 'Vergers sur pied', 'غلات على رؤوس أشجارها', 'Standing Crops')}
            </span>
            <div className="text-xl font-black text-stone-900">
              {standingListings.length}{' '}
              <span className="text-xs font-bold text-stone-500">
                ({standingListings.reduce((sum, s) => sum + (s.surfaceHectares || 0), 0)} ha)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              {tr(language, 'Valeur Estimée Stock', 'القيمة التقديرية للمخزون', 'Estimated Stock Value')}
            </span>
            <div className="text-xl font-black text-amber-700">
              {(
                harvestListings.reduce((sum, h) => sum + (h.quantityAvailable || 0) * (h.pricePerUnitMAD || 0), 0) +
                nurseryItems.reduce((sum, n) => sum + (n.quantityAvailable || 0) * (n.unitPriceMAD || 0), 0)
              ).toLocaleString()}{' '}
              <span className="text-xs font-bold text-stone-500">MAD</span>
            </div>
          </div>
        </div>

        {/* Barre d'onglets de catégories adaptées au vendeur */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-stone-100 border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveStockTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeStockTab === 'all'
                ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🏷️</span>
            <span>{tr(language, 'Toutes mes offres', 'كل العروض', 'All Stock')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono">
              {harvestListings.length + livestockListings.length + standingListings.length + nurseryItems.length}
            </span>
          </button>

          <button
            id="btn-stock-tab-harvest"
            type="button"
            onClick={() => setActiveStockTab('harvest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeStockTab === 'harvest'
                ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🌾</span>
            <span>{tr(language, 'Récoltes & Maraîchage', 'محاصيل وخضر', 'Harvest Crops')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono">
              {harvestListings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStockTab('standing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeStockTab === 'standing'
                ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🌳</span>
            <span>{tr(language, 'Vergers sur pied', 'غلات على أشجارها', 'Standing Crops')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono">
              {standingListings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStockTab('nursery')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeStockTab === 'nursery'
                ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🌱</span>
            <span>{tr(language, 'Lots Pépinière (Plants)', 'شتائل المشاتل', 'Nursery Lots')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono">
              {nurseryItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStockTab('livestock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeStockTab === 'livestock'
                ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🐑</span>
            <span>{tr(language, 'Élevage & Bétail', 'تربية المواشي', 'Livestock')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono">
              {livestockListings.length}
            </span>
          </button>
        </div>

        {/* Barre de Recherche et Filtres par Statut */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={stockSearchTerm}
              onChange={(e) => setStockSearchTerm(e.target.value)}
              placeholder={tr(
                language,
                'Rechercher dans mes stocks (variété, n° lot, ville, catégorie)...',
                'البحث في مخزوني (الصنف، رقم الدفعة، المدينة...)...',
                'Search in stock (variety, lot number, city...)...'
              )}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {stockSearchTerm && (
              <button
                type="button"
                onClick={() => setStockSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtres statut : Tous, Disponible, Réservé, Vendu */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs shrink-0 overflow-x-auto">
            {(['ALL', 'Disponible', 'Réservé', 'Vendu'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStockStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] whitespace-nowrap ${
                  stockStatusFilter === st
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st === 'ALL'
                  ? tr(language, 'Tous', 'الكل', 'All')
                  : st === 'Disponible'
                  ? tr(language, 'En vente', 'متوفر', 'Available')
                  : st === 'Réservé'
                  ? tr(language, 'Réservé', 'محجوز', 'Reserved')
                  : tr(language, 'Vendu / Épuisé', 'تم البيع', 'Sold')}
              </button>
            ))}
          </div>
        </div>

        {/* LISTE DES LOTS & OFFRES DU VENDEUR */}
        <div className="space-y-3">
          {/* 1. PRODUCE / HARVEST & LIVESTOCK ITEMS */}
          {filteredUserProduce.map((item) => {
                const isLow = (item.quantityAvailable || 0) <= (item.unit === 'Tonnes' ? 3 : 20);
                const isEditing = inlineEditingQtyId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 shadow-2xs transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Photo & infos lot */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="relative group shrink-0">
                          <SmartImage
                            src={item.imageUrl}
                            alt={item.title}
                            category={item.category}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-stone-200 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPhotoEditTarget({
                                type: 'produce',
                                id: item.id,
                                title: item.title,
                                category: item.category,
                                imageUrl: item.imageUrl,
                                additionalImages: item.additionalImages || [],
                              })
                            }
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white transition-opacity cursor-pointer backdrop-blur-xs"
                            title={tr(language, 'Prendre ou modifier les photos', 'التقاط أو تعديل الصور', 'Take or update photos')}
                          >
                            <Camera className="w-4 h-4" />
                            <span className="text-[8px] font-bold mt-0.5">Photos</span>
                          </button>
                          {item.additionalImages && item.additionalImages.length > 0 && (
                            <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded-md bg-black/75 text-white font-bold text-[8px]">
                              +{item.additionalImages.length + 1}
                            </span>
                          )}
                          {(item.isCustomPhoto || item.imageUrl?.startsWith('data:')) && (
                            <span className="absolute top-1 left-1 px-1 py-0.2 rounded-md bg-emerald-700/90 text-white font-bold text-[8px] flex items-center gap-0.5">
                              <Camera className="w-2 h-2" />
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                item.category === 'Élevage & Bétail'
                                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                  : item.category === 'Fruit'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {item.category}
                            </span>
                            {item.batchNumber && (
                              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold text-stone-600 bg-stone-100 border border-stone-200">
                                {item.batchNumber}
                              </span>
                            )}
                            {item.isFeatured && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-400 text-stone-950 flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-stone-950" />
                                Boosté
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                            {item.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                            <span className="font-medium text-stone-700">{item.variety}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              {item.locationCity || item.region}
                            </span>
                            {item.harvestDate && (
                              <>
                                <span>•</span>
                                <span className="text-[11px]">
                                  {tr(language, 'Récolte :', 'الجني :', 'Harvest :')} {item.harvestDate}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stock & Prix */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 bg-stone-50 sm:bg-transparent p-2 sm:p-0 rounded-xl shrink-0">
                        {/* Stepper de stock interactif */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustProduceQty(item, item.unit === 'Tonnes' ? -1 : -5)}
                            className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-black transition active:scale-90 cursor-pointer"
                            title="Diminuer stock"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                autoFocus
                                value={inlineEditingQtyVal}
                                onChange={(e) => setInlineEditingQtyVal(e.target.value)}
                                className="w-16 px-1.5 py-0.5 rounded border border-emerald-500 text-center font-black text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveCustomProduceQty(item)}
                                className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-600"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setInlineEditingQtyId(item.id);
                                setInlineEditingQtyVal(String(item.quantityAvailable || 0));
                              }}
                              className="px-2 py-0.5 rounded-lg hover:bg-stone-200 transition text-center cursor-pointer group/qty"
                              title="Cliquer pour saisir la quantité exacte"
                            >
                              <span className="text-base sm:text-lg font-black text-stone-900 block leading-tight">
                                {item.quantityAvailable}{' '}
                                <span className="text-xs font-bold text-stone-500">{item.unit}</span>
                              </span>
                              <span className="text-[9px] text-stone-400 group-hover/qty:text-emerald-700 flex items-center justify-center gap-0.5">
                                <Edit3 className="w-2.5 h-2.5" />
                                {tr(language, 'modifier', 'تعديل', 'edit')}
                              </span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAdjustProduceQty(item, item.unit === 'Tonnes' ? 1 : 5)}
                            className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-black transition active:scale-90 cursor-pointer"
                            title="Augmenter stock"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Prix unitaire & valeur */}
                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-800">
                            {(item.pricePerUnitMAD ?? 0).toLocaleString('fr-FR')} MAD{' '}
                            <span className="text-[10px] font-normal text-stone-500">/ {item.unit}</span>
                          </div>
                          {item.unit === 'Tonnes' && (
                            <div className="text-[10px] font-bold text-emerald-700">
                              ({tr(language, 'soit', 'أي', 'i.e.')} {((item.pricePerUnitMAD ?? 0) / 1000).toFixed(2)} MAD/kg)
                            </div>
                          )}
                          <div className="text-[10px] text-stone-400 font-medium">
                            {tr(language, 'Total estimé :', 'المجموع التقديري :', 'Total :')}{' '}
                            <strong className="text-stone-700">
                              {(((item.quantityAvailable || 0) * (item.pricePerUnitMAD || 0))).toLocaleString('fr-FR')} MAD
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barre d'état et actions rapides */}
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* Statut sélecteur rapide */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider hidden sm:inline mr-1">
                          {tr(language, 'Statut :', 'الحالة :', 'Status :')}
                        </span>
                        {(['Disponible', 'Réservé', 'Vendu'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateListingStatus(item.id, st)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              item.status === st
                                ? st === 'Disponible'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : st === 'Réservé'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'bg-stone-700 text-white shadow-2xs'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {st === 'Disponible'
                              ? tr(language, '✅ En vente', '✅ متوفر', '✅ In Stock')
                              : st === 'Réservé'
                              ? tr(language, '⏳ Réservé', '⏳ محجوز', '⏳ Reserved')
                              : tr(language, '📦 Épuisé / Vendu', '📦 تم البيع', '📦 Sold')}
                          </button>
                        ))}
                      </div>

                      {/* Actions Outils */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedItemForQR(item)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          title={tr(language, 'Générer & imprimer le QR code étiquette de ce lot', 'إنشاء وطباعة ملصق QR لهذه الشحنة', 'Generate & print batch QR label')}
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{tr(language, 'QR Lot', 'ملصق QR', 'Batch QR')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openBoostModal(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                          title="Booster cette annonce"
                        >
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span>Boost</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openLogisticsModal({
                              originCity: item.locationCity || item.region,
                              cargoType: 'harvest_fruits_veg',
                              itemTitle: item.title,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[11px] border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                          title="Simuler expédition et transporteur camion frigo"
                        >
                          <Truck className="w-3 h-3 text-blue-600" />
                          <span className="hidden sm:inline">Fret</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openExportManifestModal(undefined, item)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] border border-stone-200 transition flex items-center gap-1 cursor-pointer"
                          title="Générer un manifeste Foodex / Douane A4"
                        >
                          <FileText className="w-3 h-3 text-stone-600" />
                          <span className="hidden sm:inline">Manifeste A4</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduce(item.id, item.title)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          title="Supprimer ce stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

          {/* 2. NURSERY LOTS (PLANTS) */}
          {filteredUserNursery.map((lot) => (
                <div
                  key={lot.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 shadow-2xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative group shrink-0">
                        <SmartImage
                          src={lot.imageUrl}
                          alt={lot.variety}
                          category={lot.category}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-stone-200 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoEditTarget({
                              type: 'nursery',
                              id: lot.id,
                              title: `${lot.species} • ${lot.variety}`,
                              category: lot.category,
                              imageUrl: lot.imageUrl || '',
                              additionalImages: lot.additionalImages || [],
                            })
                          }
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white transition-opacity cursor-pointer backdrop-blur-xs"
                          title={tr(language, 'Prendre ou modifier les photos', 'التقاط أو تعديل الصور', 'Take or update photos')}
                        >
                          <Camera className="w-4 h-4" />
                          <span className="text-[8px] font-bold mt-0.5">Photos</span>
                        </button>
                        {lot.additionalImages && lot.additionalImages.length > 0 && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded-md bg-black/75 text-white font-bold text-[8px]">
                            +{lot.additionalImages.length + 1}
                          </span>
                        )}
                        {(lot.isCustomPhoto || lot.imageUrl?.startsWith('data:')) && (
                          <span className="absolute top-1 left-1 px-1 py-0.2 rounded-md bg-emerald-700/90 text-white font-bold text-[8px] flex items-center gap-0.5">
                            <Camera className="w-2 h-2" />
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            🌱 {lot.category}
                          </span>
                          <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold text-stone-600 bg-stone-100 border border-stone-200">
                            {lot.batchNumber}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            🛡️ {lot.onssaStatus}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                          {lot.species} • {lot.variety}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          {lot.rootstock && (
                            <span className="text-stone-700">
                              PG: <strong>{lot.rootstock}</strong>
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {lot.region}
                          </span>
                          {lot.phytosanitaryPassportNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-emerald-700">
                                {lot.phytosanitaryPassportNumber}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock & Prix */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 bg-stone-50 sm:bg-transparent p-2 sm:p-0 rounded-xl shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustNurseryQty(lot, -50)}
                          className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-black transition active:scale-90 cursor-pointer"
                          title="Diminuer stock plants"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <div className="px-2 py-0.5 text-center">
                          <span className="text-base sm:text-lg font-black text-emerald-900 block leading-tight">
                            {(lot.quantityAvailable ?? 0).toLocaleString()}{' '}
                            <span className="text-xs font-bold text-stone-500">plants</span>
                          </span>
                          <span className="text-[9px] text-stone-400">
                            + {(lot.quantityReserved ?? 0).toLocaleString()} réservés
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAdjustNurseryQty(lot, 50)}
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-black transition active:scale-90 cursor-pointer"
                          title="Augmenter stock plants"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-800">
                          {lot.unitPriceMAD} MAD <span className="text-[10px] font-normal text-stone-500">/ plant</span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-medium">
                          Valeur :{' '}
                          <strong className="text-stone-700">
                            {(((lot.quantityAvailable || 0) * (lot.unitPriceMAD || 0))).toLocaleString()} MAD
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Certifié ONSSA
                    </span>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => openBoostModal(lot.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-600" />
                        <span>Boost</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteNursery(lot.id, lot.variety)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

          {/* 3. STANDING CROPS (VERGERS SUR PIED) */}
          {filteredUserStanding.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 shadow-2xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.title}
                        category="Fruit"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-stone-200 shadow-2xs"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                            🌳 Verger sur pied
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-stone-600 bg-stone-100 border border-stone-200">
                            {item.cropCategory}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                          {item.title} • {item.variety}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {item.locationDetails}, {item.region}
                          </span>
                          {item.harvestReadyDate && (
                            <>
                              <span>•</span>
                              <span className="text-[11px]">
                                Récolte prête : <strong>{item.harvestReadyDate}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 bg-stone-50 sm:bg-transparent p-2 sm:p-0 rounded-xl shrink-0">
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black text-stone-900 block leading-tight">
                          {item.surfaceHectares} <span className="text-xs font-bold text-stone-500">Hectares</span>
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Rendement : ~{item.estimatedTotalYieldTonnes || 0} Tonnes
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-800">
                          {(item.pricePerHectareMAD ?? 0).toLocaleString()} MAD <span className="text-[10px] font-normal text-stone-500">/ ha</span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-medium">
                          Total :{' '}
                          <strong className="text-stone-700">
                            {(((item.surfaceHectares || 0) * (item.pricePerHectareMAD || 0))).toLocaleString()} MAD
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {(['Disponible', 'En négociation', 'Vendu'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateFarmStandingStatus(item.id, st)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            item.status === st
                              ? st === 'Disponible'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : st === 'En négociation'
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'bg-stone-700 text-white shadow-2xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => openBoostModal(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-600" />
                        <span>Boost</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteStanding(item.id, item.title)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

          {/* ÉTAT VIDE : AUCUN STOCK DU VENDEUR IDENTIFIÉ */}
          {totalUserFilteredCount === 0 && (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto border shadow-inner ${
                !isUserIdentified
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                {!isUserIdentified ? (
                  <Lock className="w-8 h-8 text-amber-600" />
                ) : (
                  <PackageOpen className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-stone-900">
                  {!isUserIdentified
                    ? tr(
                        language,
                        'Identification requise pour afficher vos stocks',
                        'التعريف بالحساب مطلوب لعرض مخزونك',
                        'Identification required to display your stocks'
                      )
                    : stockSearchTerm || stockStatusFilter !== 'ALL'
                    ? tr(
                        language,
                        'Aucun stock personnel ne correspond à vos filtres',
                        'لا يوجد مخزون شخصي يطابق معايير البحث',
                        'No personal stock matches your filters'
                      )
                    : tr(
                        language,
                        'Aucun stock personnel enregistré',
                        'لا يوجد مخزون شخصي مسجل بعد',
                        'No personal stock listed yet'
                      )}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {!isUserIdentified
                    ? tr(
                        language,
                        'Cet espace privé n’affiche que les stocks personnels de l’exploitant identifié. Identifiez votre compte pour déclarer vos récoltes, lots de pépinières ou bétail.',
                        'هذا الفضاء الخاص يعرض فقط المخزون الشخصي للمستخدم المعرف به. يرجى التعريف بحسابك لتسجيل محاصيلك وعروضك.',
                        'This private workspace only displays personal stocks of the identified grower. Identify your account to list your produce, nursery lots or livestock.'
                      )
                    : stockSearchTerm || stockStatusFilter !== 'ALL'
                    ? tr(
                        language,
                        'Essayez de réinitialiser vos termes de recherche ou vos filtres de statut.',
                        'جرب إعادة ضبط معايير البحث أو تصفية الحالة.',
                        'Try resetting your search terms or status filters.'
                      )
                    : tr(
                        language,
                        "Seuls vos propres stocks s'affichent dans cet espace vendeur privé. Les stocks des autres producteurs du Maroc restent sur le marché public.",
                        'فقط محاصيلك وعروضك الخاصة هي التي تظهر في هذا الفضاء الخاص. عروض المنتجين الآخرين معروضة في السوق العام.',
                        "Only your own listings appear in this private workspace. Other Moroccan producers' stock remains in the public marketplace."
                      )}
                </p>
              </div>

              {!isUserIdentified ? (
                <div className="pt-2 flex justify-center">
                  <button
                    id="btn-seller-empty-identify"
                    type="button"
                    onClick={() => setIsIdentificationModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{tr(language, 'S’identifier comme Exploitante / Exploitant', 'التعريف بالحساب كمنتج فلاحي', 'Identify as Grower / Producer')}</span>
                  </button>
                </div>
              ) : (
                !stockSearchTerm && stockStatusFilter === 'ALL' && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStockCategoryForModal('Légume');
                        setIsProduceModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{tr(language, '+ Publier une Récolte (Fruits / Légumes)', '+ نشر محصول (خضر / فواكه)', '+ Publish Harvest (Produce)')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStockCategoryForModal('Élevage & Bétail');
                        setIsProduceModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Tractor className="w-4 h-4" />
                      <span>{tr(language, '+ Déclarer Bétail / Cheptel', '+ إضافة مواشي وأنعام', '+ Add Livestock')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsNurseryModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sprout className="w-4 h-4 text-emerald-400" />
                      <span>{tr(language, '+ Ajouter un Lot Pépinière', '+ إضافة دفعة مشتل', '+ Add Nursery Lot')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openExcelStockModal('produce')}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs border border-stone-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>{tr(language, 'Importer fichier Excel (.xlsx)', 'استيراد ملف إكسيل (.xlsx)', 'Import Excel (.xlsx)')}</span>
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* ⚙️ NIVEAU 3 : SERVICES PRO (SÉQUESTRE, BOOST, EXPORT...)     */}
      {/* ========================================================= */}
      <section className="space-y-3" aria-labelledby="heading-services-pro">
        <div className="flex items-center justify-between pb-1 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-stone-100 text-stone-700">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </span>
            <h2
              id="heading-services-pro"
              className="text-lg sm:text-xl font-black text-stone-900 tracking-tight"
            >
              {tr(language, 'Services PRO', 'خدمات المحترفين PRO', 'PRO Services')}
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {tr(
              language,
              'Fonctionnalités avancées à haute valeur ajoutée',
              'خدمات متقدمة لتسريع المبيعات وضمان المعاملات',
              'Advanced high-value trading features'
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SERVICE 1 : SÉQUESTRE */}
          <div className="p-4 rounded-2xl bg-stone-900 text-white border border-stone-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Garanti
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">
                {tr(language, 'Séquestre Bancaire', 'الحساب الوسيط Séquestre', 'Banking Escrow')}
              </h3>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {tr(
                  language,
                  'Fonds de l\'acheteur bloqués avant l\'expédition. Zéro risque d\'impayé ou de chèque sans provision.',
                  'حجز أموال المشتري قبل انطلاق الشاحنة لضمان عدم ضياع أي سنتيم.',
                  'Buyer funds locked before dispatch. Zero risk of bounced checks or unpaid orders.'
                )}
              </p>
            </div>
            <button
              id="btn-service-sequestre"
              type="button"
              onClick={() => setIsEscrowListModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-amber-300 transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
            >
              <span>{tr(language, 'Gérer le Séquestre', 'إدارة الحساب الوسيط', 'Manage Escrow')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SERVICE 2 : BOOST */}
          <div className="p-4 rounded-2xl bg-stone-900 text-white border border-stone-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  +400% Vues
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">
                {tr(language, 'Boost d\'Annonce', 'ترقية العرض Boost', 'Listing Boost')}
              </h3>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {tr(
                  language,
                  'Épinglez vos offres en tête de la Marketplace et des alertes WhatsApp pour vendre vos stocks 3x plus vite.',
                  'تثبيت إعلاناتك في صدارة البورصة وإشعارات واتساب لبيع محاصيلك بسرعة فائقة.',
                  'Pin your offers at the top of the marketplace and WhatsApp alerts to sell 3x faster.'
                )}
              </p>
            </div>
            <button
              id="btn-service-boost"
              type="button"
              onClick={() => openBoostModal('boost_sample')}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-stone-950 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-stone-950" />
              <span>{tr(language, 'Booster une annonce', 'ترقية الإعلان الآن', 'Boost an offer')}</span>
            </button>
          </div>

          {/* SERVICE 3 : EXPORT & DOUANE (A4) */}
          <div className="p-4 rounded-2xl bg-stone-900 text-white border border-stone-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Foodex & ONSSA
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">
                {tr(language, 'Export & Douane (A4)', 'التصدير والجمارك A4', 'Export & Customs A4')}
              </h3>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {tr(
                  language,
                  'Générez en 1 clic vos manifestes officiels A4 conformes Morocco Foodex (EACCE), codes SH et douane BADR.',
                  'استخراج وثائق الشحن المعتمدة وبيان التصدير الجمركي الموحد وموروكو فوديكس بنقرة واحدة.',
                  'Generate official A4 export manifests compliant with Morocco Foodex, HS codes & Customs.'
                )}
              </p>
            </div>
            <button
              id="btn-service-export"
              type="button"
              onClick={() => openExportManifestModal()}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-emerald-300 transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{tr(language, 'Générer Manifeste', 'استخراج الوثيقة', 'Generate Manifest')}</span>
            </button>
          </div>

          {/* SERVICE 4 : FRET & CERTIFICATIONS PRO */}
          <div className="p-4 rounded-2xl bg-stone-900 text-white border border-stone-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Pro & Fret
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">
                {tr(language, 'Fret & Certification PRO', 'الشحن واعتماد PRO', 'Freight & PRO Badge')}
              </h3>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {tr(
                  language,
                  'Accédez au réseau de transporteurs certifiés et obtenez le badge de confiance Vendeur Vérifié AgriStock.',
                  'الربط مع شبكة شاحنات التبريد والحصول على شارة التاجر المعتمد والموثوق.',
                  'Access certified reefer truckers and obtain the AgriStock Verified Seller trust badge.'
                )}
              </p>
            </div>
            <button
              id="btn-service-pro-badge"
              type="button"
              onClick={() => setIsProModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-teal-300 transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{tr(language, 'Certification PRO', 'اعتماد المحترفين', 'PRO Certification')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Produce Listing Form Modal (when seller clicks to list harvest produce) */}
      {isProduceModalOpen && (
        <ProduceListingFormModal
          isOpen={isProduceModalOpen}
          defaultCategory={stockCategoryForModal}
          onClose={() => setIsProduceModalOpen(false)}
          onSave={(newListing) => {
            addProduceListing(newListing);
            setIsProduceModalOpen(false);
            showNotice(
              tr(
                language,
                `Offre "${newListing.title}" ajoutée avec succès à vos stocks !`,
                `تمت إضافة "${newListing.title}" إلى مخزونك بنجاح!`,
                `Listing "${newListing.title}" added to stock successfully!`
              )
            );
          }}
        />
      )}

      {/* Nursery Lot Form Modal (when seller clicks to add plant lot) */}
      {isNurseryModalOpen && (
        <NurseryLotFormModal
          isOpen={isNurseryModalOpen}
          onClose={() => setIsNurseryModalOpen(false)}
          onSave={(newLot) => {
            addNurseryLot(newLot);
            setIsNurseryModalOpen(false);
            showNotice(
              tr(
                language,
                `Lot de plants "${newLot.species} - ${newLot.variety}" ajouté à vos stocks !`,
                `تمت إضافة شتلات "${newLot.variety}" إلى مخزونك بنجاح!`,
                `Nursery lot "${newLot.variety}" added to stock!`
              )
            );
          }}
        />
      )}
      {/* Quick Photo Update & Capture Modal for existing stock */}
      {photoEditTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPhotoEditTarget(null);
          }}
        >
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-700" />
                  <span>
                    {tr(language, 'Photos du stock', 'صور المخزون', 'Stock Photos')}
                  </span>
                </h3>
                <p className="text-xs text-stone-500 truncate max-w-sm">
                  {photoEditTarget.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPhotoEditTarget(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <PhotoUploadCapture
              currentImageUrl={photoEditTarget.imageUrl}
              additionalImages={photoEditTarget.additionalImages}
              onImageChange={(main, extras) => {
                handleSaveStockPhotos(main, extras);
              }}
              categoryHint={photoEditTarget.category}
              title={tr(language, 'Prendre ou insérer une nouvelle photo', 'التقاط أو إدراج صورة جديدة', 'Take or insert new photo')}
              subtitle={tr(
                language,
                'Prenez une photo en direct ou choisissez depuis votre galerie.',
                'التقط صورة مباشرة أو اختر من معرض الصور.',
                'Take a live photo or choose from gallery.'
              )}
              maxImages={4}
              allowPresets={true}
            />

            <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPhotoEditTarget(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs transition cursor-pointer"
              >
                {tr(language, 'Fermer', 'إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedItemForQR && (
        <BatchQRCodeModal
          isOpen={true}
          onClose={() => setSelectedItemForQR(null)}
          produceListing={selectedItemForQR}
        />
      )}
    </div>
  );
};
