import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { MoroccanRegion, UserRole } from '../../../types';
import { MOROCCAN_REGIONS } from '../../../data/mockData';
import { UserPlus, Building, Phone, Mail, Lock, MapPin, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const {
    language,
    registerAccount,
    setActiveTab,
  } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole>('seller');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState<MoroccanRegion>('Souss-Massa (Agadir, Taroudant, Chtouka)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!displayName.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage(tr(language, 'Veuillez remplir vos coordonnées obligatoires.', 'المرجو ملء المعلومات الإلزامية.', 'Please fill required fields.'));
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage(tr(language, 'Le mot de passe doit comporter au moins 6 caractères.', 'كلمة المرور يجب أن لا تقل عن 6 أحرف.', 'Password must be at least 6 characters.'));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(tr(language, 'Les mots de passe ne correspondent pas.', 'كلمتا المرور غير متطابقتين.', 'Passwords do not match.'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerAccount({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        role,
        roles: [role],
        phone: phone.trim(),
        companyName: companyName.trim() || displayName.trim(),
        region,
      });

      if (res.success) {
        if (role === 'seller') setActiveTab('seller_dashboard');
        else if (role === 'nursery') setActiveTab('nursery_dashboard');
        else if (role === 'carrier') setActiveTab('transport_dashboard');
        else setActiveTab('buyer_dashboard');
      } else {
        setErrorMessage(res.error || 'Erreur lors de l’inscription');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur d’inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-800">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          {tr(language, 'Inscription Professionnelle AgriStock', 'إنشاء حساب مهني جديد', 'Professional Registration')}
        </h1>
        <p className="text-xs text-stone-500">
          {tr(language, 'Rejoignez le premier réseau B2B agricole du Maroc.', 'انضم إلى أول شبكة وطنية لتجارة المحاصيل الزراعية.', 'Join Morocco’s leading agricultural B2B network.')}
        </p>
      </div>

      {/* Barre d’étapes */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold">
        <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
          1. {tr(language, 'Profil & Activité', 'البيانات والنشاط', 'Profile & Role')}
        </span>
        <span className="text-stone-300">→</span>
        <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-500'}`}>
          2. {tr(language, 'Sécurité & Accès', 'كلمة المرور والأمان', 'Security')}
        </span>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          {/* Choix du rôle */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {tr(language, 'Votre Activité Principale', 'نشاطك الأساسي', 'Primary Business Role')}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { r: 'seller' as UserRole, l: 'Producteur / Vendeur' },
                { r: 'buyer' as UserRole, l: 'Acheteur / Négociant' },
                { r: 'nursery' as UserRole, l: 'Pépiniériste Agréé' },
                { r: 'carrier' as UserRole, l: 'Transporteur Frigo' },
              ].map((item) => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => setRole(item.r)}
                  className={`p-2.5 rounded-xl border text-left transition font-semibold flex items-center justify-between ${
                    role === item.r
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span>{item.l}</span>
                  {role === item.r && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {tr(language, 'Nom & Prénom / Responsable', 'الاسم الكامل', 'Full Name / Contact')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex: Mohammed Benali"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {tr(language, 'Nom de l’Exploitation / Société (Optionnel)', 'اسم الضيعة أو الشركة', 'Farm / Company Name')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Domaine Al Baraka / Coopérative Souss"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              />
              <Building className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Téléphone Mobile (Maroc)', 'رقم الهاتف', 'Mobile Phone')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  required
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Adresse Email', 'البريد الإلكتروني', 'Email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@agri.ma"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {tr(language, 'Région Agricole', 'الجهة الفلاحية', 'Agricultural Region')}
            </label>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as MoroccanRegion)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              >
                {MOROCCAN_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{tr(language, 'Continuer vers le mot de passe', 'متابعة إلى كلمة المرور', 'Next Step')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {tr(language, 'Créer un mot de passe', 'إنشاء كلمة المرور', 'Password')}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                required
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {tr(language, 'Confirmer le mot de passe', 'تأكيد كلمة المرور', 'Confirm Password')}
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retapez le mot de passe"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                required
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 text-[11px] text-emerald-900 border border-emerald-200 space-y-1">
            <span className="font-bold block">{tr(language, 'Garanties AgriStock Maroc :', 'ضمانات أگريستوك المغرب :', 'AgriStock Guarantees :')}</span>
            <p>✓ Paiement sécurisé sous séquestre CMI</p>
            <p>✓ Vérification des identifiants et agréments ONSSA</p>
            <p>✓ Données protégées conformément à la loi 09-08 (CNDP)</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
            >
              ← {tr(language, 'Retour', 'رجوع', 'Back')}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{isLoading ? 'Création du compte...' : tr(language, 'Finaliser mon inscription', 'تأكيد التسجيل', 'Complete Registration')}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="text-center text-xs text-stone-600">
        <span>{tr(language, 'Déjà inscrit ?', 'لديك حساب بالفعل؟', 'Already registered?')}</span>{' '}
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className="font-bold text-emerald-800 hover:underline cursor-pointer"
        >
          {tr(language, 'Se connecter', 'دخول', 'Log In')}
        </button>
      </div>
    </div>
  );
};
