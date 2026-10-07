import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation, tr } from '../../utils/translations';
import { NavTabItem } from './NavbarTypes';
import {
  Home,
  Store,
  ShoppingCart,
  MessageSquare,
  Tractor,
  Sprout,
  Truck,
  User,
  ClipboardList,
  Heart,
  Search,
  TrendingUp,
  Package,
  ShieldCheck,
} from 'lucide-react';

export const useNavbarLogic = () => {
  const {
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    userProfile,
    setUserRole,
    exportDataJSON,
    importDataJSON,
    resetToSampleData,
    isSuperAdmin,
    isSessionUnlocked,
    lockSession,
    setIsStockAuthModalOpen,
    setStockAuthModalMode,
    escrowTransactions,
    isEscrowListModalOpen,
    setIsEscrowListModalOpen,
    buyerActiveSubTab,
    setBuyerActiveSubTab,
    favoriteIds,
    isRoleOnboardingOpen,
    setIsRoleOnboardingOpen,
    setIsProModalOpen,
    openLogisticsModal,
    setIsDiscussionsListModalOpen,
    totalUnreadDiscussionsCount,
    discussions,
    platformPaymentProtected,
    togglePlatformPaymentProtection,
    setIsOfficialComplianceModalOpen,
    setIsBenchmarkModalOpen,
    openUserManual,
    openExportManifestModal,
    isAdminAuthenticated,
    setIsAdminLoginModalOpen,
    adminSession,
    openNotificationSettings,
    unreadNotificationsCount,
    setIsRegistrationModalOpen,
    setIsLoginModalOpen,
    setIsProfileModalOpen,
    openExcelStockModal,
    openFieldQRScannerModal,
    openAudioSearchModal,
  } = useApp();

  const t = useTranslation(language);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Tabs dynamiques mémorisés avec useMemo selon le RÔLE (Exactement 5 onglets ciblés)
  const tabs = useMemo<NavTabItem[]>(() => {
    const role = userProfile.role || 'buyer';

    const messagesTab: NavTabItem = {
      id: 'messages',
      label:
        totalUnreadDiscussionsCount > 0
          ? `${tr(language, 'Messages', 'الرسائل', 'Messages')} (${totalUnreadDiscussionsCount})`
          : tr(language, 'Messages', 'الرسائل', 'Messages'),
      icon: React.createElement(MessageSquare, { className: 'w-4 h-4 text-amber-300' }),
      isActive: false,
      onClick: () => setIsDiscussionsListModalOpen(true),
    };

    switch (role) {
      case 'seller':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil Vendeur', 'الرئيسية', 'Home'),
            icon: React.createElement(Home, { className: 'w-4 h-4 text-amber-400' }),
            isActive: activeTab === 'seller_space' && !isEscrowListModalOpen,
            onClick: () => setActiveTab('seller_space'),
          },
          {
            id: 'offers',
            label: tr(language, 'Mes Offres', 'عروضي', 'My Offers'),
            icon: React.createElement(Package, { className: 'w-4 h-4 text-emerald-400' }),
            isActive: activeTab === 'market' && !isEscrowListModalOpen,
            onClick: () => setActiveTab('market'),
          },
          {
            id: 'sales',
            label: tr(language, 'Ventes & Commandes', 'المبيعات', 'Sales'),
            icon: React.createElement(TrendingUp, { className: 'w-4 h-4 text-emerald-300' }),
            isActive: activeTab === 'orders' || isEscrowListModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('orders');
            },
          },
          messagesTab,
          {
            id: 'profile',
            label: tr(language, 'Profil Vendeur', 'الحساب', 'Profile'),
            icon: React.createElement(User, { className: 'w-4 h-4 text-amber-300' }),
            isActive: activeTab === 'profile',
            onClick: () => setIsProfileModalOpen(true),
          },
        ];

      case 'nursery':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil Pépinière', 'الرئيسية', 'Home'),
            icon: React.createElement(Home, { className: 'w-4 h-4 text-emerald-400' }),
            isActive: activeTab === 'nursery_space' && !isEscrowListModalOpen,
            onClick: () => setActiveTab('nursery_space'),
          },
          {
            id: 'stock',
            label: tr(language, 'Stock Plants', 'المخزون', 'Stock'),
            icon: React.createElement(Sprout, { className: 'w-4 h-4 text-emerald-300' }),
            isActive: activeTab === 'nursery' && !isEscrowListModalOpen,
            onClick: () => setActiveTab('nursery'),
          },
          {
            id: 'sales',
            label: tr(language, 'Ventes Plants', 'المبيعات', 'Sales'),
            icon: React.createElement(TrendingUp, { className: 'w-4 h-4 text-emerald-300' }),
            isActive: activeTab === 'orders' || isEscrowListModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('orders');
            },
          },
          messagesTab,
          {
            id: 'profile',
            label: tr(language, 'Profil Pépinière', 'الحساب', 'Profile'),
            icon: React.createElement(User, { className: 'w-4 h-4 text-emerald-300' }),
            isActive: activeTab === 'profile',
            onClick: () => setIsProfileModalOpen(true),
          },
        ];

      case 'carrier':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil Fret', 'الرئيسية', 'Home'),
            icon: React.createElement(Home, { className: 'w-4 h-4 text-sky-400' }),
            isActive: activeTab === 'carrier_space' && !isEscrowListModalOpen,
            onClick: () => setActiveTab('carrier_space'),
          },
          {
            id: 'missions',
            label: tr(language, 'Missions Fret', 'المهام', 'Missions'),
            icon: React.createElement(ClipboardList, { className: 'w-4 h-4 text-sky-300' }),
            isActive: activeTab === 'carrier_space',
            onClick: () => setActiveTab('carrier_space'),
          },
          {
            id: 'fleet',
            label: tr(language, 'Flotte Frigo', 'الأسطول', 'Fleet'),
            icon: React.createElement(Truck, { className: 'w-4 h-4 text-sky-400' }),
            isActive: activeTab === 'carrier_space',
            onClick: () => setActiveTab('carrier_space'),
          },
          messagesTab,
          {
            id: 'profile',
            label: tr(language, 'Profil Fret', 'الحساب', 'Profile'),
            icon: React.createElement(User, { className: 'w-4 h-4 text-sky-300' }),
            isActive: activeTab === 'profile',
            onClick: () => setIsProfileModalOpen(true),
          },
        ];

      case 'admin':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil', 'الرئيسية', 'Home'),
            icon: React.createElement(Home, { className: 'w-4 h-4' }),
            isActive: activeTab === 'home',
            onClick: () => setActiveTab('home'),
          },
          {
            id: 'market',
            label: tr(language, 'Marché', 'السوق', 'Market'),
            icon: React.createElement(Store, { className: 'w-4 h-4 text-emerald-400' }),
            isActive: activeTab === 'market',
            onClick: () => setActiveTab('market'),
          },
          {
            id: 'admin',
            label: tr(language, 'Administration', 'الإدارة', 'Admin'),
            icon: React.createElement(ShieldCheck, { className: 'w-4 h-4 text-amber-400' }),
            isActive: activeTab === 'admin',
            onClick: () => setActiveTab('admin'),
          },
          messagesTab,
          {
            id: 'profile',
            label: tr(language, 'Profil', 'الحساب', 'Profile'),
            icon: React.createElement(User, { className: 'w-4 h-4 text-emerald-300' }),
            isActive: activeTab === 'profile',
            onClick: () => setIsProfileModalOpen(true),
          },
        ];

      // Par défaut : ACHETEUR (Buyer)
      default:
      case 'buyer':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil', 'الرئيسية', 'Home'),
            icon: React.createElement(Home, { className: 'w-4 h-4 text-emerald-400' }),
            isActive: activeTab === 'home' && !isEscrowListModalOpen,
            onClick: () => setActiveTab('home'),
          },
          {
            id: 'search',
            label: tr(language, 'Chercher', 'بحث في السوق', 'Search Market'),
            icon: React.createElement(Search, { className: 'w-4 h-4 text-emerald-300' }),
            isActive:
              (activeTab === 'market' || activeTab === 'farm_standing') &&
              !isEscrowListModalOpen,
            onClick: () => setActiveTab('market'),
          },
          {
            id: 'favorites',
            label:
              favoriteIds.length > 0
                ? `${tr(language, 'Favoris', 'المفضلة', 'Favorites')} (${favoriteIds.length})`
                : tr(language, 'Favoris', 'المفضلة', 'Favorites'),
            icon: React.createElement(Heart, { className: 'w-4 h-4 text-rose-400 fill-rose-400/30' }),
            isActive: activeTab === 'favorites' && !isEscrowListModalOpen,
            onClick: () => setActiveTab('favorites'),
          },
          messagesTab,
          {
            id: 'profile',
            label: tr(language, 'Espace Acheteur', 'فضاء المشتري', 'Buyer Space'),
            icon: React.createElement(User, { className: 'w-4 h-4 text-emerald-400' }),
            isActive: activeTab === 'buyer_space' && !isEscrowListModalOpen,
            onClick: () => setActiveTab('buyer_space'),
          },
        ];
    }
  }, [
    language,
    activeTab,
    userProfile.role,
    isEscrowListModalOpen,
    favoriteIds,
    totalUnreadDiscussionsCount,
    setActiveTab,
    setIsEscrowListModalOpen,
    setIsDiscussionsListModalOpen,
    setIsProfileModalOpen,
  ]);

  const handleExport = useCallback(() => {
    if (!isSuperAdmin) {
      alert(
        tr(
          language,
          'Action réservée exclusivement au Super Administrateur.',
          'هذا الإجراء مخصص حصرياً للمشرف العام.',
          'Action restricted exclusively to Super Administrator.'
        )
      );
      return;
    }
    try {
      const data = exportDataJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agrimaroc_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(
        e?.message ||
          tr(
            language,
            'Erreur lors de l’export',
            'خطأ أثناء التصدير',
            'Error during export'
          )
      );
    }
  }, [isSuperAdmin, language, exportDataJSON]);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isSuperAdmin) {
        alert(
          tr(
            language,
            'Action réservée exclusivement au Super Administrateur.',
            'هذا الإجراء مخصص حصرياً للمشرف العام.',
            'Action restricted exclusively to Super Administrator.'
          )
        );
        return;
      }
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        if (content) {
          try {
            const success = importDataJSON(content);
            if (success) {
              setImportStatus('Données importées avec succès !');
              setTimeout(() => setImportStatus(null), 3000);
            } else {
              setImportStatus('Erreur de format du fichier JSON');
            }
          } catch (err: any) {
            setImportStatus(err?.message || 'Erreur lors de l’import');
          }
        }
      };
      reader.readAsText(file);
    },
    [isSuperAdmin, language, importDataJSON]
  );

  return {
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    userProfile,
    setUserRole,
    isSuperAdmin,
    isSessionUnlocked,
    lockSession,
    setIsStockAuthModalOpen,
    setStockAuthModalMode,
    escrowTransactions,
    isEscrowListModalOpen,
    setIsEscrowListModalOpen,
    buyerActiveSubTab,
    setBuyerActiveSubTab,
    setIsProModalOpen,
    openLogisticsModal,
    setIsDiscussionsListModalOpen,
    totalUnreadDiscussionsCount,
    discussions,
    platformPaymentProtected,
    togglePlatformPaymentProtection,
    setIsOfficialComplianceModalOpen,
    setIsBenchmarkModalOpen,
    openUserManual,
    openExportManifestModal,
    isAdminAuthenticated,
    setIsAdminLoginModalOpen,
    adminSession,
    openNotificationSettings,
    unreadNotificationsCount,
    setIsRegistrationModalOpen,
    setIsLoginModalOpen,
    setIsProfileModalOpen,
    resetToSampleData,
    openExcelStockModal,
    openFieldQRScannerModal,
    openAudioSearchModal,
    t,
    tabs,
    showSettingsModal,
    setShowSettingsModal,
    mobileMenuOpen,
    setMobileMenuOpen,
    roleDropdownOpen,
    setRoleDropdownOpen,
    toolsDropdownOpen,
    setToolsDropdownOpen,
    importStatus,
    handleExport,
    handleImportFile,
  };
};
