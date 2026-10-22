import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { MoroccanRegion, UserRole } from '../../../types';
import { MOROCCAN_REGIONS } from '../../../data/mockData';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  LogOut,
  FileCheck,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    language,
    userProfile,
    updateProfileData,
    logoutAccount,
    setUserRole,
    setActiveTab,
  } = useApp();

  const [displayName, setDisplayName] = useState(userProfile.displayName || '');
  const [companyName, setCompanyName] = useState(userProfile.companyName || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [whatsapp, setWhatsapp] = useState(userProfile.whatsapp || '');
  const [region, setRegion] = useState<MoroccanRegion>(userProfile.region || 'Souss-Massa (Agadir, Taroudant, Chtouka)');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updateProfileData({
      displayName: displayName.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      region,
    });
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const currentRoles = userProfile.roles && userProfile.roles.length > 0 ? userProfile.roles : [userProfile.role];

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-sm">
            {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900">{displayName || 'Utilisateur'}</h1>
            <p className="text-xs text-stone-500">{companyName || 'Compte Professionnel AgriStock'}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {currentRoles.map((r) => (
                <span
                  key={r}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    r === userProfile.role
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {r.toUpperCase()} {r === userProfile.role ? '(Actif)' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logoutAccount}
          className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{tr(language, 'Déconnexion', 'خروج', 'Log Out')}</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{tr(language, 'Profil mis à jour avec succès.', 'تم تحديث الملف الشخصي بنجاح.', 'Profile updated successfully.')}</span>
        </div>
      )}

      {/* Formulaire d’édition */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-bold text-sm text-stone-900 mb-2">
          {tr(language, 'Coordonnées & Informations Commerciales', 'المعلومات الشخصية والمهنية', 'Contact & Business Details')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Nom Complet</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Raison Sociale / Domaine</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Téléphone Principal</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp Professionnel</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Région Principale d’Activité</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as MoroccanRegion)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
          >
            {MOROCCAN_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isLoading ? 'Enregistrement...' : tr(language, 'Enregistrer mon profil', 'حفظ التعديلات', 'Save Profile')}
          </button>
        </div>
      </form>
    </div>
  );
};
