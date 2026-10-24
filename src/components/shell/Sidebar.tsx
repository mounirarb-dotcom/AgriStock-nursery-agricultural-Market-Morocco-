import React from 'react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/translations';
import { UserRole } from '../../types';
import {
  Home,
  Store,
  ShoppingCart,
  Package,
  Sprout,
  Truck,
  Heart,
  TrendingUp,
  FileSpreadsheet,
  QrCode,
  ShieldCheck,
  ClipboardList,
  BookOpen,
  MessageSquare,
  Users,
  Settings,
  Bell,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  labelFr: string;
  labelAr: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    language,
    activeTab,
    setActiveTab,
    userProfile,
    favoriteIds,
    escrowTransactions,
    openExcelStockModal,
    openFieldQRScannerModal,
    openUserManual,
    totalUnreadDiscussionsCount,
    setIsDiscussionsListModalOpen,
  } = useApp();

  const role: UserRole = userProfile.role || 'buyer';

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'seller':
        return [
          {
            id: 'seller_space',
            labelFr: 'Tableau de bord Vendeur',
            labelAr: 'لوحة قيادة البائع',
            icon: <Home className="w-5 h-5 text-amber-500" />,
            isActive: activeTab === 'seller_space' || activeTab === 'seller_dashboard',
            onClick: () => setActiveTab('seller_space'),
          },
          {
            id: 'inventory',
            labelFr: 'Inventaire & Stocks',
            labelAr: 'المخزون وعروض البيع',
            icon: <Package className="w-5 h-5 text-emerald-500" />,
            isActive: activeTab === 'inventory' || activeTab === 'inventory_form' || activeTab === 'inventory_item',
            onClick: () => setActiveTab('inventory'),
          },
          {
            id: 'orders',
            labelFr: 'Commandes Ventes (Séquestre)',
            labelAr: 'طلبات البيع والضمان',
            icon: <TrendingUp className="w-5 h-5 text-teal-500" />,
            isActive: activeTab === 'orders' || activeTab === 'order_detail',
            onClick: () => setActiveTab('orders'),
            badge: escrowTransactions.filter(t => t.status === 'funds_held').length || undefined,
          },
          {
            id: 'notifications',
            labelFr: 'Notifications & Alertes',
            labelAr: 'التنبيهات والإشعارات',
            icon: <Bell className="w-5 h-5 text-amber-500" />,
            isActive: activeTab === 'notifications',
            onClick: () => setActiveTab('notifications'),
          },
          {
            id: 'profile',
            labelFr: 'Profil Exploitation',
            labelAr: 'ملف الضيعة الفلاحية',
            icon: <Users className="w-5 h-5 text-stone-600" />,
            isActive: activeTab === 'profile' || activeTab === 'settings',
            onClick: () => setActiveTab('profile'),
          },
        ];

      case 'nursery':
        return [
          {
            id: 'nursery_space',
            labelFr: 'Espace Pépiniériste',
            labelAr: 'فضاء صاحب المشتل',
            icon: <Home className="w-5 h-5 text-emerald-500" />,
            isActive: activeTab === 'nursery_space' || activeTab === 'nursery_dashboard',
            onClick: () => setActiveTab('nursery_space'),
          },
          {
            id: 'nursery_inventory',
            labelFr: 'Lots & Plants ONSSA',
            labelAr: 'الشتائل والمخزون المعتمد',
            icon: <Sprout className="w-5 h-5 text-teal-500" />,
            isActive: activeTab === 'nursery' || activeTab === 'nursery_inventory' || activeTab === 'nursery_lot_detail' || activeTab === 'nursery_lot_form',
            onClick: () => setActiveTab('nursery_inventory'),
          },
          {
            id: 'orders',
            labelFr: 'Commandes & Réservations',
            labelAr: 'طلبيات الشتائل',
            icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
            isActive: activeTab === 'orders' || activeTab === 'order_detail',
            onClick: () => setActiveTab('orders'),
          },
          {
            id: 'notifications',
            labelFr: 'Alertes & Traitements',
            labelAr: 'تنبيهات المداواة',
            icon: <Bell className="w-5 h-5 text-amber-500" />,
            isActive: activeTab === 'notifications',
            onClick: () => setActiveTab('notifications'),
          },
          {
            id: 'profile',
            labelFr: 'Agrément & Profil Mépinière',
            labelAr: 'اعتماد المشتل والملف',
            icon: <Users className="w-5 h-5 text-stone-600" />,
            isActive: activeTab === 'profile' || activeTab === 'settings',
            onClick: () => setActiveTab('profile'),
          },
        ];

      case 'carrier':
        return [
          {
            id: 'carrier_space',
            labelFr: 'Espace Fret & Transport',
            labelAr: 'فضاء النقل الفلاحي',
            icon: <Home className="w-5 h-5 text-blue-500" />,
            isActive: activeTab === 'carrier_space' || activeTab === 'transport_dashboard',
            onClick: () => setActiveTab('transport_dashboard'),
          },
          {
            id: 'logistics',
            labelFr: 'Missions de Fret Agricole',
            labelAr: 'مهام الشحن واللوجستيك',
            icon: <ClipboardList className="w-5 h-5 text-emerald-500" />,
            isActive: activeTab === 'logistics' || activeTab === 'transport_request',
            onClick: () => setActiveTab('logistics'),
          },
          {
            id: 'delivery_tracking',
            labelFr: 'Suivi Livraisons & Flotte',
            labelAr: 'تتبع الشحنات والأسطول',
            icon: <Truck className="w-5 h-5 text-amber-500" />,
            isActive: activeTab === 'delivery_tracking',
            onClick: () => setActiveTab('delivery_tracking'),
          },
          {
            id: 'notifications',
            labelFr: 'Alertes & Trajets',
            labelAr: 'تنبيهات الرحلات',
            icon: <Bell className="w-5 h-5 text-amber-500" />,
            isActive: activeTab === 'notifications',
            onClick: () => setActiveTab('notifications'),
          },
          {
            id: 'profile',
            labelFr: 'Profil Transporteur',
            labelAr: 'ملف الناقل المعتمد',
            icon: <Users className="w-5 h-5 text-stone-600" />,
            isActive: activeTab === 'profile' || activeTab === 'settings',
            onClick: () => setActiveTab('profile'),
          },
        ];

      case 'admin':
        return [
          {
            id: 'admin_dashboard',
            labelFr: 'Supervision Générale',
            labelAr: 'لوحة الإدارة الشاملة',
            icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
            isActive: activeTab === 'admin' || activeTab === 'admin_dashboard',
            onClick: () => setActiveTab('admin_dashboard'),
          },
          {
            id: 'admin_users',
            labelFr: 'Gestion Utilisateurs',
            labelAr: 'إدارة المستخدمين',
            icon: <Users className="w-5 h-5 text-blue-500" />,
            isActive: activeTab === 'admin_users',
            onClick: () => setActiveTab('admin_users'),
          },
          {
            id: 'admin_moderation',
            labelFr: 'Modération des Annonces',
            labelAr: 'مراقبة العروض',
            icon: <Store className="w-5 h-5 text-amber-600" />,
            isActive: activeTab === 'admin_moderation',
            onClick: () => setActiveTab('admin_moderation'),
          },
          {
            id: 'admin_settings',
            labelFr: 'Paramètres & Commissions',
            labelAr: 'الإعدادات والعمولات',
            icon: <Settings className="w-5 h-5 text-teal-600" />,
            isActive: activeTab === 'admin_settings',
            onClick: () => setActiveTab('admin_settings'),
          },
          {
            id: 'profile',
            labelFr: 'Compte Administrateur',
            labelAr: 'حساب الإدارة',
            icon: <Users className="w-5 h-5 text-stone-600" />,
            isActive: activeTab === 'profile',
            onClick: () => setActiveTab('profile'),
          },
        ];

      // Par défaut : ACHETEUR
      default:
      case 'buyer':
        return [
          {
            id: 'marketplace',
            labelFr: 'Marché & Primeurs',
            labelAr: 'سوق الخضر والفواكه',
            icon: <Store className="w-5 h-5 text-emerald-600" />,
            isActive: activeTab === 'market' || activeTab === 'marketplace' || activeTab === 'home',
            onClick: () => setActiveTab('marketplace'),
          },
          {
            id: 'favorites',
            labelFr: 'Lots Favoris',
            labelAr: 'العروض المفضلة',
            icon: <Heart className="w-5 h-5 text-red-500" />,
            isActive: activeTab === 'favorites',
            onClick: () => setActiveTab('favorites'),
            badge: favoriteIds.length || undefined,
          },
          {
            id: 'orders',
            labelFr: 'Mes Achats (Séquestre CMI)',
            labelAr: 'مشترياتي والضمان البنكي',
            icon: <ShoppingCart className="w-5 h-5 text-teal-600" />,
            isActive: activeTab === 'orders' || activeTab === 'order_detail',
            onClick: () => setActiveTab('orders'),
          },
          {
            id: 'notifications',
            labelFr: 'Alertes & Baisses de Prix',
            labelAr: 'تنبيهات انخفاض الأسعار',
            icon: <Bell className="w-5 h-5 text-amber-500" />,
            isActive: activeTab === 'notifications',
            onClick: () => setActiveTab('notifications'),
          },
          {
            id: 'profile',
            labelFr: 'Mon Profil Acheteur',
            labelAr: 'الملف المهني للمشتري',
            icon: <Users className="w-5 h-5 text-stone-600" />,
            isActive: activeTab === 'profile' || activeTab === 'settings',
            onClick: () => setActiveTab('profile'),
          },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      aria-label="Navigation principale de l'espace métier"
      className={`fixed top-14 sm:top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-stone-200 shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col justify-between p-4 overflow-y-auto">
        {/* Navigation principale par rôle */}
        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 pb-2">
              {role === 'seller'
                ? 'Espace Exploitant Vendeur'
                : role === 'nursery'
                ? 'Espace Pépinière Agréée'
                : role === 'carrier'
                ? 'Espace Transporteur Fret'
                : role === 'admin'
                ? 'Espace Administrateur'
                : 'Espace Acheteur & Négociant'}
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    if (onClose && window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    item.isActive
                      ? 'bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-300'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{language === 'ar' ? item.labelAr : item.labelFr}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Outils Métiers B2B Rapides */}
          <div className="border-t border-stone-100 pt-4">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 pb-2">
              {tr(language, 'Outils & Services', 'أدوات وخدمات', 'Tools & Services')}
            </p>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('wholesale');
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'wholesale' || activeTab === 'directory' || activeTab === 'gmail' || activeTab === 'playstore'
                    ? 'bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-200'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>{tr(language, 'Bourse Mercuriale & Outils', 'بورصة الأسعار والخدمات', 'Price Tickers & Tools')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openExcelStockModal();
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{tr(language, 'Import / Export Excel', 'استيراد/تصدير إكسيل', 'Excel Import/Export')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openFieldQRScannerModal();
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-teal-600" />
                <span>{tr(language, 'Scanner QR Champ-au-Marché', 'مسح رمز الاستجابة', 'QR Scanner')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDiscussionsListModalOpen(true);
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>{tr(language, 'Discussions & Offres B2B', 'المحادثات المباشرة', 'B2B Chats')}</span>
                </div>
                {totalUnreadDiscussionsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                    {totalUnreadDiscussionsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  openUserManual();
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-stone-500" />
                <span>{tr(language, 'Guide Utilisateur & Démo', 'دليل الاستخدام', 'User Guide')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('notifications');
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span>{tr(language, 'Alertes & Notifications', 'مركز التنبيهات', 'Notifications')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-purple-600" />
                <span>{tr(language, 'Paramètres du Compte', 'إعدادات الحساب', 'Settings')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pied de Sidebar : Conformité & Badge Sécurité */}
        <div className="border-t border-stone-100 pt-3 text-[11px] text-stone-500 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>AgriStock Maroc 2026</span>
          </div>
          <p className="text-stone-400">Paiement Garanti Séquestre & CNDP</p>
        </div>
      </div>
    </aside>
  );
};
