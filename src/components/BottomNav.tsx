import React from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  Home,
  Sprout,
  Store,
  Package,
  MessageSquare,
  User,
  Heart,
  ClipboardList,
  Search,
  TrendingUp,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
  isActive: boolean;
  onClick: () => void;
}

export const BottomNav: React.FC = () => {
  const {
    language,
    activeTab,
    setActiveTab,
    setIsDiscussionsListModalOpen,
    totalUnreadDiscussionsCount,
    discussions,
    userProfile,
    setIsProfileModalOpen,
    isProfileModalOpen,
    favoriteIds,
    isEscrowListModalOpen,
    setIsEscrowListModalOpen,
    isRoleOnboardingOpen,
    setIsRoleOnboardingOpen,
  } = useApp();

  const getProfileLabel = () => {
    if (userProfile.displayName && userProfile.displayName.trim().length > 0) {
      return userProfile.displayName.split(' ')[0];
    }
    const roleLabels: Record<string, string> = {
      seller: tr(language, 'Vendeur', 'البائع', 'Seller'),
      nursery: tr(language, 'Pépinière', 'المشتل', 'Nursery'),
      carrier: tr(language, 'Transport', 'الناقل', 'Carrier'),
      admin: tr(language, 'Admin', 'الإدارة', 'Admin'),
      buyer: tr(language, 'Acheteur', 'المشتري', 'Buyer'),
    };
    return roleLabels[userProfile.role] || tr(language, 'Profil', 'الحساب', 'Profile');
  };

  const getItemsForRole = (): BottomNavItem[] => {
    const role = userProfile.role || 'buyer';

    const messagesItem: BottomNavItem = {
      id: 'messages',
      label: tr(language, 'Messages', 'الرسائل', 'Messages'),
      icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />,
      badgeCount: totalUnreadDiscussionsCount,
      isActive: false,
      onClick: () => setIsDiscussionsListModalOpen(true),
    };

    const userProfileItem: BottomNavItem = {
      id: 'profile',
      label: getProfileLabel(),
      icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
      isActive: activeTab === 'profile' || isRoleOnboardingOpen || isProfileModalOpen,
      onClick: () => {
        setIsEscrowListModalOpen(false);
        setActiveTab('profile');
      },
    };

    switch (role) {
      case 'seller':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil', 'الرئيسية', 'Home'),
            icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'seller_space' && !isEscrowListModalOpen && !isProfileModalOpen && !isRoleOnboardingOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('seller_space');
            },
          },
          {
            id: 'offers',
            label: tr(language, 'Mes Offres', 'عروضي', 'My Offers'),
            icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: (activeTab === 'inventory' || activeTab === 'market') && !isEscrowListModalOpen && !isProfileModalOpen && !isRoleOnboardingOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('inventory');
            },
          },
          {
            id: 'sales',
            label: tr(language, 'Ventes', 'المبيعات', 'Sales'),
            icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'orders' || isEscrowListModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('orders');
            },
          },
          messagesItem,
          userProfileItem,
        ];

      case 'nursery':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil', 'الرئيسية', 'Home'),
            icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'nursery_space' && !isEscrowListModalOpen && !isProfileModalOpen && !isRoleOnboardingOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('nursery_space');
            },
          },
          {
            id: 'stock',
            label: tr(language, 'Stock Plants', 'المخزون', 'Stock'),
            icon: <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: (activeTab === 'nursery_inventory' || activeTab === 'nursery') && !isEscrowListModalOpen && !isProfileModalOpen && !isRoleOnboardingOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('nursery_inventory');
            },
          },
          {
            id: 'sales',
            label: tr(language, 'Ventes', 'المبيعات', 'Sales'),
            icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'orders' || isEscrowListModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('orders');
            },
          },
          messagesItem,
          userProfileItem,
        ];

      case 'carrier':
        return [
          {
            id: 'dashboard',
            label: tr(language, 'Tableau de bord', 'لوحة القيادة', 'Dashboard'),
            icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'carrier_space' || activeTab === 'transport_dashboard',
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('transport_dashboard');
            },
          },
          {
            id: 'missions',
            label: tr(language, 'Missions Fret', 'مهام الشحن', 'Freight Jobs'),
            icon: <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'logistics' || activeTab === 'transport_request',
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('logistics');
            },
          },
          {
            id: 'tracking',
            label: tr(language, 'Suivi & Flotte', 'تتبع الشحنات', 'Tracking'),
            icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'delivery_tracking',
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('delivery_tracking');
            },
          },
          messagesItem,
          userProfileItem,
        ];

      case 'admin':
        return [
          {
            id: 'admin_dashboard',
            label: tr(language, 'Supervision', 'لوحة الإدارة', 'Overview'),
            icon: <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'admin' || activeTab === 'admin_dashboard',
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('admin_dashboard');
            },
          },
          {
            id: 'admin_users',
            label: tr(language, 'Utilisateurs', 'المستخدمين', 'Users'),
            icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'admin_users',
            onClick: () => setActiveTab('admin_users'),
          },
          {
            id: 'admin_moderation',
            label: tr(language, 'Modération', 'الرقابة', 'Moderation'),
            icon: <Store className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'admin_moderation',
            onClick: () => setActiveTab('admin_moderation'),
          },
          {
            id: 'admin_settings',
            label: tr(language, 'Paramètres', 'الإعدادات', 'Settings'),
            icon: <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'admin_settings',
            onClick: () => setActiveTab('admin_settings'),
          },
          userProfileItem,
        ];

      // Par défaut : ACHETEUR (Buyer)
      default:
      case 'buyer':
        return [
          {
            id: 'marketplace',
            label: tr(language, 'Marché', 'السوق', 'Market'),
            icon: <Store className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: (activeTab === 'market' || activeTab === 'marketplace' || activeTab === 'home') && !isEscrowListModalOpen && !isProfileModalOpen && !isRoleOnboardingOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('marketplace');
            },
          },
          {
            id: 'favorites',
            label: tr(language, 'Favoris', 'المفضلة', 'Favorites'),
            icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />,
            badgeCount: favoriteIds.length,
            isActive: activeTab === 'favorites' && !isEscrowListModalOpen && !isProfileModalOpen && !isRoleOnboardingOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('favorites');
            },
          },
          {
            id: 'orders',
            label: tr(language, 'Commandes', 'الطلبيات', 'Orders'),
            icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'orders' || isEscrowListModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('orders');
            },
          },
          messagesItem,
          userProfileItem,
        ];
    }
  };

  const navItems = getItemsForRole();

  return (
    <nav
      id="app-bottom-nav"
      aria-label="Barre de navigation principale et profil"
      className="fixed bottom-0 md:bottom-3 left-0 md:left-1/2 md:-translate-x-1/2 right-0 md:right-auto md:w-auto md:min-w-[460px] md:max-w-xl md:rounded-2xl md:border md:border-[#1a3f2d] md:shadow-2xl z-40 bg-[#091b12]/95 backdrop-blur-lg border-t border-[#1a3f2d] px-2 pt-1.5 pb-2 safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto gap-0.5">
        {navItems.map((item) => {
          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              type="button"
              onClick={item.onClick}
              aria-label={item.label}
              aria-current={item.isActive ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl group transition-transform active:scale-95 cursor-pointer min-h-[50px] select-none relative touch-manipulation"
            >
              {/* Ergonomic Squircle icon receptacle */}
              <div
                className={`relative w-9 sm:w-10 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  item.isActive
                    ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-xs ring-1 ring-emerald-400/50 scale-105'
                    : 'text-stone-400 group-hover:text-stone-200 group-hover:bg-white/5'
                }`}
              >
                {item.icon}

                {/* Badge Notification */}
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black bg-rose-600 text-white flex items-center justify-center shadow-xs ring-2 ring-[#091b12]">
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                ) : item.id === 'messages' && Object.keys(discussions).length > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#091b12]" />
                ) : null}
              </div>

              {/* Indicator dot & label */}
              <div className="flex flex-col items-center mt-1 w-full overflow-hidden">
                <span
                  className={`text-[9.5px] sm:text-[10px] tracking-tight leading-tight truncate max-w-full transition-colors duration-200 ${
                    item.isActive
                      ? 'font-black text-emerald-300'
                      : 'font-medium text-stone-400 group-hover:text-stone-300'
                  }`}
                >
                  {item.label}
                </span>
                {item.isActive && (
                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 shadow-xs shadow-emerald-400 animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
