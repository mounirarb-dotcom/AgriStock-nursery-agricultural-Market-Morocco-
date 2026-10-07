import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { HeaderLanding } from './HeaderLanding';
import { HeroSection } from './HeroSection';
import { ProductGrid } from './ProductGrid';
import { B2BAdBanner } from './B2BAdBanner';
import { SmartImage } from './SmartImage';
import {
  Apple,
  Salad,
  Sprout,
  Tractor,
  Truck,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  Store,
  Layers,
  Sparkles,
  Users,
  QrCode,
  FileCheck,
  PhoneCall,
  UserPlus,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    language,
    setActiveTab,
    navigateToProduceCategory,
    navigateToNurseryDepartment,
    setIsRegistrationModalOpen,
    setIsLoginModalOpen,
    userProfile,
  } = useApp();

  const [landingSearchFilter, setLandingSearchFilter] = useState('');

  // 6 Catégories clés avec visuels
  const categories = [
    {
      id: 'fruits',
      title: tr(language, 'Fruits & Agrumes', 'فواكه وحوامض', 'Fruits & Citrus'),
      desc: tr(language, 'Clémentines de Berkane, Dattes Zagora, Pommes Midelt, Avocats...', 'حوامض بركان، تمور زاكورة، تفاح ميدلت، أفوكادو...', 'Berkane clementines, Zagora dates, Midelt apples, avocado...'),
      image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80',
      action: () => navigateToProduceCategory('Fruit'),
      badge: 'Bourse de Gros',
    },
    {
      id: 'veg',
      title: tr(language, 'Légumes & Maraîchage', 'خضر ومحاصيل', 'Fresh Vegetables'),
      desc: tr(language, 'Tomates de Chtouka, Pommes de terre Berrechid, Poivrons, Oignons...', 'طماطم اشتوكة، بطاطس برشيد، فلفل، بصل...', 'Chtouka tomatoes, Berrechid potatoes, peppers, onions...'),
      image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
      action: () => navigateToProduceCategory('Légume'),
      badge: 'Sortie de Champ',
    },
    {
      id: 'nursery',
      title: tr(language, 'Plants de Pépinières ONSSA', 'شتائل المشاتل المعتمدة', 'Nursery Seedlings'),
      desc: tr(language, 'Oliviers certifiés bleus, Agrumes greffés, Palmiers Mejhoul in-vitro...', 'شتلات زيتون معتمدة، حوامض مطعمة، نخيل مجهول أنبوبي...', 'Certified olive trees, grafted citrus, in-vitro Mejhoul palms...'),
      image: '/src/assets/images/nursery_olive_saplings_1789031030975.jpg',
      action: () => setActiveTab('nursery'),
      badge: 'Homologué ONSSA',
    },
    {
      id: 'standing',
      title: tr(language, 'Ventes de Récoltes sur Pied', 'محاصيل على رؤوس أشجارها', 'Standing Crop Auctions'),
      desc: tr(language, 'Vergers d’agrumes et oliveraies en plein rapport vendus à l’hectare...', 'ضيعات حوامض وضيعات زيتون تباع بالهكتار...', 'Mature citrus and olive orchards sold per hectare...'),
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
      action: () => setActiveTab('farm_standing'),
      badge: 'Parcelles (Ha)',
    },
    {
      id: 'livestock',
      title: tr(language, 'Élevage & Cheptel Ovin/Bovin', 'مواشي وأنعام معتمدة', 'Livestock & Cattle'),
      desc: tr(language, 'Races Sardi, Timahdite, D’man et bovins contrôlés sanitaires SNIT...', 'أغنام الصردي، تيمحضيت، الدمان وأبقار مرقمة SNIT...', 'Certified Sardi, Timahdite sheep and monitored SNIT cattle...'),
      image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
      action: () => navigateToProduceCategory('Élevage & Bétail'),
      badge: 'Contrôlé SNIT',
    },
    {
      id: 'freight',
      title: tr(language, 'Fret Frigorifique & Logistique', 'نقل مبرد ولوجستيك', 'Reefer Freight Logistics'),
      desc: tr(language, 'Semi-remorques TIR 25T et camions porteurs température dirigée...', 'شاحنات نصف مقطورة TIR 25 طن مجهزة بأجهزة التبريد...', 'Reefer 25T TIR semi-trailers with temperature monitoring...'),
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
      action: () => setActiveTab('carrier_space'),
      badge: 'Traçabilité GPS',
    },
  ];

  return (
    <div className="w-full space-y-10 sm:space-y-14 animate-in fade-in duration-300">
      {/* 1. Header Promo Bar */}
      <HeaderLanding />

      {/* 2. Hero Section Principale */}
      <HeroSection onSearch={(term) => setLandingSearchFilter(term)} />

      {/* 2.5 Parcours d'accueil & Espace Métier */}
      <div
        id="landing-account-banner"
        className="bg-gradient-to-r from-[#0d2719] via-[#0f2118] to-stone-900 border border-emerald-800/50 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-emerald-950/20"
      >
        {!userProfile.email && !userProfile.hasCompletedIdentification ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
                  {tr(language, 'Réseau Professionnel B2B Maroc', 'الشبكة المهنية الفلاحية بالمغرب', 'Morocco B2B Professional Network')}
                </span>
                <span className="text-xs text-stone-500">·</span>
                <span className="text-xs text-stone-300">
                  {tr(language, 'Acheteurs & Exploitants', 'فلاحون وتجار', 'Growers & Buyers')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {tr(
                  language,
                  'Créez votre compte ou connectez-vous',
                  'أنشئ حسابك المهني أو سجّل دخولك',
                  'Create an account or sign in'
                )}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                {tr(
                  language,
                  'Acheteur en gros, exploitant récoltant, pépiniériste agréé ONSSA ou transporteur de fret frigorifique. Possibilité de cumuler plusieurs profils pour piloter toutes vos activités.',
                  'مشتري بالجملة، فلاح منتج، مشتل معتمد أو ناقل مبرد. يمكنك اختيار أكثر من دور لإدارة جميع أنشطتكم الفلاحية.',
                  'Wholesale buyer, grower, ONSSA certified nursery or refrigerated carrier. Multi-role selection supported.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                id="btn-landing-create-account"
                type="button"
                onClick={() => setIsRegistrationModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{tr(language, 'Créer un compte', 'إنشاء حساب جديد', 'Create an Account')}</span>
              </button>

              <button
                id="btn-landing-login"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs sm:text-sm border border-stone-700 transition active:scale-95 cursor-pointer"
              >
                <span>{tr(language, 'Se connecter', 'تسجيل الدخول', 'Sign In')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black text-base shadow-inner">
                {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-white text-base">
                    {userProfile.displayName || 'Utilisateur AGRISTOCK'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tr(language, 'Compte Connecté', 'حساب متصل', 'Connected')}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300 mt-0.5 flex-wrap">
                  <span>{userProfile.companyName || userProfile.phone || userProfile.email}</span>
                  <span className="text-stone-500">·</span>
                  <span className="text-emerald-400 font-semibold">
                    {tr(language, 'Rôle :', 'الصفة :', 'Role:')} {userProfile.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (userProfile.role === 'seller') setActiveTab('seller_space');
                  else if (userProfile.role === 'nursery') setActiveTab('nursery_space');
                  else if (userProfile.role === 'carrier') setActiveTab('carrier_space');
                  else setActiveTab('buyer_space');
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer active:scale-95"
              >
                <span>{tr(language, 'Ouvrir mon espace pro', 'فتح فضاء العمل المهني', 'Open Pro Workspace')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Carrousel / Grille Visuelle des Grandes Catégories */}
      <section className="space-y-5" aria-labelledby="heading-categories">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-stone-200">
          <div>
            <h2 id="heading-categories" className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {tr(language, 'Grandes Filières Agricoles', 'القطاعات الفلاحية الكبرى', 'Key Agricultural Sectors')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {tr(
                language,
                'Explorez les offres directes des producteurs et pépiniéristes de tout le Maroc.',
                'استكشف العروض المباشرة من المنتجين والمشاتل في مختلف ربوع المملكة.',
                'Explore direct offers from growers and certified nurseries nationwide.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-700 transition cursor-pointer self-start sm:self-auto"
          >
            <span>{tr(language, 'Voir tout le catalogue', 'عرض كل المنتجات', 'View full catalog')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={cat.action}
              className="group relative rounded-2xl border border-stone-200 hover:border-emerald-600 bg-white shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden">
                <SmartImage
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-black/20 to-transparent pointer-events-none" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-stone-900/80 text-white backdrop-blur-xs font-bold text-[10px] uppercase tracking-wider">
                  {cat.badge}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>{tr(language, 'Explorer les offres', 'تصفح العروض', 'Explore offers')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Grille E-commerce Principale avec Filtres & Tri */}
      <ProductGrid
        title={tr(language, 'Dernières Offres en Direct des Exploitations', 'أحدث العروض الحية من الضيعات', 'Latest Live Farm Offers')}
        subtitle={tr(
          language,
          'Lots certifiés ONSSA, conformité d’exportation et récoltes de saison disponibles immédiatement.',
          'دفعات معتمدة من أونسا، مطابقة لمعايير التصدير ومحاصيل موسمية جاهزة للشحن.',
          'ONSSA certified lots, export compliance and seasonal crops ready for immediate delivery.'
        )}
        limit={12}
        showFilters={true}
      />

      {/* 5. Bandeau Partenaires B2B & Publicité */}
      <B2BAdBanner />

      {/* 6. Pourquoi choisir AgriStock Maroc (Réassurance B2B) */}
      <section className="bg-gradient-to-br from-stone-900 via-[#0e271a] to-stone-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#1b4e34] shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
            {tr(language, 'Sécurité & Traçabilité Garantie', 'ضمان الأمان والتتبع الكامل', 'Security & Proven Traceability')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {tr(
              language,
              'Pourquoi les Professionnels Font Confiance à AgriStock ?',
              'لماذا يثق كبار المنتجين والتجار في AgriStock؟',
              'Why Moroccan Agribusinesses Trust AgriStock'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300">
            {tr(
              language,
              'Une infrastructure pensée spécifiquement pour les exigences du secteur agricole marocain.',
              'بنية تكنولوجية صممت خصيصاً لتلبية متطلبات الفلاحة المغربية وسلاسل التصدير.',
              'Infrastructure specifically tailored for Moroccan agriculture and export trade.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">
              {tr(language, 'Séquestre Bancaire CMI Garanti', 'أداء مؤمن بحساب وسيط CMI', 'Secured CMI Escrow')}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              {tr(
                language,
                'Fini les risques d’impayés. Les fonds de l’acheteur sont bloqués sur compte séquestre avant le départ du camion et versés au producteur après validation conforme de la livraison.',
                'حماية كاملة من مخاطر عدم الأداء. يتم إيداع ثمن الشحنة في حساب وسيط مسبقاً والإفراج عنه فور تسلم البضاعة ومطابقتها.',
                'Zero payment default risk. Buyer funds are held in escrow before transit and released upon verified delivery.'
              )}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">
              {tr(language, 'Agrément Officiel ONSSA', 'اعتماد رسمي من أونسا', 'Official ONSSA Approval')}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              {tr(
                language,
                'Chaque lot de pépinière mentionne le passeport phytosanitaire, la catégorie de certification (Bleu / Blanc) et l’historique des traitements pour une plantation sécurisée.',
                'كل دفعة مشتل تتضمن جواز السفر الصحي النباتي الرسمي، صنف الاعتماد وتاريخ المعالجة لضمان استثمار زراعي ناجح.',
                'Every nursery batch includes official phytosanitary passports, certification category, and treatment logs.'
              )}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">
              {tr(language, 'Logistique Frigo Connectée 24/48h', 'ربط لوجستي مبرد خلال 24/48 ساعة', '24/48h Connected Reefer Freight')}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              {tr(
                language,
                'Mise en relation instantanée avec des transporteurs agréés équipés de sondes de température et de géolocalisation pour préserver la fraîcheur de vos primeurs.',
                'ربط فوري بأساطيل النقل الفلاحي المجهزة بمحددات الحرارة ونظام التتبع للحفاظ على جودة وسلسلة التبريد.',
                'Direct booking with certified reefer fleets featuring real-time temperature probes and GPS tracking.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 7. Appel à l'action final d'inscription / publication */}
      <section className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {tr(
              language,
              'Vous êtes Exploitant ou Acheteur Professionnel ?',
              'هل أنت فلاح منتج أو مشتري مهني؟',
              'Are you a Grower or Professional Buyer?'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-normal leading-relaxed">
            {tr(
              language,
              'Rejoignez plus de 1 200 coopératives, pépiniéristes, exportateurs et centrales d’achat enregistrés sur le réseau national.',
              'انضم إلى أكثر من 1200 تعاونية، مشتل، مصدر ومركزية شراء مسجلة في الشبكة الفلاحية الوطنية.',
              'Join over 1,200 cooperatives, nurseries, exporters and buying centers across Morocco.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsRegistrationModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-black text-xs sm:text-sm shadow-xl transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>{tr(language, 'Créer un Compte Gratuit', 'فتح حساب مجاني', 'Create Free Account')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="px-5 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm border border-white/30 transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>{tr(language, 'Consulter les cours', 'متابعة الأسعار', 'Check market rates')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
