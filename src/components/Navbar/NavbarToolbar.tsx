import React from 'react';
import {
  Mic,
  Radio,
  Scan,
  Bell,
  MessageSquare,
  ShieldCheck,
  Truck,
  Award,
  BookOpen,
  FileText,
  FileSpreadsheet,
  FileJson,
  Smartphone,
  Lock,
  Unlock,
  ShieldAlert,
  ChevronDown,
  UserPlus,
  LogIn,
  EyeOff,
  Layers,
  Info,
} from 'lucide-react';
import { AppLanguage, UserProfile, EscrowTransaction } from '../../types';
import { tr } from '../../utils/translations';

interface NavbarToolbarProps {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  userProfile: UserProfile;
  unreadNotificationsCount: number;
  openNotificationSettings: () => void;
  openFieldQRScannerModal: () => void;
  openAudioSearchModal: () => void;
  setIsDiscussionsListModalOpen: (open: boolean) => void;
  totalUnreadDiscussionsCount: number;
  discussionsCount: number;
  toolsDropdownOpen: boolean;
  setToolsDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsRegistrationModalOpen: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  setActiveTab: (tab: any) => void;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  // B2B Tools props
  openLogisticsModal: () => void;
  setIsEscrowListModalOpen: (open: boolean) => void;
  escrowTransactions: EscrowTransaction[];
  openExportManifestModal: () => void;
  openExcelStockModal: () => void;
  openUserManual: () => void;
  setIsOfficialComplianceModalOpen: (open: boolean) => void;
  setIsProModalOpen: (open: boolean) => void;
  setShowSettingsModal: (open: boolean) => void;
  platformPaymentProtected: boolean;
  togglePlatformPaymentProtection: () => void;
  isSessionUnlocked: boolean;
  lockSession: () => void;
  setStockAuthModalMode: (mode: any) => void;
  setIsStockAuthModalOpen: (open: boolean) => void;
}

