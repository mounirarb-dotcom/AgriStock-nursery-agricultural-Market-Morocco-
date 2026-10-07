import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sprout,
  ShieldAlert,
  KeyRound,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';

export const LoginModal: React.FC = () => {
  const {
    language,
    isLoginModalOpen,
    setIsLoginModalOpen,
    setIsRegistrationModalOpen,
    setIsAdminLoginModalOpen,
    loginAccount,
    sendPasswordReset,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password mode
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(
        tr(
          language,
          'Veuillez renseigner votre email et mot de passe.',
          'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
          'Please provide your email and password.'
        )
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAccount(email.trim(), password);
      setIsLoading(false);
      if (res.success) {
        setIsLoginModalOpen(false);
      } else {
        setErrorMessage(
          res.error ||
            tr(
              language,
              'Identifiants invalides. Veuillez réessayer.',
              'بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.',
              'Invalid credentials. Please try again.'
            )
        );
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erreur de connexion.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(
        tr(
          language,
          'Veuillez saisir une adresse email valide.',
          'يرجى إدخال بريد إلكتروني صحيح.',
          'Please enter a valid email.'
        )
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendPasswordReset(email.trim());
      setIsLoading(false);
      if (res.success) {
        setResetSentSuccess(true);
      } else {
        setErrorMessage(
          res.error ||
            tr(
              language,
              'Impossible d\'envoyer l\'email de réinitialisation.',
              'تعذر إرسال رابط استرجاع كلمة المرور.',
              'Could not send password reset email.'
            )
        );
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erreur.');
    }
  };

  return (
    <div
      id="modal-login-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsLoginModalOpen(false);
        }
      }}
    >
      <div
        id="modal-login-container"
        className="relative w-full max-w-md bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 bg-linear-to-r from-stone-950 via-stone-900 to-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-stone-100 text-sm block">AGRISTOCK MAROC</span>
              <span className="text-xs text-stone-400">
                {isForgotPasswordMode
                  ? tr(language, 'Récupération de mot de passe', 'استرجاع كلمة المرور', 'Password Recovery')
                  : tr(language, 'Connexion à votre espace B2B', 'تسجيل الدخول إلى حسابك', 'Sign In to your B2B Account')}
              </span>
            </div>
          </div>

          <button
            id="btn-close-login-modal"
            type="button"
            onClick={() => setIsLoginModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isForgotPasswordMode ? (
            /* Mode 1: Standard Login */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{tr(language, 'Adresse Email', 'البريد الإلكتروني', 'Email Address')}</span>
                </label>
                <input
                  id="login-input-email"
                  type="email"
                  required
                  placeholder="Ex: mounir@exploitation.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{tr(language, 'Mot de passe', 'كلمة المرور', 'Password')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordMode(true);
                      setErrorMessage(null);
                      setResetSentSuccess(false);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition underline cursor-pointer"
                  >
                    {tr(language, 'Mot de passe oublié ?', 'نسيت كلمة المرور؟', 'Forgot password?')}
                  </button>
                </div>
                <input
                  id="login-input-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{tr(language, 'Se connecter', 'تسجيل الدخول', 'Sign In')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Comptes déclarés & Pépinières agréées */}
              <div className="pt-2 border-t border-stone-800 space-y-1.5">
                <span className="text-[10px] font-semibold text-stone-400 block">
                  {tr(language, 'Comptes déclarés & Pépinières agréées :', 'الحسابات المسجلة والمشاتل المعتمدة :', 'Verified accounts & nurseries:')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('elboizidi.ghizlane@gmail.com');
                    setPassword('Ghizlane2025*');
                  }}
                  className="w-full text-left p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-600/40 text-emerald-200 transition cursor-pointer flex items-center justify-between"
                  title="Pré-remplir les identifiants de Ghizlane El Bouzidi"
                >
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Ghizlane El Bouzidi</div>
                      <div className="text-[10px] text-emerald-300 font-mono">elboizidi.ghizlane@gmail.com (Pépinière Florale)</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded font-bold">
                    {tr(language, 'Pré-remplir', 'تعبئة', 'Fill')}
                  </span>
                </button>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-400">
                  {tr(language, 'Pas encore inscrit ?', 'ليس لديك حساب بعد؟', 'No account yet?')}
                </span>
                <button
                  id="btn-switch-to-register-from-login"
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setIsRegistrationModalOpen(true);
                  }}
                  className="font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{tr(language, 'Créer un compte', 'إنشاء حساب جديد', 'Create an account')}</span>
                </button>
              </div>

              {/* Admin login redirection */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-purple-200">
                  <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-[11px]">{tr(language, 'Espace Direction & Régulation ?', 'ولوج إدارة المنصة والتحكيم ؟', 'Admin & Regulator Portal?')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setIsAdminLoginModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-semibold border border-purple-500/40 text-[11px] transition cursor-pointer"
                >
                  {tr(language, 'Admin 🔒', 'المشرف 🔒', 'Admin 🔒')}
                </button>
              </div>
            </form>
          ) : (
            /* Mode 2: Forgot Password Recovery */
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {resetSentSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-xs font-bold text-white">
                    {tr(language, 'Email de réinitialisation envoyé !', 'تم إرسال رابط الاسترجاع بالبريد !', 'Reset Email Sent!')}
                  </h4>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {tr(
                      language,
                      `Vérifiez votre boîte de réception (${email}). Suivez le lien sécurisé pour définir votre nouveau mot de passe.`,
                      `يرجى مراجعة صندوق بريدك الإلكتروني (${email}) واتباع الرابط لتعيين كلمة مرور جديدة.`,
                      `Check your inbox (${email}) and follow the secure link to set your new password.`
                    )}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordMode(false)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      {tr(language, 'Retour à la connexion', 'العودة لتسجيل الدخول', 'Back to Sign In')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {tr(
                      language,
                      'Saisissez l\'adresse email associée à votre compte AGRISTOCK. Un lien sécurisé de réinitialisation vous sera envoyé.',
                      'أدخل عنوان البريد الإلكتروني المرتبط بحسابك. سنرسل إليك رابطاً آمناً لإعادة تعيين كلمة المرور.',
                      'Enter your registered email address. We will send you a secure link to reset your password.'
                    )}
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{tr(language, 'Votre Adresse Email', 'بريدك الإلكتروني', 'Your Email Address')}</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: mounir@exploitation.ma"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordMode(false)}
                      className="text-xs text-stone-400 hover:text-white transition cursor-pointer"
                    >
                      {tr(language, 'Annuler', 'إلغاء', 'Cancel')}
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>{tr(language, 'Envoyer le lien', 'إرسال الرابط', 'Send Link')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
