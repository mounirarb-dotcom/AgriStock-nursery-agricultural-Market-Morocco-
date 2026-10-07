import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { AppTab, AppLanguage } from '../../types';
import { tr } from '../../utils/translations';

interface NavbarBreadcrumbsProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  language: AppLanguage;
  role: string;
}

export const NavbarBreadcrumbs: React.FC<NavbarBreadcrumbsProps> = ({
  activeTab,
  setActiveTab,
  language,
  role,
}) => {
  if (activeTab === 'home') return null;

  const getBreadcrumbLabel = (tab: AppTab): string => {
    switch (tab) {
      case 'market':
        return tr(language, 'Marché Récoltes & Primeurs', 'سوق المحاصيل والخضر', 'Produce Market');
      case 'farm_standing':
        return tr(language, 'Vergers & Ventes sur Pied', 'محاصيل على رؤوس أشجارها', 'Standing Crops');
      case 'wholesale':
        return tr(language, 'Bourse des Prix de Gros', 'بورصة أسعار الجملة', 'Wholesale Prices');
      case 'nursery':
      case 'nursery_space':
        return tr(language, 'Espace Pépinière Agréée', 'فضاء المشتل المعتمد', 'Nursery Space');
      case 'buyer_space':
        return tr(language, 'Espace Acheteur & Négociant', 'فضاء المشتري والتاجر', 'Buyer Space');
      case 'seller_space':
        return tr(language, 'Espace Vendeur & Producteur', 'فضاء البائع والمنتج', 'Seller Space');
      case 'carrier_space':
        return tr(language, 'Espace Fret & Transporteur', 'فضاء الشحن والنقل', 'Carrier Space');
      case 'admin':
        return tr(language, 'Console Supervision Admin', 'لوحة تحكم الإدارة', 'Admin Console');
      case 'playstore':
        return tr(language, 'Application Mobile PWA', 'تطبيق الهاتف', 'Mobile App');
      default:
        return tab;
    }
  };

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-300/80 px-1 py-0.5">
      <button
        type="button"
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-1 hover:text-white transition cursor-pointer"
        title={tr(language, 'Retour à l\'accueil', 'العودة للرئيسية', 'Back to Home')}
      >
        <Home className="w-3 h-3 text-emerald-400" />
        <span>{tr(language, 'Accueil', 'الرئيسية', 'Home')}</span>
      </button>
      <ChevronRight className="w-3 h-3 text-emerald-600/70 rtl:rotate-180" />
      <span className="font-semibold text-emerald-100">{getBreadcrumbLabel(activeTab)}</span>
    </div>
  );
};
