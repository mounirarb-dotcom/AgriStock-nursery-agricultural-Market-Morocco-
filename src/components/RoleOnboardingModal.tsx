import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { UserRole, MoroccanRegion, AppLanguage } from '../types';
import {
  ShoppingCart,
  Tractor,
  Sprout,
  Truck,
  ShieldCheck,
  MapPin,
  Globe,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Lock,
  User,
  Phone,
  Building2,
  Zap,
} from 'lucide-react';

const REGIONS: MoroccanRegion[] = [
  'Casablanca - Settat & Doukkala',
  'Souss-Massa (Agadir, Taroudant, Chtouka)',
  'L\'Oriental (Berkane, Oujda, Nador)',
  'Gharb - Chrarda (Kénitra, Sidi Slimane)',
  'Fès - Meknès (Saïss, El Hajeb, Sefrou)',
  'Marrakech - Safi (Haouz, El Kelaâ)',
  'Béni Mellal - Khénifra (Tadla)',
  'Drâa - Tafilalet (Zagora, Errachidia)',
  'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)',
];

interface DemoProfile {
  name: string;
  role: UserRole;
  region: MoroccanRegion;
  phone: string;
  companyName: string;
  tagline: string;
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    name: 'Karim Bennani',
    role: 'buyer',
    region: 'Casablanca - Settat & Doukkala',
    phone: '0661122334',
    companyName: 'Bennani Primeurs Grossiste',
    tagline: 'Grossiste Marché de Gros Casablanca',
  },
  {
    name: 'Mohamed El Ouardi',
    role: 'seller',
    region: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
    phone: '0662233445',
    companyName: 'Domaine Maraîcher Al Baraka',
    tagline: 'Exploitant Maraîchage & Agrumes Souss',
  },
  {
    name: 'Hassan Amrani',
    role: 'nursery',
    region: 'L\'Oriental (Berkane, Oujda, Nador)',
    phone: '0663344556',
    companyName: 'Pépinière Atlas Plants Agréée ONSSA',
    tagline: 'Pépiniériste Agréé ONSSA Berkane',
  },
  {
    name: 'Youssef Mansouri',
    role: 'carrier',
    region: 'Marrakech - Safi (Haouz, El Kelaâ)',
    phone: '0664455667',
    companyName: 'Atlas Fret Frigorifique Express',
    tagline: 'Transport Frigorifique & Logistique',
  },
];

