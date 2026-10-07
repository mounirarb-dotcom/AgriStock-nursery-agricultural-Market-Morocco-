import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sprout,
  Truck,
  ShoppingCart,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  FileText,
  MapPin,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  UserRole,
  MoroccanRegion,
  BuyerDetails,
  SellerDetails,
  NurseryDetails,
  CarrierDetails,
} from '../types';
import { tr } from '../utils/translations';

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

const BUYER_TYPES = [
  { id: 'grossiste', labelFr: 'Grossiste Marché de Gros', labelAr: 'تاجر جملة بسوق الجملة' },
  { id: 'exportateur', labelFr: 'Exportateur Fruits & Primeurs', labelAr: 'مصدّر فواكه وخضر بكور' },
  { id: 'centrale_achat', labelFr: 'Centrale d\'Achat / GMS', labelAr: 'مركزية شراء ومساحات كبرى' },
  { id: 'negociant', labelFr: 'Négociant / Courtier Agricole', labelAr: 'وسيط تجاري ومضارب معتمد' },
  { id: 'agro_industriel', labelFr: 'Transformateur Agro-industriel', labelAr: 'مصنع تحويل صناعي فلاحي' },
  { id: 'detaillant', labelFr: 'Commerçant Détaillant / Épicerie', labelAr: 'تاجر تقسيط' },
];

const PRODUCTION_CATEGORIES = [
  'Agrumes (Clémentines, Maroc Late, Navel)',
  'Maraîchage sous serre (Tomates, Poivrons, Courgettes)',
  'Fruits rouges (Framboises, Myrtilles, Fraises)',
  'Arboriculture fruitière (Pêches, Pommes, Raisin de table)',
  'Oliviers et huile d\'olive',
  'Céréales et légumineuses',
  'Élevage et cheptel (Bovins, Ovins Sardi, Caprins)',
  'Plantes aromatiques et médicinales (PAM)',
];

const NURSERY_SPECIALTIES = [
  'Plants maraîchers greffés (Tomates, Poivrons, Pastèques)',
  'Plants d\'agrumes certifiés ONSSA (Nadorcott, Cadoux, Clémentine)',
  'Plants d\'oliviers certifiés (Picholine marocaine, Arbequina, Menara)',
  'Rosacées & Arbres fruitiers (Pêchers, Nectarines, Pommiers)',
  'Avocatiers greffés (Hass, Fuerte, Zutano)',
  'Palmiers dattiers vitroplants (Mejhoul, Boufeggous)',
];

const VEHICLE_OPTIONS = [
  'Semi-remorque frigorifique bi-température (33 palettes)',
  'Camion porteur frigorifique 14 tonnes (FNA/FRC)',
  'Petit camion frigo urbain 3.5T - 5T',
  'Camion à benne basculante (Vrac maraîcher/céréales)',
  'Plateau bâché aéré pour primeurs',
  'Camion bétaillère aménagé pour cheptel vif',
];

const SERVED_CORRIDORS = [
  'Souss-Massa ➔ Casablanca / Rabat',
  'Souss-Massa ➔ Tanger Med (Export Europe)',
  'Berkane / Oriental ➔ Casablanca / Fès',
  'Gharb / Loukkos ➔ Tanger Med Port',
  'Tadla / Marrakech ➔ Casablanca',
  'Liaison Sud : Dakhla / Laâyoune ➔ Agadir',
  'Toutes destinations nationales (Maroc)',
];

