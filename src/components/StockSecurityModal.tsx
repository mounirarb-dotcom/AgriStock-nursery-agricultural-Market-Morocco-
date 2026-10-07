import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Key,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
  Send,
  HelpCircle,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { UserSecurityMethod } from '../types';
import { globalClientRateLimiter, sanitizeText, validateEmail } from '../utils/securityUtils';

export const StockSecurityModal: React.FC = () => {
  const {
    userProfile,
    isStockAuthModalOpen,
    setIsStockAuthModalOpen,
    stockAuthModalMode,
    setStockAuthModalMode,
    pendingStockActionDescription,
    unlockSession,
    setAccountSecurity,
    sendSecurityOTP,
    executePendingStockAction,
    cancelPendingStockAction,
    latestSecurityNotification,
  } = useAppContext();

  // Verification state
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emergencyNotice, setEmergencyNotice] = useState<string | null>(null);

  // Setup state
  const [selectedMethod, setSelectedMethod] = useState<UserSecurityMethod>('custom_password');
  const [customPassword, setCustomPassword] = useState('');
  const [customPasswordConfirm, setCustomPasswordConfirm] = useState('');
  const [phoneForSMS, setPhoneForSMS] = useState(userProfile.phone || '0661234567');
  const [emailForCode, setEmailForCode] = useState(userProfile.email || 'agriculteur@maroc.ma');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupSuccess, setSetupSuccess] = useState(false);

  if (!isStockAuthModalOpen) return null;

  // Handle unlocking for pending action (OWASP Brute-force Protection)
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const rate = globalClientRateLimiter.check('stockAuth:verify', 5, 60000);
    if (!rate.allowed) {
      setAuthError(`Trop de tentatives infructueuses. Veuillez attendre ${Math.ceil(rate.retryAfterMs / 1000)} secondes.`);
      return;
    }

    if (!inputPassword.trim()) {
      setAuthError('Veuillez saisir votre mot de passe ou code de sécurité.');
      return;
    }

    const cleanInput = sanitizeText(inputPassword.trim(), 100);
    const result = unlockSession(cleanInput);
    if (result.success) {
      setInputPassword('');
      setIsStockAuthModalOpen(false);
      executePendingStockAction();
    } else {
      setAuthError(result.error || 'Mot de passe ou code incorrect. Réessayez.');
    }
  };

  // Handle emergency OTP dispatch
  const handleSendEmergencyCode = (channel: 'sms' | 'email') => {
    const rate = globalClientRateLimiter.check('stockAuth:sendOTP', 3, 60000);
    if (!rate.allowed) {
      setAuthError(`Envoi de code limité. Réessayez dans ${Math.ceil(rate.retryAfterMs / 1000)} secondes.`);
      return;
    }

    const target = channel === 'sms'
      ? (userProfile.recoveryPhone || userProfile.phone || '0661234567')
      : (userProfile.recoveryEmail || userProfile.email || 'agriculteur@maroc.ma');

    const chanUpper = (channel ? String(channel) : 'sms').toUpperCase();
    const res = sendSecurityOTP(channel, target);
    setAuthError(null);
    setInputPassword(res.code);
    setEmergencyNotice(`Code généré avec succès (${chanUpper}) : ${res.code} — renseigné automatiquement dans le champ mot de passe.`);
  };

  // Handle setup save
  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    if (emailForCode && !validateEmail(emailForCode)) {
      setSetupError('Adresse email de secours invalide.');
      return;
    }

    if (selectedMethod === 'custom_password') {
      if (!customPassword || customPassword.length < 4) {
        setSetupError('Le mot de passe doit comporter au moins 4 caractères ou chiffres.');
        return;
      }
      if (customPassword !== customPasswordConfirm) {
        setSetupError('Les deux mots de passe ne correspondent pas.');
        return;
      }

      setAccountSecurity({
        password: customPassword,
        method: 'custom_password',
        recoveryPhone: sanitizeText(phoneForSMS, 20),
        recoveryEmail: sanitizeText(emailForCode, 100),
      });

      setSetupSuccess(true);
      setTimeout(() => {
        setIsStockAuthModalOpen(false);
        executePendingStockAction();
      }, 1000);
    } else {
      // SMS or Email OTP verification
      if (!otpSent) {
        const target = selectedMethod === 'sms_code' ? phoneForSMS : emailForCode;
        if (!target) {
          setSetupError(selectedMethod === 'sms_code' ? 'Numéro de téléphone requis' : 'Email requis');
          return;
        }
        const res = sendSecurityOTP(selectedMethod === 'sms_code' ? 'sms' : 'email', target);
        setOtpSent(true);
        // Pre-fill or notify
        return;
      }

      // Verify OTP entered
      if (!otpInput || otpInput.trim().length < 4) {
        setSetupError('Veuillez entrer le code à 6 chiffres reçu.');
        return;
      }

      // Check OTP against latest notification
      if (latestSecurityNotification && otpInput.trim() === latestSecurityNotification.code) {
        setAccountSecurity({
          password: otpInput.trim(),
          method: selectedMethod,
          recoveryPhone: phoneForSMS,
          recoveryEmail: emailForCode,
        });
        setSetupSuccess(true);
        setTimeout(() => {
          setIsStockAuthModalOpen(false);
          executePendingStockAction();
        }, 1000);
      } else {
        setSetupError('Code de sécurité incorrect. Vérifiez le code reçu.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 to-emerald-950 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                {stockAuthModalMode === 'verify_password'
                  ? 'Protection des Stocks'
                  : 'Sécuriser mes Stocks & Mon Compte'}
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                {stockAuthModalMode === 'verify_password'
                  ? 'Autorisation requise pour modifier les stocks'
                  : 'Évitez les modifications non autorisées'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              cancelPendingStockAction();
              setIsStockAuthModalOpen(false);
            }}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action description banner */}
        {pendingStockActionDescription && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Opération : <strong>{pendingStockActionDescription}</strong></span>
          </div>
        )}

        {/* MODE 1: VERIFY PASSWORD (ALREADY CONFIGURED) */}
        {stockAuthModalMode === 'verify_password' && (
          <form onSubmit={handleVerify} className="p-5 space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              Pour protéger l'intégrité de vos stocks contre toute modification par des tiers, veuillez confirmer votre mot de passe ou code secret.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800">
                Mot de Passe ou Code PIN Secret :
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inputPassword}
                  onChange={e => {
                    setInputPassword(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Saisissez votre mot de passe..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 pr-10 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {emergencyNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{emergencyNotice}</span>
              </div>
            )}

            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* Quick action buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setStockAuthModalMode('setup_security')}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                Changer de code / mode
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Déverrouiller & Appliquer</span>
              </button>
            </div>

            {/* Emergency OTP Code buttons */}
            <div className="mt-4 pt-3 border-t border-stone-200 space-y-2">
              <div className="text-[11px] text-stone-500 font-semibold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                <span>Mot de passe oublié ? Recevoir un code de secours :</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSendEmergencyCode('sms')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-300 transition"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Code par SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendEmergencyCode('email')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-300 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Code par Email</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* MODE 2: SETUP SECURITY (USER CHOOSES PASSWORD, SMS, OR EMAIL) */}
        {stockAuthModalMode === 'setup_security' && (
          <form onSubmit={handleSetupSubmit} className="p-5 space-y-4">
            {setupSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-stone-900 text-base">Protection Activée avec Succès !</h4>
                <p className="text-xs text-stone-500">
                  Vos stocks sont maintenant sécurisés. Redirection en cours...
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Actuellement, n'importe qui peut modifier vos quantités en stock. Choisissez comment sécuriser vos données :
                </p>

                {/* 3 Choice Cards */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Choice 1: Custom password */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod('custom_password');
                      setOtpSent(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                      selectedMethod === 'custom_password'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/30'
                        : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Key className="w-4 h-4 text-emerald-700 mb-1" />
                    <span className="text-[11px] font-bold leading-tight">Mot de Passe Choisi</span>
                  </button>

                  {/* Choice 2: SMS Code */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod('sms_code');
                      setOtpSent(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                      selectedMethod === 'sms_code'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/30'
                        : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-700 mb-1" />
                    <span className="text-[11px] font-bold leading-tight">Code par SMS</span>
                  </button>

                  {/* Choice 3: Email Code */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod('email_code');
                      setOtpSent(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                      selectedMethod === 'email_code'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/30'
                        : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-emerald-700 mb-1" />
                    <span className="text-[11px] font-bold leading-tight">Code par Email</span>
                  </button>
                </div>

                {/* Sub-form based on choice */}
                {selectedMethod === 'custom_password' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        Définir un Mot de Passe / Code PIN Personnel :
                      </label>
                      <input
                        type="password"
                        value={customPassword}
                        onChange={e => setCustomPassword(e.target.value)}
                        placeholder="Ex: AgriStock2025 ou 8492"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        Confirmer le Mot de Passe :
                      </label>
                      <input
                        type="password"
                        value={customPasswordConfirm}
                        onChange={e => setCustomPasswordConfirm(e.target.value)}
                        placeholder="Répétez votre mot de passe..."
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs font-medium"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'sms_code' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        Numéro de Téléphone Portable (Maroc) :
                      </label>
                      <input
                        type="tel"
                        value={phoneForSMS}
                        onChange={e => setPhoneForSMS(e.target.value)}
                        placeholder="0661234567"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs font-medium"
                      />
                    </div>

                    {otpSent && (
                      <div>
                        <label className="block text-xs font-bold text-emerald-800 mb-1">
                          Code de Sécurité Reçu par SMS (6 chiffres) :
                        </label>
                        <input
                          type="text"
                          value={otpInput}
                          onChange={e => setOtpInput(e.target.value)}
                          placeholder="Ex: 849201"
                          maxLength={6}
                          autoFocus
                          className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 bg-emerald-50/50 text-stone-900 text-sm font-bold tracking-widest text-center"
                        />
                      </div>
                    )}
                  </div>
                )}

                {selectedMethod === 'email_code' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        Adresse Email pour la Réception du Code :
                      </label>
                      <input
                        type="email"
                        value={emailForCode}
                        onChange={e => setEmailForCode(e.target.value)}
                        placeholder="producteur@domaine.ma"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs font-medium"
                      />
                    </div>

                    {otpSent && (
                      <div>
                        <label className="block text-xs font-bold text-emerald-800 mb-1">
                          Code de Sécurité Reçu par Email (6 chiffres) :
                        </label>
                        <input
                          type="text"
                          value={otpInput}
                          onChange={e => setOtpInput(e.target.value)}
                          placeholder="Ex: 631405"
                          maxLength={6}
                          autoFocus
                          className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 bg-emerald-50/50 text-stone-900 text-sm font-bold tracking-widest text-center"
                        />
                      </div>
                    )}
                  </div>
                )}

                {setupError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{setupError}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStockAuthModalOpen(false);
                      executePendingStockAction();
                    }}
                    className="text-xs text-stone-500 hover:text-stone-700 hover:underline"
                  >
                    Passer cette fois sans mot de passe
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                  >
                    {selectedMethod !== 'custom_password' && !otpSent ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Envoyer le Code</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Activer la Protection</span>
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
  );
};
