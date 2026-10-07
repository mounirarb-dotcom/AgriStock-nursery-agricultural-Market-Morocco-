import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation, tr } from '../../utils/translations';
import {
  PlatformStatus,
  ModerationStatus,
  UserRole,
  AdminAuditLog,
  UserProfile,
  OfferDiscussionThread,
  AdminModulePermission,
  AdministratorAccount,
} from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Sprout,
  Package,
  ShoppingCart,
  Lock,
  DollarSign,
  Truck,
  MessageSquare,
  Star,
  FileText,
  BarChart3,
  AlertTriangle,
  Zap,
  Settings,
  LogOut,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  TrendingUp,
  MapPin,
  Calendar,
  ChevronRight,
  Send,
  Building,
  Check,
  AlertOctagon,
  Key,
  EyeOff,
  SlidersHorizontal,
  UserCheck,
  Megaphone,
  DownloadCloud,
  Terminal,
} from 'lucide-react';
import { getCustomAdminKey, saveCustomAdminKey, ALL_ADMIN_MODULE_PERMISSIONS } from '../../services/adminFirestore';
import { AdminRoleManagementModal } from './AdminRoleManagementModal';
import { AdminAdsManagementView } from './AdminAdsManagementView';
import { DevMaintenanceView } from './DevMaintenanceView';

type AdminSubTab =
  | 'overview'
  | 'users'
  | 'nurseries'
  | 'stocks'
  | 'orders'
  | 'escrow'
  | 'commissions'
  | 'transport'
  | 'messages'
  | 'reviews'
  | 'documents'
  | 'disputes'
  | 'ads'
  | 'boosts'
  | 'audit_logs'
  | 'settings'
  | 'admin_roles'
  | 'dev_maintenance';

