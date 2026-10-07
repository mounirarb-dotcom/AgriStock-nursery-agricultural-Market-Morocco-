import React, { useState, useEffect } from 'react';
import { sanitizeSearchQuery } from '../utils/securityUtils';
import { useApp } from '../context/AppContext';
import { useTranslation, tr } from '../utils/translations';
import { NurseryLot } from '../types';
import { MOROCCAN_REGIONS, NURSERY_CATEGORIES, GROWTH_STAGES } from '../data/mockData';
import { NurseryPassportModal } from './NurseryPassportModal';
import { TreatmentModal } from './TreatmentModal';
import { NurseryLotFormModal } from './NurseryLotFormModal';
import { LowStockAlertBanner } from './LowStockAlertBanner';
import { LowStockSettingsModal } from './LowStockSettingsModal';
import { BatchQRCodeModal, BatchItemData } from './BatchQRCodeModal';
import { DailyStockSyncBanner } from './DailyStockSyncBanner';
import { QuickStockSyncModal } from './QuickStockSyncModal';
import { NurseryGrowthTrendModal } from './NurseryGrowthTrendModal';
import { VoiceSearchButton } from './VoiceSearchButton';
import {
  Sprout,
  Search,
  Plus,
  ShieldCheck,
  QrCode,
  Scan,
  FlaskConical,
  Edit2,
  Trash2,
  Layers,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  TrendingUp,
  Flower2,
  Trees,
  X,
  Tractor,
  Zap,
  Award,
  Package,
  Truck,
  Sparkles,
  CreditCard,
  MessageSquare,
  Star,
  RotateCcw,
  PackageSearch,
  Check,
  CheckCheck,
  BookOpen,
  Handshake,
  Bell,
  Heart,
  FileSpreadsheet,
  Sliders,
  CheckSquare,
  Square,
  ListChecks,
} from 'lucide-react';
import { StarRating } from './StarRating';
import { SmartImage } from './SmartImage';
import { NurseryBulkEditModal } from './NurseryBulkEditModal';
import {
  BulkUpdateOptions,
  getLotStockStatus,
  applyBulkUpdatesToLot,
} from '../utils/nurseryUtils';
import { isItemOwnedByUser } from '../utils/ownershipUtils';

type NurseryDepartment = 'ALL' | 'ARBORICULTURE' | 'MARAICHAGE' | 'ORNEMENTALE';

