import React from 'react';
import { useApp } from '../../context/AppContext';
import { AgriWeatherWidget } from '../AgriWeatherWidget';

// Feature Domain Pages (Clean Architecture)
import {
  HomePage,
  PublicLandingPage,
  RoleSelectionPage,
  LoginPage,
  RegisterPage,
  MarketplacePage,
  ListingDetailPage,
  FavoritesPage,
  BuyerDashboardPage,
  SellerDashboardPage,
  InventoryPage,
  InventoryFormPage,
  InventoryItemPage,
  OrdersPage,
  OrderDetailPage,
  NurseryDashboardPage,
  NurseryInventoryPage,
  NurseryLotDetailPage,
  NurseryLotFormPage,
  TransportDashboardPage,
  LogisticsPage,
  TransportRequestPage,
  DeliveryTrackingPage,
  NotificationsPage,
  ProfilePage,
  SettingsPage,
  AdminDashboardPage,
  AdminUsersPage,
  AdminModerationPage,
  AdminSettingsPage,
  AdvancedToolsPage,
} from '../../features';

export const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    userProfile,
    setIsOfficialComplianceModalOpen,
  } = useApp();

  React.useEffect(() => {
    const handleOpenPlayStore = () => {
      setActiveTab('playstore');
    };
    window.addEventListener('open-playstore-tab', handleOpenPlayStore);
    return () => window.removeEventListener('open-playstore-tab', handleOpenPlayStore);
  }, [setActiveTab]);

  const isSellerOrNursery =
    userProfile.role === 'seller' ||
    userProfile.role === 'nursery' ||
    Boolean(userProfile.roles && (userProfile.roles.includes('seller') || userProfile.roles.includes('nursery')));

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-24 md:pb-8 space-y-4 sm:space-y-6">
      {/* Barre météo agronomique détaillée - pour la vue landing */}
      {isSellerOrNursery && activeTab === 'landing' && (
        <AgriWeatherWidget />
      )}

      {/* 1. Public & Auth */}
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'landing' && <PublicLandingPage />}
      {activeTab === 'role_selection' && <RoleSelectionPage />}
      {activeTab === 'login' && <LoginPage />}
      {activeTab === 'register' && <RegisterPage />}

      {/* 2. Marketplace & Catalogue */}
      {(activeTab === 'market' || activeTab === 'marketplace' || activeTab === 'farm_standing') && (
        <MarketplacePage />
      )}
      {activeTab === 'listing_detail' && <ListingDetailPage />}
      {activeTab === 'favorites' && <FavoritesPage />}

      {/* 3. Dashboard Acheteur */}
      {(activeTab === 'buyer_space' || activeTab === 'buyer_dashboard') && <BuyerDashboardPage />}

      {/* 4. Dashboard Vendeur & Stocks */}
      {(activeTab === 'seller_space' || activeTab === 'seller_dashboard') && <SellerDashboardPage />}
      {activeTab === 'inventory' && <InventoryPage />}
      {activeTab === 'inventory_form' && <InventoryFormPage />}
      {activeTab === 'inventory_item' && <InventoryItemPage />}

      {/* 5. Commandes & Séquestre */}
      {activeTab === 'orders' && <OrdersPage />}
      {activeTab === 'order_detail' && <OrderDetailPage />}

      {/* 6. Dashboard Pépinière & Lots */}
      {(activeTab === 'nursery_space' || activeTab === 'nursery_dashboard') && <NurseryDashboardPage />}
      {(activeTab === 'nursery' || activeTab === 'nursery_inventory') && <NurseryInventoryPage />}
      {activeTab === 'nursery_lot_detail' && <NurseryLotDetailPage />}
      {activeTab === 'nursery_lot_form' && <NurseryLotFormPage />}

      {/* 7. Dashboard Transport & Logistique */}
      {(activeTab === 'carrier_space' || activeTab === 'transport_dashboard') && <TransportDashboardPage />}
      {activeTab === 'logistics' && <LogisticsPage />}
      {activeTab === 'transport_request' && <TransportRequestPage />}
      {activeTab === 'delivery_tracking' && <DeliveryTrackingPage />}

      {/* 8. Notifications */}
      {activeTab === 'notifications' && <NotificationsPage />}

      {/* 9. Profil & Paramètres */}
      {activeTab === 'profile' && <ProfilePage />}
      {activeTab === 'settings' && <SettingsPage />}

      {/* 10. Administration & Supervision */}
      {(activeTab === 'admin' || activeTab === 'admin_dashboard') && <AdminDashboardPage />}
      {activeTab === 'admin_users' && <AdminUsersPage />}
      {activeTab === 'admin_moderation' && <AdminModerationPage />}
      {activeTab === 'admin_settings' && <AdminSettingsPage />}

      {/* 11. Outils Métiers Avancés & Services Réseau */}
      {(activeTab === 'wholesale' || activeTab === 'directory' || activeTab === 'gmail' || activeTab === 'playstore') && (
        <AdvancedToolsPage />
      )}

      {/* 12. Redirection 'dashboard' selon rôle actif */}
      {activeTab === 'dashboard' && (
        userProfile.role === 'seller' ? (
          <SellerDashboardPage />
        ) : userProfile.role === 'nursery' ? (
          <NurseryDashboardPage />
        ) : userProfile.role === 'carrier' ? (
          <TransportDashboardPage />
        ) : userProfile.role === 'admin' ? (
          <AdminDashboardPage />
        ) : (
          <BuyerDashboardPage />
        )
      )}
    </main>
  );
};
