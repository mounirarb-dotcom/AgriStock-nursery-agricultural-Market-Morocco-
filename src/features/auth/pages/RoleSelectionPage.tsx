import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { UserRole } from '../../../types';
import {
  ShoppingBag,
  Store,
  Sprout,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface RoleOption {
  role: UserRole;
  titleFr: string;
  titleAr: string;
  badgeFr: string;
  badgeAr: string;
  descFr: string;
  descAr: string;
  featuresFr: string[];
  featuresAr: string[];
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'buyer',
    titleFr: 'Acheteur Professionnel / Négociant',
    titleAr: 'مشتري مهني / تاجر جملة',
    badgeFr: 'Approvisionnement B2B',
    badgeAr: 'التزود بالجملة',
    descFr: 'Achetez des récoltes fraîches, plants certifiés et produits agricoles directement bord champ avec paiement sécurisé sous séquestre.',
    descAr: 'شراء المحاصيل الطازجة والشتائل المعتمدة مباشرة من الضيعة مع ضمان الأداء البنكي.',
    featuresFr: ['Paiement séquestre garanti', 'Négociation directe sans intermédiaire', 'Livraison avec suivi frigorifique'],
    featuresAr: ['دفع آمن مع حساب الضمان', 'تفاوض مباشر بدون وسيط', 'توصيل مبرد مع التتبع'],
    icon: <ShoppingBag className="w-6 h-6 text-emerald-600" />,
    bgGradient: 'from-emerald-50/60 to-white',
    borderColor: 'border-emerald-200 hover:border-emerald-500',
    textColor: 'text-emerald-950',
  },
  {
    role: 'seller',
    titleFr: 'Agriculteur / Vendeur Récoltes',
    titleAr: 'فلاح منتج / بائع المحاصيل',
    badgeFr: 'Producteur Agricole',
    badgeAr: 'منتج فلاحي',
    descFr: 'Vendez vos récoltes sur pied ou récoltées au meilleur prix de gros, gérez vos stocks bord champ et recevez des paiements garantis.',
    descAr: 'عرض وبيع المحاصيل الزراعية على رؤوس أشجارها أو محصودة بأفضل أسعار الجملة واستلام العائدات بأمان.',
    featuresFr: ['Mise en vente récoltes sur pied & bord champ', 'Paiement garanti après livraison', 'Statistiques de vente & mercuriale'],
    featuresAr: ['بيع المحاصيل على رؤوس أشجارها', 'ضمان استلام المستحقات المالية', 'متابعة بورصة أسعار الجملة'],
    icon: <Store className="w-6 h-6 text-amber-600" />,
    bgGradient: 'from-amber-50/60 to-white',
    borderColor: 'border-amber-200 hover:border-amber-500',
    textColor: 'text-amber-950',
  },
  {
    role: 'nursery',
    titleFr: 'Pépiniériste Agréé ONSSA',
    titleAr: 'صاحب مشتل معتمد من أونسا',
    badgeFr: 'Plants & Arbres Fruitiers',
    badgeAr: 'شتائل وأشجار مثمرة',
    descFr: 'Gérez vos serres, lots de plants certifiés ONSSA, traitements phytosanitaires et traçabilité QR code du champ au client.',
    descAr: 'تدبير المشاتل والشحنات المعتمدة رسمياً، جوازات المرور الصحية وتتبع كود الاستجابة السريعة.',
    featuresFr: ['Passeports phytosanitaires ONSSA', 'Journal des traitements et pulvérisations', 'Export & inventaire de stock par lot'],
    featuresAr: ['جوازات السلامة الصحية الرسمية', 'سجل المعاملات والمداواة الزراعية', 'تصدير المخزون وتتبع الدفعات'],
    icon: <Sprout className="w-6 h-6 text-teal-600" />,
    bgGradient: 'from-teal-50/60 to-white',
    borderColor: 'border-teal-200 hover:border-teal-500',
    textColor: 'text-teal-950',
  },
  {
    role: 'carrier',
    titleFr: 'Transporteur Frigorifique / Fret',
    titleAr: 'ناقل لوجستي مبرد',
    badgeFr: 'Logistique & Expéditions',
    badgeAr: 'اللوجستيك والشحن',
    descFr: 'Proposez vos camions frigorifiques et semi-remorques, trouvez des missions d’acheminement agricole et sécurisez vos factures fret.',
    descAr: 'إدارة أسطول الشاحنات المبردة، العثور على شحنات النقل الفلاحي وتأكيد مستحقات الشحن.',
    featuresFr: ['Flotte frigorifique certifiée', 'Missions de retour à vide optimisées', 'Paiement transport sécurisé'],
    featuresAr: ['أسطول شاحنات مبردة معتمدة', 'تقليص رحلات العودة الفارغة', 'أداء مصاريف الشحن مضمون'],
    icon: <Truck className="w-6 h-6 text-blue-600" />,
    bgGradient: 'from-blue-50/60 to-white',
    borderColor: 'border-blue-200 hover:border-blue-500',
    textColor: 'text-blue-950',
  },
  {
    role: 'admin',
    titleFr: 'Administration & Modération',
    titleAr: 'الإدارة والرقابة',
    badgeFr: 'Supervision Plateforme',
    badgeAr: 'إشراف المنصة',
    descFr: 'Supervision générale, modération des annonces, arbitrage des litiges séquestre, gestion des utilisateurs et audit des commissions.',
    descAr: 'الإشراف على المنصة، مراجعة الإعلانات، فض النزاعات وتدبير الحسابات والعمولات.',
    featuresFr: ['Modération des offres agricoles', 'Gestion des comptes et agréments', 'Séquestre bancaire & arbitrage'],
    featuresAr: ['مراقبة العروض والمشاتل', 'تدبير حسابات الأعضاء والاعتمادات', 'إدارة الحساب الضامن والنزاعات'],
    icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
    bgGradient: 'from-purple-50/60 to-white',
    borderColor: 'border-purple-200 hover:border-purple-500',
    textColor: 'text-purple-950',
  },
];

