import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation, tr } from '../../utils/translations';
import { getCustomAdminKey } from '../../services/adminFirestore';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  X,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const {
    language,
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    adminLogin,
    setActiveTab,
    googleUser,
  } = useApp();
  const t = useTranslation(language);

  const [email, setEmail] = useState(googleUser?.email || 'mounir.arb@gmail.com');
  const [passkey, setPasskey] = useState(getCustomAdminKey() || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAdminLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const keyToUse = passkey.trim() || getCustomAdminKey() || 'AGRISTOCK@2026!ADMIN';

    try {
      const loginPromise = adminLogin(email, keyToUse);
      const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) =>
        setTimeout(() => resolve({ success: false, error: 'Délai d\'attente réseau dépassé. Veuillez réessayer.' }), 2500)
      );

      const res = await Promise.race([loginPromise, timeoutPromise]);
      if (res.success) {
        setIsAdminLoginModalOpen(false);
        setActiveTab('admin');
      } else {
        setErrorMessage(res.error || 'Identifiants ou clé d\'accréditation non valides.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur d\'authentification administrateur.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectLogin = async (loginEmail: string, loginPasskey: string) => {
    setEmail(loginEmail);
    setPasskey(loginPasskey);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const loginPromise = adminLogin(loginEmail, loginPasskey);
      const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) =>
        setTimeout(() => resolve({ success: false, error: 'Délai d\'attente réseau dépassé. Veuillez réessayer.' }), 2500)
      );

      const res = await Promise.race([loginPromise, timeoutPromise]);
      if (res.success) {
        setIsAdminLoginModalOpen(false);
        setActiveTab('admin');
      } else {
        setErrorMessage(res.error || 'Identifiants ou clé d\'accréditation non valides.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur d\'authentification administrateur.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoKey: string) => {
    setEmail(demoEmail);
    setPasskey(demoKey);
    setErrorMessage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      dir="ltr"
    >
      <div
        id="admin-login-modal"
        className="relative w-full max-w-lg bg-stone-900 border border-purple-900/60 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-stone-900 to-indigo-950 px-6 py-5 border-b border-purple-800/40 relative">
          <button
            type="button"
            onClick={() => setIsAdminLoginModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-stone-300 hover:text-white transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] font-mono uppercase tracking-wider font-bold">
                  PORTAIL ACCRÉDITÉ
                </span>
                <span className="text-xs text-stone-400">AGRISTOCK MAROC</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Console d'Administration & Régulation
              </h2>
            </div>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="px-6 py-3 bg-purple-950/30 border-b border-purple-900/40 text-xs text-purple-200/90 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Espace réservé à la <strong>direction AGRISTOCK</strong> et aux <strong>auditeurs habilités</strong>.
            Toute action est consignée dans les <strong>journaux d'audit Firestore</strong>.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Adresse Email Administrateur
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="admin-login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mounir.arb@gmail.com ou admin@agristock.ma"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none placeholder-stone-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Clé d'Accréditation / Code Administrateur
              </label>
              <button
                type="button"
                onClick={() => setPasskey('AGRISTOCK@2026!ADMIN')}
                className="text-[11px] text-purple-300 hover:text-purple-200 underline font-mono cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Remplir code par défaut</span>
              </button>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="admin-login-passkey-input"
                type={showPassword ? 'text' : 'password'}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Ex: AGRISTOCK@2026!ADMIN"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none placeholder-stone-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
                title={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-400">
              <span>Code par défaut : <code className="text-purple-300 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50">AGRISTOCK@2026!ADMIN</code></span>
            </div>
          </div>

          {/* Quick Accreditation Preset Badges for Verification */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-purple-200">
              <span className="font-bold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>Accès Rapide 1-Clic Accrédité :</span>
              </span>
              <span className="text-[10px] text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-md font-mono">
                Connexion directe
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="btn-quick-login-mounir"
                type="button"
                onClick={() => handleDirectLogin('mounir.arb@gmail.com', 'AGRISTOCK@2026!ADMIN')}
                className="w-full py-2.5 px-3 rounded-lg bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mounir (Super Admin)</span>
              </button>
              <button
                id="btn-quick-login-direction"
                type="button"
                onClick={() => handleDirectLogin('admin@agristock.ma', 'AGRISTOCK@2026!ADMIN')}
                className="w-full py-2.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-purple-800/50 text-xs font-medium text-stone-200 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-purple-300 shrink-0" />
                <span>Direction (@agristock.ma)</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAdminLoginModalOpen(false)}
              className="w-1/3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
            >
              Annuler
            </button>
            <button
              id="btn-submit-admin-login"
              type="submit"
              disabled={isLoading}
              className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Vérification...</span>
              ) : (
                <>
                  <span>Ouvrir Console Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