export const AdminDashboardView: React.FC = () => {
  const {
    language,
    adminSession,
    adminLogout,
    auditLogs,
    loadAuditLogs,
    platformSettings,
    updatePlatformSettings,
    userAccountsList,
    suspendUserAccount,
    reactivateUserAccount,
    updateUserRoleByAdmin,
    nurseryLots,
    produceListings,
    farmStandingListings,
    moderateListing,
    escrowTransactions,
    updateTransactionCommission,
    updateTransactionStatus,
    resolveDispute,
    toggleBoostListing,
    transportBookings,
    discussions,
    reviews,
    exportManifests,
    b2bAds,
    exportDataJSON,
    setActiveTab,
    administratorAccounts,
    switchAdminSessionPreview,
    hasAdminPermission,
    isSuperAdmin,
    toggleAdministratorStatus,
    validateUserProfessionalProfile,
  } = useApp();
  const t = useTranslation(language);

  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');
  const [isAdminRoleManagementModalOpen, setIsAdminRoleManagementModalOpen] = useState(false);

  const handleSuperAdminExportJSON = () => {
    try {
      const data = exportDataJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agristock_full_system_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || 'Erreur lors de l’export des données');
    }
  };

  // Search & Filter states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | UserRole | 'suspended'>('ALL');
  const [listingCategoryFilter, setListingCategoryFilter] = useState<'ALL' | 'nursery' | 'produce' | 'farm_standing'>('ALL');
  const [listingModerationFilter, setListingModerationFilter] = useState<'ALL' | ModerationStatus>('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | PlatformStatus>('ALL');
  const [auditLogSearch, setAuditLogSearch] = useState('');

  // Modals & Action dialog state
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserProfile | null>(null);
  const [suspensionReasonInput, setSuspensionReasonInput] = useState('');
  const [selectedListingForAction, setSelectedListingForAction] = useState<{
    id: string;
    title: string;
    type: 'nursery_lot' | 'produce' | 'farm_standing';
  } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const [selectedOrderForCommission, setSelectedOrderForCommission] = useState<{
    id: string;
    reference: string;
    currentRate: number;
    subtotal: number;
  } | null>(null);
  const [newCommissionPercentInput, setNewCommissionPercentInput] = useState('4.5');

  const [selectedDisputeForArbitrage, setSelectedDisputeForArbitrage] = useState<string | null>(null);
  const [disputeArbitrageRuling, setDisputeArbitrageRuling] = useState<'refund_buyer' | 'pay_seller' | 'split_50_50'>('split_50_50');
  const [disputeArbitrageNotes, setDisputeArbitrageNotes] = useState('');

  // Platform Settings state inputs
  const [settingsForm, setSettingsForm] = useState({
    defaultSellerCommissionRate: (platformSettings.defaultSellerCommissionRate * 100).toString(),
    defaultProCommissionRate: (platformSettings.defaultProCommissionRate * 100).toString(),
    defaultEscrowGuaranteeRate: (platformSettings.defaultEscrowGuaranteeRate * 100).toString(),
    minEscrowFeeMAD: platformSettings.minEscrowFeeMAD.toString(),
    platformNoticeBanner: platformSettings.platformNoticeBanner || '',
    maintenanceMode: platformSettings.maintenanceMode,
  });

  const [adminPasskeyInput, setAdminPasskeyInput] = useState(getCustomAdminKey() || 'AGRISTOCK@2026!ADMIN');
  const [showAdminPasskey, setShowAdminPasskey] = useState(false);
  const [passkeySavedToast, setPasskeySavedToast] = useState(false);

  const handleSaveCustomPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasskeyInput.trim()) return;
    saveCustomAdminKey(adminPasskeyInput.trim());
    setPasskeySavedToast(true);
    setTimeout(() => setPasskeySavedToast(false), 4000);
  };

  // Calculate Key Admin Metrics (GMV, Commissions, Active Escrow)
  const metrics = useMemo(() => {
    const totalGMVMAD = escrowTransactions.reduce((acc, tx) => acc + tx.subtotalAmountMAD, 0);
    const totalCommissionsMAD = escrowTransactions.reduce((acc, tx) => acc + tx.platformCommissionMAD, 0);
    const totalEscrowHeldMAD = escrowTransactions
      .filter((tx) => tx.status === 'funds_held' || tx.status === 'in_transit')
      .reduce((acc, tx) => acc + tx.totalPaidByBuyerMAD, 0);
    const disputedCount = escrowTransactions.filter((tx) => tx.status === 'disputed' || tx.adminStatus === 'LITIGE').length;

    const totalActiveLots = nurseryLots.length;
    const totalActiveProduce = produceListings.length;
    const totalActiveFarmStanding = farmStandingListings.length;
    const totalListings = totalActiveLots + totalActiveProduce + totalActiveFarmStanding;

    const pendingModerationLots = nurseryLots.filter((l) => l.moderationStatus === 'EN ATTENTE').length;
    const pendingModerationProduce = produceListings.filter((p) => p.moderationStatus === 'EN ATTENTE').length;
    const pendingModerationFarm = farmStandingListings.filter((f) => f.moderationStatus === 'EN ATTENTE').length;
    const pendingModerationTotal = pendingModerationLots + pendingModerationProduce + pendingModerationFarm;

    return {
      totalGMVMAD,
      totalCommissionsMAD,
      totalEscrowHeldMAD,
      disputedCount,
      totalUsers: userAccountsList.length,
      activeUsers: userAccountsList.filter((u) => u.status !== 'suspended').length,
      suspendedUsers: userAccountsList.filter((u) => u.status === 'suspended').length,
      totalListings,
      pendingModerationTotal,
    };
  }, [escrowTransactions, userAccountsList, nurseryLots, produceListings, farmStandingListings]);

  // Combined Listings for Moderation Table
  const combinedListings = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      category: string;
      type: 'nursery_lot' | 'produce' | 'farm_standing';
      seller: string;
      region: string;
      price: string;
      date: string;
      moderationStatus: ModerationStatus;
      moderationReason?: string;
      isBoosted?: boolean;
    }> = [];

    nurseryLots.filter(Boolean).forEach((lot) => {
      list.push({
        id: lot.id,
        title: `${lot.variety} (${lot.species}) - ${lot.batchNumber || 'N/A'}`,
        category: 'Pépinière & Plants',
        type: 'nursery_lot',
        seller: lot.sellerName || 'Pépiniériste Agréé',
        region: lot.region,
        price: `${lot.unitPriceMAD} MAD/plant (${lot.quantityAvailable} dispo)`,
        date: lot.lastUpdated,
        moderationStatus: lot.moderationStatus || 'VALIDÉ',
        moderationReason: lot.moderationReason,
        isBoosted: lot.isFeatured || Boolean(lot.boostLevel),
      });
    });

    produceListings.forEach((p) => {
      list.push({
        id: p.id,
        title: `${p.commodity} (${p.variety})`,
        category: `Marché: ${p.category}`,
        type: 'produce',
        seller: p.sellerName,
        region: p.region,
        price: `${p.pricePerKgMAD} MAD/kg (${p.availableQuantityTonnes} T)`,
        date: p.createdAt,
        moderationStatus: p.moderationStatus || 'VALIDÉ',
        moderationReason: p.moderationReason,
        isBoosted: p.isFeatured || Boolean(p.boostLevel),
      });
    });

    farmStandingListings.forEach((f) => {
      list.push({
        id: f.id,
        title: `Récolte sur pied: ${f.crop} (${f.variety})`,
        category: 'Récolte sur pied',
        type: 'farm_standing',
        seller: f.sellerName,
        region: f.region,
        price: `${f.pricePerHectareMAD.toLocaleString()} MAD/ha (${f.surfaceHectares} ha)`,
        date: f.createdAt,
        moderationStatus: f.moderationStatus || 'VALIDÉ',
        moderationReason: f.moderationReason,
        isBoosted: f.isFeatured || Boolean(f.boostLevel),
      });
    });

    return list.filter((item) => {
      if (listingCategoryFilter !== 'ALL' && item.type !== listingCategoryFilter) return false;
      if (listingModerationFilter !== 'ALL' && item.moderationStatus !== listingModerationFilter) return false;
      return true;
    });
  }, [nurseryLots, produceListings, farmStandingListings, listingCategoryFilter, listingModerationFilter]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return userAccountsList.filter((user) => {
      if (userRoleFilter === 'suspended') {
        if (user.status !== 'suspended') return false;
      } else if (userRoleFilter !== 'ALL') {
        if (user.role !== userRoleFilter) return false;
      }
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchName = user.displayName?.toLowerCase().includes(q);
        const matchCompany = user.companyName?.toLowerCase().includes(q);
        const matchPhone = user.phone?.includes(q);
        const matchEmail = user.email?.toLowerCase().includes(q);
        const matchRegion = user.region?.toLowerCase().includes(q);
        return matchName || matchCompany || matchPhone || matchEmail || matchRegion;
      }
      return true;
    });
  }, [userAccountsList, userRoleFilter, userSearchQuery]);

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    return escrowTransactions.filter((tx) => {
      if (orderStatusFilter === 'ALL') return true;
      const currentAdminStatus = tx.adminStatus || (
        tx.status === 'released' ? 'TERMINÉ' :
        tx.status === 'disputed' ? 'LITIGE' :
        tx.status === 'in_transit' ? 'EN COURS' :
        tx.status === 'delivered' ? 'VALIDÉ' : 'EN ATTENTE'
      );
      return currentAdminStatus === orderStatusFilter;
    });
  }, [escrowTransactions, orderStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (!auditLogSearch.trim()) return true;
      const q = auditLogSearch.toLowerCase();
      return (
        log.adminName.toLowerCase().includes(q) ||
        log.adminEmail.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        log.targetSummary.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    });
  }, [auditLogs, auditLogSearch]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePlatformSettings({
      defaultSellerCommissionRate: parseFloat(settingsForm.defaultSellerCommissionRate) / 100,
      defaultProCommissionRate: parseFloat(settingsForm.defaultProCommissionRate) / 100,
      defaultEscrowGuaranteeRate: parseFloat(settingsForm.defaultEscrowGuaranteeRate) / 100,
      minEscrowFeeMAD: parseFloat(settingsForm.minEscrowFeeMAD),
      platformNoticeBanner: settingsForm.platformNoticeBanner,
      maintenanceMode: settingsForm.maintenanceMode,
    });
    alert('Paramètres de la plateforme mis à jour avec succès dans Firestore !');
  };

  const isPreviewMode = Boolean(
    adminSession?.displayName?.includes('[Aperçu') ||
    adminSession?.displayName?.includes('(Aperçu')
  );

  const allSubTabs = useMemo(() => [
    { id: 'overview' as AdminSubTab, label: "Vue d'Ensemble", icon: BarChart3 },
    { id: 'users' as AdminSubTab, label: `Utilisateurs (${userAccountsList.length})`, icon: Users, permission: 'users' as AdminModulePermission },
    { id: 'stocks' as AdminSubTab, label: `Stocks & Annonces (${combinedListings.length})`, icon: Package, permission: 'market' as AdminModulePermission },
    { id: 'orders' as AdminSubTab, label: `Commandes (${escrowTransactions.length})`, icon: ShoppingCart, permission: 'market' as AdminModulePermission },
    { id: 'escrow' as AdminSubTab, label: 'Séquestre CMI', icon: Lock, permission: 'escrow' as AdminModulePermission },
    { id: 'commissions' as AdminSubTab, label: 'Commissions MAD', icon: DollarSign, permission: 'commissions' as AdminModulePermission },
    { id: 'nurseries' as AdminSubTab, label: 'Pépinières & Exploitations', icon: Sprout, permission: 'pepinieres' as AdminModulePermission },
    { id: 'transport' as AdminSubTab, label: `Transport (${transportBookings.length})`, icon: Truck, permission: 'transport' as AdminModulePermission },
    { id: 'messages' as AdminSubTab, label: `Négociations (${Object.keys(discussions).length})`, icon: MessageSquare, permission: 'moderation' as AdminModulePermission },
    { id: 'reviews' as AdminSubTab, label: `Avis (${reviews.length})`, icon: Star, permission: 'moderation' as AdminModulePermission },
    { id: 'documents' as AdminSubTab, label: `Documents (${exportManifests.length})`, icon: FileText, permission: 'documents' as AdminModulePermission },
    { id: 'disputes' as AdminSubTab, label: `Litiges (${metrics.disputedCount})`, icon: AlertTriangle, badge: metrics.disputedCount > 0, permission: 'escrow' as AdminModulePermission },
    { id: 'ads' as AdminSubTab, label: `Régie Publicités (${b2bAds.length})`, icon: Megaphone, permission: 'pub' as AdminModulePermission },
    { id: 'boosts' as AdminSubTab, label: 'Annonces Boost (Pub)', icon: Zap, permission: 'pub' as AdminModulePermission },
    { id: 'audit_logs' as AdminSubTab, label: `Journaux d'Audit (${auditLogs.length})`, icon: Clock, permission: 'audit' as AdminModulePermission },
    { id: 'admin_roles' as AdminSubTab, label: `Pouvoirs Admin (${administratorAccounts.length})`, icon: ShieldCheck, permission: 'admin_roles' as AdminModulePermission, superAdminOnly: true },
    { id: 'settings' as AdminSubTab, label: 'Paramètres', icon: Settings, permission: 'admin_roles' as AdminModulePermission },
    { id: 'dev_maintenance' as AdminSubTab, label: 'Développeur & Maintenance', icon: Terminal, permission: 'admin_roles' as AdminModulePermission },
  ], [
    userAccountsList.length,
    combinedListings.length,
    escrowTransactions.length,
    transportBookings.length,
    discussions,
    reviews.length,
    exportManifests.length,
    metrics.disputedCount,
    b2bAds.length,
    auditLogs.length,
    administratorAccounts.length,
  ]);

  const accessibleSubTabs = useMemo(() => {
    return allSubTabs.filter((tab) => {
      if (tab.superAdminOnly && !isSuperAdmin) return false;
      if (!tab.permission) return true;
      return hasAdminPermission(tab.permission);
    });
  }, [allSubTabs, hasAdminPermission, isSuperAdmin]);

  // Fallback if active tab is unauthorized
  useEffect(() => {
    const isAllowed = accessibleSubTabs.some((t) => t.id === activeSubTab);
    if (!isAllowed) {
      setActiveSubTab(accessibleSubTabs[0]?.id || 'overview');
    }
  }, [accessibleSubTabs, activeSubTab]);

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-16">
      {/* Top Admin Security Navbar */}
      <header className="sticky top-0 z-30 bg-[#0a1610] border-b border-purple-900/40 shadow-xl backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    AGRISTOCK MAROC — Espace Administrateur
                  </h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-400/30 font-bold">
                    RBAC SÉCURISÉ
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span>Connecté : <strong className="text-purple-300">{adminSession?.displayName || 'Mounir (Super Admin)'}</strong></span>
                  <span>•</span>
                  <span className="text-[11px] font-mono text-stone-400">{adminSession?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Super Admin Access Control Window Trigger */}
              {isSuperAdmin && (
                <button
                  id="btn-header-admin-roles"
                  type="button"
                  onClick={() => setIsAdminRoleManagementModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-950/60 transition cursor-pointer"
                  title="Fenêtre de réglage des pouvoirs d'accès et volets pour les administrateurs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Pouvoirs Admins</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                    {administratorAccounts.length}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => loadAuditLogs()}
                className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs flex items-center gap-1.5 transition"
                title="Synchroniser avec Firestore"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Synchroniser</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-semibold transition"
              >
                Retour Site
              </button>

              <button
                id="btn-admin-logout"
                type="button"
                onClick={() => adminLogout()}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs Bar (Gated by permissions) */}
          <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-stone-800/60 scrollbar-none text-xs">
            {accessibleSubTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as AdminSubTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 font-bold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Simulation Banner if viewing as simulated administrator */}
      {isPreviewMode && (
        <div className="bg-amber-950/95 border-b border-amber-500/60 px-4 py-2.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3 sticky top-14 sm:top-16 z-25 shadow-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>
              <strong>Mode Simulation des Droits :</strong> Vous testez la console en tant que{' '}
              <span className="font-bold underline text-white">{adminSession?.displayName}</span> (Volets autorisés :{' '}
              <span className="text-amber-300 font-mono font-bold">
                {adminSession?.permissions?.map((p) => (p ? String(p).toUpperCase() : '')).filter(Boolean).join(', ')}
              </span>
              ). Les volets non attribués sont automatiquement masqués.
            </span>
          </div>
          <button
            type="button"
            onClick={() => switchAdminSessionPreview(null)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition flex items-center gap-1.5 shrink-0 shadow cursor-pointer text-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Quitter la simulation & restaurer Super Admin</span>
          </button>
        </div>
      )}

      {/* Main Admin Content Body */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6">
        {/* ====================================================
            1. VUE D'ENSEMBLE & STATISTIQUES
           ==================================================== */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                  <span>Volume Global (GMV)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-stone-100 font-mono">
                  {metrics.totalGMVMAD.toLocaleString()} <span className="text-xs font-normal text-stone-400">MAD</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <span>Toutes transactions B2B</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/50 shadow-sm">
                <div className="flex items-center justify-between text-xs text-purple-300 mb-1">
                  <span>Commissions AGRISTOCK</span>
                  <DollarSign className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-200 font-mono">
                  {metrics.totalCommissionsMAD.toLocaleString()} <span className="text-xs font-normal text-purple-300/70">MAD</span>
                </div>
                <div className="text-[11px] text-purple-300 mt-1">
                  Taux moyen : ~4.5% par transaction
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                  <span>Fonds Sous Séquestre CMI</span>
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                  {metrics.totalEscrowHeldMAD.toLocaleString()} <span className="text-xs font-normal text-stone-400">MAD</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  En attente de livraison ou contrôle
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                  <span>Utilisateurs & Litiges</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-stone-100 font-mono">
                  {metrics.totalUsers} <span className="text-xs font-normal text-stone-400">inscrits</span>
                </div>
                <div className="text-[11px] mt-1 flex items-center justify-between">
                  <span className="text-emerald-400">{metrics.activeUsers} actifs</span>
                  {metrics.disputedCount > 0 ? (
                    <span className="text-rose-400 font-bold">{metrics.disputedCount} litige(s)</span>
                  ) : (
                    <span className="text-stone-400">0 litige</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Alerts Bar */}
            <div className="p-4 rounded-xl bg-stone-900/80 border border-purple-900/40 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-100 uppercase tracking-wider">
                    Console de Modération et Arbitrage Rapide
                  </h3>
                  <p className="text-xs text-stone-400">
                    {metrics.pendingModerationTotal} annonce(s) en attente • {metrics.disputedCount} litige(s) à arbitrer
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('ads')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Régie Publicités B2B ({b2bAds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('stocks')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  Modérer Annonces ({combinedListings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('escrow')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                >
                  Gérer Séquestre CMI
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('audit_logs')}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
                >
                  Voir Registre Audit
                </button>
              </div>
            </div>

            {/* Platform Overview Grid (Recent Transactions & Users) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders in Platform */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-stone-100">Dernières Commandes</h3>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('orders')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Tout afficher →
                  </button>
                </div>

                <div className="space-y-3">
                  {escrowTransactions.slice(0, 4).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-stone-200">{tx.referenceNumber}</div>
                        <div className="text-stone-400">{tx.itemTitle}</div>
                        <div className="text-stone-400 text-[11px] mt-0.5">
                          {tx.buyerName} → {tx.sellerName}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-emerald-400">{tx.totalPaidByBuyerMAD.toLocaleString()} MAD</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'released' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          tx.status === 'disputed' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {tx.adminStatus || tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Audit Activities */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-stone-100">Derniers Journaux d'Audit</h3>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('audit_logs')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Registre complet →
                  </button>
                </div>

                <div className="space-y-3">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-purple-300">{log.actionType}</span>
                        <span className="text-stone-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-stone-300">{log.targetSummary}</div>
                      <div className="text-[11px] text-stone-400">
                        Par: <strong>{log.adminName}</strong> ({log.adminEmail})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            2. GESTION DES UTILISATEURS
           ==================================================== */}
        {activeSubTab === 'users' && (
          <div className="space-y-4">
            {/* Filter and Search Toolbar */}
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, entreprise, téléphone, ville..."
                  className="w-full bg-transparent text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs overflow-x-auto">
                <span className="text-stone-400 whitespace-nowrap">Filtrer rôle:</span>
                {(['ALL', 'buyer', 'seller', 'nursery', 'carrier', 'suspended'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      userRoleFilter === r
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {r === 'ALL' ? 'Tous' :
                     r === 'buyer' ? 'Acheteurs' :
                     r === 'seller' ? 'Vendeurs' :
                     r === 'nursery' ? 'Pépinières' :
                     r === 'carrier' ? 'Transporteurs' : 'Suspendus'}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Utilisateur / Entreprise</th>
                      <th className="py-3.5 px-4 font-bold">Rôle</th>
                      <th className="py-3.5 px-4 font-bold">Région & Téléphone</th>
                      <th className="py-3.5 px-4 font-bold">Statut Compte</th>
                      <th className="py-3.5 px-4 font-bold">Badge PRO / Avis</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions Administrateur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-medium">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-stone-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-100 text-sm">{user.displayName || 'Utilisateur'}</div>
                          <div className="text-stone-400 text-xs">{user.companyName || 'Compte individuel'}</div>
                          {user.email && <div className="text-[11px] text-stone-400">{user.email}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                            user.role === 'nursery' ? 'bg-teal-950 text-teal-300 border border-teal-800' :
                            user.role === 'carrier' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                            user.role === 'seller' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {user.role}
                          </span>
                          {user.roles && user.roles.length > 1 && (
                            <div className="text-[10px] text-stone-400 mt-1">
                              +{user.roles.filter(r => r !== user.role).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-stone-200">{user.region}</div>
                          <div className="text-stone-400 font-mono text-[11px]">{user.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {user.status === 'suspended' ? (
                            <div>
                              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">
                                ⛔ SUSPENDU
                              </span>
                              {user.suspendedReason && (
                                <p className="text-[10px] text-rose-400 mt-1 max-w-[200px] truncate" title={user.suspendedReason}>
                                  Motif: {user.suspendedReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                                ✓ ACTIF
                              </span>
                              {user.verificationStatus === 'pending_verification' && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-bold text-[9px] flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                                    <span>À vérifier</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {user.isProCertified && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                                PRO
                              </span>
                            )}
                            <span className="text-amber-400 font-bold">★ {user.rating || 5.0}</span>
                            <span className="text-stone-400 text-[10px]">({user.reviewsCount || 0})</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Validation PRO button if pending */}
                            {user.verificationStatus === 'pending_verification' && (
                              <button
                                type="button"
                                onClick={() => validateUserProfessionalProfile(user.id, 'verified')}
                                className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] transition cursor-pointer shadow-xs"
                                title="Valider les documents et le profil professionnel de cet utilisateur"
                              >
                                ✓ Valider PRO
                              </button>
                            )}

                            {/* Role switch menu */}
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRoleByAdmin(user.id, e.target.value as UserRole)}
                              className="px-2 py-1 rounded bg-stone-950 border border-stone-700 text-stone-200 text-[11px] focus:outline-none focus:border-purple-500"
                            >
                              <option value="buyer">Acheteur</option>
                              <option value="seller">Vendeur</option>
                              <option value="nursery">Pépiniériste</option>
                              <option value="carrier">Transporteur</option>
                              <option value="admin">Admin</option>
                            </select>

                            {/* Suspend / Reactivate button */}
                            {user.status === 'suspended' ? (
                              <button
                                type="button"
                                onClick={() => reactivateUserAccount(user.id, user.displayName || user.companyName || 'Utilisateur')}
                                className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[11px] font-bold transition"
                              >
                                Réactiver
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForAction(user);
                                  setSuspensionReasonInput('Non-respect des règles de la plateforme ou fraude');
                                }}
                                className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 text-[11px] font-bold transition"
                              >
                                Suspendre
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            3. STOCKS ET ANNONCES (MODÉRATION)
           ==================================================== */}
        {activeSubTab === 'stocks' && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-400">Type de stock:</span>
                <select
                  value={listingCategoryFilter}
                  onChange={(e) => setListingCategoryFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-200 focus:outline-none"
                >
                  <option value="ALL">Toutes les catégories</option>
                  <option value="nursery">Pépinières & Plants</option>
                  <option value="produce">Récoltes Maraîchères & Fruits</option>
                  <option value="farm_standing">Récoltes Sur Pied</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-400">Statut de modération:</span>
                {(['ALL', 'VALIDÉ', 'EN ATTENTE', 'REFUSÉ', 'LITIGE'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setListingModerationFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      listingModerationFilter === st
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Listings Moderation Table */}
            <div className="rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Produit / Annonce</th>
                      <th className="py-3.5 px-4 font-bold">Catégorie</th>
                      <th className="py-3.5 px-4 font-bold">Vendeur & Région</th>
                      <th className="py-3.5 px-4 font-bold">Tarif / Quantité</th>
                      <th className="py-3.5 px-4 font-bold">Statut Modération</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions de Modération</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-medium">
                    {combinedListings.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-100 text-sm">{item.title}</div>
                          <div className="text-stone-400 text-[11px] font-mono">ID: {item.id}</div>
                          {item.isBoosted && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold">
                              ⚡ BOOST ACTIF
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px] font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-stone-200 font-semibold">{item.seller}</div>
                          <div className="text-stone-400 text-[11px]">{item.region}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400">
                          {item.price}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.moderationStatus === 'VALIDÉ' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            item.moderationStatus === 'REFUSÉ' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            item.moderationStatus === 'LITIGE' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                            'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {item.moderationStatus}
                          </span>
                          {item.moderationReason && (
                            <div className="text-[10px] text-rose-400 mt-1 max-w-[200px] truncate" title={item.moderationReason}>
                              Motif: {item.moderationReason}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => moderateListing(item.id, item.title, item.type, 'VALIDÉ')}
                              className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[11px] font-bold transition flex items-center gap-1"
                              title="Valider cette annonce"
                            >
                              <Check className="w-3 h-3" />
                              <span>Valider</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedListingForAction({ id: item.id, title: item.title, type: item.type });
                                setRejectionReasonInput('Photos non conformes ou absence de traçabilité ONSSA');
                              }}
                              className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 text-[11px] font-bold transition flex items-center gap-1"
                              title="Refuser avec motif"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Refuser</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            4. COMMANDES ET TRANSACTIONS (STATUTS)
           ==================================================== */}
        {activeSubTab === 'orders' && (
          <div className="space-y-4">
            {/* Toolbar status filter */}
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-400 font-bold">Filtrer par Statut de Commande :</span>
                {(['ALL', 'EN ATTENTE', 'VALIDÉ', 'EN COURS', 'TERMINÉ', 'ANNULÉ', 'LITIGE'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      orderStatusFilter === st
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Réf. Commande / Produit</th>
                      <th className="py-3.5 px-4 font-bold">Acheteur</th>
                      <th className="py-3.5 px-4 font-bold">Vendeur</th>
                      <th className="py-3.5 px-4 font-bold">Montant Total MAD</th>
                      <th className="py-3.5 px-4 font-bold">Commission AGRISTOCK</th>
                      <th className="py-3.5 px-4 font-bold">Statut Actuel</th>
                      <th className="py-3.5 px-4 font-bold text-right">Changer Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-medium">
                    {filteredOrders.map((tx) => {
                      const currentStatus: PlatformStatus = tx.adminStatus || (
                        tx.status === 'released' ? 'TERMINÉ' :
                        tx.status === 'disputed' ? 'LITIGE' :
                        tx.status === 'in_transit' ? 'EN COURS' :
                        tx.status === 'delivered' ? 'VALIDÉ' : 'EN ATTENTE'
                      );
                      return (
                        <tr key={tx.id} className="hover:bg-stone-800/30 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-stone-100 font-mono text-sm">{tx.referenceNumber}</div>
                            <div className="text-stone-300">{tx.itemTitle}</div>
                            <div className="text-[11px] text-stone-400 font-mono mt-0.5">{tx.paymentDate}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-stone-200 font-bold">{tx.buyerName}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{tx.buyerPhone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-stone-200 font-bold">{tx.sellerName}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{tx.sellerPhone || 'Non renseigné'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-stone-100">
                            {tx.totalPaidByBuyerMAD.toLocaleString()} MAD
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-purple-300 font-bold">
                              {tx.platformCommissionMAD.toLocaleString()} MAD
                            </div>
                            <div className="text-[10px] text-stone-400">
                              Taux : {(tx.platformCommissionRate * 100).toFixed(1)}%
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wide uppercase ${
                              currentStatus === 'TERMINÉ' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              currentStatus === 'LITIGE' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              currentStatus === 'EN COURS' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              currentStatus === 'VALIDÉ' ? 'bg-teal-950 text-teal-300 border border-teal-800' :
                              currentStatus === 'ANNULÉ' ? 'bg-stone-800 text-stone-400 border border-stone-700' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {currentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <select
                                value={currentStatus}
                                onChange={(e) => updateTransactionStatus(tx.id, e.target.value as PlatformStatus)}
                                className="px-2 py-1 rounded bg-stone-950 border border-stone-700 text-stone-200 text-[11px] focus:outline-none focus:border-purple-500 font-bold"
                              >
                                <option value="EN ATTENTE">EN ATTENTE</option>
                                <option value="VALIDÉ">VALIDÉ</option>
                                <option value="EN COURS">EN COURS</option>
                                <option value="TERMINÉ">TERMINÉ</option>
                                <option value="ANNULÉ">ANNULÉ</option>
                                <option value="LITIGE">LITIGE</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForCommission({
                                    id: tx.id,
                                    reference: tx.referenceNumber,
                                    currentRate: tx.platformCommissionRate,
                                    subtotal: tx.subtotalAmountMAD,
                                  });
                                  setNewCommissionPercentInput((tx.platformCommissionRate * 100).toString());
                                }}
                                className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-purple-300 border border-stone-700 text-[11px]"
                                title="Modifier la commission"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

        {/* ====================================================
            5. TRANSACTIONS EN SÉQUESTRE CMI
           ==================================================== */}
        {activeSubTab === 'escrow' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 flex items-start gap-3">
              <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-200/90 leading-relaxed">
                <strong className="text-purple-300">Protocole de Séquestre Bancaire B2B AGRISTOCK :</strong> Les fonds de l'acheteur sont bloqués en compte séquestre tiers certifié CMI / Attijariwafa Bank jusqu'à inspection contradictoire de la livraison. L'administrateur peut débloquer les fonds en faveur du vendeur ou geler le compte en cas de non-conformité.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {escrowTransactions.map((tx) => (
                <div key={tx.id} className="p-5 rounded-xl bg-stone-900 border border-stone-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                    <span className="font-mono font-bold text-sm text-stone-200">{tx.referenceNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.status === 'released' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      tx.status === 'disputed' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {tx.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-stone-300">
                    <div><strong>Produit :</strong> {tx.itemTitle}</div>
                    <div><strong>Acheteur :</strong> {tx.buyerName} ({tx.destinationCity})</div>
                    <div><strong>Vendeur :</strong> {tx.sellerName}</div>
                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between font-mono">
                      <span>Fonds consignés :</span>
                      <strong className="text-emerald-400 text-sm">{tx.totalPaidByBuyerMAD.toLocaleString()} MAD</strong>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-stone-400">
                      <span>Net vendeur après livraison :</span>
                      <span>{tx.sellerPayoutAmountMAD.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-purple-300">
                      <span>Commission plateforme :</span>
                      <span>{tx.platformCommissionMAD.toLocaleString()} MAD</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center gap-2 text-xs">
                    {tx.status !== 'released' ? (
                      <button
                        type="button"
                        onClick={() => updateTransactionStatus(tx.id, 'TERMINÉ', 'Déblocage ordonné par l\'administration')}
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Débloquer au Vendeur</span>
                      </button>
                    ) : (
                      <div className="w-full py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-center font-bold text-[11px]">
                        ✓ Fonds versés avec succès
                      </div>
                    )}

                    {tx.status !== 'disputed' && (
                      <button
                        type="button"
                        onClick={() => updateTransactionStatus(tx.id, 'LITIGE', 'Compte séquestre gelé par l\'administration suite à réclamation')}
                        className="py-1.5 px-3 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold transition"
                        title="Bloquer en conservatoire"
                      >
                        Geler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            6. COMMISSIONS & PAIEMENTS
           ==================================================== */}
        {activeSubTab === 'commissions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-xs text-stone-400">Total Commissions Encaissées</span>
                <div className="text-2xl font-black text-purple-300 font-mono mt-1">
                  {metrics.totalCommissionsMAD.toLocaleString()} MAD
                </div>
                <p className="text-xs text-stone-400 mt-1">Chiffre d'affaires net AGRISTOCK Maroc</p>
              </div>

              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-xs text-stone-400">Taux Standard Actif</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {(platformSettings.defaultSellerCommissionRate * 100).toFixed(1)} %
                </div>
                <p className="text-xs text-stone-400 mt-1">Appliqué sur les vendeurs standards</p>
              </div>

              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-xs text-stone-400">Taux Préférentiel Producteur PRO</span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                  {(platformSettings.defaultProCommissionRate * 100).toFixed(1)} %
                </div>
                <p className="text-xs text-stone-400 mt-1">Avantage abonnement annuel PRO</p>
              </div>
            </div>

            {/* Commissions details table with override capability */}
            <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-100">
                  Gestion des Commissions Spécifiques par Transaction
                </h3>
                <span className="text-xs text-stone-400">
                  L'administrateur peut réajuster le taux d'une transaction spéciale à tout moment.
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">Réf. Transaction</th>
                      <th className="py-3 px-4 font-bold">Sous-total Vente</th>
                      <th className="py-3 px-4 font-bold">Taux Commission</th>
                      <th className="py-3 px-4 font-bold">Montant Prélèvement MAD</th>
                      <th className="py-3 px-4 font-bold">Net Reversé Vendeur</th>
                      <th className="py-3 px-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-mono">
                    {escrowTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-stone-800/30 transition">
                        <td className="py-3 px-4 text-stone-200 font-bold">{tx.referenceNumber}</td>
                        <td className="py-3 px-4">{tx.subtotalAmountMAD.toLocaleString()} MAD</td>
                        <td className="py-3 px-4 text-purple-300 font-bold">{(tx.platformCommissionRate * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{tx.platformCommissionMAD.toLocaleString()} MAD</td>
                        <td className="py-3 px-4 text-stone-300">{tx.sellerPayoutAmountMAD.toLocaleString()} MAD</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForCommission({
                                id: tx.id,
                                reference: tx.referenceNumber,
                                currentRate: tx.platformCommissionRate,
                                subtotal: tx.subtotalAmountMAD,
                              });
                              setNewCommissionPercentInput((tx.platformCommissionRate * 100).toString());
                            }}
                            className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700 text-xs font-sans font-bold transition"
                          >
                            Ajuster
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            7. PÉPINIÈRES ET EXPLOITATIONS
           ==================================================== */}
        {activeSubTab === 'nurseries' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-100">Registre des Pépinières Certifiées ONSSA</h3>
                <p className="text-xs text-stone-400">Contrôle des agréments sanitaires et traçabilité des lots d'agrumes, oliviers et plants</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-teal-950 text-teal-300 border border-teal-800 text-xs font-bold font-mono">
                {nurseryLots.length} Lots Répertoriés
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nurseryLots.filter(Boolean).map((lot) => (
                <div key={lot.id} className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="font-mono font-bold text-xs text-teal-400">{lot.batchNumber || 'N/A'}</span>
                    <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-bold">
                      {lot.onssaStatus}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-stone-300">
                    <div className="font-bold text-stone-100 text-sm">{lot.variety}</div>
                    <div className="text-stone-400">{lot.species}</div>
                    <div><strong>Passeport Phytosanitaire :</strong> <span className="font-mono text-stone-300">{lot.phytosanitaryPassportNumber}</span></div>
                    <div><strong>Région :</strong> {lot.region}</div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800 font-mono">
                      <span>Stock disponible :</span>
                      <strong className="text-emerald-400">{lot.quantityAvailable} / {lot.quantityTotal} plants</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            8. TRANSPORT & LIVRAISONS
           ==================================================== */}
        {activeSubTab === 'transport' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-100">Supervision Logistique & Fret Frigorifique</h3>
                <p className="text-xs text-stone-400">Suivi des tournées régionales et respect de la chaîne du froid</p>
              </div>
            </div>

            <div className="rounded-xl bg-stone-900 border border-stone-800 overflow-hidden">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Réf. Transport</th>
                    <th className="py-3.5 px-4 font-bold">Trajet (Départ → Arrivée)</th>
                    <th className="py-3.5 px-4 font-bold">Cargaison / Poids</th>
                    <th className="py-3.5 px-4 font-bold">Véhicule</th>
                    <th className="py-3.5 px-4 font-bold">Statut Fret</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-medium">
                  {transportBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{b.bookingRef}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-200">{b.originCity} → {b.destinationCity}</div>
                        <div className="text-[11px] text-stone-400">{b.distanceKm} km (~{b.estimatedDurationHours}h de route)</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-stone-200">{b.cargoType}</div>
                        <div className="font-mono text-emerald-400">{b.volumeTonnes} Tonnes</div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">{b.vehicleType}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold uppercase">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================
            9. MESSAGES & NÉGOCIATIONS
           ==================================================== */}
        {activeSubTab === 'messages' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-200/90 leading-relaxed">
                <strong>Surveillance IA & Anti-Fraude :</strong> Modération active des échanges entre acheteurs et producteurs. Les tentatives d'évasion de commissions ou d'échange de numéros non sécurisés sont signalées pour protéger la garantie de paiement séquestre.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.values(discussions || {}) as OfferDiscussionThread[]).map((thread) => (
                <div key={thread.offerId} className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="font-bold text-sm text-stone-100">{thread.offerTitle}</span>
                    <span className="text-[11px] font-mono text-stone-400">{thread.messages.length} message(s)</span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1 text-xs">
                    {thread.messages.map((m) => (
                      <div key={m.id} className="p-2 rounded bg-stone-950 border border-stone-800/80">
                        <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                          <strong className="text-stone-300">{m.senderName} ({m.senderRole})</strong>
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-stone-200">{m.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            10. AVIS & SIGNALEMENTS
           ==================================================== */}
        {activeSubTab === 'reviews' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-100">Évaluations et Avis Clients</h3>
                <p className="text-xs text-stone-400">Modération des notes et signalements d'abus</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                      {'★'.repeat(rev.rating)}
                      <span className="text-stone-400 font-normal">({rev.rating}/5)</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">{rev.date}</span>
                  </div>

                  <p className="text-xs text-stone-200 italic">« {rev.comment} »</p>

                  <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                    <span>Auteur: <strong className="text-stone-300">{rev.buyerName}</strong></span>
                    <span>Cible: <strong className="text-stone-300">{rev.targetSellerName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            11. DOCUMENTS & CERTIFICATS
           ==================================================== */}
        {activeSubTab === 'documents' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-100">Documents Phytosanitaires & Manifestes d'Exportation</h3>
                <p className="text-xs text-stone-400">Conformité Morocco Foodex A4, douanes BADR et certificats ONSSA</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 text-xs font-mono font-bold">
                {exportManifests.length} Documents Validés
              </span>
            </div>

            <div className="rounded-xl bg-stone-900 border border-stone-800 overflow-hidden">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">N° Manifeste Foodex</th>
                    <th className="py-3.5 px-4 font-bold">Exportateur / Destinataire</th>
                    <th className="py-3.5 px-4 font-bold">Produit / Code SH</th>
                    <th className="py-3.5 px-4 font-bold">Agrément Station</th>
                    <th className="py-3.5 px-4 font-bold">Poids Net</th>
                    <th className="py-3.5 px-4 font-bold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-medium">
                  {exportManifests.map((m) => (
                    <tr key={m.id} className="hover:bg-stone-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-100">{m.manifestNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-200">{m.exporterName}</div>
                        <div className="text-stone-400 text-[11px]">{m.destinationCountry} ({m.portOfEntry})</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-stone-200">{m.commodity}</div>
                        <div className="font-mono text-[11px] text-stone-400">Code SH: {m.hsCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-teal-400">{m.stationApprovalNumber}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{m.netWeightKg.toLocaleString()} kg</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================
            12. LITIGES ET ARBITRAGES
           ==================================================== */}
        {activeSubTab === 'disputes' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200/90 leading-relaxed">
                <strong>Chambre d'Arbitrage Commerciale AGRISTOCK :</strong> En cas d'écart de calibre, retard ou casse sous chaîne du froid, l'administrateur rend une décision finale contraignante : Remboursement intégral acheteur, paiement du vendeur, ou accord transactionnel 50/50.
              </div>
            </div>

            <div className="space-y-4">
              {escrowTransactions.filter((tx) => tx.status === 'disputed' || tx.adminStatus === 'LITIGE').map((tx) => (
                <div key={tx.id} className="p-5 rounded-xl bg-stone-900 border border-rose-900/50 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div>
                      <span className="font-mono font-bold text-sm text-stone-100">{tx.referenceNumber}</span>
                      <span className="ml-2 text-stone-300 text-xs font-bold">— {tx.itemTitle}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold">
                      DOSSIER CONTENTIEUX ACTIF
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-950 p-3 rounded-lg border border-stone-800">
                    <div>
                      <span className="text-stone-400">Acheteur réclamant :</span>
                      <div className="font-bold text-stone-200 mt-0.5">{tx.buyerName}</div>
                      <div className="text-[11px] font-mono text-stone-400">{tx.buyerPhone}</div>
                    </div>
                    <div>
                      <span className="text-stone-400">Vendeur concerné :</span>
                      <div className="font-bold text-stone-200 mt-0.5">{tx.sellerName}</div>
                      <div className="text-[11px] font-mono text-stone-400">{tx.sellerPhone}</div>
                    </div>
                    <div>
                      <span className="text-stone-400">Montant sous séquestre gelé :</span>
                      <div className="font-bold font-mono text-emerald-400 text-sm mt-0.5">{tx.totalPaidByBuyerMAD.toLocaleString()} MAD</div>
                    </div>
                  </div>

                  {tx.disputeReason && (
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200">
                      <strong>Motif de la réclamation :</strong> {tx.disputeReason}
                    </div>
                  )}

                  {tx.disputeRuling ? (
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-200 flex items-center justify-between">
                      <div>
                        <strong>Arbitrage rendu :</strong> <span className="font-mono">{tx.disputeRuling}</span>
                        {tx.disputeResolvedBy && <span className="ml-2 text-[11px] text-stone-400">par {tx.disputeResolvedBy}</span>}
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">{tx.disputeResolvedAt}</span>
                    </div>
                  ) : (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDisputeForArbitrage(tx.id);
                          setDisputeArbitrageRuling('refund_buyer');
                          setDisputeArbitrageNotes('Remboursement intégral acheteur pour non-conformité constatée');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                      >
                        Rembourser Acheteur (100%)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDisputeForArbitrage(tx.id);
                          setDisputeArbitrageRuling('pay_seller');
                          setDisputeArbitrageNotes('Rejet de la réclamation, conformité du lot établie');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                      >
                        Payer Vendeur (100%)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDisputeForArbitrage(tx.id);
                          setDisputeArbitrageRuling('split_50_50');
                          setDisputeArbitrageNotes('Accord à l\'amiable 50% acheteur et 50% vendeur');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                      >
                        Accord Transactionnel 50/50
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {escrowTransactions.filter((tx) => tx.status === 'disputed' || tx.adminStatus === 'LITIGE').length === 0 && (
                <div className="p-8 text-center text-stone-400 bg-stone-900 rounded-xl border border-stone-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-stone-200">Aucun litige ouvert</p>
                  <p className="text-xs text-stone-500 mt-1">Toutes les transactions se déroulent sous le protocole de conformité.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            12.5. RÉGIE PUBLICITAIRE & GESTION DES PUBS B2B
           ==================================================== */}
        {activeSubTab === 'ads' && (
          <AdminAdsManagementView />
        )}

        {/* ====================================================
            13. ANNONCES BOOST
           ==================================================== */}
        {activeSubTab === 'boosts' && (
          <div className="space-y-4">
            {/* Quick Switch Banner to Ads Management */}
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-200">
                <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Vous gérez ici les boosts sponsorisés des annonces agricoles. Pour créer, éditer ou facturer les bannières publicitaires des marques et partenaires B2B (engrais, irrigation...), utilisez la <strong>Régie Publicités</strong>.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('ads')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
              >
                <span>Ouvrir Régie Pubs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-100">Gestion des Annonces en Tête (Boost Sponsorisé)</h3>
                <p className="text-xs text-stone-400">Activation, prolongation et révocation des options Flash, Intensif et Méga</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combinedListings.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 font-mono">{item.type}</span>
                    {item.isBoosted ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                        ⚡ EN VEDETTE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-400 text-[10px]">
                        Standard
                      </span>
                    )}
                  </div>

                  <div className="text-xs">
                    <div className="font-bold text-stone-100 text-sm">{item.title}</div>
                    <div className="text-stone-400 mt-0.5">{item.seller} • {item.region}</div>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center gap-2 text-xs">
                    {item.isBoosted ? (
                      <button
                        type="button"
                        onClick={() => toggleBoostListing(item.id, item.type, false)}
                        className="w-full py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold transition"
                      >
                        Révoquer Boost
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleBoostListing(item.id, item.type, true)}
                        className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Activer Boost Gratuit</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            14. JOURNAUX D'ACTIVITÉ / AUDIT LOGS FIRESTORE
           ==================================================== */}
        {activeSubTab === 'audit_logs' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={auditLogSearch}
                  onChange={(e) => setAuditLogSearch(e.target.value)}
                  placeholder="Rechercher dans les journaux d'audit (admin, type, cible, action)..."
                  className="w-full bg-transparent text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                />
              </div>

              <div className="text-xs text-stone-400 flex items-center gap-2">
                <span>{filteredAuditLogs.length} opération(s) enregistrée(s)</span>
                <button
                  type="button"
                  onClick={() => loadAuditLogs()}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-purple-300 text-xs font-semibold"
                >
                  Rafraîchir
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Date & Heure</th>
                      <th className="py-3.5 px-4 font-bold">Administrateur</th>
                      <th className="py-3.5 px-4 font-bold">Type d'Action</th>
                      <th className="py-3.5 px-4 font-bold">Cible</th>
                      <th className="py-3.5 px-4 font-bold">Détails & Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-mono">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-800/30 transition">
                        <td className="py-3.5 px-4 whitespace-nowrap text-stone-400">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-stone-200">{log.adminName}</div>
                          <div className="text-[11px] font-mono text-purple-300">{log.adminEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.actionType.includes('SUSPEND') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            log.actionType.includes('VALIDATE') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            log.actionType.includes('DISPUTE') ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}>
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-stone-200">{log.targetSummary}</div>
                          <div className="text-[10px] font-mono text-stone-500">ID: {log.targetId}</div>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-stone-300">
                          {log.details || '—'}
                          {log.newValue && (
                            <div className="text-[11px] text-purple-400 font-mono mt-0.5">
                              Valeur: {log.newValue}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            15. PARAMÈTRES GÉNÉRAUX DE LA PLATEFORME
           ==================================================== */}
        {activeSubTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Super Admin Access Control Delegation Card */}
            {isSuperAdmin && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-purple-950/40 border border-purple-800/60 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          Pouvoirs d'Accès Administrateurs & Volets
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-mono font-bold border border-rose-600/40">
                          SUPER ADMIN
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Déléguez les volets : <span className="text-amber-400 font-semibold">Pub</span>, <span className="text-emerald-400 font-semibold">Pépinières</span>, <span className="text-green-400 font-semibold">Market</span>, <span className="text-blue-400 font-semibold">Transport</span>, etc.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAdminRoleManagementModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-950/60 cursor-pointer whitespace-nowrap self-start sm:self-center"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Ouvrir la Fenêtre Réglage Pouvoirs</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Administrateurs Enregistrés</span>
                    <span className="text-lg font-bold text-purple-300">{administratorAccounts.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Comptes Actifs</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {administratorAccounts.filter((a) => a.status === 'active').length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Volets Opérationnels Gérés</span>
                    <span className="text-lg font-bold text-amber-400">{ALL_ADMIN_MODULE_PERMISSIONS.length} modules</span>
                  </div>
                </div>

                {/* Quick List Preview */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-semibold uppercase text-stone-400 tracking-wider block">
                    Comptes Administrateurs Configurés :
                  </span>
                  <div className="space-y-2">
                    {administratorAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-900/40 text-purple-300 font-bold flex items-center justify-center text-xs">
                            {acc.displayName ? acc.displayName.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-200">{acc.displayName}</span>
                              <span className="text-[10px] text-stone-400 font-mono">({acc.email})</span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                                  acc.role === 'super_admin'
                                    ? 'bg-purple-950 text-purple-300 border-purple-800'
                                    : 'bg-stone-800 text-stone-300 border-stone-700'
                                }`}
                              >
                                {acc.role === 'super_admin' ? 'Super Admin' : acc.jobTitle || 'Admin Volet'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {acc.permissions?.slice(0, 5).map((p) => (
                                <span
                                  key={p}
                                  className="px-1.5 py-0.2 rounded bg-stone-900 border border-stone-700 text-[10px] text-stone-300"
                                >
                                  {p}
                                </span>
                              ))}
                              {(acc.permissions?.length || 0) > 5 && (
                                <span className="text-[10px] text-stone-500">
                                  +{(acc.permissions?.length || 0) - 5} autres
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {(adminSession?.email || '').toLowerCase() !== acc.email.toLowerCase() && (
                            <button
                              type="button"
                              onClick={() => switchAdminSessionPreview(acc.id)}
                              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                              title="Tester la console avec ses droits"
                            >
                              <Eye className="w-3 h-3 text-cyan-400" />
                              <span>Tester</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsAdminRoleManagementModalOpen(true)}
                            className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-700/40 text-[11px] font-medium transition cursor-pointer"
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Super Admin Full System JSON Backup Card */}
            {isSuperAdmin && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30 border border-amber-800/50 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                      <DownloadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          Sauvegarde & Export Système JSON (Super Admin)
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-mono font-bold border border-rose-600/40">
                          SUPER ADMIN EXCLUSIF
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Export complet et chiffré de toutes les données du système (Lots pépinières, Récoltes, Ventes sur pied, Publicités, Manifestes et Comptes).
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-settings-superadmin-export-json"
                    type="button"
                    onClick={handleSuperAdminExportJSON}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-950/60 cursor-pointer whitespace-nowrap self-start sm:self-center"
                  >
                    <DownloadCloud className="w-4 h-4 text-stone-950" />
                    <span>Exporter Données JSON</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Lots Pépinière</span>
                    <span className="text-lg font-bold text-emerald-400">{nurseryLots.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Récoltes Maraîchères</span>
                    <span className="text-lg font-bold text-green-400">{produceListings.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Vergers sur Pied</span>
                    <span className="text-lg font-bold text-amber-400">{farmStandingListings.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Manifestes Export</span>
                    <span className="text-lg font-bold text-cyan-400">{exportManifests.length}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl space-y-6">
              <div className="border-b border-stone-800 pb-4">
                <h3 className="text-base font-bold text-stone-100">Paramètres Généraux de la Plateforme</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Ces réglages s'appliquent immédiatement à l'ensemble du système et sont synchronisés dans Firestore.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Taux de Commission Vendeur Standard (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={settingsForm.defaultSellerCommissionRate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultSellerCommissionRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 font-mono"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">Prélevé automatiquement sur le montant de chaque vente</span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Taux de Commission Producteur PRO Certifié (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={settingsForm.defaultProCommissionRate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultProCommissionRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Frais de Protection Séquestre Acheteur CMI (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={settingsForm.defaultEscrowGuaranteeRate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultEscrowGuaranteeRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Frais Minimum de Séquestre (MAD)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={settingsForm.minEscrowFeeMAD}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minEscrowFeeMAD: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Bannière d'Annonce Urgente Plateforme
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.platformNoticeBanner}
                    onChange={(e) => setSettingsForm({ ...settingsForm, platformNoticeBanner: e.target.value })}
                    placeholder="Ex: Campagne d'agrément ONSSA 2026 ouverte — Déclarez vos pépinières avant le 30 Avril"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800">
                  <div>
                    <span className="font-bold text-stone-200">Mode Maintenance</span>
                    <p className="text-[11px] text-stone-500">Suspend temporairement les nouvelles transactions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.maintenanceMode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg shadow-purple-900/30 cursor-pointer"
                  >
                    Enregistrer les Paramètres dans Firestore
                  </button>
                </div>
              </form>
            </div>

            {/* Carte Clé d'Accréditation et Code Administrateur */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-purple-900/60 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-stone-100">Votre Code / Clé d'Accréditation Administrateur</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-900/50 border border-purple-600/40 text-purple-300 text-[10px] font-mono font-bold">
                  SÉCURITÉ ADMIN
                </span>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                Vous pouvez définir et enregistrer votre propre mot de passe ou code administrateur personnel ci-dessous. Ce code sera reconnu immédiatement lors de vos futures connexions à la Console d'Administration.
              </p>

              {passkeySavedToast && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Votre nouveau code administrateur a été enregistré avec succès !</span>
                </div>
              )}

              <form onSubmit={handleSaveCustomPasskey} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Code Administrateur Personnalisé
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPasskey ? 'text' : 'password'}
                      value={adminPasskeyInput}
                      onChange={(e) => setAdminPasskeyInput(e.target.value)}
                      placeholder="Définissez votre code administrateur personnel"
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 font-mono text-sm focus:border-purple-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPasskey(!showAdminPasskey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      {showAdminPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 mt-1.5 gap-2">
                    <span>Codes système également reconnus : <code className="text-purple-300 bg-purple-950/60 px-1 rounded">AGRISTOCK@2026!ADMIN</code> ou <code className="text-purple-300 bg-purple-950/60 px-1 rounded">Admin2026!</code></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer mon code administrateur</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPasskeyInput('AGRISTOCK@2026!ADMIN');
                      saveCustomAdminKey('AGRISTOCK@2026!ADMIN');
                      setPasskeySavedToast(true);
                      setTimeout(() => setPasskeySavedToast(false), 3000);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 transition cursor-pointer"
                  >
                    Réinitialiser au code standard
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================
            16. POUVOIRS ET GESTION DES ADMINISTRATEURS (SUPER ADMIN)
           ==================================================== */}
        {activeSubTab === 'admin_roles' && (
          <div className="space-y-6">
            {/* Header / Intro Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-stone-900 to-stone-900 border border-purple-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Délégation des Pouvoirs & Volets Administrateurs
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-600/40">
                      CONSOLE SUPER ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
                    Chaque administrateur délégué peut être assigné à un ou plusieurs volets spécifiques :{' '}
                    <strong className="text-amber-300 font-semibold">Volet Pub</strong>,{' '}
                    <strong className="text-emerald-300 font-semibold">Volet Pépinières</strong>,{' '}
                    <strong className="text-green-300 font-semibold">Volet Market</strong>,{' '}
                    <strong className="text-blue-300 font-semibold">Volet Transport</strong>,{' '}
                    <strong className="text-purple-300 font-semibold">Séquestre CMI</strong>, etc. Les sections non autorisées sont automatiquement masquées sur leur interface.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  id="btn-superadmin-roles-export-json"
                  type="button"
                  onClick={handleSuperAdminExportJSON}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-950/60 cursor-pointer"
                  title="Exporter l'ensemble de la base de données de la plateforme en fichier JSON"
                >
                  <DownloadCloud className="w-4 h-4 text-stone-950" />
                  <span>Exporter Données JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdminRoleManagementModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-950/60 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Fenêtre Réglages Pouvoirs</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-xs text-stone-400">Total Administrateurs</span>
                <span className="text-xl font-bold text-white block mt-1">{administratorAccounts.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-xs text-stone-400">Comptes Actifs</span>
                <span className="text-xl font-bold text-emerald-400 block mt-1">
                  {administratorAccounts.filter((a) => a.status === 'active').length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-xs text-stone-400">Volets Disponibles</span>
                <span className="text-xl font-bold text-purple-400 block mt-1">
                  {ALL_ADMIN_MODULE_PERMISSIONS.length} modules
                </span>
              </div>
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-xs text-stone-400">Cloisonnement RBAC</span>
                <span className="text-xl font-bold text-cyan-400 block mt-1">100% Actif</span>
              </div>
            </div>

            {/* Administrator Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {administratorAccounts.map((acc) => {
                const isSuper = acc.role === 'super_admin';
                const isSelf = (adminSession?.email || '').toLowerCase() === acc.email.toLowerCase();

                return (
                  <div
                    key={acc.id}
                    className={`rounded-2xl p-5 border transition space-y-4 ${
                      isSuper
                        ? 'bg-gradient-to-br from-stone-900 to-purple-950/30 border-purple-800/60 shadow-md'
                        : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-inner shrink-0 ${
                            isSuper
                              ? 'bg-purple-600/30 text-purple-300 border border-purple-400/40'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-600/30'
                          }`}
                        >
                          {acc.displayName ? acc.displayName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-white">{acc.displayName}</h3>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-400/30">
                                VOUS
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                isSuper
                                  ? 'bg-purple-950 text-purple-300 border-purple-700'
                                  : 'bg-stone-800 text-stone-300 border-stone-700'
                              }`}
                            >
                              {isSuper ? 'Super Admin' : 'Admin Volet'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                acc.status === 'active'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                              }`}
                            >
                              {acc.status === 'active' ? 'Actif' : 'Suspendu'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 font-mono mt-0.5">{acc.email}</p>
                          {acc.jobTitle && (
                            <p className="text-xs text-stone-300 font-medium mt-0.5">{acc.jobTitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => switchAdminSessionPreview(acc.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Tester la console avec ses droits"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="hidden sm:inline">Tester</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsAdminRoleManagementModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Régler</span>
                        </button>
                      </div>
                    </div>

                    {/* Volets Chips */}
                    <div className="pt-2 border-t border-stone-800">
                      <span className="text-[11px] font-semibold text-stone-400 block mb-2">
                        Volets attribués ({acc.permissions?.length || 0}) :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_ADMIN_MODULE_PERMISSIONS.map((perm) => {
                          const isAssigned = acc.permissions?.includes(perm.id);
                          return (
                            <span
                              key={perm.id}
                              className={`px-2 py-0.5 rounded-md text-[11px] border transition ${
                                isAssigned
                                  ? `${perm.badgeColor} font-semibold shadow-xs`
                                  : 'bg-stone-950 text-stone-600 border-stone-800/40 opacity-30 line-through'
                              }`}
                            >
                              {perm.shortLabel}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================
            16. ESPACE DÉVELOPPEUR & MAINTENANCE SYSTÈME
           ==================================================== */}
        {activeSubTab === 'dev_maintenance' && <DevMaintenanceView />}
      </main>

      {/* ====================================================
          MODAL: SUSPENSION DE COMPTE
         ==================================================== */}
      {selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-rose-900 rounded-2xl p-6 max-w-md w-full text-stone-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-rose-300">Suspendre le compte utilisateur</h3>
                <p className="text-xs text-stone-400">{selectedUserForAction.displayName} ({selectedUserForAction.companyName})</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase mb-1.5">
                Motif de la suspension (inscrit dans le registre) :
              </label>
              <textarea
                rows={3}
                required
                value={suspensionReasonInput}
                onChange={(e) => setSuspensionReasonInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForAction(null)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  await suspendUserAccount(
                    selectedUserForAction.id,
                    selectedUserForAction.displayName || selectedUserForAction.companyName || 'Utilisateur',
                    suspensionReasonInput
                  );
                  setSelectedUserForAction(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Confirmer la Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: REFUS D'UNE ANNONCE
         ==================================================== */}
      {selectedListingForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-rose-900 rounded-2xl p-6 max-w-md w-full text-stone-100 space-y-4">
            <h3 className="font-bold text-base text-rose-300">Refuser l'annonce</h3>
            <p className="text-xs text-stone-300">{selectedListingForAction.title}</p>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase mb-1.5">
                Motif du refus (notifié au producteur) :
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedListingForAction(null)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 text-xs font-semibold text-stone-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  await moderateListing(
                    selectedListingForAction.id,
                    selectedListingForAction.title,
                    selectedListingForAction.type,
                    'REFUSÉ',
                    rejectionReasonInput
                  );
                  setSelectedListingForAction(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Refuser l'Annonce
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: AJUSTEMENT DE COMMISSION
         ==================================================== */}
      {selectedOrderForCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-purple-900 rounded-2xl p-6 max-w-md w-full text-stone-100 space-y-4">
            <h3 className="font-bold text-base text-purple-300">Ajuster Commission Transaction</h3>
            <p className="text-xs text-stone-300 font-mono">#{selectedOrderForCommission.reference}</p>
            <p className="text-xs text-stone-400">Montant HT: {selectedOrderForCommission.subtotal.toLocaleString()} MAD</p>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase mb-1.5">
                Nouveau Taux de Commission (%) :
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="25"
                value={newCommissionPercentInput}
                onChange={(e) => setNewCommissionPercentInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm font-mono text-stone-100"
              />
              <span className="text-[11px] text-emerald-400 mt-1 block">
                Montant calculé : {Math.round(selectedOrderForCommission.subtotal * (parseFloat(newCommissionPercentInput || '0') / 100))} MAD
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForCommission(null)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 text-xs font-semibold text-stone-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  const rate = parseFloat(newCommissionPercentInput) / 100;
                  await updateTransactionCommission(selectedOrderForCommission.id, rate);
                  setSelectedOrderForCommission(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
              >
                Appliquer et Journaliser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: ARBITRAGE DU LITIGE
         ==================================================== */}
      {selectedDisputeForArbitrage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-amber-900 rounded-2xl p-6 max-w-md w-full text-stone-100 space-y-4">
            <h3 className="font-bold text-base text-amber-300">Rendre Sentence d'Arbitrage</h3>
            <p className="text-xs text-stone-400">Cette décision libère automatiquement les fonds sous séquestre selon la sentence retenue.</p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-300 uppercase">
                Décision administrative :
              </label>
              <select
                value={disputeArbitrageRuling}
                onChange={(e) => setDisputeArbitrageRuling(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100"
              >
                <option value="refund_buyer">Remboursement intégral Acheteur (100%)</option>
                <option value="pay_seller">Paiement intégral Vendeur (100%)</option>
                <option value="split_50_50">Accord Transactionnel 50/50</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase mb-1.5">
                Motivation de la sentence :
              </label>
              <textarea
                rows={3}
                required
                value={disputeArbitrageNotes}
                onChange={(e) => setDisputeArbitrageNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDisputeForArbitrage(null)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 text-xs font-semibold text-stone-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  await resolveDispute(selectedDisputeForArbitrage, disputeArbitrageRuling, disputeArbitrageNotes);
                  setSelectedDisputeForArbitrage(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
              >
                Rendre Décision Finale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          FENÊTRE RÉGLAGE POUVOIRS ADMINISTRATEURS (SUPER ADMIN)
         ==================================================== */}
      <AdminRoleManagementModal
        isOpen={isAdminRoleManagementModalOpen}
        onClose={() => setIsAdminRoleManagementModalOpen(false)}
      />
    </div>
  );
};