export const RoleSelectionPage: React.FC = () => {
  const {
    language,
    userProfile,
    setUserRole,
    setActiveTab,
    setIsAdminLoginModalOpen,
    isAdminAuthenticated,
    adminSession,
    setIsRoleOnboardingOpen,
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(userProfile.role || 'buyer');

  const handleContinue = () => {
    if (selectedRole === 'admin') {
      if (!isAdminAuthenticated && !adminSession) {
        setIsAdminLoginModalOpen(true);
        return;
      }
      setUserRole('admin');
      setActiveTab('admin_dashboard');
      return;
    }

    setUserRole(selectedRole);

    // Direct routing based on target role
    switch (selectedRole) {
      case 'seller':
        setActiveTab('seller_dashboard');
        break;
      case 'nursery':
        setActiveTab('nursery_dashboard');
        break;
      case 'carrier':
        setActiveTab('transport_dashboard');
        break;
      case 'buyer':
      default:
        setActiveTab('buyer_dashboard');
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-3 sm:px-6 space-y-8 animate-in fade-in duration-200">
      {/* En-tête */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>{tr(language, 'Personnalisation de votre expérience', 'تخصيص تجربتك المهنية', 'Tailor Your Experience')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
          {tr(language, 'Choisissez votre activité principale', 'اختر نشاطك المهني الرئيسي', 'Select Your Primary Activity')}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
          {tr(
            language,
            'Chaque profil dispose d’un tableau de bord sur-mesure, adapté aux exigences du secteur agricole marocain.',
            'توفر المنصة واجهة مخصصة لكل فاعل فلاحي بالمغرب، بسيطة وسريعة وموجهة للمهام اليومية.',
            'Each role provides a tailored dashboard focused on your specific agricultural business needs.'
          )}
        </p>
      </div>

      {/* Cartes de rôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLES.map((item) => {
          const isSelected = selectedRole === item.role;
          return (
            <div
              key={item.role}
              onClick={() => setSelectedRole(item.role)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all bg-gradient-to-br ${item.bgGradient} ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md scale-[1.01]'
                  : `${item.borderColor} hover:shadow-sm`
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-stone-200/80 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {tr(language, item.badgeFr, item.badgeAr, item.badgeFr)}
                    </span>
                    <h2 className={`font-black text-base sm:text-lg mt-0.5 ${item.textColor}`}>
                      {tr(language, item.titleFr, item.titleAr, item.titleFr)}
                    </h2>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300 bg-white'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>

              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                {tr(language, item.descFr, item.descAr, item.descFr)}
              </p>

              <div className="mt-4 pt-3 border-t border-stone-200/60 space-y-1.5">
                {item.featuresFr.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{tr(language, feat, item.featuresAr[idx] || feat, feat)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA de validation */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          ← {tr(language, 'Retour à l’accueil', 'العودة للرئيسية', 'Back to Home')}
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto min-h-[46px] px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
        >
          <span>{tr(language, 'Accéder à mon espace', 'متابعة إلى فضائي', 'Access My Workspace')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
