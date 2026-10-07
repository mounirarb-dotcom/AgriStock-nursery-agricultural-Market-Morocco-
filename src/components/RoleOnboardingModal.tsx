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
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(language || 'fr');

  if (!isRoleOnboardingOpen) return null;

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleConfirm = () => {
    // 1. Sauvegarder le choix
    try {
      localStorage.setItem('agristock_has_chosen_role_v1', 'true');
    } catch (e) {
      console.warn('Storage error', e);
    }

    // 2. Mettre à jour profil et langue
    setUserRole(selectedRole);
    setLanguage(selectedLanguage);
    setUserProfile((prev) => ({
      ...prev,
      role: selectedRole,
      region: selectedRegion,
    }));

    // 3. Fermer la modale
    setIsRoleOnboardingOpen(false);

    // 4. Rediriger vers l'espace logique du rôle
    if (selectedRole === 'seller') {
      setActiveTab('seller_space');
    } else if (selectedRole === 'nursery') {
      setActiveTab('nursery_space');
    } else if (selectedRole === 'carrier') {
      setActiveTab('carrier_space');
    } else if (selectedRole === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  const rolesConfig: Array<{
    id: UserRole;
    title: string;
    titleAr: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderActive: string;
    description: string;
    descriptionAr: string;
    features: string[];
  }> = [
    {
      id: 'buyer',
      title: 'Je suis Acheteur',
      titleAr: 'أنا مشتري / تاجر',
      icon: <ShoppingCart className="w-6 h-6 text-emerald-600" />,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50/70',
      borderActive: 'border-emerald-600 ring-2 ring-emerald-500/30',
      description: 'Négociant, grossiste, supermarché ou particulier',
      descriptionAr: 'تاجر جملة، مسير أسواق أو مشتري مباشر',
      features: [
        'Parcourir les récoltes & bétail en direct',
        'Favoris & alertes prix en temps réel',
        'Commandes sécurisées avec séquestre CMI',
      ],
    },
    {
      id: 'seller',
      title: 'Je vends / produis',
      titleAr: 'أنا فلاح / منتج بائع',
      icon: <Tractor className="w-6 h-6 text-amber-600" />,
      color: 'text-amber-800',
      bgColor: 'bg-amber-50/70',
      borderActive: 'border-amber-600 ring-2 ring-amber-500/30',
      description: 'Agriculteur, exploitant agricole ou éleveur',
      descriptionAr: 'فلاح، صاحب ضيعة فلاحية أو مربي مواشي',
      features: [
        'Publier des récoltes en 1 clic (5 champs)',
        'Gestion simple de vos stocks & prix',
        'Encaissement garanti après inspection',
      ],
    },
    {
      id: 'nursery',
      title: 'Je suis Pépiniériste',
      titleAr: 'أنا صاحب مشتل معتمد',
      icon: <Sprout className="w-6 h-6 text-teal-600" />,
      color: 'text-teal-800',
      bgColor: 'bg-teal-50/70',
      borderActive: 'border-teal-600 ring-2 ring-teal-500/30',
      description: 'Production & vente de plants certifiés ONSSA',
      descriptionAr: 'إنتاج وبيع الشتلات المعتمدة والزراعات المحمية',
      features: [
        'Lots arboricoles, maraîchers, ornementaux',
        'Traçabilité phytosanitaire & Scan QR',
        'Alertes de stock & pré-commandes',
      ],
    },
    {
      id: 'carrier',
      title: 'Je suis Transporteur',
      titleAr: 'أنا ناقل لوجستي معتمد',
      icon: <Truck className="w-6 h-6 text-sky-600" />,
      color: 'text-sky-800',
      bgColor: 'bg-sky-50/70',
      borderActive: 'border-sky-600 ring-2 ring-sky-500/30',
      description: 'Chauffeur ou société de transport frigo / plateau',
      descriptionAr: 'سائق مهني أو شركة نقل مبرد وشاحنات',
      features: [
        'Missions de transport du champ au marché',
        'Gestion de flotte & camions frigo',
        'Paiement garanti à la livraison',
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-auto">
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={() => setIsRoleOnboardingOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 uppercase tracking-wider">
              {tr(language, 'Bienvenue sur AGRIStock Maroc', 'مرحباً بكم في AGRIStock المغرب', 'Welcome to AGRIStock Morocco')}
            </span>
            <span className="text-xs">🇲🇦</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            {tr(language, 'Qui êtes-vous ?', 'من أنت ؟ اختر صفتك', 'Who are you ? Select your profile')}
          </h2>

          <p className="text-xs text-emerald-100/90 mt-1 max-w-lg leading-relaxed">
            {tr(
              language,
              'L’application s’adapte automatiquement à votre activité avec une interface ultra-simple, 5 onglets dédiés et zéro complexité.',
              'يتكيف التطبيق تلقائياً مع نشاطك بواجهة مبسطة، 5 أقسام رئيسية وسهولة كاملة في الاستخدام.',
              'The app adapts automatically to your activity with a clean 5-tab interface and zero complexity.'
            )}
          </p>
        </div>

        {/* Corps de la sélection */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Grille des 4 Rôles principaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rolesConfig.map((item) => {
              const isSelected = selectedRole === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectRole(item.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? `${item.bgColor} ${item.borderActive} shadow-sm`
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-white shadow-2xs border border-stone-100">
                        {item.icon}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 group-hover:border-stone-400'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <h3 className={`font-black text-sm ${isSelected ? item.color : 'text-stone-900'}`}>
                      {language === 'ar' ? item.titleAr : item.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                      {language === 'ar' ? item.descriptionAr : item.description}
                    </p>
                  </div>

                  <ul className="mt-3 pt-2.5 border-t border-stone-200/60 space-y-1 text-[10px] text-stone-600">
                    {item.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Option Administrateur discrète */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleSelectRole('admin')}
              className={`text-[11px] font-semibold px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                selectedRole === 'admin'
                  ? 'bg-stone-900 text-white font-bold'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>{tr(language, 'Espace Administrateur / Superviseur', 'فضاء الإدارة والرقابة', 'Administrator Space')}</span>
            </button>
          </div>

          {/* Préférences : Région & Langue */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Région */}
            <div>
              <label className="font-bold text-stone-700 flex items-center gap-1.5 mb-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{tr(language, 'Votre Région au Maroc', 'جهتك بالمغرب', 'Your Moroccan Region')}</span>
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as MoroccanRegion)}
                className="w-full p-2 rounded-xl bg-white border border-stone-300 text-stone-900 font-medium focus:ring-1 focus:ring-emerald-600 text-xs"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Langue */}
            <div>
              <label className="font-bold text-stone-700 flex items-center gap-1.5 mb-1 text-[11px]">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>{tr(language, 'Langue d’affichage', 'لغة التطبيق', 'Display Language')}</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('fr')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedLanguage === 'fr'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  🇫🇷 FR
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('ar')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedLanguage === 'ar'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  🇲🇦 العربية
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedLanguage === 'en'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
            </div>
          </div>

          {/* Bouton de validation */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{tr(language, 'Vous pouvez changer de profil à tout moment.', 'يمكنك تغيير صفتك في أي وقت بسهولة.', 'You can switch profiles at any time.')}</span>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{tr(language, 'Accéder à mon espace', 'الدخول إلى فضائي', 'Access My Workspace')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