export const RoleOnboardingModal: React.FC = () => {
  const {
    language,
    setLanguage,
    userProfile,
    setUserProfile,
    setUserRole,
    isRoleOnboardingOpen,
    setIsRoleOnboardingOpen,
    setActiveTab,
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(userProfile.role || 'buyer');
  const [selectedRegion, setSelectedRegion] = useState<MoroccanRegion>(
    userProfile.region || 'Casablanca - Settat & Doukkala'
  );
  const [displayName, setDisplayName] = useState<string>(userProfile.displayName || '');
  const [phone, setPhone] = useState<string>(userProfile.phone || '');
  const [companyName, setCompanyName] = useState<string>(userProfile.companyName || '');
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(language || 'fr');

  if (!isRoleOnboardingOpen) return null;

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSelectDemoProfile = (demo: DemoProfile) => {
    setSelectedRole(demo.role);
    setDisplayName(demo.name);
    setPhone(demo.phone);
    setCompanyName(demo.companyName);
    setSelectedRegion(demo.region);

    // Confirmation immédiate en 1 clic
    applyUserAndClose(demo.role, demo.name, demo.companyName, demo.phone, demo.region);
  };

  const applyUserAndClose = (
    role: UserRole,
    name: string,
    company: string,
    userPhone: string,
    region: MoroccanRegion
  ) => {
    try {
      localStorage.setItem('agristock_user_chosen_v3', 'true');
      localStorage.setItem('agristock_has_chosen_role_v1', 'true');
    } catch (e) {
      console.warn('Storage error', e);
    }

    const defaultNames: Record<UserRole, string> = {
      buyer: 'Acheteur Partenaire',
      seller: 'Exploitant Agricole',
      nursery: 'Pépinière Agréée ONSSA',
      carrier: 'Transporteur Frigorifique',
      admin: 'Administrateur',
    };

    const finalDisplayName = name.trim() || defaultNames[role] || 'Utilisateur';

    setUserRole(role);
    setLanguage(selectedLanguage);
    setUserProfile((prev) => ({
      ...prev,
      role: role,
      roles: [role],
      displayName: finalDisplayName,
      companyName: company.trim(),
      phone: userPhone.trim() || '0660000000',
      whatsapp: userPhone.trim().replace(/\D/g, '') || '0660000000',
      region: region,
      hasCompletedIdentification: true,
    }));

    setIsRoleOnboardingOpen(false);

    // Rediriger vers l'espace logique du rôle
    if (role === 'seller') {
      setActiveTab('seller_space');
    } else if (role === 'nursery') {
      setActiveTab('nursery_space');
    } else if (role === 'carrier') {
      setActiveTab('carrier_space');
    } else if (role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  const handleConfirm = () => {
    applyUserAndClose(selectedRole, displayName, companyName, phone, selectedRegion);
  };

  const rolesConfig: Array<{
    id: UserRole;
    title: string;
    titleAr: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    borderActive: string;
    description: string;
    descriptionAr: string;
    tag: string;
  }> = [
    {
      id: 'buyer',
      title: 'Acheteur / Grossiste',
      titleAr: 'مشتري / تاجر جملة',
      icon: <ShoppingCart className="w-5 h-5 text-emerald-600" />,
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200',
      borderActive: 'border-emerald-600 ring-2 ring-emerald-500/30',
      description: 'Acheter primeurs, fruits, légumes et plants aux cours du jour',
      descriptionAr: 'شراء الخضر والفواكه والشتلات بأسعار السوق اليومية',
      tag: 'Négociant, Grossiste, Particulier',
    },
    {
      id: 'seller',
      title: 'Agriculteur / Vendeur',
      titleAr: 'فلاح / منتج بائع',
      icon: <Tractor className="w-5 h-5 text-amber-600" />,
      color: 'text-amber-900',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200',
      borderActive: 'border-amber-600 ring-2 ring-amber-500/30',
      description: 'Vendre récoltes au champ, vergers sur pied (Dmana) & cheptel',
      descriptionAr: 'بيع المحاصيل الفلاحية، الضيعات على الشجرة والمواشي',
      tag: 'Producteur, Exploitant, Éleveur',
    },
    {
      id: 'nursery',
      title: 'Pépiniériste Agréé',
      titleAr: 'صاحب مشتل معتمد',
      icon: <Sprout className="w-5 h-5 text-teal-600" />,
      color: 'text-teal-900',
      bgColor: 'bg-teal-50/80',
      borderColor: 'border-teal-200',
      borderActive: 'border-teal-600 ring-2 ring-teal-500/30',
      description: 'Gérer et vendre plants certifiés ONSSA, arboricoles & maraîchers',
      descriptionAr: 'إنتاج وبيع الشتلات المعتمدة وجوازات المرور أونسا',
      tag: 'Plants certifiés ONSSA, Vergers',
    },
    {
      id: 'carrier',
      title: 'Transporteur Frigo',
      titleAr: 'ناقل لوجستي مبرد',
      icon: <Truck className="w-5 h-5 text-sky-600" />,
      color: 'text-sky-900',
      bgColor: 'bg-sky-50/80',
      borderColor: 'border-sky-200',
      borderActive: 'border-sky-600 ring-2 ring-sky-500/30',
      description: 'Proposer fret agricole frigo ou plateau du champ au marché',
      descriptionAr: 'خدمات النقل المبرد والشاحنات من الضيعة إلى الأسواق',
      tag: 'Camions Frigo, Bétaillère, Fret',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#0e2c1e] text-white p-4 sm:p-5 relative shrink-0">
          <button
            type="button"
            onClick={() => setIsRoleOnboardingOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 uppercase tracking-wider">
              {tr(language, 'AGRIStock Maroc', 'بورصة الفلاحة والمشاتل بالمغرب', 'AGRIStock Morocco')}
            </span>
            <span className="text-xs">🇲🇦</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
            {tr(language, 'Bienvenue ! Choisissez votre Profil & Inscription', 'مرحباً بكم ! اختر صفتك وسجل دخولك بسهولة', 'Welcome ! Choose Your Role & Profile')}
          </h2>

          <p className="text-xs text-emerald-100/90 mt-0.5 max-w-lg leading-relaxed">
            {tr(
              language,
              'Sélectionnez votre rôle pour configurer l’application avec vos outils dédiés.',
              'اختر دورك المهني للاستفادة من واجهة مخصصة لنشاطك الفلاحي والتجاري.',
              'Select your role to adapt the application to your agricultural activity.'
            )}
          </p>
        </div>

        {/* Corps Scrollable */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* 1. Grille des 4 Rôles principaux */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{tr(language, '1. Choisissez votre rôle (1 clic) :', '1. حدد صفتك المهنية (بنقرة واحدة) :', '1. Select your role (1 click) :')}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {rolesConfig.map((item) => {
                const isSelected = selectedRole === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectRole(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? `${item.bgColor} ${item.borderActive} shadow-xs`
                        : 'bg-stone-50/70 border-stone-200 hover:border-stone-300 hover:bg-stone-100/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-xl bg-white shadow-2xs border border-stone-200/80">
                          {item.icon}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'border-stone-300 group-hover:border-stone-400 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <h3 className={`font-black text-sm ${isSelected ? item.color : 'text-stone-900'}`}>
                        {language === 'ar' ? item.titleAr : item.title}
                      </h3>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-tight">
                        {language === 'ar' ? item.descriptionAr : item.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-stone-200/60">
                      <span className="text-[10px] font-semibold text-stone-500">
                        {item.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Inscription Express (Champs simples & directs) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{tr(language, '2. Vos coordonnées simples (Inscription express) :', '2. معلوماتك الشخصية (تسجيل سريع) :', '2. Simple info (Quick sign-up) :')}</span>
              </label>
              <span className="text-[10px] text-stone-500 font-medium">{tr(language, 'Modifiable à tout moment', 'يمكن تعديلها دائماً', 'Editable anytime')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 flex items-center gap-1 mb-1 text-[11px]">
                  <User className="w-3 h-3 text-stone-500" />
                  <span>{tr(language, 'Votre Nom / Ferme / Entreprise', 'الاسم / الضيعة / الشركة', 'Your Name / Farm / Business')}</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={
                    selectedRole === 'seller' ? 'Ex: Mohamed Alami (Ferme Souss)' :
                    selectedRole === 'nursery' ? 'Ex: Pépinière Al Baraka' :
                    selectedRole === 'carrier' ? 'Ex: Youssef Transport Frigo' :
                    'Ex: Karim Bennani (Grossiste)'
                  }
                  className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 flex items-center gap-1 mb-1 text-[11px]">
                  <Phone className="w-3 h-3 text-stone-500" />
                  <span>{tr(language, 'Téléphone / WhatsApp', 'الهاتف / واتساب', 'Phone / WhatsApp')}</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 text-xs"
                />
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-stone-700 flex items-center gap-1 mb-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>{tr(language, 'Région au Maroc', 'الجهة بالمغرب', 'Region in Morocco')}</span>
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value as MoroccanRegion)}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 text-xs"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 flex items-center gap-1 mb-1 text-[11px]">
                    <Globe className="w-3 h-3 text-blue-600" />
                    <span>{tr(language, 'Langue d’affichage', 'لغة التطبيق', 'Language')}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['fr', 'ar', 'en'] as AppLanguage[]).map((lng) => (
                      <button
                        key={lng}
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(lng);
                          setLanguage(lng);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedLanguage === lng
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {lng === 'fr' ? '🇫🇷 FR' : lng === 'ar' ? '🇲🇦 عربي' : '🇬🇧 EN'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Utilisateurs Démo Instantanés (1 Clic) */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
                {tr(language, 'Ou testez immédiatement avec un compte démo (1 clic) :', 'أو جرب مباشرة بحساب تجريبي بنقرة واحدة :', 'Or test immediately with a 1-click demo account :')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DEMO_PROFILES.map((demo) => {
                const roleIcon =
                  demo.role === 'seller' ? '🌾' :
                  demo.role === 'nursery' ? '🌱' :
                  demo.role === 'carrier' ? '🚛' : '🛒';

                return (
                  <button
                    key={demo.phone}
                    type="button"
                    onClick={() => handleSelectDemoProfile(demo)}
                    className="p-2 rounded-xl bg-white border border-amber-300 hover:border-emerald-500 hover:shadow-xs text-left transition cursor-pointer active:scale-95 group"
                    title={demo.tagline}
                  >
                    <div className="flex items-center gap-1 text-xs font-bold text-stone-900 group-hover:text-emerald-700">
                      <span>{roleIcon}</span>
                      <span className="truncate">{demo.name.split(' ')[0]}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 truncate mt-0.5">
                      {demo.role === 'seller' ? 'Producteur Souss' :
                       demo.role === 'nursery' ? 'Pépinière Berkane' :
                       demo.role === 'carrier' ? 'Transport Marrakech' : 'Grossiste Casa'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              // Continuer en tant qu'acheteur invité
              applyUserAndClose('buyer', displayName || 'Acheteur Partenaire', '', phone, selectedRegion);
            }}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 transition cursor-pointer order-2 sm:order-1"
          >
            {tr(language, 'Continuer en mode découverte (Acheteur)', 'متابعة بصفة مشتري للتعرف على التطبيق', 'Browse as buyer')}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <span>{tr(language, 'Valider mon profil et entrer ➔', 'تأكيد الحساب والدخول للتطبيق ➔', 'Confirm Profile & Enter ➔')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
