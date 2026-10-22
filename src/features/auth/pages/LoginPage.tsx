import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    language,
    loginAccount,
    loginWithGoogle,
    sendPasswordReset,
    setActiveTab,
    userProfile,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSentMessage, setResetSentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setResetSentMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage(tr(language, 'Veuillez saisir votre email et mot de passe.', 'المرجو إدخال البريد الإلكتروني وكلمة المرور.', 'Please enter email and password.'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAccount(email.trim(), password);
      if (res.success) {
        setActiveTab('dashboard');
      } else {
        setErrorMessage(res.error || tr(language, 'Identifiants invalides.', 'بيانات الدخول غير صحيحة.', 'Invalid credentials.'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginWithGoogle();
      if (res) {
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur Google Sign-In');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage(tr(language, 'Indiquez votre adresse email ci-dessus pour réinitialiser le mot de passe.', 'أدخل بريدك الإلكتروني أعلاه لإعادة تعيين كلمة المرور.', 'Enter your email above to reset password.'));
      return;
    }
    setIsResetting(true);
    setErrorMessage('');
    setResetSentMessage('');
    try {
      const res = await sendPasswordReset(email.trim());
      if (res.success) {
        setResetSentMessage(tr(language, 'Un lien de réinitialisation a été envoyé à votre adresse email.', 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.', 'Reset link sent to your email.'));
      } else {
        setErrorMessage(res.error || 'Erreur');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-800">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          {tr(language, 'Connexion à AgriStock', 'تسجيل الدخول', 'Log In to AgriStock')}
        </h1>
        <p className="text-xs text-stone-500">
          {tr(language, 'Accédez à vos commandes, annonces et paiements sécurisés.', 'الدخول إلى طلبياتك وإعلاناتك ومستحقاتك المؤمنة.', 'Access your orders, listings, and secured payments.')}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {resetSentMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{resetSentMessage}</span>
        </div>
      )}

      {/* Formulaire de connexion */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            {tr(language, 'Adresse Email', 'البريد الإلكتروني', 'Email Address')}
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agriculteur@domaine.ma"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              required
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-stone-700">
              {tr(language, 'Mot de passe', 'كلمة المرور', 'Password')}
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetting}
              className="text-[11px] text-emerald-700 hover:underline"
            >
              {isResetting ? 'Envoi...' : tr(language, 'Mot de passe oublié ?', 'نسيت كلمة المرور؟', 'Forgot password?')}
            </button>
          </div>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              required
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <span>{isLoading ? 'Connexion en cours...' : tr(language, 'Se connecter', 'دخول', 'Log In')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="relative my-4 text-center">
          <hr className="border-stone-200" />
          <span className="bg-white px-2 text-[11px] text-stone-400 absolute left-1/2 -translate-x-1/2 -top-2">
            {tr(language, 'ou', 'أو', 'or')}
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{tr(language, 'Continuer avec Google', 'المتابعة عبر جوجل', 'Continue with Google')}</span>
        </button>
      </form>

      <div className="text-center text-xs text-stone-600 space-y-2">
        <span>{tr(language, 'Pas encore de compte ?', 'ليس لديك حساب؟', "Don't have an account?")}</span>{' '}
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className="font-bold text-emerald-800 hover:underline cursor-pointer"
        >
          {tr(language, 'Créer un compte professionnel', 'إنشاء حساب جديد', 'Register Now')}
        </button>
      </div>
    </div>
  );
};
