import React from 'react';
import { ChevronDown, ShoppingCart, User, Sprout, Truck, RefreshCw } from 'lucide-react';
import { UserProfile, AppLanguage, AppTab } from '../../types';
import { tr } from '../../utils/translations';
import { useApp } from '../../context/AppContext';

interface NavbarRoleSelectorProps {
  userProfile: UserProfile;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  setUserRole: (role: any) => void;
  roleDropdownOpen: boolean;
  setRoleDropdownOpen: (open: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  language: AppLanguage;
}

export const NavbarRoleSelector: React.FC<NavbarRoleSelectorProps> = ({
  userProfile,
  activeTab,
  setActiveTab,
  setUserRole,
  roleDropdownOpen,
  setRoleDropdownOpen,
  setIsProfileModalOpen,
  language,
}) => {
  const { setIsRoleOnboardingOpen } = useApp();
  const activeUserRoles =
    userProfile.roles && userProfile.roles.length > 0
      ? userProfile.roles
      : [userProfile.role];
  const hasMultipleRoles = activeUserRoles.length > 1;

  const navigateToActiveWorkspace = () => {
    if (userProfile.role === 'seller') setActiveTab('seller_space');
    else if (userProfile.role === 'nursery') setActiveTab('nursery_space');
    else if (userProfile.role === 'carrier') setActiveTab('carrier_space');
    else setActiveTab('buyer_space');
  };

  return (
    <div className="relative hidden lg:block">
      <div className="flex items-center rounded-xl bg-stone-900/90 border border-stone-700/80 shadow-xs p-0.5">
        <button
          id="btn-navbar-active-workspace"
          type="button"
          onClick={navigateToActiveWorkspace}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'buyer_space' ||
            activeTab === 'seller_space' ||
            activeTab === 'nursery_space' ||
            activeTab === 'carrier_space'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-200 hover:bg-stone-800'
          }`}
          title={tr(language, 'Accéder à mon espace métier actif', 'الدخول إلى فضاء العمل النشط', 'Access active workspace')}
        >
          {userProfile.role === 'seller' && <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          {userProfile.role === 'nursery' && <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          {userProfile.role === 'carrier' && <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
          {userProfile.role === 'buyer' && <ShoppingCart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          <span className="text-[11px] sm:text-xs">
            {userProfile.role === 'seller' && tr(language, 'Vendeur', 'فضاء البائع', 'Seller')}
            {userProfile.role === 'nursery' && tr(language, 'Pépinière', 'فضاء المشتل', 'Nursery')}
            {userProfile.role === 'carrier' && tr(language, 'Transport', 'فضاء النقل', 'Freight')}
            {userProfile.role === 'buyer' && tr(language, 'Acheteur', 'فضاء المشتري', 'Buyer')}
            {userProfile.role === 'admin' && tr(language, 'Admin', 'الإدارة', 'Admin')}
          </span>
        </button>

        <button
          id="btn-navbar-open-role-onboarding"
          type="button"
          onClick={() => setIsRoleOnboardingOpen(true)}
          className="px-2 h-8 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 border-l border-stone-800 ml-0.5"
          title={tr(language, 'Changer de profil (Acheteur, Vendeur, Pépinière, Transporteur)', 'تغيير الصفة', 'Switch profile')}
        >
          <span className="text-emerald-400 font-bold">⇄</span>
          <span className="hidden xl:inline">{tr(language, 'Changer', 'تبديل', 'Switch')}</span>
        </button>

        {hasMultipleRoles && (
          <button
            id="btn-navbar-open-role-menu"
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="px-1.5 h-8 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition cursor-pointer flex items-center"
            title={tr(language, 'Changer d\'espace (multi-rôles)', 'تغيير الفضاء', 'Switch workspace')}
            aria-expanded={roleDropdownOpen}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Menu Déroulant Multi-Rôles */}
      {hasMultipleRoles && roleDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-stone-100"
          onClick={() => setRoleDropdownOpen(false)}
        >
          <div className="px-3 py-1.5 border-b border-stone-800 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              {tr(language, 'Changer d\'espace', 'تبديل الفضاء', 'Switch Workspace')}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRoleDropdownOpen(false);
                setIsProfileModalOpen(true);
              }}
              className="text-[10px] text-stone-400 hover:text-emerald-300 underline cursor-pointer"
            >
              {tr(language, 'Gérer mes rôles', 'إدارة أدواري', 'Manage roles')}
            </button>
          </div>

          {/* Rôle 1: ACHETEUR */}
          {activeUserRoles.includes('buyer') && (
            <button
              type="button"
              onClick={() => {
                setUserRole('buyer');
                setActiveTab('buyer_space');
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition cursor-pointer ${
                userProfile.role === 'buyer' ? 'bg-emerald-900/40 border border-emerald-500/40' : 'hover:bg-stone-800'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{tr(language, 'Acheteur', 'مشتري / تاجر', 'Buyer')}</span>
                  {userProfile.role === 'buyer' && (
                    <span className="text-[10px] text-emerald-400 font-bold">Actif</span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  {tr(language, 'Commandes, séquestre, logistique', 'طلبيات، ضمان ودفع', 'Orders, escrow, freight')}
                </div>
              </div>
            </button>
          )}

          {/* Rôle 2: VENDEUR / PRODUCTEUR */}
          {activeUserRoles.includes('seller') && (
            <button
              type="button"
              onClick={() => {
                setUserRole('seller');
                setActiveTab('seller_space');
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition cursor-pointer ${
                userProfile.role === 'seller' ? 'bg-amber-900/40 border border-amber-500/40' : 'hover:bg-stone-800'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{tr(language, 'Vendeur / Producteur', 'بائع / فلاح منتج', 'Seller / Producer')}</span>
                  {userProfile.role === 'seller' && (
                    <span className="text-[10px] text-amber-400 font-bold">Actif</span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  {tr(language, 'Offres de récoltes, ventes sur pied', 'محاصيل، بيع بالهكتار', 'Crops & standing sales')}
                </div>
              </div>
            </button>
          )}

          {/* Rôle 3: PÉPINIÉRISTE AGRÉÉ */}
          {activeUserRoles.includes('nursery') && (
            <button
              type="button"
              onClick={() => {
                setUserRole('nursery');
                setActiveTab('nursery_space');
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition cursor-pointer ${
                userProfile.role === 'nursery' ? 'bg-emerald-900/40 border border-emerald-500/40' : 'hover:bg-stone-800'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{tr(language, 'Pépiniériste Agréé', 'مشتل معتمد', 'Certified Nursery')}</span>
                  {userProfile.role === 'nursery' && (
                    <span className="text-[10px] text-emerald-400 font-bold">Actif</span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  {tr(language, 'Plants certifiés, passeports ONSSA', 'شتلات معتمدة أونسا', 'Certified plants & ONSSA')}
                </div>
              </div>
            </button>
          )}

          {/* Rôle 4: TRANSPORTEUR */}
          {activeUserRoles.includes('carrier') && (
            <button
              type="button"
              onClick={() => {
                setUserRole('carrier');
                setActiveTab('carrier_space');
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition cursor-pointer ${
                userProfile.role === 'carrier' ? 'bg-sky-900/40 border border-sky-500/40' : 'hover:bg-stone-800'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{tr(language, 'Transporteur Agréé', 'ناقل معتمد', 'Approved Carrier')}</span>
                  {userProfile.role === 'carrier' && (
                    <span className="text-[10px] text-sky-400 font-bold">Actif</span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  {tr(language, 'Flotte de camions, fret & tournées', 'أسطول الشاحنات والشحن', 'Fleet & freight missions')}
                </div>
              </div>
            </button>
          )}

          {/* Demander un rôle supplémentaire */}
          <div className="pt-1.5 mt-1.5 border-t border-stone-800">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRoleDropdownOpen(false);
                setIsProfileModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-800/80 hover:bg-emerald-950/50 text-emerald-400 text-xs font-semibold border border-dashed border-stone-700 hover:border-emerald-500/50 transition cursor-pointer"
            >
              <span>+ {tr(language, 'Demander un nouveau rôle', 'طلب دور إضافي', 'Request a new role')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