export const NurseryManager: React.FC = () => {
  const {
    language,
    nurseryLots,
    produceListings,
    setActiveTab,
    userProfile,
    googleUser,
    setUserRole,
    addNurseryLot,
    updateNurseryLot,
    deleteNurseryLot,
    addTreatmentLog,
    adjustStockQuantity,
    requestStockActionAuth,
    openEscrowPayment,
    openBoostModal,
    openLogisticsModal,
    setIsProModalOpen,
    setIsEscrowListModalOpen,
    openOfferDiscussion,
    openRatingModal,
    platformPaymentProtected,
    nurseryDepartmentFilter,
    setNurseryDepartmentFilter,
    lowStockLots,
    isLotLowStock,
    getLotThreshold,
    isLowStockSettingsModalOpen,
    setIsLowStockSettingsModalOpen,
    isQuickSyncModalOpen,
    setIsQuickSyncModalOpen,
    dailySyncRecord,
    confirmAllNurseryLotsSyncedToday,
    openUserManual,
    openNotificationSettings,
    addNurseryInterestWatch,
    canManageNursery,
    favoriteIds,
    toggleFavorite,
    isFavorite,
    setIsOfficialComplianceModalOpen,
    openExcelStockModal,
    openFieldQRScannerModal,
    globalVoiceSearchQuery,
    setGlobalVoiceSearchQuery,
  } = useApp();
  const t = useTranslation(language);

  const isNurseryOwner = canManageNursery;

  const [searchTerm, setSearchTerm] = useState('');

  // Synchronisation avec la recherche vocale globale
  useEffect(() => {
    if (globalVoiceSearchQuery) {
      setSearchTerm(globalVoiceSearchQuery);
      setGlobalVoiceSearchQuery('');
    }
  }, [globalVoiceSearchQuery, setGlobalVoiceSearchQuery]);
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<NurseryDepartment>(
    nurseryDepartmentFilter || 'ALL'
  );

  useEffect(() => {
    if (nurseryDepartmentFilter) {
      setSelectedDepartment(nurseryDepartmentFilter);
    }
  }, [nurseryDepartmentFilter]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [passportLot, setPassportLot] = useState<NurseryLot | null>(null);
  const [treatmentLot, setTreatmentLot] = useState<NurseryLot | null>(null);
  const [editingLot, setEditingLot] = useState<NurseryLot | null>(null);
  const [isCreatingLot, setIsCreatingLot] = useState(false);
  const [qrModalBatch, setQrModalBatch] = useState<BatchItemData | null>(null);
  const [isGrowthTrendModalOpen, setIsGrowthTrendModalOpen] = useState(false);
  const [growthTrendLotId, setGrowthTrendLotId] = useState<string | undefined>(undefined);

  // Bulk editing mode state & selection
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedLotIds, setSelectedLotIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(null);

  const toggleSelectLot = (id: string) => {
    setSelectedLotIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const deselectAllLots = () => {
    setSelectedLotIds(new Set());
  };

  const handleApplyBulkUpdates = (options: BulkUpdateOptions) => {
    const selectedLotsToUpdate = nurseryLots.filter(l => selectedLotIds.has(l.id));
    if (selectedLotsToUpdate.length === 0) return;

    requestStockActionAuth(() => {
      selectedLotsToUpdate.forEach(lot => {
        const updated = applyBulkUpdatesToLot(lot, options);
        updateNurseryLot(lot.id, {
          unitPriceMAD: updated.unitPriceMAD,
          status: updated.status,
          quantityAvailable: updated.quantityAvailable,
          quantityReserved: updated.quantityReserved,
        });
      });

      setIsBulkModalOpen(false);
      setBulkSuccessMessage(
        tr(
          language,
          `✅ ${selectedLotsToUpdate.length} lots mis à jour avec succès (Prix / Statut).`,
          `✅ تم تحديث ${selectedLotsToUpdate.length} دفعة بنجاح (السعر / الحالة).`,
          `✅ Successfully updated ${selectedLotsToUpdate.length} lots (Price / Status).`
        )
      );
      setSelectedLotIds(new Set());
      setTimeout(() => setBulkSuccessMessage(null), 5000);
    }, `Mise à jour en lot de ${selectedLotsToUpdate.length} lots`);
  };

  // Protected action handlers to prevent unauthorized stock tampering
  const handleProtectedStockAdjust = (lotId: string, change: number, lotBatch: string) => {
    requestStockActionAuth(() => {
      adjustStockQuantity(lotId, change);
    }, `Ajustement stock (${change > 0 ? '+' : ''}${change} plants) - Lot ${lotBatch}`);
  };

  const handleProtectedEditLot = (lot: NurseryLot) => {
    requestStockActionAuth(() => {
      setEditingLot(lot);
    }, `Modification du lot ${lot?.batchNumber || 'N/A'}`);
  };

  const handleProtectedDeleteLot = (lotId: string, lotBatch: string) => {
    requestStockActionAuth(() => {
      if (confirm(`Voulez-vous supprimer le lot ${lotBatch} ?`)) {
        deleteNurseryLot(lotId);
      }
    }, `Suppression définitive du lot ${lotBatch}`);
  };

  const handleProtectedCreateLot = () => {
    requestStockActionAuth(() => {
      setIsCreatingLot(true);
    }, 'Enregistrement d\'un nouveau lot de pépinière');
  };

  // Department lot counters & stock (1. Arboriculture, 2. Maraîchage, 3. Ornementale)
  const countArboriculture = nurseryLots.filter(
    l => l && (l.category?.includes('Arbres') || l.category?.includes('Fruit') || l.category?.includes('Porte-greffes') || l.category?.includes('Arganier'))
  ).length;
  const countMaraichage = nurseryLots.filter(
    l => l && (l.category?.includes('Maraîch') || l.category?.includes('Légume'))
  ).length;
  const countOrnementale = nurseryLots.filter(
    l => l && (l.category?.includes('Ornement') || l.ornamentalDetails !== undefined || l.category?.includes('Espaces Verts'))
  ).length;

  const plantsArboriculture = nurseryLots
    .filter(l => l && (l.category?.includes('Arbres') || l.category?.includes('Fruit') || l.category?.includes('Porte-greffes') || l.category?.includes('Arganier')))
    .reduce((acc, l) => acc + (l.quantityAvailable || 0), 0);
  const plantsMaraichage = nurseryLots
    .filter(l => l && (l.category?.includes('Maraîch') || l.category?.includes('Légume')))
    .reduce((acc, l) => acc + (l.quantityAvailable || 0), 0);
  const plantsOrnementale = nurseryLots
    .filter(l => l && (l.category?.includes('Ornement') || l.ornamentalDetails !== undefined || l.category?.includes('Espaces Verts')))
    .reduce((acc, l) => acc + (l.quantityAvailable || 0), 0);

  // Filter lots
  const filteredLots = nurseryLots.filter(lot => {
    if (!lot) return false;
    const term = (searchTerm || '').trim().toLowerCase();
    let matchesSearch = true;

    if (term) {
      matchesSearch =
        Boolean(lot.variety?.toLowerCase().includes(term)) ||
        Boolean(lot.species?.toLowerCase().includes(term)) ||
        Boolean(lot.category?.toLowerCase().includes(term)) ||
        Boolean(lot.batchNumber?.toLowerCase().includes(term)) ||
        Boolean(lot.rootstock && lot.rootstock.toLowerCase().includes(term)) ||
        Boolean(lot.region && lot.region.toLowerCase().includes(term)) ||
        Boolean(lot.greenhouseLocation && lot.greenhouseLocation.toLowerCase().includes(term)) ||
        Boolean(lot.notes && lot.notes.toLowerCase().includes(term)) ||
        Boolean(lot.ornamentalDetails?.ornamentalType && lot.ornamentalDetails.ornamentalType.toLowerCase().includes(term)) ||
        Boolean(lot.ornamentalDetails?.plantForm && lot.ornamentalDetails.plantForm.toLowerCase().includes(term)) ||
        Boolean(lot.ornamentalDetails?.landscapeUsage && lot.ornamentalDetails.landscapeUsage.toLowerCase().includes(term));
    }

    const matchesDepartment =
      selectedDepartment === 'ALL' ||
      (selectedDepartment === 'ARBORICULTURE' && (lot.category?.includes('Arbres') || lot.category?.includes('Fruit') || lot.category?.includes('Porte-greffes') || lot.category?.includes('Arganier'))) ||
      (selectedDepartment === 'MARAICHAGE' && (lot.category?.includes('Maraîch') || lot.category?.includes('Légume'))) ||
      (selectedDepartment === 'ORNEMENTALE' && (lot.category?.includes('Ornement') || lot.ornamentalDetails !== undefined || lot.category?.includes('Espaces Verts')));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      lot.category === selectedCategory ||
      (selectedCategory?.includes('Maraîch') && (lot.category?.includes('Maraîch') || lot.category?.includes('Légume'))) ||
      (selectedCategory?.includes('Ornement') && (lot.category?.includes('Ornement') || lot.ornamentalDetails !== undefined)) ||
      (selectedCategory?.includes('Arboriculture') && (lot.category?.includes('Arbres') || lot.category?.includes('Fruit') || lot.category?.includes('Porte-greffes') || lot.category?.includes('Arganier')));

    const matchesRegion = selectedRegion === 'ALL' || lot.region === selectedRegion;
    const matchesStage = selectedStage === 'ALL' || lot.stage === selectedStage;
    const matchesLowStock = !filterLowStockOnly || isLotLowStock(lot);

    return matchesSearch && matchesDepartment && matchesCategory && matchesRegion && matchesStage && matchesLowStock;
  });

  const selectAllFilteredLots = () => {
    setSelectedLotIds(new Set(filteredLots.map(l => l.id)));
  };

  const isAllFilteredSelected =
    filteredLots.length > 0 && filteredLots.every(l => selectedLotIds.has(l.id));

  // Cross-market produce listings count
  const matchingProduceCount = (searchTerm || '').trim()
    ? produceListings.filter(p => {
        const s = (searchTerm || '').trim().toLowerCase();
        return (
          Boolean(p.title?.toLowerCase().includes(s)) ||
          Boolean(p.variety?.toLowerCase().includes(s)) ||
          Boolean(p.category?.toLowerCase().includes(s))
        );
      }).length
    : 0;

  // Helper for department tags (1. Arboriculture, 2. Maraîchage, 3. Ornementale)
  const getDepartmentTag = (category: string) => {
    if (category.includes('Arbres') || category.includes('Fruit') || category.includes('Porte-greffes') || category.includes('Arganier')) {
      return {
        label: '🌳 Pépinières Arboriculture',
        badgeClass: 'bg-amber-950/80 text-amber-200 border-amber-500/40',
        colorText: 'text-amber-800',
        dotColor: 'bg-amber-500',
        borderColor: 'border-amber-200',
      };
    }
    if (category.includes('Maraîch') || category.includes('Légume')) {
      return {
        label: '🌱 Pépinières Maraîchage',
        badgeClass: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40',
        colorText: 'text-emerald-800',
        dotColor: 'bg-emerald-500',
        borderColor: 'border-emerald-200',
      };
    }
    return {
      label: '🪴 Pépinières Ornementale',
      badgeClass: 'bg-teal-950/80 text-teal-200 border-teal-500/40',
      colorText: 'text-teal-800',
      dotColor: 'bg-teal-500',
      borderColor: 'border-teal-200',
    };
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Barre d'outils complémentaires : Selon rôle actif (Pépiniériste vs Acheteur) */}
      {isNurseryOwner ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-stone-900 text-stone-200 border border-stone-800 shadow-xs">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              {tr(language, 'Gestion Station Pépinière & Traçabilité ONSSA', 'إدارة محطة المشتل وتتبع ONSSA', 'Nursery Station Management & ONSSA Traceability')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-add-lot-hero"
              onClick={handleProtectedCreateLot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addLotBtn}</span>
            </button>

            <button
              id="btn-excel-nursery-ornamental"
              onClick={() => openExcelStockModal('nursery_ornamental')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-900/60 hover:bg-pink-800 text-pink-100 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-pink-600/50"
              title="Excel adapté Pépinière Ornementale (Sans porte-greffes, Hauteur, Silhouette, Floraison, Conteneur)"
            >
              <span>🌸 Excel Ornemental</span>
            </button>

            <button
              id="btn-excel-nursery-bulk"
              onClick={() => openExcelStockModal('nursery')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-emerald-600/50"
              title="Excel Pépinière Arboriculture & Fruitiers (Porte-greffes, Greffage, Passeport ONSSA)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span>🌱 Excel Arboriculture</span>
            </button>

            <button
              id="btn-quick-sync-hero"
              onClick={() => setIsQuickSyncModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
              title="Actualisation express quotidienne des stocks en 1 tap"
            >
              <Zap className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
              <span>⚡ Quick Sync</span>
            </button>

            <button
              id="btn-growth-trend-report"
              onClick={() => {
                setGrowthTrendLotId(undefined);
                setIsGrowthTrendModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-teal-600/40"
              title="Visualiser les courbes de croissance D3 et les rapports de performance de stock"
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-300" />
              <span>Courbes D3</span>
            </button>

            <button
              id="btn-nursery-manual-guide"
              onClick={() => openUserManual('nursery-onssa')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-stone-700"
              title={tr(
                language,
                "Consulter le guide d'utilisation de la plateforme et traçabilité ONSSA",
                "الاطلاع على دليل استخدام المنصة وتتبع أونسا",
                "Consult the platform user guide and ONSSA traceability"
              )}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>{tr(language, "Guide d'Utilisation", 'دليل الاستخدام', 'User Guide')}</span>
            </button>

            <button
              id="btn-low-stock-settings"
              onClick={() => setIsLowStockSettingsModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                lowStockLots.length > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
              }`}
              title="Configurer les seuils d'alerte et notifications de stock bas"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Alertes Stock</span>
              {lowStockLots.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-700 font-black text-[10px]">
                  {lowStockLots.length}
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0d2a17] via-stone-900 to-[#0d2a17] text-stone-200 border border-emerald-700/40 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-xs font-black text-white block">
                {tr(language, 'Bourse des Plants Certifiés ONSSA & Séquestre Sécurisé', 'بورصة الشتلات المعتمدة والضمان البنكي', 'Certified Plants Marketplace & Escrow Protection')}
              </span>
              <span className="text-[11px] text-emerald-300/90 hidden sm:block">
                {tr(language, 'Catalogue officiel pour acheteurs, arboriculteurs et maraîchers', 'الدليل الرسمي للمشترين والمزارعين', 'Official catalogue for buyers and farmers')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {userProfile.role === 'seller' && (
              <button
                id="btn-nursery-goto-seller-stocks"
                type="button"
                onClick={() => setActiveTab('seller_space')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>{tr(language, 'Mon Espace Stocks Vendeur', 'فضاء مخزوني كبائع', 'My Seller Stocks')}</span>
              </button>
            )}

            {userProfile.role === 'nursery' && (
              <button
                id="btn-nursery-goto-nursery-space"
                type="button"
                onClick={() => setActiveTab('nursery_space')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>{tr(language, 'Gérer mes Lots de Pépinière', 'إدارة دفعات مشتلي', 'Manage My Nursery Lots')}</span>
              </button>
            )}

            <button
              id="btn-nursery-buyer-freight"
              onClick={() => openLogisticsModal({
                originCity: 'Agadir',
                cargoType: 'plants_mottes',
                volumeTonnes: 5,
                itemTitle: 'Simulation Transport Plants Pépinière'
              })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-blue-600/40"
              title="Simuler et réserver un transport frigorifique ou plateau aéré pour plants"
            >
              <Truck className="w-3.5 h-3.5 text-blue-300" />
              <span>{tr(language, 'Simuler Fret Plants', 'حساب تكلفة النقل', 'Freight Calculator')}</span>
            </button>

            <button
              id="btn-nursery-compliance-info"
              onClick={() => setIsOfficialComplianceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-stone-700"
              title="Consulter les garanties de conformité ONSSA et protection acheteur"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{tr(language, 'Garantie Sanitaire ONSSA', 'ضمان السلامة الصحية', 'Sanitary Guarantee')}</span>
            </button>

            <button
              id="btn-nursery-buyer-guide"
              onClick={() => openUserManual('nursery-onssa')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-stone-700"
              title={tr(
                language,
                "Guide d'utilisation et manuel de la plateforme",
                "دليل الاستخدام ودليل المنصة",
                "Platform user manual and guide"
              )}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{tr(language, "Guide d'Utilisation", 'دليل الاستخدام', 'User Guide')}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION INVENTAIRE DÉTAILLÉ (ANCRE DIRECTE POUR « GÉRER MES STOCKS ») */}
      <div id="nursery-inventory-section" className="space-y-6 pt-2">

      {/* Daily Stock Synchronization & Reminder Banner (UNIQUEMENT pour pépiniériste) */}
      {isNurseryOwner && (
        <DailyStockSyncBanner onOpenQuickSync={() => setIsQuickSyncModalOpen(true)} />
      )}

      {/* Low Stock Alert Visual Banner & Interactive Filter (UNIQUEMENT pour pépiniériste) */}
      {isNurseryOwner && (
        <LowStockAlertBanner
          lowStockLots={lowStockLots}
          isFilteredToLowStock={filterLowStockOnly}
          onToggleLowStockFilter={() => setFilterLowStockOnly(prev => !prev)}
          onOpenSettings={() => setIsLowStockSettingsModalOpen(true)}
        />
      )}

      {/* Barre de Recherche Simple et Filtres (identique au style de la page Fruits & Légumes) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={tr(
                language,
                'Rechercher un plant, variété, porte-greffe, pépinière...',
                'بحث عن شتلات، أصناف، حوامل الطعم، مشاتل...',
                'Search plants, varieties, rootstocks, nurseries...'
              )}
              value={searchTerm}
              onChange={e => setSearchTerm(sanitizeSearchQuery(e.target.value))}
              className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 text-xs text-stone-800 placeholder-stone-400"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                  title={tr(language, 'Effacer', 'مسح', 'Clear')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <VoiceSearchButton
                language={language}
                onSearchResult={(query, details) => {
                  setSearchTerm(query);
                  if (details?.region && details.region !== 'ALL') {
                    setSelectedRegion(details.region);
                  }
                }}
              />
            </div>
          </div>

          {isNurseryOwner && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-toggle-bulk-edit-mode"
                type="button"
                onClick={() => {
                  setIsBulkEditMode((prev) => {
                    const next = !prev;
                    if (!next) {
                      setSelectedLotIds(new Set());
                    }
                    return next;
                  });
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                  isBulkEditMode
                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 border-amber-600 shadow-sm ring-2 ring-amber-400/30 font-black'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300 shadow-2xs'
                }`}
                title={tr(
                  language,
                  'Activer la sélection multiple pour modifier les prix ou statuts en lot',
                  'تفعيل التحديد المتعدد لتعديل الأسعار أو الحالات دفعة واحدة',
                  'Enable multi-selection to update prices or statuses in bulk'
                )}
              >
                <Sliders className="w-4 h-4 text-stone-900" />
                <span>
                  {isBulkEditMode
                    ? tr(
                        language,
                        `Mode Lot (${selectedLotIds.size})`,
                        `تعديل جماعي (${selectedLotIds.size})`,
                        `Bulk Mode (${selectedLotIds.size})`
                      )
                    : tr(language, 'Édition en Lot', 'تعديل جماعي', 'Bulk Edit')}
                </span>
              </button>

              <button
                id="btn-add-lot-simple-bar"
                onClick={handleProtectedCreateLot}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addLotBtn}</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Tabs & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: tr(language, 'Tous les plants', 'جميع النباتات', 'All Plants') },
              { id: 'ARBORICULTURE', label: tr(language, 'Arboriculture (Fruitiers)', 'أشجار مثمرة', 'Arboriculture (Fruit Trees)') },
              { id: 'MARAICHAGE', label: tr(language, 'Maraîchage (Jeunes plants)', 'خضروات وبواكر', 'Market Gardening (Seedlings)') },
              { id: 'ORNEMENTALE', label: tr(language, 'Plantes Ornementales', 'نباتات الزينة', 'Ornamental Plants') },
            ].map(dept => (
              <button
                key={dept.id}
                onClick={() => {
                  setSelectedDepartment(dept.id as any);
                  setSelectedCategory('ALL');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  selectedDepartment === dept.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>

          {/* Region & Stage selects + View Mode Grid/Table */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 text-xs focus:outline-emerald-600 font-medium cursor-pointer"
            >
              <option value="ALL">{tr(language, 'Toutes les régions', 'جميع الجهات', 'All regions')}</option>
              {MOROCCAN_REGIONS.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>

            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 text-xs focus:outline-emerald-600 font-medium cursor-pointer"
            >
              <option value="ALL">{tr(language, 'Tous les stades', 'جميع المراحل', 'All stages')}</option>
              {GROWTH_STAGES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* View Mode Buttons: Grid vs Table */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-xs text-stone-900 font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Vue Grille"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'table'
                    ? 'bg-white shadow-xs text-stone-900 font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Vue Tableau"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast de succès de la modification en lot */}
      {bulkSuccessMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-700 text-white font-bold text-xs shadow-md border border-emerald-600 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-300" />
            <span>{bulkSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setBulkSuccessMessage(null)}
            className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bannière du Mode Édition en Lot */}
      {isBulkEditMode && (
        <div
          id="banner-bulk-edit-mode"
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border-2 border-amber-500/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-stone-950 font-black shadow-2xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300">
                  {tr(language, 'Mode Édition en Lot Actif', 'وضع التعديل الجماعي مفعل', 'Bulk Edit Mode Active')}
                </span>
                <span className="text-xs font-bold text-stone-800">
                  {selectedLotIds.size}{' '}
                  {selectedLotIds.size > 1
                    ? tr(language, 'lots sélectionnés', 'دفعات محددة', 'lots selected')
                    : tr(language, 'lot sélectionné', 'دفعة محددة', 'lot selected')}{' '}
                  / {filteredLots.length}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                {tr(
                  language,
                  'Cochez les lots à mettre à jour, puis cliquez sur Modifier pour changer leurs prix ou statuts en simultané.',
                  'حدد الدفعات المراد تعديلها ثم اضغط على زر التعديل لتحديث أسعارها أو حالاتها معاً.',
                  'Check lots to update, then click Edit to change their prices or statuses simultaneously.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            <button
              type="button"
              onClick={isAllFilteredSelected ? deselectAllLots : selectAllFilteredLots}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 shadow-2xs transition cursor-pointer"
            >
              {isAllFilteredSelected
                ? tr(language, 'Tout désélectionner', 'إلغاء التحديد', 'Deselect all')
                : tr(language, `Tout sélectionner (${filteredLots.length})`, `تحديد الكل (${filteredLots.length})`, `Select all (${filteredLots.length})`)}
            </button>

            <button
              type="button"
              disabled={selectedLotIds.size === 0}
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {tr(
                  language,
                  `Modifier Prix / Statut (${selectedLotIds.size})`,
                  `تعديل السعر / الحالة (${selectedLotIds.size})`,
                  `Bulk Edit Price / Status (${selectedLotIds.size})`
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsBulkEditMode(false);
                setSelectedLotIds(new Set());
              }}
              className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
              title="Quitter le mode lot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fenêtres des Catégories de Pépinière : Arboriculture, Maraîchage, Ornementale */}
      <div id="nursery-category-windows" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Fenêtres des Catégories de Pépinière</span>
              <span className="text-xs font-semibold text-stone-500">
                ({filteredLots.length} {filteredLots.length > 1 ? 'lots affichés' : 'lot affiché'})
              </span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Sélectionnez une catégorie pour filtrer instantanément les lots, passeports phytosanitaires et stocks
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {selectedDepartment !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDepartment('ALL');
                  setSelectedCategory('ALL');
                }}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline transition"
              >
                Réinitialiser filtre
              </button>
            )}

            <button
              id="btn-category-all"
              type="button"
              onClick={() => {
                setSelectedDepartment('ALL');
                setSelectedCategory('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                selectedDepartment === 'ALL'
                  ? 'bg-stone-900 text-white ring-2 ring-stone-900/20'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              Tous les rayons ({nurseryLots.length})
            </button>
          </div>
        </div>

        {/* The 3 Category Windows in Order: 1. Arboriculture, 2. Maraîchage, 3. Ornementale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* FENÊTRE 1: Pépinières Arboriculture */}
          <div
            id="window-arboriculture"
            onClick={() => {
              setSelectedDepartment(selectedDepartment === 'ARBORICULTURE' ? 'ALL' : 'ARBORICULTURE');
              setSelectedCategory('ALL');
            }}
            className={`group cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between border ${
              selectedDepartment === 'ARBORICULTURE'
                ? 'bg-amber-50/60 border-2 border-amber-600 text-stone-900 shadow-md ring-2 ring-amber-400/20 scale-[1.01]'
                : 'bg-white hover:bg-stone-50/90 text-stone-900 border-stone-200 shadow-xs hover:shadow-sm hover:border-amber-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`p-2.5 rounded-xl transition ${
                  selectedDepartment === 'ARBORICULTURE'
                    ? 'bg-amber-200/80 text-amber-950 border border-amber-400'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  <Trees className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    selectedDepartment === 'ARBORICULTURE'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {countArboriculture} lots
                  </span>
                  {selectedDepartment === 'ARBORICULTURE' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-xs">
                      ✓ Actif
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-base font-black tracking-tight text-stone-900">
                Pépinières Arboriculture
              </h3>

              <p className="text-xs mt-1 leading-relaxed text-stone-600">
                Arbres fruitiers certifiés ONSSA, agrumes (Nadorcott, Clémentine), oliviers (Picholine), palmiers dattiers (Mejhoul in vitro), amandiers & porte-greffes.
              </p>

              {/* Varieties Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Jeunes Oliviers certifiés', 'Agrumes greffés', 'Palmier Mejhoul vitroplants', 'Avocatiers & Amandiers'].map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition ${
                      selectedDepartment === 'ARBORICULTURE'
                        ? 'bg-white/80 text-amber-950 border border-amber-300/80'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Metrics & CTA */}
            <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs transition ${
              selectedDepartment === 'ARBORICULTURE' ? 'border-amber-200' : 'border-stone-100'
            }`}>
              <div>
                <span className="text-[10px] uppercase block text-stone-500">
                  Stock disponible
                </span>
                <span className="font-black text-sm text-amber-900">
                  {plantsArboriculture.toLocaleString('fr-FR')} plants
                </span>
              </div>

              <div className={`flex items-center gap-1 font-bold text-xs ${
                selectedDepartment === 'ARBORICULTURE' ? 'text-amber-800' : 'text-stone-500 group-hover:text-amber-800'
              }`}>
                <span>{selectedDepartment === 'ARBORICULTURE' ? 'Filtre appliqué' : 'Filtrer'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* FENÊTRE 2: Pépinières Maraîchage */}
          <div
            id="window-maraichage"
            onClick={() => {
              setSelectedDepartment(selectedDepartment === 'MARAICHAGE' ? 'ALL' : 'MARAICHAGE');
              setSelectedCategory('ALL');
            }}
            className={`group cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between border ${
              selectedDepartment === 'MARAICHAGE'
                ? 'bg-emerald-50/60 border-2 border-emerald-600 text-stone-900 shadow-md ring-2 ring-emerald-400/20 scale-[1.01]'
                : 'bg-white hover:bg-stone-50/90 text-stone-900 border-stone-200 shadow-xs hover:shadow-sm hover:border-emerald-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`p-2.5 rounded-xl transition ${
                  selectedDepartment === 'MARAICHAGE'
                    ? 'bg-emerald-200/80 text-emerald-950 border border-emerald-400'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <Sprout className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    selectedDepartment === 'MARAICHAGE'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {countMaraichage} lots
                  </span>
                  {selectedDepartment === 'MARAICHAGE' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-700 text-white shadow-xs">
                      ✓ Actif
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-base font-black tracking-tight text-stone-900">
                Pépinières Maraîchage
              </h3>

              <p className="text-xs mt-1 leading-relaxed text-stone-600">
                Jeunes plants de légumes maraîchers professionnels, mottes pressées & plaques alvéolées, tomates greffées, poivrons, pastèques, melons & oignons.
              </p>

              {/* Varieties Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Plateaux Tomates greffées (104)', 'Plateaux Poivrons alvéolés', 'Plateaux Pastèques greffées', 'Mottes de tourbe pressée'].map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition ${
                      selectedDepartment === 'MARAICHAGE'
                        ? 'bg-white/80 text-emerald-950 border border-emerald-300/80'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Metrics & CTA */}
            <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs transition ${
              selectedDepartment === 'MARAICHAGE' ? 'border-emerald-200' : 'border-stone-100'
            }`}>
              <div>
                <span className="text-[10px] uppercase block text-stone-500">
                  Stock disponible
                </span>
                <span className="font-black text-sm text-emerald-900">
                  {plantsMaraichage.toLocaleString('fr-FR')} plants
                </span>
              </div>

              <div className={`flex items-center gap-1 font-bold text-xs ${
                selectedDepartment === 'MARAICHAGE' ? 'text-emerald-800' : 'text-stone-500 group-hover:text-emerald-800'
              }`}>
                <span>{selectedDepartment === 'MARAICHAGE' ? 'Filtre appliqué' : 'Filtrer'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* FENÊTRE 3: Pépinières Ornementale */}
          <div
            id="window-ornementale"
            onClick={() => {
              setSelectedDepartment(selectedDepartment === 'ORNEMENTALE' ? 'ALL' : 'ORNEMENTALE');
              setSelectedCategory('ALL');
            }}
            className={`group cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between border ${
              selectedDepartment === 'ORNEMENTALE'
                ? 'bg-teal-50/60 border-2 border-teal-600 text-stone-900 shadow-md ring-2 ring-teal-400/20 scale-[1.01]'
                : 'bg-white hover:bg-stone-50/90 text-stone-900 border-stone-200 shadow-xs hover:shadow-sm hover:border-teal-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`p-2.5 rounded-xl transition ${
                  selectedDepartment === 'ORNEMENTALE'
                    ? 'bg-teal-200/80 text-teal-950 border border-teal-400'
                    : 'bg-teal-50 text-teal-800 border border-teal-200'
                }`}>
                  <Flower2 className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    selectedDepartment === 'ORNEMENTALE'
                      ? 'bg-teal-100 text-teal-900 border-teal-300'
                      : 'bg-teal-50 text-teal-800 border border-teal-200'
                  }`}>
                    {countOrnementale} lots
                  </span>
                  {selectedDepartment === 'ORNEMENTALE' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-700 text-white shadow-xs">
                      ✓ Actif
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-base font-black tracking-tight text-stone-900">
                Pépinières Ornementale
              </h3>

              <p className="text-xs mt-1 leading-relaxed text-stone-600">
                Plantes ornementales, espaces verts & paysagisme, palmiers d'alignement (Washingtonia), bougainvilliers royaux, haies brise-vent & gazon en rouleau.
              </p>

              {/* Varieties Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Palmier Washingtonia conteneur', 'Bougainvillier tuteur bambou', 'Olivier sculpté Nuage Niwaki', 'Laurier-rose fleuri', 'Gazon naturel rouleaux'].map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition ${
                      selectedDepartment === 'ORNEMENTALE'
                        ? 'bg-white/80 text-teal-950 border border-teal-300/80'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Metrics & CTA */}
            <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs transition ${
              selectedDepartment === 'ORNEMENTALE' ? 'border-teal-200' : 'border-stone-100'
            }`}>
              <div>
                <span className="text-[10px] uppercase block text-stone-500">
                  Stock disponible
                </span>
                <span className="font-black text-sm text-teal-900">
                  {plantsOrnementale.toLocaleString('fr-FR')} plants
                </span>
              </div>

              <div className={`flex items-center gap-1 font-bold text-xs ${
                selectedDepartment === 'ORNEMENTALE' ? 'text-teal-800' : 'text-stone-500 group-hover:text-teal-800'
              }`}>
                <span>{selectedDepartment === 'ORNEMENTALE' ? 'Filtre appliqué' : 'Filtrer'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Active filters status bar & quick counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-stone-700">{tr(language, 'Affichage :', 'النتائج المعروضة :', 'Displaying:')}</span>
          <span className="px-2.5 py-1 rounded-lg bg-white text-stone-800 font-semibold border border-stone-200 shadow-xs">
            {filteredLots.length} {filteredLots.length > 1 ? tr(language, 'lots trouvés', 'دفعات', 'lots found') : tr(language, 'lot trouvé', 'دفعة', 'lot found')}
          </span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
              <span>{tr(language, 'Mot-clé :', 'بحث :', 'Keyword:')} &quot;{searchTerm}&quot;</span>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="hover:text-emerald-950 p-0.5 cursor-pointer"
                title={tr(language, 'Effacer', 'مسح', 'Clear')}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedDepartment !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-semibold border border-amber-200">
              <span>
                {selectedDepartment === 'ARBORICULTURE' && `🌳 ${tr(language, 'Arboriculture', 'أشجار مثمرة', 'Arboriculture')}`}
                {selectedDepartment === 'MARAICHAGE' && `🌱 ${tr(language, 'Maraîchage', 'خضروات', 'Market Gardening')}`}
                {selectedDepartment === 'ORNEMENTALE' && `🪴 ${tr(language, 'Ornementale', 'نباتات الزينة', 'Ornamental')}`}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDepartment('ALL')}
                className="hover:text-amber-950 p-0.5 cursor-pointer"
                title={tr(language, 'Toutes les catégories', 'جميع الفئات', 'All categories')}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedRegion !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-medium border border-stone-200">
              <span>📍 {selectedRegion}</span>
              <button
                type="button"
                onClick={() => setSelectedRegion('ALL')}
                className="hover:text-stone-950 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterLowStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs border border-rose-300 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{tr(language, 'Filtre: Lots en stock critique', 'تصفية: دفعات في مخزون حرج', 'Filter: Critical low stock lots')} ({lowStockLots.length})</span>
              <button
                type="button"
                onClick={() => setFilterLowStockOnly(false)}
                className="hover:text-rose-950 p-0.5 font-black text-sm ml-0.5 cursor-pointer"
                title={tr(language, 'Désactiver le filtre stock bas', 'تعطيل تصفية المخزون المنخفض', 'Disable low stock filter')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openFieldQRScannerModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            title={tr(language, 'Scanner ou vérifier le QR code d’un lot de pépinière', 'مسح أو التحقق من رمز QR لأي دفعة شتلات', 'Scan or verify batch QR code')}
          >
            <Scan className="w-3.5 h-3.5 text-emerald-300" />
            <span>{tr(language, 'Scanner QR Terrain', 'مسح الرمز الميداني', 'Scan Field QR')}</span>
          </button>

          {(selectedCategory !== 'ALL' || selectedRegion !== 'ALL' || selectedStage !== 'ALL' || selectedDepartment !== 'ALL' || searchTerm || filterLowStockOnly) && (
            <button
              onClick={() => {
                setSelectedDepartment('ALL');
                setSelectedCategory('ALL');
                setSelectedRegion('ALL');
                setSelectedStage('ALL');
                setSearchTerm('');
                setFilterLowStockOnly(false);
              }}
              className="text-stone-500 hover:text-stone-900 font-medium text-xs underline whitespace-nowrap cursor-pointer"
            >
              {tr(language, 'Réinitialiser tous les filtres', 'إعادة ضبط الفلاتر', 'Reset all filters')}
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredLots.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-xs">
          <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">
            {tr(language, 'Aucun lot de pépinière trouvé', 'لم يتم العثور على أي دفعة شتلات', 'No nursery lot found')}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {tr(
              language,
              'Aucun résultat ne correspond à vos filtres actuels. Essayez de réinitialiser la recherche ou créez un nouveau lot.',
              'لا توجد نتائج تطابق فلاترك الحالية. جرب إعادة ضبط البحث أو إنشاء دفعة جديدة.',
              'No results match your current filters. Try resetting the search or creating a new lot.'
            )}
          </p>
          {isNurseryOwner && (
            <button
              onClick={() => setIsCreatingLot(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
            >
              + {tr(language, 'Créer un lot', 'إنشاء دفعة', 'Create a lot')}
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredLots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLots.map(lot => {
            const dept = getDepartmentTag(lot.category);
            const isLowStock = isLotLowStock(lot);
            const lotThreshold = getLotThreshold(lot);
            const isSelected = selectedLotIds.has(lot.id);
            const stockStatus = getLotStockStatus(lot);

            return (
              <div
                key={lot.id}
                id={`card-nursery-${lot.id}`}
                onClick={() => {
                  if (isBulkEditMode) {
                    toggleSelectLot(lot.id);
                  }
                }}
                className={`bg-white rounded-2xl flex flex-col justify-between overflow-hidden group will-change-transform transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl active:-translate-y-0.5 active:shadow-md relative ${
                  isBulkEditMode ? 'cursor-pointer select-none' : ''
                } ${
                  isSelected
                    ? 'border-2 border-emerald-600 ring-4 ring-emerald-500/25 shadow-lg bg-emerald-50/15'
                    : isLowStock
                    ? 'border-2 border-rose-400 ring-2 ring-rose-200/50 shadow-md'
                    : 'border border-stone-200/90 shadow-xs'
                }`}
              >
                <div>
                  {/* Image Header & Badges */}
                  <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                    <SmartImage
                      src={lot.imageUrl || '/src/assets/images/nursery_olive_saplings_1789031030975.jpg'}
                      alt={lot.variety}
                      category={lot.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Bulk Selection Checkbox */}
                    {isBulkEditMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectLot(lot.id);
                        }}
                        className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-xl border backdrop-blur-md transition-all shadow-md cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-400 text-white scale-105 ring-2 ring-white/70'
                            : 'bg-stone-900/80 border-white/30 text-stone-200 hover:text-white hover:bg-stone-900'
                        }`}
                        title={isSelected ? 'Désélectionner ce lot' : 'Sélectionner ce lot pour modification en lot'}
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5 text-white" /> : <Square className="w-5 h-5" />}
                      </button>
                    )}

                    {/* Badges: Department & ONSSA & Boost/Pro & Low Stock Alert & Stock Status */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                      <div className="flex items-center gap-1 flex-wrap">
                        {isLowStock && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white backdrop-blur-xs border border-rose-300 shadow-sm animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-white" />
                            Alerte Stock Bas (&le; {lotThreshold})
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black backdrop-blur-xs border shadow-xs ${
                          stockStatus === 'In Stock'
                            ? 'bg-emerald-800/90 text-emerald-100 border-emerald-400/40'
                            : stockStatus === 'Reserved'
                            ? 'bg-amber-500 text-stone-950 border-amber-300'
                            : 'bg-rose-700 text-white border-rose-400/40'
                        }`}>
                          ● {stockStatus === 'In Stock' ? 'En Stock' : stockStatus === 'Reserved' ? 'Réservé' : 'Vendu'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-xs border shadow-xs ${dept.badgeClass}`}>
                          {dept.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/85 text-white backdrop-blur-xs border border-emerald-400/40">
                          <ShieldCheck className="w-3 h-3 text-emerald-300" />
                          {lot.onssaStatus.includes('Bleue') ? 'ONSSA Certifié' : 'ONSSA Homologué'}
                        </span>
                        {lot.verifiedAgriForex && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700 text-white backdrop-blur-xs border border-emerald-400/40 shadow-xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-200" />
                            Vérifié AgriForex
                          </span>
                        )}
                      </div>

                      {/* Monetization Badges: Boost & Pro Certified */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {lot.boostLevel && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs animate-pulse">
                            <Zap className="w-3 h-3 fill-white" />
                            {lot.boostLevel === 'flash_3d' ? 'En Tête (Flash 3j)' : lot.boostLevel === 'intensive_7d' ? 'En Vedette (7j)' : 'Méga Campagne'}
                          </span>
                        )}
                        {(lot.sellerIsPro || userProfile.isProCertified) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-stone-950 shadow-xs border border-amber-300">
                            <Award className="w-3 h-3 text-stone-950" />
                            Producteur PRO
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Batch Number & Interest Watch Alert */}
                    <div className={`absolute top-2.5 ${isBulkEditMode ? 'right-14' : 'right-2.5'} flex items-center gap-1.5 transition-all`}>
                      <button
                        id={`btn-watch-nursery-${lot.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addNurseryInterestWatch({
                            species: lot.species,
                            variety: lot.variety,
                            department: dept.label.includes('Arboriculture')
                              ? 'ARBORICULTURE'
                              : dept.label.includes('Maraîchage')
                              ? 'MARAICHAGE'
                              : 'ORNEMENTALE',
                            enabled: true,
                          });
                          openNotificationSettings('nursery_lots');
                        }}
                        className="p-1 rounded-md bg-stone-900/80 hover:bg-emerald-600 text-stone-200 hover:text-white backdrop-blur-xs border border-white/10 transition active:scale-90 cursor-pointer"
                        title={tr(
                          language,
                          "Être notifié des nouveaux arrivages pour cette espèce/variété",
                          "تلقي تنبيه عند وصول دفعات جديدة من هذا الصنف",
                          "Get alerts for new arrivals of this species/variety"
                        )}
                        aria-label="Alerte Nouveaux Arrivages"
                      >
                        <Bell className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                      <span className="font-mono text-[10px] font-bold px-2 py-1 rounded-md bg-stone-900/80 text-white backdrop-blur-xs border border-white/10">
                        {lot.batchNumber}
                      </span>
                    </div>

                    {/* Title & Species */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[10px] font-semibold text-emerald-300 block uppercase tracking-wider">
                        {lot.species}
                      </span>
                      <h3 className="text-base font-black tracking-tight leading-tight drop-shadow-xs">
                        {lot.variety}
                      </h3>
                    </div>
                  </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  {/* Stock Quantity & Price */}
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    isLowStock
                      ? 'bg-rose-50/90 border-rose-300 ring-1 ring-rose-400/30'
                      : 'bg-stone-50 border-stone-200/70'
                  }`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold block uppercase px-1.5 py-0.2 rounded ${
                          stockStatus === 'In Stock'
                            ? 'text-emerald-800 bg-emerald-100'
                            : stockStatus === 'Reserved'
                            ? 'text-amber-900 bg-amber-100'
                            : 'text-rose-800 bg-rose-100'
                        }`}>
                          {stockStatus === 'In Stock' ? 'En Stock' : stockStatus === 'Reserved' ? 'Réservé' : 'Vendu'}
                        </span>
                        {isLowStock && (
                          <span className="inline-flex items-center gap-0.5 text-[9.5px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-2xs">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Stock Critique
                          </span>
                        )}
                      </div>
                      <p className={`text-base font-black ${isLowStock ? 'text-rose-700' : 'text-stone-900'}`}>
                        {(lot.quantityAvailable ?? 0).toLocaleString('fr-FR')}{' '}
                        <span className="text-xs font-medium text-stone-500">plants</span>
                      </p>
                      {isLowStock && (
                        <span className="text-[10px] text-rose-600 font-semibold block leading-tight">
                          Seuil configuré: {(lotThreshold ?? 0).toLocaleString('fr-FR')} plants
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">
                        Prix Unitaire
                      </span>
                      <p className="text-base font-black text-emerald-800">
                        {lot.unitPriceMAD} <span className="text-xs font-semibold">MAD</span>
                      </p>
                    </div>
                  </div>

                  {/* Agricultural / Landscape Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {lot.category.includes('Ornement') || lot.ornamentalDetails ? (
                      <>
                        <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-100">
                          <span className="text-[10px] text-purple-700 block font-semibold">Silhouette / Port</span>
                          <span className="font-bold text-stone-900 truncate block text-[11px]">
                            {lot.ornamentalDetails?.plantForm || 'Buisson ramifié'}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-100">
                          <span className="text-[10px] text-purple-700 block font-semibold">Hauteur / Calibre</span>
                          <span className="font-bold text-purple-900 truncate block text-[11px]">
                            {lot.ornamentalDetails?.palmStipeHeight ||
                              lot.ornamentalDetails?.trunkCircumference ||
                              lot.ornamentalDetails?.plantHeight ||
                              lot.stage}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-400 block">Litrage Conteneur</span>
                          <span className="font-semibold text-stone-800 truncate block text-[11px]">
                            {lot.containerType}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-400 block">Exposition & Eau</span>
                          <span className="font-semibold text-stone-800 truncate block text-[11px]">
                            {lot.ornamentalDetails?.sunExposure || 'Plein soleil'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-400 block">Porte-greffe</span>
                          <span className="font-semibold text-stone-800 truncate block">
                            {lot.rootstock || 'Franc de semis'}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-400 block">Stade</span>
                          <span className="font-semibold text-emerald-800 truncate block">
                            {lot.stage}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-400 block">Conditionnement</span>
                          <span className="font-semibold text-stone-800 truncate block">
                            {lot.containerType}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-400 block">Localisation</span>
                          <span className="font-semibold text-stone-800 truncate block">
                            {lot.greenhouseLocation}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Quick stock adjustment controls - UNIQUEMENT PÉPINIÉRISTE */}
                  {isNurseryOwner ? (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-stone-500">Stock :</span>
                        {lot.lastUpdated === new Date().toISOString().split('T')[0] ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>À jour</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => adjustStockQuantity(lot.id, 0)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 text-[10px] font-bold border border-amber-300 transition cursor-pointer"
                            title="Valider en 1 tap que le stock est inchangé pour aujourd'hui"
                          >
                            <Check className="w-3 h-3 text-amber-700" />
                            <span>1-Tap Valider</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleProtectedStockAdjust(lot.id, -50, lot.batchNumber)}
                          className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                          title="Vendre / Sortie 50 plants"
                        >
                          -50
                        </button>
                        <button
                          onClick={() => handleProtectedStockAdjust(lot.id, -500, lot.batchNumber)}
                          className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                          title="Sortie commande 500 plants"
                        >
                          -500
                        </button>
                        <button
                          onClick={() => handleProtectedStockAdjust(lot.id, 100, lot.batchNumber)}
                          className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                          title="Entrée en stock +100 plants"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => handleProtectedStockAdjust(lot.id, 1000, lot.batchNumber)}
                          className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                          title="Entrée greffage +1000 plants"
                        >
                          +1000
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <span className="text-[11px] font-medium text-stone-600">
                        📦 {(lot.quantityAvailable ?? 0).toLocaleString('fr-FR')} plants certifiés en stock direct
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Disponibilité Immédiate
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-stone-50 border-t border-stone-200 space-y-2">
                {/* Primary Direct Modal Actions: Quick Buy & Negotiate or Owner Badge */}
                {isItemOwnedByUser(lot, userProfile, googleUser) ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 w-full">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[11px] font-extrabold">{tr(language, 'Votre lot en vente (Propriétaire)', 'دفعتك المعروضة (المالك)', 'Your lot for sale (Owner)')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleProtectedEditLot(lot)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-lg transition shadow-xs cursor-pointer"
                    >
                      {tr(language, 'Modifier le lot', 'تعديل الدفعة', 'Edit Lot')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {userProfile.role !== 'seller' && (
                      <button
                        id={`btn-quick-buy-lot-${lot.id}`}
                        type="button"
                        onClick={() =>
                          openEscrowPayment(
                            'nursery_lot',
                            lot,
                            Math.min(500, lot.quantityAvailable)
                          )
                        }
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-black shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                        title={tr(language, 'Achat Rapide : Payer avec compte séquestre sécurisé CMI / Stripe sans recharger la page', 'شراء سريع عبر الحساب البنكي الضامن دون مغادرة الصفحة', 'Quick Buy (opens escrow checkout modal without page reload)')}
                      >
                        <Zap className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                        <span className="tracking-wide">{tr(language, 'Achat Rapide', 'شراء سريع', 'Quick Buy')}</span>
                      </button>
                    )}

                    {/* Negotiate Icon Button */}
                    <button
                      id={`btn-negotiate-icon-nursery-${lot.id}`}
                      type="button"
                      onClick={() => openOfferDiscussion(lot.id, 'nursery', lot)}
                      className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                      title={tr(language, "Négocier : Ouvre directement le modal de négociation et d'offre sans rechargement de page", "تفاوض: فتح نافذة التفاوض مباشرة دون مغادرة الصفحة", "Negotiate: Directly open negotiation modal without page reload")}
                      aria-label={tr(language, 'Négocier', 'تفاوض', 'Negotiate')}
                    >
                      <Handshake className="w-4 h-4 text-amber-800 shrink-0" />
                      <span className="text-xs font-bold">{tr(language, 'Négocier', 'تفاوض', 'Negotiate')}</span>
                    </button>
                  </div>
                )}

                {/* Secondary Row: Booster (pour vendeurs/pépiniéristes) & Transport */}
                <div className={userProfile.role !== 'buyer' ? "grid grid-cols-2 gap-2" : "flex gap-2"}>
                  {userProfile.role !== 'buyer' && (
                    <button
                      id={`btn-boost-lot-${lot.id}`}
                      type="button"
                      onClick={() =>
                        openBoostModal(
                          'nursery',
                          lot.id,
                          `${lot.species} - ${lot.variety}`,
                          lot.boostLevel
                        )
                      }
                      className="min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white hover:bg-amber-50 active:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
                      title="Booster l'annonce pour la propulser en tête des résultats"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span className="truncate">Booster (50 MAD)</span>
                    </button>
                  )}

                  <button
                    id={`btn-logistics-lot-${lot.id}`}
                    type="button"
                    onClick={() =>
                      openLogisticsModal({
                        originCity: lot.region.split('(')[1]?.replace(')', '') || 'Agadir',
                        cargoType: lot.category.includes('Ornement') ? 'trees_pots' : 'plants_mottes',
                        volumeTonnes: Math.max(1, Math.round(lot.quantityAvailable * 0.0015)),
                        itemTitle: `${lot.species} - ${lot.variety}`,
                      })
                    }
                    className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title="Réserver un transporteur agréé (camion aéré, frigo ou plateau)"
                  >
                    <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Fret Transport</span>
                  </button>
                </div>

                {/* Row 3: Rating & Reviews */}
                <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
                  <button
                    id={`btn-rate-nursery-${lot.id}`}
                    type="button"
                    onClick={() =>
                      openRatingModal(
                        lot.sellerName || 'Pépiniériste Producteur',
                        `${lot.species} (${lot.variety})`,
                        lot.id
                      )
                    }
                    className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
                    title="Noter ce lot et ce producteur"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span>Avis & Note ({lot.rating || 4.9}★)</span>
                  </button>
                </div>

                {/* Row 3: Agronomic & Management Actions */}
                {isNurseryOwner ? (
                  <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-stone-200/60 flex-wrap">
                    <button
                      onClick={() =>
                        setQrModalBatch({
                          type: 'nursery',
                          id: lot.id,
                          batchNumber: lot.batchNumber,
                          title: `${lot.species} — ${lot.variety}`,
                          variety: lot.variety,
                          speciesOrCategory: lot.species,
                          region: lot.region,
                          quantityAvailable: lot.quantityAvailable,
                          unit: 'plants',
                          unitPriceMAD: lot.unitPriceMAD,
                          location: lot.greenhouseLocation || 'Serre pépinière',
                          healthOrCertifications: [lot.onssaStatus, lot.healthStatus],
                          phytosanitaryPassport: lot.phytosanitaryPassportNumber,
                          onssaStatus: lot.onssaStatus,
                          stageOrCalibre: lot.stage,
                          harvestOrSeedingDate: lot.seedingOrGraftDate,
                          sellerName: lot.sellerName || 'Pépinière Agréée',
                          notes: lot.notes,
                        })
                      }
                      className="min-h-[38px] flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                      title="Générer le QR code d'inventaire & étiquette"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>QR Code</span>
                    </button>

                    <button
                      id={`btn-lot-growth-${lot.id}`}
                      onClick={() => {
                        setGrowthTrendLotId(lot.id);
                        setIsGrowthTrendModalOpen(true);
                      }}
                      className="min-h-[38px] flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-teal-800 border border-teal-200 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                      title="Courbe de croissance D3 et historique du stock de ce lot"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>D3</span>
                    </button>

                    <button
                      onClick={() => setPassportLot(lot)}
                      className="min-h-[38px] flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
                      title="Passeport Phytosanitaire ONSSA"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Passeport</span>
                    </button>

                    <button
                      onClick={() => setTreatmentLot(lot)}
                      className="min-h-[38px] flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 active:bg-stone-100 text-stone-700 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
                      title="Historique des traitements"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Traitements ({lot.treatments?.length || 0})</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleProtectedEditLot(lot)}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 transition-all active:scale-95 cursor-pointer"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleProtectedDeleteLot(lot.id, lot.batchNumber)}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 transition-all active:scale-95 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
                    <button
                      type="button"
                      onClick={() =>
                        setQrModalBatch({
                          type: 'nursery',
                          id: lot.id,
                          batchNumber: lot.batchNumber,
                          title: `${lot.species} — ${lot.variety}`,
                          variety: lot.variety,
                          speciesOrCategory: lot.species,
                          region: lot.region,
                          quantityAvailable: lot.quantityAvailable,
                          unit: 'plants',
                          unitPriceMAD: lot.unitPriceMAD,
                          location: lot.greenhouseLocation || 'Serre pépinière',
                          healthOrCertifications: [lot.onssaStatus, lot.healthStatus],
                          phytosanitaryPassport: lot.phytosanitaryPassportNumber,
                          onssaStatus: lot.onssaStatus,
                          stageOrCalibre: lot.stage,
                          harvestOrSeedingDate: lot.seedingOrGraftDate,
                          sellerName: lot.sellerName || 'Pépinière Agréée',
                          notes: lot.notes,
                          rootstock: lot.rootstock,
                        })
                      }
                      className="min-h-[38px] px-2.5 py-2 rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title={tr(language, 'Générer le QR code de traçabilité terrain pour ce lot', 'عرض رمز QR لتتبع الدفعة', 'Show Field QR Code')}
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{tr(language, 'QR Lot', 'رمز الحصة', 'Batch QR')}</span>
                    </button>

                    <button
                      onClick={() => setPassportLot(lot)}
                      className="min-h-[38px] flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 text-xs font-bold transition cursor-pointer"
                      title="Consulter le Passeport Phytosanitaire Officiel ONSSA"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Passeport Sanitaire ONSSA</span>
                    </button>

                    <button
                      id={`btn-favorite-lot-${lot.id}`}
                      type="button"
                      onClick={() => toggleFavorite(lot.id)}
                      className={`min-h-[38px] px-3 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        isFavorite(lot.id)
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                      title={isFavorite(lot.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(lot.id) ? 'fill-rose-600 text-rose-600' : 'text-stone-400'}`} />
                      <span className="text-xs font-bold">{isFavorite(lot.id) ? 'Favori' : 'Enregistrer'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredLots.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-bold text-[10px]">
                <tr>
                  {isBulkEditMode && (
                    <th className="py-3 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={isAllFilteredSelected ? deselectAllLots : selectAllFilteredLots}
                        className="p-1 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                        title={isAllFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                      >
                        {isAllFilteredSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="py-3 px-4">Rayon</th>
                  <th className="py-3 px-4">N° Lot / Espèce</th>
                  <th className="py-3 px-4">Variété</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Porte-greffe / Forme</th>
                  <th className="py-3 px-4">Stade / Hauteur</th>
                  <th className="py-3 px-4">Disponible</th>
                  <th className="py-3 px-4">Prix (MAD)</th>
                  <th className="py-3 px-4">ONSSA</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredLots.map(lot => {
                  const dept = getDepartmentTag(lot.category);
                  const isLowStock = isLotLowStock(lot);
                  const lotThreshold = getLotThreshold(lot);
                  const isSelected = selectedLotIds.has(lot.id);
                  const stockStatus = getLotStockStatus(lot);

                  return (
                  <tr
                    key={lot.id}
                    onClick={() => {
                      if (isBulkEditMode) {
                        toggleSelectLot(lot.id);
                      }
                    }}
                    className={`transition ${
                      isBulkEditMode ? 'cursor-pointer select-none' : ''
                    } ${
                      isSelected
                        ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600'
                        : isLowStock
                        ? 'bg-rose-50/60 hover:bg-rose-100/50 border-l-4 border-l-rose-600'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    {isBulkEditMode && (
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleSelectLot(lot.id)}
                          className="p-1 rounded hover:bg-stone-200 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-300" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        lot.category.includes('Ornement')
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : lot.category.includes('Maraîch') || lot.category.includes('Légume')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : lot.category.includes('Arbres Fruitiers')
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-stone-100 text-stone-800 border border-stone-200'
                      }`}>
                        {dept.label.split(' ')[0]} {dept.label.split(' ')[1]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-stone-900 block">{lot.batchNumber}</span>
                      <span className="text-[11px] text-stone-500">{lot.species}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      <div className="flex items-center gap-1.5">
                        <span>{lot.variety}</span>
                        {isLowStock && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Stock bas
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        stockStatus === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : stockStatus === 'Reserved'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        ● {stockStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {lot.category.includes('Ornement') || lot.ornamentalDetails ? (
                        <span className="font-semibold text-purple-900">
                          {lot.ornamentalDetails?.plantForm || 'Port paysager'}
                        </span>
                      ) : (
                        lot.rootstock || 'Franc'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                          lot.category.includes('Ornement') || lot.ornamentalDetails
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {lot.category.includes('Ornement') || lot.ornamentalDetails
                          ? lot.ornamentalDetails?.palmStipeHeight ||
                            lot.ornamentalDetails?.trunkCircumference ||
                            lot.ornamentalDetails?.plantHeight ||
                            lot.stage
                          : lot.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-sm block ${isNurseryOwner && isLowStock ? 'text-rose-700 font-black' : 'text-emerald-800'}`}>
                            {(lot.quantityAvailable ?? 0).toLocaleString('fr-FR')}
                          </span>
                          {isNurseryOwner && (
                            lot.lastUpdated === new Date().toISOString().split('T')[0] ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded" title="Vérifié aujourd'hui">
                                ✓
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => adjustStockQuantity(lot.id, 0)}
                                className="text-[9px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 active:scale-95 px-1.5 py-0.5 rounded border border-amber-300 transition cursor-pointer"
                                title="Valider ce stock aujourd'hui en 1 tap"
                              >
                                1-Tap
                              </button>
                            )
                          )}
                        </div>
                        {isNurseryOwner && isLowStock && (
                          <span className="text-[9.5px] font-semibold text-rose-600 block">
                            &le; seuil {(lotThreshold ?? 0).toLocaleString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {lot.unitPriceMAD} MAD
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {lot.onssaStatus.includes('Bleue') ? 'Certifié' : 'Contrôlé'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isNurseryOwner ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              setQrModalBatch({
                                type: 'nursery',
                                id: lot.id,
                                batchNumber: lot.batchNumber,
                                title: `${lot.species} — ${lot.variety}`,
                                variety: lot.variety,
                                speciesOrCategory: lot.species,
                                region: lot.region,
                                quantityAvailable: lot.quantityAvailable,
                                unit: 'plants',
                                unitPriceMAD: lot.unitPriceMAD,
                                location: lot.greenhouseLocation || 'Serre pépinière',
                                healthOrCertifications: [lot.onssaStatus, lot.healthStatus],
                                phytosanitaryPassport: lot.phytosanitaryPassportNumber,
                                onssaStatus: lot.onssaStatus,
                                stageOrCalibre: lot.stage,
                                harvestOrSeedingDate: lot.seedingOrGraftDate,
                                sellerName: lot.sellerName || 'Pépinière Agréée',
                                notes: lot.notes,
                              })
                            }
                            className="p-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                            title="Générer le QR code d'inventaire"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setGrowthTrendLotId(lot.id);
                              setIsGrowthTrendModalOpen(true);
                            }}
                            className="p-1 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200"
                            title="Courbes de croissance D3 et historique du stock"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPassportLot(lot)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Passeport Phytosanitaire ONSSA"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTreatmentLot(lot)}
                            className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                            title="Traitements"
                          >
                            <FlaskConical className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleProtectedEditLot(lot)}
                            className="p-1 text-stone-600 hover:bg-stone-100 rounded"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleProtectedDeleteLot(lot.id, lot.batchNumber)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setQrModalBatch({
                                type: 'nursery',
                                id: lot.id,
                                batchNumber: lot.batchNumber,
                                title: `${lot.species} — ${lot.variety}`,
                                variety: lot.variety,
                                speciesOrCategory: lot.species,
                                region: lot.region,
                                quantityAvailable: lot.quantityAvailable,
                                unit: 'plants',
                                unitPriceMAD: lot.unitPriceMAD,
                                location: lot.greenhouseLocation || 'Serre pépinière',
                                healthOrCertifications: [lot.onssaStatus, lot.healthStatus],
                                phytosanitaryPassport: lot.phytosanitaryPassportNumber,
                                onssaStatus: lot.onssaStatus,
                                stageOrCalibre: lot.stage,
                                harvestOrSeedingDate: lot.seedingOrGraftDate,
                                sellerName: lot.sellerName || 'Pépinière Agréée',
                                notes: lot.notes,
                                rootstock: lot.rootstock,
                              })
                            }
                            className="p-1 text-emerald-800 bg-white hover:bg-emerald-50 rounded-lg border border-emerald-300"
                            title={tr(language, 'Afficher le QR code de traçabilité terrain', 'عرض رمز QR لتتبع الدفعة', 'Show Field QR Code')}
                          >
                            <QrCode className="w-4 h-4 text-emerald-700" />
                          </button>
                          <button
                            onClick={() => setPassportLot(lot)}
                            className="px-2 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1"
                            title="Passeport Phytosanitaire ONSSA"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Passeport</span>
                          </button>
                          {isItemOwnedByUser(lot, userProfile, googleUser) ? (
                            <span className="px-2 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 rounded-lg border border-amber-300">
                              {tr(language, 'Votre lot', 'دفعتك', 'Your lot')}
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => openEscrowPayment('nursery_lot', lot, Math.min(500, lot.quantityAvailable))}
                                className="px-2.5 py-1 text-xs font-black text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1 cursor-pointer"
                                title="Acheter avec compte séquestre sécurisé"
                              >
                                <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                                <span>Acheter</span>
                              </button>
                              <button
                                onClick={() => openOfferDiscussion(lot.id, 'nursery', lot)}
                                className="p-1 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 cursor-pointer"
                                title="Négocier ou demander un devis"
                              >
                                <Handshake className="w-4 h-4 text-amber-800" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleFavorite(lot.id)}
                            className={`p-1 rounded-lg border cursor-pointer ${
                              isFavorite(lot.id) ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-stone-400 hover:text-stone-600 border-stone-200'
                            }`}
                            title={isFavorite(lot.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite(lot.id) ? 'fill-rose-600' : ''}`} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State when no lots match */}
      {filteredLots.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 my-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              {tr(
                language,
                'Aucun lot de pépinière ne correspond à ces critères',
                'لم يتم العثور على أي دفعة شتلات تطابق هذا البحث',
                'No nursery lot matches these criteria'
              )}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              {tr(
                language,
                'Essayez de changer de rayon (Arboriculture, Maraîchage, Ornemental) ou de réinitialiser la recherche.',
                'جرب تغيير فئة النباتات أو إعادة تعيين معايير البحث.',
                'Try changing department (Arboriculture, Market Gardening, Ornamental) or resetting filters.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('ALL');
                setSelectedCategory('ALL');
                setSelectedStage('ALL');
                setSelectedRegion('ALL');
                setNurseryDepartmentFilter('ALL');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{tr(language, 'Réinitialiser les filtres', 'إعادة ضبط الفلاتر', 'Reset filters')}</span>
            </button>
            {isNurseryOwner && (
              <button
                type="button"
                onClick={() => setIsCreatingLot(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{tr(language, 'Enregistrer un nouveau lot', 'تسجيل دفعة جديدة', 'Register a new lot')}</span>
              </button>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Modals */}
      {passportLot && (
        <NurseryPassportModal lot={passportLot} onClose={() => setPassportLot(null)} />
      )}

      {treatmentLot && (
        <TreatmentModal
          lot={treatmentLot}
          onClose={() => setTreatmentLot(null)}
          onAddTreatment={addTreatmentLog}
        />
      )}

      {isLowStockSettingsModalOpen && (
        <LowStockSettingsModal onClose={() => setIsLowStockSettingsModalOpen(false)} />
      )}

      {(isCreatingLot || editingLot) && (
        <NurseryLotFormModal
          initialLot={editingLot}
          onClose={() => {
            setIsCreatingLot(false);
            setEditingLot(null);
          }}
          onSave={lotData => {
            if (editingLot) {
              updateNurseryLot(editingLot.id, lotData);
            } else {
              addNurseryLot(lotData);
            }
            setIsCreatingLot(false);
            setEditingLot(null);
          }}
        />
      )}

      {/* Modal QR Code Traçabilité & Inventaire */}
      {qrModalBatch && (
        <BatchQRCodeModal
          isOpen={Boolean(qrModalBatch)}
          onClose={() => setQrModalBatch(null)}
          batchData={qrModalBatch}
          onQuickStockAdjust={change => {
            adjustStockQuantity(qrModalBatch.id, change);
            setQrModalBatch(prev =>
              prev
                ? {
                    ...prev,
                    quantityAvailable: Math.max(0, prev.quantityAvailable + change),
                  }
                : null
            );
          }}
        />
      )}

      {/* Modal Quick Sync & Inventaire Quotidien */}
      {isQuickSyncModalOpen && (
        <QuickStockSyncModal
          isOpen={isQuickSyncModalOpen}
          onClose={() => setIsQuickSyncModalOpen(false)}
        />
      )}

      {/* Modal Rapports de Croissance & Performance des Stocks D3.js */}
      {isGrowthTrendModalOpen && (
        <NurseryGrowthTrendModal
          isOpen={isGrowthTrendModalOpen}
          onClose={() => {
            setIsGrowthTrendModalOpen(false);
            setGrowthTrendLotId(undefined);
          }}
          initialLotId={growthTrendLotId}
        />
      )}

      {/* Floating Bottom Bar for Bulk Edit Mode */}
      {isBulkEditMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto bg-stone-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex flex-wrap items-center justify-between sm:justify-start gap-3 animate-in slide-in-from-bottom-6 duration-200">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Sliders className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold">
              {selectedLotIds.size}{' '}
              <span className="text-stone-300 font-normal">
                {selectedLotIds.size > 1
                  ? tr(language, 'lots sélectionnés', 'دفعات محددة', 'lots selected')
                  : tr(language, 'lot sélectionné', 'دفعة محددة', 'lot selected')}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isAllFilteredSelected ? deselectAllLots : selectAllFilteredLots}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition cursor-pointer"
            >
              {isAllFilteredSelected
                ? tr(language, 'Désélectionner', 'إلغاء التحديد', 'Deselect')
                : tr(language, `Tout (${filteredLots.length})`, `تحديد الكل (${filteredLots.length})`, `All (${filteredLots.length})`)}
            </button>

            <button
              type="button"
              disabled={selectedLotIds.size === 0}
              onClick={() => setIsBulkModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>
                {tr(
                  language,
                  `Modifier Prix / Statut (${selectedLotIds.size})`,
                  `تعديل السعر / الحالة (${selectedLotIds.size})`,
                  `Bulk Edit Price / Status (${selectedLotIds.size})`
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsBulkEditMode(false);
                setSelectedLotIds(new Set());
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              title="Quitter le mode lot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Édition en Lot (Prix & Statut) */}
      {isBulkModalOpen && (
        <NurseryBulkEditModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          selectedLots={nurseryLots.filter((l) => selectedLotIds.has(l.id))}
          onApply={handleApplyBulkUpdates}
          language={language}
        />
      )}
    </div>
  );
};
