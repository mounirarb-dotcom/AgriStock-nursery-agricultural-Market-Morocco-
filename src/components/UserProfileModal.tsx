import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Lock,
  LogOut,
  Edit3,
  Save,
  ShoppingCart,
  Sprout,
  Truck,
  Layers,
  Key,
  AlertTriangle,
  Globe,
  Bell,
  EyeOff,
  BookOpen,
  HelpCircle,
  Scale,
  FileText,
  ChevronRight,
  ChevronDown,
  Info,
  Tractor,
  Package,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MoroccanRegion, UserRole, AppLanguage } from '../types';
import { tr } from '../utils/translations';

const REGIONS: MoroccanRegion[] = [
  'Casablanca - Settat & Doukkala',
  'Souss-Massa (Agadir, Taroudant, Chtouka)',
  'L\'Oriental (Berkane, Oujda, Nador)',
  'Gharb - Chrarda (Kénitra, Sidi Slimane)',
  'Fès - Meknès (Saïss, El Hajeb, Sefrou)',
  'Marrakech - Safi (Haouz, El Kelaâ)',
  'Béni Mellal - Khénifra (Tadla)',
  'Drâa - Tafilalet (Zagora, Errachidia)',
  'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)',
];

export const UserProfileModal: React.FC = () => {
  const {
    language,
    setLanguage,
    isProfileModalOpen,
    setIsProfileModalOpen,
    userProfile,
    updateProfileData,
    setUserRole,
    setActiveTab,
    logoutAccount,
    setIsStockAuthModalOpen,
    setStockAuthModalMode,
    requestRoleActivation,
    setIsAdminLoginModalOpen,
    isAdminAuthenticated,
    openUserManual,
    setIsOfficialComplianceModalOpen,
    setIsBenchmarkModalOpen,
    openNotificationSettings,
    platformPaymentProtected,
    togglePlatformPaymentProtection,
    favoriteIds,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile.displayName || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [whatsapp, setWhatsapp] = useState(userProfile.whatsapp || '');
  const [companyName, setCompanyName] = useState(userProfile.companyName || '');
  const [region, setRegion] = useState<MoroccanRegion>(
    userProfile.region || 'Casablanca - Settat & Doukkala'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Demande d'activation de nouveau rôle
  const [requestingRole, setRequestingRole] = useState<UserRole | null>(null);
  const [roleIdentifierInput, setRoleIdentifierInput] = useState('');
  const [roleExtraInput, setRoleExtraInput] = useState('');
  const [roleIsSubmitting, setRoleIsSubmitting] = useState(false);
  const [roleRequestSuccess, setRoleRequestSuccess] = useState<string | null>(null);
  const [roleRequestError, setRoleRequestError] = useState<string | null>(null);

  if (!isProfileModalOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileData({
      displayName: displayName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      companyName: companyName.trim(),
      region,
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSwitchActiveRole = (targetRole: UserRole) => {
    setUserRole(targetRole);
    if (targetRole === 'seller') setActiveTab('seller_space');
    else if (targetRole === 'nursery') setActiveTab('nursery_space');
    else if (targetRole === 'carrier') setActiveTab('carrier_space');
    else if (targetRole === 'admin') setActiveTab('admin');
    else setActiveTab('buyer_space');
    setIsProfileModalOpen(false);
  };

  const roles = userProfile.roles && userProfile.roles.length > 0 ? userProfile.roles : [userProfile.role];
  const isPending = userProfile.verificationStatus === 'pending_verification';

  return (
    <div
      id="modal-profile-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsProfileModalOpen(false);
      }}
    >
      <div
        id="modal-profile-container"
        className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Profil */}
        <div className="px-5 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-base shadow-inner">
              {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">
                  {userProfile.displayName || 'Mon Profil'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {userProfile.role === 'seller' ? 'Vendeur ✓' : userProfile.role === 'nursery' ? 'Pépiniériste ✓' : userProfile.role === 'carrier' ? 'Transporteur ✓' : 'Acheteur ✓'}
                </span>
              </div>
              <span className="text-xs text-stone-400">
                {userProfile.companyName || userProfile.phone || userProfile.email || 'Utilisateur AGRISTOCK Maroc'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps du profil avec toutes les sections organisées */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{tr(language, 'Profil mis à jour avec succès !', 'تم حفظ التعديلات بنجاح !', 'Profile updated successfully!')}</span>
            </div>
          )}

          {/* SECTION 1 : MES ESPACES PROFESSIONNELS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Mes Espaces Professionnels</span>
              </h3>
              <span className="text-[10px] text-stone-500">Rôles activés</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => {
                const isActive = userProfile.role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSwitchActiveRole(r)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-xs'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center shrink-0">
                        {r === 'buyer' && <ShoppingCart className="w-4 h-4 text-emerald-400" />}
                        {r === 'seller' && <Tractor className="w-4 h-4 text-amber-400" />}
                        {r === 'nursery' && <Sprout className="w-4 h-4 text-emerald-300" />}
                        {r === 'carrier' && <Truck className="w-4 h-4 text-sky-400" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">
                          {r === 'buyer' && 'Acheteur'}
                          {r === 'seller' && 'Producteur'}
                          {r === 'nursery' && 'Pépiniériste'}
                          {r === 'carrier' && 'Transporteur'}
                        </span>
                        <span className="text-[10px] text-stone-400 block truncate">
                          {isActive ? '● Espace actuel' : 'Ouvrir l\'espace →'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2 : MON ACTIVITÉ */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Mon Activité</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {userProfile.role !== 'buyer' ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setActiveTab('seller_space');
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer"
                >
                  <span className="text-stone-400 text-[10px] block">Mes annonces</span>
                  <span className="font-bold text-white block mt-0.5">Mes Offres</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setActiveTab('market');
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer"
                >
                  <span className="text-emerald-400 text-[10px] block">Consulter</span>
                  <span className="font-bold text-white block mt-0.5">Offres Producteurs</span>
                </button>
              )}

              {userProfile.role !== 'buyer' ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    if (userProfile.role === 'nursery') setActiveTab('nursery_space');
                    else setActiveTab('seller_space');
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer"
                >
                  <span className="text-stone-400 text-[10px] block">Inventaire</span>
                  <span className="font-bold text-white block mt-0.5">Mes Stocks</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setActiveTab('buyer_space');
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer"
                >
                  <span className="text-emerald-400 text-[10px] block">Espace Acheteur</span>
                  <span className="font-bold text-white block mt-0.5">Mes Achats</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setActiveTab('orders');
                }}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer"
              >
                <span className="text-stone-400 text-[10px] block">Transactions</span>
                <span className="font-bold text-white block mt-0.5">Mes Commandes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setActiveTab('buyer_space');
                }}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer"
              >
                <span className="text-stone-400 text-[10px] block">Approvisionnement</span>
                <span className="font-bold text-white block mt-0.5">Offres Producteurs</span>
              </button>
            </div>
          </div>

          {/* SECTION 3 : SÉCURITÉ */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Sécurité</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800/80">
                <div>
                  <span className="font-bold text-white block">Protection des Stocks par Code PIN</span>
                  <span className="text-[10px] text-stone-400">
                    {userProfile.isPasswordProtected ? 'Code PIN actif (protégé)' : 'Aucun code configuré'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStockAuthModalMode('setup_security');
                    setIsStockAuthModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-400 text-xs font-semibold cursor-pointer"
                >
                  Configurer
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800/80">
                <div>
                  <span className="font-bold text-white block">Statut de Vérification du Compte</span>
                  <span className="text-[10px] text-stone-400">
                    {isPending ? 'Agrément en cours de revue' : 'Documents officiels validés ✅'}
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-400">
                  {userProfile.verificationStatus || 'Actif'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4 : PARAMÈTRES */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Paramètres</span>
            </h3>

            <div className="space-y-2 text-xs">
              {/* Langue */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800/80">
                <span className="font-bold text-white">Langue de l&apos;application</span>
                <div className="flex items-center gap-1">
                  {(['fr', 'ar', 'en'] as AppLanguage[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLanguage(l)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                        language === l
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      {l === 'fr' ? '🇫🇷 FR' : l === 'ar' ? '🇲🇦 AR' : '🇬🇧 EN'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800/80">
                <div>
                  <span className="font-bold text-white block">Notifications & Alertes</span>
                  <span className="text-[10px] text-stone-400">SMS, WhatsApp et rappels de cotations</span>
                </div>
                <button
                  type="button"
                  onClick={openNotificationSettings}
                  className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Régler
                </button>
              </div>

              {/* Coordonnées & Confidentialité */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800/80">
                <div>
                  <span className="font-bold text-white block">Confidentialité du Téléphone</span>
                  <span className="text-[10px] text-stone-400">
                    {platformPaymentProtected ? 'Coordonnées masquées (via séquestre)' : 'Coordonnées publiques en direct'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={togglePlatformPaymentProtection}
                  className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-400 text-xs font-semibold cursor-pointer"
                >
                  Basculer
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 5 : AIDE & CONFORMITÉ */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Aide & Conformité</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  openUserManual();
                }}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Manuel d&apos;Utilisation</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsOfficialComplianceModalOpen(true);
                }}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Statut CNDP & Légal</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsBenchmarkModalOpen(true);
                }}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Pourquoi Nous ? (FAQ)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              </button>

              <a
                href="mailto:support@agristock.ma"
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition cursor-pointer flex items-center justify-between text-stone-200"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Contact Support</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              </a>
            </div>
          </div>

          {/* SECTION 6 : À PROPOS */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">AgriStock Maroc</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Version 1.0.0
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-400">
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  openUserManual('cgu');
                }}
                className="hover:text-emerald-400 cursor-pointer"
              >
                Conditions Générales (CGU)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  openUserManual('confidentialite');
                }}
                className="hover:text-emerald-400 cursor-pointer"
              >
                Politique de Confidentialité
              </button>
            </div>
          </div>

          {/* SECTION 7 : ENTRÉE DISCRÈTE ADMINISTRATION 🔐 */}
          <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-400">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Console d&apos;Administration</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(false);
                if (isAdminAuthenticated) {
                  setActiveTab('admin');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 text-xs font-bold transition cursor-pointer"
            >
              {isAdminAuthenticated ? 'Ouvrir Console Admin ➔' : '🔐 Connexion Admin'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
          <button
            type="button"
            onClick={async () => {
              await logoutAccount();
              setIsProfileModalOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{tr(language, 'Se déconnecter', 'تسجيل الخروج', 'Log Out')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition cursor-pointer"
          >
            {tr(language, 'Fermer', 'إغلاق', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
