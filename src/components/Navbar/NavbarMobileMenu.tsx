import React from 'react';
import {
  User,
  UserPlus,
  LogIn,
  ShoppingCart,
  Tractor,
  Sprout,
  Truck,
  Scan,
  ShieldCheck,
  MessageSquare,
  Bell,
  Info,
  ChevronRight,
  ShieldAlert,
  Globe,
  Check,
} from 'lucide-react';
import { UserProfile, AppLanguage, AppTab, EscrowTransaction } from '../../types';
import { tr } from '../../utils/translations';
import { NavTabItem } from './NavbarTypes';

interface NavbarMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  language: AppLanguage;
  setLanguage?: (lang: AppLanguage) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  setUserRole: (role: any) => void;
  tabs?: NavTabItem[];
  setIsProfileModalOpen: (open: boolean) => void;
  setIsRegistrationModalOpen: (open: boolean) => void;
  openAudioSearchModal?: () => void;
  setIsLoginModalOpen: (open: boolean) => void;
  openFieldQRScannerModal: () => void;
  isSessionUnlocked?: boolean;
  lockSession?: () => void;
  setStockAuthModalMode?: (mode: any) => void;
  setIsStockAuthModalOpen?: (open: boolean) => void;
  setIsEscrowListModalOpen: (open: boolean) => void;
  escrowTransactions: EscrowTransaction[];
  openLogisticsModal?: () => void;
  setIsProModalOpen?: (open: boolean) => void;
  platformPaymentProtected?: boolean;
  togglePlatformPaymentProtection?: () => void;
  openNotificationSettings: () => void;
  unreadNotificationsCount?: number;
  totalUnreadDiscussionsCount?: number;
  openExportManifestModal?: () => void;
  setIsOfficialComplianceModalOpen?: (open: boolean) => void;
  setIsBenchmarkModalOpen?: (open: boolean) => void;
  openUserManual?: () => void;
  openExcelStockModal?: () => void;
  setShowSettingsModal?: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  adminSession?: any;
}

