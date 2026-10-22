import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/translations';
import { UserRole } from '../../types';
import {
  User,
  ShoppingBag,
  Store,
  Sprout,
  Truck,
  ShieldCheck,
  ChevronDown,
  Check,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';

interface RoleOption {
  role: UserRole;
  labelFr: string;
  labelAr: string;
  badgeFr: string;
  badgeColor: string;
  icon: React.ReactNode;
}

const ALL_ROLES: RoleOption[] = [
  {
    role: 'buyer',
    labelFr: 'Espace Acheteur',
    labelAr: 'فضاء المشتري',
    badgeFr: 'Particulier & Pro',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />,
  },
  {
    role: 'seller',
    labelFr: 'Espace Vendeur',
    labelAr: 'فضاء الفلاح / البائع',
    badgeFr: 'Producteur Agricole',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <Store className="w-4 h-4 text-amber-600" />,
  },
  {
    role: 'nursery',
    labelFr: 'Espace Pépiniériste',
    labelAr: 'فضاء صاحب المشتل',
    badgeFr: 'Agréé ONSSA',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    icon: <Sprout className="w-4 h-4 text-teal-600" />,
  },
  {
    role: 'carrier',
    labelFr: 'Espace Transporteur',
    labelAr: 'فضاء الناقل الفلاحي',
    badgeFr: 'Fret Frigo & Vrac',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: <Truck className="w-4 h-4 text-blue-600" />,
  },
  {
    role: 'admin',
    labelFr: 'Administration',
    labelAr: 'الإدارة العامة',
    badgeFr: 'Superviseur Système',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
  },
];

export const RoleSelector: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const {
    language,
    userProfile,
    setUserRole,
    setActiveTab,
    setIsRoleOnboardingOpen,
    setIsAdminLoginModalOpen,
    isAdminAuthenticated,
    adminSession,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown au clic externe
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeRole = userProfile.role || 'buyer';
  const userRolesList = userProfile.roles && userProfile.roles.length > 0
    ? userProfile.roles
    : [activeRole];

  // Rôles autorisés pour cet utilisateur (sauf admin qui nécessite authentification stricte)
  const availableRoles = ALL_ROLES.filter((r) => {
    if (r.role === 'admin') {
      return Boolean(isAdminAuthenticated || adminSession);
    }
    return userRolesList.includes(r.role);
  });

  const currentOption = ALL_ROLES.find((r) => r.role === activeRole) || ALL_ROLES[0];

  const handleSelectRole = (targetRole: UserRole) => {
    if (targetRole === 'admin' && !isAdminAuthenticated && !adminSession) {
      setIsAdminLoginModalOpen(true);
      setIsOpen(false);
      return;
    }

    setUserRole(targetRole);
    setIsOpen(false);

    // Redirection automatique vers l'espace métier correspondant
    if (targetRole === 'seller') {
      setActiveTab('seller_space');
    } else if (targetRole === 'nursery') {
      setActiveTab('nursery_space');
    } else if (targetRole === 'carrier') {
      setActiveTab('carrier_space');
    } else if (targetRole === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Bouton de sélection actuel */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-stone-100 text-xs sm:text-sm font-medium transition cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={tr(language, 'Changer d\'espace ou de profil', 'تغيير الصفة أو الفضاء', 'Switch role')}
      >
        <span className="flex items-center gap-1.5">
          {currentOption.icon}
          <span className="font-semibold text-white">
            {language === 'ar' ? currentOption.labelAr : currentOption.labelFr}
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu déroulant des rôles autorisés */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 divide-y divide-stone-100 focus:outline-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          <div className="p-3">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-2 pb-1.5">
              {tr(language, 'Vos rôles autorisés', 'صفاتك المعتمدة', 'Your authorized roles')}
            </p>
            <div className="space-y-1">
              {availableRoles.map((item) => {
                const isSelected = item.role === activeRole;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelectRole(item.role)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-300'
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-medium">
                          {language === 'ar' ? item.labelAr : item.labelFr}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-normal ${item.badgeColor}`}>
                          {item.badgeFr}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option pour activer ou certifier un nouveau rôle professionnel */}
          <div className="p-2 bg-stone-50/80 rounded-b-2xl">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsRoleOnboardingOpen(true);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-emerald-800 hover:bg-emerald-100/60 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {tr(
                  language,
                  'Activer un autre rôle (Pépinière, Vendeur, Transport)',
                  'تفعيل صفة إضافية (مشتل، بائع، نقل)',
                  'Add another professional role'
                )}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