export const NavbarToolbar: React.FC<NavbarToolbarProps> = ({
  language,
  setLanguage,
  userProfile,
  unreadNotificationsCount,
  openNotificationSettings,
  openFieldQRScannerModal,
  openAudioSearchModal,
  setIsDiscussionsListModalOpen,
  totalUnreadDiscussionsCount,
  discussionsCount,
  toolsDropdownOpen,
  setToolsDropdownOpen,
  setIsProfileModalOpen,
  setIsLoginModalOpen,
  setIsRegistrationModalOpen,
  isAdminAuthenticated,
  setActiveTab,
  setIsAdminLoginModalOpen,
  openLogisticsModal,
  setIsEscrowListModalOpen,
  escrowTransactions,
  openExportManifestModal,
  openExcelStockModal,
  openUserManual,
  setIsOfficialComplianceModalOpen,
  setIsProModalOpen,
  setShowSettingsModal,
  platformPaymentProtected,
  togglePlatformPaymentProtection,
  isSessionUnlocked,
  lockSession,
  setStockAuthModalMode,
  setIsStockAuthModalOpen,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* 1. Choix de la Langue - Capsule Squircle Ergonomique */}
      <div
        id="language-selector-toolbar"
        className="flex items-center bg-[#081810] rounded-xl p-0.5 sm:p-1 border border-[#1b3d2c] text-xs font-semibold shadow-inner shrink-0"
        aria-label="Choix de la langue"
      >
        {(['fr', 'ar', 'en'] as AppLanguage[]).map(lang => (
          <button
            key={lang}
            id={`btn-lang-${lang}`}
            type="button"
            onClick={() => setLanguage(lang)}
            className={`min-w-[24px] sm:min-w-[28px] h-6.5 sm:h-7 px-1 sm:px-1.5 rounded-lg flex items-center justify-center uppercase tracking-wider text-[10px] font-black transition-all cursor-pointer ${
              language === lang
                ? 'bg-emerald-700 text-white shadow-xs scale-102 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#162f23]'
            }`}
          >
            {lang === 'ar' ? 'ع' : (lang || 'fr').toUpperCase()}
          </button>
        ))}
      </div>

      {/* 2. Boutons Directs Rapides (Desktop & Mobile) */}
      {/* Bouton Recherche Audio Vocale IA */}
      <button
        id="btn-navbar-audio-search"
        onClick={openAudioSearchModal}
        title={tr(language, 'Recherche audio & vocale intelligente (IA Gemini • Darija / FR)', 'البحث الصوتي الذكي (ذكاء اصطناعي • دارجة / فرنسية)', 'Smart voice & audio search (Gemini AI • Darija / FR)')}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 h-8 sm:h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/50 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 group"
      >
        <Mic className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
        <span className="hidden sm:inline text-[11px]">{tr(language, 'Voix IA', 'بحث صوتي', 'Voice AI')}</span>
      </button>

      {/* Bouton Scan QR Terrain */}
      <button
        id="btn-navbar-field-qr-scan"
        onClick={openFieldQRScannerModal}
        title={tr(language, 'Scanner un QR code de caisse ou vérifier un lot champ-au-marché', 'مسح رمز الاستجابة السريعة للتحقق من الشحنة', 'Scan field QR code or verify batch')}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 h-8 sm:h-9 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 border border-emerald-400/50 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
      >
        <Scan className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="hidden sm:inline text-[11px]">{tr(language, 'Scan QR', 'مسح QR', 'Scan QR')}</span>
      </button>

      {/* Bouton Discussions & Négociations */}
      <button
        id="btn-navbar-discussions"
        onClick={() => setIsDiscussionsListModalOpen(true)}
        title={tr(language, 'Espace de discussion et négociations de prix par offre', 'المحادثات والتفاوض المباشر حول الأسعار', 'Discussions & Price Negotiations')}
        className="hidden md:flex relative items-center gap-1.5 px-2.5 h-8 sm:h-9 rounded-xl bg-[#162f23] hover:bg-[#1d3d2e] text-emerald-200 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden lg:inline text-[11px]">{tr(language, 'Discussions', 'المحادثات', 'Chats')}</span>
        {totalUnreadDiscussionsCount > 0 ? (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white leading-tight animate-bounce">
            {totalUnreadDiscussionsCount}
          </span>
        ) : discussionsCount > 0 ? (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-800 text-emerald-100 leading-tight">
            {discussionsCount}
          </span>
        ) : null}
      </button>

      {/* Bouton Centre d'Alertes B2B */}
      <button
        id="btn-navbar-notifications"
        onClick={openNotificationSettings}
        title={tr(language, "Centre d'Alertes", 'مركز التنبيهات', 'Alerts Center')}
        className="relative flex items-center justify-center w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#162f23] hover:bg-[#1d3d2e] text-emerald-200 border border-emerald-500/30 transition cursor-pointer"
        aria-label="Centre d'Alertes"
      >
        <Bell className="w-4 h-4 text-emerald-400" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-4 px-1 rounded-full text-[9px] font-black bg-rose-600 text-white flex items-center justify-center leading-none animate-pulse">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* 3. MENU DÉROULANT B2B (Regroupe les 10+ actions secondaires pour épurer la barre) */}
      <div className="relative hidden lg:block">
        <button
          id="btn-navbar-b2b-tools"
          type="button"
          onClick={() => setToolsDropdownOpen(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 h-8 sm:h-9 rounded-xl text-xs font-bold border transition cursor-pointer ${
            toolsDropdownOpen
              ? 'bg-emerald-800 text-white border-emerald-400 shadow-xs'
              : 'bg-[#0f271c] hover:bg-[#163827] text-emerald-200 border-emerald-500/30'
          }`}
          title={tr(language, 'Outils B2B, Services & Paramètres', 'أدوات B2B والخدمات', 'B2B Tools & Services')}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px]">{tr(language, 'Outils B2B', 'أدوات B2B', 'B2B Tools')}</span>
          <ChevronDown className={`w-3 h-3 text-emerald-300 transition-transform duration-150 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu Outils B2B */}
        {toolsDropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-80 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-stone-100 space-y-1"
            onClick={() => setToolsDropdownOpen(false)}
          >
            <div className="px-3 py-1.5 border-b border-stone-800 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-400">
              <span>{tr(language, 'Services & Outils Plateforme', 'خدمات وأدوات المنصة', 'Platform Services & Tools')}</span>
            </div>

            <div className="grid grid-cols-2 gap-1 pt-1">
              {/* Séquestre B2B */}
              <button
                type="button"
                onClick={() => setIsEscrowListModalOpen(true)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-stone-800 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-300 block truncate">Séquestre</span>
                  <span className="text-[9px] text-stone-400 block truncate">{escrowTransactions.length} tx</span>
                </div>
              </button>

              {/* Fret Agricole */}
              <button
                type="button"
                onClick={() => openLogisticsModal()}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-stone-800 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/30">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-blue-300 block truncate">Fret Frigo</span>
                  <span className="text-[9px] text-stone-400 block truncate">Logistique</span>
                </div>
              </button>

              {/* Manifestes Export */}
              <button
                type="button"
                onClick={() => openExportManifestModal()}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-stone-800 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/30">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Manifestes</span>
                  <span className="text-[9px] text-stone-400 block truncate">PDF A4 Douane</span>
                </div>
              </button>

              {/* Manuel d'utilisation */}
              <button
                type="button"
                onClick={() => openUserManual()}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-stone-800 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/30">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Manuel</span>
                  <span className="text-[9px] text-stone-400 block truncate">Guide PDF</span>
                </div>
              </button>

              {/* Passer PRO */}
              <button
                type="button"
                onClick={() => setIsProModalOpen(true)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-stone-800 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-950 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/30">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-amber-300 block truncate">Passer PRO</span>
                  <span className="text-[9px] text-stone-400 block truncate">Badge certifié</span>
                </div>
              </button>

              {/* Conformité CNDP */}
              <button
                type="button"
                onClick={() => setIsOfficialComplianceModalOpen(true)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-stone-800 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Légal & CNDP</span>
                  <span className="text-[9px] text-stone-400 block truncate">Maroc 🇲🇦</span>
                </div>
              </button>

              {/* À propos d'AgriStock Maroc */}
              <button
                type="button"
                onClick={() => setActiveTab('playstore')}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-stone-800 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/30">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">À propos</span>
                  <span className="text-[9px] text-emerald-400 block truncate">AgriStock & App</span>
                </div>
              </button>
            </div>

            {/* Rangée inférieure : Sécurité des stocks */}
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-1 text-[11px]">
              {/* Protection paiement / coordonnées toggle */}
              <button
                type="button"
                onClick={togglePlatformPaymentProtection}
                className="flex-1 flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                title="Masquer ou afficher coordonnées"
              >
                <EyeOff className="w-3 h-3 text-emerald-400" />
                <span>{platformPaymentProtected ? 'Coordonnées Off' : 'Direct On'}</span>
              </button>

              {/* PIN Sécurité Stock */}
              {userProfile.isPasswordProtected ? (
                isSessionUnlocked ? (
                  <button
                    type="button"
                    onClick={lockSession}
                    className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    title="Verrouiller session"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>Protégé</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setStockAuthModalMode('verify_password');
                      setIsStockAuthModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse font-bold"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Déverrouiller</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setStockAuthModalMode('setup_security');
                    setIsStockAuthModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span>Activer PIN</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Profil Utilisateur / Connexion / Inscription (Desktop) */}
      {userProfile.email || userProfile.hasCompletedIdentification ? (
        <button
          id="btn-navbar-profile-trigger"
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="hidden lg:flex items-center gap-2 px-2.5 h-8 sm:h-9 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/80 text-xs font-semibold transition cursor-pointer"
          title={tr(language, 'Mon Profil & Rôles', 'ملفي وأدواري', 'My Profile & Roles')}
        >
          <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
            {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="max-w-[85px] truncate text-[11px] font-bold">
            {userProfile.displayName || 'Mon Profil'}
          </span>
          {userProfile.verificationStatus === 'pending_verification' ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Profil à vérifier" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Compte Actif" />
          )}
        </button>
      ) : (
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            id="btn-navbar-register-trigger"
            type="button"
            onClick={() => setIsRegistrationModalOpen(true)}
            className="flex items-center gap-1 px-2.5 h-8 sm:h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{tr(language, 'Inscription', 'تسجيل', 'Sign Up')}</span>
          </button>
          <button
            id="btn-navbar-login-trigger"
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1 px-2 h-8 sm:h-9 rounded-xl hover:bg-stone-800 text-stone-300 hover:text-white text-[11px] font-semibold transition cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-stone-400" />
            <span>{tr(language, 'Connexion', 'دخول', 'Log In')}</span>
          </button>
        </div>
      )}

      {/* 5. Console Super Admin (Desktop) */}
      {isAdminAuthenticated ? (
        <button
          id="btn-navbar-admin-active"
          type="button"
          onClick={() => setActiveTab('admin')}
          className="hidden lg:flex items-center gap-1.5 px-3 h-8 sm:h-9 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/60 text-xs font-bold transition shadow-xs cursor-pointer"
          title={tr(language, 'Accéder à la Console Administrateur', 'الدخول إلى لوحة تحكم الإدارة', 'Access Admin Dashboard')}
        >
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <span className="text-xs">{tr(language, 'Admin', 'الإدارة', 'Admin')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      ) : null}
    </div>
  );
};