export const RegistrationModal: React.FC = () => {
  const {
    language,
    isRegistrationModalOpen,
    setIsRegistrationModalOpen,
    setIsLoginModalOpen,
    registerAccount,
    setActiveTab,
    setIsAdminLoginModalOpen,
    openNurserySetupModal,
  } = useApp();

  // Current Step: 1 = Compte, 2 = Profil, 3 = Détails, 4 = Validation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Compte fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2: Role selection (multi-role support, ADMIN IS FORBIDDEN)
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['buyer']);
  const [isProfessionalBuyer, setIsProfessionalBuyer] = useState(false);

  // Step 3: Role-specific details
  // Buyer Details
  const [buyerType, setBuyerType] = useState('grossiste');
  const [buyerCompanyName, setBuyerCompanyName] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [buyerRegion, setBuyerRegion] = useState<MoroccanRegion>('Casablanca-Settat (Doukkala, Chaouia)');
  const [buyerActivity, setBuyerActivity] = useState('');
  const [buyerIce, setBuyerIce] = useState('');

  // Seller Details
  const [sellerFarmName, setSellerFarmName] = useState('');
  const [sellerSurface, setSellerSurface] = useState<string>('');
  const [sellerProductions, setSellerProductions] = useState<string[]>([PRODUCTION_CATEGORIES[0]]);
  const [sellerLocation, setSellerLocation] = useState('');
  const [sellerRegion, setSellerRegion] = useState<MoroccanRegion>('Souss-Massa (Agadir, Taroudant, Chtouka)');
  const [sellerOnssaCert, setSellerOnssaCert] = useState('');

  // Nursery Details
  const [nurseryName, setNurseryName] = useState('');
  const [nurseryApprovalNum, setNurseryApprovalNum] = useState('');
  const [nurserySpecialties, setNurserySpecialties] = useState<string[]>([NURSERY_SPECIALTIES[0]]);
  const [nurseryCapacity, setNurseryCapacity] = useState<string>('');

  // Carrier Details
  const [carrierCompanyName, setCarrierCompanyName] = useState('');
  const [carrierVehicles, setCarrierVehicles] = useState<string[]>([VEHICLE_OPTIONS[0]]);
  const [carrierZones, setCarrierZones] = useState<string[]>([SERVED_CORRIDORS[0]]);
  const [carrierTotalCapacity, setCarrierTotalCapacity] = useState<string>('');
  const [carrierLicenseNum, setCarrierLicenseNum] = useState('');

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredRoleOutcome, setRegisteredRoleOutcome] = useState<UserRole>('buyer');
  const [isPendingVerification, setIsPendingVerification] = useState(false);

  if (!isRegistrationModalOpen) return null;

  const toggleRole = (role: UserRole) => {
    // Admin is strictly protected and never selectable by public users
    if (role === 'admin') return;

    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) {
        // Keep at least one role
        return;
      }
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!displayName.trim()) {
      setErrorMessage(tr(language, 'Veuillez saisir votre nom et prénom ou responsable.', 'يرجى إدخال الاسم الكامل أو اسم المسؤول.', 'Please enter your name.'));
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(tr(language, 'Veuillez saisir votre numéro de téléphone.', 'يرجى إدخال رقم الهاتف.', 'Please enter your phone number.'));
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(tr(language, 'Veuillez saisir une adresse email valide.', 'يرجى إدخال بريد إلكتروني صحيح.', 'Please enter a valid email.'));
      return;
    }
    if (password.length < 6) {
      setErrorMessage(tr(language, 'Le mot de passe doit comporter au moins 6 caractères.', 'يجب ألا تقل كلمة المرور عن 6 أحرف.', 'Password must be at least 6 characters.'));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(tr(language, 'Les mots de passe ne correspondent pas.', 'كلمتا المرور غير متطابقتين.', 'Passwords do not match.'));
      return;
    }
    if (!termsAccepted) {
      setErrorMessage(tr(language, 'Veuillez accepter les conditions d\'utilisation et la politique CNDP pour continuer.', 'يرجى قبول شروط الاستخدام وسياسة حماية المعطيات للمتابعة.', 'Please accept terms to continue.'));
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedRoles.length === 0) {
      setErrorMessage(tr(language, 'Veuillez sélectionner au moins un profil.', 'يرجى اختيار صفة واحدة على الأقل.', 'Please select at least one role.'));
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const buyerDetails: BuyerDetails | undefined = selectedRoles.includes('buyer')
        ? {
            buyerType,
            companyName: buyerCompanyName.trim() || displayName.trim(),
            city: buyerCity.trim() || 'Casablanca',
            region: buyerRegion,
            activity: buyerActivity.trim() || 'Achat gros fruits et légumes',
            iceNumber: buyerIce.trim() || undefined,
          }
        : undefined;

      const sellerDetails: SellerDetails | undefined = selectedRoles.includes('seller')
        ? {
            farmName: sellerFarmName.trim() || `Exploitation ${displayName.trim()}`,
            totalSurfaceHectares: parseFloat(sellerSurface) || undefined,
            productionTypes: sellerProductions,
            locationDetails: sellerLocation.trim() || 'Zone agricole',
            region: sellerRegion,
            onssaCertificateNumber: sellerOnssaCert.trim() || undefined,
          }
        : undefined;

      const nurseryDetails: NurseryDetails | undefined = selectedRoles.includes('nursery')
        ? {
            nurseryName: nurseryName.trim() || `Pépinière ${displayName.trim()}`,
            onssaApprovalNumber: nurseryApprovalNum.trim() || 'ONSSA-PEP-EN-COURS',
            certifications: ['Certificat Phytosanitaire ONSSA'],
            specialties: nurserySpecialties,
            annualSaplingCapacity: parseInt(nurseryCapacity) || undefined,
          }
        : undefined;

      const carrierDetails: CarrierDetails | undefined = selectedRoles.includes('carrier')
        ? {
            companyName: carrierCompanyName.trim() || `Transport ${displayName.trim()}`,
            vehicleTypes: carrierVehicles,
            servedZones: carrierZones,
            totalCapacityTonnes: parseFloat(carrierTotalCapacity) || undefined,
            transportLicenseNumber: carrierLicenseNum.trim() || undefined,
          }
        : undefined;

      // Check if professional verification is required
      const requiresVerification = selectedRoles.some(
        (r) => r === 'nursery' || r === 'carrier' || r === 'seller'
      );
      setIsPendingVerification(requiresVerification);
      setRegisteredRoleOutcome(selectedRoles[0] || 'buyer');

      const result = await registerAccount({
        displayName: displayName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        roles: selectedRoles,
        termsAccepted: true,
        buyerDetails,
        sellerDetails,
        nurseryDetails,
        carrierDetails,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Échec de la création du compte.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      // Si l'utilisateur choisit 'Pépiniériste', redirige-le vers l'écran dédié de 'Configuration de Pépinière'
      if (selectedRoles.includes('nursery')) {
        setIsRegistrationModalOpen(false);
        openNurserySetupModal();
        return;
      }

      setStep(4);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erreur inattendue.');
    }
  };

  const handleFinishAndNavigate = (targetRole: UserRole) => {
    setIsRegistrationModalOpen(false);
    if (targetRole === 'seller') {
      setActiveTab('seller_space');
    } else if (targetRole === 'nursery') {
      openNurserySetupModal();
    } else if (targetRole === 'carrier') {
      setActiveTab('carrier_space');
    } else {
      setActiveTab('buyer_space');
    }
  };

  return (
    <div
      id="modal-registration-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 4) {
          setIsRegistrationModalOpen(false);
        }
      }}
    >
      <div
        id="modal-registration-container"
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 bg-linear-to-r from-stone-950 via-stone-900 to-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-100 text-base">AGRISTOCK MAROC</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {tr(language, 'Inscription B2B', 'تسجيل مهني', 'B2B Sign Up')}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {tr(
                  language,
                  'Créez votre compte et sélectionnez vos rôles professionnels',
                  'أنشئ حسابك وحدد صفاتك المهنية',
                  'Create your account and select your professional roles'
                )}
              </p>
            </div>
          </div>

          <button
            id="btn-close-registration-modal"
            type="button"
            onClick={() => setIsRegistrationModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Step Progress Tracker */}
        <div className="px-5 py-3 bg-stone-950/60 border-b border-stone-800/80">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 1
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                    : step > 1
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step === 1 ? 'text-emerald-300' : 'text-stone-400'}`}>
                {tr(language, 'Mon Compte', 'حسابي', 'Account')}
              </span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? 'bg-emerald-600/60' : 'bg-stone-800'}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 2
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                    : step > 2
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step === 2 ? 'text-emerald-300' : 'text-stone-400'}`}>
                {tr(language, 'Mon Profil', 'صفاتي', 'Profile')}
              </span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${step > 2 ? 'bg-emerald-600/60' : 'bg-stone-800'}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 3
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                    : step > 3
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {step > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step === 3 ? 'text-emerald-300' : 'text-stone-400'}`}>
                {tr(language, 'Informations', 'معلومات', 'Details')}
              </span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${step > 3 ? 'bg-emerald-600/60' : 'bg-stone-800'}`} />

            {/* Step 4 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 4
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                4
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step === 4 ? 'text-emerald-300' : 'text-stone-400'}`}>
                {tr(language, 'Validation', 'تأكيد', 'Status')}
              </span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 1: CRÉER MON COMPTE */}
          {/* ============================================================ */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>
                    {tr(language, '1. Créer mon compte', '1. إنشاء حسابي', '1. Create My Account')}
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  {tr(
                    language,
                    'Renseignez vos identifiants pour sécuriser votre espace personnel.',
                    'أدخل بياناتك لتأمين حسابك الشخصي على المنصة.',
                    'Enter your credentials to secure your personal workspace.'
                  )}
                </p>
              </div>

              {/* Nom et Prénom / Responsable */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>{tr(language, 'Nom et prénom / Responsable *', 'الاسم الكامل أو اسم المسؤول *', 'Full Name / Manager *')}</span>
                </label>
                <input
                  id="reg-input-name"
                  type="text"
                  required
                  placeholder="Ex: Mounir Arbi"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Téléphone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{tr(language, 'Téléphone direct *', 'رقم الهاتف المباشر *', 'Direct Phone *')}</span>
                  </label>
                  <input
                    id="reg-input-phone"
                    type="tel"
                    required
                    placeholder="Ex: 06 61 23 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{tr(language, 'Adresse Email *', 'البريد الإلكتروني *', 'Email Address *')}</span>
                  </label>
                  <input
                    id="reg-input-email"
                    type="email"
                    required
                    placeholder="Ex: contact@exploitation.ma"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Mot de passe & Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{tr(language, 'Mot de passe *', 'كلمة المرور *', 'Password *')}</span>
                  </label>
                  <input
                    id="reg-input-password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Au moins 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{tr(language, 'Confirmation du mot de passe *', 'تأكيد كلمة المرور *', 'Confirm Password *')}</span>
                  </label>
                  <input
                    id="reg-input-confirm-password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Conditions d'utilisation & CNDP */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 cursor-pointer hover:border-stone-700 transition">
                  <input
                    id="reg-checkbox-terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-stone-700 bg-stone-900 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs text-stone-300 leading-relaxed">
                    <span>
                      {tr(
                        language,
                        'J\'accepte les Conditions Générales d\'Utilisation (CGU) et la Politique de protection des données à caractère personnel (Loi marocaine 09-08 / CNDP).',
                        'أوافق على الشروط العامة للاستخدام وسياسة حماية المعطيات ذات الطابع الشخصي (القانون المغربي 09-08 / اللجنة الوطنية لمراقبة حماية المعطيات).',
                        'I accept the Terms of Service and Privacy Policy under Moroccan personal data law 09-08 / CNDP.'
                      )}
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistrationModalOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="text-xs text-stone-400 hover:text-emerald-300 transition underline cursor-pointer"
                >
                  {tr(language, 'Déjà un compte ? Se connecter', 'لديك حساب بالفعل؟ تسجيل الدخول', 'Already registered? Log in')}
                </button>

                <button
                  id="btn-reg-step1-continue"
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
                >
                  <span>{tr(language, 'Continuer vers le choix du profil', 'المتابعة لاختيار الصفة', 'Continue to Role Selection')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 2: QUEL EST VOTRE PROFIL ? (MULTI-RÔLES) */}
          {/* ============================================================ */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{tr(language, '2. « Quel est votre profil ? »', '2. « ما هي صفاتكم المهنية ؟ »', '2. "What is your profile?"')}</span>
                </h3>
                <p className="text-xs text-stone-400">
                  {tr(
                    language,
                    'Vous pouvez cocher plus d\'un rôle selon vos activités (ex: Vendeur + Acheteur).',
                    'يمكنك اختيار أكثر من صفة واحدة حسب أنشطتكم (مثال: بائع منتج + مشتري).',
                    'You can select more than one role matching your business activities (e.g. Seller + Buyer).'
                  )}
                </p>
              </div>

              {/* Role Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Acheteur Standard */}
                <div
                  id="role-option-buyer"
                  onClick={() => {
                    setIsProfessionalBuyer(false);
                    toggleRole('buyer');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRoles.includes('buyer') && !isProfessionalBuyer
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-white">
                          🛒 {tr(language, 'Acheteur', 'مشتري / تاجر', 'Buyer')}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          selectedRoles.includes('buyer') && !isProfessionalBuyer
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-stone-700 bg-stone-900'
                        }`}
                      >
                        {selectedRoles.includes('buyer') && !isProfessionalBuyer && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {tr(
                        language,
                        'Détaillant, revendeur de primeurs, hôtellerie-restauration, approvisionnement direct.',
                        'تاجر تقسيط، بائع خضر وفواكه، مطاعم وفنادق، تموين مباشر.',
                        'Retailer, produce grocer, hospitality & catering, direct supply.'
                      )}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-800/60 text-[10px] text-emerald-400 font-medium">
                    ✓ {tr(language, 'Accès immédiat aux offres & cotations', 'ولوج فوري للعروض والأسعار', 'Instant access to listings')}
                  </div>
                </div>

                {/* 2. Acheteur professionnel / Négociant */}
                <div
                  id="role-option-pro-buyer"
                  onClick={() => {
                    setIsProfessionalBuyer(true);
                    if (!selectedRoles.includes('buyer')) {
                      setSelectedRoles((prev) => [...prev, 'buyer']);
                    }
                    setBuyerType('negociant');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRoles.includes('buyer') && isProfessionalBuyer
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-white">
                          🏢 {tr(language, 'Acheteur Pro / Négociant', 'مشتري مهني / وسيط تجاري', 'Pro Buyer / Trader')}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          selectedRoles.includes('buyer') && isProfessionalBuyer
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-stone-700 bg-stone-900'
                        }`}
                      >
                        {selectedRoles.includes('buyer') && isProfessionalBuyer && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {tr(
                        language,
                        'Grossiste marché de gros, exportateur fruits & légumes, centrale d\'achat GMS, courtier.',
                        'تاجر جملة بالأسواق، مصدّر خضر وفواكه، مركزية شراء مساحات كبرى، مضارب.',
                        'Wholesale market trader, exporter, supermarket central buyer, broker.'
                      )}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-800/60 text-[10px] text-emerald-400 font-medium">
                    ✓ {tr(language, 'Contrats d\'approvisionnement & séquestre D3', 'عقود تموين وضمان بنكي D3', 'Supply contracts & D3 escrow')}
                  </div>
                </div>

                {/* 3. Vendeur / Producteur */}
                <div
                  id="role-option-seller"
                  onClick={() => toggleRole('seller')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRoles.includes('seller')
                      ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-white">
                          👨‍🌾 {tr(language, 'Producteur / Vendeur', 'فلاح منتج / بائع', 'Producer / Seller')}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          selectedRoles.includes('seller')
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'border-stone-700 bg-stone-900'
                        }`}
                      >
                        {selectedRoles.includes('seller') && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {tr(
                        language,
                        'Agriculteur, domaine agricole, coopérative, ventes sur pied au kilo ou à l\'hectare.',
                        'فلاح، ضيعة فلاحية، تعاونية، بيع المحاصيل على رؤوس أشجارها أو بالهكتار.',
                        'Farmer, agricultural domain, cooperative, standing crop sales.'
                      )}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-800/60 text-[10px] text-amber-400 font-medium">
                    ✓ {tr(language, 'Publication de récoltes & ventes sur pied', 'نشر المحاصيل والبيع بالهكتار', 'Publish crops & standing harvests')}
                  </div>
                </div>

                {/* 4. Pépiniériste Agréé */}
                <div
                  id="role-option-nursery"
                  onClick={() => toggleRole('nursery')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRoles.includes('nursery')
                      ? 'bg-emerald-950/40 border-emerald-400 shadow-md shadow-emerald-950/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Sprout className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-white">
                          🌱 {tr(language, 'Pépiniériste agréé', 'مشتل معتمد', 'Certified Nursery')}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          selectedRoles.includes('nursery')
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-stone-700 bg-stone-900'
                        }`}
                      >
                        {selectedRoles.includes('nursery') && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {tr(
                        language,
                        'Production de plants certifiés ONSSA, plants greffés maraîchers, oliviers, agrumes.',
                        'إنتاج شتلات معتمدة أونسا، شتلات مطعمة خضرية، شجر الزيتون، الحوامض.',
                        'ONSSA certified plantlets, grafted vegetables, olive trees, citrus.'
                      )}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-800/60 text-[10px] text-emerald-400 font-medium">
                    ✓ {tr(language, 'Vérification agrément ONSSA sous 24h', 'التحقق من اعتماد أونسا خلال 24 ساعة', 'ONSSA accreditation review within 24h')}
                  </div>
                </div>

                {/* 4. Transporteur Agréé */}
                <div
                  id="role-option-carrier"
                  onClick={() => toggleRole('carrier')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRoles.includes('carrier')
                      ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-950/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-white">
                          🚚 {tr(language, 'Transporteur agréé', 'ناقل معتمد', 'Approved Carrier')}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          selectedRoles.includes('carrier')
                            ? 'bg-sky-600 border-sky-500 text-white'
                            : 'border-stone-700 bg-stone-900'
                        }`}
                      >
                        {selectedRoles.includes('carrier') && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {tr(
                        language,
                        'Flotte frigorifique bi-température, camions à benne vrac, fret agricole inter-régional.',
                        'أسطول تبريد ثنائي الحرارة، شاحنات صلبة للحمولات، شحن زراعي بين المدن.',
                        'Refrigerated fleet, bulk freight, inter-regional agricultural transport.'
                      )}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-800/60 text-[10px] text-sky-400 font-medium">
                    ✓ {tr(language, 'Missions de fret direct & retour à vide optimisé', 'حجوزات شحن فوري وتفادي العودة الفارغة', 'Direct freight missions & return load')}
                  </div>
                </div>
              </div>

              {/* Multi-role preview badge */}
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-stone-300">
                    {tr(language, 'Rôles sélectionnés :', 'الصفات المحددة :', 'Selected roles:')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRoles.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      >
                        {r === 'buyer' && '🛒 Acheteur'}
                        {r === 'seller' && '👨‍🌾 Vendeur'}
                        {r === 'nursery' && '🌱 Pépiniériste'}
                        {r === 'carrier' && '🚚 Transporteur'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin Protection Notice */}
              <div className="p-3 rounded-xl bg-purple-950/25 border border-purple-800/40 text-xs flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 text-purple-200">
                  <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed text-[11px]">
                    <span className="font-bold text-purple-300 block mb-0.5">
                      {tr(language, 'Protection Sécurisée du Rôle Administrateur', 'حماية مشددة لصفة الإدارة', 'Admin Role Security Protection')}
                    </span>
                    {tr(
                      language,
                      'Le rôle Administrateur / Direction est strictement réservé et ne peut pas être choisi publiquement. Il est attribué exclusivement par le serveur sécurisé.',
                      'صفة المشرف / الإدارة محجوزة ولا يمكن اختيارها علناً. يتم تعيينها حصرياً عبر آلية مشفرة من الخادم.',
                      'The Administrator role is strictly protected and cannot be self-selected. It is provisioned exclusively via secure server-side mechanisms.'
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistrationModalOpen(false);
                    setIsAdminLoginModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] font-bold border border-purple-500/40 whitespace-nowrap shrink-0 transition"
                >
                  {tr(language, 'Portail Admin 🔒', 'بوابة الإدارة 🔒', 'Admin Portal 🔒')}
                </button>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold hover:bg-stone-800 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{tr(language, 'Retour', 'رجوع', 'Back')}</span>
                </button>

                <button
                  id="btn-reg-step2-continue"
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
                >
                  <span>{tr(language, 'Continuer vers les informations', 'متابعة لإدخال المعلومات', 'Continue to Details')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 3: INFORMATIONS COMPLÉMENTAIRES SELON LE RÔLE */}
          {/* ============================================================ */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{tr(language, '3. Informations complémentaires selon le profil', '3. معلومات تكميلية حسب الصفة المحددة', '3. Profile-Specific Information')}</span>
                </h3>
                <p className="text-xs text-stone-400">
                  {tr(
                    language,
                    'Ces données pré-remplissent vos annonces et facilitent les vérifications officielles.',
                    'تُستخدم هذه المعلومات لتسهيل المعاملات والتحقق من التراخيص والاعتمادات.',
                    'This data pre-fills your listings and accelerates official accreditation checks.'
                  )}
                </p>
              </div>

              {/* Accordion / Sections for each selected role */}

              {/* 1. ACHETEUR SECTION */}
              {selectedRoles.includes('buyer') && (
                <div className="p-4 rounded-xl bg-stone-950/60 border border-emerald-900/60 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-800 text-emerald-400 font-bold text-xs">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{tr(language, 'Profil Acheteur :', 'معلومات المشتري :', 'Buyer Profile:')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'Type d\'acheteur *', 'نوع المشتري *', 'Buyer Type *')}
                      </label>
                      <select
                        value={buyerType}
                        onChange={(e) => setBuyerType(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                      >
                        {BUYER_TYPES.map((bt) => (
                          <option key={bt.id} value={bt.id}>
                            {language === 'ar' ? bt.labelAr : bt.labelFr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'Raison Sociale / Société', 'اسم الشركة أو المحل', 'Company Name')}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Société Agadir Négoce SARL"
                        value={buyerCompanyName}
                        onChange={(e) => setBuyerCompanyName(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'Ville / Région d\'approvisionnement *', 'المدينة والجهة الفلاحية *', 'City & Delivery Region *')}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Casablanca (Marché de Gros)"
                        value={buyerCity}
                        onChange={(e) => setBuyerCity(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'Identifiant Commun de l\'Entreprise (ICE)', 'الرقم الموحد للمقاولة (ICE)', 'ICE / Tax Number')}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 002134567000089"
                        value={buyerIce}
                        onChange={(e) => setBuyerIce(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. VENDEUR / PRODUCTEUR SECTION */}
              {selectedRoles.includes('seller') && (
                <div className="p-4 rounded-xl bg-stone-950/60 border border-amber-900/60 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-800 text-amber-400 font-bold text-xs">
                    <User className="w-4 h-4" />
                    <span>{tr(language, 'Profil Vendeur / Producteur :', 'معلومات الفلاح المنتج :', 'Producer / Seller Profile:')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'Nom de l\'Exploitation / Domaine *', 'اسم الضيعة أو الاستغلالية الفلاحية *', 'Farm / Domain Name *')}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Domaine Souss Primeurs"
                        value={sellerFarmName}
                        onChange={(e) => setSellerFarmName(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'Superficie Totale (Hectares)', 'المساحة الإجمالية (بالهكتار)', 'Total Surface (Ha)')}
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 25"
                        value={sellerSurface}
                        onChange={(e) => setSellerSurface(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'Région de Production *', 'الجهة الفلاحية الرئيسية *', 'Agricultural Region *')}
                      </label>
                      <select
                        value={sellerRegion}
                        onChange={(e) => setSellerRegion(e.target.value as MoroccanRegion)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      >
                        {REGIONS.map((reg) => (
                          <option key={reg} value={reg}>
                            {reg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'N° d\'Agrément ONSSA / GlobalGAP (si disponible)', 'رقم اعتماد أونسا أو شهادة المطابقة', 'ONSSA / GlobalGAP Cert (Optional)')}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: ONSSA-AGR-2024-8841"
                        value={sellerOnssaCert}
                        onChange={(e) => setSellerOnssaCert(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PÉPINIÉRISTE SECTION */}
              {selectedRoles.includes('nursery') && (
                <div className="p-4 rounded-xl bg-stone-950/60 border border-emerald-800/60 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-800 text-emerald-300 font-bold text-xs">
                    <Sprout className="w-4 h-4" />
                    <span>{tr(language, 'Profil Pépiniériste Agréé ONSSA :', 'معلومات المشتل المعتمد أونسا :', 'Certified Nursery Profile:')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'Nom Officiel de la Pépinière *', 'الاسم الرسمي للمشتل *', 'Official Nursery Name *')}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Pépinière Royale du Souss"
                        value={nurseryName}
                        onChange={(e) => setNurseryName(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'N° d\'Agrément ONSSA Officiel *', 'رقم الاعتماد الرسمي لدى أونسا *', 'Official ONSSA Approval # *')}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: AGR-ONSSA-PEP-2024-042"
                        value={nurseryApprovalNum}
                        onChange={(e) => setNurseryApprovalNum(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                      {tr(language, 'Capacité annuelle estimée de plants', 'الطاقة الإنتاجية السنوية للشتلات', 'Estimated Annual Plantlets Capacity')}
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 500000"
                      value={nurseryCapacity}
                      onChange={(e) => setNurseryCapacity(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* 4. TRANSPORTEUR SECTION */}
              {selectedRoles.includes('carrier') && (
                <div className="p-4 rounded-xl bg-stone-950/60 border border-sky-900/60 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-800 text-sky-400 font-bold text-xs">
                    <Truck className="w-4 h-4" />
                    <span>{tr(language, 'Profil Transporteur Frigorifique & Logistique :', 'معلومات ناقل التبريد واللوجستيك :', 'Carrier & Logistics Profile:')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'Nom de la Société de Transport *', 'اسم شركة النقل واللوجستيك *', 'Transport Company Name *')}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Atlas Frigo Express"
                        value={carrierCompanyName}
                        onChange={(e) => setCarrierCompanyName(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        {tr(language, 'N° Autorisation / Agrément Ministériel', 'رقم رخصة النقل الطرقي للمواد القابلة للتلف', 'Transport License #')}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: METL-TRANS-2023-991"
                        value={carrierLicenseNum}
                        onChange={(e) => setCarrierLicenseNum(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                      {tr(language, 'Capacité de charge totale de la flotte (Tonnes)', 'الحمولة الإجمالية للأسطول (بالطن)', 'Total Fleet Payload (Tonnes)')}
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 120"
                      value={carrierTotalCapacity}
                      onChange={(e) => setCarrierTotalCapacity(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold hover:bg-stone-800 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{tr(language, 'Retour', 'رجوع', 'Back')}</span>
                </button>

                <button
                  id="btn-reg-final-submit"
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{tr(language, 'Créer mon compte & Valider', 'إنشاء وتأكيد الحساب', 'Create Account & Validate')}</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 4: VALIDATION & STATUT DU COMPTE */}
          {/* ============================================================ */}
          {step === 4 && (
            <div className="py-4 space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-in zoom-in-50 duration-300" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  {tr(language, 'Compte créé avec succès ! ✅', 'تم إنشاء الحساب بنجاح ! ✅', 'Account Created Successfully! ✅')}
                </h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  {tr(
                    language,
                    `Bienvenue sur AGRISTOCK MAROC, ${displayName}. Vos accès sont maintenant enregistrés.`,
                    `مرحباً بكم في منصة أجريستوك المغرب، ${displayName}. تم تسجيل بياناتكم بنجاح.`,
                    `Welcome to AGRISTOCK MAROC, ${displayName}. Your profile is now registered.`
                  )}
                </p>
              </div>

              {/* Status Differentiation Badge & Info */}
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">
                    {tr(language, 'Statut du Compte :', 'حالة الحساب :', 'Account Status:')}
                  </span>
                  {isPendingVerification ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      {tr(language, 'Profil professionnel à vérifier ⏳', 'ملف مهني قيد التحقق ⏳', 'Professional Profile Under Review ⏳')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      {tr(language, 'Compte Actif ✅', 'حساب نشط ✅', 'Active Account ✅')}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-300 leading-relaxed border-t border-stone-800/80 pt-2.5">
                  {isPendingVerification ? (
                    <p>
                      {tr(
                        language,
                        'Vos agréments et coordonnées professionnelles (Pépinière, Producteur, Transporteur) ont été transmis à l\'équipe de Direction AGRISTOCK. Vous pouvez dès à présent explorer la plateforme, consulter les prix et préparer vos offres. Certaines fonctions sensibles seront activées après vérification sous 24 heures.',
                        'تم إرسال اعتمادكم ومعلوماتكم المهنية (مشتل، فلاح منتج، ناقل) إلى إدارة المنصة. يمكنك تصفح العروض والأسعار وإعداد إعلاناتكم، وستُفعل الميزات الحساسة بعد التحقق الرسمي خلال 24 ساعة.',
                        'Your accreditation details (Nursery, Producer, Carrier) have been forwarded to AGRISTOCK management. You can explore listings and prepare offers immediately. Sensitive operations will be fully unlocked upon administrative verification within 24 hours.'
                      )}
                    </p>
                  ) : (
                    <p>
                      {tr(
                        language,
                        'Votre compte acheteur est immédiatement opérationnel. Vous avez accès complet aux annonces agricoles, cotations de gros, séquestre bancaire et réservations logistiques.',
                        'حساب المشتري الخاص بكم مفعل وجاهز فوراً. لديكم صلاحية كاملة لتصفح العروض، ومتابعة أسعار الجملة، والدفع بالضمان، وحجز النقل.',
                        'Your buyer account is immediately active. You have full access to produce listings, wholesale quotes, escrow guarantees, and transport bookings.'
                      )}
                    </p>
                  )}
                </div>

                {/* Multiple roles summary */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">{tr(language, 'Rôles attribués :', 'الأدوار الممنوحة :', 'Assigned roles:')}</span>
                  <div className="flex gap-1.5">
                    {selectedRoles.map((r) => (
                      <span key={r} className="px-2 py-0.5 rounded bg-stone-900 text-stone-200 font-mono text-[10px] border border-stone-800">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons to navigate to workspaces */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {selectedRoles.includes('seller') && (
                  <button
                    type="button"
                    onClick={() => handleFinishAndNavigate('seller')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{tr(language, 'Ouvrir Espace Vendeur', 'فتح فضاء البائع', 'Open Seller Space')}</span>
                  </button>
                )}

                {selectedRoles.includes('nursery') && (
                  <button
                    type="button"
                    onClick={() => handleFinishAndNavigate('nursery')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sprout className="w-4 h-4" />
                    <span>{tr(language, 'Configurer ma Pépinière (Ornementale vs Arbo)', 'إعداد المشتل (نباتات زينة أو أشجار مثمرة)', 'Configure Nursery (Ornamental vs Fruit Trees)')}</span>
                  </button>
                )}

                {selectedRoles.includes('carrier') && (
                  <button
                    type="button"
                    onClick={() => handleFinishAndNavigate('carrier')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>{tr(language, 'Ouvrir Espace Transport', 'فتح فضاء النقل', 'Open Freight Space')}</span>
                  </button>
                )}

                {selectedRoles.includes('buyer') && (
                  <button
                    type="button"
                    onClick={() => handleFinishAndNavigate('buyer')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{tr(language, 'Ouvrir Espace Acheteur', 'فتح فضاء المشتري', 'Open Buyer Space')}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
