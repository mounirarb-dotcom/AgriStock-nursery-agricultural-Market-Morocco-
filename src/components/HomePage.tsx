import React from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { B2BAdBanner } from './B2BAdBanner';
import { VoiceSearchButton } from './VoiceSearchButton';
import {
  Search,
  Mic,
  Radio,
  Trees,
  Sprout,
  Flower2,
  Apple,
  Salad,
  ArrowRight,
  TrendingUp,
  Package,
  Store,
  Sparkles,
  Tractor,
  Wheat,
  ShoppingCart,
  Users,
  FileCheck,
  Scale,
  BookOpen,
  UserPlus,
  LogIn,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  Truck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    language,
    produceListings,
    nurseryLots,
    farmStandingListings,
    navigateToNurseryDepartment,
    navigateToProduceCategory,
    setActiveTab,
    setIsOfficialComplianceModalOpen,
    setIsBenchmarkModalOpen,
    openUserManual,
    openAudioSearchModal,
    setGlobalVoiceSearchQuery,
    userProfile,
    setIsRegistrationModalOpen,
    setIsLoginModalOpen,
    setIsProfileModalOpen,
  } = useApp();

  const [homeSearchQuery, setHomeSearchQuery] = React.useState('');

  // Filtrage par filières clés
  const fruitListings = produceListings.filter((l) => l.category === 'Fruit');
  const vegListings = produceListings.filter((l) => l.category === 'Légume');
  const elevageListings = produceListings.filter((l) =>
    l.category.toLowerCase().includes('élev') || l.category.toLowerCase().includes('bétail')
  );
  const fourrageListings = produceListings.filter((l) =>
    l.category.toLowerCase().includes('fourrage') || l.category.toLowerCase().includes('intrant')
  );

  const sellOffersCount = produceListings.length;
  const totalStandingHectares = farmStandingListings.reduce(
    (acc, item) => acc + item.surfaceHectares,
    0
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-6 space-y-8 animate-in fade-in duration-300">
      {/* Parcours d'accueil : Créer un compte / Se connecter */}
      <div
        id="home-account-banner"
        className="bg-linear-to-r from-[#0d2719] via-[#0f2118] to-stone-900 border border-emerald-800/50 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-emerald-950/20"
      >
        {!userProfile.email && !userProfile.hasCompletedIdentification ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  {tr(language, 'Plateforme Professionnelle B2B', 'منصة مهنية للفلاحة B2B', 'B2B Agricultural Network')}
                </span>
                <span className="text-xs text-stone-400">Maroc</span>
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
                  'Choisissez vos rôles (Acheteur, Vendeur / Producteur, Pépiniériste agréé, Transporteur). Possibilité de cumuler plusieurs profils pour piloter toutes vos activités agricoles.',
                  'حدد صفاتك المهنية (مشتري، فلاح منتج، مشتل معتمد، ناقل مرخص). يمكنك اختيار أكثر من دور لإدارة جميع أنشطتكم الفلاحية.',
                  'Select your roles (Buyer, Seller/Producer, Certified Nursery, Approved Carrier). Multi-role selection supported.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                id="btn-home-create-account"
                type="button"
                onClick={() => setIsRegistrationModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{tr(language, 'Créer un compte', 'إنشاء حساب جديد', 'Create an Account')}</span>
              </button>

              <button
                id="btn-home-login"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs sm:text-sm border border-stone-700 transition active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
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
                  {userProfile.verificationStatus === 'pending_verification' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{tr(language, 'Profil à vérifier ⏳', 'ملف قيد التحقق ⏳', 'Under Review ⏳')}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{tr(language, 'Compte Actif ✅', 'حساب نشط ✅', 'Active Account ✅')}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300 mt-0.5 flex-wrap">
                  <span>{userProfile.companyName || userProfile.phone || userProfile.email}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">
                    {tr(language, 'Rôles :', 'الأدوار :', 'Roles:')}{' '}
                    {(userProfile.roles || [userProfile.role]).join(' + ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                id="btn-home-manage-profile"
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition cursor-pointer"
              >
                {tr(language, 'Mon Profil & Rôles', 'ملفي وأدواري', 'My Profile & Roles')}
              </button>

              <button
                id="btn-home-open-workspace"
                type="button"
                onClick={() => {
                  if (userProfile.role === 'seller') setActiveTab('seller_space');
                  else if (userProfile.role === 'nursery') setActiveTab('nursery_space');
                  else if (userProfile.role === 'carrier') setActiveTab('carrier_space');
                  else setActiveTab('buyer_space');
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
              >
                <span>{tr(language, 'Ouvrir mon espace', 'فتح فضاء العمل', 'Open Workspace')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* En-tête simple et épuré */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
          {tr(language, 'AgriStock Maroc', 'منصة AgriStock المغرب', 'AgriStock Morocco')}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto font-medium">
          {tr(
            language,
            'Recherchez par la voix ou parcourez les offres, mercuriales et pépinières du Royaume',
            'ابحث بالصوت أو تصفح العروض، أسعار الجملة والمشاتل المعتمدة بالمملكة',
            'Search with voice or browse agricultural offers, wholesale rates, and nurseries across Morocco'
          )}
        </p>
      </div>

      {/* Barre de Recherche Rapide & Recherche Audio Vocale IA */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-md space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = homeSearchQuery.trim();
            if (q) {
              setGlobalVoiceSearchQuery(q);
              setActiveTab('market');
            }
          }}
          className="flex flex-col sm:flex-row items-center gap-2.5"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={homeSearchQuery}
              onChange={(e) => setHomeSearchQuery(e.target.value)}
              placeholder={tr(
                language,
                'Rechercher une culture, variété, plant, bétail (ex: Tomate, Olivier Menara, Sardi)...',
                'ابحث عن منتوج، شتلة، خضر أو مواشي (مثال: طماطم، زيتون، صردي)...',
                'Search by crop, variety, nursery lot or livestock (e.g. Tomato, Olive, Sardi)...'
              )}
              className="w-full pl-11 pr-14 py-3 rounded-2xl border border-stone-300 text-sm text-stone-800 placeholder-stone-400 focus:outline-emerald-600 shadow-inner"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              <VoiceSearchButton
                language={language}
                onSearchResult={(query, details) => {
                  setHomeSearchQuery(query);
                  setGlobalVoiceSearchQuery(query);
                  if (details?.targetTab) {
                    setActiveTab(details.targetTab);
                  } else {
                    setActiveTab('market');
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              {tr(language, 'Rechercher', 'بحث', 'Search')}
            </button>

            <button
              id="btn-home-voice-search-modal"
              type="button"
              onClick={openAudioSearchModal}
              title={tr(language, 'Ouvrir le studio de recherche audio IA (Darija / Français)', 'فتح البحث الصوتي الذكي بالدارجة والفرنسية', 'Open Voice AI Search Studio (Darija / French)')}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95 group"
            >
              <Mic className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform animate-pulse" />
              <span className="whitespace-nowrap">{tr(language, 'Voix IA', 'صوتي IA', 'Voice AI')}</span>
            </button>
          </div>
        </form>

        {/* Quick clickable chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pt-1">
          <span className="text-[11px] font-bold text-stone-400 shrink-0 uppercase tracking-wider">
            {tr(language, 'Populaires :', 'شائعة :', 'Trending:')}
          </span>
          {[
            { label: '🍅 Tomates Agadir', q: 'Tomate', tab: 'market' as const },
            { label: '🫒 Oliviers Menara', q: 'Olivier Menara', tab: 'nursery' as const },
            { label: '🥔 Pommes de terre Spunta', q: 'Pomme de terre', tab: 'market' as const },
            { label: '🐑 Ovins Sardi', q: 'Ovin Sardi', tab: 'wholesale' as const },
            { label: '🍊 Clémentines Nadorcott', q: 'Clémentine', tab: 'market' as const },
            { label: '🥑 Avocats Hass', q: 'Avocat Hass', tab: 'market' as const },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setHomeSearchQuery(chip.q);
                setGlobalVoiceSearchQuery(chip.q);
                setActiveTab(chip.tab);
              }}
              className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 font-medium whitespace-nowrap transition border border-stone-200/60 cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1 : Pépinières (3 Boutons simples) */}
      <section className="space-y-3" aria-labelledby="heading-pepinieres">
        <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
          <Sprout className="w-5 h-5 text-emerald-700" />
          <h2
            id="heading-pepinieres"
            className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight"
          >
            {tr(language, 'Pépinières', 'المشاتل', 'Tree & Plant Nurseries')}
          </h2>
        </div>

        {/* 3 boutons simples : Arboriculture, Maraîchage, Ornementale */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Bouton 1 : Pépinières Arboriculture */}
          <button
            id="btn-home-nursery-arboriculture"
            onClick={() => navigateToNurseryDepartment('ARBORICULTURE')}
            className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 shadow-xs hover:shadow-md transition-all text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                <Trees className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-900">
                  {tr(language, 'Pépinières Arboriculture', 'مشاتل الأشجار المثمرة', 'Fruit Tree Nurseries')}
                </span>
                <span className="block text-xs text-stone-500 font-medium">
                  {tr(language, 'Oliviers, agrumes, fruitiers', 'أشجار، زيتون، حوامض', 'Olive, citrus, fruit trees')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>

          {/* Bouton 2 : Pépinières Maraîchage */}
          <button
            id="btn-home-nursery-maraichage"
            onClick={() => navigateToNurseryDepartment('MARAICHAGE')}
            className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 shadow-xs hover:shadow-md transition-all text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-900">
                  {tr(language, 'Pépinières Maraîchage', 'مشاتل الخضروات والبواكر', 'Vegetable Seedling Nurseries')}
                </span>
                <span className="block text-xs text-stone-500 font-medium">
                  {tr(language, 'Tomates, poivrons, pastèques', 'طماطم، فلفل، بطيخ', 'Tomatoes, peppers, watermelons')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>

          {/* Bouton 3 : Pépinières Ornementale */}
          <button
            id="btn-home-nursery-ornementale"
            onClick={() => navigateToNurseryDepartment('ORNEMENTALE')}
            className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 shadow-xs hover:shadow-md transition-all text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                <Flower2 className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-900">
                  {tr(language, 'Pépinières Ornementale', 'مشاتل نباتات الزينة', 'Ornamental Plant Nurseries')}
                </span>
                <span className="block text-xs text-stone-500 font-medium">
                  {tr(language, 'Palmiers, gazon, espaces verts', 'نخيل، مساحات خضراء، ورود', 'Palms, turf, landscaping')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>
        </div>
      </section>

      {/* Section 2 : Marché & Bourse Agricole (Filières Clés) */}
      <section className="space-y-4" aria-labelledby="heading-marche-agricole">
        <div className="flex items-center justify-between pb-1 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-600" />
            <h2
              id="heading-marche-agricole"
              className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight"
            >
              {tr(language, 'Bourse & Marché Agricole', 'البورصة والسوق الفلاحي بالمغرب', 'Agri Market & Exchange')}
            </h2>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {produceListings.length} {tr(language, 'annonces actives', 'عرض نشط', 'active listings')}
          </span>
        </div>

        {/* Marketplace 3 Pillars Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            id="btn-home-flow-sell"
            type="button"
            onClick={() => setActiveTab('market')}
            className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 transition active:scale-[0.99] group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {sellOffersCount}
              </div>
              <div>
                <span className="block text-xs font-black text-emerald-900">
                  {tr(language, 'Récoltes & Produits Frais', 'عروض المحاصيل والإنتاج الفلاحي', 'Fresh Produce & Harvests')}
                </span>
                <span className="block text-[10px] text-emerald-700">
                  {tr(language, 'Vente directe producteurs & coopératives', 'بيع مباشر من الفلاحين والتعاونيات', 'Direct sale from growers & coops')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all shrink-0 ml-1" />
          </button>

          <button
            id="btn-home-flow-nursery"
            type="button"
            onClick={() => setActiveTab('nursery')}
            className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-950 transition active:scale-[0.99] group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {nurseryLots.length}
              </div>
              <div>
                <span className="block text-xs font-black text-blue-900">
                  {tr(language, "Plants Certifiés ONSSA", 'شتائل معتمدة من أونسا', 'ONSSA Certified Plants')}
                </span>
                <span className="block text-[10px] text-blue-700">
                  {tr(language, 'Agrumes, oliviers, avocat, maraîchage', 'حوامض، زيتون، أفوكادو وخضروات', 'Citrus, olives, avocado, vegetable plants')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all shrink-0 ml-1" />
          </button>

          <button
            id="btn-home-flow-standing"
            type="button"
            onClick={() => setActiveTab('farm_standing')}
            className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 transition active:scale-[0.99] group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {farmStandingListings.length}
              </div>
              <div>
                <span className="block text-xs font-black text-amber-900">
                  {tr(language, 'Vergers sur Pied', 'محاصيل وضيعات على رؤوس أشجارها', 'Standing Crops & Orchards')}
                </span>
                <span className="block text-[10px] text-amber-700">
                  {totalStandingHectares} Ha {tr(language, 'avant cueillette', 'جاهزة للجني', 'ready for harvest')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all shrink-0 ml-1" />
          </button>
        </div>

        {/* 5 Filières Clés du Marché */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Filière 1 : Fruits */}
          <button
            id="btn-home-fruits"
            onClick={() => navigateToProduceCategory('Fruit')}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-500 hover:bg-amber-50/40 shadow-xs hover:shadow-md transition-all text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Apple className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="block text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-900">
                    {tr(language, 'Fruits & Agrumes', 'فواكه وحوامض', 'Fruits & Citrus')}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    {fruitListings.length}
                  </span>
                </div>
                <span className="block text-xs text-stone-500 font-medium">
                  {tr(language, 'Agrumes Berkane, dattes, pommes...', 'حوامض، تمور، تفاح، بطيخ', 'Berkane citrus, dates, apples...')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all shrink-0 ml-2" />
          </button>

          {/* Filière 2 : Légumes */}
          <button
            id="btn-home-legumes"
            onClick={() => navigateToProduceCategory('Légume')}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/40 shadow-xs hover:shadow-md transition-all text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                <Salad className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="block text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-900">
                    {tr(language, 'Légumes & Maraîchage', 'خضروات وبواكير', 'Vegetables & Market Gardening')}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    {vegListings.length}
                  </span>
                </div>
                <span className="block text-xs text-stone-500 font-medium">
                  {tr(language, 'Tomates Chtouka, pommes de terre...', 'طماطم اشتوكة، بطاطس، بصل', 'Chtouka tomatoes, potatoes, onions...')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all shrink-0 ml-2" />
          </button>

          {/* Filière 3 : Élevage & Bétail */}
          <button
            id="btn-home-elevage"
            onClick={() => navigateToProduceCategory('Élevage & Bétail')}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200 hover:border-blue-600 hover:bg-blue-50/40 shadow-xs hover:shadow-md transition-all text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-700 group-hover:text-white transition-all">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="block text-sm sm:text-base font-bold text-stone-900 group-hover:text-blue-900">
                    {tr(language, 'Élevage & Bétail', 'تربية المواشي والأنعام', 'Livestock & Cattle')}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                    {elevageListings.length}
                  </span>
                </div>
                <span className="block text-xs text-stone-500 font-medium">
                  {tr(language, 'Moutons Sardi, bovins, ovins...', 'أغنام صردي، أبقار حلوب، ماعز', 'Sardi sheep, cattle, goats...')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-blue-700 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all shrink-0 ml-2" />
          </button>

          {/* Filière 4 : Pépinières Certifiées (Arboricole, Maraîcher, Ornementale) */}
          <button
            id="btn-home-pepinieres"
            onClick={() => setActiveTab('nursery')}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/60 shadow-xs hover:shadow-md transition-all text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="block text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-900">
                    {tr(language, 'Pépinières & Plants', 'المشاتل والشتلات المعتمدة', 'Nurseries & Certified Plants')}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    {nurseryLots.length}
                  </span>
                </div>
                <span className="block text-xs text-stone-500 font-medium">
                  {tr(language, 'Arboricole, maraîcher, ornementale...', 'أشجار مثمرة، خضر، نباتات التزيين...', 'Fruit trees, vegetables, ornamentals...')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all shrink-0 ml-2" />
          </button>

          {/* Filière 5 : Fourrage & Intrants */}
          <button
            id="btn-home-fourrage"
            onClick={() => navigateToProduceCategory('Fourrage & Intrants')}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200 hover:border-yellow-600 hover:bg-yellow-50/40 shadow-xs hover:shadow-md transition-all text-left active:scale-[0.99] sm:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-yellow-600 group-hover:text-white transition-all">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="block text-sm sm:text-base font-bold text-stone-900 group-hover:text-yellow-900">
                    {tr(language, 'Fourrage & Intrants', 'الأعلاف والأسمدة والمدخلات', 'Fodder & Farm Inputs')}
                  </span>
                  <span className="text-[10px] font-bold text-yellow-800 bg-yellow-100 px-1.5 py-0.2 rounded">
                    {fourrageListings.length}
                  </span>
                </div>
                <span className="block text-xs text-stone-500 font-medium">
                  {tr(language, 'Luzerne séchée, paille, tourteaux, engrais', 'فصة جافة (ألفالفا)، تبن، أعلاف مركبة', 'Dry alfalfa, straw, meals, fertilizers')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-yellow-700 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all shrink-0 ml-2" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION PUBLICITÉ DÉPLACÉE VERS L'ACCUEIL : SPONSORS & PARTENAIRES B2B */}
      {/* ========================================================================= */}
      <section className="space-y-2 pt-1" aria-labelledby="heading-publicite-b2b">
        <div className="flex items-center justify-between pb-1 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h2
              id="heading-publicite-b2b"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700"
            >
              {tr(language, 'Partenaires & Annonceurs Agricoles B2B', 'إعلانات وشركاء القطاع الفلاحي B2B', 'B2B Agricultural Sponsors & Partners')}
            </h2>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            {tr(language, 'Irrigation, Engrais, Serres, Laboratoires', 'أسمدة، ري، بيوت بلاستيكية، تحاليل', 'Irrigation, Fertilizers, Greenhouses, Labs')}
          </span>
        </div>

        {/* Bannière Publicitaire B2B Multi-Annonces interactive */}
        <B2BAdBanner className="my-1 shadow-sm" />
      </section>

      {/* ========================================================================= */}
      {/* SECTION B2B DIRECTORY & CADRE OFFICIEL / CNDP */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-1" aria-labelledby="heading-b2b-ecosystem">
        <div className="flex items-center justify-between pb-1 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <h2
              id="heading-b2b-ecosystem"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700"
            >
              {tr(language, 'Écosystème B2B & Conformité Réglementaire', 'شبكة الفاعلين والوضع القانوني للمنصة', 'B2B Ecosystem & Regulatory Compliance')}
            </h2>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
            Maroc 🇲🇦
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Carte 1 : Annuaire des 1 250+ acteurs agricoles au Maroc */}
          <button
            id="btn-home-open-directory"
            type="button"
            onClick={() => setActiveTab('directory')}
            className="group flex items-start justify-between p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-[#0c2417] text-white border border-emerald-700/50 shadow-xs hover:shadow-md transition text-left cursor-pointer"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Users className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                  {tr(language, 'Annuaire B2B Agricole Maroc', 'دليل الفاعلين الفلاحيين بالمغرب', 'Morocco Agri B2B Directory')}
                </span>
              </div>
              <p className="text-xs text-stone-300 font-normal leading-relaxed">
                {tr(
                  language,
                  'Pépinières agréées, domaines horticoles, coopératives, exportateurs et fret certifiés.',
                  'مشاتل معتمدة، ضيعات كبرى، تعاونيات، تجار ومصدري البواكر، ومزودو اللوجستيك عبر 12 جهة.',
                  'Approved nurseries, orchards, cooperatives, exporters and certified freight forwarders.'
                )}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                  1 250+ {tr(language, 'Fiches B2B', 'بطاقة مهنية', 'B2B Profiles')}
                </span>
                <span className="text-[11px] text-stone-400">Export Excel / CSV</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition shrink-0 mt-1" />
          </button>

          {/* Carte 2 : Manuel d'Utilisation Officiel & Téléchargeable */}
          <button
            id="btn-home-open-user-manual"
            type="button"
            onClick={() => openUserManual()}
            className="group flex items-start justify-between p-4 rounded-2xl bg-[#0f2419] hover:bg-[#153123] text-white border border-emerald-500/50 shadow-xs hover:shadow-md transition text-left cursor-pointer ring-1 ring-emerald-500/20"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-700/40 text-emerald-300 border border-emerald-500/40">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                  {tr(language, "Manuel d'Utilisation Officiel", 'دليل الاستعمال الرسمي (تحميل)', 'Official User Guide')}
                </span>
              </div>
              <p className="text-xs text-stone-300 font-normal leading-relaxed">
                {tr(
                  language,
                  'Guide officiel certifié : pépinières ONSSA, bourse, séquestre, manifestes Export A4 (Foodex/BADR) & fret. Téléchargeable PDF & .MD.',
                  'دليل مهني مصور خطوة بخطوة للمشاتل، البورصة، حساب الضمان، وتوثيق التصدير الدولي (موروكو فوديكس/أونسا)، متاح للتحميل والطباعة.',
                  'Certified official guide: ONSSA nurseries, market, escrow, export certificates (Foodex/BADR) & freight. PDF & Markdown download.'
                )}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-200 bg-emerald-900 px-2 py-0.5 rounded border border-emerald-600/50">
                  PDF & Markdown
                </span>
                <span className="text-[11px] text-emerald-400">11 {tr(language, 'Chapitres', 'فصول', 'Chapters')} • Export</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition shrink-0 mt-1" />
          </button>

          {/* Carte 3 : Statut Officiel, CNDP, OMPIC & Génération Green */}
          <button
            id="btn-home-open-compliance"
            type="button"
            onClick={() => setIsOfficialComplianceModalOpen(true)}
            className="group flex items-start justify-between p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition text-left cursor-pointer"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <FileCheck className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-stone-900 group-hover:text-emerald-900 transition">
                  {tr(language, 'Statut Officiel & Conformité', 'الاعتماد والوضع القانوني للمنصة', 'Official Legal Status & Compliance')}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-normal leading-relaxed">
                {tr(
                  language,
                  'Déclaration CNDP n° D-W-849/2026, marque OMPIC 249104 & cadre contractuel sécurisé.',
                  'حماية المعطيات الشخصية (قانون 09-08)، الملكية الصناعية OMPIC وتنسيق معايير أونسا ONSSA.',
                  'CNDP Data Protection n° D-W-849/2026, OMPIC trademark 249104 & secure legal framework.'
                )}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  Conforme CNDP & OMPIC
                </span>
                <span className="text-[11px] text-stone-500">{tr(language, 'Plan d’action', 'خطة العمل', 'Action plan')}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition shrink-0 mt-1" />
          </button>

          {/* Carte 4 : Comparatif de Marché & Avantages Concurrentiels */}
          <button
            id="btn-home-open-benchmark"
            type="button"
            onClick={() => setIsBenchmarkModalOpen(true)}
            className="group flex items-start justify-between p-4 rounded-2xl bg-[#0e2217] hover:bg-[#132c1e] text-white border border-emerald-500/40 shadow-xs hover:shadow-md transition text-left cursor-pointer"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Scale className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-stone-100 group-hover:text-amber-300 transition">
                  {tr(language, 'Pourquoi Choisir AgriStock ?', 'لماذا نحن؟ مقارنة السوق', 'Why Choose AgriStock?')}
                </span>
              </div>
              <p className="text-xs text-stone-300 font-normal leading-relaxed">
                {tr(
                  language,
                  'Comparatif vs WhatsApp & courtiers, conformité Export Morocco Foodex & Douane BADR, simulateur anti-impayés et cas régionaux.',
                  'مقارنة مع مجموعات واتساب والسماسرة، توثيق التصدير (Foodex و BADR)، تقليل مخاطر الشيكات بدون رصيد، وتجارب حية للفلاحين بالمغرب.',
                  'Comparison vs WhatsApp groups & brokers, Morocco Foodex & BADR customs export manifests, anti-fraud escrow and regional case studies.'
                )}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">
                  Export & Séquestre
                </span>
                <span className="text-[11px] text-emerald-300">{tr(language, 'Tableau & Cas', 'جدول وحالات', 'Table & Cases')}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition shrink-0 mt-1" />
          </button>
        </div>
      </section>

      {/* Raccourci optionnel discret vers les cotations des marchés de gros */}
      <div className="pt-1">
        <button
          id="btn-home-wholesale-ticker"
          onClick={() => setActiveTab('wholesale')}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200/90 text-stone-700 transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span className="text-xs sm:text-sm font-semibold">
              {tr(
                language,
                'Consulter les cours indicatifs des marchés de gros (Inezgane, Casa, Meknès...)',
                'متابعة أسعار أسواق الجملة اليومية (إنزكان، الدار البيضاء، مكناس...)',
                'View wholesale market benchmark prices (Inezgane, Casablanca, Meknès...)'
              )}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-500 shrink-0" />
        </button>
      </div>
    </div>
  );
};
