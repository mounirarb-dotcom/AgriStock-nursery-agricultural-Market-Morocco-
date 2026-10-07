import React from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { AppTab } from '../types';
import {
  Home,
  Sprout,
  Store,
  Package,
  MessageSquare,
  User,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Heart,
  Tractor,
  Route,
  ClipboardList,
  Search,
  TrendingUp,
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
  } = useApp();

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

    switch (role) {
      case 'seller':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil', 'الرئيسية', 'Home'),
            icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'seller_space' && !isEscrowListModalOpen && !isProfileModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('seller_space');
            },
          },
          {
            id: 'offers',
            label: tr(language, 'Mes Offres', 'عروضي', 'My Offers'),
            icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'market' && !isEscrowListModalOpen && !isProfileModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('market');
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
          {
            id: 'profile',
            label: tr(language, 'Profil', 'الحساب', 'Profile'),
            icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: isProfileModalOpen,
            onClick: () => setIsProfileModalOpen(true),
          },
        ];

      case 'nursery':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil', 'الرئيسية', 'Home'),
            icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'nursery_space' && !isEscrowListModalOpen && !isProfileModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('nursery_space');
            },
          },
          {
            id: 'stock',
            label: tr(language, 'Stock Plants', 'المخزون', 'Stock'),
            icon: <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'nursery' && !isEscrowListModalOpen && !isProfileModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('nursery');
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
          {
            id: 'profile',
            label: tr(language, 'Profil', 'الحساب', 'Profile'),
            icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: isProfileModalOpen,
            onClick: () => setIsProfileModalOpen(true),
          },
        ];

      case 'carrier':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil', 'الرئيسية', 'Home'),
            icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'carrier_space' && !isEscrowListModalOpen && !isProfileModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('carrier_space');
            },
          },
          {
            id: 'missions',
            label: tr(language, 'Missions', 'المهام', 'Missions'),
            icon: <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'carrier_space',
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('carrier_space');
            },
          },
          {
            id: 'fleet',
            label: tr(language, 'Flotte', 'الأسطول', 'Fleet'),
            icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'carrier_space',
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('carrier_space');
            },
          },
          messagesItem,
          {
            id: 'profile',
            label: tr(language, 'Profil', 'الحساب', 'Profile'),
            icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: isProfileModalOpen,
            onClick: () => setIsProfileModalOpen(true),
          },
        ];

      case 'admin':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil', 'الرئيسية', 'Home'),
            icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'home' && !isEscrowListModalOpen && !isProfileModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('home');
            },
          },
          {
            id: 'market',
            label: tr(language, 'Marché', 'السوق', 'Market'),
            icon: <Store className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'market',
            onClick: () => setActiveTab('market'),
          },
          {
            id: 'admin',
            label: tr(language, 'Admin', 'الإدارة', 'Admin'),
            icon: <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'admin',
            onClick: () => setActiveTab('admin'),
          },
          messagesItem,
          {
            id: 'profile',
            label: tr(language, 'Profil', 'الحساب', 'Profile'),
            icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: isProfileModalOpen,
            onClick: () => setIsProfileModalOpen(true),
          },
        ];

      // Par défaut : ACHETEUR (Buyer) - 5 onglets préconisés
      default:
      case 'buyer':
        return [
          {
            id: 'home',
            label: tr(language, 'Accueil', 'الرئيسية', 'Home'),
            icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'home' && !isEscrowListModalOpen && !isProfileModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('home');
            },
          },
          {
            id: 'search',
            label: tr(language, 'Chercher', 'بحث', 'Search'),
            icon: <Search className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: activeTab === 'market' && !isEscrowListModalOpen && !isProfileModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('market');
            },
          },
          {
            id: 'favorites',
            label: tr(language, 'Favoris', 'المفضلة', 'Favorites'),
            icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />,
            badgeCount: favoriteIds.length,
            isActive: activeTab === 'favorites' && !isEscrowListModalOpen && !isProfileModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('favorites');
            },
          },
          messagesItem,
          {
            id: 'profile',
            label: tr(language, 'Profil', 'حسابي', 'Profile'),
            icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
            isActive: (activeTab === 'buyer_space' || isProfileModalOpen) && !isEscrowListModalOpen,
            onClick: () => {
              setIsEscrowListModalOpen(false);
              setActiveTab('buyer_space');
            },
          },
        ];
    }
  };

  const navItems = getItemsForRole();

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Barre de navigation mobile par rôle"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#091b12]/95 backdrop-blur-lg border-t border-[#1a3f2d] px-1.5 pt-1.5 pb-2 shadow-[0_-4px_24px_rgba(0,0,0,0.45)] safe-area-bottom"
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
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl group transition-transform active:scale-95 cursor-pointer min-h-[52px] select-none relative touch-manipulation"
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
