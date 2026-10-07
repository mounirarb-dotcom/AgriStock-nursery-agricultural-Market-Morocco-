import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation, tr } from '../utils/translations';
import { UserRole, MoroccanRegion } from '../types';
import { AppLogoIcon } from './AppLogo';
import {
  Home,
  ShoppingCart,
  Tractor,
  Sprout,
  Truck,
  CheckCircle2,
  X,
  User,
  Phone,
  MessageSquare,
  MapPin,
  Building2,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
} from 'lucide-react';

const REGIONS: MoroccanRegion[] = [
  'Souss-Massa (Agadir, Taroudant, Chtouka)',
  'L\'Oriental (Berkane, Oujda, Nador)',
  'Gharb - Chrarda (Kénitra, Sidi Slimane)',
  'Fès - Meknès (Saïss, El Hajeb, Sefrou)',
  'Marrakech - Safi (Haouz, El Kelaâ)',
  'Béni Mellal - Khénifra (Tadla)',
  'Drâa - Tafilalet (Zagora, Errachidia)',
  'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)',
  'Casablanca - Settat & Doukkala',
];

export const UserIdentificationModal: React.FC = () => {
  const {
    language,
    userProfile,
    setUserProfile,
    isIdentificationModalOpen,
    setIsIdentificationModalOpen,
    setActiveTab,
    setIsStockAuthModalOpen,
    setStockAuthModalMode,
    setIsAdminLoginModalOpen,
  } = useApp();
  const t = useTranslation(language);

  const [selectedRole, setSelectedRole] = useState<UserRole>(userProfile.role || 'buyer');
  const [displayName, setDisplayName] = useState(userProfile.displayName || '');
  const [companyName, setCompanyName] = useState(userProfile.companyName || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [whatsapp, setWhatsapp] = useState(userProfile.whatsapp || '');
  const [region, setRegion] = useState<MoroccanRegion>(userProfile.region || REGIONS[0]);

  // Sync state when modal opens
  useEffect(() => {
    if (isIdentificationModalOpen) {
      setSelectedRole(userProfile.role || 'buyer');
      setDisplayName(userProfile.displayName || '');
      setCompanyName(userProfile.companyName || '');
      setPhone(userProfile.phone || '');
      setWhatsapp(userProfile.whatsapp || '');
      setRegion(userProfile.region || REGIONS[0]);
    }
  }, [isIdentificationModalOpen, userProfile]);

  useEffect(() => {
    if (!isIdentificationModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsIdentificationModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIdentificationModalOpen, setIsIdentificationModalOpen]);

  if (!isIdentificationModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({
      ...userProfile,
      role: selectedRole,
      displayName: displayName.trim() || (selectedRole === 'seller' ? 'Exploitant Agricole' : 'Acheteur Partenaire'),
      companyName: companyName.trim(),
      phone: phone.trim() || '+212600000000',
      whatsapp: whatsapp.trim() || phone.replace(/\D/g, '') || '212600000000',
      region,
      hasCompletedIdentification: true,
    });
    setIsIdentificationModalOpen(false);
    // Redirige automatiquement l'utilisateur vers son tableau de bord dédié selon son rôle
    if (selectedRole === 'seller') {
      setActiveTab('seller_space');
    } else if (selectedRole === 'nursery') {
      setActiveTab('nursery_space');
    } else if (selectedRole === 'carrier') {
      setActiveTab('carrier_space');
    } else if (selectedRole === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('buyer_space');
    }
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleReturnHome = () => {
    setActiveTab('nursery');
    setIsIdentificationModalOpen(false);
  };

  const isRTL = language === 'ar';

  return (
    <div
      id="user-id-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsIdentificationModalOpen(false);
        }
      }}
    >
      <div
        id="user-id-modal-container"
        className="relative w-full max-w-xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 px-6 py-5 border-b border-emerald-600/30 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Bouton Retour Accueil */}
            <button
              id="btn-return-home-header"
              type="button"
              onClick={handleReturnHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-emerald-200 hover:text-white border border-emerald-400/30 text-xs font-semibold shadow-sm transition active:scale-95"
              title={t.backToHome}
            >
              <Home className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{t.backToHome}</span>
            </button>

            {/* Bouton Fermer */}
            <button
              type="button"
              onClick={() => setIsIdentificationModalOpen(false)}
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-stone-200 hover:text-white transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 pr-36 sm:pr-0">
            <div
              onClick={handleReturnHome}
              className="cursor-pointer transition-transform hover:scale-105 shrink-0"
              title={t.backToHome}
            >
              <AppLogoIcon size={42} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                {t.identifyPrompt}
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                {t.identifySubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Step 1: Role Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2.5">
              {tr(language, '1. Choisissez votre profil d\'activité :', '1. اختر صفتك المهنية على المنصة :', '1. Choose your professional profile:')}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: Acheteur */}
              <div
                id="select-role-buyer"
                onClick={() => handleQuickRoleSelect('buyer')}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all relative flex flex-col justify-between ${
                  selectedRole === 'buyer'
                    ? 'bg-emerald-950/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-stone-100">
                        {t.iAmBuyer}
                      </span>
                    </div>
                    {selectedRole === 'buyer' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {tr(language, 'Grossiste, centrale d\'achat, exportateur ou commerçant de primeurs.', 'تاجر جملة، مصدر أو مسير مستودع خضر وفواكه.', 'Wholesaler, procurement center or produce trader.')}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-emerald-400 font-medium">
                  ✓ {tr(language, 'Achat sous séquestre sécurisé CMI', 'شراء مضمون عبر الحساب المجمد', 'CMI Escrow-protected buying')}
                </div>
              </div>

              {/* Option B: Vendeur / Exploitant */}
              <div
                id="select-role-seller"
                onClick={() => handleQuickRoleSelect('seller')}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all relative flex flex-col justify-between ${
                  selectedRole === 'seller'
                    ? 'bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-stone-100">
                        {t.iAmSeller}
                      </span>
                    </div>
                    {selectedRole === 'seller' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {tr(language, 'Producteur maraîcher, céréalier, arboriculteur ou éleveur.', 'فلاح منتج خضروات، حبوب، غلة أو مربي مواشي.', 'Produce farmer, grain grower or livestock breeder.')}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-amber-400 font-medium">
                  ✓ {tr(language, 'Ventes en direct & récoltes sur pied', 'بيع مباشر ومحاصيل على رؤوس أشجارها', 'Direct sales & standing harvest')}
                </div>
              </div>

              {/* Option C: Pépinière Agréée */}
              <div
                id="select-role-nursery"
                onClick={() => handleQuickRoleSelect('nursery')}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all relative flex flex-col justify-between ${
                  selectedRole === 'nursery'
                    ? 'bg-teal-950/40 border-teal-500 shadow-md ring-2 ring-teal-500/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                        <Sprout className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-stone-100">
                        {tr(language, 'Pépiniériste Agréé', 'مشتل معتمد أونسا', 'Certified Nursery')}
                      </span>
                    </div>
                    {selectedRole === 'nursery' && (
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {tr(language, 'Plants certifiés ONSSA, arbres fruitiers, oliviers, agrumes.', 'شتائل معتمدة، أشجار مثمرة، زيتون وأغراس حمضيات.', 'ONSSA certified saplings, fruit trees, olive & citrus.')}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-teal-400 font-medium">
                  ✓ {tr(language, 'Gestion des lots & passeports phytosanitaires', 'إدارة الدفعات وجوازات السلامة الصحية', 'Batch tracking & phytosanitary passport')}
                </div>
              </div>

              {/* Option D: Transporteur */}
              <div
                id="select-role-carrier"
                onClick={() => handleQuickRoleSelect('carrier')}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all relative flex flex-col justify-between ${
                  selectedRole === 'carrier'
                    ? 'bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-stone-100">
                        {tr(language, 'Transporteur Frigo & Bennes', 'ناقل مبرد وشاحنات', 'Carrier & Logistics')}
                      </span>
                    </div>
                    {selectedRole === 'carrier' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {tr(language, 'Logistique frigorifique inter-régions, camions à benne et vrac.', 'نقل حراري مبرد بين المدن، شاحنات صلبة وحمولات زراعية.', 'Temperature-controlled logistics, bulk & freight.')}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-blue-400 font-medium">
                  ✓ {tr(language, 'Réservations de fret agricole en direct', 'حجوزات شحن زراعي مباشر وفوري', 'Direct agricultural freight bookings')}
                </div>
              </div>
            </div>

            {/* Administrateur Portal Link */}
            <div className="mt-3 p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-purple-200">
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  {tr(
                    language,
                    'Accès Direction & Régulateur AGRISTOCK MAROC ?',
                    'ولوج إدارة ورقابة أجريستوك المغرب ؟',
                    'AGRISTOCK MAROC Executive & Regulator Portal?'
                  )}
                </span>
              </div>
              <button
                id="btn-switch-admin-auth-modal"
                type="button"
                onClick={() => {
                  setIsIdentificationModalOpen(false);
                  setIsAdminLoginModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-semibold border border-purple-500/40 text-[11px] transition"
              >
                {tr(language, 'Connexion Admin 🔒', 'دخول المشرف 🔒', 'Admin Login 🔒')}
              </button>
            </div>
          </div>

          {/* Step 2: Information Details */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              {tr(
                language,
                '2. Vos Coordonnées (pré-remplissent vos annonces et contacts) :',
                '2. معلومات الاتصال (تُستخدم لتسهيل المعاملات وتعبئة الإعلانات) :',
                '2. Your Contact Details (pre-fills listings & contacts):'
              )}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Display Name */}
              <div>
                <label className="block text-xs text-stone-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  {tr(language, 'Nom du responsable / contact', 'الاسم الكامل أو المسؤول', 'Manager / Contact Name')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'seller' ? 'Ex: Mounir Arbi (Producteur)' : 'Ex: Société Agadir Négoce'}
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Company / Farm Name */}
              <div>
                <label className="block text-xs text-stone-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  {tr(language, "Nom de l'exploitation / Entreprise", 'اسم الضيعة / المشتل / الشركة', 'Farm / Company Name')}
                </label>
                <input
                  type="text"
                  placeholder={selectedRole === 'seller' ? 'Ex: Domaine Souss Bio' : 'Ex: Grossiste / Exportateur'}
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone */}
              <div>
                <label className="block text-xs text-stone-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  {tr(language, "Téléphone d'appel", 'رقم الهاتف المباشر', 'Direct Phone Number')}
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 06 61 23 45 67"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs text-stone-300 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  {tr(language, 'Numéro WhatsApp', 'رقم واتساب للرسائل الفورية', 'WhatsApp Number')}
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 212661234567"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Region */}
            <div>
              <label className="block text-xs text-stone-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {tr(language, 'Région agricole de référence', 'الجهة الفلاحية الرئيسية', 'Main Agricultural Region')}
              </label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value as MoroccanRegion)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {REGIONS.map(reg => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Sécurité des Stocks & Mot de Passe */}
            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-100 block">
                      {tr(language, 'Protection des Stocks contre les modifications', 'حماية المخزون من التعديل', 'Stock Modification Protection')}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {userProfile.isPasswordProtected
                        ? `${tr(language, 'Actif : Sécurisé par', 'مفعل : محمي عبر', 'Active: Secured by')} ${
                            userProfile.securityMethod === 'sms_code'
                              ? tr(language, 'Code SMS', 'رمز SMS', 'SMS Code')
                              : userProfile.securityMethod === 'email_code'
                              ? tr(language, 'Code Email', 'رمز البريد الإلكتروني', 'Email Code')
                              : tr(language, 'Mot de passe personnel', 'كلمة سر شخصية', 'Personal Password')
                          }`
                        : tr(language, 'Non sécurisé : Toute personne peut modifier vos stocks', 'غير مؤمن : يمكن لأي شخص تعديل مخزونك', 'Unsecured: Anyone can modify your stocks')}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  userProfile.isPasswordProtected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {userProfile.isPasswordProtected
                    ? tr(language, 'Protégé', 'محمي', 'Protected')
                    : tr(language, 'Non Protégé', 'غير محمي', 'Unprotected')}
                </span>
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setStockAuthModalMode('setup_security');
                    setIsStockAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>
                    {userProfile.isPasswordProtected
                      ? tr(language, 'Modifier le mot de passe / mode', 'تغيير كلمة المرور / الوسيلة', 'Change Password / Mode')
                      : tr(language, 'Activer la protection (Mot de passe, SMS ou Email)', 'تفعيل الحماية (كلمة مرور، SMS أو بريد)', 'Enable Protection (Password, SMS or Email)')}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-return-home-footer"
                type="button"
                onClick={handleReturnHome}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-semibold border border-stone-700 shadow transition active:scale-95"
                title={t.backToHome}
              >
                <Home className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.backToHome}</span>
              </button>

              <button
                id="btn-open-admin-from-id"
                type="button"
                onClick={() => {
                  setIsIdentificationModalOpen(false);
                  setIsAdminLoginModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 text-xs font-semibold transition"
                title="Accès Administrateur Dédié"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>Espace Admin</span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <button
                id="btn-cancel-identification"
                type="button"
                onClick={() => setIsIdentificationModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition cursor-pointer min-h-[40px]"
              >
                {tr(language, 'Annuler', 'إلغاء', 'Cancel')}
              </button>
              <button
                id="btn-confirm-identification"
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 border border-emerald-400/40 shrink-0 min-h-[40px] cursor-pointer"
              >
                <span>
                  {selectedRole === 'seller'
                    ? tr(language, 'Valider & Ouvrir Tableau Vendeur', 'تأكيد والانتقال للوحة البائع', 'Confirm & Open Seller Dashboard')
                    : tr(language, 'Valider & Ouvrir Tableau Acheteur', 'تأكيد والانتقال للوحة المشتري', 'Confirm & Open Buyer Dashboard')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
