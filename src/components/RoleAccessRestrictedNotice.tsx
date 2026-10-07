import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { tr } from '../utils/translations';
import {
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  ShoppingCart,
  Store,
  Sprout,
  Tractor,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  requiredRole?: UserRole;
  roleLabel?: string;
  currentRole?: UserRole;
  title?: string;
  description?: string;
  onSwitchRole?: () => void;
  onGoToBuyerCatalog?: () => void;
}

export const RoleAccessRestrictedNotice: React.FC<Props> = ({
  requiredRole = 'nursery',
  roleLabel,
  currentRole,
  title,
  description,
  onSwitchRole,
  onGoToBuyerCatalog,
}) => {
  const { language, setActiveTab, userProfile, switchActiveRole, setUserRole } = useApp();

  const effectiveCurrentRole = currentRole || userProfile?.role || 'buyer';

  const defaultRoleLabels: Record<UserRole, { fr: string; ar: string; en: string }> = {
    nursery: {
      fr: 'Pépiniériste Agréé',
      ar: 'مشتل معتمد ومنتج شتلات',
      en: 'Certified Nursery Producer',
    },
    seller: {
      fr: 'Agriculteur / Vendeur',
      ar: 'فلاح منتج / بائع',
      en: 'Farmer / Producer Seller',
    },
    carrier: {
      fr: 'Transporteur Frigorifique',
      ar: 'ناقل لوجستي معتمد',
      en: 'Refrigerated Carrier',
    },
    buyer: {
      fr: 'Acheteur Professionnel',
      ar: 'مشتري مهني',
      en: 'Professional Buyer',
    },
    admin: {
      fr: 'Administrateur',
      ar: 'مدير المنصة',
      en: 'Platform Administrator',
    },
  };

  const effectiveRoleLabel =
    roleLabel ||
    (defaultRoleLabels[requiredRole]
      ? tr(
          language,
          defaultRoleLabels[requiredRole].fr,
          defaultRoleLabels[requiredRole].ar,
          defaultRoleLabels[requiredRole].en
        )
      : String(requiredRole));

  const handleSwitchRole = () => {
    if (onSwitchRole) {
      onSwitchRole();
      return;
    }
    if (typeof switchActiveRole === 'function') {
      switchActiveRole(requiredRole);
    } else if (typeof setUserRole === 'function') {
      setUserRole(requiredRole);
    }
  };

  const handleGoToCatalog = () => {
    if (onGoToBuyerCatalog) {
      onGoToBuyerCatalog();
      return;
    }
    setActiveTab('market');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'nursery':
        return <Sprout className="w-6 h-6 text-teal-700" />;
      case 'seller':
        return <Tractor className="w-6 h-6 text-amber-700" />;
      case 'carrier':
        return <Truck className="w-6 h-6 text-blue-700" />;
      case 'admin':
        return <ShieldAlert className="w-6 h-6 text-purple-700" />;
      default:
        return <ShoppingCart className="w-6 h-6 text-emerald-700" />;
    }
  };

  const displayTitle =
    title ||
    tr(
      language,
      `Cet espace est réservé au rôle ${effectiveRoleLabel}`,
      `هذا الفضاء مخصص لدور ${effectiveRoleLabel}`,
      `This space is reserved for ${effectiveRoleLabel}`
    );

  const displayDescription =
    description ||
    tr(
      language,
      `Vous êtes actuellement actif avec le profil "${(effectiveCurrentRole || 'buyer').toUpperCase()}". AGRISTOCK isole rigoureusement les données d'inventaire interne, les alertes de seuils et les formulaires de gestion pour chaque profession.`,
      `أنت متصل حالياً بحساب "${(effectiveCurrentRole || 'buyer').toUpperCase()}". تقوم منصة أگريستوك بعزل بيانات المخزون الداخلي والتنبيهات المخصصة لكل مهنة.`,
      `You are currently active as "${(effectiveCurrentRole || 'buyer').toUpperCase()}". AGRISTOCK strictly isolates internal inventory, threshold alerts, and management forms per role.`
    );

  return (
    <div
      id="role-access-restricted-card"
      className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm text-center space-y-6 animate-in fade-in duration-300"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
          {tr(language, 'Espace Métier Réservé', 'فضاء مهني مخصص', 'Restricted Workspace')}
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-stone-900">
          {displayTitle}
        </h2>
        <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          {displayDescription}
        </p>
      </div>

      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left text-xs text-stone-700 space-y-2">
        <div className="font-bold text-stone-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{tr(language, 'Ce que vous pouvez faire en tant qu\'Acheteur :', 'ما يمكنك فعله كمشتري :', 'What you can do as a Buyer:')}</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
          <li>{tr(language, 'Consulter le catalogue des plants certifiés et offres de récoltes', 'تصفح دليل الشتلات المعتمدة وعروض المحاصيل', 'Browse certified plants catalogue and produce listings')}</li>
          <li>{tr(language, 'Comparer les cours de gros et négocier en direct avec les producteurs', 'مقارنة أسعار الجملة والتفاوض المباشر مع المنتجين', 'Compare wholesale prices and negotiate directly with producers')}</li>
          <li>{tr(language, 'Commander avec paiement sécurisé sous séquestre bancaire garanti', 'طلب الشراء مع دفع آمن عبر الحساب الضامن', 'Place orders with protected bank escrow')}</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          id="btn-switch-to-role"
          type="button"
          onClick={handleSwitchRole}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>
            {tr(
              language,
              `Basculer vers le rôle ${effectiveRoleLabel}`,
              `التحويل إلى دور ${effectiveRoleLabel}`,
              `Switch to ${effectiveRoleLabel} role`
            )}
          </span>
        </button>

        <button
          id="btn-go-buyer-catalog"
          type="button"
          onClick={handleGoToCatalog}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Store className="w-4 h-4" />
          <span>{tr(language, 'Voir le Catalogue Public', 'عرض الدليل العام', 'View Public Catalogue')}</span>
        </button>
      </div>
    </div>
  );
};