export const NavbarMobileMenu: React.FC<NavbarMobileMenuProps> = ({
  isOpen,
  onClose,
  userProfile,
  language,
  setLanguage,
  activeTab,
  setActiveTab,
  setUserRole,
  setIsProfileModalOpen,
  setIsRegistrationModalOpen,
  setIsLoginModalOpen,
  openFieldQRScannerModal,
  setIsEscrowListModalOpen,
  escrowTransactions,
  openNotificationSettings,
  unreadNotificationsCount = 0,
  totalUnreadDiscussionsCount = 0,
  isAdminAuthenticated,
  adminSession,
}) => {
  if (!isOpen) return null;

  const currentRole = userProfile.role || 'buyer';

  const roleNameMap: Record<string, { label: string; icon: React.ReactNode; sub: string; tab: AppTab }> = {
    buyer: {
      label: tr(language, 'Espace Acheteur', 'فضاء المشتري', 'Buyer Space'),
      icon: <ShoppingCart className="w-4 h-4 text-emerald-400 shrink-0" />,
      sub: tr(language, 'Consultation offres & commandes', 'تصفح العروض والطلبيات', 'Browse offers & orders'),
      tab: 'buyer_space',
    },
    seller: {
      label: tr(language, 'Espace Vendeur', 'فضاء البائع', 'Seller Space'),
      icon: <Tractor className="w-4 h-4 text-amber-400 shrink-0" />,
      sub: tr(language, 'Récoltes & vergers sur pied', 'المحاصيل والضيعات الفلاحية', 'Crops & standing orchards'),
      tab: 'seller_space',
    },
    nursery: {
      label: tr(language, 'Espace Pépinière', 'فضاء المشتل', 'Nursery Space'),
      icon: <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />,
      sub: tr(language, 'Plants certifiés & ONSSA', 'الشتلات المعتمدة وأونسا', 'Certified plants & ONSSA'),
      tab: 'nursery_space',
    },
    carrier: {
      label: tr(language, 'Espace Transporteur', 'فضاء الناقل', 'Carrier Space'),
      icon: <Truck className="w-4 h-4 text-sky-400 shrink-0" />,
      sub: tr(language, 'Fret agricole & camions frigo', 'الشحن وشاحنات التبريد', 'Freight & refrigerated trucks'),
      tab: 'carrier_space',
    },
  };

  const handleSelectRole = (role: 'buyer' | 'seller' | 'nursery' | 'carrier') => {
    setUserRole(role);
    setActiveTab(roleNameMap[role].tab);
    onClose();
  };

  return (
    <div className="lg:hidden bg-[#091a11] border-b border-[#1b3d2c] px-3.5 pt-3 pb-5 space-y-3.5 shadow-2xl animate-in slide-in-from-top duration-200">
      {/* 1. Compte & Profil Épuré */}
      <div className="p-3 rounded-2xl bg-stone-900/90 border border-emerald-950/60 shadow-xs">
        {userProfile.email || userProfile.hasCompletedIdentification ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
                {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate block">
                    {userProfile.displayName || tr(language, 'Mon Compte', 'حسابي', 'My Account')}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                    {userProfile.role === 'nursery'
                      ? 'Pépiniériste'
                      : userProfile.role === 'seller'
                      ? 'Vendeur'
                      : userProfile.role === 'carrier'
                      ? 'Transporteur'
                      : 'Acheteur'}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 truncate block">
                  {userProfile.companyName || userProfile.region || 'Maroc'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(true);
                onClose();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold shrink-0 transition cursor-pointer"
            >
              <span>{tr(language, 'Profil', 'الملف', 'Profile')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsLoginModalOpen(true);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{tr(language, 'Se connecter', 'تسجيل الدخول', 'Log In')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistrationModalOpen(true);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{tr(language, 'Créer un compte', 'إنشاء حساب', 'Sign Up')}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Espaces Métiers : Choix Direct & Épuré */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {tr(language, 'Espaces Métiers', 'فضاءات العمل', 'Workspaces')}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsProfileModalOpen(true);
              onClose();
            }}
            className="text-[10px] text-stone-400 hover:text-emerald-300 transition cursor-pointer"
          >
            {tr(language, 'Gérer mes rôles', 'إدارة الأدوار', 'Manage Roles')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(['buyer', 'seller', 'nursery', 'carrier'] as const).map((r) => {
            const item = roleNameMap[r];
            const isActive = currentRole === r;

            return (
              <button
                key={r}
                type="button"
                onClick={() => handleSelectRole(r)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-xs'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-800/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    {item.icon}
                    <span className="text-xs font-bold truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </div>
                <span className="text-[9px] text-stone-400 truncate block">
                  {item.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Services & Raccourcis Essentiels */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1">
          {tr(language, 'Services Essentiels', 'الخدمات الأساسية', 'Core Services')}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Séquestre B2B */}
          <button
            type="button"
            onClick={() => {
              setIsEscrowListModalOpen(true);
              onClose();
            }}
            className="p-2.5 rounded-xl bg-stone-900/70 hover:bg-stone-800/90 border border-stone-800 text-left transition flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {tr(language, 'Séquestre B2B', 'حساب الضمان', 'B2B Escrow')}
              </div>
              <div className="text-[10px] text-stone-400 truncate">
                {escrowTransactions.length > 0
                  ? `${escrowTransactions.length} transaction(s)`
                  : tr(language, 'Paiements protégés', 'دفع آمن ومضمون', 'Protected payments')}
              </div>
            </div>
          </button>

          {/* Scanner QR Lot */}
          <button
            type="button"
            onClick={() => {
              openFieldQRScannerModal();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-stone-900/70 hover:bg-stone-800/90 border border-stone-800 text-left transition flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Scan className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {tr(language, 'Scanner QR Lot', 'فحص رمز QR', 'Scan Batch QR')}
              </div>
              <div className="text-[10px] text-stone-400 truncate">
                {tr(language, 'ONSSA & Traçabilité', 'أونسا والتتبع', 'ONSSA & Traceability')}
              </div>
            </div>
          </button>

          {/* Messagerie */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('orders');
              onClose();
            }}
            className="p-2.5 rounded-xl bg-stone-900/70 hover:bg-stone-800/90 border border-stone-800 text-left transition flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white truncate">
                  {tr(language, 'Messages & Devis', 'المحادثات والعروض', 'Chats & Quotes')}
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  {tr(language, 'Négociations directes', 'تفاوض مباشر', 'Direct deals')}
                </div>
              </div>
              {totalUnreadDiscussionsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-bold text-[9px]">
                  {totalUnreadDiscussionsCount}
                </span>
              )}
            </div>
          </button>

          {/* Notifications & Alertes */}
          <button
            type="button"
            onClick={() => {
              openNotificationSettings();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-stone-900/70 hover:bg-stone-800/90 border border-stone-800 text-left transition flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white truncate">
                  {tr(language, 'Alertes & Météo', 'التنبيهات والطقس', 'Alerts & Weather')}
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  {tr(language, 'Prix & Chergui', 'الأسعار والشرقي', 'Prices & Climate')}
                </div>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-bold text-[9px]">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* 4. Pied du Menu : Langues & Raccourcis Discrets */}
      <div className="pt-2 border-t border-[#1a3828] flex items-center justify-between gap-2">
        {/* Sélecteur de Langue Rapide */}
        {setLanguage && (
          <div className="flex items-center gap-1 bg-stone-900/80 p-1 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                language === 'fr'
                  ? 'bg-emerald-600 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                language === 'ar'
                  ? 'bg-emerald-600 text-white font-arabic'
                  : 'text-stone-400 hover:text-white font-arabic'
              }`}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                language === 'en'
                  ? 'bg-emerald-600 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setActiveTab('playstore');
            onClose();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900/60 hover:bg-stone-800 text-stone-300 text-[11px] font-medium transition cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>{tr(language, 'À propos', 'حول المنصة', 'About')}</span>
        </button>

        {/* Console Admin discrète si déjà authentifié */}
        {isAdminAuthenticated && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 transition cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </div>
  );
};
